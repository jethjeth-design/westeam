<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Models\BookingItem;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingStatusUpdatedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Booking $booking,
        public BookingItem $bookingItem,
        public string $status, // 'accepted', 'rejected', 'completed', 'cancelled'
        public ?string $rejectionReason = null,
        public ?string $responseNotes = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $statusUpper = strtoupper($this->status);
        $subject = match ($this->status) {
            'accepted' => "✓ Booking Confirmed: {$this->booking->event_name} - {$this->bookingItem->item_name}",
            'rejected' => "Booking Request Declined: {$this->booking->event_name} - {$this->bookingItem->item_name}",
            'cancelled' => "Booking Cancelled: {$this->booking->event_name} [{$this->booking->booking_reference}]",
            default => "Booking Status Update [{$statusUpper}]: {$this->booking->event_name}",
        };

        $view = match ($this->status) {
            'accepted' => 'emails.booking-accepted',
            'rejected' => 'emails.booking-rejected',
            'cancelled' => 'emails.booking-cancelled',
            default => 'emails.booking-accepted',
        };

        $actionUrl = match ($this->status) {
            'rejected' => route('customer.suppliers.index'),
            default => route('customer.bookings.show', ['booking' => $this->booking->id ?? 1]),
        };

        return (new MailMessage)
            ->subject($subject)
            ->view($view, [
                'booking' => $this->booking,
                'bookingItem' => $this->bookingItem,
                'status' => $this->status,
                'rejectionReason' => $this->rejectionReason,
                'responseNotes' => $this->responseNotes,
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
            'booking_item_id' => $this->bookingItem->id,
            'item_name' => $this->bookingItem->item_name,
            'status' => $this->status,
            'rejection_reason' => $this->rejectionReason,
            'title' => "Booking {$this->status}: {$this->bookingItem->item_name}",
            'message' => "Supplier {$this->bookingItem->supplier->name} has marked '{$this->bookingItem->item_name}' as {$this->status}.",
            'action_url' => route('customer.bookings.show', $this->booking->id),
        ];
    }
}
