<?php

use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Payment;
use App\Models\SupplierPaymentSetting;
use App\Models\SupplierProfile;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    Notification::fake();
});

test('customer sees my bookings page with payment status calculations', function () {
    $customer = User::factory()->create(['role' => 'customer']);
    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'business_name' => 'Grand Photography',
        'status' => 'approved',
    ]);

    $booking = Booking::create([
        'booking_reference' => 'BK-TEST-0001',
        'customer_id' => $customer->id,
        'booking_type' => 'service',
        'event_name' => 'Rose & Jack Wedding',
        'event_date' => now()->addDays(30)->toDateString(),
        'event_location' => 'Grand Ballroom',
        'total_amount' => 10000.00,
        'overall_status' => 'pending',
    ]);

    $item = BookingItem::create([
        'booking_id' => $booking->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'service',
        'item_name' => 'Photography Coverage',
        'unit_price' => 10000.00,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($customer)->get(route('customer.bookings.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Customer/Bookings/Index')
        ->has('bookings.data', 1)
        ->where('bookings.data.0.payment_status', 'Unpaid')
        ->where('bookings.data.0.remaining_balance', 10000)
    );
});

test('customer can submit a gcash downpayment receipt and status becomes pending verification', function () {
    $customer = User::factory()->create(['role' => 'customer']);
    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'business_name' => 'Best DJ Services',
        'status' => 'approved',
    ]);

    SupplierPaymentSetting::create([
        'supplier_id' => $supplier->id,
        'gcash_name' => 'Best DJ Co',
        'gcash_number' => '09171234567',
        'downpayment_percentage' => 20,
        'is_active' => true,
    ]);

    $booking = Booking::create([
        'booking_reference' => 'BK-TEST-0002',
        'customer_id' => $customer->id,
        'booking_type' => 'service',
        'event_name' => 'Birthday Celebration',
        'event_date' => now()->addDays(15)->toDateString(),
        'event_location' => 'Makati City',
        'total_amount' => 5000.00,
        'overall_status' => 'accepted',
    ]);

    $item = BookingItem::create([
        'booking_id' => $booking->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'service',
        'item_name' => 'DJ Services',
        'unit_price' => 5000.00,
        'status' => 'accepted',
    ]);

    $receipt = UploadedFile::fake()->create('gcash-receipt.png', 100, 'image/png');

    $response = $this->actingAs($customer)->post(route('customer.payments.store'), [
        'booking_id' => $booking->id,
        'booking_item_id' => $item->id,
        'supplier_id' => $supplier->id,
        'payment_type' => 'downpayment',
        'amount' => 1000.00,
        'reference_number' => '1002938475819',
        'receipt' => $receipt,
        'customer_notes' => 'Downpayment sent via GCash Express Send',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('payments', [
        'booking_id' => $booking->id,
        'supplier_id' => $supplier->id,
        'customer_id' => $customer->id,
        'amount' => 1000.00,
        'reference_number' => '1002938475819',
        'status' => 'pending',
    ]);

    $booking->refresh();
    expect($booking->payment_status)->toBe('Pending Verification');
});

test('supplier verifying payment marks payment verified, booking confirmed, and adds to total revenue', function () {
    $customer = User::factory()->create(['role' => 'customer']);
    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'business_name' => 'Video Production Co',
        'status' => 'approved',
    ]);

    $booking = Booking::create([
        'booking_reference' => 'BK-TEST-0003',
        'customer_id' => $customer->id,
        'booking_type' => 'service',
        'event_name' => 'Corporate Gala',
        'event_date' => now()->addDays(20)->toDateString(),
        'event_location' => 'BGC Taguig',
        'total_amount' => 20000.00,
        'overall_status' => 'accepted',
    ]);

    $item = BookingItem::create([
        'booking_id' => $booking->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'service',
        'item_name' => 'Full Video Production',
        'unit_price' => 20000.00,
        'status' => 'accepted',
    ]);

    $payment = Payment::create([
        'booking_id' => $booking->id,
        'booking_item_id' => $item->id,
        'supplier_id' => $supplier->id,
        'customer_id' => $customer->id,
        'payment_method' => 'gcash',
        'payment_type' => 'downpayment',
        'amount' => 4000.00,
        'reference_number' => '1004829104812',
        'receipt_path' => 'receipts/test.png',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($supplier)->post(route('supplier.payments.verify', $payment->id));

    $response->assertRedirect();

    $payment->refresh();
    $booking->refresh();
    $item->refresh();

    expect($payment->status)->toBe('verified');
    expect($booking->overall_status)->toBe('confirmed');
    expect($item->status)->toBe('confirmed');
    expect($booking->verified_amount)->toBe(4000.0);
    expect($booking->remaining_balance)->toBe(16000.0);
    expect($booking->payment_status)->toBe('Partially Paid');

    // Verify revenue calculation on supplier payment management
    $paymentsResponse = $this->actingAs($supplier)->get(route('supplier.payments.index'));
    $paymentsResponse->assertOk();
    $paymentsResponse->assertInertia(fn ($page) => $page
        ->where('metrics.totalRevenue', 4000)
    );
});

