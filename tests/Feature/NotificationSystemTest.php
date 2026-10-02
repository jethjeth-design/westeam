<?php

use App\Models\User;
use App\Services\NotificationService;
use Inertia\Testing\AssertableInertia as Assert;

test('authenticated user can view the notification center', function () {
    $user = User::factory()->create(['role' => 'customer']);

    NotificationService::send(
        recipients: $user,
        title: 'Welcome to Westeam',
        message: 'Your account has been created.',
        actionUrl: route('customer.dashboard'),
        category: 'system',
        type: 'welcome',
        icon: '🎉',
        role: 'customer'
    );

    $response = $this->actingAs($user)
        ->get(route('notifications.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Notifications/Index')
        ->has('notifications.data', 1)
        ->where('counts.unread', 1)
        ->where('counts.all', 1)
    );
});

test('user can mark a single notification as read', function () {
    $user = User::factory()->create(['role' => 'supplier']);

    NotificationService::send(
        recipients: $user,
        title: 'New Booking Request',
        message: 'You have a booking request.',
        actionUrl: route('supplier.bookings.index'),
        category: 'booking',
        type: 'supplier_new_booking',
        icon: '📅',
        role: 'supplier'
    );

    $notification = $user->unreadNotifications()->first();
    expect($notification)->not->toBeNull();

    $response = $this->actingAs($user)
        ->post(route('notifications.mark-as-read', $notification->id));

    $response->assertRedirect();
    expect($user->unreadNotifications()->count())->toBe(0);
    expect($user->readNotifications()->count())->toBe(1);
});

test('user can mark all notifications as read', function () {
    $user = User::factory()->create(['role' => 'admin']);

    NotificationService::send($user, 'Notice 1', 'Message 1', '/admin/dashboard');
    NotificationService::send($user, 'Notice 2', 'Message 2', '/admin/dashboard');

    expect($user->unreadNotifications()->count())->toBe(2);

    $response = $this->actingAs($user)
        ->post(route('notifications.mark-all-read'));

    $response->assertRedirect();
    expect($user->unreadNotifications()->count())->toBe(0);
    expect($user->readNotifications()->count())->toBe(2);
});

test('user can delete a notification', function () {
    $user = User::factory()->create(['role' => 'customer']);

    NotificationService::send($user, 'Notice to Delete', 'Msg', '/customer/dashboard');
    $notification = $user->notifications()->first();

    $response = $this->actingAs($user)
        ->delete(route('notifications.destroy', $notification->id));

    $response->assertRedirect();
    expect($user->notifications()->count())->toBe(0);
});

test('clicking notification marks it as read and redirects to action url', function () {
    $user = User::factory()->create(['role' => 'customer']);

    NotificationService::send(
        recipients: $user,
        title: 'Booking Accepted',
        message: 'Your booking has been accepted.',
        actionUrl: '/customer/bookings',
        category: 'booking'
    );

    $notification = $user->unreadNotifications()->first();

    $response = $this->actingAs($user)
        ->get(route('notifications.go', $notification->id));

    $response->assertRedirect('/customer/bookings');
    expect($user->unreadNotifications()->count())->toBe(0);
});

test('shared inertia props include unread notifications count and recent notifications', function () {
    $user = User::factory()->create(['role' => 'supplier']);

    NotificationService::send(
        recipients: $user,
        title: 'Payment Received',
        message: 'A payment was submitted.',
        actionUrl: '/supplier/payments',
        category: 'payment'
    );

    $response = $this->actingAs($user)
        ->get(route('dashboard'));

    $response->assertRedirect();

    $response = $this->actingAs($user)
        ->get(route('supplier.dashboard'));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('unread_notifications_count', 1)
        ->has('recent_notifications', 1)
    );
});
