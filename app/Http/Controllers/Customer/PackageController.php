<?php

namespace App\Http\Controllers\Customer;

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
     * Display active packages from approved suppliers, including Team Packages.
     */
    public function index(Request $request): Response
    {
        $search = trim($request->input('search', ''));
        $category = $request->input('category', 'all');
        $packageType = $request->input('package_type', 'all'); // 'all' | 'individual' | 'team'
        $supplierId = $request->input('supplier_id', 'all');
        $priceRange = $request->input('price_range', 'all');
        $sort = $request->input('sort', 'featured');

        $query = Package::query()
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereHas('supplier.supplierProfile', function ($sq) {
                    $sq->where('status', 'approved');
                })->orWhereHas('team.coordinator.supplierProfile', function ($tq) {
                    $tq->where('status', 'approved');
                });
            })
            ->with([
                'supplier.supplierProfile.categories',
                'team.coordinator.supplierProfile',
                'team.acceptedMembers.supplier.supplierProfile',
                'eventCategory',
                'services',
                'reviews' => function ($q) {
                    $q->where('status', 'approved');
                },
            ]);

        // Search
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('inclusions', 'like', '%'.$search.'%')
                    ->orWhereHas('supplier.supplierProfile', function ($sq) use ($search) {
                        $sq->where('business_name', 'like', '%'.$search.'%');
                    })
                    ->orWhereHas('team', function ($tq) use ($search) {
                        $tq->where('name', 'like', '%'.$search.'%');
                    });
            });
        }

        // Event Category Filter
        if ($category !== 'all' && ! empty($category)) {
            $query->where('event_category_id', $category);
        }

        // Package Type Filter (individual vs team package)
        if ($packageType === 'team') {
            $query->whereNotNull('team_id');
        } elseif ($packageType === 'individual') {
            $query->whereNull('team_id');
        }

        // Supplier Filter
        if ($supplierId !== 'all' && ! empty($supplierId)) {
            $query->where(function ($q) use ($supplierId) {
                $q->where('supplier_id', $supplierId)
                    ->orWhereHas('team', function ($tq) use ($supplierId) {
                        $tq->where('coordinator_id', $supplierId)
                            ->orWhereHas('acceptedMembers', function ($mq) use ($supplierId) {
                                $mq->where('supplier_id', $supplierId);
                            });
                    });
            });
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

        // Sorting
        match ($sort) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'newest' => $query->latest(),
            default => $query->orderByDesc('is_top_package')
                ->orderByDesc('is_featured')
                ->latest(),
        };

        $packages = $query->paginate(12)->withQueryString();

        // Event categories for filter
        $eventCategories = EventCategory::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        // Approved suppliers list for filter dropdown
        $approvedSuppliers = SupplierProfile::query()
            ->where('status', 'approved')
            ->orderBy('business_name')
            ->get(['user_id', 'business_name']);

        return Inertia::render('Customer/Packages/Index', [
            'packages' => $packages,
            'eventCategories' => $eventCategories,
            'approvedSuppliers' => $approvedSuppliers,
            'filters' => [
                'search' => $search,
                'category' => $category,
                'package_type' => $packageType,
                'supplier_id' => $supplierId,
                'price_range' => $priceRange,
                'sort' => $sort,
            ],
        ]);
    }
}
