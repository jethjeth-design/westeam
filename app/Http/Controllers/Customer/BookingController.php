<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Package;
use App\Models\Service;
use App\Models\SupplierUnavailability;
use App\Models\Team;
use App\Models\User;
use App\Notifications\BookingStatusUpdatedNotification;
use App\Notifications\BookingSubmittedNotification;
use App\Notifications\TeamBookingNotification;
use App\Services\GoogleCalendarService;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
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
            'items.supplier.paymentSetting',
            'items.payments',
            'team.coordinator.supplierProfile',
            'team.coordinator.paymentSetting',
            'payments.supplier.supplierProfile',
            'payments.bookingItem',
        ])
            ->where('customer_id', $user->id)
            ->latest()
            ->paginate(10);

        // Upcoming Event metrics
        $upcomingBooking = Booking::with([
            'items.supplier.supplierProfile',
            'items.supplier.paymentSetting',
            'items.payments',
            'team.coordinator.supplierProfile',
            'team.coordinator.paymentSetting',
            'payments.supplier.supplierProfile',
        ])
            ->where('customer_id', $user->id)
            ->where('event_date', '>=', now()->toDateString())
            ->whereIn('overall_status', ['pending', 'accepted', 'confirmed'])
            ->orderBy('event_date', 'asc')
            ->first();

        return Inertia::render('Customer/Bookings/Index', [
            'bookings' => $bookings,
            'upcomingBooking' => $upcomingBooking,
        ]);
    }

    /**
     * Show booking creation page.
     */
    public function create(Request $request): Response
    {
        $serviceId = $request->input('service_id');
        $packageId = $request->input('package_id');
        $supplierId = $request->input('supplier_id');

        $initialItem = null;
        $bookingType = 'service';
        $teamId = null;

        if ($serviceId) {
            $service = Service::with('supplier.supplierProfile')
                ->where('is_active', true)
                ->whereHas('supplier.supplierProfile', fn ($q) => $q->where('status', 'approved'))
                ->find($serviceId);

            if ($service) {
                $initialItem = [
                    'supplier_id' => $service->supplier_id,
                    'item_type' => 'service',
                    'item_id' => $service->id,
                    'item_name' => $service->name,
                    'unit_price' => (float) $service->price,
                    'supplier_name' => $service->supplier?->supplierProfile?->business_name ?? $service->supplier?->name,
                    'category' => $service->category,
                ];
                $bookingType = 'service';
            }
        } elseif ($packageId) {
            $package = Package::with(['supplier.supplierProfile', 'team.coordinator.supplierProfile'])
                ->where('is_active', true)
                ->where(function ($q) {
                    $q->whereHas('supplier.supplierProfile', fn ($sq) => $sq->where('status', 'approved'))
                        ->orWhereHas('team.coordinator.supplierProfile', fn ($tq) => $tq->where('status', 'approved'));
                })
                ->find($packageId);

            if ($package) {
                $isTeam = ! empty($package->team_id);
                $supplierUser = $package->supplier_id ? $package->supplier : $package->team?->coordinator;
                $initialItem = [
                    'supplier_id' => $supplierUser?->id,
                    'item_type' => $isTeam ? 'team_package' : 'package',
                    'item_id' => $package->id,
                    'item_name' => $package->name,
                    'unit_price' => (float) $package->price,
                    'supplier_name' => $isTeam
                        ? ($package->team?->name.' (Coordinated by '.($supplierUser?->supplierProfile?->business_name ?? $supplierUser?->name).')')
                        : ($supplierUser?->supplierProfile?->business_name ?? $supplierUser?->name),
                    'team_id' => $package->team_id,
                ];
                $bookingType = $isTeam ? 'team_package' : 'supplier_package';
                $teamId = $package->team_id;
            }
        } elseif ($supplierId) {
            $supplier = User::with('supplierProfile')
                ->where('role', 'supplier')
                ->whereHas('supplierProfile', fn ($q) => $q->where('status', 'approved'))
                ->find($supplierId);

            if ($supplier) {
                $initialItem = [
                    'supplier_id' => $supplier->id,
                    'supplier_name' => $supplier->supplierProfile?->business_name ?? $supplier->name,
                ];
            }
        }

        // Fetch active services and packages for easy addition
        $availableServices = Service::with('supplier.supplierProfile')
            ->where('is_active', true)
            ->whereHas('supplier.supplierProfile', fn ($q) => $q->where('status', 'approved'))
            ->orderBy('name')
            ->limit(50)
            ->get();

        $availablePackages = Package::with(['supplier.supplierProfile', 'team.coordinator.supplierProfile'])
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereHas('supplier.supplierProfile', fn ($sq) => $sq->where('status', 'approved'))
                    ->orWhereHas('team.coordinator.supplierProfile', fn ($tq) => $tq->where('status', 'approved'));
            })
            ->latest()
            ->limit(30)
            ->get();

        return Inertia::render('Customer/Bookings/Create', [
            'initialItem' => $initialItem,
            'defaultBookingType' => $bookingType,
            'defaultTeamId' => $teamId,
            'availableServices' => $availableServices,
            'availablePackages' => $availablePackages,
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

        // Validate supplier availability and prevent overlapping confirmed bookings
        $eventDate = Carbon::parse($validated['event_date'])->format('Y-m-d');
        $supplierIds = collect($validated['items'])->pluck('supplier_id')->unique();

        foreach ($supplierIds as $supplierId) {
            $supplier = User::find($supplierId);
            if (! $supplier) {
                continue;
            }

            // 1. Check if supplier has marked this date as unavailable
            $unavailability = SupplierUnavailability::where('supplier_id', $supplierId)
                ->where('start_date', '<=', $eventDate)
                ->where('end_date', '>=', $eventDate)
                ->first();

            if ($unavailability) {
                $reasonText = $unavailability->reason ? " ({$unavailability->reason})" : '';
                throw ValidationException::withMessages([
                    'event_date' => "Supplier '{$supplier->name}' is marked as unavailable on {$eventDate}{$reasonText}. Please select a different date.",
                ]);
            }

            // 2. Check if supplier already has a confirmed or accepted booking on this date
            $hasExistingBooking = BookingItem::where('supplier_id', $supplierId)
                ->whereIn('status', ['confirmed', 'accepted'])
                ->whereHas('booking', function ($q) use ($eventDate) {
                    $q->where('event_date', $eventDate)
                        ->whereNotIn('overall_status', ['cancelled', 'rejected']);
                })
                ->exists();

            if ($hasExistingBooking) {
                throw ValidationException::withMessages([
                    'event_date' => "Supplier '{$supplier->name}' already has a confirmed event on {$eventDate}. Overlapping bookings are not allowed.",
                ]);
            }
        }

        $booking = DB::transaction(function () use ($validated, $request) {
            $total = collect($validated['items'])->sum('unit_price');
            $ref = 'BK-'.strtoupper(Str::random(4)).'-'.date('Ymd');

            $teamId = $validated['team_id'] ?? null;
            $bookingType = $validated['booking_type'];

            // Auto-resolve team_id and booking_type if any item is linked to a team package
            if (! $teamId) {
                foreach ($validated['items'] as $item) {
                    if (! empty($item['item_id'])) {
                        $pkg = Package::find($item['item_id']);
                        if ($pkg && $pkg->team_id) {
                            $teamId = $pkg->team_id;
                            $bookingType = 'team_package';
                            break;
                        }
                    }
                }
            }

            if ($teamId && $bookingType !== 'team_package') {
                $bookingType = 'team_package';
            }

            $booking = Booking::create([
                'booking_reference' => $ref,
                'customer_id' => $request->user()->id,
                'booking_type' => $bookingType,
                'team_id' => $teamId,
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
            if ($bookingType === 'team_package' && ! empty($teamId)) {
                $team = Team::with('coordinator')->find($teamId);
                if ($team && $team->coordinator && $team->coordinator->id !== $request->user()->id) {
                    try {
                        $team->coordinator->notify(new TeamBookingNotification($booking, 'coordinator'));
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

            // Notify Admin of important booking activity
            NotificationService::notifyAdminBookingActivity(
                $booking,
                "New booking request submitted by {$request->user()->name}"
            );

            return $booking;
        });

        return redirect()->route('customer.bookings.index')
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
            'team.coordinator.paymentSetting',
            'items.supplier.supplierProfile',
            'items.supplier.paymentSetting',
            'items.review',
            'items.payments',
            'payments.supplier',
            'payments.verifier',
            'payments.bookingItem',
        ]);

        $booking->append(['verified_amount', 'remaining_balance', 'payment_status']);

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

            // Notify suppliers & clean up Google Calendar events
            $calendarService = app(GoogleCalendarService::class);
            foreach ($booking->items as $item) {
                if ($item->supplier) {
                    try {
                        $item->supplier->notify(new BookingStatusUpdatedNotification($booking, $item, 'cancelled'));
                    } catch (\Throwable $e) {
                        logger()->error('Cancellation notice error: '.$e->getMessage());
                    }
                }

                try {
                    $calendarService->removeBookingItem($item);
                } catch (\Throwable $e) {
                    logger()->error('Calendar event removal error: '.$e->getMessage());
                }
            }

            // Customer confirmation & Admin activity
            NotificationService::notifyCustomerBookingCancelled($booking);
            NotificationService::notifyAdminBookingActivity($booking, "Booking cancelled by {$request->user()->name}");
        });

        return back()->with('success', 'Booking has been cancelled.');
    }
}
