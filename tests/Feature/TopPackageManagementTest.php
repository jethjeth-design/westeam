<?php

use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\EventCategory;
use App\Models\Package;
use App\Models\Review;
use App\Models\SupplierProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('non-admin users cannot access admin top packages page', function () {
    $customer = User::factory()->create(['role' => 'customer']);
    $supplier = User::factory()->create(['role' => 'supplier']);

    $this->actingAs($customer)
        ->get(route('admin.top-packages.index'))
        ->assertForbidden();

    $this->actingAs($supplier)
        ->get(route('admin.top-packages.index'))
        ->assertForbidden();
});

test('admin can view top packages dashboard with rankings and stats', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $supplier = User::factory()->create(['role' => 'supplier']);
    $category = EventCategory::create([
        'name' => 'Wedding',
        'slug' => 'wedding',
    ]);

    SupplierProfile::create([
        'user_id' => $supplier->id,
        'status' => 'approved',
        'business_name' => 'Elite Floral & Decor',
    ]);

    Package::create([
        'supplier_id' => $supplier->id,
        'event_category_id' => $category->id,
        'name' => 'Grand Wedding Package',
        'price' => 50000,
        'is_active' => true,
        'is_top_package' => true,
    ]);

    $response = $this->actingAs($admin)
        ->get(route('admin.top-packages.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/TopPackages/Index')
        ->has('currentlyTop')
        ->has('qualifiedPending')
        ->has('allRankings')
        ->has('stats')
        ->has('categories')
    );
});

test('package qualifies as top package only when meeting all 5 requirements', function () {
    $customer = User::factory()->create(['role' => 'customer']);
    $supplier = User::factory()->create(['role' => 'supplier']);
    $category = EventCategory::create(['name' => 'Wedding', 'slug' => 'wedding']);

    $profile = SupplierProfile::create([
        'user_id' => $supplier->id,
        'status' => 'approved',
        'business_name' => 'Dream Events',
    ]);

    $package = Package::create([
        'supplier_id' => $supplier->id,
        'event_category_id' => $category->id,
        'name' => 'Standard Party Package',
        'price' => 20000,
        'is_active' => true,
        'is_top_package' => false,
    ]);

    // Initial check: 0 bookings, 0 reviews -> not qualified
    $metrics = $package->calculatePerformanceMetrics();
    expect($metrics['is_qualified'])->toBeFalse();
    expect($metrics['criteria']['is_active'])->toBeTrue();
    expect($metrics['criteria']['supplier_is_approved'])->toBeTrue();
    expect($metrics['criteria']['has_enough_bookings'])->toBeFalse();
    expect($metrics['criteria']['has_enough_reviews'])->toBeFalse();
    expect($metrics['criteria']['has_high_rating'])->toBeFalse();

    // Create 5 completed bookings and 5 5-star reviews
    for ($i = 1; $i <= 5; $i++) {
        $booking = Booking::create([
            'customer_id' => $customer->id,
            'booking_reference' => "BK-PKG-00{$i}",
            'event_name' => "Event {$i}",
            'event_date' => now()->addDays($i)->toDateString(),
            'event_location' => 'Makati',
            'booking_type' => 'supplier_package',
            'overall_status' => 'completed',
            'total_amount' => 20000,
        ]);

        $item = BookingItem::create([
            'booking_id' => $booking->id,
            'supplier_id' => $supplier->id,
            'item_type' => 'package',
            'item_id' => $package->id,
            'item_name' => $package->name,
            'unit_price' => 20000,
            'status' => 'completed',
        ]);

        Review::create([
            'booking_id' => $booking->id,
            'booking_item_id' => $item->id,
            'customer_id' => $customer->id,
            'supplier_id' => $supplier->id,
            'item_type' => 'package',
            'item_id' => $package->id,
            'item_name' => $package->name,
            'rating' => 5,
            'comment' => "Flawless experience for package {$i}!",
            'status' => 'approved',
        ]);
    }

    $metricsAfter = $package->calculatePerformanceMetrics();
    expect($metricsAfter['is_qualified'])->toBeTrue();
    expect($metricsAfter['completed_bookings_count'])->toBe(5);
    expect($metricsAfter['reviews_count'])->toBe(5);
    expect($metricsAfter['average_rating'])->toBe(5.0);
    expect($metricsAfter['top_score'])->toBeGreaterThan(0);

    // Test failing condition: if package is inactive, it does NOT qualify
    $package->is_active = false;
    $package->save();
    expect($package->calculatePerformanceMetrics()['is_qualified'])->toBeFalse();

    // Re-enable package
    $package->is_active = true;
    $package->save();
    expect($package->calculatePerformanceMetrics()['is_qualified'])->toBeTrue();

    // Test failing condition: if supplier is pending, it does NOT qualify
    $profile->status = 'pending';
    $profile->save();
    expect($package->calculatePerformanceMetrics()['is_qualified'])->toBeFalse();
});

