<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\SupplierPaymentSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PaymentSettingsController extends Controller
{
    /**
     * Show the supplier GCash payment settings form.
     */
    public function index(Request $request): Response
    {
        $supplier = $request->user();

        $settings = SupplierPaymentSetting::firstOrCreate(
            ['supplier_id' => $supplier->id],
            [
                'gcash_name' => $supplier->supplierProfile?->business_name ?? $supplier->name,
                'gcash_number' => $supplier->supplierProfile?->contact_number ?? '',
                'downpayment_percentage' => 20,
                'is_active' => true,
            ]
        );

        return Inertia::render('Supplier/PaymentSettings', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update the supplier GCash payment settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $supplier = $request->user();

        $validated = $request->validate([
            'gcash_name' => 'required|string|max:100',
            'gcash_number' => 'required|string|max:30',
            'downpayment_percentage' => 'required|integer|min:5|max:100',
            'is_active' => 'required|boolean',
            'instructions' => 'nullable|string|max:1000',
            'gcash_qr' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $settings = SupplierPaymentSetting::firstOrCreate(
            ['supplier_id' => $supplier->id]
        );

        $qrPath = $settings->gcash_qr_path;

        if ($request->hasFile('gcash_qr')) {
            if ($qrPath && Storage::disk('public')->exists($qrPath)) {
                Storage::disk('public')->delete($qrPath);
            }

            $qrPath = $request->file('gcash_qr')->store('gcash-qr', 'public');
        }

        $settings->update([
            'gcash_name' => $validated['gcash_name'],
            'gcash_number' => $validated['gcash_number'],
            'downpayment_percentage' => $validated['downpayment_percentage'],
            'is_active' => $validated['is_active'],
            'instructions' => $validated['instructions'] ?? null,
            'gcash_qr_path' => $qrPath,
        ]);

        return back()->with('success', 'GCash payment settings updated successfully!');
    }
}
