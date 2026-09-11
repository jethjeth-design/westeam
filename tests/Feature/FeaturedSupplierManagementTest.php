<?php

use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Review;
use App\Models\SupplierProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('non-admin users cannot access admin featured suppliers page', function () {
    $customer = User::factory()->create(['role' => 'customer']);
    $supplier = User::factory()->create(['role' => 'supplier']);

    $this->actingAs($customer)
        ->get(route('admin.featured-suppliers.index'))
        ->assertForbidden();

    $this->actingAs($supplier)
        ->get(route('admin.featured-suppliers.index'))
        ->assertForbidden();
});

test('admin can view featured suppliers dashboard with rankings and stats', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'status' => 'approved',
        'business_name' => 'Elite Photography',
        'is_featured' => true,
    ]);

    $response = $this->actingAs($admin)
        ->get(route('admin.featured-suppliers.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/FeaturedSuppliers/Index')
        ->has('currentlyFeatured')
        ->has('qualifiedPending')
        ->has('allRankings')
        ->has('stats')
    );
});

test('supplier qualifies only when meeting all 5 requirements', function () {
    $customer = User::factory()->create(['role' => 'customer']);
    $supplier = User::factory()->create(['role' => 'supplier']);
    $profile = SupplierProfile::create([
        'user_id' => $supplier->id,
        'status' => 'approved',
        'business_name' => 'Premier Catering',
        'is_featured' => false,
    ]);

    // Initial check: 0 bookings, 0 reviews -> not qualified
    $metrics = $profile->calculatePerformanceMetrics();
    expect($metrics['is_qualified'])->toBeFalse();
    expect($metrics['criteria']['has_enough_bookings'])->toBeFalse();
    expect($metrics['criteria']['has_enough_reviews'])->toBeFalse();
    expect($metrics['criteria']['has_high_rating'])->toBeFalse();

    // Create 5 completed bookings and 5 5-star reviews
    for ($i = 1; $i <= 5; $i++) {
        $booking = Booking::create([
            'customer_id' => $customer->id,
            'booking_reference' => "BK-TEST-00{$i}",
            'event_name' => "Wedding {$i}",
            'event_date' => now()->addDays($i)->toDateString(),
            'event_location' => 'Manila',
            'booking_type' => 'service',
            'overall_status' => 'completed',
            'total_amount' => 10000,
        ]);

        $item = BookingItem::create([
            'booking_id' => $booking->id,
            'supplier_id' => $supplier->id,
            'item_type' => 'service',
            'item_name' => "Catering Package {$i}",
            'unit_price' => 10000,
            'status' => 'completed',
        ]);

        Review::create([
            'booking_id' => $booking->id,
            'booking_item_id' => $item->id,
            'customer_id' => $customer->id,
            'supplier_id' => $supplier->id,
            'item_type' => 'service',
            'item_name' => "Catering Package {$i}",
            'rating' => 5,
            'comment' => "Exceeded expectations in every way! {$i}",
            'status' => 'approved',
        ]);
    }

    $metricsAfter = $profile->fresh()->calculatePerformanceMetrics();
    expect($metricsAfter['is_qualified'])->toBeTrue();
    expect($metricsAfter['completed_bookings_count'])->toBe(5);
    expect($metricsAfter['reviews_count'])->toBe(5);
    expect($metricsAfter['average_rating'])->toBe(5.0);
    expect($metricsAfter['featured_score'])->toBeGreaterThan(0);
});

test('only reviews from completed bookings are included in rating and ranking', function () {
    $customer = User::factory()->create(['role' => 'customer']);
    $supplier = User::factory()->create(['role' => 'supplier']);
    $profile = SupplierProfile::create([
        'user_id' => $supplier->id,
        'status' => 'approved',
        'business_name' => 'Royal Events',
    ]);

    // 1 completed booking with a 5-star review
    $completedBooking = Booking::create([
        'customer_id' => $customer->id,
        'booking_reference' => 'BK-COMP-01',
        'event_name' => 'Completed Wedding',
        'event_date' => now()->toDateString(),
        'event_location' => 'Manila',
        'booking_type' => 'service',
        'overall_status' => 'completed',
        'total_amount' => 5000,
    ]);

    $completedItem = BookingItem::create([
        'booking_id' => $completedBooking->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'service',
        'item_name' => 'DJ Sound',
        'unit_price' => 5000,
        'status' => 'completed',
    ]);

    Review::create([
        'booking_id' => $completedBooking->id,
        'booking_item_id' => $completedItem->id,
        'customer_id' => $customer->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'service',
        'item_name' => 'DJ Sound',
        'rating' => 5,
        'comment' => 'Great completed experience!',
        'status' => 'approved',
    ]);

    // 1 pending booking with an unapproved/pending review (should NOT be counted)
    $pendingBooking = Booking::create([
        'customer_id' => $customer->id,
        'booking_reference' => 'BK-PEND-01',
        'event_name' => 'Pending Wedding',
        'event_date' => now()->addDays(10)->toDateString(),
        'event_location' => 'Manila',
        'booking_type' => 'service',
        'overall_status' => 'pending',
        'total_amount' => 5000,
    ]);

    $pendingItem = BookingItem::create([
        'booking_id' => $pendingBooking->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'service',
        'item_name' => 'Lighting',
        'unit_price' => 5000,
        'status' => 'pending',
    ]);

    Review::create([
        'booking_id' => $pendingBooking->id,
        'booking_item_id' => $pendingItem->id,
        'customer_id' => $customer->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'service',
        'item_name' => 'Lighting',
        'rating' => 1,
        'comment' => 'Should not be counted!',
        'status' => 'approved',
    ]);

    $metrics = $profile->calculatePerformanceMetrics();
    // Only the completed booking and its 5-star review should count
    expect($metrics['reviews_count'])->toBe(1);
    expect($metrics['average_rating'])->toBe(5.0);
    expect($metrics['completed_bookings_count'])->toBe(1);
});

