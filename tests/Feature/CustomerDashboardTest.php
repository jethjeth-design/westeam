<?php

use App\Models\EventCategory;
use App\Models\HomepageBanner;
use App\Models\Package;
use App\Models\SupplierProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guest cannot access customer dashboard and is redirected to login', function () {
    $this->get(route('customer.dashboard'))
        ->assertRedirect(route('login'));
});

test('customer dashboard renders synchronized banners, featured suppliers, and top packages', function () {
    $customer = User::factory()->create(['role' => 'customer']);

    // 1. Create Active Banner
    $banner = HomepageBanner::create([
        'title' => 'Exclusive Wedding Season Special',
        'subtitle' => 'Connect with award-winning suppliers for your dream ceremony.',
        'badge' => 'Curated Excellence',
        'image_url' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80',
        'button_text' => 'Explore Now',
        'button_url' => '/suppliers',
        'secondary_button_text' => 'View Top Packages',
        'secondary_button_url' => '/packages',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    // 2. Create Featured Supplier
    $supplierUser = User::factory()->create(['role' => 'supplier', 'name' => 'John Stylist']);
    $supplierProfile = SupplierProfile::create([
        'user_id' => $supplierUser->id,
        'business_name' => 'Royal Elegance Styling',
        'status' => 'approved',
        'is_featured' => true,
        'featured_score' => 95.0,
    ]);

    // 3. Create Top Package
    $category = EventCategory::create(['name' => 'Weddings', 'is_active' => true]);
    $package = Package::create([
        'supplier_id' => $supplierUser->id,
        'event_category_id' => $category->id,
        'name' => 'Royal Gold Wedding Package',
        'price' => 75000,
        'is_active' => true,
        'is_top_package' => true,
        'is_featured' => true,
        'description' => 'Complete styling and coordination package.',
    ]);

    // Customer visits dashboard
    $response = $this->actingAs($customer)->get(route('customer.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Customer/Dashboard')
        ->has('banners', 1)
        ->where('banners.0.title', 'Exclusive Wedding Season Special')
        ->has('featuredSuppliers', 1)
        ->where('featuredSuppliers.0.business_name', 'Royal Elegance Styling')
        ->where('featuredSuppliers.0.is_featured', true)
        ->has('topPackages', 1)
        ->where('topPackages.0.name', 'Royal Gold Wedding Package')
        ->has('stats')
    );
});

test('changes made by admin are synchronized across both welcome page and customer dashboard automatically', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $customer = User::factory()->create(['role' => 'customer']);
    $supplier = User::factory()->create(['role' => 'supplier']);

    $profile = SupplierProfile::create([
        'user_id' => $supplier->id,
        'status' => 'approved',
        'business_name' => 'Floral Delights Co.',
        'is_featured' => false,
    ]);

    // Initially neither welcome page nor customer dashboard displays the supplier as featured
    $this->get(route('home'))
        ->assertInertia(fn ($page) => $page->has('featuredSuppliers', 0));

    $this->actingAs($customer)
        ->get(route('customer.dashboard'))
        ->assertInertia(fn ($page) => $page->has('featuredSuppliers', 0));

    // Admin features the supplier
    $this->actingAs($admin)
        ->post(route('admin.featured-suppliers.feature', $profile->id))
        ->assertRedirect();

    expect($profile->fresh()->is_featured)->toBeTrue();

    // Now BOTH Welcome page and Customer Dashboard reflect the featured supplier automatically
    $this->get(route('home'))
        ->assertInertia(fn ($page) => $page
            ->has('featuredSuppliers', 1)
            ->where('featuredSuppliers.0.business_name', 'Floral Delights Co.')
        );

    $this->actingAs($customer)
        ->get(route('customer.dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('featuredSuppliers', 1)
            ->where('featuredSuppliers.0.business_name', 'Floral Delights Co.')
        );
});
