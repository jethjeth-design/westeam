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
        return [
            'message_id' => $this->message->id,
            'conversation_id' => $this->message->conversation_id,
            'sender_id' => $this->sender->id,
            'sender_name' => $this->sender->name,
            'body_snippet' => mb_substr($this->message->body ?? 'Attachment', 0, 80),
        ];
    }
}
