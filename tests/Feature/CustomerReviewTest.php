<?php

use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Review;
use App\Models\SupplierProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('customer can submit a verified review for a completed booking item', function () {
    $customer = User::factory()->create(['role' => 'customer']);
    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'status' => 'approved',
        'business_name' => 'Acme Photography',
    ]);

    $booking = Booking::create([
        'customer_id' => $customer->id,
        'booking_reference' => 'BK-TEST-001',
        'event_name' => 'Summer Gala',
        'event_date' => now()->addDays(5)->toDateString(),
        'event_location' => 'Grand Ballroom, Manila',
        'booking_type' => 'service',
        'overall_status' => 'completed',
        'total_amount' => 15000,
    ]);

    $bookingItem = BookingItem::create([
        'booking_id' => $booking->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'service',
        'item_id' => 1,
        'item_name' => 'Wedding Coverage',
        'unit_price' => 15000,
        'status' => 'completed',
    ]);

    $response = $this->actingAs($customer)->post(route('customer.reviews.store'), [
        'booking_id' => $booking->id,
        'booking_item_id' => $bookingItem->id,
        'rating' => 5,
        'comment' => 'Fantastic service! Photos were delivered on time and of amazing quality.',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('reviews', [
        'booking_id' => $booking->id,
        'booking_item_id' => $bookingItem->id,
        'customer_id' => $customer->id,
        'supplier_id' => $supplier->id,
        'rating' => 5,
        'comment' => 'Fantastic service! Photos were delivered on time and of amazing quality.',
        'status' => 'approved',
    ]);
});

test('customer cannot review an incomplete booking item', function () {
    $customer = User::factory()->create(['role' => 'customer']);
    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'status' => 'approved',
        'business_name' => 'DJ Beat Masters',
    ]);

    $booking = Booking::create([
        'customer_id' => $customer->id,
        'booking_reference' => 'BK-TEST-002',
        'event_name' => 'Birthday Party',
        'event_date' => now()->addDays(10)->toDateString(),
        'event_location' => 'Club House, Makati',
        'booking_type' => 'service',
        'overall_status' => 'pending',
        'total_amount' => 5000,
    ]);

    $bookingItem = BookingItem::create([
        'booking_id' => $booking->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'service',
        'item_id' => 2,
        'item_name' => 'DJ Sound System',
        'unit_price' => 5000,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($customer)->post(route('customer.reviews.store'), [
        'booking_id' => $booking->id,
        'booking_item_id' => $bookingItem->id,
        'rating' => 4,
        'comment' => 'Good sounds.',
    ]);

    $response->assertSessionHasErrors('error');
    $this->assertDatabaseMissing('reviews', [
        'booking_item_id' => $bookingItem->id,
    ]);
});

test('customer cannot submit duplicate reviews for the same booking item', function () {
    $customer = User::factory()->create(['role' => 'customer']);
    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'status' => 'approved',
        'business_name' => 'Chef Delights',
    ]);

    $booking = Booking::create([
        'customer_id' => $customer->id,
        'booking_reference' => 'BK-TEST-003',
        'event_name' => 'Corporate Night',
        'event_date' => now()->subDays(2)->toDateString(),
        'event_location' => 'BGC Taguig',
        'booking_type' => 'service',
        'overall_status' => 'completed',
        'total_amount' => 20000,
    ]);

    $bookingItem = BookingItem::create([
        'booking_id' => $booking->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'service',
        'item_id' => 3,
        'item_name' => 'Catering Buffet',
        'unit_price' => 20000,
        'status' => 'completed',
    ]);

    // Create first review
    Review::create([
        'booking_id' => $booking->id,
        'booking_item_id' => $bookingItem->id,
        'customer_id' => $customer->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'service',
        'item_id' => 3,
        'item_name' => 'Catering Buffet',
        'rating' => 5,
        'comment' => 'Delicious food!',
        'status' => 'approved',
    ]);

    // Attempt second review for same item
    $response = $this->actingAs($customer)->post(route('customer.reviews.store'), [
        'booking_id' => $booking->id,
        'booking_item_id' => $bookingItem->id,
        'rating' => 1,
        'comment' => 'Duplicate review attempt',
    ]);

    $response->assertSessionHasErrors('error');
    expect(Review::where('booking_item_id', $bookingItem->id)->count())->toBe(1);
});

