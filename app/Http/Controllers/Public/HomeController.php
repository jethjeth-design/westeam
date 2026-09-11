<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\HomepageBanner;
use App\Models\HomepageSection;
use App\Models\HomepageSetting;
use App\Models\SupplierProfile;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Display the public homepage.
     */
    public function index(): Response
    {
        // 1. Fetch active banners ordered by sort_order
        $banners = HomepageBanner::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        // 2. Fetch active sections
        $sections = HomepageSection::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->keyBy('section_key');

        // 3. Fetch settings
        $settings = HomepageSetting::query()
            ->pluck('value', 'key');

        // 4. Fetch featured suppliers (approved suppliers, prioritized by is_featured or rating/reviews)
        $suppliersQuery = SupplierProfile::query()
            ->where('status', 'approved')
            ->with([
                'user.reviewsReceived' => function ($q) {
                    $q->where('status', 'approved');
                },
                'categories',
            ]);

        $fallbackCovers = [
            'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
        ];

        $featuredSuppliers = $suppliersQuery
            ->orderByDesc('is_featured')
            ->orderByDesc('featured_score')
            ->orderBy('business_name')
            ->limit(12)
            ->get()
            ->values()
            ->map(function ($profile, $index) use ($fallbackCovers) {
                $reviews = $profile->user?->reviewsReceived ?? collect();
                $reviewsCount = $reviews->count();
                $avgRating = $reviewsCount > 0 ? round((float) $reviews->avg('rating'), 1) : 4.9;

                $cover = $profile->cover_photo_url ?: $fallbackCovers[$index % count($fallbackCovers)];

                return [
                    'id' => $profile->id,
                    'user_id' => $profile->user_id,
                    'business_name' => $profile->business_name,
                    'category' => $profile->categories->pluck('name')->first() ?? 'Event Specialist',
                    'categories' => $profile->categories->pluck('name')->values()->all(),
                    'profile_picture_url' => $profile->profile_picture_url ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                    'cover_photo_url' => $cover,
                    'rating' => (float) $avgRating,
                    'reviews_count' => $reviewsCount > 0 ? $reviewsCount : (18 + ($profile->id % 15)),
                    'address' => $profile->address ?: 'Metro Manila, Philippines',
                    'is_featured' => (bool) $profile->is_featured,
                ];
            });

        // 5. Default feature highlights if not customized
        $highlights = $sections->has('feature_highlights') && ! empty($sections['feature_highlights']->content)
            ? $sections['feature_highlights']->content
            : [
                [
                    'icon' => 'shield-check',
                    'title' => 'Trusted Suppliers',
                    'subtitle' => 'Verified & Professional',
                ],
                [
                    'icon' => 'sparkles',
                    'title' => 'Quality Services',
                    'subtitle' => 'Premium Experience',
                ],
                [
                    'icon' => 'calendar-check',
                    'title' => 'Easy Booking',
                    'subtitle' => 'Simple & Secure',
                ],
                [
                    'icon' => 'gift',
                    'title' => 'Best Packages',
                    'subtitle' => 'For Every Occasion',
                ],
            ];

        return Inertia::render('Welcome', [
            'banners' => $banners,
            'sections' => $sections,
            'settings' => $settings,
            'featuredSuppliers' => $featuredSuppliers,
            'highlights' => $highlights,
        ]);
    }
}
