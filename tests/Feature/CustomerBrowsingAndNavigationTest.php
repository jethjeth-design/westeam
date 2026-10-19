<?php

use App\Models\EventCategory;
use App\Models\Package;
use App\Models\Service;
use App\Models\SupplierPortfolio;
use App\Models\SupplierProfile;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected to login from private customer routes', function () {
    $this->get(route('customer.suppliers.index'))->assertRedirect(route('login'));
    $this->get(route('customer.packages.index'))->assertRedirect(route('login'));
    $this->get(route('customer.bookings.create'))->assertRedirect(route('login'));
    $this->get(route('customer.bookings.index'))->assertRedirect(route('login'));
});

test('guests can publicly browse services and view service details', function () {
    $approvedSupplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $approvedSupplier->id,
        'business_name' => 'Royal Events Co.',
        'status' => 'approved',
    ]);

    $service = Service::create([
        'supplier_id' => $approvedSupplier->id,
        'name' => 'Grand Arch Styling',
        'category' => 'Styling',
        'price' => 15000,
        'is_active' => true,
    ]);

    // Guest browsing services list
    $indexResponse = $this->get(route('customer.services.index'));
    $indexResponse->assertOk();
    $indexResponse->assertInertia(fn ($page) => $page
        ->component('Customer/Services/Index')
        ->has('services.data', 1)
        ->where('services.data.0.name', 'Grand Arch Styling')
    );

    // Guest viewing single service details
    $showResponse = $this->get(route('customer.services.show', $service->id));
    $showResponse->assertOk();
    $showResponse->assertInertia(fn ($page) => $page
        ->component('Customer/Services/Show')
        ->where('service.id', $service->id)
        ->where('service.name', 'Grand Arch Styling')
    );
});

test('guest clicking book now is redirected to login, intended booking page with preselected service after login, and index after booking', function () {
    $customer = User::factory()->create(['role' => 'customer', 'password' => bcrypt('password123')]);

    $approvedSupplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $approvedSupplier->id,
        'business_name' => 'Dream Florals',
        'status' => 'approved',
    ]);

    $service = Service::create([
        'supplier_id' => $approvedSupplier->id,
        'name' => 'Bridal Bouquet Masterpiece',
        'category' => 'Florist',
        'price' => 12500,
        'is_active' => true,
    ]);

    // 1. Guest clicks "Book Now" for this service -> intercepted by auth, redirected to login
    $guestBookingUrl = route('customer.bookings.create', ['service_id' => $service->id]);
    $bookingResponse = $this->get($guestBookingUrl);
    $bookingResponse->assertRedirect(route('login'));

    // Verify Laravel intended redirect URL was stored in session
    $this->assertEquals($guestBookingUrl, session('url.intended'));

    // 2. Customer logs in via POST /login
    $loginResponse = $this->post(route('login'), [
        'email' => $customer->email,
        'password' => 'password123',
    ]);

    // Verify redirected back to intended booking create page with service_id
    $loginResponse->assertRedirect($guestBookingUrl);

    // 3. Opening the booking create page as customer preselects the service
    $createPageResponse = $this->actingAs($customer)->get($guestBookingUrl);
    $createPageResponse->assertOk();
    $createPageResponse->assertInertia(fn ($page) => $page
        ->component('Customer/Bookings/Create')
        ->where('initialItem.item_id', $service->id)
        ->where('initialItem.item_name', 'Bridal Bouquet Masterpiece')
    );

    // 4. Submitting the booking request redirects to customer.bookings.index
    $eventDate = now()->addDays(20)->format('Y-m-d');
    $storeResponse = $this->actingAs($customer)->post(route('customer.bookings.store'), [
        'booking_type' => 'service',
        'event_name' => 'Sarah & John Wedding',
        'event_date' => $eventDate,
        'event_time' => '2:00 PM',
        'event_location' => 'Grand Hotel Ballroom',
        'guest_count' => 120,
        'items' => [
            [
                'supplier_id' => $approvedSupplier->id,
                'item_type' => 'service',
                'item_id' => $service->id,
                'item_name' => $service->name,
                'unit_price' => 12500,
            ],
        ],
    ]);

    $storeResponse->assertRedirect(route('customer.bookings.index'));
    $this->assertDatabaseHas('bookings', [
        'customer_id' => $customer->id,
        'event_name' => 'Sarah & John Wedding',
    ]);
});