test('supplier rating stats are computed accurately', function () {
    $supplier = User::factory()->create(['role' => 'supplier']);
    $customer1 = User::factory()->create(['role' => 'customer']);
    $customer2 = User::factory()->create(['role' => 'customer']);

    $booking1 = Booking::create([
        'customer_id' => $customer1->id,
        'booking_reference' => 'BK-001',
        'event_name' => 'Event 1',
        'event_date' => now()->toDateString(),
        'event_location' => 'Quezon City',
        'booking_type' => 'service',
        'overall_status' => 'completed',
        'total_amount' => 10000,
    ]);

    $item1 = BookingItem::create([
        'booking_id' => $booking1->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'service',
        'item_id' => 1,
        'item_name' => 'Service 1',
        'unit_price' => 10000,
        'status' => 'completed',
    ]);

    $booking2 = Booking::create([
        'customer_id' => $customer2->id,
        'booking_reference' => 'BK-002',
        'event_name' => 'Event 2',
        'event_date' => now()->toDateString(),
        'event_location' => 'Pasig City',
        'booking_type' => 'service',
        'overall_status' => 'completed',
        'total_amount' => 12000,
    ]);

    $item2 = BookingItem::create([
        'booking_id' => $booking2->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'service',
        'item_id' => 2,
        'item_name' => 'Service 2',
        'unit_price' => 12000,
        'status' => 'completed',
    ]);

    Review::create([
        'booking_id' => $booking1->id,
        'booking_item_id' => $item1->id,
        'customer_id' => $customer1->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'service',
        'item_id' => 1,
        'item_name' => 'Service 1',
        'rating' => 5,
        'comment' => '5 star service!',
        'status' => 'approved',
    ]);

    Review::create([
        'booking_id' => $booking2->id,
        'booking_item_id' => $item2->id,
        'customer_id' => $customer2->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'service',
        'item_id' => 2,
        'item_name' => 'Service 2',
        'rating' => 3,
        'comment' => '3 star service',
        'status' => 'approved',
    ]);

    $stats = $supplier->getRatingStats();

    expect($stats['count'])->toBe(2);
    expect($stats['average'])->toBe(4.0);
    expect($stats['distribution'][5])->toBe(1);
    expect($stats['distribution'][3])->toBe(1);
    expect($stats['distribution'][4])->toBe(0);
});

test('admin can moderate reviews', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $supplier = User::factory()->create(['role' => 'supplier']);
    $customer = User::factory()->create(['role' => 'customer']);

    $booking = Booking::create([
        'customer_id' => $customer->id,
        'booking_reference' => 'BK-MOD-001',
        'event_name' => 'Wedding',
        'event_date' => now()->toDateString(),
        'event_location' => 'Tagaytay City',
        'booking_type' => 'service',
        'overall_status' => 'completed',
        'total_amount' => 10000,
    ]);

    $item = BookingItem::create([
        'booking_id' => $booking->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'service',
        'item_id' => 1,
        'item_name' => 'Wedding Photo',
        'unit_price' => 10000,
        'status' => 'completed',
    ]);

    $review = Review::create([
        'booking_id' => $booking->id,
        'booking_item_id' => $item->id,
        'customer_id' => $customer->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'service',
        'item_id' => 1,
        'item_name' => 'Wedding Photo',
        'rating' => 2,
        'comment' => 'Inappropriate remark',
        'status' => 'pending',
    ]);

    // Admin rejects review
    $this->actingAs($admin)->post(route('admin.reviews.reject', $review->id))
        ->assertRedirect();

    expect($review->fresh()->status)->toBe('rejected');

    // Admin approves review
    $this->actingAs($admin)->post(route('admin.reviews.approve', $review->id))
        ->assertRedirect();

    expect($review->fresh()->status)->toBe('approved');

    // Admin deletes review
    $this->actingAs($admin)->delete(route('admin.reviews.destroy', $review->id))
        ->assertRedirect();

    $this->assertDatabaseMissing('reviews', ['id' => $review->id]);
});
