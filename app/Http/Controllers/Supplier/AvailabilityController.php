<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\BookingItem;
use App\Models\SupplierUnavailability;
use App\Services\GoogleCalendarService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AvailabilityController extends Controller
{
    /**
     * Display the supplier availability management page & calendar.
     */
    public function index(Request $request): Response
    {
        $supplier = $request->user();

        // 1. Google Calendar Integration info
        $calendarAccount = $supplier->calendarAccount;
        $isGoogleConfigured = GoogleCalendarService::isConfigured();

        // 2. Booking items for this supplier (confirmed, accepted, pending)
        $bookingItems = BookingItem::with(['booking.customer'])
            ->where('supplier_id', $supplier->id)
            ->whereHas('booking', function ($q) {
                $q->whereNotIn('overall_status', ['cancelled', 'rejected']);
            })
            ->whereNotIn('status', ['cancelled', 'rejected'])
            ->get()
            ->map(function ($item) {
                $booking = $item->booking;
                $eventDate = $booking?->event_date instanceof Carbon
                    ? $booking->event_date->format('Y-m-d')
                    : (string) $booking?->event_date;

                return [
                    'id' => $item->id,
                    'booking_id' => $booking?->id,
                    'booking_reference' => $booking?->booking_reference,
                    'event_name' => $booking?->event_name,
                    'event_date' => $eventDate,
                    'event_time' => $booking?->event_time,
                    'event_location' => $booking?->event_location,
                    'guest_count' => $booking?->guest_count,
                    'item_name' => $item->item_name,
                    'item_type' => $item->item_type,
                    'unit_price' => (float) $item->unit_price,
                    'status' => $item->status,
                    'overall_status' => $booking?->overall_status,
                    'customer_name' => $booking?->customer?->name ?? 'Client',
                    'customer_email' => $booking?->customer?->email ?? 'N/A',
                    'special_requests' => $booking?->special_requests,
                    'google_calendar_event_id' => $item->google_calendar_event_id,
                    'calendar_synced_at' => $item->calendar_synced_at?->diffForHumans(),
                ];
            });

        // 3. Unavailable dates
        $unavailabilities = SupplierUnavailability::where('supplier_id', $supplier->id)
            ->orderBy('start_date', 'asc')
            ->get()
            ->map(function ($unavail) {
                $start = $unavail->start_date instanceof Carbon
                    ? $unavail->start_date->format('Y-m-d')
                    : (string) $unavail->start_date;
                $end = $unavail->end_date instanceof Carbon
                    ? $unavail->end_date->format('Y-m-d')
                    : (string) $unavail->end_date;

                return [
                    'id' => $unavail->id,
                    'start_date' => $start,
                    'end_date' => $end,
                    'reason' => $unavail->reason ?: 'Marked as Unavailable',
                    'created_at' => $unavail->created_at?->diffForHumans(),
                ];
            });

        // 4. Summary metrics
        $confirmedCount = $bookingItems->where('status', 'confirmed')->count();
        $pendingCount = $bookingItems->where('status', 'pending')->count();
        $acceptedCount = $bookingItems->where('status', 'accepted')->count();

        return Inertia::render('Supplier/Availability/Index', [
            'bookingItems' => $bookingItems,
            'unavailabilities' => $unavailabilities,
            'calendarAccount' => $calendarAccount ? [
                'is_connected' => (bool) $calendarAccount->is_connected,
                'google_email' => $calendarAccount->google_email,
                'last_synced_at' => $calendarAccount->last_synced_at?->diffForHumans(),
                'expires_at' => $calendarAccount->expires_at?->toIso8601String(),
            ] : null,
            'isGoogleConfigured' => $isGoogleConfigured,
            'metrics' => [
                'confirmedCount' => $confirmedCount,
                'pendingCount' => $pendingCount,
                'acceptedCount' => $acceptedCount,
                'unavailableBlocksCount' => $unavailabilities->count(),
            ],
        ]);
    }

    /**
     * Mark a date or date range as unavailable.
     */
    public function storeUnavailability(Request $request): RedirectResponse
    {
        $supplier = $request->user();

        $validated = $request->validate([
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string|max:255',
        ], [
            'start_date.after_or_equal' => 'Unavailable dates cannot be in the past.',
            'end_date.after_or_equal' => 'End date must be on or after the start date.',
        ]);

        $startDate = $validated['start_date'];
        $endDate = $validated['end_date'];

        // Existing booking restriction: cannot mark unavailable if confirmed/accepted bookings already exist in this window
        $hasConflictingBooking = BookingItem::where('supplier_id', $supplier->id)
            ->whereIn('status', ['confirmed', 'accepted'])
            ->whereHas('booking', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('event_date', [$startDate, $endDate])
                    ->whereNotIn('overall_status', ['cancelled', 'rejected']);
            })
            ->with('booking')
            ->first();

        if ($hasConflictingBooking) {
            $booking = $hasConflictingBooking->booking;
            $conflictingDate = $booking->event_date instanceof Carbon ? $booking->event_date->format('M d, Y') : $booking->event_date;

            return back()->with('error', "Cannot mark as unavailable: You already have a confirmed booking ('{$booking->event_name}') scheduled on {$conflictingDate}.");
        }

        SupplierUnavailability::create([
            'supplier_id' => $supplier->id,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'reason' => $validated['reason'] ?? null,
        ]);

        return back()->with('success', 'Unavailable date range has been marked successfully.');
    }

    /**
     * Remove an unavailable date block.
     */
    public function destroyUnavailability(Request $request, SupplierUnavailability $unavailability): RedirectResponse
    {
        if ($unavailability->supplier_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        $unavailability->delete();

        return back()->with('success', 'Unavailable date entry removed successfully.');
    }
}
