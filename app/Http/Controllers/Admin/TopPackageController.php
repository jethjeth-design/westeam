<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EventCategory;
use App\Models\Package;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TopPackageController extends Controller
{
    /**
     * Display the Top Packages Management dashboard.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $tab = (string) $request->input('tab', 'top'); // 'top', 'qualified', 'all'
        $categoryId = $request->input('category_id');
        $statusFilter = $request->input('status', 'all'); // 'all', 'active', 'inactive'

        $packagesQuery = Package::with([
            'supplier.supplierProfile',
            'eventCategory',
            'team',
            'reviews' => function ($q) {
                $q->where('status', 'approved')
                    ->whereHas('bookingItem', function ($biq) {
                        $biq->where('status', 'completed')
                            ->orWhereHas('booking', fn ($bq) => $bq->where('overall_status', 'completed'));
                    })
                    ->with('customer:id,name,email')
                    ->latest()
                    ->take(15);
            },
            'bookingItems' => function ($q) {
                $q->where(function ($biq) {
                    $biq->where('status', 'completed')
                        ->orWhereHas('booking', fn ($bq) => $bq->where('overall_status', 'completed'));
                })
                    ->with('booking.customer:id,name,email')
                    ->latest()
                    ->take(15);
            },
        ]);

        if ($search !== '') {
            $packagesQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('supplier', function ($sq) use ($search) {
                        $sq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhereHas('supplierProfile', function ($spq) use ($search) {
                                $spq->where('business_name', 'like', "%{$search}%");
                            });
                    })
                    ->orWhereHas('eventCategory', function ($cq) use ($search) {
                        $cq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if (! empty($categoryId)) {
            $packagesQuery->where('event_category_id', $categoryId);
        }

        if ($statusFilter === 'active') {
            $packagesQuery->where('is_active', true);
        } elseif ($statusFilter === 'inactive') {
            $packagesQuery->where('is_active', false);
        }

        $allPackages = $packagesQuery->get();

        // Process performance metrics and ranking data
        $processedPackages = $allPackages->map(function (Package $pkg) {
            $metrics = $pkg->calculatePerformanceMetrics();

            // Sync score if different
            if (abs((float) $pkg->top_score - (float) $metrics['top_score']) > 0.01) {
                $pkg->update(['top_score' => $metrics['top_score']]);
            }

            $supplier = $pkg->supplier;
            $supplierProfile = $supplier?->supplierProfile;

            return [
                'id' => $pkg->id,
                'supplier_id' => $pkg->supplier_id,
                'name' => $pkg->name,
                'description' => $pkg->description,
                'price' => (float) $pkg->price,
                'inclusions' => $pkg->inclusions,
                'image_path' => $pkg->image_path,
                'is_active' => (bool) $pkg->is_active,
                'is_top_package' => (bool) $pkg->is_top_package,
                'is_featured' => (bool) $pkg->is_featured,
                'is_ranking_excluded' => (bool) $pkg->is_ranking_excluded,
                'top_score' => (float) $metrics['top_score'],
                'average_rating' => (float) $metrics['average_rating'],
                'reviews_count' => (int) $metrics['reviews_count'],
                'completed_bookings_count' => (int) $metrics['completed_bookings_count'],
                'recent_bookings_count' => (int) $metrics['recent_bookings_count'],
                'is_qualified' => (bool) $metrics['is_qualified'],
                'criteria' => $metrics['criteria'],
                'supplier' => [
                    'id' => $supplier?->id,
                    'name' => $supplier?->name ?? 'Unknown Supplier',
                    'email' => $supplier?->email,
                    'business_name' => $supplierProfile?->business_name ?: ($supplier?->name ?? 'Supplier'),
                    'contact_number' => $supplierProfile?->contact_number,
                    'profile_picture_url' => $supplierProfile?->profile_picture_url,
                    'status' => $supplierProfile?->status ?? 'pending',
                ],
                'event_category' => $pkg->eventCategory ? [
                    'id' => $pkg->eventCategory->id,
                    'name' => $pkg->eventCategory->name,
                ] : null,
                'team' => $pkg->team ? [
                    'id' => $pkg->team->id,
                    'name' => $pkg->team->name,
                ] : null,
                'recent_reviews' => $pkg->reviews->map(fn ($r) => [
                    'id' => $r->id,
                    'rating' => (int) $r->rating,
                    'comment' => $r->comment,
                    'created_at' => $r->created_at?->format('M d, Y'),
                    'customer_name' => $r->customer?->name ?? 'Verified Customer',
                ]),
                'recent_bookings' => $pkg->bookingItems->map(fn ($bi) => [
                    'id' => $bi->id,
                    'booking_reference' => $bi->booking?->booking_reference ?? '#'.$bi->booking_id,
                    'event_name' => $bi->booking?->event_name ?? 'Event Booking',
                    'event_date' => $bi->booking?->event_date?->format('M d, Y') ?? 'N/A',
                    'status' => $bi->status,
                    'unit_price' => (float) $bi->unit_price,
                    'customer_name' => $bi->booking?->customer?->name ?? 'Customer',
                ]),
            ];
        });

        // Sort descending by top_score, average_rating, reviews_count, completed_bookings_count
        $sortedAll = $processedPackages->sort(function ($a, $b) {
            if ($b['top_score'] != $a['top_score']) {
                return $b['top_score'] <=> $a['top_score'];
            }
            if ($b['average_rating'] != $a['average_rating']) {
                return $b['average_rating'] <=> $a['average_rating'];
            }
            if ($b['reviews_count'] != $a['reviews_count']) {
                return $b['reviews_count'] <=> $a['reviews_count'];
            }

            return $b['completed_bookings_count'] <=> $a['completed_bookings_count'];
        })->values();

        // Assign ordinal rank
        $rankedAll = $sortedAll->map(function ($pkg, $index) {
            $pkg['rank'] = $index + 1;

            return $pkg;
        });

        // Split into collections
        $currentlyTop = $rankedAll->filter(fn ($p) => $p['is_top_package'])->values();
        $qualifiedPending = $rankedAll->filter(fn ($p) => $p['is_qualified'] && ! $p['is_top_package'])->values();

        $stats = [
            'total_top' => $currentlyTop->count(),
            'total_qualified' => $rankedAll->filter(fn ($p) => $p['is_qualified'])->count(),
            'total_packages' => $rankedAll->count(),
            'total_active' => $rankedAll->filter(fn ($p) => $p['is_active'])->count(),
            'min_rating_threshold' => 4.5,
            'min_reviews_threshold' => 5,
            'min_bookings_threshold' => 5,
            'leader' => $rankedAll->first() ? [
                'name' => $rankedAll->first()['name'],
                'score' => $rankedAll->first()['top_score'],
                'rating' => $rankedAll->first()['average_rating'],
                'supplier_name' => $rankedAll->first()['supplier']['business_name'],
            ] : null,
        ];

        $categories = EventCategory::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/TopPackages/Index', [
            'currentlyTop' => $currentlyTop,
            'qualifiedPending' => $qualifiedPending,
            'allRankings' => $rankedAll,
            'stats' => $stats,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'tab' => $tab,
                'category_id' => $categoryId,
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * Manually mark a package as Top Package.
     */
    public function feature(Package $package): RedirectResponse
    {
        $package->update([
            'is_top_package' => true,
            'is_featured' => true,
            'is_ranking_excluded' => false,
        ]);

        return back()->with('success', "'{$package->name}' is now marked as a Top Package.");
    }

    /**
     * Manually remove a package from Top Packages.
     */
    public function unfeature(Package $package): RedirectResponse
    {
        $package->update([
            'is_top_package' => false,
            'is_featured' => false,
            'is_ranking_excluded' => true,
        ]);

        return back()->with('success', "'{$package->name}' has been removed from Top Packages.");
    }

    /**
     * Toggle Top Package status for a package.
     */
    public function toggle(Package $package): RedirectResponse
    {
        $newStatus = ! $package->is_top_package;

        $package->update([
            'is_top_package' => $newStatus,
            'is_featured' => $newStatus,
            'is_ranking_excluded' => ! $newStatus,
        ]);

        $msg = $newStatus
            ? "'{$package->name}' has been marked as a Top Package."
            : "'{$package->name}' has been removed from Top Packages.";

        return back()->with('success', $msg);
    }

    /**
     * Restore automatic Top Package qualification for a package.
     */
    public function restoreAuto(Package $package): RedirectResponse
    {
        $package->is_ranking_excluded = false;
        $package->syncPerformanceAndTopStatus();

        return back()->with('success', "'{$package->name}' has been restored to automatic ranking evaluation.");
    }

    /**
     * Enable or disable a package (toggle active status).
     */
    public function toggleActive(Package $package): RedirectResponse
    {
        $newActive = ! $package->is_active;

        $package->update([
            'is_active' => $newActive,
        ]);

        // Re-evaluate qualification if not manually excluded
        $package->syncPerformanceAndTopStatus();

        $msg = $newActive
            ? "'{$package->name}' has been enabled and activated."
            : "'{$package->name}' has been disabled and deactivated.";

        return back()->with('success', $msg);
    }

    /**
     * Run full automatic recalculation and synchronization for all packages.
     */
    public function recalculate(): RedirectResponse
    {
        $packages = Package::with(['supplier.supplierProfile'])->get();
        $topCount = 0;
        $removedCount = 0;

        foreach ($packages as $pkg) {
            $metrics = $pkg->calculatePerformanceMetrics();

            // Auto-qualify if not manually excluded
            if (! $pkg->is_ranking_excluded) {
                if ($metrics['is_qualified']) {
                    $pkg->is_top_package = true;
                    $pkg->is_featured = true;
                    $topCount++;
                } else {
                    if ($pkg->is_top_package) {
                        $removedCount++;
                    }
                    $pkg->is_top_package = false;
                    $pkg->is_featured = false;
                }
            }

            $pkg->top_score = $metrics['top_score'];
            $pkg->save();
        }

        return back()->with(
            'success',
            "Recalculation complete! Performance scores updated for {$packages->count()} packages ({$topCount} qualified Top Packages)."
        );
    }
}
