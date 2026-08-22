<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\EventCategory;
use App\Models\SupplierPortfolio;
use App\Models\SupplierProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    /**
     * ================================================================
     * CUSTOMER PORTFOLIO GALLERY
     * ================================================================
     *
     * URL:
     * /customer/suppliers
     *
     * Displays published portfolio projects from approved suppliers.
     */
    public function index(Request $request): Response
    {
        $search = trim($request->input('search', ''));
        $category = $request->input('category', 'all');

        /*
        |--------------------------------------------------------------------------
        | Portfolio Query
        |--------------------------------------------------------------------------
        */

        $query = SupplierPortfolio::query()
            ->with([
                'supplier.supplierProfile.categories',
                'eventCategory',
                'coverImage',
                'images',
            ])
            ->where('is_published', true)

            // Only portfolios belonging to approved suppliers
            ->whereHas('supplier.supplierProfile', function ($q) {
                $q->where('status', 'approved');
            });

        /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        |
        | Search portfolio title/description and supplier business name.
        |
        */

        if ($search !== '') {
            $query->where(function ($q) use ($search) {

                // Portfolio title
                $q->where(
                    'title',
                    'like',
                    '%'.$search.'%'
                )

                // Portfolio description
                    ->orWhere(
                        'description',
                        'like',
                        '%'.$search.'%'
                    )

                // Supplier business name
                    ->orWhereHas(
                        'supplier.supplierProfile',
                        function ($supplierQuery) use ($search) {
                            $supplierQuery
                                ->where(
                                    'business_name',
                                    'like',
                                    '%'.$search.'%'
                                )
                                ->orWhere(
                                    'address',
                                    'like',
                                    '%'.$search.'%'
                                );
                        }
                    );
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Event Category Filter
        |--------------------------------------------------------------------------
        */

        if ($category !== 'all' && $category !== '') {
            $query->where(
                'event_category_id',
                $category
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Get Portfolio Projects
        |--------------------------------------------------------------------------
        */

        $portfolios = $query
            ->latest()
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Event Categories
        |--------------------------------------------------------------------------
        */

        $categories = EventCategory::query()
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
                'portfolios' => $portfolios,

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
     * SUPPLIER COMPLETE PORTFOLIO
     * ================================================================
     *
     * URL:
     * /customer/suppliers/{supplier}/portfolio
     */
    public function supplierPortfolio(
        Request $request,
        int|string $supplierId
    ): Response {

        /*
        |--------------------------------------------------------------------------
        | Find Supplier By USER ID
        |--------------------------------------------------------------------------
        */

        $supplier = User::query()
            ->where('id', $supplierId)
            ->where('role', 'supplier')
            ->with([
                'supplierProfile.categories',
            ])
            ->first();

        /*
        |--------------------------------------------------------------------------
        | Fallback: Supplier Profile ID
        |--------------------------------------------------------------------------
        */

        if (! $supplier) {

            $profile = SupplierProfile::query()
                ->where('id', $supplierId)
                ->where('status', 'approved')
                ->with([
                    'user',
                    'categories',
                ])
                ->firstOrFail();

            $supplier = $profile->user;

            $supplier->load([
                'supplierProfile.categories',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Supplier Must Be Approved
        |--------------------------------------------------------------------------
        */

        abort_if(
            ! $supplier ||
            ! $supplier->supplierProfile ||
            $supplier->supplierProfile->status !== 'approved',
            404,
            'Supplier not found.'
        );

        /*
        |--------------------------------------------------------------------------
        | Portfolio Query
        |--------------------------------------------------------------------------
        */

        $query = SupplierPortfolio::query()
            ->with([
                'eventCategory',
                'coverImage',
                'images',
            ])
            ->where(
                'supplier_id',
                $supplier->id
            )
            ->where(
                'is_published',
                true
            );

        /*
        |--------------------------------------------------------------------------
        | Event Category Filter
        |--------------------------------------------------------------------------
        */

        if (
            $request->filled('category') &&
            $request->category !== 'all'
        ) {
            $query->where(
                'event_category_id',
                $request->category
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Get Supplier Portfolios
        |--------------------------------------------------------------------------
        */

        $portfolios = $query
            ->latest()
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Get Categories Used By Supplier
        |--------------------------------------------------------------------------
        */

        $categoryIds = SupplierPortfolio::query()
            ->where(
                'supplier_id',
                $supplier->id
            )
            ->where(
                'is_published',
                true
            )
            ->whereNotNull(
                'event_category_id'
            )
            ->pluck(
                'event_category_id'
            )
            ->unique();

        $categories = EventCategory::query()
            ->whereIn(
                'id',
                $categoryIds
            )
            ->where(
                'is_active',
                true
            )
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Return Supplier Portfolio Page
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'Customer/Suppliers/Portfolio',
            [
                'supplier' => $supplier,

                'portfolios' => $portfolios,

                'categories' => $categories,

                'selectedCategory' => $request->input(
                    'category',
                    'all'
                ),
            ]
        );
    }

    /**
     * ================================================================
     * SINGLE PORTFOLIO PROJECT
     * ================================================================
     *
     * URL:
     * /customer/portfolios/{portfolio}
     */
    public function show(
        SupplierPortfolio $portfolio
    ): Response {

        /*
        |--------------------------------------------------------------------------
        | Only Published Portfolio Can Be Viewed
        |--------------------------------------------------------------------------
        */

        abort_if(
            ! $portfolio->is_published,
            404
        );

        /*
        |--------------------------------------------------------------------------
        | Load Everything Needed
        |--------------------------------------------------------------------------
        */

        $portfolio->load([
            'supplier.supplierProfile.categories',
            'eventCategory',
            'images',
            'coverImage',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Supplier Must Be Approved
        |--------------------------------------------------------------------------
        */

        abort_if(
            ! $portfolio->supplier ||
            ! $portfolio->supplier->supplierProfile ||
            $portfolio
                ->supplier
                ->supplierProfile
                ->status !== 'approved',
            404
        );

        /*
        |--------------------------------------------------------------------------
        | Related Portfolio Projects
        |--------------------------------------------------------------------------
        */

        $relatedPortfolios = SupplierPortfolio::query()
            ->with([
                'coverImage',
                'eventCategory',
            ])
            ->where(
                'supplier_id',
                $portfolio->supplier_id
            )
            ->where(
                'id',
                '!=',
                $portfolio->id
            )
            ->where(
                'is_published',
                true
            )
            ->latest()
            ->take(6)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Return Project Page
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'Customer/Portfolio/Show',
            [
                'portfolio' => $portfolio,

                'relatedPortfolios' => $relatedPortfolios,
            ]
        );
    }
}
