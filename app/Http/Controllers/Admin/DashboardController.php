<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $totalCustomers = User::where('role', 'customer')->count();
        $totalSuppliers = User::where('role', 'supplier')->count();
        $totalBookings = Booking::count();
        $totalRevenue = Booking::whereIn('overall_status', ['accepted', 'completed'])->sum('total_amount');

        $pendingSuppliers = User::where('role', 'supplier')
            ->whereHas('supplierProfile', fn ($q) => $q->where('status', 'pending'))
            ->count();

        $recentBookings = Booking::with([
            'customer:id,name,email',
            'items.supplier:id,name',
        ])
            ->latest()
            ->take(10)
            ->get()
            ->map(fn ($b) => [
                'id' => $b->id,
                'booking_reference' => $b->booking_reference,
                'event_name' => $b->event_name,
                'event_date' => $b->event_date,
                'booking_type' => $b->booking_type,
                'overall_status' => $b->overall_status,
                'total_amount' => $b->total_amount,
                'customer' => $b->customer,
                'items_count' => $b->items->count(),
                'created_at' => $b->created_at,
            ]);

        $bookingsByStatus = Booking::selectRaw('overall_status, count(*) as count')
            ->groupBy('overall_status')
            ->pluck('count', 'overall_status');

        $totalReviews = Review::count();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalCustomers' => $totalCustomers,
                'totalSuppliers' => $totalSuppliers,
                'totalBookings' => $totalBookings,
                'totalRevenue' => $totalRevenue,
                'pendingSuppliers' => $pendingSuppliers,
                'totalReviews' => $totalReviews,
            ],
            'recentBookings' => $recentBookings,
            'bookingsByStatus' => $bookingsByStatus,
        ]);
    }
}
