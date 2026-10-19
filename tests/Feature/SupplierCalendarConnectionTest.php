<?php

use App\Models\SupplierCalendarAccount;
use App\Models\SupplierProfile;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;
use Laravel\Socialite\Two\User as SocialiteUser;

beforeEach(function () {
    Notification::fake();
});

test('supplier calendar connect redirects to google with calendar.events scope and offline access', function () {
    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'business_name' => 'Royal Photography',
        'status' => 'approved',
    ]);

    $response = $this->actingAs($supplier)->get(route('supplier.calendar.connect'));

    $response->assertRedirect();
    $targetUrl = $response->headers->get('Location');

    expect($targetUrl)->toContain('accounts.google.com')
        ->toContain('calendar.events')
        ->toContain('offline');

    $this->assertTrue(session()->has('google_calendar_connect'));
    $this->assertEquals($supplier->id, session()->get('google_calendar_supplier_id'));
});

test('supplier calendar callback handles user cancellation or google access_denied cleanly', function () {
    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'business_name' => 'Royal Floral',
        'status' => 'approved',
    ]);

    $response = $this->actingAs($supplier)->get(route('supplier.calendar.callback', [
        'error' => 'access_denied',
        'error_description' => 'The user denied request to access scopes',
    ]));

    $response->assertRedirect(route('supplier.availability.index'));
    $response->assertSessionHas('error', 'Google Calendar authorization was cancelled or access was denied.');
});

test('supplier calendar callback securely stores tokens and hides them from serialization', function () {
    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'business_name' => 'Royal Catering',
        'status' => 'approved',
    ]);

    $mockSocialiteUser = Mockery::mock(SocialiteUser::class);
    $mockSocialiteUser->token = 'mock-google-access-token-xyz';
    $mockSocialiteUser->refreshToken = 'mock-google-refresh-token-abc';
    $mockSocialiteUser->expiresIn = 3600;
    $mockSocialiteUser->shouldReceive('getId')->andReturn('google-calendar-id-999');
    $mockSocialiteUser->shouldReceive('getEmail')->andReturn('supplier.calendar@gmail.com');

    $mockProvider = Mockery::mock(GoogleProvider::class);
    $mockProvider->shouldReceive('redirectUrl')->andReturnSelf();
    $mockProvider->shouldReceive('user')->andReturn($mockSocialiteUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($mockProvider);

    $response = $this->actingAs($supplier)
        ->withSession([
            'google_calendar_connect' => true,
            'google_calendar_supplier_id' => $supplier->id,
        ])
        ->get(route('supplier.calendar.callback', ['code' => 'mock-auth-code']));

    $response->assertRedirect(route('supplier.availability.index'));
    $response->assertSessionHas('success');

    $account = SupplierCalendarAccount::where('supplier_id', $supplier->id)->first();
    expect($account)->not->toBeNull();
    expect($account->google_email)->toBe('supplier.calendar@gmail.com');
    expect($account->access_token)->toBe('mock-google-access-token-xyz');
    expect($account->refresh_token)->toBe('mock-google-refresh-token-abc');

    // Verify tokens are hidden from model array / json serialization
    $accountArray = $account->toArray();
    expect(array_key_exists('access_token', $accountArray))->toBeFalse();
    expect(array_key_exists('refresh_token', $accountArray))->toBeFalse();
});
