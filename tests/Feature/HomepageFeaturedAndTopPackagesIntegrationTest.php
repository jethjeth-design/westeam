<?php

use App\Models\EventCategory;
use App\Models\HomepageBanner;
use App\Models\Package;
use App\Models\Service;
use App\Models\SupplierProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('homepage automatically displays featured suppliers and excludes non-featured suppliers', function () {
    $supplier1 = User::factory()->create(['role' => 'supplier']);
    $featuredProfile = SupplierProfile::create([
        'user_id' => $supplier1->id,
        'status' => 'approved',
        'business_name' => 'Featured Studio A',
        'is_featured' => true,
        'featured_score' => 88.5,
    ]);

    $supplier2 = User::factory()->create(['role' => 'supplier']);
    $nonFeaturedProfile = SupplierProfile::create([
        'user_id' => $supplier2->id,
        'status' => 'approved',
        'business_name' => 'Regular Studio B',
        'is_featured' => false,
        'featured_score' => 20.0,
    ]);

    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Welcome')
        ->has('featuredSuppliers', 1)
        ->where('featuredSuppliers.0.business_name', 'Featured Studio A')
        ->where('featuredSuppliers.0.is_featured', true)
    );
});

test('homepage automatically reflects admin changing supplier featured status', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $supplier = User::factory()->create(['role' => 'supplier']);
    $profile = SupplierProfile::create([
        'user_id' => $supplier->id,
        'status' => 'approved',
        'business_name' => 'Dynamic Wedding Pros',
        'is_featured' => false,
    ]);

    // Initially not on featured suppliers list
    $this->get(route('home'))
        ->assertInertia(fn ($page) => $page->has('featuredSuppliers', 0));

    // Admin features the supplier
    $this->actingAs($admin)
        ->post(route('admin.featured-suppliers.feature', $profile->id))
        ->assertRedirect();

    expect($profile->fresh()->is_featured)->toBeTrue();

    // Now homepage immediately displays this featured supplier
    $this->get(route('home'))
        ->assertInertia(fn ($page) => $page
            ->has('featuredSuppliers', 1)
            ->where('featuredSuppliers.0.business_name', 'Dynamic Wedding Pros')
        );

    // Admin unfeatures supplier
    $this->actingAs($admin)
        ->post(route('admin.featured-suppliers.unfeature', $profile->id))
        ->assertRedirect();

    expect($profile->fresh()->is_featured)->toBeFalse();

    // Homepage immediately removes supplier from featured list
    $this->get(route('home'))
        ->assertInertia(fn ($page) => $page->has('featuredSuppliers', 0));
});

test('homepage automatically displays top packages and reflects admin toggling top status', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $supplier = User::factory()->create(['role' => 'supplier']);
    $category = EventCategory::create(['name' => 'Weddings']);

    $package = Package::create([
        'supplier_id' => $supplier->id,
        'event_category_id' => $category->id,
        'name' => 'Grand Regal Wedding Package',
        'price' => 50000,
        'is_active' => true,
        'is_top_package' => false,
        'is_featured' => false,
    ]);

    // Initially not in top packages
    $this->get(route('home'))
        ->assertInertia(fn ($page) => $page->has('topPackages', 0));

    // Admin marks package as top package
    $this->actingAs($admin)
        ->post(route('admin.top-packages.feature', $package->id))
        ->assertRedirect();

    expect($package->fresh()->is_top_package)->toBeTrue();

    // Homepage immediately displays top package
    $this->get(route('home'))
        ->assertInertia(fn ($page) => $page
            ->has('topPackages', 1)
            ->where('topPackages.0.name', 'Grand Regal Wedding Package')
        );

    // Admin removes package from top packages
    $this->actingAs($admin)
        ->post(route('admin.top-packages.unfeature', $package->id))
        ->assertRedirect();

    expect($package->fresh()->is_top_package)->toBeFalse();

    $this->get(route('home'))
        ->assertInertia(fn ($page) => $page->has('topPackages', 0));
});

