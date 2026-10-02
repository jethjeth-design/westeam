<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SystemNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * @param  array<string, mixed>  $meta
     */
    public function __construct(
        public string $title,
        public string $message,
        public string $actionUrl,
        public string $category = 'system', // 'booking', 'payment', 'message', 'review', 'supplier', 'customer', 'team', 'system'
        public string $type = 'general',
        public ?string $icon = null,
        public ?string $role = null, // 'admin', 'supplier', 'customer'
        public array $meta = []
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'action_url' => $this->actionUrl,
            'category' => $this->category,
            'type' => $this->type,
            'icon' => $this->icon ?: $this->defaultIcon($this->category),
            'role' => $this->role ?: ($notifiable->role ?? null),
            'meta' => $this->meta,
        ];
    }

    /**
     * Default icon based on notification category.
     */
    protected function defaultIcon(string $category): string
    {
        return match ($category) {
            'booking' => '📅',
            'payment' => '💳',
            'message' => '💬',
            'review' => '⭐',
            'supplier' => '🏢',
            'customer' => '👤',
            'team' => '👥',
            default => '🔔',
        };
    }
}
