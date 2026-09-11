<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\EventCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    /**
     * Display public event categories page.
     */
    public function index(Request $request): Response
    {
        // Event categories with count of active packages and portfolios
        $categories = EventCategory::query()
            ->withCount([
                'packages' => function ($q) {
                    $q->where('is_active', true);
                },
                'portfolios' => function ($q) {
                    $q->where('is_published', true);
                },
            ])
            ->orderBy('id')
            ->get();

        // High quality curated stock photos and taglines for major event categories matching the design mockup
        $categoryDetails = [
            'wedding' => [
                'tagline' => 'Celebrate your love',
                'image' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
            ],
            'birthday' => [
                'tagline' => 'Make it memorable',
                'image' => 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
            ],
            'debut' => [
                'tagline' => 'A milestone to remember',
                'image' => 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80',
            ],
            'funeral' => [
                'tagline' => 'Honoring their legacy',
                'image' => 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80',
            ],
            'corporate' => [
                'tagline' => 'Build stronger connections',
                'image' => 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
            ],
            'anniversary' => [
                'tagline' => 'Cherish the moments',
                'image' => 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
            ],
            'other' => [
                'tagline' => 'Any special occasion',
                'image' => 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
            ],
        ];

        // Format for frontend
        $formattedCategories = $categories->map(function ($cat) use ($categoryDetails) {
            $nameLower = strtolower($cat->name);
            $matchedKey = 'other';

            if (str_contains($nameLower, 'wed')) {
                $matchedKey = 'wedding';
            } elseif (str_contains($nameLower, 'birth')) {
                $matchedKey = 'birthday';
            } elseif (str_contains($nameLower, 'debut')) {
                $matchedKey = 'debut';
            } elseif (str_contains($nameLower, 'funeral') || str_contains($nameLower, 'memorial')) {
                $matchedKey = 'funeral';
            } elseif (str_contains($nameLower, 'corp') || str_contains($nameLower, 'conference')) {
                $matchedKey = 'corporate';
            } elseif (str_contains($nameLower, 'anniv')) {
                $matchedKey = 'anniversary';
            }

            return [
                'id' => $cat->id,
                'name' => $cat->name,
                'description' => $cat->description ?: $categoryDetails[$matchedKey]['tagline'],
                'tagline' => $categoryDetails[$matchedKey]['tagline'],
                'image_url' => $cat->image_url ?: $categoryDetails[$matchedKey]['image'],
                'packages_count' => $cat->packages_count,
                'portfolios_count' => $cat->portfolios_count,
            ];
        });

        // Filter to representative top categories matching the design or unique names
        $uniqueCategories = $formattedCategories->unique(function ($item) {
            $n = strtolower($item['name']);
            if (str_contains($n, 'wed')) {
                return 'wedding';
            }
            if (str_contains($n, 'birth')) {
                return 'birthday';
            }
            if (str_contains($n, 'debut')) {
                return 'debut';
            }
            if (str_contains($n, 'funeral')) {
                return 'funeral';
            }
            if (str_contains($n, 'corp')) {
                return 'corporate';
            }
            if (str_contains($n, 'anniv')) {
                return 'anniversary';
            }

            return $n;
        })->values();

        return Inertia::render('Public/Events/Index', [
            'categories' => $uniqueCategories,
            'allCategories' => $formattedCategories,
        ]);
    }
}
