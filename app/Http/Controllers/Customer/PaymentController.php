<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\SupplierPaymentSetting;
use App\Notifications\PaymentSubmittedNotification;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    /**
     * Display customer's payment history.
     */
    public function index(Request $request): Response
    {
        $customer = $request->user();

        $payments = Payment::with([
            'booking',
            'bookingItem',
            'supplier.supplierProfile',
        ])
            ->where('customer_id', $customer->id)
            ->latest()
            ->paginate(15);

        $totalPaid = (float) Payment::where('customer_id', $customer->id)
            ->where('status', 'verified')
            ->sum('amount');

        $pendingCount = Payment::where('customer_id', $customer->id)
            ->where('status', 'pending')
            ->count();

        $rejectedCount = Payment::where('customer_id', $customer->id)
            ->where('status', 'rejected')
            ->count();

        return Inertia::render('Customer/Payments', [
            'payments' => $payments,
            'metrics' => [
                'totalPaid' => $totalPaid,
                'pendingCount' => $pendingCount,
                'rejectedCount' => $rejectedCount,
            ],
        ]);
    }

    /**
     * Show the payment submission page for a specific booking/item.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        $customer = $request->user();
        $bookingId = $request->input('booking_id');
        $bookingItemId = $request->input('booking_item_id');

        if (! $bookingId) {
            return redirect()->route('customer.bookings.index')
                ->with('error', 'Please select a booking to submit a payment for.');
        }

        $booking = Booking::with([
            'items.supplier.supplierProfile',
            'team.coordinator.supplierProfile',
        ])
            ->where('id', $bookingId)
            ->where('customer_id', $customer->id)
            ->firstOrFail();

        // Determine specific item and supplier
        $selectedItem = null;
        $supplier = null;
        $payableAmount = (float) $booking->total_amount;

        if ($bookingItemId) {
            $selectedItem = $booking->items->firstWhere('id', (int) $bookingItemId);
            if ($selectedItem) {
                $supplier = $selectedItem->supplier;
                $payableAmount = (float) $selectedItem->unit_price;
            }
        }

        // If not a single item or no specific item selected:
        if (! $supplier) {
            if ($booking->booking_type === 'team_package' && $booking->team) {
                $supplier = $booking->team->coordinator;
            } else {
                $firstItem = $booking->items->first();
                $supplier = $firstItem?->supplier;
                if ($booking->items->count() === 1 && $firstItem) {
                    $selectedItem = $firstItem;
                    $payableAmount = (float) $firstItem->unit_price;
                }
            }
        }

        if (! $supplier) {
            return redirect()->route('customer.bookings.show', $booking->id)
                ->with('error', 'Supplier information could not be determined for this payment.');
        }

        // Fetch supplier payment settings (active GCash)
        $paymentSetting = SupplierPaymentSetting::where('supplier_id', $supplier->id)->first();

        // Calculate verified amount already paid for this specific item or booking/supplier
        $paidQuery = Payment::where('booking_id', $booking->id)
            ->where('supplier_id', $supplier->id)
            ->where('status', 'verified');

        if ($selectedItem) {
            $paidQuery->where('booking_item_id', $selectedItem->id);
        }

        $amountPaid = (float) $paidQuery->sum('amount');
        $remainingBalance = max(0.0, round($payableAmount - $amountPaid, 2));

        $downpaymentPct = $paymentSetting?->downpayment_percentage ?? 20;
        $requiredDownpayment = round($payableAmount * ($downpaymentPct / 100), 2);

        // Recent payments submitted for this item/booking
        $existingPayments = Payment::where('booking_id', $booking->id)
            ->where('supplier_id', $supplier->id)
            ->when($selectedItem, fn ($q) => $q->where('booking_item_id', $selectedItem->id))
            ->latest()
            ->get();

        return Inertia::render('Customer/PaymentShow', [
            'booking' => $booking,
            'selectedItem' => $selectedItem,
            'supplier' => [
                'id' => $supplier->id,
                'name' => $supplier->name,
                'business_name' => $supplier->supplierProfile?->business_name ?? $supplier->name,
            ],
            'paymentSetting' => $paymentSetting,
            'calculation' => [
                'totalBookingAmount' => $payableAmount,
                'requiredDownpayment' => $requiredDownpayment,
                'downpaymentPercentage' => $downpaymentPct,
                'amountPaid' => $amountPaid,
                'remainingBalance' => $remainingBalance,
                'isFullyPaid' => $remainingBalance <= 0,
            ],
            'existingPayments' => $existingPayments,
        ]);
    }

    /**
     * Store submitted payment with receipt and reference number.
     */
    public function store(Request $request): RedirectResponse
    {
        $customer = $request->user();

        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'booking_item_id' => 'nullable|exists:booking_items,id',
            'supplier_id' => 'required|exists:users,id',
            'payment_type' => 'required|in:downpayment,balance,full_payment',
            'amount' => 'required|numeric|min:1',
            'reference_number' => 'required|string|max:100',
            'receipt' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
            'customer_notes' => 'nullable|string|max:500',
        ]);

        $booking = Booking::where('id', $validated['booking_id'])
            ->where('customer_id', $customer->id)
            ->firstOrFail();

        // Upload receipt to public storage
        $receiptPath = $request->file('receipt')->store('payment-receipts', 'public');

        $payment = Payment::create([
            'booking_id' => $booking->id,
            'booking_item_id' => $validated['booking_item_id'] ?? null,
            'supplier_id' => $validated['supplier_id'],
            'customer_id' => $customer->id,
            'payment_method' => 'gcash',
            'payment_type' => $validated['payment_type'],
            'amount' => $validated['amount'],
            'reference_number' => trim($validated['reference_number']),
            'receipt_path' => $receiptPath,
            'status' => 'pending',
            'customer_notes' => $validated['customer_notes'] ?? null,
        ]);

        // Send Email & Database Notifications
        try {
            // To customer
            $customer->notify(new PaymentSubmittedNotification($payment, 'customer'));
            // To supplier
            $payment->supplier->notify(new PaymentSubmittedNotification($payment, 'supplier'));

            // Check if this was a resubmission after rejection
            $hadPriorRejected = Payment::where('booking_id', $booking->id)
                ->where('supplier_id', $validated['supplier_id'])
                ->where('id', '!=', $payment->id)
                ->where('status', 'rejected')
                ->exists();

            if ($hadPriorRejected) {
                NotificationService::notifySupplierPaymentResubmitted($payment);
            }
        } catch (\Throwable $e) {
            logger()->error('Payment submission notification mail error: '.$e->getMessage());
        }

        $redirectUrl = $request->header('referer');
        if ($redirectUrl && str_contains($redirectUrl, '/customer/bookings')) {
            return back()->with('success', 'Your GCash payment proof has been submitted successfully! Status is currently Pending Verification.');
        }

        return redirect()->route('customer.bookings.show', $booking->id)
            ->with('success', 'Your GCash payment proof has been submitted successfully! Status is currently Pending Verification.');
    }
}