test('supplier rejecting payment stores rejection reason and customer can view it', function () {
    $customer = User::factory()->create(['role' => 'customer']);
    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'business_name' => 'Catering & Events',
        'status' => 'approved',
    ]);

    $booking = Booking::create([
        'booking_reference' => 'BK-TEST-0004',
        'customer_id' => $customer->id,
        'booking_type' => 'service',
        'event_name' => 'Debut Party',
        'event_date' => now()->addDays(40)->toDateString(),
        'event_location' => 'Quezon City',
        'total_amount' => 8000.00,
        'overall_status' => 'accepted',
    ]);

    $payment = Payment::create([
        'booking_id' => $booking->id,
        'supplier_id' => $supplier->id,
        'customer_id' => $customer->id,
        'payment_method' => 'gcash',
        'payment_type' => 'downpayment',
        'amount' => 1600.00,
        'reference_number' => '9999999999999',
        'receipt_path' => 'receipts/blur.png',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($supplier)->post(route('supplier.payments.reject', $payment->id), [
        'rejection_reason' => 'Receipt is blurry and reference number does not match GCash transaction record.',
    ]);

    $response->assertRedirect();

    $payment->refresh();
    $booking->refresh();

    expect($payment->status)->toBe('rejected');
    expect($payment->rejection_reason)->toContain('blurry');
    expect($booking->payment_status)->toBe('Payment Rejected');

    // Customer visits My Bookings and sees rejected status
    $customerResponse = $this->actingAs($customer)->get(route('customer.bookings.index'));
    $customerResponse->assertOk();
    $customerResponse->assertInertia(fn ($page) => $page
        ->where('bookings.data.0.payment_status', 'Payment Rejected')
    );
});

test('for team packages payment is made to the team coordinator', function () {
    $customer = User::factory()->create(['role' => 'customer']);
    $coordinator = User::factory()->create(['role' => 'supplier', 'name' => 'Head Coordinator']);
    SupplierProfile::create([
        'user_id' => $coordinator->id,
        'business_name' => 'Head Coordinator Events',
        'status' => 'approved',
    ]);

    SupplierPaymentSetting::create([
        'supplier_id' => $coordinator->id,
        'gcash_name' => 'Head Coordinator GCash',
        'gcash_number' => '09189998877',
        'downpayment_percentage' => 30,
        'is_active' => true,
    ]);

    $team = Team::create([
        'name' => 'Dream Team Weddings',
        'coordinator_id' => $coordinator->id,
        'service_category' => 'Coordination',
    ]);

    $booking = Booking::create([
        'booking_reference' => 'BK-TEAM-0001',
        'customer_id' => $customer->id,
        'booking_type' => 'team_package',
        'team_id' => $team->id,
        'event_name' => 'Dream Wedding',
        'event_date' => now()->addDays(60)->toDateString(),
        'event_location' => 'Tagaytay Highlands',
        'total_amount' => 50000.00,
        'overall_status' => 'accepted',
    ]);

    $receipt = UploadedFile::fake()->create('coord-receipt.png', 100, 'image/png');

    $response = $this->actingAs($customer)->post(route('customer.payments.store'), [
        'booking_id' => $booking->id,
        'supplier_id' => $coordinator->id,
        'payment_type' => 'downpayment',
        'amount' => 15000.00,
        'reference_number' => '1008877665544',
        'receipt' => $receipt,
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('payments', [
        'booking_id' => $booking->id,
        'supplier_id' => $coordinator->id,
        'amount' => 15000.00,
        'status' => 'pending',
    ]);
});
