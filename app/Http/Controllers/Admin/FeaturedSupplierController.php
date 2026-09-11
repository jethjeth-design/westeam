<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupplierProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeaturedSupplierController extends Controller
{
    /**
     * Display the Featured Supplier Management dashboard.
     */
    public function index(Request $request): Response
    {
        $search = trim($request->input('search', ''));
        $tab = $request->input('tab', 'featured'); // 'featured', 'qualified', 'all'

        // Load all active / approved supplier profiles with user and categories
        $suppliersQuery = SupplierProfile::with([
            'user',
            'categories',
            'reviews' => function ($q) {
                $q->where('status', 'approved')
                    ->whereHas('bookingItem', function ($biq) {
                        $biq->where('status', 'completed')
                            ->orWhereHas('booking', fn ($bq) => $bq->where('overall_status', 'completed'));
                    })
                    ->with('customer:id,name,email')
                    ->latest()
                    ->take(10);
            },
            'bookingItems' => function ($q) {
                $q->where(function ($biq) {
                    $biq->where('status', 'completed')
                        ->orWhereHas('booking', fn ($bq) => $bq->where('overall_status', 'completed'));
                })
                    ->with('booking:id,booking_reference,event_name,event_date,overall_status')
                    ->latest()
                    ->take(10);
            },
        ]);

        if ($search !== '') {
            $suppliersQuery->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('categories', function ($cq) use ($search) {
                        $cq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $allProfiles = $suppliersQuery->get();

        // Process metrics for each supplier
        $processedSuppliers = $allProfiles->map(function (SupplierProfile $profile) {
            $metrics = $profile->calculatePerformanceMetrics();

            // Sync score to database if changed
            if (abs((float) $profile->featured_score - (float) $metrics['featured_score']) > 0.01) {
                $profile->update(['featured_score' => $metrics['featured_score']]);
            }

            return [
                'id' => $profile->id,
                'user_id' => $profile->user_id,
                'name' => $profile->business_name ?: ($profile->user?->name ?? 'Unnamed Supplier'),
                'contact_number' => $profile->contact_number,
                'address' => $profile->address,
                'profile_picture' => $profile->profile_picture,
                'profile_picture_url' => $profile->profile_picture_url,
                'cover_photo_url' => $profile->cover_photo_url,
                'description' => $profile->description,
                'years_of_experience' => $profile->years_of_experience,
                'facebook_page' => $profile->facebook_page,
                'facebook_url' => $profile->facebook_url,
                'status' => $profile->status,
                'is_featured' => (bool) $profile->is_featured,
                'is_ranking_excluded' => (bool) $profile->is_ranking_excluded,
                'featured_score' => $metrics['featured_score'],
                'average_rating' => $metrics['average_rating'],
                'reviews_count' => $metrics['reviews_count'],
                'completed_bookings_count' => $metrics['completed_bookings_count'],
                'is_qualified' => $metrics['is_qualified'],
                'criteria' => $metrics['criteria'],
                'categories' => $profile->categories->map(fn ($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                ]),
                'user' => [
                    'id' => $profile->user?->id,
                    'name' => $profile->user?->name,
                    'email' => $profile->user?->email,
                ],
                'recent_reviews' => $profile->reviews->map(fn ($r) => [
                    'id' => $r->id,
                    'rating' => $r->rating,
                    'comment' => $r->comment,
                    'created_at' => $r->created_at?->format('M d, Y'),
                    'customer_name' => $r->customer?->name ?? 'Verified Customer',
                    'item_name' => $r->item_name,
                ]),
                'recent_bookings' => $profile->bookingItems->map(fn ($bi) => [
                    'id' => $bi->id,
                    'booking_reference' => $bi->booking?->booking_reference ?? '#'.$bi->booking_id,
                    'event_name' => $bi->booking?->event_name ?? 'Event Booking',
                    'event_date' => $bi->booking?->event_date?->format('M d, Y') ?? 'N/A',
                    'item_name' => $bi->item_name,
                    'status' => $bi->status,
                ]),
            ];
        });

        // Sort all by featured_score descending, then average_rating, then reviews_count
        $sortedAll = $processedSuppliers->sort(function ($a, $b) {
            if ($b['featured_score'] != $a['featured_score']) {
                return $b['featured_score'] <=> $a['featured_score'];
            }
            if ($b['average_rating'] != $a['average_rating']) {
                return $b['average_rating'] <=> $a['average_rating'];
            }

            return $b['reviews_count'] <=> $a['reviews_count'];
        })->values();

        // Assign rankings
        $rankedAll = $sortedAll->map(function ($supplier, $index) {
            $supplier['rank'] = $index + 1;

            return $supplier;
        });

        // Split into collections
        $currentlyFeatured = $rankedAll->filter(fn ($s) => $s['is_featured'])->values();
        $qualifiedPending = $rankedAll->filter(fn ($s) => $s['is_qualified'] && ! $s['is_featured'])->values();

        $stats = [
            'total_featured' => $currentlyFeatured->count(),
            'total_qualified' => $rankedAll->filter(fn ($s) => $s['is_qualified'])->count(),
            'total_suppliers' => $rankedAll->count(),
            'min_rating_threshold' => 4.5,
            'min_reviews_threshold' => 5,
            'min_bookings_threshold' => 5,
            'top_supplier' => $rankedAll->first() ? [
                'name' => $rankedAll->first()['name'],
                'score' => $rankedAll->first()['featured_score'],
                'rating' => $rankedAll->first()['average_rating'],
            ] : null,
        ];

        return Inertia::render('Admin/FeaturedSuppliers/Index', [
            'currentlyFeatured' => $currentlyFeatured,
            'qualifiedPending' => $qualifiedPending,
            'allRankings' => $rankedAll,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'tab' => $tab,
            ],
        ]);
    }

    /**
     * Feature a supplier manually.
     */
    public function feature(SupplierProfile $supplier): RedirectResponse
    {
        $supplier->update([
            'is_featured' => true,
            'is_ranking_excluded' => false,
        ]);

        $name = $supplier->business_name ?: ($supplier->user?->name ?? 'Supplier');

        return back()->with('success', "'{$name}' is now featured on the platform.");
    }

    /**
     * Remove a supplier from featured status manually.
     */
    public function unfeature(SupplierProfile $supplier): RedirectResponse
    {
        $supplier->update([
            'is_featured' => false,
            'is_ranking_excluded' => true,
        ]);

        $name = $supplier->business_name ?: ($supplier->user?->name ?? 'Supplier');

        return back()->with('success', "'{$name}' has been removed from Featured status.");
    }

    /**
     * Toggle featured status for a supplier.
     */
    public function toggle(SupplierProfile $supplier): RedirectResponse
    {
        $newStatus = ! $supplier->is_featured;

        $supplier->update([
            'is_featured' => $newStatus,
            'is_ranking_excluded' => ! $newStatus,
        ]);

        $name = $supplier->business_name ?: ($supplier->user?->name ?? 'Supplier');
        $msg = $newStatus
            ? "'{$name}' has been marked as Featured."
            : "'{$name}' has been removed from Featured.";

        return back()->with('success', $msg);
    }

    /**
     * Reset manual exclusion and allow automatic featured qualification.
     */
    public function restoreAuto(SupplierProfile $supplier): RedirectResponse
    {
        $metrics = $supplier->calculatePerformanceMetrics();

        $supplier->update([
            'is_ranking_excluded' => false,
            'is_featured' => $metrics['is_qualified'],
            'featured_score' => $metrics['featured_score'],
        ]);

        $name = $supplier->business_name ?: ($supplier->user?->name ?? 'Supplier');

        return back()->with('success', "'{$name}' has been restored to automatic ranking evaluation.");
    }

    /**
     * Run full automatic recalculation and synchronization for all suppliers.
     */
    public function recalculate(): RedirectResponse
    {
        $profiles = SupplierProfile::where('status', 'approved')->get();
        $featuredCount = 0;
        $unfeaturedCount = 0;

        foreach ($profiles as $profile) {
            $metrics = $profile->calculatePerformanceMetrics();

            // If not manually excluded by admin, auto-feature if qualified
            if (! $profile->is_ranking_excluded) {
                if ($metrics['is_qualified']) {
                    $profile->is_featured = true;
                    $featuredCount++;
                } else {
                    if ($profile->is_featured) {
                        $unfeaturedCount++;
                    }
                    $profile->is_featured = false;
                }
            }

            $profile->featured_score = $metrics['featured_score'];
            $profile->save();
        }

        return back()->with(
            'success',
            "Recalculation complete! Performance scores updated for {$profiles->count()} suppliers ({$featuredCount} qualified featured)."
        );
    }
}
