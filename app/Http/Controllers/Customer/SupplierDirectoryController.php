<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\SupplierCategory;
use App\Models\SupplierProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierDirectoryController extends Controller
{
    /**
     * ================================================================
     * FIND SUPPLIERS — Supplier Directory
     * ================================================================
     *
     * URL:
     * /customer/suppliers
     *
     * Displays approved suppliers with search and category filtering.
     */
    public function index(Request $request): Response
    {
        $search = trim($request->input('search', ''));
        $category = $request->input('category', 'all');

        /*
        |--------------------------------------------------------------------------
        | Supplier Profile Query
        |--------------------------------------------------------------------------
        |
        | Only show approved suppliers.
        |
        */

        $query = SupplierProfile::query()
            ->where('status', 'approved')
            ->with([
                'user',
                'categories',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        |
        | Search business name, description, address, and user name.
        |
        */

        if ($search !== '') {
            $query->where(function ($q) use ($search) {

                $q->where(
                    'business_name',
                    'like',
                    '%'.$search.'%'
                )
                    ->orWhere(
                        'description',
                        'like',
                        '%'.$search.'%'
                    )
                    ->orWhere(
                        'address',
                        'like',
                        '%'.$search.'%'
                    )
                    ->orWhereHas(
                        'user',
                        function ($userQuery) use ($search) {
                            $userQuery->where(
                                'name',
                                'like',
                                '%'.$search.'%'
                            );
                        }
                    );
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Category Filter
        |--------------------------------------------------------------------------
        |
        | Filter by supplier category via the pivot table.
        |
        */

        if ($category !== 'all' && $category !== '') {
            $query->whereHas(
                'categories',
                function ($q) use ($category) {
                    $q->where(
                        'supplier_categories.id',
                        $category
                    );
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Load Portfolio Preview Images
        |--------------------------------------------------------------------------
        |
        | Load latest 3 published portfolio cover images per supplier for preview.
        |
        */

        $query->with([
            'user.portfolios' => function ($q) {
                $q->where('is_published', true)
                    ->latest()
                    ->limit(6);
            },
            'user.portfolios.coverImage',
            'user.portfolios.images',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Get Suppliers (Paginated)
        |--------------------------------------------------------------------------
        */

        $suppliers = $query
            ->latest()
            ->paginate(12)
            ->withQueryString();

        /*
        |--------------------------------------------------------------------------
        | Supplier Categories
        |--------------------------------------------------------------------------
        */

        $categories = SupplierCategory::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Send Data To React
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'Customer/Suppliers/Index',
            [
                'suppliers' => $suppliers,

                'categories' => $categories,

                'filters' => [
                    'search' => $search,
                    'category' => $category,
                ],
            ]
        );
    }

    /**
     * ================================================================
     * SUPPLIER PROFILE PAGE
     * ================================================================
     *
     * URL:
     * /customer/suppliers/{supplier}
     *
     * Displays a supplier's full profile: Services, Packages, Portfolio.
     */
    public function show(User $supplier): Response
    {
        /*
        |--------------------------------------------------------------------------
        | Must Be Supplier With Approved Profile
        |--------------------------------------------------------------------------
        */

        abort_if(
            $supplier->role !== 'supplier',
            404,
            'Supplier not found.'
        );

        $supplier->load([
            'supplierProfile.categories',
        ]);

        abort_if(
            ! $supplier->supplierProfile ||
            $supplier->supplierProfile->status !== 'approved',
            404,
            'Supplier not found.'
        );

        /*
        |--------------------------------------------------------------------------
        | Active Services
        |--------------------------------------------------------------------------
        */

        $services = $supplier->services()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Active Packages (with services and event category)
        |--------------------------------------------------------------------------
        */

        $packages = $supplier->packages()
            ->where('is_active', true)
            ->with([
                'services',
                'eventCategory',
            ])
            ->latest()
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Published Portfolios (with images)
        |--------------------------------------------------------------------------
        */

        $portfolios = $supplier->portfolios()
            ->where('is_published', true)
            ->with([
                'eventCategory',
                'coverImage',
                'images',
            ])
            ->latest()
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Return Supplier Profile Page
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'Customer/Suppliers/Show',
            [
                'supplier' => $supplier,

                'services' => $services,

                'packages' => $packages,

                'portfolios' => $portfolios,
            ]
        );
    }
}