test('only reviews from completed bookings are included in package rating and ranking', function () {
    $customer = User::factory()->create(['role' => 'customer']);
    $supplier = User::factory()->create(['role' => 'supplier']);
    $category = EventCategory::create(['name' => 'Debut', 'slug' => 'debut']);

    SupplierProfile::create([
        'user_id' => $supplier->id,
        'status' => 'approved',
        'business_name' => 'Gourmet Catering',
    ]);

    $package = Package::create([
        'supplier_id' => $supplier->id,
        'event_category_id' => $category->id,
        'name' => 'Debut Celebration Package',
        'price' => 35000,
        'is_active' => true,
    ]);

    // 1 completed booking with a 5-star review
    $completedBooking = Booking::create([
        'customer_id' => $customer->id,
        'booking_reference' => 'BK-PKG-COMP',
        'event_name' => 'Completed Debut',
        'event_date' => now()->toDateString(),
        'event_location' => 'Quezon City',
        'booking_type' => 'supplier_package',
        'overall_status' => 'completed',
        'total_amount' => 35000,
    ]);

    $completedItem = BookingItem::create([
        'booking_id' => $completedBooking->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'package',
        'item_id' => $package->id,
        'item_name' => $package->name,
        'unit_price' => 35000,
        'status' => 'completed',
    ]);

    Review::create([
        'booking_id' => $completedBooking->id,
        'booking_item_id' => $completedItem->id,
        'customer_id' => $customer->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'package',
        'item_id' => $package->id,
        'item_name' => $package->name,
        'rating' => 5,
        'comment' => 'Exceptional completed package!',
        'status' => 'approved',
    ]);

    // 1 pending booking with a 1-star review (should NOT be counted towards rating)
    $pendingBooking = Booking::create([
        'customer_id' => $customer->id,
        'booking_reference' => 'BK-PKG-PEND',
        'event_name' => 'Pending Debut',
        'event_date' => now()->addDays(5)->toDateString(),
        'event_location' => 'Quezon City',
        'booking_type' => 'supplier_package',
        'overall_status' => 'pending',
        'total_amount' => 35000,
    ]);

    $pendingItem = BookingItem::create([
        'booking_id' => $pendingBooking->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'package',
        'item_id' => $package->id,
        'item_name' => $package->name,
        'unit_price' => 35000,
        'status' => 'pending',
    ]);

    Review::create([
        'booking_id' => $pendingBooking->id,
        'booking_item_id' => $pendingItem->id,
        'customer_id' => $customer->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'package',
        'item_id' => $package->id,
        'item_name' => $package->name,
        'rating' => 1,
        'comment' => 'Not yet completed review!',
        'status' => 'approved',
    ]);

    $metrics = $package->calculatePerformanceMetrics();

    // Only the completed booking review is counted
    expect($metrics['reviews_count'])->toBe(1);
    expect($metrics['average_rating'])->toBe(5.0);
    expect($metrics['completed_bookings_count'])->toBe(1);
});

test('admin can manually feature, unfeature, and toggle a package', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $supplier = User::factory()->create(['role' => 'supplier']);
    $category = EventCategory::create(['name' => 'Birthday', 'slug' => 'birthday']);

    $package = Package::create([
        'supplier_id' => $supplier->id,
        'event_category_id' => $category->id,
        'name' => 'Birthday Splash Package',
        'price' => 15000,
        'is_active' => true,
        'is_top_package' => false,
        'is_ranking_excluded' => false,
    ]);

    // Feature package
    $this->actingAs($admin)
        ->post(route('admin.top-packages.feature', $package->id))
        ->assertRedirect();

    expect($package->fresh()->is_top_package)->toBeTrue();
    expect($package->fresh()->is_ranking_excluded)->toBeFalse();

    // Unfeature package
    $this->actingAs($admin)
        ->post(route('admin.top-packages.unfeature', $package->id))
        ->assertRedirect();

    expect($package->fresh()->is_top_package)->toBeFalse();
    expect($package->fresh()->is_ranking_excluded)->toBeTrue();

    // Toggle back to featured
    $this->actingAs($admin)
        ->post(route('admin.top-packages.toggle', $package->id))
        ->assertRedirect();

    expect($package->fresh()->is_top_package)->toBeTrue();
    expect($package->fresh()->is_ranking_excluded)->toBeFalse();

    // Restore to auto
    $this->actingAs($admin)
        ->post(route('admin.top-packages.restore-auto', $package->id))
        ->assertRedirect();

    expect($package->fresh()->is_ranking_excluded)->toBeFalse();
});