test('admin can manually feature and unfeature a supplier', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $supplier = User::factory()->create(['role' => 'supplier']);
    $profile = SupplierProfile::create([
        'user_id' => $supplier->id,
        'status' => 'approved',
        'business_name' => 'Star Lighting',
        'is_featured' => false,
        'is_ranking_excluded' => false,
    ]);

    // Feature supplier
    $this->actingAs($admin)
        ->post(route('admin.featured-suppliers.feature', $profile->id))
        ->assertRedirect();

    expect($profile->fresh()->is_featured)->toBeTrue();
    expect($profile->fresh()->is_ranking_excluded)->toBeFalse();

    // Unfeature supplier
    $this->actingAs($admin)
        ->post(route('admin.featured-suppliers.unfeature', $profile->id))
        ->assertRedirect();

    expect($profile->fresh()->is_featured)->toBeFalse();
    expect($profile->fresh()->is_ranking_excluded)->toBeTrue();

    // Restore to auto
    $this->actingAs($admin)
        ->post(route('admin.featured-suppliers.restore-auto', $profile->id))
        ->assertRedirect();

    expect($profile->fresh()->is_ranking_excluded)->toBeFalse();
});

test('recalculate automatically features qualified suppliers unless manually excluded', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $customer = User::factory()->create(['role' => 'customer']);

    // Qualified supplier
    $supplier1 = User::factory()->create(['role' => 'supplier']);
    $profile1 = SupplierProfile::create([
        'user_id' => $supplier1->id,
        'status' => 'approved',
        'business_name' => 'Auto Qualified Vendor',
        'is_featured' => false,
        'is_ranking_excluded' => false,
    ]);

    for ($i = 1; $i <= 5; $i++) {
        $booking = Booking::create([
            'customer_id' => $customer->id,
            'booking_reference' => "BK-AUTO-00{$i}",
            'event_name' => "Event {$i}",
            'event_date' => now()->toDateString(),
            'event_location' => 'Manila',
            'booking_type' => 'service',
            'overall_status' => 'completed',
            'total_amount' => 5000,
        ]);

        $item = BookingItem::create([
            'booking_id' => $booking->id,
            'supplier_id' => $supplier1->id,
            'item_type' => 'service',
            'item_name' => "Service {$i}",
            'unit_price' => 5000,
            'status' => 'completed',
        ]);

        Review::create([
            'booking_id' => $booking->id,
            'booking_item_id' => $item->id,
            'customer_id' => $customer->id,
            'supplier_id' => $supplier1->id,
            'item_type' => 'service',
            'item_name' => "Service {$i}",
            'rating' => 5,
            'comment' => "Perfect service {$i}",
            'status' => 'approved',
        ]);
    }

    // Supplier who is qualified but admin manually excluded
    $supplier2 = User::factory()->create(['role' => 'supplier']);
    $profile2 = SupplierProfile::create([
        'user_id' => $supplier2->id,
        'status' => 'approved',
        'business_name' => 'Manually Excluded Vendor',
        'is_featured' => false,
        'is_ranking_excluded' => true,
    ]);

    for ($i = 1; $i <= 5; $i++) {
        $booking = Booking::create([
            'customer_id' => $customer->id,
            'booking_reference' => "BK-EXCL-00{$i}",
            'event_name' => "Event {$i}",
            'event_date' => now()->toDateString(),
            'event_location' => 'Manila',
            'booking_type' => 'service',
            'overall_status' => 'completed',
            'total_amount' => 5000,
        ]);

        $item = BookingItem::create([
            'booking_id' => $booking->id,
            'supplier_id' => $supplier2->id,
            'item_type' => 'service',
            'item_name' => "Service {$i}",
            'unit_price' => 5000,
            'status' => 'completed',
        ]);

        Review::create([
            'booking_id' => $booking->id,
            'booking_item_id' => $item->id,
            'customer_id' => $customer->id,
            'supplier_id' => $supplier2->id,
            'item_type' => 'service',
            'item_name' => "Service {$i}",
            'rating' => 5,
            'comment' => "Perfect service {$i}",
            'status' => 'approved',
        ]);
    }

    // Run recalculate
    $this->actingAs($admin)
        ->post(route('admin.featured-suppliers.recalculate'))
        ->assertRedirect();

    // Supplier 1 should now be auto-featured
    expect($profile1->fresh()->is_featured)->toBeTrue();
    expect($profile1->fresh()->featured_score)->toBeGreaterThan(0);

    // Supplier 2 was excluded, so should remain not featured
    expect($profile2->fresh()->is_featured)->toBeFalse();
});
