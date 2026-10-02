<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Display a listing of notifications for the authenticated user.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $filter = $request->input('filter', 'all'); // 'all', 'unread', 'read'
        $category = $request->input('category', 'all'); // 'booking', 'payment', etc.
        $search = trim((string) $request->input('search', ''));

        $query = $user->notifications();

        // Status filter
        if ($filter === 'unread') {
            $query->whereNull('read_at');
        } elseif ($filter === 'read') {
            $query->whereNotNull('read_at');
        }

        // Category filter
        if ($category !== 'all' && ! empty($category)) {
            $query->where('data->category', $category);
        }

        // Search query
        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('data->title', 'like', "%{$search}%")
                    ->orWhere('data->message', 'like', "%{$search}%");
            });
        }

        $notifications = $query->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(function ($n) {
                $data = $n->data ?? [];

                return [
                    'id' => $n->id,
                    'read' => ! is_null($n->read_at),
                    'read_at' => $n->read_at?->toISOString(),
                    'created_at' => $n->created_at?->toISOString(),
                    'created_at_human' => $n->created_at?->diffForHumans(),
                    'title' => $data['title'] ?? 'Notification',
                    'message' => $data['message'] ?? '',
                    'action_url' => $data['action_url'] ?? route('dashboard'),
                    'category' => $data['category'] ?? 'system',
                    'type' => $data['type'] ?? 'general',
                    'icon' => $data['icon'] ?? '🔔',
                    'role' => $data['role'] ?? null,
                    'meta' => $data['meta'] ?? [],
                ];
            });

        $counts = [
            'all' => $user->notifications()->count(),
            'unread' => $user->unreadNotifications()->count(),
            'read' => $user->readNotifications()->count(),
        ];

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'counts' => $counts,
            'filters' => [
                'filter' => $filter,
                'category' => $category,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, string $id): JsonResponse|RedirectResponse
    {
        $notification = $request->user()->notifications()->where('id', $id)->firstOrFail();
        $notification->markAsRead();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'unread_count' => $request->user()->unreadNotifications()->count(),
            ]);
        }

        return back()->with('success', 'Notification marked as read.');
    }

    /**
     * Mark all unread notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse|RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'unread_count' => 0,
            ]);
        }

        return back()->with('success', 'All notifications marked as read.');
    }

    /**
     * Delete a specific notification.
     */
    public function destroy(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()->notifications()->where('id', $id)->firstOrFail();
        $notification->delete();

        return back()->with('success', 'Notification deleted.');
    }

    /**
     * Delete all read notifications.
     */
    public function clearAllRead(Request $request): RedirectResponse
    {
        $request->user()->readNotifications()->delete();

        return back()->with('success', 'Read notifications cleared.');
    }

    /**
     * Mark notification as read and redirect directly to its action URL.
     */
    public function readAndRedirect(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->markAsRead();
            $actionUrl = $notification->data['action_url'] ?? route('dashboard');

            return redirect($actionUrl);
        }

        return redirect()->route('notifications.index');
    }
}
