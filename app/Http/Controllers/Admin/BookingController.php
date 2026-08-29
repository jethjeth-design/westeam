<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with([
            'customer:id,name,email',
            'items.supplier:id,name',
        ]);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('booking_reference', 'like', "%{$search}%")
                    ->orWhere('event_name', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn ($q2) => $q2->where('name', 'like', "%{$search}%"));
            });
        }

        if ($status = $request->input('status')) {
            $query->where('overall_status', $status);
        }

        if ($type = $request->input('type')) {
            $query->where('booking_type', $type);
        }

        $bookings = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => $bookings,
            'filters' => $request->only(['search', 'status', 'type']),
        ]);
    }
}
