<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\EventCategory;
use App\Models\PortfolioImage;
use App\Models\SupplierPortfolio;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    /**
     * Display a listing of the supplier's portfolios.
     */
    public function index(Request $request): Response
    {
        $supplierId = Auth::id();

        $query = SupplierPortfolio::with([
            'eventCategory',
            'coverImage',
            'images',
        ])
            ->where('supplier_id', $supplierId);

        // Search by title, client name, or location
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('client_name', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('event_category_id', $request->category);
        }

        // Filter by status (published, draft, featured)
        if ($request->filled('status')) {
            if ($request->status === 'published') {
                $query->where('is_published', true);
            } elseif ($request->status === 'draft') {
                $query->where('is_published', false);
            } elseif ($request->status === 'featured') {
                $query->where('is_featured', true);
            }
        }

        $portfolios = $query->latest()->get();

        $categories = EventCategory::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Supplier/Portfolio/Index', [
            'portfolios' => $portfolios,
            'categories' => $categories,
            'filters' => [
                'search' => $request->search ?? '',
                'category' => $request->category ?? 'all',
                'status' => $request->status ?? 'all',
            ],
        ]);
    }

    /**
     * Show the form for creating a new portfolio project.
     */
    public function create(): Response
    {
        $categories = EventCategory::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Supplier/Portfolio/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created portfolio in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'event_category_id' => [
                'nullable',
                Rule::exists('event_categories', 'id')->where('is_active', true),
            ],
            'description' => 'nullable|string',
            'video_url' => 'nullable|string|max:1000',
            'video_file' => 'nullable|file|mimes:mp4,mov,avi,webm,ogg|max:51200',
            'event_date' => 'nullable|date',
            'client_name' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp,gif|max:5120',
            'cover_index' => 'nullable|integer|min:0',
            'captions' => 'nullable|array',
            'captions.*' => 'nullable|string|max:255',
        ]);

        $supplierId = Auth::id();

        $videoUrl = $validated['video_url'] ?? null;
        if ($request->hasFile('video_file')) {
            $videoPath = $request->file('video_file')->store("portfolios/{$supplierId}/videos", 'public');
            $videoUrl = '/storage/'.$videoPath;
        }

        $portfolio = SupplierPortfolio::create([
            'supplier_id' => $supplierId,
            'event_category_id' => $validated['event_category_id'] ?? null,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'video_url' => $videoUrl,
            'event_date' => $validated['event_date'] ?? null,
            'client_name' => $validated['client_name'] ?? null,
            'location' => $validated['location'] ?? null,
            'is_featured' => $validated['is_featured'] ?? false,
            'is_published' => $validated['is_published'] ?? true,
        ]);

        // Process uploaded images
        if ($request->hasFile('images')) {
            $files = $request->file('images');
            $coverIndex = isset($validated['cover_index']) ? (int) $validated['cover_index'] : 0;
            $captions = $validated['captions'] ?? [];

            foreach ($files as $index => $file) {
                $path = $file->store("portfolios/{$supplierId}", 'public');

                PortfolioImage::create([
                    'supplier_portfolio_id' => $portfolio->id,
                    'image_path' => $path,
                    'caption' => $captions[$index] ?? null,
                    'is_cover' => ($index === $coverIndex),
                    'sort_order' => $index,
                ]);
            }
        }

        return redirect()
            ->route('supplier.portfolio.show', $portfolio->id)
            ->with('success', 'Portfolio project created successfully.');
    }

    /**
     * Display the specified supplier portfolio project (in-dashboard preview).
     */
    public function show(SupplierPortfolio $portfolio): Response
    {
        $this->authorizePortfolio($portfolio);

        $portfolio->load([
            'images',
            'eventCategory',
            'supplier.supplierProfile',
        ]);

        return Inertia::render('Supplier/Portfolio/Show', [
            'portfolio' => $portfolio,
        ]);
    }

    /**
     * Show the form for editing the specified portfolio.
     */
    public function edit(SupplierPortfolio $portfolio): Response
    {
        $this->authorizePortfolio($portfolio);

        $portfolio->load([
            'images',
            'eventCategory',
        ]);

        $categories = EventCategory::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Supplier/Portfolio/Edit', [
            'portfolio' => $portfolio,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified portfolio in storage.
     */
    public function update(Request $request, SupplierPortfolio $portfolio): RedirectResponse
    {
        $this->authorizePortfolio($portfolio);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'event_category_id' => [
                'nullable',
                Rule::exists('event_categories', 'id')->where('is_active', true),
            ],
            'description' => 'nullable|string',
            'video_url' => 'nullable|string|max:1000',
            'video_file' => 'nullable|file|mimes:mp4,mov,avi,webm,ogg|max:51200',
            'clear_video' => 'nullable|boolean',
            'event_date' => 'nullable|date',
            'client_name' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
            'cover_image_id' => 'nullable|integer',
            'deleted_image_ids' => 'nullable|array',
            'deleted_image_ids.*' => 'integer',
            'existing_captions' => 'nullable|array',
            'new_images' => 'nullable|array',
            'new_images.*' => 'image|mimes:jpg,jpeg,png,webp,gif|max:5120',
            'new_captions' => 'nullable|array',
            'new_captions.*' => 'nullable|string|max:255',
        ]);

        $supplierId = Auth::id();

        $videoUrl = $portfolio->video_url;
        if ($request->boolean('clear_video')) {
            $videoUrl = null;
        } elseif ($request->hasFile('video_file')) {
            $videoPath = $request->file('video_file')->store("portfolios/{$supplierId}/videos", 'public');
            $videoUrl = '/storage/'.$videoPath;
        } elseif (array_key_exists('video_url', $validated)) {
            $videoUrl = $validated['video_url'];
        }

        // Update portfolio details
        $portfolio->update([
            'event_category_id' => $validated['event_category_id'] ?? null,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'video_url' => $videoUrl,
            'event_date' => $validated['event_date'] ?? null,
            'client_name' => $validated['client_name'] ?? null,
            'location' => $validated['location'] ?? null,
            'is_featured' => $validated['is_featured'] ?? false,
            'is_published' => $validated['is_published'] ?? false,
        ]);

        // Delete requested images
        if (! empty($validated['deleted_image_ids'])) {
            $imagesToDelete = PortfolioImage::where('supplier_portfolio_id', $portfolio->id)
                ->whereIn('id', $validated['deleted_image_ids'])
                ->get();

            foreach ($imagesToDelete as $img) {
                if ($img->image_path && Storage::disk('public')->exists($img->image_path)) {
                    Storage::disk('public')->delete($img->image_path);
                }
                $img->delete();
            }
        }

        // Update captions for existing images
        if (! empty($validated['existing_captions'])) {
            foreach ($validated['existing_captions'] as $imageId => $caption) {
                PortfolioImage::where('supplier_portfolio_id', $portfolio->id)
                    ->where('id', $imageId)
                    ->update(['caption' => $caption]);
            }
        }

        // Store new uploaded images
        $currentMaxSort = (int) $portfolio->images()->max('sort_order');
        if ($request->hasFile('new_images')) {
            $newFiles = $request->file('new_images');
            $newCaptions = $validated['new_captions'] ?? [];

            foreach ($newFiles as $idx => $file) {
                $path = $file->store("portfolios/{$supplierId}", 'public');
                $sort = $currentMaxSort + $idx + 1;

                PortfolioImage::create([
                    'supplier_portfolio_id' => $portfolio->id,
                    'image_path' => $path,
                    'caption' => $newCaptions[$idx] ?? null,
                    'is_cover' => false,
                    'sort_order' => $sort,
                ]);
            }
        }

        // Handle cover image selection
        if (! empty($validated['cover_image_id'])) {
            $chosenCoverId = (int) $validated['cover_image_id'];
            PortfolioImage::where('supplier_portfolio_id', $portfolio->id)
                ->update(['is_cover' => false]);

            PortfolioImage::where('supplier_portfolio_id', $portfolio->id)
                ->where('id', $chosenCoverId)
                ->update(['is_cover' => true]);
        }

        // Ensure at least one image is cover if any images exist
        $hasCover = $portfolio->images()->where('is_cover', true)->exists();
        if (! $hasCover) {
            $firstImage = $portfolio->images()->orderBy('sort_order')->orderBy('id')->first();
            if ($firstImage) {
                $firstImage->update(['is_cover' => true]);
            }
        }

        return redirect()
            ->route('supplier.portfolio.index')
            ->with('success', 'Portfolio project updated successfully.');
    }

    /**
     * Remove the specified portfolio from storage.
     */
    public function destroy(SupplierPortfolio $portfolio): RedirectResponse
    {
        $this->authorizePortfolio($portfolio);

        // Delete all associated files from storage
        $images = $portfolio->images()->get();
        foreach ($images as $image) {
            if ($image->image_path && Storage::disk('public')->exists($image->image_path)) {
                Storage::disk('public')->delete($image->image_path);
            }
        }

        $portfolio->delete();

        return redirect()
            ->route('supplier.portfolio.index')
            ->with('success', 'Portfolio project deleted successfully.');
    }

    /**
     * Delete a single image from a portfolio.
     */
    public function deleteImage(SupplierPortfolio $portfolio, PortfolioImage $image): RedirectResponse
    {
        $this->authorizePortfolio($portfolio);

        if ($image->supplier_portfolio_id !== $portfolio->id) {
            abort(403);
        }

        if ($image->image_path && Storage::disk('public')->exists($image->image_path)) {
            Storage::disk('public')->delete($image->image_path);
        }

        $wasCover = $image->is_cover;
        $image->delete();

        if ($wasCover) {
            $first = $portfolio->images()->first();
            if ($first) {
                $first->update(['is_cover' => true]);
            }
        }

        return back()->with('success', 'Image removed successfully.');
    }

    /**
     * Set a specific image as the cover image.
     */
    public function setCoverImage(SupplierPortfolio $portfolio, PortfolioImage $image): RedirectResponse
    {
        $this->authorizePortfolio($portfolio);

        if ($image->supplier_portfolio_id !== $portfolio->id) {
            abort(403);
        }

        PortfolioImage::where('supplier_portfolio_id', $portfolio->id)
            ->update(['is_cover' => false]);

        $image->update(['is_cover' => true]);

        return back()->with('success', 'Cover photo updated.');
    }

    /**
     * Ensure the authenticated supplier owns this portfolio.
     */
    private function authorizePortfolio(SupplierPortfolio $portfolio): void
    {
        abort_if(
            $portfolio->supplier_id !== Auth::id(),
            403,
            'Unauthorized access to this portfolio.'
        );
    }
}
