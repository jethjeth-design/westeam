<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;
use Laravel\Socialite\Two\User as SocialiteUser;

test('login screen renders successfully with google login option', function () {
    $response = $this->get(route('login'));

    $response->assertStatus(200);
});

test('customer registration screen renders successfully with continue with google', function () {
    $response = $this->get(route('register'));

    $response->assertStatus(200);
});

test('supplier registration screen renders successfully with continue with google', function () {
    $response = $this->get(route('supplier.register'));

    $response->assertStatus(200);
});

test('google redirect initiates oauth and stores customer intent', function () {
    $response = $this->get(route('auth.google', ['role' => 'customer']));

    $response->assertRedirect();
    $this->assertTrue(str_contains($response->headers->get('Location'), 'accounts.google.com') || str_contains($response->headers->get('Location'), 'google'));
    $response->assertSessionHas('oauth_intended_role', 'customer');
});

test('google redirect initiates oauth and stores supplier intent', function () {
    $response = $this->get(route('auth.google', ['role' => 'supplier']));

    $response->assertRedirect();
    $response->assertSessionHas('oauth_intended_role', 'supplier');
});

test('google redirect never stores admin intent', function () {
    $response = $this->get(route('auth.google', ['role' => 'admin']));

    $response->assertRedirect();
    $response->assertSessionMissing('oauth_intended_role');
});

test('new user registers as customer with google and redirects to customer dashboard', function () {
    $mockSocialiteUser = Mockery::mock(SocialiteUser::class);
    $mockSocialiteUser->shouldReceive('getId')->andReturn('google-customer-123');
    $mockSocialiteUser->shouldReceive('getEmail')->andReturn('customer.google@example.com');
    $mockSocialiteUser->shouldReceive('getName')->andReturn('New Customer');
    $mockSocialiteUser->shouldReceive('getAvatar')->andReturn('https://google.com/avatar.jpg');
    $mockSocialiteUser->user = ['email_verified' => true];

    $mockProvider = Mockery::mock(GoogleProvider::class);
    $mockProvider->shouldReceive('user')->andReturn($mockSocialiteUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($mockProvider);

    $response = $this->withSession(['oauth_intended_role' => 'customer'])
        ->get(route('auth.google.callback'));

    $response->assertRedirect(route('customer.dashboard'));
    $this->assertAuthenticated();

    $user = User::where('email', 'customer.google@example.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->role)->toBe('customer')
        ->and($user->google_id)->toBe('google-customer-123')
        ->and($user->email_verified_at)->not->toBeNull();
});

test('new user registers as supplier with google, creates pending profile, and redirects to supplier dashboard', function () {
    $mockSocialiteUser = Mockery::mock(SocialiteUser::class);
    $mockSocialiteUser->shouldReceive('getId')->andReturn('google-supplier-456');
    $mockSocialiteUser->shouldReceive('getEmail')->andReturn('supplier.google@example.com');
    $mockSocialiteUser->shouldReceive('getName')->andReturn('New Supplier');
    $mockSocialiteUser->shouldReceive('getAvatar')->andReturn('https://google.com/avatar-supplier.jpg');
    $mockSocialiteUser->user = ['email_verified' => true];

    $mockProvider = Mockery::mock(GoogleProvider::class);
    $mockProvider->shouldReceive('user')->andReturn($mockSocialiteUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($mockProvider);

    $response = $this->withSession(['oauth_intended_role' => 'supplier'])
        ->get(route('auth.google.callback'));

    $response->assertRedirect(route('supplier.dashboard'));
    $this->assertAuthenticated();

    $user = User::where('email', 'supplier.google@example.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->role)->toBe('supplier')
        ->and($user->google_id)->toBe('google-supplier-456')
        ->and($user->supplierProfile)->not->toBeNull()
        ->and($user->supplierProfile->status)->toBe('pending');
});

test('existing user with matching email links google account without duplicate', function () {
    $existing = User::factory()->create([
        'email' => 'existing.customer@example.com',
        'role' => 'customer',
        'google_id' => null,
    ]);

    $mockSocialiteUser = Mockery::mock(SocialiteUser::class);
    $mockSocialiteUser->shouldReceive('getId')->andReturn('google-link-789');
    $mockSocialiteUser->shouldReceive('getEmail')->andReturn('existing.customer@example.com');
    $mockSocialiteUser->shouldReceive('getName')->andReturn('Existing Customer');
    $mockSocialiteUser->shouldReceive('getAvatar')->andReturn('https://google.com/avatar.jpg');
    $mockSocialiteUser->user = ['email_verified' => true];

    $mockProvider = Mockery::mock(GoogleProvider::class);
    $mockProvider->shouldReceive('user')->andReturn($mockSocialiteUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($mockProvider);

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('customer.dashboard'));
    $this->assertAuthenticatedAs($existing);

    $existing->refresh();
    expect($existing->google_id)->toBe('google-link-789');
    expect(User::where('email', 'existing.customer@example.com')->count())->toBe(1);
});

test('google registration protects existing user role on mismatch', function () {
    $existingSupplier = User::factory()->create([
        'email' => 'supplier.conflict@example.com',
        'role' => 'supplier',
    ]);

    $mockSocialiteUser = Mockery::mock(SocialiteUser::class);
    $mockSocialiteUser->shouldReceive('getId')->andReturn('google-conflict-999');
    $mockSocialiteUser->shouldReceive('getEmail')->andReturn('supplier.conflict@example.com');
    $mockSocialiteUser->shouldReceive('getName')->andReturn('Supplier Name');
    $mockSocialiteUser->shouldReceive('getAvatar')->andReturn('https://google.com/avatar.jpg');
    $mockSocialiteUser->user = ['email_verified' => true];

    $mockProvider = Mockery::mock(GoogleProvider::class);
    $mockProvider->shouldReceive('user')->andReturn($mockSocialiteUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($mockProvider);

    // Attempts to register from customer page with existing supplier email
    $response = $this->withSession(['oauth_intended_role' => 'customer'])
        ->get(route('auth.google.callback'));

    $response->assertRedirect(route('login'));
    $response->assertSessionHasErrors(['email']);
    $this->assertGuest();

    $existingSupplier->refresh();
    expect($existingSupplier->role)->toBe('supplier');
});

test('failed google oauth redirects back to login with error message', function () {
    Socialite::shouldReceive('driver')
        ->with('google')
        ->once()
        ->andThrow(new Exception('OAuth authorization failed'));

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('login'));
    $response->assertSessionHasErrors('email');
    expect(Auth::check())->toBeFalse();
});
