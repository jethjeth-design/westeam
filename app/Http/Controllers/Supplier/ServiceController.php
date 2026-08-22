<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\EventCategory;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ServiceController extends Controller
{
    /**
     * Display supplier's services.
     */
    public function index()
    {
        $supplierId = Auth::id();

        $services = Service::where('supplier_id', $supplierId)
            ->latest()
            ->get();

        $categories = EventCategory::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Supplier/Services/Index', [
            'services' => $services,
            'categories' => $categories,
        ]);
    }

    /**
     * Show create service page.
     */
    public function create()
    {
        return redirect()->route('supplier.services.index');
    }

    /**
     * Store a new service.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'category' => [
                'nullable',
                'string',
                'max:255',
            ],
            'price' => [
                'required',
                'numeric',
                'min:0',
            ],
            'description' => [
                'nullable',
                'string',
                'max:2000',
            ],
            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,webp,gif',
                'max:5120',
            ],
            'is_active' => [
                'nullable',
                'boolean',
            ],
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('services', 'public');
        }

        Service::create([
            'supplier_id' => Auth::id(),
            'name' => $validated['name'],
            'category' => $validated['category'] ?? null,
            'price' => $validated['price'],
            'description' => $validated['description'] ?? null,
            'image_path' => $imagePath ? '/storage/'.$imagePath : null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()
            ->route('supplier.services.index')
            ->with('success', 'Service created successfully.');
    }

    /**
     * Show edit service page.
     */
    public function edit(Service $service)
    {
        $this->authorizeService($service);

        return redirect()->route('supplier.services.index');
    }

    /**
     * Update service.
     */
    public function update(Request $request, Service $service)
    {
        $this->authorizeService($service);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'category' => [
                'nullable',
                'string',
                'max:255',
            ],
            'price' => [
                'required',
                'numeric',
                'min:0',
            ],
            'description' => [
                'nullable',
                'string',
                'max:2000',
            ],
            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,webp,gif',
                'max:5120',
            ],
            'is_active' => [
                'nullable',
                'boolean',
            ],
        ]);

        $data = [
            'name' => $validated['name'],
            'category' => $validated['category'] ?? null,
            'price' => $validated['price'],
            'description' => $validated['description'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ];

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($service->image_path && str_starts_with($service->image_path, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $service->image_path);
                Storage::disk('public')->delete($oldPath);
            }
            $imagePath = $request->file('image')->store('services', 'public');
            $data['image_path'] = '/storage/'.$imagePath;
        }

        $service->update($data);

        return redirect()
            ->route('supplier.services.index')
            ->with('success', 'Service updated successfully.');
    }

    /**
     * Delete service.
     */
    public function destroy(Service $service)
    {
        $this->authorizeService($service);

        if ($service->image_path && str_starts_with($service->image_path, '/storage/')) {
            $oldPath = str_replace('/storage/', '', $service->image_path);
            Storage::disk('public')->delete($oldPath);
        }

        $service->delete();

        return redirect()
            ->route('supplier.services.index')
            ->with('success', 'Service deleted successfully.');
    }

    /**
     * Make sure supplier can only manage their own services.
     */
    private function authorizeService(Service $service): void
    {
        abort_if(
            $service->supplier_id !== Auth::id(),
            403,
            'You are not authorized to manage this service.'
        );
    }
}
