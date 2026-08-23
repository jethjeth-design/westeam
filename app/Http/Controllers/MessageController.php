<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\Team;
use App\Models\User;
use App\Notifications\NewMessageNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MessageController extends Controller
{
    /**
     * Display messaging dashboard with conversations and active chat.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $activeConversationId = $request->query('conversation');

        // Fetch conversations user participates in
        $conversations = Conversation::whereHas('participants', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->with([
                'creator',
                'team',
                'participants.user.supplierProfile.categories',
                'latestMessage.sender',
            ])
            ->get()
            ->map(function ($conv) use ($user) {
                $otherParticipants = $conv->participants
                    ->where('user_id', '!=', $user->id)
                    ->map(fn ($p) => $p->user);

                $participant = $conv->participants->where('user_id', $user->id)->first();
                $lastReadAt = $participant ? $participant->last_read_at : null;

                $unreadCount = $conv->messages()
                    ->where('sender_id', '!=', $user->id)
                    ->when($lastReadAt, fn ($q) => $q->where('created_at', '>', $lastReadAt))
                    ->count();

                // Build friendly title if not set
                $displayTitle = $conv->title;
                if (! $displayTitle) {
                    if ($conv->type === 'team_internal') {
                        $displayTitle = ($conv->team ? $conv->team->name : 'Team').' (Internal Collaboration)';
                    } elseif ($conv->type === 'team_coordinator') {
                        $coordinator = $conv->team?->coordinator;
                        $displayTitle = 'Team Coordinator ('.($coordinator?->name ?? 'Coordinator').')';
                    } else {
                        $other = $otherParticipants->first();
                        $displayTitle = $other?->supplierProfile?->business_name ?: ($other?->name ?: 'Direct Chat');
                    }
                }

                return [
                    'id' => $conv->id,
                    'type' => $conv->type,
                    'title' => $displayTitle,
                    'team_id' => $conv->team_id,
                    'booking_id' => $conv->booking_id,
                    'event_id' => $conv->event_id,
                    'unread_count' => $unreadCount,
                    'updated_at' => $conv->updated_at,
                    'latest_message' => $conv->latestMessage ? [
                        'id' => $conv->latestMessage->id,
                        'sender_name' => $conv->latestMessage->sender?->name,
                        'body' => $conv->latestMessage->body,
                        'has_attachment' => (bool) $conv->latestMessage->attachment_path,
                        'created_at' => $conv->latestMessage->created_at->diffForHumans(),
                    ] : null,
                    'other_participants' => $otherParticipants->values()->map(fn ($u) => [
                        'id' => $u->id,
                        'name' => $u->name,
                        'business_name' => $u->supplierProfile?->business_name,
                        'avatar' => $u->supplierProfile?->profile_picture ? Storage::url($u->supplierProfile->profile_picture) : null,
                    ]),
                ];
            })
            ->sortByDesc(fn ($c) => $c['latest_message']['id'] ?? $c['id'])
            ->values();

        // Active conversation and messages
        $activeConversation = null;
        $messages = [];

        if ($activeConversationId) {
            $activeConvModel = Conversation::where('id', $activeConversationId)
                ->whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
                ->with(['participants.user.supplierProfile', 'team.coordinator'])
                ->first();

            if ($activeConvModel) {
                // Mark as read
                ConversationParticipant::where('conversation_id', $activeConvModel->id)
                    ->where('user_id', $user->id)
                    ->update(['last_read_at' => now()]);

                $messages = Message::where('conversation_id', $activeConvModel->id)
                    ->with('sender.supplierProfile')
                    ->orderBy('created_at', 'asc')
                    ->get()
                    ->map(fn ($msg) => [
                        'id' => $msg->id,
                        'sender_id' => $msg->sender_id,
                        'sender_name' => $msg->sender?->supplierProfile?->business_name ?: $msg->sender?->name,
                        'sender_avatar' => $msg->sender?->supplierProfile?->profile_picture ? Storage::url($msg->sender->supplierProfile->profile_picture) : null,
                        'body' => $msg->body,
                        'attachment_url' => $msg->attachment_url,
                        'attachment_name' => $msg->attachment_name,
                        'attachment_type' => $msg->attachment_type,
                        'created_at' => $msg->created_at->format('M d, Y g:i A'),
                        'time_ago' => $msg->created_at->diffForHumans(),
                        'is_me' => $msg->sender_id === $user->id,
                    ]);

                $other = $activeConvModel->participants->where('user_id', '!=', $user->id)->first()?->user;
                $activeConversation = [
                    'id' => $activeConvModel->id,
                    'type' => $activeConvModel->type,
                    'title' => $activeConvModel->title ?: ($other?->supplierProfile?->business_name ?: ($other?->name ?: 'Chat')),
                    'team' => $activeConvModel->team ? [
                        'id' => $activeConvModel->team->id,
                        'name' => $activeConvModel->team->name,
                        'coordinator_name' => $activeConvModel->team->coordinator?->name,
                    ] : null,
                    'participants' => $activeConvModel->participants->map(fn ($p) => [
                        'id' => $p->user_id,
                        'name' => $p->user?->name,
                        'business_name' => $p->user?->supplierProfile?->business_name,
                        'role' => $p->role,
                        'avatar' => $p->user?->supplierProfile?->profile_picture ? Storage::url($p->user->supplierProfile->profile_picture) : null,
                    ]),
                ];
            }
        }

        return Inertia::render('Messages/Index', [
            'conversations' => $conversations,
            'activeConversation' => $activeConversation,
            'messages' => $messages,
        ]);
    }

    /**
     * Send a message to a conversation.
     */
    public function store(Request $request, Conversation $conversation)
    {
        $user = Auth::user();

        // Ensure user is participant
        if (! $conversation->hasParticipant($user->id)) {
            abort(403, 'Unauthorized access to this conversation.');
        }

        $request->validate([
            'body' => 'nullable|string|max:5000',
            'attachment' => 'nullable|file|max:10240|mimes:jpg,jpeg,png,gif,pdf,doc,docx,zip',
        ]);

        if (empty($request->body) && ! $request->hasFile('attachment')) {
            return back()->withErrors(['body' => 'Please type a message or attach a file.']);
        }

        $attachmentPath = null;
        $attachmentName = null;
        $attachmentType = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentPath = $file->store('message_attachments', 'public');
            $attachmentName = $file->getClientOriginalName();
            $attachmentType = $file->getClientMimeType();
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'body' => $request->body,
            'attachment_path' => $attachmentPath,
            'attachment_name' => $attachmentName,
            'attachment_type' => $attachmentType,
        ]);

        // Update conversation timestamp
        $conversation->touch();

        // Update sender last_read_at
        ConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->update(['last_read_at' => now()]);

        // Notify other participants (queued)
        $otherParticipants = $conversation->participants()->where('user_id', '!=', $user->id)->with('user')->get();
        foreach ($otherParticipants as $part) {
            if ($part->user) {
                try {
                    $part->user->notify(new NewMessageNotification($message, $user));
                } catch (\Throwable $e) {
                    // Log or ignore if mail server is unconfigured
                }
            }
        }

        return redirect()->route('messages.index', ['conversation' => $conversation->id]);
    }

    /**
     * Start or find a direct conversation with a supplier or customer.
     */
    public function startDirect(Request $request, User $supplier)
    {
        $user = Auth::user();

        if ($user->id === $supplier->id) {
            return back()->with('error', 'You cannot message yourself.');
        }

        // Find existing direct conversation between these two
        $existing = Conversation::where('type', 'direct')
            ->whereNull('team_id')
            ->whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
            ->whereHas('participants', fn ($q) => $q->where('user_id', $supplier->id))
            ->first();

        if ($existing) {
            return redirect()->route('messages.index', ['conversation' => $existing->id]);
        }

        // Create new direct conversation
        $title = $supplier->supplierProfile?->business_name ?: $supplier->name;
        $conversation = Conversation::create([
            'type' => 'direct',
            'title' => $title,
            'created_by' => $user->id,
            'booking_id' => $request->booking_id,
            'event_id' => $request->event_id,
        ]);

        ConversationParticipant::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'role' => $user->role === 'supplier' ? 'supplier' : 'customer',
            'last_read_at' => now(),
        ]);

        ConversationParticipant::create([
            'conversation_id' => $conversation->id,
            'user_id' => $supplier->id,
            'role' => $supplier->role === 'supplier' ? 'supplier' : 'customer',
        ]);

        // If an initial message was provided
        if ($request->filled('initial_message')) {
            Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user->id,
                'body' => $request->initial_message,
            ]);
        }

        return redirect()->route('messages.index', ['conversation' => $conversation->id]);
    }

    /**
     * Start or find conversation between customer and Team Coordinator.
     */
    public function startTeamCoordinatorChat(Request $request, Team $team)
    {
        $user = Auth::user();
        $coordinator = $team->coordinator;

        if (! $coordinator) {
            return back()->with('error', 'This team does not have an active coordinator.');
        }

        // Find existing coordinator conversation
        $existing = Conversation::where('type', 'team_coordinator')
            ->where('team_id', $team->id)
            ->whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
            ->whereHas('participants', fn ($q) => $q->where('user_id', $coordinator->id))
            ->first();

        if ($existing) {
            return redirect()->route('messages.index', ['conversation' => $existing->id]);
        }

        $conversation = Conversation::create([
            'type' => 'team_coordinator',
            'title' => $team->name.' (Team Coordinator)',
            'team_id' => $team->id,
            'created_by' => $user->id,
            'booking_id' => $request->booking_id,
        ]);

        ConversationParticipant::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'role' => 'customer',
            'last_read_at' => now(),
        ]);

        ConversationParticipant::create([
            'conversation_id' => $conversation->id,
            'user_id' => $coordinator->id,
            'role' => 'coordinator',
        ]);

        return redirect()->route('messages.index', ['conversation' => $conversation->id]);
    }

    /**
     * Start or open internal team collaboration chat (For team members only).
     */
    public function openTeamInternalChat(Team $team)
    {
        $user = Auth::user();

        // Check if user is coordinator or accepted team member
        $isCoordinator = $team->coordinator_id === $user->id;
        $isAcceptedMember = $team->acceptedMembers()->where('supplier_id', $user->id)->exists();

        if (! $isCoordinator && ! $isAcceptedMember) {
            abort(403, 'You must be a member of this team to access the internal chat.');
        }

        // Find existing internal team chat
        $conversation = Conversation::where('type', 'team_internal')
            ->where('team_id', $team->id)
            ->first();

        if (! $conversation) {
            $conversation = Conversation::create([
                'type' => 'team_internal',
                'title' => $team->name.' — Team Internal Chat',
                'team_id' => $team->id,
                'created_by' => $user->id,
            ]);

            // Add coordinator
            ConversationParticipant::firstOrCreate([
                'conversation_id' => $conversation->id,
                'user_id' => $team->coordinator_id,
            ], [
                'role' => 'coordinator',
            ]);
        }

        // Ensure all accepted members are in the conversation participants
        $allTeamUserIds = $team->acceptedMembers->pluck('supplier_id')->push($team->coordinator_id)->unique();
        foreach ($allTeamUserIds as $uId) {
            ConversationParticipant::firstOrCreate([
                'conversation_id' => $conversation->id,
                'user_id' => $uId,
            ], [
                'role' => $uId === $team->coordinator_id ? 'coordinator' : 'member',
            ]);
        }

        return redirect()->route('messages.index', ['conversation' => $conversation->id]);
    }
}
