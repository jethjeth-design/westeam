<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\BookingItem;
use App\Models\Package;
use App\Models\Service;
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
        $confirmedBookings = BookingItem::where('supplier_id', $user->id)->where('status', 'accepted')->count();

        // Revenue
        $totalRevenue = BookingItem::where('supplier_id', $user->id)
            ->whereIn('status', ['accepted', 'completed'])
            ->sum('unit_price');

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
                'totalRevenue' => (float) $totalRevenue,
                'averageRating' => $ratingStats['average'],
                'totalReviews' => $ratingStats['count'],
                'starDistribution' => $ratingStats['distribution'],
            ],
            'recentReviews' => $recentReviews,
            'upcomingBookings' => $upcomingBookings,
        ]);
    }
}
