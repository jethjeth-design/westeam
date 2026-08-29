<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\SupplierCategory;
use App\Models\SupplierPortfolio;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SettingsController extends Controller
{
    /**
     * Show supplier settings.
     */
    public function index()
    {
        $user = Auth::user();

        /*
        |--------------------------------------------------------------------------
        | Get Supplier Business Profile
        |--------------------------------------------------------------------------
        */

        $profile = $user
            ->supplierProfile()
            ->with('categories')
            ->first();

        /*
        |--------------------------------------------------------------------------
        | Get Supplier Categories
        |--------------------------------------------------------------------------
        */

        $categories = SupplierCategory::where('is_active', true)
            ->orderBy('name')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Get Supplier Portfolios for preview
        |--------------------------------------------------------------------------
        */

        $portfolios = SupplierPortfolio::where('supplier_id', $user->id)
            ->with('images')
            ->latest()
            ->take(4)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Return Settings Page
        |--------------------------------------------------------------------------
        */

        return Inertia::render('Supplier/Settings/Index', [
            'profile' => $profile,

            'categories' => $categories,

            'portfolios' => $portfolios,

            // Breeze account profile
            'mustVerifyEmail' => $user instanceof MustVerifyEmail
                && ! $user->hasVerifiedEmail(),

            'status' => session('status'),
        ]);
    }
}
