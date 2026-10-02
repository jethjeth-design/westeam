<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EventCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EventCategoryController extends Controller
{
    public function index()
    {
        $categories = EventCategory::withCount('packages')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/EventCategories/Index', [
            'categories' => $categories,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/EventCategories/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:event_categories,name',
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,webp,avif',
                'max:5120',
            ],
            'image_url' => [
                'nullable',
                'string',
                'max:2000',
            ],
            'is_active' => [
                'boolean',
            ],
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('event-categories', 'public');
            $validated['image_url'] = '/storage/'.$path;
        }
        unset($validated['image']);

        EventCategory::create($validated);

        return redirect()
            ->route('admin.event-categories.index')
            ->with('success', 'Event category created successfully.');
    }

    public function edit(EventCategory $eventCategory)
    {
        return Inertia::render('Admin/EventCategories/Edit', [
            'category' => $eventCategory,
        ]);
    }

    public function update(Request $request, EventCategory $eventCategory)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:event_categories,name,'.$eventCategory->id,
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,webp,avif',
                'max:5120',
            ],
            'image_url' => [
                'nullable',
                'string',
                'max:2000',
            ],
            'is_active' => [
                'boolean',
            ],
        ]);

        if ($request->hasFile('image')) {
            if ($eventCategory->image_url && str_starts_with($eventCategory->image_url, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $eventCategory->image_url);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('event-categories', 'public');
            $validated['image_url'] = '/storage/'.$path;
        }
        unset($validated['image']);

        $eventCategory->update($validated);

        return redirect()
            ->route('admin.event-categories.index')
            ->with('success', 'Event category updated successfully.');
    }

    public function destroy(EventCategory $eventCategory)
    {
        if ($eventCategory->packages()->exists()) {
            return back()->with(
                'error',
                'This category cannot be deleted because it is being used by packages.'
            );
        }

        if ($eventCategory->image_url && str_starts_with($eventCategory->image_url, '/storage/')) {
            $oldPath = str_replace('/storage/', '', $eventCategory->image_url);
            Storage::disk('public')->delete($oldPath);
        }

        $eventCategory->delete();

        return redirect()
            ->route('admin.event-categories.index')
            ->with('success', 'Event category deleted successfully.');
    }
}
