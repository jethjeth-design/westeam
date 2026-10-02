<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Payment;
use App\Notifications\PaymentRejectedNotification;
use App\Notifications\PaymentVerifiedNotification;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    /**
     * Display a listing of payments for this supplier.
     */
    public function index(Request $request): Response
    {
        $supplier = $request->user();

        $status = $request->input('status', 'all');
        $paymentType = $request->input('payment_type', 'all');
        $dateFilter = $request->input('date_filter', 'all');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $search = $request->input('search');

        // Query base: only payments belonging to this authenticated supplier
        $query = Payment::with([
            'booking.customer',
            'bookingItem',
            'customer',
            'verifier',
        ])
            ->where('supplier_id', $supplier->id);

        // Status Filter
        if ($status !== 'all' && in_array($status, ['pending', 'verified', 'rejected'])) {
            $query->where('status', $status);
        }

        // Payment Type Filter
        if ($paymentType !== 'all' && in_array($paymentType, ['downpayment', 'balance', 'full_payment'])) {
            $query->where('payment_type', $paymentType);
        }

        // Date Filters
        if ($dateFilter === 'today') {
            $query->whereDate('created_at', Carbon::today());
        } elseif ($dateFilter === 'this_week') {
            $query->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
        } elseif ($dateFilter === 'this_month') {
            $query->whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year);
        } elseif ($dateFilter === 'this_year') {
            $query->whereYear('created_at', Carbon::now()->year);
        } elseif ($dateFilter === 'custom' && $fromDate && $toDate) {
            $query->whereBetween('created_at', [
                Carbon::parse($fromDate)->startOfDay(),
                Carbon::parse($toDate)->endOfDay(),
            ]);
        }

        // Search Filter
        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($cq) use ($search) {
                        $cq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('booking', function ($bq) use ($search) {
                        $bq->where('booking_reference', 'like', "%{$search}%")
                            ->orWhere('event_name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('bookingItem', function ($iq) use ($search) {
                        $iq->where('item_name', 'like', "%{$search}%");
                    });
            });
        }

        $payments = $query->latest()->paginate(15)->withQueryString();

        // ── Calculate Supplier Revenue Metrics strictly using Database Queries ──
        $verifiedPaymentsQuery = Payment::where('supplier_id', $supplier->id)->where('status', 'verified');
        $totalRevenue = (float) $verifiedPaymentsQuery->sum('amount');
        $completedPaymentsCount = (int) $verifiedPaymentsQuery->count();

        $thisMonthRevenue = (float) Payment::where('supplier_id', $supplier->id)
            ->where('status', 'verified')
            ->whereMonth('verified_at', Carbon::now()->month)
            ->whereYear('verified_at', Carbon::now()->year)
            ->sum('amount');

        $thisWeekRevenue = (float) Payment::where('supplier_id', $supplier->id)
            ->where('status', 'verified')
            ->whereBetween('verified_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->sum('amount');

        $pendingPaymentsCount = (int) Payment::where('supplier_id', $supplier->id)
            ->where('status', 'pending')
            ->count();

        $pendingPaymentAmount = (float) Payment::where('supplier_id', $supplier->id)
            ->where('status', 'pending')
            ->sum('amount');

        // Total Expected Amount for this supplier (from active/accepted bookings)
        $totalItemBooked = (float) BookingItem::where('supplier_id', $supplier->id)
            ->whereHas('booking', function ($q) {
                $q->whereNotIn('overall_status', ['rejected', 'cancelled']);
            })
            ->sum('unit_price');

        // If coordinator of team packages, also include team package bookings
        $totalTeamBooked = (float) Booking::where('booking_type', 'team_package')
            ->whereHas('team', function ($q) use ($supplier) {
                $q->where('coordinator_id', $supplier->id);
            })
            ->whereNotIn('overall_status', ['rejected', 'cancelled'])
            ->sum('total_amount');

        $expectedTotal = max($totalItemBooked, $totalTeamBooked);
        $remainingBalance = max(0.0, round($expectedTotal - $totalRevenue, 2));

        return Inertia::render('Supplier/Payments', [
            'payments' => $payments,
            'filters' => [
                'status' => $status,
                'payment_type' => $paymentType,
                'date_filter' => $dateFilter,
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'search' => $search,
            ],
            'metrics' => [
                'totalRevenue' => $totalRevenue,
                'thisMonthRevenue' => $thisMonthRevenue,
                'thisWeekRevenue' => $thisWeekRevenue,
                'pendingPayments' => $pendingPaymentsCount,
                'pendingPaymentAmount' => $pendingPaymentAmount,
                'completedPayments' => $completedPaymentsCount,
                'remainingBalance' => $remainingBalance,
            ],
        ]);
    }

    /**
     * Verify a customer payment.
     */
    public function verify(Request $request, Payment $payment): RedirectResponse
    {
        $supplier = $request->user();

        // Security authorization: Ensure payment belongs to authenticated supplier
        if ($payment->supplier_id !== $supplier->id) {
            abort(403, 'Unauthorized payment verification attempt.');
        }

        if ($payment->status === 'verified') {
            return back()->with('error', 'This payment is already verified.');
        }

        $payment->update([
            'status' => 'verified',
            'verified_at' => now(),
            'verified_by' => $supplier->id,
            'rejection_reason' => null,
        ]);

        if ($payment->bookingItem) {
            $payment->bookingItem->update(['status' => 'confirmed']);
        }

        $booking = $payment->booking;
        if ($booking) {
            if ($booking->booking_type === 'team_package') {
                $booking->update(['overall_status' => 'confirmed']);
                $booking->items()->update(['status' => 'confirmed']);
            } else {
                $booking->recalculateStatus();
                if (in_array($booking->overall_status, ['accepted', 'pending'])) {
                    $booking->update(['overall_status' => 'confirmed']);
                }
            }
        }

        // Send email notification to customer
        try {
            $payment->customer->notify(new PaymentVerifiedNotification($payment));
        } catch (\Throwable $e) {
            logger()->error('Payment verification mail notification failed: '.$e->getMessage());
        }

        if ($booking && $booking->overall_status === 'confirmed') {
            NotificationService::notifyCustomerBookingConfirmed($booking);
            NotificationService::notifyAdminBookingActivity(
                $booking,
                "Booking {$booking->booking_reference} confirmed with verified payment of ₱".number_format($payment->amount, 2)
            );
        }

        return back()->with('success', 'Payment of ₱'.number_format($payment->amount, 2).' has been verified successfully! Booking status is now Confirmed.');
    }

    /**
     * Reject a customer payment with reason.
     */
    public function reject(Request $request, Payment $payment): RedirectResponse
    {
        $supplier = $request->user();

        // Security authorization: Ensure payment belongs to authenticated supplier
        if ($payment->supplier_id !== $supplier->id) {
            abort(403, 'Unauthorized payment rejection attempt.');
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $payment->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'verified_at' => null,
            'verified_by' => null,
        ]);

        // Send email notification to customer
        try {
            $payment->customer->notify(new PaymentRejectedNotification($payment));
        } catch (\Throwable $e) {
            logger()->error('Payment rejection mail notification failed: '.$e->getMessage());
        }

        return back()->with('success', 'Payment has been rejected.');
    }
}
