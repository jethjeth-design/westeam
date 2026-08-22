<?php

use App\Models\EventCategory;
use App\Models\Package;
use App\Models\Service;
use App\Models\SupplierProfile;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;

test('registered and approved supplier can create a team and becomes coordinator', function () {
    $supplier = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create([
        'user_id' => $supplier->id,
        'status' => 'approved',
        'business_name' => 'Elite Wedding Planners',
    ]);

    $response = $this->actingAs($supplier)->post(route('supplier.teams.store'), [
        'name' => 'Grand Wedding Dream Team',
        'description' => 'Comprehensive wedding team with top vendors.',
    ]);

    $this->assertDatabaseHas('teams', [
        'coordinator_id' => $supplier->id,
        'name' => 'Grand Wedding Dream Team',
    ]);

    $team = Team::where('name', 'Grand Wedding Dream Team')->first();

    $this->assertDatabaseHas('team_members', [
        'team_id' => $team->id,
        'supplier_id' => $supplier->id,
        'role_title' => 'Coordinator',
        'status' => 'accepted',
    ]);

    $response->assertRedirect(route('supplier.teams.show', $team->id));
});

test('team coordinator can invite other registered suppliers and member can accept', function () {
    $coordinator = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create(['user_id' => $coordinator->id, 'status' => 'approved', 'business_name' => 'Lead Events']);

    $team = Team::create([
        'coordinator_id' => $coordinator->id,
        'name' => 'Cebu All-Star Team',
    ]);
    TeamMember::create([
        'team_id' => $team->id,
        'supplier_id' => $coordinator->id,
        'role_title' => 'Coordinator',
        'status' => 'accepted',
    ]);

    $caterer = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create(['user_id' => $caterer->id, 'status' => 'approved', 'business_name' => 'Cebu Feast Catering']);

    // Coordinator invites caterer
    $this->actingAs($coordinator)->post(route('supplier.teams.invite', $team->id), [
        'supplier_id' => $caterer->id,
        'role_title' => 'Catering Specialist',
    ])->assertSessionHas('success');

    $memberEntry = TeamMember::where('team_id', $team->id)->where('supplier_id', $caterer->id)->first();
    expect($memberEntry)->not->toBeNull();
    expect($memberEntry->status)->toBe('pending');
    expect($memberEntry->role_title)->toBe('Catering Specialist');

    // Caterer accepts invitation
    $this->actingAs($caterer)->post(route('supplier.teams.invitations.accept', $memberEntry->id))
        ->assertSessionHas('success');

    expect($memberEntry->fresh()->status)->toBe('accepted');
});

test('coordinator can create a team package combining multiple suppliers services', function () {
    $coordinator = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create(['user_id' => $coordinator->id, 'status' => 'approved', 'business_name' => 'Prime Coordinator']);
    $coordService = Service::create([
        'supplier_id' => $coordinator->id,
        'name' => 'Full Day Coordination',
        'price' => 20000,
        'is_active' => true,
    ]);

    $photographer = User::factory()->create(['role' => 'supplier']);
    SupplierProfile::create(['user_id' => $photographer->id, 'status' => 'approved', 'business_name' => 'ABC Photos']);
    $photoService = Service::create([
        'supplier_id' => $photographer->id,
        'name' => 'Wedding Photography Coverage',
        'price' => 35000,
        'is_active' => true,
    ]);

    $team = Team::create([
        'coordinator_id' => $coordinator->id,
        'name' => 'Unified Wedding Group',
    ]);
    TeamMember::create(['team_id' => $team->id, 'supplier_id' => $coordinator->id, 'role_title' => 'Coordinator', 'status' => 'accepted']);
    TeamMember::create(['team_id' => $team->id, 'supplier_id' => $photographer->id, 'role_title' => 'Photography', 'status' => 'accepted']);

    $category = EventCategory::create(['name' => 'Weddings', 'is_active' => true]);

    $response = $this->actingAs($coordinator)->post(route('supplier.packages.store'), [
        'name' => 'All-in Wedding Dream Bundle',
        'team_id' => $team->id,
        'event_category_id' => $category->id,
        'price' => 50000,
        'description' => 'Complete coordination and photography package bundle.',
        'service_ids' => [$coordService->id, $photoService->id],
        'is_active' => true,
    ]);

    $response->assertRedirect(route('supplier.packages.index'));

    $package = Package::where('name', 'All-in Wedding Dream Bundle')->first();
    expect($package)->not->toBeNull();
    expect($package->team_id)->toBe($team->id);
    expect($package->services)->toHaveCount(2);
});
