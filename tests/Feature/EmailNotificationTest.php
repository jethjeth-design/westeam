<?php

use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Team;
use App\Models\User;
use App\Notifications\BookingStatusUpdatedNotification;
use App\Notifications\BookingSubmittedNotification;
use App\Notifications\ReviewReminderNotification;
use App\Notifications\TeamBookingNotification;

test('email preview index and all preview template routes return 200', function () {
    $templates = [
        '',
        'new-booking-customer',
        'new-booking-supplier',
        'booking-accepted',
        'booking-rejected',
        'booking-cancelled',
        'team-booking',
        'review-reminder',
    ];

    foreach ($templates as $template) {
        $url = $template ? "/email-previews/{$template}" : '/email-previews';
        $response = $this->get($url);
        $response->assertStatus(200);
    }
});

test('BookingSubmittedNotification renders new-booking email for supplier and customer', function () {
    $customer = new User(['id' => 1, 'name' => 'Maria Santos', 'email' => 'maria@example.com', 'role' => 'customer']);
    $supplier = new User(['id' => 2, 'name' => 'Juan Luna', 'email' => 'juan@example.com', 'role' => 'supplier']);

    $booking = new Booking([
        'booking_reference' => 'BK-TEST-2026',
        'customer_id' => 1,
        'booking_type' => 'supplier_package',
        'event_name' => 'Santos-Reyes Wedding Reception',
        'event_date' => '2026-11-20',
        'event_time' => '4:00 PM',
        'event_location' => 'Villa Escudero, Quezon',
        'guest_count' => 150,
        'special_requests' => 'Rustic wooden setup with warm fairy lights.',
        'total_amount' => 50000.00,
        'overall_status' => 'pending',
    ]);
    $booking->id = 99;
    $booking->setRelation('customer', $customer);

    $bookingItem = new BookingItem([
        'booking_id' => 99,
        'supplier_id' => 2,
        'item_type' => 'package',
        'item_name' => 'Premium Photo and Video Package',
        'unit_price' => 50000.00,
        'status' => 'pending',
    ]);
    $bookingItem->id = 10;
    $bookingItem->setRelation('supplier', $supplier);
    $bookingItem->setRelation('booking', $booking);

    // Supplier notification
    $supplierNotification = new BookingSubmittedNotification($booking, $bookingItem, 'supplier');
    $supplierMail = $supplierNotification->toMail($supplier);
    $supplierHtml = view($supplierMail->view, $supplierMail->viewData)->render();

    expect($supplierHtml)->toContain('EWS TEAM')
        ->toContain('BK-TEST-2026')
        ->toContain('Santos-Reyes Wedding Reception')
        ->toContain('Villa Escudero, Quezon')
        ->toContain('Accept Booking')
        ->toContain('Decline Booking')
        ->toContain('Rustic wooden setup with warm fairy lights');

    // Customer confirmation notification
    $customerNotification = new BookingSubmittedNotification($booking, $bookingItem, 'customer');
    $customerMail = $customerNotification->toMail($customer);
    $customerHtml = view($customerMail->view, $customerMail->viewData)->render();

    expect($customerHtml)->toContain('EWS TEAM')
        ->toContain('BK-TEST-2026')
        ->toContain('Maria Santos')
        ->toContain('View Booking Details');
});

