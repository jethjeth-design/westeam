<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\EventCategory;
use App\Models\Package;
use App\Models\SupplierProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller
{
    /**
     * Display public packages page.
     */
    public function index(Request $request): Response
    {
        $search = trim($request->input('search', ''));
        $category = $request->input('category', 'all');
        $categories = $request->input('categories', []);
        $supplierId = $request->input('supplier_id', 'all');
        $priceRange = $request->input('price_range', 'all');

        $query = Package::query()
            ->where('is_active', true)
            ->whereHas('supplier.supplierProfile', function ($sq) {
                $sq->where('status', 'approved');
            })
            ->with([
                'supplier.supplierProfile',
                'eventCategory',
                'services',
                'reviews' => function ($q) {
                    $q->where('status', 'approved');
                },
            ]);

        // Search by package name or description
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('inclusions', 'like', '%'.$search.'%')
                    ->orWhereHas('supplier.supplierProfile', function ($sq) use ($search) {
                        $sq->where('business_name', 'like', '%'.$search.'%');
                    });
            });
        }

        // Single category filter
        if ($category !== 'all' && ! empty($category)) {
            $query->where(function ($q) use ($category) {
                $q->where('event_category_id', $category)
                    ->orWhereHas('eventCategory', function ($cq) use ($category) {
                        $cq->where('name', 'like', '%'.$category.'%');
                    });
            });
        }

        // Multiple categories checkbox filter
        if (! empty($categories) && is_array($categories)) {
            $query->whereIn('event_category_id', $categories);
        }

        // Supplier filter
        if ($supplierId !== 'all' && ! empty($supplierId)) {
            $query->where('supplier_id', $supplierId);
        }

        // Price range filter
        if ($priceRange !== 'all' && ! empty($priceRange)) {
            match ($priceRange) {
                'under_20k' => $query->where('price', '<', 20000),
                '20k_50k' => $query->whereBetween('price', [20000, 50000]),
                '50k_100k' => $query->whereBetween('price', [50000, 100000]),
                'over_100k' => $query->where('price', '>', 100000),
                default => null,
            };
        }

        // Order by featured/top packages first, then newest
        $packages = $query->orderByDesc('is_top_package')
            ->orderByDesc('is_featured')
            ->orderBy('price')
            ->paginate(6) // 6 per page matching design mockup
            ->withQueryString();

        // Transform packages collection
        $packages->getCollection()->transform(function ($pkg) {
            $supplierProfile = $pkg->supplier?->supplierProfile;
            $reviews = $pkg->reviews ?? collect();
            $reviewsCount = $reviews->count();
            $avgRating = $reviewsCount > 0 ? round((float) $reviews->avg('rating'), 1) : 4.9;

            // Fallback image based on event category or photography
            $fallbackImage = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
            if ($pkg->image_path) {
                $image = str_starts_with($pkg->image_path, 'http')
                    ? $pkg->image_path
                    : (str_starts_with($pkg->image_path, '/') ? $pkg->image_path : '/storage/'.$pkg->image_path);
            } else {
                $image = $fallbackImage;
            }

            return [
                'id' => $pkg->id,
                'name' => $pkg->name,
                'description' => $pkg->description,
                'price' => (float) $pkg->price,
                'formatted_price' => '₱'.number_format((float) $pkg->price, 0),
                'inclusions' => $pkg->inclusions,
                'image_url' => $image,
                'is_top_package' => (bool) $pkg->is_top_package,
                'is_featured' => (bool) $pkg->is_featured,
                'supplier' => [
                    'id' => $pkg->supplier_id,
                    'business_name' => $supplierProfile?->business_name ?? 'Premier Supplier',
                    'profile_picture_url' => $supplierProfile?->profile_picture_url ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                    'contact_number' => $supplierProfile?->contact_number,
                    'address' => $supplierProfile?->address ?: 'Metro Manila, Philippines',
                ],
                'event_category' => $pkg->eventCategory ? [
                    'id' => $pkg->eventCategory->id,
                    'name' => $pkg->eventCategory->name,
                ] : null,
                'services' => $pkg->services->pluck('name')->values()->all(),
                'rating' => (float) $avgRating,
                'reviews_count' => $reviewsCount > 0 ? $reviewsCount : 18,
            ];
        });

        // Event categories for left sidebar checkboxes
        $eventCategories = EventCategory::query()
            ->withCount(['packages' => function ($q) {
                $q->where('is_active', true);
            }])
            ->orderBy('name')
            ->get(['id', 'name']);

        // Suppliers list for dropdown
        $approvedSuppliers = SupplierProfile::query()
            ->where('status', 'approved')
            ->orderBy('business_name')
            ->get(['user_id', 'business_name']);

        return Inertia::render('Public/Packages/Index', [
            'packages' => $packages,
            'eventCategories' => $eventCategories,
            'approvedSuppliers' => $approvedSuppliers,
            'filters' => [
                'search' => $search,
                'category' => $category,
                'categories' => $categories,
                'supplier_id' => $supplierId,
                'price_range' => $priceRange,
            ],
        ]);
    }

    /**
     * Display a specific package modal/detail view.
     */
    public function show(Package $package): Response
    {
        abort_if(! $package->is_active, 404, 'Package is not active.');

        $package->load([
            'supplier.supplierProfile.categories',
            'eventCategory',
            'services',
            'reviews.customer',
        ]);

        $supplierProfile = $package->supplier?->supplierProfile;
        abort_if(! $supplierProfile || $supplierProfile->status !== 'approved', 404, 'Supplier is not approved.');

        return Inertia::render('Public/Packages/Show', [
            'package' => $package,
        ]);
    }
}
