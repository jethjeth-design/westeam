<?php

use App\Models\Conversation;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('customer can initiate direct message with a supplier', function () {
    $customer = User::factory()->create(['role' => 'customer']);
    $supplier = User::factory()->create(['role' => 'supplier']);

    $response = $this->actingAs($customer)->post(route('messages.direct', $supplier->id), [
        'initial_message' => 'Hello, I would like to inquire about wedding photography.',
    ]);

    $response->assertRedirect();

    $conversation = Conversation::where('type', 'direct')->first();
    expect($conversation)->not->toBeNull()
        ->and($conversation->messages)->toHaveCount(1)
        ->and($conversation->hasParticipant($customer->id))->toBeTrue()
        ->and($conversation->hasParticipant($supplier->id))->toBeTrue();
});

test('supplier can send a message with file attachment', function () {
    Storage::fake('public');

    $customer = User::factory()->create(['role' => 'customer']);
    $supplier = User::factory()->create(['role' => 'supplier']);

    $conversation = Conversation::create([
        'type' => 'direct',
        'created_by' => $customer->id,
    ]);

    $conversation->participants()->createMany([
        ['user_id' => $customer->id, 'role' => 'customer'],
        ['user_id' => $supplier->id, 'role' => 'supplier'],
    ]);

    $file = UploadedFile::fake()->create('contract.pdf', 100);

    $response = $this->actingAs($supplier)->post(route('messages.store', $conversation->id), [
        'body' => 'Here is the draft proposal contract.',
        'attachment' => $file,
    ]);

    $response->assertRedirect();

    $message = $conversation->messages()->latest()->first();
    expect($message)->not->toBeNull()
        ->and($message->body)->toBe('Here is the draft proposal contract.')
        ->and($message->attachment_name)->toBe('contract.pdf');
});

test('team internal chat is accessible only by coordinator and accepted members, not customer', function () {
    $coordinator = User::factory()->create(['role' => 'supplier']);
    $member = User::factory()->create(['role' => 'supplier']);
    $customer = User::factory()->create(['role' => 'customer']);

    $team = Team::create([
        'coordinator_id' => $coordinator->id,
        'name' => 'Elite Wedding Team',
    ]);

    TeamMember::create([
        'team_id' => $team->id,
        'supplier_id' => $member->id,
        'role_title' => 'Photographer',
        'status' => 'accepted',
    ]);

    // Coordinator opens internal chat
    $response = $this->actingAs($coordinator)->get(route('messages.team.internal', $team->id));
    $response->assertRedirect();

    // Member opens internal chat
    $memberResponse = $this->actingAs($member)->get(route('messages.team.internal', $team->id));
    $memberResponse->assertRedirect();

    // Customer is unauthorized
    $customerResponse = $this->actingAs($customer)->get(route('messages.team.internal', $team->id));
    $customerResponse->assertStatus(403);
});