test('admin can enable and disable a package', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $supplier = User::factory()->create(['role' => 'supplier']);
    $category = EventCategory::create(['name' => 'Anniversary', 'slug' => 'anniversary']);

    $package = Package::create([
        'supplier_id' => $supplier->id,
        'event_category_id' => $category->id,
        'name' => 'Anniversary Elegance',
        'price' => 25000,
        'is_active' => true,
    ]);

    // Disable package
    $this->actingAs($admin)
        ->post(route('admin.top-packages.toggle-active', $package->id))
        ->assertRedirect();

    expect($package->fresh()->is_active)->toBeFalse();

    // Enable package
    $this->actingAs($admin)
        ->post(route('admin.top-packages.toggle-active', $package->id))
        ->assertRedirect();

    expect($package->fresh()->is_active)->toBeTrue();
});

test('recalculate automatically features qualified packages unless manually excluded', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $customer = User::factory()->create(['role' => 'customer']);
    $supplier = User::factory()->create(['role' => 'supplier']);
    $category = EventCategory::create(['name' => 'Wedding', 'slug' => 'wedding']);

    SupplierProfile::create([
        'user_id' => $supplier->id,
        'status' => 'approved',
        'business_name' => 'Majestic Celebrations',
    ]);

    // Qualified package 1 (auto-featured)
    $package1 = Package::create([
        'supplier_id' => $supplier->id,
        'event_category_id' => $category->id,
        'name' => 'Majestic Wedding All-In',
        'price' => 60000,
        'is_active' => true,
        'is_top_package' => false,
        'is_ranking_excluded' => false,
    ]);

    // Create 5 completed bookings and 5 5-star reviews for package 1
    for ($i = 1; $i <= 5; $i++) {
        $booking = Booking::create([
            'customer_id' => $customer->id,
            'booking_reference' => "BK-MAJ-00{$i}",
            'event_name' => "Wedding {$i}",
            'event_date' => now()->toDateString(),
            'event_location' => 'Manila',
            'booking_type' => 'supplier_package',
            'overall_status' => 'completed',
            'total_amount' => 60000,
        ]);

        $item = BookingItem::create([
            'booking_id' => $booking->id,
            'supplier_id' => $supplier->id,
            'item_type' => 'package',
            'item_id' => $package1->id,
            'item_name' => $package1->name,
            'unit_price' => 60000,
            'status' => 'completed',
        ]);

        Review::create([
            'booking_id' => $booking->id,
            'booking_item_id' => $item->id,
            'customer_id' => $customer->id,
            'supplier_id' => $supplier->id,
            'item_type' => 'package',
            'item_id' => $package1->id,
            'item_name' => $package1->name,
            'rating' => 5,
            'comment' => "Exceeded expectations {$i}!",
            'status' => 'approved',
        ]);
    }

    // Qualified package 2 but manually excluded by admin
    $package2 = Package::create([
        'supplier_id' => $supplier->id,
        'event_category_id' => $category->id,
        'name' => 'Manually Excluded Package',
        'price' => 45000,
        'is_active' => true,
        'is_top_package' => false,
        'is_ranking_excluded' => true, // Admin manually unfeatured/excluded
    ]);

    for ($i = 1; $i <= 5; $i++) {
        $booking = Booking::create([
            'customer_id' => $customer->id,
            'booking_reference' => "BK-EXCL-00{$i}",
            'event_name' => "Event {$i}",
            'event_date' => now()->toDateString(),
            'event_location' => 'Manila',
            'booking_type' => 'supplier_package',
            'overall_status' => 'completed',
            'total_amount' => 45000,
        ]);

        $item = BookingItem::create([
            'booking_id' => $booking->id,
            'supplier_id' => $supplier->id,
            'item_type' => 'package',
            'item_id' => $package2->id,
            'item_name' => $package2->name,
            'unit_price' => 45000,
            'status' => 'completed',
        ]);

        Review::create([
            'booking_id' => $booking->id,
            'booking_item_id' => $item->id,
            'customer_id' => $customer->id,
            'supplier_id' => $supplier->id,
            'item_type' => 'package',
            'item_id' => $package2->id,
            'item_name' => $package2->name,
            'rating' => 5,
            'comment' => "Great {$i}!",
            'status' => 'approved',
        ]);
    }

    // Trigger recalculation
    $this->actingAs($admin)
        ->post(route('admin.top-packages.recalculate'))
        ->assertRedirect();

    // Package 1 should now be auto-featured as top package
    expect($package1->fresh()->is_top_package)->toBeTrue();
    expect($package1->fresh()->top_score)->toBeGreaterThan(0);

    // Package 2 should remain NOT top package because it was excluded by admin
    expect($package2->fresh()->is_top_package)->toBeFalse();
    expect($package2->fresh()->top_score)->toBeGreaterThan(0);
});

