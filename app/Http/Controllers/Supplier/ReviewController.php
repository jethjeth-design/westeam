<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    /**
     * Display customer reviews received for this supplier's services and packages.
     */
    public function index(Request $request): Response
    {
        $supplier = $request->user();

        $search = trim($request->input('search', ''));
        $rating = $request->input('rating', 'all');
        $status = $request->input('status', 'all');

        $query = Review::with([
            'customer',
            'booking',
            'bookingItem',
        ])->where('supplier_id', $supplier->id);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('item_name', 'like', "%{$search}%")
                    ->orWhere('comment', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($cq) use ($search) {
                        $cq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($rating !== 'all' && is_numeric($rating)) {
            $query->where('rating', (int) $rating);
        }

        if ($status !== 'all' && in_array($status, ['approved', 'pending', 'rejected'])) {
            $query->where('status', $status);
        }

        $reviews = $query->latest()->paginate(10)->withQueryString();

        // Calculate comprehensive stats for this supplier
        $allSupplierReviews = Review::where('supplier_id', $supplier->id)->get();
        $approvedReviews = $allSupplierReviews->where('status', 'approved');

        $ratingStats = [
            'average' => $approvedReviews->count() > 0 ? round($approvedReviews->avg('rating'), 1) : 0.0,
            'count' => $approvedReviews->count(),
            'distribution' => [
                5 => $approvedReviews->where('rating', 5)->count(),
                4 => $approvedReviews->where('rating', 4)->count(),
                3 => $approvedReviews->where('rating', 3)->count(),
                2 => $approvedReviews->where('rating', 2)->count(),
                1 => $approvedReviews->where('rating', 1)->count(),
            ],
        ];

        $counts = [
            'total' => $allSupplierReviews->count(),
            'approved' => $approvedReviews->count(),
            'pending' => $allSupplierReviews->where('status', 'pending')->count(),
            'rejected' => $allSupplierReviews->where('status', 'rejected')->count(),
        ];

        return Inertia::render('Supplier/Reviews/Index', [
            'reviews' => $reviews,
            'ratingStats' => $ratingStats,
            'counts' => $counts,
            'filters' => [
                'search' => $search,
                'rating' => $rating,
                'status' => $status,
            ],
        ]);
    }
}
