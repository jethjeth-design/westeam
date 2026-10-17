<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\SupplierUnavailability;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    /**
     * Display the Admin Booking & Availability Monitoring Calendar.
     */
    public function index(Request $request): Response
    {
        $supplierId = $request->input('supplier_id');
        $customerId = $request->input('customer_id');
        $status = $request->input('status', 'all'); // 'all', 'confirmed', 'pending', 'accepted', 'completed', 'cancelled', 'unavailable'
        $search = $request->input('search');
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);

        // 1. Fetch Bookings Query
        $bookingQuery = Booking::with([
            'customer:id,name,email',
            'team.coordinator:id,name',
            'items.supplier.supplierProfile',
        ]);

        if ($supplierId) {
            $bookingQuery->whereHas('items', function ($q) use ($supplierId) {
                $q->where('supplier_id', $supplierId);
            });
        }

        if ($customerId) {
            $bookingQuery->where('customer_id', $customerId);
        }

        if ($status !== 'all' && $status !== 'unavailable') {
            $bookingQuery->where('overall_status', $status);
        }

        if ($search) {
            $bookingQuery->where(function ($q) use ($search) {
                $q->where('booking_reference', 'like', "%{$search}%")
                    ->orWhere('event_name', 'like', "%{$search}%")
                    ->orWhere('event_location', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn ($cq) => $cq->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('items', fn ($iq) => $iq->where('item_name', 'like', "%{$search}%"));
            });
        }

        $bookings = $bookingQuery->latest()->get()->map(function ($booking) {
            $eventDate = $booking->event_date instanceof Carbon
                ? $booking->event_date->format('Y-m-d')
                : (string) $booking->event_date;

            return [
                'type' => 'booking',
                'id' => $booking->id,
                'booking_reference' => $booking->booking_reference,
                'event_name' => $booking->event_name,
                'event_date' => $eventDate,
                'event_time' => $booking->event_time,
                'event_location' => $booking->event_location,
                'guest_count' => $booking->guest_count,
                'special_requests' => $booking->special_requests,
                'total_amount' => (float) $booking->total_amount,
                'overall_status' => $booking->overall_status,
                'booking_type' => $booking->booking_type,
                'customer' => [
                    'id' => $booking->customer?->id,
                    'name' => $booking->customer?->name ?? 'Customer',
                    'email' => $booking->customer?->email ?? 'N/A',
                ],
                'suppliers' => $booking->items->map(function ($it) {
                    return [
                        'id' => $it->supplier_id,
                        'name' => $it->supplier?->name ?? 'Supplier',
                        'business_name' => $it->supplier?->supplierProfile?->business_name,
                        'item_name' => $it->item_name,
                        'item_type' => $it->item_type,
                        'unit_price' => (float) $it->unit_price,
                        'status' => $it->status,
                        'google_calendar_synced' => ! empty($it->google_calendar_event_id),
                        'calendar_synced_at' => $it->calendar_synced_at?->diffForHumans(),
                    ];
                }),
            ];
        });

        // 2. Fetch Supplier Unavailabilities
        $unavailabilityQuery = SupplierUnavailability::with([
            'supplier:id,name,email',
            'supplier.supplierProfile:id,user_id,business_name',
        ]);

        if ($supplierId) {
            $unavailabilityQuery->where('supplier_id', $supplierId);
        }

        if ($search) {
            $unavailabilityQuery->where(function ($q) use ($search) {
                $q->where('reason', 'like', "%{$search}%")
                    ->orWhereHas('supplier', fn ($sq) => $sq->where('name', 'like', "%{$search}%"));
            });
        }

        // If status filter is set to specific booking status (not 'all' and not 'unavailable'), exclude unavailabilities
        $unavailabilities = ($status === 'all' || $status === 'unavailable')
            ? $unavailabilityQuery->orderBy('start_date')->get()->map(function ($unavail) {
                $start = $unavail->start_date instanceof Carbon
                    ? $unavail->start_date->format('Y-m-d')
                    : (string) $unavail->start_date;
                $end = $unavail->end_date instanceof Carbon
                    ? $unavail->end_date->format('Y-m-d')
                    : (string) $unavail->end_date;

                return [
                    'type' => 'unavailability',
                    'id' => $unavail->id,
                    'supplier_id' => $unavail->supplier_id,
                    'supplier_name' => $unavail->supplier?->name ?? 'Supplier',
                    'business_name' => $unavail->supplier?->supplierProfile?->business_name,
                    'start_date' => $start,
                    'end_date' => $end,
                    'reason' => $unavail->reason ?: 'Marked as Unavailable',
                    'created_at' => $unavail->created_at?->toFormattedDateString(),
                ];
            })
            : collect([]);

        // 3. Dropdown filter options
        $suppliersList = User::where('role', 'supplier')
            ->select('id', 'name')
            ->with('supplierProfile:id,user_id,business_name')
            ->orderBy('name')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->supplierProfile?->business_name ? "{$s->name} ({$s->supplierProfile->business_name})" : $s->name,
            ]);

        $customersList = User::where('role', 'customer')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        // 4. Summary counts
        $totalBookingsCount = Booking::count();
        $confirmedBookingsCount = Booking::where('overall_status', 'confirmed')->count();
        $pendingBookingsCount = Booking::where('overall_status', 'pending')->count();
        $unavailableBlocksCount = SupplierUnavailability::count();

        return Inertia::render('Admin/Schedules/Index', [
            'bookings' => $bookings,
            'unavailabilities' => $unavailabilities,
            'suppliersList' => $suppliersList,
            'customersList' => $customersList,
            'filters' => [
                'supplier_id' => $supplierId ? (int) $supplierId : null,
                'customer_id' => $customerId ? (int) $customerId : null,
                'status' => $status,
                'search' => $search,
                'month' => (int) $month,
                'year' => (int) $year,
            ],
            'metrics' => [
                'totalBookings' => $totalBookingsCount,
                'confirmedBookings' => $confirmedBookingsCount,
                'pendingBookings' => $pendingBookingsCount,
                'unavailableBlocks' => $unavailableBlocksCount,
            ],
        ]);
    }
}
