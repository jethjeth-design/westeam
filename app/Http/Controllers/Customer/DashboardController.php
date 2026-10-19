<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\HomepageContentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected HomepageContentService $homepageService
    ) {}

    /**
     * Display the Customer dashboard with real-time statistics, upcoming event details,
     * and synchronized admin-managed banners, featured suppliers, and top packages.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // 1. Total bookings count
        $totalBookings = Booking::where('customer_id', $user->id)->count();
        $confirmedBookings = Booking::where('customer_id', $user->id)
            ->whereIn('overall_status', ['accepted', 'completed'])
            ->count();

        // 2. Upcoming Event (Next upcoming booking)
        $upcomingBooking = Booking::with([
            'items.supplier.supplierProfile',
            'team.coordinator',
        ])
            ->where('customer_id', $user->id)
            ->where('event_date', '>=', now()->toDateString())
            ->whereIn('overall_status', ['pending', 'accepted'])
            ->orderBy('event_date', 'asc')
            ->first();

        // 3. Recent Bookings list
        $recentBookings = Booking::with(['items.supplier.supplierProfile'])
            ->where('customer_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        // 4. Total Budget / Spent
        $totalSpent = Booking::where('customer_id', $user->id)
            ->whereIn('overall_status', ['accepted', 'completed'])
            ->sum('total_amount');

        // 5. Shared Admin-driven Homepage Data (Single Source of Truth)
        $banners = $this->homepageService->getActiveBanners();
        $sections = $this->homepageService->getHomepageSections();
        $settings = $this->homepageService->getHomepageSettings();
        $featuredSuppliers = $this->homepageService->getFeaturedSuppliers();
        $topPackages = $this->homepageService->getTopPackages();
        $eventCategories = $this->homepageService->getEventCategories();
        $highlights = $this->homepageService->getHighlights($sections);

        return Inertia::render('Customer/Dashboard', [
            'stats' => [
                'totalBookings' => $totalBookings,
                'confirmedBookings' => $confirmedBookings,
                'totalSpent' => (float) $totalSpent,
            ],
            'upcomingBooking' => $upcomingBooking,
            'recentBookings' => $recentBookings,
            'banners' => $banners,
            'sections' => $sections,
            'settings' => $settings,
            'featuredSuppliers' => $featuredSuppliers,
            'topPackages' => $topPackages,
            'eventCategories' => $eventCategories,
            'highlights' => $highlights,
        ]);
    }
}
