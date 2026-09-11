<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\EventCategory;
use App\Models\SupplierCategory;
use App\Models\SupplierPortfolio;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
    /**
     * Display public gallery page.
     */
    public function index(Request $request): Response
    {
        $search = trim($request->input('search', ''));
        $category = $request->input('category', 'all');

        $query = SupplierPortfolio::query()
            ->where('is_published', true)
            ->whereHas('supplier.supplierProfile', function ($sq) {
                $sq->where('status', 'approved');
            })
            ->with([
                'supplier.supplierProfile',
                'eventCategory',
                'images',
                'coverImage',
            ]);

        // Search query
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('location', 'like', '%'.$search.'%')
                    ->orWhereHas('supplier.supplierProfile', function ($sq) use ($search) {
                        $sq->where('business_name', 'like', '%'.$search.'%');
                    });
            });
        }

        // Category filter (match eventCategory name or supplierCategory name)
        if ($category !== 'all' && ! empty($category)) {
            $query->where(function ($q) use ($category) {
                $q->whereHas('eventCategory', function ($eq) use ($category) {
                    $eq->where('name', 'like', '%'.$category.'%');
                })
                    ->orWhereHas('supplier.supplierProfile.categories', function ($cq) use ($category) {
                        $cq->where('name', 'like', '%'.$category.'%');
                    });
            });
        }

        $portfolios = $query->latest()
            ->paginate(9)
            ->withQueryString();

        // High quality fallback stock photos for portfolios
        $stockPhotos = [
            'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1000&q=80',
        ];

        // Transform portfolios
        $portfolios->getCollection()->transform(function ($item, $idx) use ($stockPhotos) {
            $supplierProfile = $item->supplier?->supplierProfile;
            $coverUrl = $item->cover_image_url;

            if (! $coverUrl) {
                $coverUrl = $stockPhotos[$idx % count($stockPhotos)];
            }

            $allImages = $item->images->map(function ($img) {
                return [
                    'id' => $img->id,
                    'image_url' => $img->image_url,
                    'caption' => $img->caption,
                ];
            })->all();

            if (empty($allImages)) {
                $allImages = [
                    ['id' => 1, 'image_url' => $coverUrl, 'caption' => $item->title],
                ];
            }

            return [
                'id' => $item->id,
                'title' => $item->title,
                'description' => $item->description,
                'event_date' => $item->event_date?->format('M d, Y'),
                'location' => $item->location ?: 'Metro Manila',
                'video_url' => $item->video_url,
                'cover_image_url' => $coverUrl,
                'images_count' => count($allImages),
                'images' => $allImages,
                'supplier' => [
                    'id' => $item->supplier_id,
                    'business_name' => $supplierProfile?->business_name ?? 'Featured Studio',
                    'profile_picture_url' => $supplierProfile?->profile_picture_url ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                    'address' => $supplierProfile?->address,
                ],
                'event_category' => $item->eventCategory ? [
                    'id' => $item->eventCategory->id,
                    'name' => $item->eventCategory->name,
                ] : [
                    'id' => 1,
                    'name' => 'Wedding',
                ],
            ];
        });

        // Pill categories for filter bar (Photography, Videography, Decoration, Catering, Event Planner...)
        $supplierCategories = SupplierCategory::where('is_active', true)->pluck('name')->all();
        $eventCategories = EventCategory::pluck('name')->all();
        $pills = collect(['All', 'Photography', 'Videography', 'Decoration', 'Catering', 'Event Planner'])
            ->merge($supplierCategories)
            ->unique()
            ->take(8)
            ->values();

        return Inertia::render('Public/Gallery/Index', [
            'portfolios' => $portfolios,
            'pills' => $pills,
            'filters' => [
                'search' => $search,
                'category' => $category,
            ],
        ]);
    }
}
