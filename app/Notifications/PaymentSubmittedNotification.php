<?php

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentSubmittedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Payment $payment,
        public string $recipientType = 'customer' // 'customer' or 'supplier'
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

        if ($this->recipientType === 'customer') {
            $subject = "Payment Submitted: {$ref} ({$amountFormatted}) - Pending Verification";
            $actionUrl = route('customer.bookings.show', $booking->id);
        } else {
            $customerName = $this->payment->customer->name ?? 'Customer';
            $subject = "New Payment Received for Verification: {$ref} from {$customerName} ({$amountFormatted})";
            $actionUrl = route('supplier.payments.index');
        }

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.payment-submitted', [
                'payment' => $this->payment,
                'recipientType' => $this->recipientType,
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

        if ($this->recipientType === 'customer') {
            return [
                'title' => "Payment Submitted for {$ref}",
                'message' => "Your payment of {$amountFormatted} is waiting for supplier verification.",
                'action_url' => route('customer.bookings.show', $booking->id),
                'category' => 'payment',
                'type' => 'payment_submitted',
                'icon' => '💳',
                'role' => 'customer',
                'meta' => [
                    'payment_id' => $this->payment->id,
                    'booking_id' => $booking->id,
                    'booking_reference' => $ref,
                    'amount' => $this->payment->amount,
                    'status' => 'pending',
                ],
                'payment_id' => $this->payment->id,
                'booking_id' => $booking->id,
                'booking_reference' => $ref,
                'amount' => $this->payment->amount,
                'status' => 'pending',
            ];
        }

        return [
            'title' => "New Payment to Verify: {$ref}",
            'message' => "{$this->payment->customer->name} submitted {$amountFormatted} via GCash. Reference: {$this->payment->reference_number}",
            'action_url' => route('supplier.payments.index'),
            'category' => 'payment',
            'type' => 'payment_submitted',
            'icon' => '💰',
            'role' => 'supplier',
            'meta' => [
                'payment_id' => $this->payment->id,
                'booking_id' => $booking->id,
                'booking_reference' => $ref,
                'amount' => $this->payment->amount,
                'status' => 'pending',
            ],
            'payment_id' => $this->payment->id,
            'booking_id' => $booking->id,
            'booking_reference' => $ref,
            'amount' => $this->payment->amount,
            'status' => 'pending',
        ];
    }
}
