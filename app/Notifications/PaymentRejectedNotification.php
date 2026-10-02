<?php

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentRejectedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Payment $payment
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $booking = $this->payment->booking;
        $ref = $booking->booking_reference ?? ('#BK-'.$booking->id);
        $amountFormatted = '₱'.number_format($this->payment->amount, 2);
        $subject = "Payment Verification Update (Declined): {$ref} ({$amountFormatted})";
        $actionUrl = route('customer.bookings.show', $booking->id);

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.payment-rejected', [
                'payment' => $this->payment,
                'recipientName' => $notifiable->name,
                'actionUrl' => $actionUrl,
                'subject' => $subject,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $booking = $this->payment->booking;
        $ref = $booking->booking_reference ?? ('#BK-'.$booking->id);
        $amountFormatted = '₱'.number_format($this->payment->amount, 2);

        return [
            'title' => "Payment Declined for {$ref}",
            'message' => "Payment of {$amountFormatted} could not be verified: {$this->payment->rejection_reason}",
            'action_url' => route('customer.bookings.show', $booking->id),
            'category' => 'payment',
            'type' => 'payment_rejected',
            'icon' => '❌',
            'role' => 'customer',
            'meta' => [
                'payment_id' => $this->payment->id,
                'booking_id' => $booking->id,
                'booking_reference' => $ref,
                'amount' => $this->payment->amount,
                'status' => 'rejected',
                'rejection_reason' => $this->payment->rejection_reason,
            ],
            'payment_id' => $this->payment->id,
            'booking_id' => $booking->id,
            'booking_reference' => $ref,
            'amount' => $this->payment->amount,
            'status' => 'rejected',
            'rejection_reason' => $this->payment->rejection_reason,
        ];
    }
}
