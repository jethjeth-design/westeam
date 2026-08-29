<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\BookingItem;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    /**
     * Store a newly created review from a customer for a completed booking item.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'booking_item_id' => [
                'required',
                'integer',
                'exists:booking_items,id',
            ],
            'rating' => [
                'required',
                'integer',
                'min:1',
                'max:5',
            ],
            'comment' => [
                'required',
                'string',
                'min:3',
                'max:2000',
            ],
        ]);

        $bookingItem = BookingItem::with(['booking', 'supplier'])->findOrFail($validated['booking_item_id']);

        // Verify the customer owns this booking
        if ($bookingItem->booking->customer_id !== $request->user()->id) {
            abort(403, 'Unauthorized. You can only review your own bookings.');
        }

        // Verify booking item is completed
        $isCompleted = $bookingItem->status === 'completed' || $bookingItem->booking->overall_status === 'completed';
        if (! $isCompleted) {
            throw ValidationException::withMessages([
                'error' => 'You can only review services or packages from completed bookings.',
            ]);
        }

        // Verify that this booking item has not been reviewed yet (prevent duplicate reviews)
        if (Review::where('booking_item_id', $bookingItem->id)->exists()) {
            throw ValidationException::withMessages([
                'error' => 'You have already submitted a review for this booking item.',
            ]);
        }

        Review::create([
            'booking_id' => $bookingItem->booking_id,
            'booking_item_id' => $bookingItem->id,
            'customer_id' => $request->user()->id,
            'supplier_id' => $bookingItem->supplier_id,
            'item_type' => $bookingItem->item_type,
            'item_id' => $bookingItem->item_id,
            'item_name' => $bookingItem->item_name,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'status' => 'approved',
        ]);

        return back()->with('success', "Thank you! Your review for '{$bookingItem->item_name}' has been successfully submitted.");
    }
}
