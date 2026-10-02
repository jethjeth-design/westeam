<?php

namespace App\Notifications;

use App\Models\Message;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Message $message,
        public User $sender
    ) {}

    public function via(object $notifiable): array
    {
        // Deliver via email if mail is configured, and database
        return ['database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $conversation = $this->message->conversation;
        $title = $conversation->title ?: 'Conversation';

        return (new MailMessage)
            ->subject('New Message from '.$this->sender->name.' on Westeam')
            ->greeting('Hello '.$notifiable->name.'!')
            ->line($this->sender->name.' sent you a message regarding "'.$title.'":')
            ->line('"'.($this->message->body ?: 'Sent an attachment').'"')
            ->action('View Conversation', route('messages.index', ['conversation' => $conversation->id]))
            ->line('Thank you for using Westeam Event & Wedding Supplier Platform!');
    }

    public function toArray(object $notifiable): array
    {
        $senderName = $this->sender->supplierProfile?->business_name ?: $this->sender->name;
        $snippet = $this->message->body ? mb_substr($this->message->body, 0, 80) : 'Sent an attachment';

        return [
            'title' => 'New Message from '.$senderName,
            'message' => $snippet,
            'action_url' => route('messages.index', ['conversation' => $this->message->conversation_id]),
            'category' => 'message',
            'type' => 'new_message',
            'icon' => '💬',
            'role' => $notifiable->role ?? null,
            'meta' => [
                'message_id' => $this->message->id,
                'conversation_id' => $this->message->conversation_id,
                'sender_id' => $this->sender->id,
                'sender_name' => $senderName,
                'body_snippet' => $snippet,
            ],
            // Backward-compatibility keys
            'message_id' => $this->message->id,
            'conversation_id' => $this->message->conversation_id,
            'sender_id' => $this->sender->id,
            'sender_name' => $senderName,
            'body_snippet' => $snippet,
        ];
    }
}
