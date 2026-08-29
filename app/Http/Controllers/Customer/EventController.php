<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $customer = $request->user();

        $bookings = Booking::with([
            'items.supplier.supplierProfile',
            'team.coordinator',
        ])
            ->where('customer_id', $customer->id)
            ->whereIn('overall_status', ['pending', 'accepted', 'completed'])
            ->orderBy('event_date', 'asc')
            ->get()
            ->map(function ($booking) {
                $eventDate = $booking->event_date ? Carbon::parse($booking->event_date) : null;
                $daysUntil = $eventDate ? now()->startOfDay()->diffInDays($eventDate->startOfDay(), false) : null;

                return [
                    'id' => $booking->id,
                    'booking_reference' => $booking->booking_reference,
                    'event_name' => $booking->event_name,
                    'event_date' => $booking->event_date,
                    'event_time' => $booking->event_time,
                    'event_location' => $booking->event_location,
                    'guest_count' => $booking->guest_count,
                    'booking_type' => $booking->booking_type,
                    'overall_status' => $booking->overall_status,
                    'total_amount' => $booking->total_amount,
                    'days_until' => $daysUntil,
                    'is_upcoming' => $daysUntil !== null && $daysUntil >= 0,
                    'items' => $booking->items->map(fn ($item) => [
                        'id' => $item->id,
                        'item_name' => $item->item_name,
                        'item_type' => $item->item_type,
                        'unit_price' => $item->unit_price,
                        'status' => $item->status,
                        'supplier' => [
                            'id' => $item->supplier?->id,
                            'name' => $item->supplier?->name,
                            'business_name' => $item->supplier?->supplierProfile?->business_name,
                            'avatar' => $item->supplier?->supplierProfile?->profile_photo,
                        ],
                    ]),
                    'team' => $booking->team ? [
                        'id' => $booking->team->id,
                        'name' => $booking->team->name,
                        'coordinator' => $booking->team->coordinator?->name,
                    ] : null,
                ];
            });

        $upcomingCount = $bookings->where('is_upcoming', true)->count();
        $totalVendors = $bookings->sum(fn ($b) => count($b['items']));

        return Inertia::render('Customer/Events/Index', [
            'events' => $bookings,
            'stats' => [
                'upcoming' => $upcomingCount,
                'total' => $bookings->count(),
                'vendors' => $totalVendors,
            ],
        ]);
    }
}
