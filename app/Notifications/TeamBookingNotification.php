<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeamBookingNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Booking $booking,
        public string $role = 'coordinator' // 'coordinator', 'member', 'customer'
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $subject = "👥 Team Package Reservation: {$this->booking->event_name} [{$this->booking->booking_reference}]";

        $actionUrl = $this->role === 'customer'
            ? route('customer.bookings.show', ['booking' => $this->booking->id ?? 1])
            : route('supplier.bookings.index');

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.team-booking', [
                'booking' => $this->booking,
                'role' => $this->role,
                'recipientName' => $notifiable->name,
                'actionUrl' => $actionUrl,
                'subject' => $subject,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'booking_id' => $this->booking->id,
            'booking_reference' => $this->booking->booking_reference,
            'event_name' => $this->booking->event_name,
            'team_id' => $this->booking->team_id,
            'title' => 'Team Package Reservation',
            'message' => "Team package booking {$this->booking->booking_reference} for '{$this->booking->event_name}' received.",
            'action_url' => $this->role === 'customer'
                ? route('customer.bookings.show', $this->booking->id)
                : route('supplier.bookings.index'),
        ];
    }
}
