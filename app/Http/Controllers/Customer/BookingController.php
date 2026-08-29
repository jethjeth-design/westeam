<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Package;
use App\Models\Team;
use App\Models\User;
use App\Notifications\BookingSubmittedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    /**
     * Display a listing of the customer's bookings.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $bookings = Booking::with([
            'items.supplier.supplierProfile',
            'team.coordinator.supplierProfile',
        ])
            ->where('customer_id', $user->id)
            ->latest()
            ->paginate(10);

        // Upcoming Event metrics
        $upcomingBooking = Booking::with(['items.supplier'])
            ->where('customer_id', $user->id)
            ->where('event_date', '>=', now()->toDateString())
            ->whereIn('overall_status', ['pending', 'accepted'])
            ->orderBy('event_date', 'asc')
            ->first();

        return Inertia::render('Customer/Bookings/Index', [
            'bookings' => $bookings,
            'upcomingBooking' => $upcomingBooking,
        ]);
    }

    /**
     * Store a newly created booking request.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'booking_type' => 'required|in:service,supplier_package,team_package,multi_supplier',
            'event_name' => 'required|string|max:255',
            'event_date' => 'required|date|after_or_equal:today',
            'event_time' => 'nullable|string',
            'event_location' => 'required|string|max:255',
            'guest_count' => 'nullable|integer|min:1',
            'special_requests' => 'nullable|string|max:1000',
            'team_id' => 'nullable|exists:teams,id',
            'items' => 'required|array|min:1',
            'items.*.supplier_id' => 'required|exists:users,id',
            'items.*.item_type' => 'required|in:service,package,team_package',
            'items.*.item_id' => 'nullable|integer',
            'items.*.item_name' => 'required|string|max:255',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $booking = DB::transaction(function () use ($validated, $request) {
            $total = collect($validated['items'])->sum('unit_price');
            $ref = 'BK-'.strtoupper(Str::random(4)).'-'.date('Ymd');

            $booking = Booking::create([
                'booking_reference' => $ref,
                'customer_id' => $request->user()->id,
                'booking_type' => $validated['booking_type'],
                'team_id' => $validated['team_id'] ?? null,
                'event_name' => $validated['event_name'],
                'event_date' => $validated['event_date'],
                'event_time' => $validated['event_time'] ?? null,
                'event_location' => $validated['event_location'],
                'guest_count' => $validated['guest_count'] ?? null,
                'special_requests' => $validated['special_requests'] ?? null,
                'total_amount' => $total,
                'overall_status' => 'pending',
            ]);

            foreach ($validated['items'] as $itemData) {
                $bookingItem = $booking->items()->create([
                    'supplier_id' => $itemData['supplier_id'],
                    'item_type' => $itemData['item_type'],
                    'item_id' => $itemData['item_id'] ?? null,
                    'item_name' => $itemData['item_name'],
                    'unit_price' => $itemData['unit_price'],
                    'status' => 'pending',
                ]);

                // Notify supplier
                $supplier = User::find($itemData['supplier_id']);
                if ($supplier) {
                    try {
                        $supplier->notify(new BookingSubmittedNotification($booking, $bookingItem, 'supplier'));
                    } catch (\Throwable $e) {
                        // Log silently if mailer is not configured in local environment
                        logger()->error('Booking notification mail failed: '.$e->getMessage());
                    }
                }
            }

            // If Team package, notify team coordinator
            if ($validated['booking_type'] === 'team_package' && ! empty($validated['team_id'])) {
                $team = Team::with('coordinator')->find($validated['team_id']);
                if ($team && $team->coordinator && $team->coordinator->id !== $request->user()->id) {
                    try {
                        $team->coordinator->notify(new BookingSubmittedNotification($booking, null, 'coordinator'));
                    } catch (\Throwable $e) {
                        logger()->error('Coordinator notification mail failed: '.$e->getMessage());
                    }
                }
            }

            // Notify Customer confirmation
            try {
                $request->user()->notify(new BookingSubmittedNotification($booking, null, 'customer'));
            } catch (\Throwable $e) {
                logger()->error('Customer confirmation mail failed: '.$e->getMessage());
            }

            return $booking;
        });

        return redirect()->route('customer.bookings.show', $booking->id)
            ->with('success', 'Your booking request has been successfully submitted!');
    }

    /**
     * Show detailed booking and upcoming event breakdown.
     */
    public function show(Request $request, Booking $booking): Response
    {
        // Must be owner or admin
        if ($booking->customer_id !== $request->user()->id && $request->user()->role !== 'admin') {
            abort(403);
        }

        $booking->load([
            'customer',
            'team.coordinator.supplierProfile',
            'items.supplier.supplierProfile',
            'items.review',
        ]);

        return Inertia::render('Customer/Bookings/Show', [
            'booking' => $booking,
        ]);
    }

    /**
     * Customer cancel booking.
     */
    public function cancel(Request $request, Booking $booking): RedirectResponse
    {
        if ($booking->customer_id !== $request->user()->id) {
            abort(403);
        }

        if (in_array($booking->overall_status, ['completed'])) {
            return back()->with('error', 'Completed bookings cannot be cancelled.');
        }

        DB::transaction(function () use ($booking) {
            $booking->update(['overall_status' => 'cancelled']);
            $booking->items()->update(['status' => 'cancelled']);
        });

        return back()->with('success', 'Booking has been cancelled.');
    }
}
