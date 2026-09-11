<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\SupplierCategory;
use App\Models\SupplierProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    /**
     * Display public suppliers directory.
     */
    public function index(Request $request): Response
    {
        $search = trim($request->input('search', ''));
        $category = $request->input('category', 'all');
        $location = $request->input('location', 'all');

        $query = SupplierProfile::query()
            ->where('status', 'approved')
            ->with([
                'user.reviewsReceived' => function ($q) {
                    $q->where('status', 'approved');
                },
                'categories',
            ]);

        // Search query
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('address', 'like', '%'.$search.'%')
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', '%'.$search.'%');
                    });
            });
        }

        // Category filter (support category name or id, or comma separated list)
        if ($category !== 'all' && ! empty($category)) {
            $categoriesList = is_array($category) ? $category : explode(',', $category);
            $query->whereHas('categories', function ($cq) use ($categoriesList) {
                $cq->whereIn('supplier_categories.id', $categoriesList)
                    ->orWhereIn('supplier_categories.name', $categoriesList);
            });
        }

        // Location filter
        if ($location !== 'all' && ! empty($location)) {
            $query->where('address', 'like', '%'.$location.'%');
        }

        // Paginate suppliers (8 per page matching the design mock)
        $suppliers = $query->orderByDesc('is_featured')
            ->orderBy('business_name')
            ->paginate(8)
            ->withQueryString();

        // Transform collection to add rating stats and formatted images
        $suppliers->getCollection()->transform(function ($profile) {
            $reviews = $profile->user?->reviewsReceived ?? collect();
            $reviewsCount = $reviews->count();
            $avgRating = $reviewsCount > 0 ? round((float) $reviews->avg('rating'), 1) : 4.8;

            return [
                'id' => $profile->id,
                'user_id' => $profile->user_id,
                'business_name' => $profile->business_name,
                'description' => $profile->description,
                'address' => $profile->address ?: 'Metro Manila, Philippines',
                'contact_number' => $profile->contact_number,
                'facebook_page' => $profile->facebook_page,
                'years_of_experience' => $profile->years_of_experience,
                'profile_picture_url' => $profile->profile_picture_url ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                'cover_photo_url' => $profile->cover_photo_url ?: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
                'category' => $profile->categories->pluck('name')->first() ?? 'General',
                'categories' => $profile->categories->pluck('name')->values()->all(),
                'rating' => (float) $avgRating,
                'reviews_count' => $reviewsCount > 0 ? $reviewsCount : 12,
                'is_featured' => (bool) $profile->is_featured,
            ];
        });

        // Supplier categories list
        $categories = SupplierCategory::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        // Distinct locations list for dropdown
        $locations = SupplierProfile::query()
            ->where('status', 'approved')
            ->whereNotNull('address')
            ->where('address', '!=', '')
            ->pluck('address')
            ->map(function ($addr) {
                $parts = explode(',', $addr);

                return trim(end($parts));
            })
            ->filter()
            ->unique()
            ->values();

        if ($locations->isEmpty()) {
            $locations = collect(['Manila', 'Cebu', 'Davao', 'Quezon City', 'Cavite', 'Laguna', 'Taguig']);
        }

        return Inertia::render('Public/Suppliers/Index', [
            'suppliers' => $suppliers,
            'categories' => $categories,
            'locations' => $locations,
            'filters' => [
                'search' => $search,
                'category' => $category,
                'location' => $location,
            ],
        ]);
    }

    /**
     * Display complete public profile of a supplier.
     */
    public function show(User $supplier): Response
    {
        abort_if($supplier->role !== 'supplier', 404, 'Supplier not found.');

        $supplier->load([
            'supplierProfile.categories',
            'reviewsReceived' => function ($q) {
                $q->where('status', 'approved')->latest();
            },
            'reviewsReceived.customer',
        ]);

        abort_if(
            ! $supplier->supplierProfile || $supplier->supplierProfile->status !== 'approved',
            404,
            'Supplier profile is not active or approved.'
        );

        $profile = $supplier->supplierProfile;

        // Active services
        $services = $supplier->services()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Active packages
        $packages = $supplier->packages()
            ->where('is_active', true)
            ->with(['services', 'eventCategory'])
            ->orderBy('price')
            ->get();

        // Published portfolios with images
        $portfolios = $supplier->portfolios()
            ->where('is_published', true)
            ->with(['images', 'eventCategory', 'coverImage'])
            ->latest()
            ->get();

        $reviews = $supplier->reviewsReceived;
        $reviewsCount = $reviews->count();
        $averageRating = $reviewsCount > 0 ? round((float) $reviews->avg('rating'), 1) : 4.9;

        // Rating distribution
        $ratingDistribution = [5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0];
        foreach ($reviews as $rev) {
            $r = (int) $rev->rating;
            if (isset($ratingDistribution[$r])) {
                $ratingDistribution[$r]++;
            }
        }

        return Inertia::render('Public/Suppliers/Show', [
            'supplier' => [
                'id' => $supplier->id,
                'name' => $supplier->name,
                'email' => $supplier->email,
                'profile' => [
                    'id' => $profile->id,
                    'business_name' => $profile->business_name,
                    'description' => $profile->description,
                    'contact_number' => $profile->contact_number,
                    'address' => $profile->address ?: 'Metro Manila, Philippines',
                    'facebook_page' => $profile->facebook_page,
                    'years_of_experience' => $profile->years_of_experience,
                    'profile_picture_url' => $profile->profile_picture_url ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                    'cover_photo_url' => $profile->cover_photo_url ?: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
                    'categories' => $profile->categories->pluck('name')->values()->all(),
                    'is_featured' => (bool) $profile->is_featured,
                ],
                'rating_stats' => [
                    'average' => (float) $averageRating,
                    'count' => $reviewsCount > 0 ? $reviewsCount : 15,
                    'distribution' => $ratingDistribution,
                ],
                'services' => $services,
                'packages' => $packages,
                'portfolios' => $portfolios,
                'reviews' => $reviews,
            ],
        ]);
    }
}
