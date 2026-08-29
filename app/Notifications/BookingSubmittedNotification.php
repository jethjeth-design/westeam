<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Models\BookingItem;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingSubmittedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Booking $booking,
        public ?BookingItem $bookingItem = null,
        public string $recipientType = 'supplier' // 'supplier', 'coordinator', 'customer'
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject("New Booking Request: {$this->booking->event_name} [{$this->booking->booking_reference}]")
            ->greeting("Hello {$notifiable->name},");

        if ($this->recipientType === 'customer') {
            $mail->line("Your booking request for '{$this->booking->event_name}' has been successfully submitted.")
                ->line("Booking Reference: {$this->booking->booking_reference}")
                ->line('Event Date: '.$this->booking->event_date->format('M d, Y'))
                ->line('Total Amount: ₱'.number_format($this->booking->total_amount, 2))
                ->action('View Booking Details', url(route('customer.bookings.show', $this->booking->id)))
                ->line('The supplier(s) have been notified and will review your request.');
        } elseif ($this->recipientType === 'coordinator') {
            $mail->line("A new Team Package booking has been requested for '{$this->booking->event_name}'.")
                ->line("Booking Reference: {$this->booking->booking_reference}")
                ->line("Customer: {$this->booking->customer->name}")
                ->line('Event Date: '.$this->booking->event_date->format('M d, Y'))
                ->line('Total Amount: ₱'.number_format($this->booking->total_amount, 2))
                ->action('Review Team Booking', url(route('supplier.bookings.index')))
                ->line('As Team Coordinator, please review and accept or reject this team reservation.');
        } else {
            $itemName = $this->bookingItem ? $this->bookingItem->item_name : 'Event Services';
            $mail->line("You have received a new booking request for {$itemName}.")
                ->line("Event: {$this->booking->event_name}")
                ->line("Customer: {$this->booking->customer->name}")
                ->line('Event Date: '.$this->booking->event_date->format('M d, Y'))
                ->action('Review Booking Request', url(route('supplier.bookings.index')))
                ->line('Please log in to your dashboard to accept or decline.');
        }

        return $mail;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'booking_id' => $this->booking->id,
            'booking_reference' => $this->booking->booking_reference,
            'event_name' => $this->booking->event_name,
            'booking_type' => $this->booking->booking_type,
            'total_amount' => $this->booking->total_amount,
            'title' => 'New Booking Request',
            'message' => "Booking request {$this->booking->booking_reference} for '{$this->booking->event_name}' received.",
            'action_url' => $this->recipientType === 'customer'
                ? route('customer.bookings.show', $this->booking->id)
                : route('supplier.bookings.index'),
        ];
    }
}
