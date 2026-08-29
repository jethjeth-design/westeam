<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    /**
     * Display a listing of all customer reviews for admin moderation.
     */
    public function index(Request $request): Response
    {
        $search = trim($request->input('search', ''));
        $rating = $request->input('rating', 'all');
        $status = $request->input('status', 'all');

        $query = Review::with([
            'customer',
            'supplier.supplierProfile',
            'booking',
        ]);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('item_name', 'like', "%{$search}%")
                    ->orWhere('comment', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($cq) use ($search) {
                        $cq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('supplier', function ($sq) use ($search) {
                        $sq->where('name', 'like', "%{$search}%")
                            ->orWhereHas('supplierProfile', function ($spq) use ($search) {
                                $spq->where('business_name', 'like', "%{$search}%");
                            });
                    });
            });
        }

        if ($rating !== 'all' && is_numeric($rating)) {
            $query->where('rating', (int) $rating);
        }

        if ($status !== 'all' && in_array($status, ['approved', 'pending', 'rejected'])) {
            $query->where('status', $status);
        }

        $reviews = $query->latest()->paginate(15)->withQueryString();

        $stats = [
            'total' => Review::count(),
            'approved' => Review::where('status', 'approved')->count(),
            'pending' => Review::where('status', 'pending')->count(),
            'rejected' => Review::where('status', 'rejected')->count(),
            'average_rating' => round(Review::where('status', 'approved')->avg('rating') ?? 0, 1),
        ];

        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => $reviews,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'rating' => $rating,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Approve a review.
     */
    public function approve(Review $review): RedirectResponse
    {
        $review->update(['status' => 'approved']);

        return back()->with('success', 'Review has been approved and is now visible to customers.');
    }

    /**
     * Reject a review.
     */
    public function reject(Review $review): RedirectResponse
    {
        $review->update(['status' => 'rejected']);

        return back()->with('success', 'Review has been rejected and hidden from public profiles.');
    }

    /**
     * Delete a review.
     */
    public function destroy(Review $review): RedirectResponse
    {
        $review->delete();

        return back()->with('success', 'Review has been permanently removed.');
    }
}
