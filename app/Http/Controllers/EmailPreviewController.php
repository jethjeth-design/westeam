<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EmailPreviewController extends Controller
{
    /**
     * Preview branded email notifications directly in browser.
     */
    public function show(Request $request, string $template = 'index'): Response
    {
        // Construct realistic mock user & supplier
        $customer = new User([
            'id' => 101,
            'name' => 'Sophia Montgomery',
            'email' => 'sophia.montgomery@example.com',
            'role' => 'customer',
        ]);

        $supplier = new User([
            'id' => 202,
            'name' => 'Alexander Hayes',
            'email' => 'alexander@hayesphotography.com',
            'role' => 'supplier',
        ]);
        $supplier->setRelation('supplierProfile', (object) [
            'business_name' => 'Hayes Visuals & Fine Art Photography',
            'status' => 'approved',
        ]);

        $coordinator = new User([
            'id' => 303,
            'name' => 'Claire Del Rosario',
            'email' => 'claire@westeamevents.com',
            'role' => 'supplier',
        ]);

        // Construct mock team
        $team = new Team([
            'id' => 1,
            'name' => 'Luxe Wedding Ensemble & Decor',
            'coordinator_id' => $coordinator->id,
        ]);
        $team->setRelation('coordinator', $coordinator);

        // Construct mock booking
        $booking = new Booking([
            'id' => 88,
            'booking_reference' => 'BK-LUXE-20261024',
            'customer_id' => $customer->id,
            'booking_type' => 'team_package',
            'team_id' => 1,
            'event_name' => 'Sophia & Ethan’s Grand Wedding Gala',
            'event_date' => now()->addDays(45),
            'event_time' => '3:30 PM - 11:00 PM',
            'event_location' => 'The Glasshouse Pavilion, Tagaytay City',
            'guest_count' => 180,
            'special_requests' => 'Please coordinate arrival by 1:00 PM for pre-ceremony drone coverage and bridal makeup setup.',
            'total_amount' => 145000.00,
            'overall_status' => 'pending',
        ]);
        $booking->setRelation('customer', $customer);
        $booking->setRelation('team', $team);

        // Construct mock booking items
        $item1 = new BookingItem([
            'id' => 1,
            'booking_id' => $booking->id,
            'supplier_id' => $supplier->id,
            'item_type' => 'package',
            'item_id' => 10,
            'item_name' => 'Full Day Cinematic Wedding Photography & 4K Drone',
            'unit_price' => 65000.00,
            'status' => 'pending',
        ]);
        $item1->setRelation('supplier', $supplier);
        $item1->setRelation('booking', $booking);

        $item2 = new BookingItem([
            'id' => 2,
            'booking_id' => $booking->id,
            'supplier_id' => $coordinator->id,
            'item_type' => 'service',
            'item_id' => 12,
            'item_name' => 'Luxury Floral Styling & Grand Ballroom Canopy',
            'unit_price' => 80000.00,
            'status' => 'pending',
        ]);
        $item2->setRelation('supplier', $coordinator);
        $item2->setRelation('booking', $booking);

        $booking->setRelation('items', collect([$item1, $item2]));

        return match ($template) {
            'new-booking-customer' => response()->view('emails.new-booking', [
                'booking' => $booking,
                'bookingItem' => $item1,
                'recipientType' => 'customer',
                'recipientName' => $customer->name,
                'actionUrl' => url('/customer/bookings/88'),
                'subject' => "Booking Request Confirmation: {$booking->event_name} [{$booking->booking_reference}]",
            ]),

            'new-booking-supplier' => response()->view('emails.new-booking', [
                'booking' => $booking,
                'bookingItem' => $item1,
                'recipientType' => 'supplier',
                'recipientName' => $supplier->name,
                'actionUrl' => url('/supplier/bookings'),
                'subject' => "New Booking Request: {$booking->event_name} [{$booking->booking_reference}]",
            ]),

            'booking-accepted' => response()->view('emails.booking-accepted', [
                'booking' => $booking,
                'bookingItem' => $item1,
                'status' => 'accepted',
                'responseNotes' => 'Thank you for choosing Hayes Visuals! We are thrilled to capture your special day in Tagaytay. Our team will arrive at 1:00 PM.',
                'recipientName' => $customer->name,
                'actionUrl' => url('/customer/bookings/88'),
                'subject' => "✓ Booking Confirmed: {$booking->event_name} - {$item1->item_name}",
            ]),

            'booking-rejected' => response()->view('emails.booking-rejected', [
                'booking' => $booking,
                'bookingItem' => $item1,
                'status' => 'rejected',
                'rejectionReason' => 'We are fully booked for another wedding ceremony on this date. We sincerely apologize for the inconvenience and wish you the best with your celebration!',
                'recipientName' => $customer->name,
                'actionUrl' => url('/customer/suppliers'),
                'subject' => "Booking Request Declined: {$booking->event_name} - {$item1->item_name}",
            ]),

            'booking-cancelled' => response()->view('emails.booking-cancelled', [
                'booking' => $booking,
                'bookingItem' => $item1,
                'status' => 'cancelled',
                'recipientName' => $supplier->name,
                'actionUrl' => url('/supplier/bookings'),
                'subject' => "Booking Cancelled: {$booking->event_name} [{$booking->booking_reference}]",
            ]),

            'team-booking' => response()->view('emails.team-booking', [
                'booking' => $booking,
                'role' => 'coordinator',
                'recipientName' => $coordinator->name,
                'actionUrl' => url('/supplier/bookings'),
                'subject' => "👥 Team Package Reservation: {$booking->event_name} [{$booking->booking_reference}]",
            ]),

            'review-reminder' => response()->view('emails.review-reminder', [
                'booking' => $booking,
                'bookingItem' => $item1,
                'recipientName' => $customer->name,
                'actionUrl' => url('/customer/bookings/88'),
                'subject' => '⭐ How was your event? Share your review for Hayes Visuals',
            ]),

            default => response(
                '<div style="min-height: 100vh; background-color: #F8F6F2; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; padding: 48px 20px;">'
                .'<div style="max-width: 680px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #EFEAE2; padding: 36px; box-shadow: 0 4px 24px rgba(0,0,0,0.04); text-align: center;">'
                .'<div style="font-size: 24px; font-weight: 800; color: #1E232F; letter-spacing: 0.5px;">EWS TEAM</div>'
                .'<div style="font-size: 11px; font-weight: 600; color: #C09D62; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px;">Email Notification Template Previews</div>'
                .'<div style="font-size: 13.5px; color: #6D7588; margin-top: 14px; margin-bottom: 28px;">Click below to preview live responsive Blade email notifications:</div>'
                .'<div style="display: grid; gap: 12px; text-align: left;">'
                .'<a href="/email-previews/new-booking-supplier" style="display: block; padding: 14px 18px; background: #FAF8F5; border: 1px solid #EFEAE2; border-radius: 10px; text-decoration: none; color: #2D3142; font-weight: 600; font-size: 14px;">📬 1. New Booking Request (Supplier with Accept / Decline actions)</a>'
                .'<a href="/email-previews/new-booking-customer" style="display: block; padding: 14px 18px; background: #FAF8F5; border: 1px solid #EFEAE2; border-radius: 10px; text-decoration: none; color: #2D3142; font-weight: 600; font-size: 14px;">✉️ 2. New Booking Submitted (Customer Confirmation)</a>'
                .'<a href="/email-previews/booking-accepted" style="display: block; padding: 14px 18px; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; text-decoration: none; color: #166534; font-weight: 600; font-size: 14px;">✓ 3. Booking Accepted & Confirmed (with Supplier notes)</a>'
                .'<a href="/email-previews/booking-rejected" style="display: block; padding: 14px 18px; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px; text-decoration: none; color: #991B1B; font-weight: 600; font-size: 14px;">✕ 4. Booking Declined / Rejected (with Rejection Reason)</a>'
                .'<a href="/email-previews/booking-cancelled" style="display: block; padding: 14px 18px; background: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 10px; text-decoration: none; color: #374151; font-weight: 600; font-size: 14px;">🚫 5. Booking Cancelled</a>'
                .'<a href="/email-previews/team-booking" style="display: block; padding: 14px 18px; background: #FAF8F5; border: 1px solid #EFEAE2; border-radius: 10px; text-decoration: none; color: #2D3142; font-weight: 600; font-size: 14px;">👥 6. Team Package Multi-Supplier Reservation</a>'
                .'<a href="/email-previews/review-reminder" style="display: block; padding: 14px 18px; background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; text-decoration: none; color: #92400E; font-weight: 600; font-size: 14px;">⭐ 7. Post-Event Supplier Review & Rating Reminder</a>'
                .'</div>'
                .'</div>'
                .'</div>'
            ),
        };
    }
}
