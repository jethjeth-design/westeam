<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupplierCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierCategoryController extends Controller
{
    public function index()
    {
        $categories = SupplierCategory::all();

        return Inertia::render(
            'Admin/SupplierCategories/Index',
            [
                'categories' => $categories,
            ]
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:supplier_categories,name',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'is_active' => [
                'boolean',
            ],
        ]);

        SupplierCategory::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with(
            'success',
            'Supplier category created successfully.'
        );
    }

    public function update(
        Request $request,
        SupplierCategory $supplierCategory
    ) {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:supplier_categories,name,'.
                    $supplierCategory->id,
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'is_active' => [
                'boolean',
            ],
        ]);

        $supplierCategory->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? false,
        ]);

        return back()->with(
            'success',
            'Supplier category updated successfully.'
        );
    }

    public function destroy(
        SupplierCategory $supplierCategory
    ) {

        $supplierCategory->delete();

        return back()->with(
            'success',
            'Supplier category deleted successfully.'
        );
    }
}
