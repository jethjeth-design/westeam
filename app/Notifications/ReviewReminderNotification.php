<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Models\BookingItem;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReviewReminderNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Booking $booking,
        public BookingItem $bookingItem
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $supplierName = $this->bookingItem->supplier->supplierProfile->business_name ?? ($this->bookingItem->supplier->name ?? 'your supplier');
        $subject = "⭐ How was your event? Share your review for {$supplierName}";

        $actionUrl = route('customer.bookings.show', ['booking' => $this->booking->id ?? 1]);

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.review-reminder', [
                'booking' => $this->booking,
                'bookingItem' => $this->bookingItem,
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
            'title' => 'Review Your Completed Booking',
            'message' => "Please rate and review '{$this->bookingItem->item_name}' from '{$this->booking->event_name}'.",
            'action_url' => route('customer.bookings.show', $this->booking->id),
        ];
    }
}
