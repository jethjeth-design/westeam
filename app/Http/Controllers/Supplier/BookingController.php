<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingItem;
use App\Notifications\BookingStatusUpdatedNotification;
use App\Notifications\ReviewReminderNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    /**
     * Display bookings assigned to this supplier or teams they coordinate.
     */
    public function index(Request $request): Response
    {
        $supplier = $request->user();

        // Individual item requests for this supplier (strictly exclude all team_package bookings and team items)
        $items = BookingItem::with([
            'booking.customer',
            'booking.team.coordinator',
        ])
            ->where('supplier_id', $supplier->id)
            ->where('item_type', '!=', 'team_package')
            ->whereHas('booking', function ($q) {
                $q->where('booking_type', '!=', 'team_package')
                    ->whereNull('team_id');
            })
            ->latest()
            ->paginate(15);

        // Coordinated Team Bookings (where user is coordinator of the booked team or a participating supplier)
        $teamBookings = Booking::with([
            'customer',
            'team.coordinator.supplierProfile',
            'team.members.supplier.supplierProfile',
            'items.supplier.supplierProfile',
        ])
            ->where(function ($query) {
                $query->where('booking_type', 'team_package')
                    ->orWhereNotNull('team_id')
                    ->orWhereHas('items', function ($itemQ) {
                        $itemQ->where('item_type', 'team_package');
                    });
            })
            ->where(function ($query) use ($supplier) {
                $query->whereHas('team', function ($q) use ($supplier) {
                    $q->where('coordinator_id', $supplier->id);
                })
                    ->orWhereHas('items', function ($q) use ($supplier) {
                        $q->where('supplier_id', $supplier->id);
                    });
            })
            ->latest()
            ->get();

        return Inertia::render('Supplier/Bookings/Index', [
            'bookingItems' => $items,
            'teamBookings' => $teamBookings,
        ]);
    }

    /**
     * Supplier accepts a booking request item.
     */
    public function accept(Request $request, BookingItem $item): RedirectResponse
    {
        if ($item->supplier_id !== $request->user()->id) {
            abort(403, 'Unauthorized booking item access.');
        }

        if ($item->status !== 'pending') {
            return back()->with('error', 'Only pending bookings can be accepted.');
        }

        DB::transaction(function () use ($item) {
            $item->update([
                'status' => 'accepted',
                'responded_at' => now(),
            ]);

            $booking = $item->booking;
            $booking->recalculateStatus();

            // Notify Customer
            try {
                $booking->customer->notify(new BookingStatusUpdatedNotification($booking, $item, 'accepted'));
            } catch (\Throwable $e) {
                logger()->error('Status update notification error: '.$e->getMessage());
            }
        });

        return back()->with('success', "You have accepted the booking for '{$item->item_name}'.");
    }

    /**
     * Supplier rejects a booking request item with a rejection reason.
     */
    public function reject(Request $request, BookingItem $item): RedirectResponse
    {
        if ($item->supplier_id !== $request->user()->id) {
            abort(403, 'Unauthorized booking item access.');
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        DB::transaction(function () use ($item, $validated) {
            $item->update([
                'status' => 'rejected',
                'rejection_reason' => $validated['rejection_reason'],
                'responded_at' => now(),
            ]);

            $booking = $item->booking;
            $booking->recalculateStatus();

            // Notify Customer
            try {
                $booking->customer->notify(new BookingStatusUpdatedNotification(
                    $booking,
                    $item,
                    'rejected',
                    $validated['rejection_reason']
                ));
            } catch (\Throwable $e) {
                logger()->error('Status update notification error: '.$e->getMessage());
            }
        });

        return back()->with('success', 'Booking request has been declined.');
    }

    /**
     * Mark booking item as completed.
     */
    public function complete(Request $request, BookingItem $item): RedirectResponse
    {
        if ($item->supplier_id !== $request->user()->id) {
            abort(403);
        }

        DB::transaction(function () use ($item) {
            $item->update([
                'status' => 'completed',
            ]);

            $booking = $item->booking;
            $booking->recalculateStatus();

            try {
                $booking->customer->notify(new ReviewReminderNotification($booking, $item));
            } catch (\Throwable $e) {
                logger()->error('Review reminder notification error: '.$e->getMessage());
            }
        });

        return back()->with('success', 'Service marked as completed!');
    }

    /**
     * Team Coordinator accepts the entire Team Package booking.
     */
    public function acceptTeamBooking(Request $request, Booking $booking): RedirectResponse
    {
        $supplier = $request->user();

        if (! $booking->team || $booking->team->coordinator_id !== $supplier->id) {
            abort(403, 'Only the designated Team Coordinator can manage this team package booking.');
        }

        DB::transaction(function () use ($booking) {
            $booking->update(['overall_status' => 'accepted']);
            $booking->items()->update([
                'status' => 'accepted',
                'responded_at' => now(),
            ]);

            // Notify customer
            foreach ($booking->items as $item) {
                try {
                    $booking->customer->notify(new BookingStatusUpdatedNotification($booking, $item, 'accepted'));
                } catch (\Throwable $e) {
                    logger()->error('Coordinator accept notice error: '.$e->getMessage());
                }
            }
        });

        return back()->with('success', "Team Package for '{$booking->event_name}' accepted on behalf of the entire team!");
    }

    /**
     * Team Coordinator rejects the entire Team Package booking with a reason.
     */
    public function rejectTeamBooking(Request $request, Booking $booking): RedirectResponse
    {
        $supplier = $request->user();

        if (! $booking->team || $booking->team->coordinator_id !== $supplier->id) {
            abort(403, 'Only the designated Team Coordinator can manage this team package booking.');
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        DB::transaction(function () use ($booking, $validated) {
            $booking->update(['overall_status' => 'rejected']);
            $booking->items()->update([
                'status' => 'rejected',
                'rejection_reason' => $validated['rejection_reason'],
                'responded_at' => now(),
            ]);

            foreach ($booking->items as $item) {
                try {
                    $booking->customer->notify(new BookingStatusUpdatedNotification(
                        $booking,
                        $item,
                        'rejected',
                        $validated['rejection_reason']
                    ));
                } catch (\Throwable $e) {
                    logger()->error('Coordinator reject notice error: '.$e->getMessage());
                }
            }
        });

        return back()->with('success', 'Team package booking has been declined.');
    }
}
