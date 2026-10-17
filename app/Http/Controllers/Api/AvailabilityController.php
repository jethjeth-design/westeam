<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BookingItem;
use App\Models\SupplierUnavailability;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    /**
     * Get availability calendar data for a specific supplier.
     */
    public function getSupplierCalendar(User $supplier): JsonResponse
    {
        // 1. Unavailable blocks
        $unavailabilities = SupplierUnavailability::where('supplier_id', $supplier->id)
            ->get(['id', 'start_date', 'end_date', 'reason'])
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'start_date' => $item->start_date instanceof Carbon ? $item->start_date->format('Y-m-d') : (string) $item->start_date,
                    'end_date' => $item->end_date instanceof Carbon ? $item->end_date->format('Y-m-d') : (string) $item->end_date,
                    'reason' => $item->reason ?: 'Unavailable',
                ];
            });

        // 2. Confirmed & Accepted Booking Dates
        $bookedItems = BookingItem::with('booking')
            ->where('supplier_id', $supplier->id)
            ->whereIn('status', ['confirmed', 'accepted'])
            ->whereHas('booking', function ($q) {
                $q->whereNotIn('overall_status', ['cancelled', 'rejected']);
            })
            ->get()
            ->map(function ($item) {
                $booking = $item->booking;
                $dateStr = $booking?->event_date instanceof Carbon
                    ? $booking->event_date->format('Y-m-d')
                    : (string) $booking?->event_date;

                return [
                    'date' => $dateStr,
                    'status' => 'booked',
                    'event_name' => $booking?->event_name,
                ];
            })
            ->filter(fn ($item) => ! empty($item['date']))
            ->values();

        return response()->json([
            'supplier_id' => $supplier->id,
            'supplier_name' => $supplier->name,
            'unavailabilities' => $unavailabilities,
            'booked_dates' => $bookedItems,
        ]);
    }

    /**
     * Check availability for one or more suppliers on a selected date.
     */
    public function checkDate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'supplier_ids' => 'required|array|min:1',
            'supplier_ids.*' => 'required|integer|exists:users,id',
        ]);

        $date = Carbon::parse($validated['date'])->format('Y-m-d');
        $supplierIds = array_unique($validated['supplier_ids']);

        $suppliers = User::whereIn('id', $supplierIds)->get()->keyBy('id');

        $results = [];
        $allAvailable = true;

        foreach ($supplierIds as $id) {
            $supplier = $suppliers->get($id);
            if (! $supplier) {
                continue;
            }

            // Check if marked as unavailable
            $unavailability = SupplierUnavailability::where('supplier_id', $id)
                ->where('start_date', '<=', $date)
                ->where('end_date', '>=', $date)
                ->first();

            if ($unavailability) {
                $allAvailable = false;
                $results[] = [
                    'supplier_id' => $id,
                    'supplier_name' => $supplier->name,
                    'status' => 'unavailable',
                    'is_available' => false,
                    'reason' => $unavailability->reason ?: 'Marked as Unavailable',
                    'message' => "{$supplier->name} is unavailable on this date".($unavailability->reason ? " ({$unavailability->reason})" : ''),
                ];

                continue;
            }

            // Check if confirmed or accepted booking already exists
            $conflictingItem = BookingItem::where('supplier_id', $id)
                ->whereIn('status', ['confirmed', 'accepted'])
                ->whereHas('booking', function ($q) use ($date) {
                    $q->where('event_date', $date)
                        ->whereNotIn('overall_status', ['cancelled', 'rejected']);
                })
                ->first();

            if ($conflictingItem) {
                $allAvailable = false;
                $results[] = [
                    'supplier_id' => $id,
                    'supplier_name' => $supplier->name,
                    'status' => 'booked',
                    'is_available' => false,
                    'reason' => 'Already Booked',
                    'message' => "{$supplier->name} already has a confirmed event booking on this date.",
                ];

                continue;
            }

            $results[] = [
                'supplier_id' => $id,
                'supplier_name' => $supplier->name,
                'status' => 'available',
                'is_available' => true,
                'reason' => null,
                'message' => "{$supplier->name} is available!",
            ];
        }

        return response()->json([
            'date' => $date,
            'all_available' => $allAvailable,
            'suppliers' => $results,
        ]);
    }
}
