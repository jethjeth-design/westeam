<?php

namespace App\Http\Middleware;

use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Message;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $unreadMessagesCount = 0;
        $pendingBookingsCount = 0;

        $unreadNotificationsCount = 0;
        $recentNotifications = [];

        if ($user) {
            // Unread notifications and recent list for notification bell dropdown
            $unreadNotificationsCount = $user->unreadNotifications()->count();
            $recentNotifications = $user->notifications()
                ->latest()
                ->take(8)
                ->get()
                ->map(function ($n) {
                    $data = $n->data ?? [];

                    return [
                        'id' => $n->id,
                        'read' => ! is_null($n->read_at),
                        'read_at' => $n->read_at?->toISOString(),
                        'created_at' => $n->created_at?->toISOString(),
                        'created_at_human' => $n->created_at?->diffForHumans(),
                        'title' => $data['title'] ?? 'Notification',
                        'message' => $data['message'] ?? '',
                        'action_url' => $data['action_url'] ?? route('notifications.index'),
                        'category' => $data['category'] ?? 'system',
                        'type' => $data['type'] ?? 'general',
                        'icon' => $data['icon'] ?? '🔔',
                        'role' => $data['role'] ?? null,
                    ];
                })
                ->values()
                ->all();

            // Unread messages count for all authenticated users
            $unreadMessagesCount = Message::where('sender_id', '!=', $user->id)
                ->whereIn('conversation_id', function ($query) use ($user) {
                    $query->select('conversation_id')
                        ->from('conversation_participants')
                        ->where('user_id', $user->id);
                })
                ->where(function ($query) use ($user) {
                    $query->whereExists(function ($sub) use ($user) {
                        $sub->selectRaw(1)
                            ->from('conversation_participants')
                            ->whereColumn('conversation_participants.conversation_id', 'messages.conversation_id')
                            ->where('conversation_participants.user_id', $user->id)
                            ->where(function ($q) {
                                $q->whereNull('conversation_participants.last_read_at')
                                    ->orWhereColumn('messages.created_at', '>', 'conversation_participants.last_read_at');
                            });
                    });
                })
                ->count();

            // Pending bookings count for suppliers
            if ($user->role === 'supplier') {
                $individualPending = BookingItem::where('supplier_id', $user->id)
                    ->where('status', 'pending')
                    ->where('item_type', '!=', 'team_package')
                    ->whereHas('booking', function ($q) {
                        $q->where('booking_type', '!=', 'team_package')
                            ->whereNull('team_id');
                    })
                    ->count();

                $teamPending = Booking::where(function ($query) {
                    $query->where('booking_type', 'team_package')
                        ->orWhereNotNull('team_id');
                })
                    ->whereHas('team', function ($q) use ($user) {
                        $q->where('coordinator_id', $user->id);
                    })
                    ->where('overall_status', 'pending')
                    ->count();

                $pendingBookingsCount = $individualPending + $teamPending;
            }
        }

        return [
            ...parent::share($request),

            'auth' => [
                'user' => $user
                    ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,

                        'supplier_profile' => $user->role === 'supplier'
                            ? $user->supplierProfile
                            : null,
                    ]
                    : null,
            ],

            'unread_messages_count' => $unreadMessagesCount,
            'pending_bookings_count' => $pendingBookingsCount,
            'unread_notifications_count' => $unreadNotificationsCount,
            'recent_notifications' => $recentNotifications,
        ];
    }
}
