<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Package;
use App\Models\Payment;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        // Get supplier profile
        $supplierProfile = $user->supplierProfile()
            ->with('categories')
            ->first();

        // Services Count
        $totalServices = Service::where('supplier_id', $user->id)->count();
        $activeServices = Service::where('supplier_id', $user->id)->where('is_active', true)->count();

        // Packages Count
        $totalPackages = Package::where('supplier_id', $user->id)->count();

        // Bookings
        $totalBookings = BookingItem::where('supplier_id', $user->id)->count();
        $pendingBookings = BookingItem::where('supplier_id', $user->id)->where('status', 'pending')->count();
        $confirmedBookings = BookingItem::where('supplier_id', $user->id)->whereIn('status', ['accepted', 'confirmed'])->count();

        // ── Strictly Verified Supplier Revenue Calculations ──
        $verifiedPaymentsQuery = Payment::where('supplier_id', $user->id)->where('status', 'verified');
        $totalRevenue = (float) $verifiedPaymentsQuery->sum('amount');
        $completedPayments = (int) $verifiedPaymentsQuery->count();

        $thisMonthRevenue = (float) Payment::where('supplier_id', $user->id)
            ->where('status', 'verified')
            ->whereMonth('verified_at', Carbon::now()->month)
            ->whereYear('verified_at', Carbon::now()->year)
            ->sum('amount');

        $thisWeekRevenue = (float) Payment::where('supplier_id', $user->id)
            ->where('status', 'verified')
            ->whereBetween('verified_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->sum('amount');

        $pendingPaymentsCount = (int) Payment::where('supplier_id', $user->id)
            ->where('status', 'pending')
            ->count();

        $pendingPaymentAmount = (float) Payment::where('supplier_id', $user->id)
            ->where('status', 'pending')
            ->sum('amount');

        // Total Expected Amount for this supplier from active bookings
        $totalItemBooked = (float) BookingItem::where('supplier_id', $user->id)
            ->whereHas('booking', function ($q) {
                $q->whereNotIn('overall_status', ['rejected', 'cancelled']);
            })
            ->sum('unit_price');

        $totalTeamBooked = (float) Booking::where('booking_type', 'team_package')
            ->whereHas('team', function ($q) use ($user) {
                $q->where('coordinator_id', $user->id);
            })
            ->whereNotIn('overall_status', ['rejected', 'cancelled'])
            ->sum('total_amount');

        $expectedTotal = max($totalItemBooked, $totalTeamBooked);
        $remainingBalance = max(0.0, round($expectedTotal - $totalRevenue, 2));

        // ── Revenue Chart Over Time (Verified Payments Only) ──
        // 1. Weekly (last 7 days)
        $weeklyChart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $amount = (float) Payment::where('supplier_id', $user->id)
                ->where('status', 'verified')
                ->whereDate('verified_at', $date->toDateString())
                ->sum('amount');

            $weeklyChart[] = [
                'label' => $date->format('D, M j'),
                'amount' => $amount,
            ];
        }

        // 2. Monthly (last 6 months)
        $monthlyChart = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthDate = Carbon::today()->subMonths($i);
            $amount = (float) Payment::where('supplier_id', $user->id)
                ->where('status', 'verified')
                ->whereMonth('verified_at', $monthDate->month)
                ->whereYear('verified_at', $monthDate->year)
                ->sum('amount');

            $monthlyChart[] = [
                'label' => $monthDate->format('M Y'),
                'amount' => $amount,
            ];
        }

        // 3. Yearly (past 4 years)
        $yearlyChart = [];
        $currentYear = (int) Carbon::now()->year;
        for ($y = $currentYear - 3; $y <= $currentYear; $y++) {
            $amount = (float) Payment::where('supplier_id', $user->id)
                ->where('status', 'verified')
                ->whereYear('verified_at', $y)
                ->sum('amount');

            $yearlyChart[] = [
                'label' => (string) $y,
                'amount' => $amount,
            ];
        }

        // Recent Payments
        $recentPayments = Payment::with(['booking', 'customer'])
            ->where('supplier_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        // Upcoming Bookings Schedule
        $upcomingBookings = BookingItem::with(['booking.customer'])
            ->where('supplier_id', $user->id)
            ->whereHas('booking', function ($q) {
                $q->where('event_date', '>=', now()->toDateString());
            })
            ->whereIn('status', ['pending', 'accepted'])
            ->take(5)
            ->get();

        // Rating & Review Stats
        $ratingStats = $user->getRatingStats();

        // Recent Reviews
        $recentReviews = $user->reviewsReceived()
            ->where('status', 'approved')
            ->with(['customer', 'booking'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Supplier/Dashboard', [
            'supplierProfile' => $supplierProfile,
            'stats' => [
                'totalServices' => $totalServices,
                'activeServices' => $activeServices,
                'totalPackages' => $totalPackages,
                'totalBookings' => $totalBookings,
                'pendingBookings' => $pendingBookings,
                'confirmedBookings' => $confirmedBookings,
                // Revenue Summary Metrics
                'totalRevenue' => $totalRevenue,
                'thisMonthRevenue' => $thisMonthRevenue,
                'thisWeekRevenue' => $thisWeekRevenue,
                'pendingPayments' => $pendingPaymentsCount,
                'pendingPaymentAmount' => $pendingPaymentAmount,
                'completedPayments' => $completedPayments,
                'remainingBalance' => $remainingBalance,
                // Rating stats
                'averageRating' => $ratingStats['average'],
                'totalReviews' => $ratingStats['count'],
                'starDistribution' => $ratingStats['distribution'],
            ],
            'revenueChart' => [
                'weekly' => $weeklyChart,
                'monthly' => $monthlyChart,
                'yearly' => $yearlyChart,
            ],
            'recentPayments' => $recentPayments,
            'recentReviews' => $recentReviews,
            'upcomingBookings' => $upcomingBookings,
        ]);
    }
}
