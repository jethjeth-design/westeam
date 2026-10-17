<?php

use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\SupplierCalendarAccount;
use App\Models\SupplierProfile;
use App\Models\SupplierUnavailability;
use App\Models\User;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    Notification::fake();
});

test('approved supplier can view their availability and calendar page', function () {
    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'business_name' => 'Elite Catering',
        'status' => 'approved',
    ]);

    $response = $this->actingAs($supplier)->get(route('supplier.availability.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Supplier/Availability/Index')
        ->has('bookingItems')
        ->has('unavailabilities')
    );
});

test('supplier can mark a date range as unavailable', function () {
    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'business_name' => 'Elite Sounds',
        'status' => 'approved',
    ]);

    $startDate = now()->addDays(10)->toDateString();
    $endDate = now()->addDays(15)->toDateString();

    $response = $this->actingAs($supplier)->post(route('supplier.availability.unavailability.store'), [
        'start_date' => $startDate,
        'end_date' => $endDate,
        'reason' => 'Annual Equipment Maintenance',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('supplier_unavailabilities', [
        'supplier_id' => $supplier->id,
        'start_date' => $startDate,
        'end_date' => $endDate,
        'reason' => 'Annual Equipment Maintenance',
    ]);
});

test('supplier cannot mark dates as unavailable if there is an existing confirmed booking in that range', function () {
    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'business_name' => 'Studio Lights',
        'status' => 'approved',
    ]);
    $customer = User::factory()->create(['role' => 'customer']);

    $eventDate = now()->addDays(12)->toDateString();

    $booking = Booking::create([
        'booking_reference' => 'BK-CONF-1234',
        'customer_id' => $customer->id,
        'booking_type' => 'service',
        'event_name' => 'Golden Wedding Anniversary',
        'event_date' => $eventDate,
        'event_location' => 'Seaside Pavilion',
        'total_amount' => 15000,
        'overall_status' => 'confirmed',
    ]);

    BookingItem::create([
        'booking_id' => $booking->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'service',
        'item_name' => 'Lighting Rig',
        'unit_price' => 15000,
        'status' => 'confirmed',
    ]);

    // Try to mark unavailable spanning the booking date
    $response = $this->actingAs($supplier)->post(route('supplier.availability.unavailability.store'), [
        'start_date' => now()->addDays(10)->toDateString(),
        'end_date' => now()->addDays(15)->toDateString(),
        'reason' => 'Vacation',
    ]);

    $response->assertSessionHas('error');
    $this->assertDatabaseMissing('supplier_unavailabilities', [
        'supplier_id' => $supplier->id,
        'reason' => 'Vacation',
    ]);
});

test('supplier can delete their unavailable date entry', function () {
    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'business_name' => 'Floral Art',
        'status' => 'approved',
    ]);

    $unavailability = SupplierUnavailability::create([
        'supplier_id' => $supplier->id,
        'start_date' => now()->addDays(20)->toDateString(),
        'end_date' => now()->addDays(22)->toDateString(),
        'reason' => 'Rest day',
    ]);

    $response = $this->actingAs($supplier)->delete(route('supplier.availability.unavailability.destroy', $unavailability->id));

    $response->assertRedirect();
    $this->assertDatabaseMissing('supplier_unavailabilities', [
        'id' => $unavailability->id,
    ]);
});

test('customer booking is rejected by server-side validation if supplier is marked unavailable', function () {
    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'business_name' => 'DJ Beats',
        'status' => 'approved',
    ]);
    $customer = User::factory()->create(['role' => 'customer']);

    $blockedDate = now()->addDays(25)->toDateString();

    SupplierUnavailability::create([
        'supplier_id' => $supplier->id,
        'start_date' => $blockedDate,
        'end_date' => $blockedDate,
        'reason' => 'Out of town gig',
    ]);

    // Customer attempts to book on the blocked date
    $response = $this->actingAs($customer)->post(route('customer.bookings.store'), [
        'booking_type' => 'service',
        'event_name' => 'Birthday Bash',
        'event_date' => $blockedDate,
        'event_location' => 'Sky Lounge',
        'items' => [
            [
                'supplier_id' => $supplier->id,
                'item_type' => 'service',
                'item_name' => 'DJ Services',
                'unit_price' => 5000,
            ],
        ],
    ]);

    $response->assertSessionHasErrors('event_date');
    $this->assertDatabaseMissing('bookings', [
        'event_name' => 'Birthday Bash',
    ]);
});

