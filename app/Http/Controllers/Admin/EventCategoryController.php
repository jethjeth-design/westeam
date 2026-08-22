<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EventCategory;
use Illuminate\Http\Request;
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
            'is_active' => [
                'boolean',
            ],
        ]);

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
            'is_active' => [
                'boolean',
            ],
        ]);

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

        $eventCategory->delete();

        return redirect()
            ->route('admin.event-categories.index')
            ->with('success', 'Event category deleted successfully.');
    }
}