test('admin can upload photo when creating and updating homepage banner', function () {
    Storage::fake('public');

    $admin = User::factory()->create(['role' => 'admin']);
    $file = UploadedFile::fake()->create('banner1.jpg', 100, 'image/jpeg');

    $response = $this->actingAs($admin)
        ->post(route('admin.homepage.banners.store'), [
            'title' => 'New Season Banner',
            'badge' => 'Exclusive Deals',
            'subtitle' => 'Book premier suppliers today.',
            'image' => $file,
            'is_active' => true,
        ]);

    $response->assertRedirect();
    $banner = HomepageBanner::latest()->first();

    expect($banner)->not->toBeNull();
    expect($banner->image_url)->toStartWith('/storage/banners/');
    Storage::disk('public')->assertExists(str_replace('/storage/', '', $banner->image_url));

    // Update banner with new image
    $newFile = UploadedFile::fake()->create('banner2.jpg', 120, 'image/jpeg');
    $updateResponse = $this->actingAs($admin)
        ->post(route('admin.homepage.banners.update', $banner->id), [
            '_method' => 'PUT',
            'title' => 'Updated Banner Title',
            'image' => $newFile,
        ]);

    $updateResponse->assertRedirect();
    $updatedBanner = $banner->fresh();
    expect($updatedBanner->title)->toBe('Updated Banner Title');
    expect($updatedBanner->image_url)->toStartWith('/storage/banners/');
    Storage::disk('public')->assertExists(str_replace('/storage/', '', $updatedBanner->image_url));
});

test('admin can upload photo when creating and updating event category', function () {
    Storage::fake('public');

    $admin = User::factory()->create(['role' => 'admin']);
    $file = UploadedFile::fake()->create('wedding.jpg', 80, 'image/jpeg');

    $response = $this->actingAs($admin)
        ->post(route('admin.event-categories.store'), [
            'name' => 'Corporate Galas',
            'description' => 'Summits and grand corporate galas.',
            'image' => $file,
            'is_active' => true,
        ]);

    $response->assertRedirect(route('admin.event-categories.index'));
    $category = EventCategory::where('name', 'Corporate Galas')->first();

    expect($category)->not->toBeNull();
    expect($category->image_url)->toStartWith('/storage/event-categories/');
    Storage::disk('public')->assertExists(str_replace('/storage/', '', $category->image_url));

    // Update category photo
    $newFile = UploadedFile::fake()->create('corporate_new.jpg', 90, 'image/jpeg');
    $this->actingAs($admin)
        ->post(route('admin.event-categories.update-post', $category->id), [
            '_method' => 'PUT',
            'name' => 'Corporate Galas & Summits',
            'image' => $newFile,
        ])
        ->assertRedirect(route('admin.event-categories.index'));

    $updatedCategory = $category->fresh();
    expect($updatedCategory->name)->toBe('Corporate Galas & Summits');
    expect($updatedCategory->image_url)->toStartWith('/storage/event-categories/');
    Storage::disk('public')->assertExists(str_replace('/storage/', '', $updatedCategory->image_url));
});

test('homepage displays available services from approved suppliers and excludes unapproved or inactive', function () {
    $approvedSupplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $approvedSupplier->id,
        'business_name' => 'Royal Floral Designs',
        'status' => 'approved',
        'address' => 'Quezon City, Metro Manila',
    ]);

    $activeService = Service::create([
        'supplier_id' => $approvedSupplier->id,
        'name' => 'Grand Arch Floral Installation',
        'category' => 'Florals & Decor',
        'price' => 18500,
        'description' => 'Custom arch florals with imported roses and greenery.',
        'image_path' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
        'is_active' => true,
    ]);

    $inactiveService = Service::create([
        'supplier_id' => $approvedSupplier->id,
        'name' => 'Old Inactive Package',
        'category' => 'Florals & Decor',
        'price' => 5000,
        'is_active' => false,
    ]);

    $pendingSupplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $pendingSupplier->id,
        'business_name' => 'Unverified Vendor',
        'status' => 'pending',
    ]);

    $unapprovedService = Service::create([
        'supplier_id' => $pendingSupplier->id,
        'name' => 'Unverified Service Offering',
        'category' => 'Catering',
        'price' => 20000,
        'is_active' => true,
    ]);

    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Welcome')
        ->has('services', 1)
        ->where('services.0.id', $activeService->id)
        ->where('services.0.name', 'Grand Arch Floral Installation')
        ->where('services.0.supplier_name', 'Royal Floral Designs')
        ->where('services.0.price', 18500)
    );
});
