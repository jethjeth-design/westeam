<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Get supplier profile
        $supplierProfile = $user->supplierProfile()
            ->with('categories')
            ->first();

        return Inertia::render('Supplier/Dashboard', [
            'supplierProfile' => $supplierProfile,
        ]);
    }
}