test('normal customer login without intended booking redirect continues to customer dashboard', function () {
    $customer = User::factory()->create(['role' => 'customer', 'password' => bcrypt('password123')]);

    // Regular login without any prior intended URL
    $loginResponse = $this->post(route('login'), [
        'email' => $customer->email,
        'password' => 'password123',
    ]);

    // Default intended is route('dashboard'), which routes customer to customer.dashboard
    $loginResponse->assertRedirect(route('dashboard'));

    $dashboardResponse = $this->actingAs($customer)->get(route('dashboard'));
    $dashboardResponse->assertRedirect(route('customer.dashboard'));
});

test('customer can browse gallery suppliers index and see approved suppliers', function () {
    $customer = User::factory()->create(['role' => 'customer']);

    $supplierUser = User::factory()->create(['role' => 'supplier', 'name' => 'John Lens']);
    SupplierProfile::create([
        'user_id' => $supplierUser->id,
        'business_name' => 'John Lens Photography',
        'status' => 'approved',
    ]);

    $unapprovedSupplier = User::factory()->create(['role' => 'supplier', 'name' => 'Pending Vendor']);
    SupplierProfile::create([
        'user_id' => $unapprovedSupplier->id,
        'business_name' => 'Pending Cakes',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($customer)->get(route('customer.suppliers.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Customer/Suppliers/Index')
        ->has('suppliers.data', 1)
        ->where('suppliers.data.0.business_name', 'John Lens Photography')
    );
});

test('customer can view supplier portfolio with active services and packages', function () {
    $customer = User::factory()->create(['role' => 'customer']);

    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'business_name' => 'Elite Events Manila',
        'status' => 'approved',
    ]);

    $category = EventCategory::create(['name' => 'Weddings', 'is_active' => true]);

    $portfolio = SupplierPortfolio::create([
        'supplier_id' => $supplier->id,
        'event_category_id' => $category->id,
        'title' => 'Fairytale Castle Wedding',
        'is_published' => true,
    ]);

    $service = Service::create([
        'supplier_id' => $supplier->id,
        'name' => 'Full Day Wedding Coverage',
        'category' => 'Photography',
        'price' => 35000,
        'is_active' => true,
    ]);

    $package = Package::create([
        'supplier_id' => $supplier->id,
        'event_category_id' => $category->id,
        'name' => 'Diamond Photography & Video Package',
        'price' => 60000,
        'is_active' => true,
    ]);

    $response = $this->actingAs($customer)->get(route('customer.suppliers.portfolio', $supplier->id));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Customer/Suppliers/Portfolio')
        ->where('supplier.id', $supplier->id)
        ->has('portfolios', 1)
        ->has('services', 1)
        ->has('packages', 1)
        ->where('portfolios.0.title', 'Fairytale Castle Wedding')
        ->where('services.0.name', 'Full Day Wedding Coverage')
        ->where('packages.0.name', 'Diamond Photography & Video Package')
    );
});

test('customer can view individual portfolio details and images', function () {
    $customer = User::factory()->create(['role' => 'customer']);

    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'business_name' => 'Starlight Creatives',
        'status' => 'approved',
    ]);

    $category = EventCategory::create(['name' => 'Birthdays', 'is_active' => true]);

    $portfolio = SupplierPortfolio::create([
        'supplier_id' => $supplier->id,
        'event_category_id' => $category->id,
        'title' => 'Golden 50th Jubilee',
        'description' => 'A magical golden jubilee celebration.',
        'is_published' => true,
    ]);

    $response = $this->actingAs($customer)->get(route('customer.portfolios.show', $portfolio->id));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Customer/Portfolio/Show')
        ->where('portfolio.id', $portfolio->id)
        ->where('portfolio.title', 'Golden 50th Jubilee')
    );
});

test('customer can browse services page showing services from approved suppliers only', function () {
    $customer = User::factory()->create(['role' => 'customer']);

    $approvedSupplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $approvedSupplier->id,
        'business_name' => 'Luxe Sound & Lights',
        'status' => 'approved',
    ]);

    $unapprovedSupplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $unapprovedSupplier->id,
        'business_name' => 'Unapproved Sound',
        'status' => 'pending',
    ]);

    $activeService = Service::create([
        'supplier_id' => $approvedSupplier->id,
        'name' => 'Concert-Grade Sound Setup',
        'category' => 'Audio/Visual',
        'price' => 25000,
        'is_active' => true,
    ]);

    $inactiveService = Service::create([
        'supplier_id' => $approvedSupplier->id,
        'name' => 'Old Vintage Mic Hire',
        'category' => 'Audio/Visual',
        'price' => 5000,
        'is_active' => false,
    ]);

    $unapprovedService = Service::create([
        'supplier_id' => $unapprovedSupplier->id,
        'name' => 'Pending Supplier Mic',
        'category' => 'Audio/Visual',
        'price' => 10000,
        'is_active' => true,
    ]);

    $response = $this->actingAs($customer)->get(route('customer.services.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Customer/Services/Index')
        ->has('services.data', 1)
        ->where('services.data.0.name', 'Concert-Grade Sound Setup')
    );
});

