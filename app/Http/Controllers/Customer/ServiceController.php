<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\SupplierProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    /**
     * Display a listing of available services from approved suppliers.
     */
    public function index(Request $request): Response
    {
        $search = trim($request->input('search', ''));
        $category = $request->input('category', 'all');
        $supplierId = $request->input('supplier_id', 'all');
        $priceRange = $request->input('price_range', 'all');
        $sort = $request->input('sort', 'newest');

        $query = Service::query()
            ->where('is_active', true)
            ->whereHas('supplier.supplierProfile', function ($q) {
                $q->where('status', 'approved');
            })
            ->with([
                'supplier.supplierProfile.categories',
                'packages',
            ]);

        // Search by service name, description, or supplier business name
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('category', 'like', '%'.$search.'%')
                    ->orWhereHas('supplier.supplierProfile', function ($sq) use ($search) {
                        $sq->where('business_name', 'like', '%'.$search.'%')
                            ->orWhere('address', 'like', '%'.$search.'%');
                    });
            });
        }

        // Category filter
        if ($category !== 'all' && ! empty($category)) {
            $query->where('category', $category);
        }

        // Supplier filter
        if ($supplierId !== 'all' && ! empty($supplierId)) {
            $query->where('supplier_id', $supplierId);
        }

        // Price range filter
        if ($priceRange !== 'all' && ! empty($priceRange)) {
            match ($priceRange) {
                'under_5k' => $query->where('price', '<', 5000),
                '5k_15k' => $query->whereBetween('price', [5000, 15000]),
                '15k_30k' => $query->whereBetween('price', [15000, 30000]),
                'over_30k' => $query->where('price', '>', 30000),
                default => null,
            };
        }

        // Sorting
        match ($sort) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'name_asc' => $query->orderBy('name', 'asc'),
            default => $query->latest(),
        };

        $services = $query->paginate(12)->withQueryString();

        // Get distinct categories of active services
        $categories = Service::query()
            ->where('is_active', true)
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->whereHas('supplier.supplierProfile', function ($q) {
                $q->where('status', 'approved');
            })
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        // Approved suppliers list for filtering
        $approvedSuppliers = SupplierProfile::query()
            ->where('status', 'approved')
            ->orderBy('business_name')
            ->get(['user_id', 'business_name']);

        return Inertia::render('Customer/Services/Index', [
            'services' => $services,
            'categories' => $categories,
            'approvedSuppliers' => $approvedSuppliers,
            'filters' => [
                'search' => $search,
                'category' => $category,
                'supplier_id' => $supplierId,
                'price_range' => $priceRange,
                'sort' => $sort,
            ],
        ]);
    }

    /**
     * Display the specified service.
     */
    public function show(Service $service): Response
    {
        abort_unless($service->is_active, 404);

        $service->load([
            'supplier.supplierProfile.categories',
            'supplier.reviewsReceived' => fn ($q) => $q->where('status', 'approved'),
            'packages' => fn ($q) => $q->where('is_active', true),
        ]);

        abort_unless($service->supplier?->supplierProfile?->status === 'approved', 404);

        $otherServices = Service::query()
            ->where('supplier_id', $service->supplier_id)
            ->where('id', '!=', $service->id)
            ->where('is_active', true)
            ->limit(4)
            ->get();

        return Inertia::render('Customer/Services/Show', [
            'service' => $service,
            'otherServices' => $otherServices,
        ]);
    }
}