test('BookingStatusUpdatedNotification renders accepted, rejected, and cancelled templates', function () {
    $customer = new User(['id' => 1, 'name' => 'David Lee', 'email' => 'david@example.com', 'role' => 'customer']);
    $supplier = new User(['id' => 2, 'name' => 'Bella Events Decor', 'email' => 'decor@bella.com', 'role' => 'supplier']);

    $booking = new Booking([
        'booking_reference' => 'BK-DEC-102',
        'customer_id' => 1,
        'event_name' => 'Lee Anniversary Gala',
        'event_date' => '2026-12-15',
        'event_location' => 'Grand Ballroom, Manila',
        'guest_count' => 100,
        'total_amount' => 75000.00,
        'overall_status' => 'accepted',
    ]);
    $booking->id = 102;
    $booking->setRelation('customer', $customer);

    $bookingItem = new BookingItem([
        'booking_id' => 102,
        'supplier_id' => 2,
        'item_type' => 'service',
        'item_name' => 'Full Hall Ceiling Drapes and Centerpieces',
        'unit_price' => 75000.00,
        'status' => 'accepted',
    ]);
    $bookingItem->id = 15;
    $bookingItem->setRelation('supplier', $supplier);
    $bookingItem->setRelation('booking', $booking);
    $bookingItem->setRelation('supplier', $supplier);
    $bookingItem->setRelation('booking', $booking);

    // 1. Accepted
    $acceptedNotification = new BookingStatusUpdatedNotification(
        $booking,
        $bookingItem,
        'accepted',
        null,
        'We look forward to creating magic for your event!'
    );
    $acceptedMail = $acceptedNotification->toMail($customer);
    $acceptedHtml = view($acceptedMail->view, $acceptedMail->viewData)->render();

    expect($acceptedHtml)->toContain('Confirmed')
        ->toContain('BK-DEC-102')
        ->toContain('We look forward to creating magic for your event!');

    // 2. Rejected
    $rejectedNotification = new BookingStatusUpdatedNotification(
        $booking,
        $bookingItem,
        'rejected',
        'Fully booked on December 15th.'
    );
    $rejectedMail = $rejectedNotification->toMail($customer);
    $rejectedHtml = view($rejectedMail->view, $rejectedMail->viewData)->render();

    expect($rejectedHtml)->toContain('Declined')
        ->toContain('Fully booked on December 15th.')
        ->toContain('Find Alternative Suppliers');

    // 3. Cancelled
    $cancelledNotification = new BookingStatusUpdatedNotification(
        $booking,
        $bookingItem,
        'cancelled'
    );
    $cancelledMail = $cancelledNotification->toMail($supplier);
    $cancelledHtml = view($cancelledMail->view, $cancelledMail->viewData)->render();

    expect($cancelledHtml)->toContain('Cancelled')
        ->toContain('BK-DEC-102');
});

test('TeamBookingNotification and ReviewReminderNotification render cleanly', function () {
    $customer = new User(['id' => 1, 'name' => 'Emma Watson', 'email' => 'emma@example.com', 'role' => 'customer']);
    $coordinator = new User(['id' => 3, 'name' => 'Elena Reyes', 'email' => 'elena@team.com', 'role' => 'supplier']);

    $team = new Team(['id' => 5, 'name' => 'All-Star Wedding Collective', 'coordinator_id' => 3]);
    $team->setRelation('coordinator', $coordinator);

    $booking = new Booking([
        'booking_reference' => 'BK-TEAM-205',
        'customer_id' => 1,
        'booking_type' => 'team_package',
        'team_id' => 5,
        'event_name' => 'Emma and Liam Nuptials',
        'event_date' => '2026-10-10',
        'event_location' => 'Balesin Island Club',
        'guest_count' => 80,
        'total_amount' => 180000.00,
        'overall_status' => 'pending',
    ]);
    $booking->id = 205;
    $booking->setRelation('customer', $customer);
    $booking->setRelation('team', $team);

    $item = new BookingItem([
        'booking_id' => 205,
        'supplier_id' => 3,
        'item_type' => 'team_package',
        'item_name' => 'Full Team Coordination and Styling',
        'unit_price' => 180000.00,
        'status' => 'completed',
    ]);
    $item->id = 31;
    $item->setRelation('supplier', $coordinator);
    $item->setRelation('booking', $booking);

    $booking->setRelation('items', collect([$item]));

    // Team notification
    $teamNotification = new TeamBookingNotification($booking, 'coordinator');
    $teamMail = $teamNotification->toMail($coordinator);
    $teamHtml = view($teamMail->view, $teamMail->viewData)->render();

    expect($teamHtml)->toContain('All-Star Wedding Collective')
        ->toContain('BK-TEAM-205')
        ->toContain('Full Team Coordination and Styling');

    // Review reminder notification
    $reviewNotification = new ReviewReminderNotification($booking, $item);
    $reviewMail = $reviewNotification->toMail($customer);
    $reviewHtml = view($reviewMail->view, $reviewMail->viewData)->render();

    expect($reviewHtml)->toContain('Rate Your Experience')
        ->toContain('Full Team Coordination and Styling')
        ->toContain('Write a Review');
});