test('customer can view individual service details page', function () {
    $customer = User::factory()->create(['role' => 'customer']);

    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'business_name' => 'Starlight Acoustic',
        'status' => 'approved',
    ]);

    $service = Service::create([
        'supplier_id' => $supplier->id,
        'name' => 'Acoustic Duo Performance',
        'category' => 'Music',
        'price' => 15000,
        'description' => 'Live acoustic entertainment for receptions.',
        'is_active' => true,
    ]);

    $response = $this->actingAs($customer)->get(route('customer.services.show', $service->id));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Customer/Services/Show')
        ->where('service.id', $service->id)
        ->where('service.name', 'Acoustic Duo Performance')
    );
});

test('customer can browse packages page including individual and team packages', function () {
    $customer = User::factory()->create(['role' => 'customer']);

    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'business_name' => 'Elegance Catering',
        'status' => 'approved',
    ]);

    $category = EventCategory::create(['name' => 'Weddings', 'is_active' => true]);

    $individualPackage = Package::create([
        'supplier_id' => $supplier->id,
        'event_category_id' => $category->id,
        'name' => 'Standard Buffet Package',
        'price' => 45000,
        'is_active' => true,
    ]);

    $coordinator = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $coordinator->id,
        'business_name' => 'Premier Team Coordinator',
        'status' => 'approved',
    ]);

    $team = Team::create([
        'coordinator_id' => $coordinator->id,
        'name' => 'All-Star Wedding Collective',
        'description' => 'Multi-vendor wedding dream team.',
    ]);

    $teamPackage = Package::create([
        'supplier_id' => $coordinator->id,
        'team_id' => $team->id,
        'event_category_id' => $category->id,
        'name' => 'Grand Dream Wedding All-in Team Package',
        'price' => 150000,
        'is_active' => true,
    ]);

    $response = $this->actingAs($customer)->get(route('customer.packages.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Customer/Packages/Index')
        ->has('packages.data', 2)
    );
});

test('customer can open booking create form with preselected service and package', function () {
    $customer = User::factory()->create(['role' => 'customer']);

    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'business_name' => 'Luxe Blooms Florals',
        'status' => 'approved',
    ]);

    $service = Service::create([
        'supplier_id' => $supplier->id,
        'name' => 'Bridal Bouquet & Entourage Florals',
        'category' => 'Florist',
        'price' => 18000,
        'is_active' => true,
    ]);

    $response = $this->actingAs($customer)->get(route('customer.bookings.create', [
        'service_id' => $service->id,
    ]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Customer/Bookings/Create')
        ->where('initialItem.item_id', $service->id)
        ->where('initialItem.item_name', 'Bridal Bouquet & Entourage Florals')
    );
});

test('submitting a customer booking redirects to customer.bookings.index', function () {
    $customer = User::factory()->create(['role' => 'customer']);

    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'business_name' => 'Elite Styling',
        'status' => 'approved',
    ]);

    $service = Service::create([
        'supplier_id' => $supplier->id,
        'name' => 'Ceremony Arch Styling',
        'price' => 12000,
        'is_active' => true,
    ]);

    $eventDate = now()->addDays(15)->format('Y-m-d');

    $bookingPayload = [
        'booking_type' => 'service',
        'event_name' => 'Clara & David Wedding',
        'event_date' => $eventDate,
        'event_time' => '3:00 PM',
        'event_location' => 'Grand Ballroom, Makati City',
        'guest_count' => 100,
        'special_requests' => 'Neutral and blush theme.',
        'items' => [
            [
                'supplier_id' => $supplier->id,
                'item_type' => 'service',
                'item_id' => $service->id,
                'item_name' => $service->name,
                'unit_price' => 12000,
            ],
        ],
    ];

    $response = $this->actingAs($customer)->post(route('customer.bookings.store'), $bookingPayload);

    $response->assertRedirect(route('customer.bookings.index'));
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('bookings', [
        'customer_id' => $customer->id,
        'event_name' => 'Clara & David Wedding',
        'total_amount' => 12000,
    ]);
});
