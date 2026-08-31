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
        $isCustomer = $this->recipientType === 'customer';
        $isCoordinator = $this->recipientType === 'coordinator';

        $actionUrl = $isCustomer
            ? route('customer.bookings.show', ['booking' => $this->booking->id ?? 1])
            : route('supplier.bookings.index');

        $subject = match ($this->recipientType) {
            'customer' => "Booking Request Confirmation: {$this->booking->event_name} [{$this->booking->booking_reference}]",
            'coordinator' => "New Team Package Booking: {$this->booking->event_name} [{$this->booking->booking_reference}]",
            default => "New Booking Request: {$this->booking->event_name} [{$this->booking->booking_reference}]",
        };

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.new-booking', [
                'booking' => $this->booking,
                'bookingItem' => $this->bookingItem,
                'recipientType' => $this->recipientType,
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