test('customer review submission triggers package performance sync', function () {
    $customer = User::factory()->create(['role' => 'customer']);
    $supplier = User::factory()->create(['role' => 'supplier']);
    $category = EventCategory::create(['name' => 'Party', 'slug' => 'party']);

    SupplierProfile::create([
        'user_id' => $supplier->id,
        'status' => 'approved',
        'business_name' => 'Party Masters',
    ]);

    $package = Package::create([
        'supplier_id' => $supplier->id,
        'event_category_id' => $category->id,
        'name' => 'Party Special',
        'price' => 12000,
        'is_active' => true,
    ]);

    $booking = Booking::create([
        'customer_id' => $customer->id,
        'booking_reference' => 'BK-SYNC-01',
        'event_name' => 'Birthday Party',
        'event_date' => now()->toDateString(),
        'event_location' => 'Makati',
        'booking_type' => 'supplier_package',
        'overall_status' => 'completed',
        'total_amount' => 12000,
    ]);

    $item = BookingItem::create([
        'booking_id' => $booking->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'package',
        'item_id' => $package->id,
        'item_name' => $package->name,
        'unit_price' => 12000,
        'status' => 'completed',
    ]);

    $response = $this->actingAs($customer)
        ->post(route('customer.reviews.store'), [
            'booking_item_id' => $item->id,
            'rating' => 5,
            'comment' => 'Outstanding package and service!',
        ]);

    $response->assertRedirect();
    expect($package->fresh()->top_score)->toBeGreaterThan(0);
});

test('supplier completing package booking item triggers package sync', function () {
    $customer = User::factory()->create(['role' => 'customer']);
    $supplier = User::factory()->create(['role' => 'supplier']);
    $category = EventCategory::create(['name' => 'Corporate', 'slug' => 'corporate']);

    SupplierProfile::create([
        'user_id' => $supplier->id,
        'status' => 'approved',
        'business_name' => 'Corporate Events Co.',
    ]);

    $package = Package::create([
        'supplier_id' => $supplier->id,
        'event_category_id' => $category->id,
        'name' => 'Corporate Seminar Package',
        'price' => 50000,
        'is_active' => true,
    ]);

    $booking = Booking::create([
        'customer_id' => $customer->id,
        'booking_reference' => 'BK-COMP-TEST',
        'event_name' => 'Annual Conference',
        'event_date' => now()->toDateString(),
        'event_location' => 'BGC Taguig',
        'booking_type' => 'supplier_package',
        'overall_status' => 'accepted',
        'total_amount' => 50000,
    ]);

    $item = BookingItem::create([
        'booking_id' => $booking->id,
        'supplier_id' => $supplier->id,
        'item_type' => 'package',
        'item_id' => $package->id,
        'item_name' => $package->name,
        'unit_price' => 50000,
        'status' => 'accepted',
    ]);

    $response = $this->actingAs($supplier)
        ->post(route('supplier.bookings.items.complete', $item->id));

    $response->assertRedirect();
    expect($item->fresh()->status)->toBe('completed');
    expect($package->fresh()->top_score)->toBeGreaterThan(0);
});
