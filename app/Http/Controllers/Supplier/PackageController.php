<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\EventCategory;
use App\Models\Package;
use App\Models\Service;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PackageController extends Controller
{
    /**
     * Display supplier packages.
     */
    public function index()
    {
        $supplierId = auth()->id();

        $allPackages = Package::with([
            'services',
            'eventCategory',
            'team:id,name,coordinator_id',
        ])
            ->where('supplier_id', $supplierId)
            ->latest()
            ->get();

        // Solo packages (no team attached)
        $soloPackages = $allPackages->whereNull('team_id')->values();

        // Team packages (coordinator only sees their own)
        $teamPackages = $allPackages->whereNotNull('team_id')->values();

        $services = Service::where('supplier_id', $supplierId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $categories = EventCategory::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Supplier/Packages/Index', [
            'packages' => $allPackages,
            'soloPackages' => $soloPackages,
            'teamPackages' => $teamPackages,
            'services' => $services,
            'categories' => $categories,
        ]);
    }

    /**
     * Show create package form.
     */
    public function create(Request $request)
    {
        $supplierId = auth()->id();

        // Own services
        $services = Service::where('supplier_id', $supplierId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Coordinated active teams
        $teams = Team::with([
            'acceptedMembers.supplier.services' => function ($q) {
                $q->where('is_active', true);
            },
            'acceptedMembers.supplier.supplierProfile',
        ])
            ->where('coordinator_id', $supplierId)
            ->where('status', 'active')
            ->get();

        $categories = EventCategory::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $selectedTeamId = $request->query('team_id');

        return Inertia::render('Supplier/Packages/Create', [
            'services' => $services,
            'teams' => $teams,
            'selectedTeamId' => $selectedTeamId,
            'categories' => $categories,
        ]);
    }

    /**
     * Store new package.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'team_id' => 'nullable|exists:teams,id',
            'event_category_id' => [
                'required',
                Rule::exists('event_categories', 'id')
                    ->where('is_active', true),
            ],
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'inclusions' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            'service_ids' => 'nullable|array',
            'service_ids.*' => 'integer|exists:services,id',
            'is_active' => 'nullable|boolean',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('packages', 'public');
        }

        $package = Package::create([
            'supplier_id' => auth()->id(),
            'team_id' => $validated['team_id'] ?? null,
            'event_category_id' => $validated['event_category_id'],
            'name' => $validated['name'],
            'price' => $validated['price'],
            'description' => $validated['description'] ?? null,
            'inclusions' => $validated['inclusions'] ?? null,
            'image_path' => $imagePath ? '/storage/'.$imagePath : null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        // If team_id is provided, allow services from coordinator and accepted team members
        if (! empty($validated['team_id'])) {
            $team = Team::with('acceptedMembers')->findOrFail($validated['team_id']);
            abort_if($team->coordinator_id !== auth()->id(), 403);

            $allowedSupplierIds = $team->acceptedMembers->pluck('supplier_id')->push(auth()->id())->unique();

            $serviceIds = Service::whereIn('supplier_id', $allowedSupplierIds)
                ->whereIn('id', $validated['service_ids'] ?? [])
                ->pluck('id');
        } else {
            $serviceIds = Service::where('supplier_id', auth()->id())
                ->whereIn('id', $validated['service_ids'] ?? [])
                ->pluck('id');
        }

        $package->services()->sync($serviceIds);

        return redirect()
            ->route('supplier.packages.index')
            ->with('success', 'Package created successfully.');
    }

    /**
     * Show edit form.
     */
    public function edit(Package $package)
    {
        $this->authorizePackage($package);

        $package->load(['services', 'eventCategory', 'team']);

        $supplierId = auth()->id();

        $services = Service::where('supplier_id', $supplierId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $teams = Team::with([
            'acceptedMembers.supplier.services' => function ($q) {
                $q->where('is_active', true);
            },
            'acceptedMembers.supplier.supplierProfile',
        ])
            ->where('coordinator_id', $supplierId)
            ->where('status', 'active')
            ->get();

        $categories = EventCategory::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Supplier/Packages/Edit', [
            'package' => $package,
            'services' => $services,
            'teams' => $teams,
            'categories' => $categories,
        ]);
    }

    /**
     * Update package.
     */
    public function update(Request $request, Package $package)
    {
        $this->authorizePackage($package);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'team_id' => 'nullable|exists:teams,id',
            'event_category_id' => [
                'required',
                Rule::exists('event_categories', 'id')
                    ->where('is_active', true),
            ],
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'inclusions' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            'service_ids' => 'nullable|array',
            'service_ids.*' => 'integer|exists:services,id',
            'is_active' => 'nullable|boolean',
        ]);

        $data = [
            'team_id' => $validated['team_id'] ?? null,
            'event_category_id' => $validated['event_category_id'],
            'name' => $validated['name'],
            'price' => $validated['price'],
            'description' => $validated['description'] ?? null,
            'inclusions' => $validated['inclusions'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ];

        if ($request->hasFile('image')) {
            if ($package->image_path && str_starts_with($package->image_path, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $package->image_path);
                Storage::disk('public')->delete($oldPath);
            }
            $imagePath = $request->file('image')->store('packages', 'public');
            $data['image_path'] = '/storage/'.$imagePath;
        }

        $package->update($data);

        // Sync services with team member validation if team attached
        if (! empty($validated['team_id'])) {
            $team = Team::with('acceptedMembers')->findOrFail($validated['team_id']);
            abort_if($team->coordinator_id !== auth()->id(), 403);

            $allowedSupplierIds = $team->acceptedMembers->pluck('supplier_id')->push(auth()->id())->unique();

            $serviceIds = Service::whereIn('supplier_id', $allowedSupplierIds)
                ->whereIn('id', $validated['service_ids'] ?? [])
                ->pluck('id');
        } else {
            $serviceIds = Service::where('supplier_id', auth()->id())
                ->whereIn('id', $validated['service_ids'] ?? [])
                ->pluck('id');
        }

        $package->services()->sync($serviceIds);

        return redirect()
            ->route('supplier.packages.index')
            ->with('success', 'Package updated successfully.');
    }

    /**
     * Delete package.
     */
    public function destroy(Package $package)
    {
        $this->authorizePackage($package);

        if ($package->image_path && str_starts_with($package->image_path, '/storage/')) {
            $oldPath = str_replace('/storage/', '', $package->image_path);
            Storage::disk('public')->delete($oldPath);
        }

        $package->delete();

        return redirect()
            ->route('supplier.packages.index')
            ->with('success', 'Package deleted successfully.');
    }

    /**
     * Make sure supplier can only access their own packages.
     */
    private function authorizePackage(Package $package)
    {
        abort_if(
            $package->supplier_id !== Auth::id(),
            403
        );
    }
}
