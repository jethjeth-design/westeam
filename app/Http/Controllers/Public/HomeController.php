<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\EventCategory;
use App\Models\HomepageBanner;
use App\Models\HomepageSection;
use App\Models\HomepageSetting;
use App\Models\Package;
use App\Models\SupplierPortfolio;
use App\Models\SupplierProfile;
use Illuminate\Support\Str;
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

        // 4. Fetch Event Categories
        $eventCategories = EventCategory::query()
            ->where('is_active', true)
            ->withCount(['packages' => function ($q) {
                $q->where('is_active', true);
            }])
            ->orderBy('name')
            ->get()
            ->map(function ($cat) {
                return [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'description' => $cat->description ?: "Explore our curated {$cat->name} services and packages.",
                    'image_url' => $cat->image_url,
                    'packages_count' => (int) $cat->packages_count,
                ];
            });

        // 5. Fetch Featured Suppliers strictly from Featured Supplier Management (status = approved AND is_featured = true)
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

        $featuredSuppliers = SupplierProfile::query()
            ->where('status', 'approved')
            ->where('is_featured', true)
            ->with([
                'user.reviewsReceived' => function ($q) {
                    $q->where('status', 'approved');
                },
                'categories',
                'user.packages.eventCategory',
                'user.portfolios.eventCategory',
            ])
            ->orderByDesc('featured_score')
            ->orderBy('business_name')
            ->get()
            ->values()
            ->map(function ($profile, $index) use ($fallbackCovers) {
                $reviews = $profile->user?->reviewsReceived ?? collect();
                $reviewsCount = $reviews->count();
                $avgRating = $reviewsCount > 0 ? round((float) $reviews->avg('rating'), 1) : 5.0;

                $cover = $profile->cover_photo_url ?: $fallbackCovers[$index % count($fallbackCovers)];

                // Gather connected event category IDs and names
                $pkgEventCats = $profile->user?->packages?->pluck('event_category_id')->filter() ?? collect();
                $portfolioEventCats = $profile->user?->portfolios?->pluck('event_category_id')->filter() ?? collect();
                $eventCategoryIds = $pkgEventCats->merge($portfolioEventCats)->unique()->values()->all();

                return [
                    'id' => $profile->id,
                    'user_id' => $profile->user_id,
                    'business_name' => $profile->business_name ?: ($profile->user?->name ?? 'Supplier'),
                    'category' => $profile->categories->pluck('name')->first() ?? 'Event Specialist',
                    'categories' => $profile->categories->pluck('name')->values()->all(),
                    'profile_picture_url' => $profile->profile_picture_url ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                    'cover_photo_url' => $cover,
                    'rating' => (float) $avgRating,
                    'reviews_count' => (int) $reviewsCount,
                    'description' => $profile->description ?: 'Dedicated professional providing top-quality event services tailored to your needs.',
                    'short_info' => $profile->description ? Str::limit($profile->description, 110) : ($profile->years_of_experience ? "{$profile->years_of_experience} years of industry experience" : 'Trusted event specialist'),
                    'address' => $profile->address ?: 'Metro Manila, Philippines',
                    'years_of_experience' => $profile->years_of_experience,
                    'is_featured' => (bool) $profile->is_featured,
                    'event_category_ids' => $eventCategoryIds,
                ];
            });

        // 6. Fetch Top Packages: ordered by avg approved-review rating DESC, take top 3
        //    The highest-rated will be placed in the middle on the frontend.
        $rawTopPackages = Package::query()
            ->where('is_active', true)
            ->where(function ($q) {
                $q->where('is_top_package', true)
                    ->orWhere('is_featured', true);
            })
            ->with([
                'supplier.supplierProfile',
                'eventCategory',
                'reviews' => function ($q) {
                    $q->where('status', 'approved');
                },
            ])
            ->get()
            ->map(function ($pkg, $index) use ($fallbackCovers) {
                $reviews = $pkg->reviews ?? collect();
                $reviewsCount = $reviews->count();
                $avgRating = $reviewsCount > 0 ? round((float) $reviews->avg('rating'), 1) : 5.0;

                $supplier = $pkg->supplier;
                $supplierProfile = $supplier?->supplierProfile;
                $supplierName = $supplierProfile?->business_name ?: ($supplier?->name ?? 'Verified Supplier');

                $pkgImage = $pkg->image_path ?: $fallbackCovers[$index % count($fallbackCovers)];

                return [
                    'id' => $pkg->id,
                    'name' => $pkg->name,
                    'price' => (float) $pkg->price,
                    'image_path' => $pkgImage,
                    'supplier_name' => $supplierName,
                    'supplier_id' => $pkg->supplier_id,
                    'supplier_avatar' => $supplierProfile?->profile_picture_url,
                    'event_category_id' => $pkg->event_category_id,
                    'event_category' => $pkg->eventCategory?->name ?? 'Featured Package',
                    'rating' => (float) $avgRating,
                    'reviews_count' => (int) $reviewsCount,
                    'description' => $pkg->description,
                    'inclusions' => is_array($pkg->inclusions) ? $pkg->inclusions : (is_string($pkg->inclusions) ? json_decode($pkg->inclusions, true) ?? [$pkg->inclusions] : []),
                    'is_top_package' => (bool) $pkg->is_top_package,
                ];
            })
            // Sort by rating DESC, then by reviews_count DESC as tiebreaker
            ->sortByDesc(fn ($p) => [$p['rating'], $p['reviews_count']])
            ->values()
            ->take(3);

        // Re-arrange so the highest-rated (index 0) goes to the center (index 1)
        // Result order: [2nd-best, best, 3rd-best]
        $topPackages = $rawTopPackages->count() === 3
            ? collect([$rawTopPackages[1], $rawTopPackages[0], $rawTopPackages[2]])->values()
            : $rawTopPackages->values();

        // 7. Fetch Showcase Gallery items with Event Category connections
        $galleryItems = SupplierPortfolio::query()
            ->where('is_published', true)
            ->whereHas('supplier.supplierProfile', function ($sq) {
                $sq->where('status', 'approved');
            })
            ->with([
                'eventCategory',
                'supplier.supplierProfile',
                'coverImage',
                'images',
            ])
            ->latest()
            ->limit(12)
            ->get()
            ->values()
            ->map(function ($item, $index) use ($fallbackCovers) {
                $supplierProfile = $item->supplier?->supplierProfile;
                $coverUrl = $item->cover_image_url ?: $fallbackCovers[$index % count($fallbackCovers)];

                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'description' => $item->description,
                    'event_date' => $item->event_date?->format('M d, Y'),
                    'location' => $item->location ?: 'Metro Manila',
                    'cover_image_url' => $coverUrl,
                    'images_count' => $item->images->count() ?: 1,
                    'supplier_name' => $supplierProfile?->business_name ?? 'Featured Supplier',
                    'supplier_avatar' => $supplierProfile?->profile_picture_url,
                    'event_category_id' => $item->event_category_id,
                    'event_category' => $item->eventCategory?->name ?? 'Celebration',
                ];
            });

        // 8. Default feature highlights if not customized
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
            'eventCategories' => $eventCategories,
            'featuredSuppliers' => $featuredSuppliers,
            'topPackages' => $topPackages,
            'galleryItems' => $galleryItems,
            'highlights' => $highlights,
        ]);
    }
}
