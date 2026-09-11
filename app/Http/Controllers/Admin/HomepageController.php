<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HomepageBanner;
use App\Models\HomepageSection;
use App\Models\HomepageSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomepageController extends Controller
{
    /**
     * Display the Homepage Management dashboard.
     */
    public function index(): Response
    {
        $banners = HomepageBanner::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $sections = HomepageSection::query()
            ->orderBy('sort_order')
            ->get();

        $settings = HomepageSetting::query()
            ->pluck('value', 'key');

        return Inertia::render('Admin/Homepage/Index', [
            'banners' => $banners,
            'sections' => $sections,
            'settings' => $settings,
        ]);
    }

    /**
     * Store a newly created banner.
     */
    public function storeBanner(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:1000',
            'badge' => 'nullable|string|max:255',
            'image_url' => 'required|string|max:2000',
            'button_text' => 'nullable|string|max:100',
            'button_url' => 'nullable|string|max:255',
            'secondary_button_text' => 'nullable|string|max:100',
            'secondary_button_url' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        if (! isset($validated['sort_order'])) {
            $validated['sort_order'] = (HomepageBanner::max('sort_order') ?? 0) + 1;
        }

        HomepageBanner::create($validated);

        return back()->with('success', 'Banner created successfully.');
    }

    /**
     * Update the specified banner.
     */
    public function updateBanner(Request $request, HomepageBanner $banner): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:1000',
            'badge' => 'nullable|string|max:255',
            'image_url' => 'required|string|max:2000',
            'button_text' => 'nullable|string|max:100',
            'button_url' => 'nullable|string|max:255',
            'secondary_button_text' => 'nullable|string|max:100',
            'secondary_button_url' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $banner->update($validated);

        return back()->with('success', 'Banner updated successfully.');
    }

    /**
     * Remove the specified banner.
     */
    public function destroyBanner(HomepageBanner $banner): RedirectResponse
    {
        $banner->delete();

        return back()->with('success', 'Banner deleted successfully.');
    }

    /**
     * Toggle active status of a banner.
     */
    public function toggleBanner(HomepageBanner $banner): RedirectResponse
    {
        $banner->update([
            'is_active' => ! $banner->is_active,
        ]);

        return back()->with('success', 'Banner status updated.');
    }

    /**
     * Reorder banners.
     */
    public function reorderBanners(Request $request): RedirectResponse
    {
        $request->validate([
            'ordered_ids' => 'required|array',
            'ordered_ids.*' => 'integer|exists:homepage_banners,id',
        ]);

        foreach ($request->ordered_ids as $index => $id) {
            HomepageBanner::where('id', $id)->update(['sort_order' => $index + 1]);
        }

        return back()->with('success', 'Banner order updated successfully.');
    }

    /**
     * Update section details.
     */
    public function updateSection(Request $request, HomepageSection $section): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:1000',
            'content' => 'nullable|array',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $section->update($validated);

        return back()->with('success', 'Section updated successfully.');
    }

    /**
     * Toggle section visibility.
     */
    public function toggleSection(HomepageSection $section): RedirectResponse
    {
        $section->update([
            'is_active' => ! $section->is_active,
        ]);

        return back()->with('success', 'Section visibility updated.');
    }

    /**
     * Update general homepage settings, highlights, and buttons.
     */
    public function updateSettings(Request $request): RedirectResponse
    {
        $data = $request->except(['_token']);

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                HomepageSetting::set($key, $value, 'json');
            } else {
                HomepageSetting::set($key, (string) $value, 'text');
            }
        }

        return back()->with('success', 'Homepage content and button settings saved successfully.');
    }
}
