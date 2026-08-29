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
        $mail = (new MailMessage)
            ->subject("Booking Status Update [{$statusUpper}]: {$this->booking->event_name} - {$this->bookingItem->item_name}")
            ->greeting("Hello {$notifiable->name},");

        if ($this->status === 'accepted') {
            $mail->line("Great news! Your booking request for '{$this->bookingItem->item_name}' has been ACCEPTED by {$this->bookingItem->supplier->name}.")
                ->line("Booking Reference: {$this->booking->booking_reference}")
                ->line('Event Date: '.$this->booking->event_date->format('M d, Y'))
                ->action('View Booking Details', url(route('customer.bookings.show', $this->booking->id)));
        } elseif ($this->status === 'rejected') {
            $mail->line("Your booking request for '{$this->bookingItem->item_name}' was DECLINED by {$this->bookingItem->supplier->name}.")
                ->line("Booking Reference: {$this->booking->booking_reference}");
            if ($this->rejectionReason) {
                $mail->line("Reason provided: {$this->rejectionReason}");
            }
            $mail->action('Explore Alternative Suppliers', url(route('customer.suppliers.index')));
        } elseif ($this->status === 'completed') {
            $mail->line("The service '{$this->bookingItem->item_name}' for event '{$this->booking->event_name}' has been marked as COMPLETED.")
                ->action('View Booking', url(route('customer.bookings.show', $this->booking->id)));
        } else {
            $mail->line("The booking request for '{$this->bookingItem->item_name}' has been cancelled.")
                ->action('View Details', url(route('customer.bookings.show', $this->booking->id)));
        }

        return $mail;
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
