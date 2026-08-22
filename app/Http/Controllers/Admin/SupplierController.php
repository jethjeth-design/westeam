<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupplierProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    /**
     * Display suppliers.
     */
    public function index(Request $request)
    {
        $query = SupplierProfile::with([
            'user',
            'categories',
        ]);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $suppliers = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Suppliers/Index', [
            'suppliers' => $suppliers,
            'filters' => [
                'search' => $request->search ?? '',
                'status' => $request->status ?? 'all',
            ],
        ]);
    }

    /**
     * View supplier details.
     */
    public function show(SupplierProfile $supplier)
    {
        $supplier->load([
            'user',
            'categories',
        ]);

        return Inertia::render('Admin/Suppliers/Show', [
            'supplier' => $supplier,
        ]);
    }

    /**
     * Approve supplier.
     */
    public function approve(SupplierProfile $supplier)
    {
        $supplier->update([
            'status' => 'approved',
        ]);

        return back()->with(
            'success',
            'Supplier approved successfully.'
        );
    }

    /**
     * Reject supplier.
     */
    public function reject(Request $request, SupplierProfile $supplier)
    {
        $validated = $request->validate([
            'rejection_reason' => 'nullable|string|max:1000',
        ]);

        $supplier->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'] ?? null,
        ]);

        return back()->with(
            'success',
            'Supplier rejected successfully.'
        );
    }
}