test('customer booking is rejected if supplier already has confirmed booking on that date', function () {
    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'business_name' => 'Capture Moments',
        'status' => 'approved',
    ]);
    $existingCustomer = User::factory()->create(['role' => 'customer']);
    $newCustomer = User::factory()->create(['role' => 'customer']);

    $eventDate = now()->addDays(35)->toDateString();

    $booking = Booking::create([
        'booking_reference' => 'BK-EXISTING',
        'customer_id' => $existingCustomer->id,
        'booking_type' => 'service',
        'event_name' => 'First Customer Wedding',
        'event_date' => $eventDate,
        'event_location' => 'Manila Hotel',
        'total_amount' => 20000,
        'overall_status' => 'confirmed',
    ]);

    BookingItem::create([
        'booking_id' => $booking->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'service',
        'item_name' => 'Photography',
        'unit_price' => 20000,
        'status' => 'confirmed',
    ]);

    // New customer attempts overlapping booking
    $response = $this->actingAs($newCustomer)->post(route('customer.bookings.store'), [
        'booking_type' => 'service',
        'event_name' => 'Second Wedding Request',
        'event_date' => $eventDate,
        'event_location' => 'Grand Hall',
        'items' => [
            [
                'supplier_id' => $supplier->id,
                'item_type' => 'service',
                'item_name' => 'Photography',
                'unit_price' => 20000,
            ],
        ],
    ]);

    $response->assertSessionHasErrors('event_date');
    $this->assertDatabaseMissing('bookings', [
        'event_name' => 'Second Wedding Request',
    ]);
});

test('api endpoint returns accurate availability status for suppliers on a selected date', function () {
    $supplier = User::factory()->create(['role' => 'supplier', 'name' => 'Chef Mario']);
    $blockedDate = now()->addDays(14)->toDateString();
    $availableDate = now()->addDays(16)->toDateString();

    SupplierUnavailability::create([
        'supplier_id' => $supplier->id,
        'start_date' => $blockedDate,
        'end_date' => $blockedDate,
        'reason' => 'Holiday',
    ]);

    // Check blocked date
    $responseBlocked = $this->postJson(route('api.suppliers.check-availability'), [
        'date' => $blockedDate,
        'supplier_ids' => [$supplier->id],
    ]);

    $responseBlocked->assertOk();
    $responseBlocked->assertJson([
        'all_available' => false,
        'suppliers' => [
            [
                'supplier_id' => $supplier->id,
                'status' => 'unavailable',
                'is_available' => false,
            ],
        ],
    ]);

    // Check available date
    $responseAvail = $this->postJson(route('api.suppliers.check-availability'), [
        'date' => $availableDate,
        'supplier_ids' => [$supplier->id],
    ]);

    $responseAvail->assertOk();
    $responseAvail->assertJson([
        'all_available' => true,
        'suppliers' => [
            [
                'supplier_id' => $supplier->id,
                'status' => 'available',
                'is_available' => true,
            ],
        ],
    ]);
});

test('admin can access master schedules and availability monitoring page', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->get(route('admin.schedules.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Schedules/Index')
        ->has('bookings')
        ->has('unavailabilities')
        ->has('suppliersList')
        ->has('customersList')
    );
});

test('customer or guest cannot access admin master schedules page', function () {
    $customer = User::factory()->create(['role' => 'customer']);

    $responseCustomer = $this->actingAs($customer)->get(route('admin.schedules.index'));
    $responseCustomer->assertForbidden();

    $responseGuest = $this->get(route('admin.schedules.index'));
    $responseGuest->assertRedirect(route('login'));
});
