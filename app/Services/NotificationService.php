<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Payment;
use App\Models\Review;
use App\Models\Team;
use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Support\Collection;

class NotificationService
{
    /**
     * Send a notification to one or multiple users.
     *
     * @param  User|Collection<int, User>|array<int, User>  $recipients
     * @param  array<string, mixed>  $meta
     */
    public static function send(
        User|Collection|array $recipients,
        string $title,
        string $message,
        string $actionUrl,
        string $category = 'system',
        string $type = 'general',
        ?string $icon = null,
        ?string $role = null,
        array $meta = []
    ): void {
        if ($recipients instanceof User) {
            $recipients = collect([$recipients]);
        } elseif (is_array($recipients)) {
            $recipients = collect($recipients);
        }

        $notification = new SystemNotification(
            title: $title,
            message: $message,
            actionUrl: $actionUrl,
            category: $category,
            type: $type,
            icon: $icon,
            role: $role,
            meta: $meta
        );

        foreach ($recipients as $recipient) {
            if ($recipient instanceof User) {
                try {
                    $recipient->notify($notification);
                } catch (\Throwable $e) {
                    logger()->error('NotificationService send error: '.$e->getMessage());
                }
            }
        }
    }

    /**
     * Get all active admin users.
     *
     * @return Collection<int, User>
     */
    public static function getAdmins(): Collection
    {
        return User::where('role', 'admin')->get();
    }

    /*
    |--------------------------------------------------------------------------
    | ADMIN NOTIFICATIONS
    |--------------------------------------------------------------------------
    */

    /**
     * Admin: New supplier registration.
     */
    public static function notifyAdminNewSupplier(User $supplier): void
    {
        $admins = self::getAdmins();
        if ($admins->isEmpty()) {
            return;
        }

        $name = $supplier->name;
        $email = $supplier->email;

        self::send(
            recipients: $admins,
            title: 'New Supplier Registered',
            message: "{$name} ({$email}) registered as a supplier and requires profile verification.",
            actionUrl: route('admin.suppliers.index'),
            category: 'supplier',
            type: 'admin_new_supplier',
            icon: '🏢',
            role: 'admin',
            meta: [
                'supplier_id' => $supplier->id,
                'supplier_name' => $name,
                'supplier_email' => $email,
            ]
        );
    }

    /**
     * Admin: Supplier business profile updated and needs review.
     */
    public static function notifyAdminSupplierProfileUpdated(User $supplier): void
    {
        $admins = self::getAdmins();
        if ($admins->isEmpty()) {
            return;
        }

        $businessName = $supplier->supplierProfile?->business_name ?: $supplier->name;

        self::send(
            recipients: $admins,
            title: 'Supplier Profile Updated',
            message: "{$businessName} updated their profile details and resubmitted for verification.",
            actionUrl: route('admin.suppliers.show', $supplier->id),
            category: 'supplier',
            type: 'admin_supplier_profile_updated',
            icon: '📝',
            role: 'admin',
            meta: [
                'supplier_id' => $supplier->id,
                'business_name' => $businessName,
            ]
        );
    }

    /**
     * Admin: New customer registration.
     */
    public static function notifyAdminNewCustomer(User $customer): void
    {
        $admins = self::getAdmins();
        if ($admins->isEmpty()) {
            return;
        }

        self::send(
            recipients: $admins,
            title: 'New Customer Registered',
            message: "Customer {$customer->name} ({$customer->email}) joined Westeam.",
            actionUrl: route('admin.customers.index'),
            category: 'customer',
            type: 'admin_new_customer',
            icon: '👤',
            role: 'admin',
            meta: [
                'customer_id' => $customer->id,
                'customer_name' => $customer->name,
                'customer_email' => $customer->email,
            ]
        );
    }

    /**
     * Admin: New review or report submitted that requires attention.
     */
    public static function notifyAdminNewReview(Review $review): void
    {
        $admins = self::getAdmins();
        if ($admins->isEmpty()) {
            return;
        }

        $customerName = $review->customer?->name ?: 'A customer';
        $supplierName = $review->supplier?->supplierProfile?->business_name ?: ($review->supplier?->name ?: 'a supplier');

        self::send(
            recipients: $admins,
            title: 'New Review Requires Moderation',
            message: "{$customerName} rated {$supplierName} {$review->rating}/5 stars for '{$review->item_name}'.",
            actionUrl: route('admin.reviews.index'),
            category: 'review',
            type: 'admin_review_attention',
            icon: '⭐',
            role: 'admin',
            meta: [
                'review_id' => $review->id,
                'rating' => $review->rating,
                'customer_id' => $review->customer_id,
                'supplier_id' => $review->supplier_id,
            ]
        );
    }

    /**
     * Admin: Important booking or system activity.
     */
    public static function notifyAdminBookingActivity(Booking $booking, string $activityDescription): void
    {
        $admins = self::getAdmins();
        if ($admins->isEmpty()) {
            return;
        }

        $ref = $booking->booking_reference ?: ('#BK-'.$booking->id);

        self::send(
            recipients: $admins,
            title: "Booking Activity: {$ref}",
            message: "{$activityDescription} for '{$booking->event_name}' (Total: ₱".number_format((float) $booking->total_amount, 2).').',
            actionUrl: route('admin.bookings.index'),
            category: 'booking',
            type: 'admin_booking_activity',
            icon: '📅',
            role: 'admin',
            meta: [
                'booking_id' => $booking->id,
                'booking_reference' => $ref,
                'event_name' => $booking->event_name,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | SUPPLIER NOTIFICATIONS
    |--------------------------------------------------------------------------
    */

    /**
     * Supplier: New booking request received.
     */
    public static function notifySupplierBookingRequest(Booking $booking, User $supplier, ?BookingItem $item = null): void
    {
        $ref = $booking->booking_reference ?: ('#BK-'.$booking->id);
        $itemName = $item?->item_name ?: $booking->event_name;

        self::send(
            recipients: $supplier,
            title: "New Booking Request: {$ref}",
            message: "Customer {$booking->customer->name} requested {$itemName} for '{$booking->event_name}' on ".date('M d, Y', strtotime($booking->event_date)).'.',
            actionUrl: route('supplier.bookings.index'),
            category: 'booking',
            type: 'supplier_new_booking',
            icon: '📅',
            role: 'supplier',
            meta: [
                'booking_id' => $booking->id,
                'booking_item_id' => $item?->id,
                'booking_reference' => $ref,
            ]
        );
    }

    /**
     * Supplier: Booking was cancelled.
     */
    public static function notifySupplierBookingCancelled(Booking $booking, User $supplier, ?string $reason = null): void
    {
        $ref = $booking->booking_reference ?: ('#BK-'.$booking->id);
        $reasonText = $reason ? " Reason: {$reason}" : '';

        self::send(
            recipients: $supplier,
            title: "Booking Cancelled: {$ref}",
            message: "The booking request for '{$booking->event_name}' has been cancelled by customer.{$reasonText}",
            actionUrl: route('supplier.bookings.index'),
            category: 'booking',
            type: 'supplier_booking_cancelled',
            icon: '🚫',
            role: 'supplier',
            meta: [
                'booking_id' => $booking->id,
                'booking_reference' => $ref,
            ]
        );
    }

    /**
     * Supplier: New payment submitted for verification.
     */
    public static function notifySupplierPaymentSubmitted(Payment $payment): void
    {
        $booking = $payment->booking;
        $ref = $booking->booking_reference ?: ('#BK-'.$booking->id);
        $amountFormatted = '₱'.number_format((float) $payment->amount, 2);
        $customerName = $payment->customer?->name ?: 'Customer';

        self::send(
            recipients: $payment->supplier,
            title: "Payment Received to Verify: {$ref}",
            message: "{$customerName} submitted {$amountFormatted} via GCash. Ref: {$payment->reference_number}.",
            actionUrl: route('supplier.payments.index'),
            category: 'payment',
            type: 'supplier_payment_submitted',
            icon: '💰',
            role: 'supplier',
            meta: [
                'payment_id' => $payment->id,
                'booking_id' => $booking->id,
                'amount' => $payment->amount,
            ]
        );
    }

    /**
     * Supplier: Payment proof resubmitted after prior rejection.
     */
    public static function notifySupplierPaymentResubmitted(Payment $payment): void
    {
        $booking = $payment->booking;
        $ref = $booking->booking_reference ?: ('#BK-'.$booking->id);
        $amountFormatted = '₱'.number_format((float) $payment->amount, 2);
        $customerName = $payment->customer?->name ?: 'Customer';

        self::send(
            recipients: $payment->supplier,
            title: "Payment Resubmitted: {$ref}",
            message: "{$customerName} resubmitted payment proof for {$amountFormatted} with new Ref: {$payment->reference_number}.",
            actionUrl: route('supplier.payments.index'),
            category: 'payment',
            type: 'supplier_payment_resubmitted',
            icon: '🔄',
            role: 'supplier',
            meta: [
                'payment_id' => $payment->id,
                'booking_id' => $booking->id,
                'amount' => $payment->amount,
            ]
        );
    }

    /**
     * Supplier: New review received.
     */
    public static function notifySupplierNewReview(Review $review): void
    {
        if (! $review->supplier) {
            return;
        }

        $customerName = $review->customer?->name ?: 'A customer';

        self::send(
            recipients: $review->supplier,
            title: "New Review ({$review->rating}⭐): {$review->item_name}",
            message: "{$customerName} left a {$review->rating}-star review: \"".mb_substr($review->comment, 0, 75).'...\"',
            actionUrl: route('supplier.reviews.index'),
            category: 'review',
            type: 'supplier_new_review',
            icon: '⭐',
            role: 'supplier',
            meta: [
                'review_id' => $review->id,
                'rating' => $review->rating,
            ]
        );
    }

    /**
     * Supplier: Team Package activity (invitations, member actions).
     */
    public static function notifySupplierTeamActivity(Team $team, User $recipient, string $activityMessage, ?string $actionUrl = null): void
    {
        self::send(
            recipients: $recipient,
            title: "Team Update: {$team->name}",
            message: $activityMessage,
            actionUrl: $actionUrl ?: route('supplier.teams.show', $team->id),
            category: 'team',
            type: 'supplier_team_activity',
            icon: '👥',
            role: 'supplier',
            meta: [
                'team_id' => $team->id,
                'team_name' => $team->name,
            ]
        );
    }

    /**
     * Supplier: Admin approval or rejection of application/profile.
     */
    public static function notifySupplierAdminDecision(User $supplier, bool $approved, ?string $reason = null): void
    {
        $title = $approved ? '🎉 Business Profile Approved!' : '⚠️ Business Profile Needs Attention';
        $message = $approved
            ? 'Congratulations! Your Westeam supplier account has been approved. You can now publish packages and receive bookings.'
            : 'Your supplier profile was declined.'.($reason ? " Note: {$reason}" : ' Please update your details and resubmit.');

        $actionUrl = $approved ? route('supplier.dashboard') : route('supplier.settings');

        self::send(
            recipients: $supplier,
            title: $title,
            message: $message,
            actionUrl: $actionUrl,
            category: 'supplier',
            type: $approved ? 'supplier_approved' : 'supplier_rejected',
            icon: $approved ? '✅' : '❌',
            role: 'supplier',
            meta: [
                'approved' => $approved,
                'reason' => $reason,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER NOTIFICATIONS
    |--------------------------------------------------------------------------
    */

    /**
     * Customer: Booking accepted by supplier.
     */
    public static function notifyCustomerBookingAccepted(Booking $booking, string $supplierName, ?BookingItem $item = null): void
    {
        $ref = $booking->booking_reference ?: ('#BK-'.$booking->id);
        $itemName = $item?->item_name ?: 'your item';

        self::send(
            recipients: $booking->customer,
            title: "Booking Accepted: {$itemName}",
            message: "{$supplierName} accepted {$itemName} for '{$booking->event_name}' [{$ref}].",
            actionUrl: route('customer.bookings.show', $booking->id),
            category: 'booking',
            type: 'customer_booking_accepted',
            icon: '✅',
            role: 'customer',
            meta: [
                'booking_id' => $booking->id,
                'booking_reference' => $ref,
            ]
        );
    }

    /**
     * Customer: Booking rejected by supplier.
     */
    public static function notifyCustomerBookingRejected(Booking $booking, string $supplierName, ?string $reason = null): void
    {
        $ref = $booking->booking_reference ?: ('#BK-'.$booking->id);
        $reasonText = $reason ? " Reason: {$reason}" : '';

        self::send(
            recipients: $booking->customer,
            title: "Booking Declined: {$ref}",
            message: "{$supplierName} declined your booking request for '{$booking->event_name}'.{$reasonText}",
            actionUrl: route('customer.bookings.show', $booking->id),
            category: 'booking',
            type: 'customer_booking_rejected',
            icon: '❌',
            role: 'customer',
            meta: [
                'booking_id' => $booking->id,
                'booking_reference' => $ref,
            ]
        );
    }

    /**
     * Customer: Downpayment required to lock in the booking.
     */
    public static function notifyCustomerDownpaymentRequired(Booking $booking, float $amount): void
    {
        $ref = $booking->booking_reference ?: ('#BK-'.$booking->id);
        $amountFormatted = '₱'.number_format($amount, 2);

        self::send(
            recipients: $booking->customer,
            title: "Downpayment Required: {$ref}",
            message: "Your booking for '{$booking->event_name}' was accepted! Please submit downpayment ({$amountFormatted}) to confirm.",
            actionUrl: route('customer.bookings.show', $booking->id),
            category: 'payment',
            type: 'customer_downpayment_required',
            icon: '💳',
            role: 'customer',
            meta: [
                'booking_id' => $booking->id,
                'booking_reference' => $ref,
                'amount' => $amount,
            ]
        );
    }

    /**
     * Customer: Payment submitted confirmation.
     */
    public static function notifyCustomerPaymentSubmitted(Payment $payment): void
    {
        $booking = $payment->booking;
        $ref = $booking->booking_reference ?: ('#BK-'.$booking->id);
        $amountFormatted = '₱'.number_format((float) $payment->amount, 2);

        self::send(
            recipients: $payment->customer,
            title: "Payment Proof Submitted: {$ref}",
            message: "Your {$amountFormatted} payment is now pending supplier verification.",
            actionUrl: route('customer.bookings.show', $booking->id),
            category: 'payment',
            type: 'customer_payment_submitted',
            icon: '💳',
            role: 'customer',
            meta: [
                'payment_id' => $payment->id,
                'booking_id' => $booking->id,
            ]
        );
    }

    /**
     * Customer: Payment verified.
     */
    public static function notifyCustomerPaymentVerified(Payment $payment): void
    {
        $booking = $payment->booking;
        $ref = $booking->booking_reference ?: ('#BK-'.$booking->id);
        $amountFormatted = '₱'.number_format((float) $payment->amount, 2);
        $supplierName = $payment->supplier?->supplierProfile?->business_name ?: ($payment->supplier?->name ?: 'Supplier');

        self::send(
            recipients: $payment->customer,
            title: "Payment Verified: {$ref}",
            message: "{$supplierName} verified your {$amountFormatted} payment. Thank you!",
            actionUrl: route('customer.bookings.show', $booking->id),
            category: 'payment',
            type: 'customer_payment_verified',
            icon: '✅',
            role: 'customer',
            meta: [
                'payment_id' => $payment->id,
                'booking_id' => $booking->id,
            ]
        );
    }

    /**
     * Customer: Payment rejected with explanation.
     */
    public static function notifyCustomerPaymentRejected(Payment $payment, ?string $reason = null): void
    {
        $booking = $payment->booking;
        $ref = $booking->booking_reference ?: ('#BK-'.$booking->id);
        $supplierName = $payment->supplier?->supplierProfile?->business_name ?: ($payment->supplier?->name ?: 'Supplier');
        $reasonText = $reason ? ": {$reason}" : '. Please review and resubmit proof.';

        self::send(
            recipients: $payment->customer,
            title: "Payment Proof Declined: {$ref}",
            message: "{$supplierName} could not verify your payment{$reasonText}",
            actionUrl: route('customer.bookings.show', $booking->id),
            category: 'payment',
            type: 'customer_payment_rejected',
            icon: '❌',
            role: 'customer',
            meta: [
                'payment_id' => $payment->id,
                'booking_id' => $booking->id,
                'reason' => $reason,
            ]
        );
    }

    /**
     * Customer: Booking confirmed (all payments/downpayments verified).
     */
    public static function notifyCustomerBookingConfirmed(Booking $booking): void
    {
        $ref = $booking->booking_reference ?: ('#BK-'.$booking->id);

        self::send(
            recipients: $booking->customer,
            title: "Booking Confirmed! {$ref}",
            message: "All verified! Your event '{$booking->event_name}' on ".date('M d, Y', strtotime($booking->event_date)).' is fully confirmed.',
            actionUrl: route('customer.bookings.show', $booking->id),
            category: 'booking',
            type: 'customer_booking_confirmed',
            icon: '🎉',
            role: 'customer',
            meta: [
                'booking_id' => $booking->id,
                'booking_reference' => $ref,
            ]
        );
    }

    /**
     * Customer: Booking cancellation confirmation.
     */
    public static function notifyCustomerBookingCancelled(Booking $booking, ?string $reason = null): void
    {
        $ref = $booking->booking_reference ?: ('#BK-'.$booking->id);

        self::send(
            recipients: $booking->customer,
            title: "Booking Cancellation Confirmed: {$ref}",
            message: "Your booking for '{$booking->event_name}' has been successfully cancelled.",
            actionUrl: route('customer.bookings.show', $booking->id),
            category: 'booking',
            type: 'customer_booking_cancelled',
            icon: '🚫',
            role: 'customer',
            meta: [
                'booking_id' => $booking->id,
                'booking_reference' => $ref,
            ]
        );
    }

    /**
     * Customer: Review reminder for completed service.
     */
    public static function notifyCustomerReviewReminder(Booking $booking, ?BookingItem $item = null): void
    {
        $ref = $booking->booking_reference ?: ('#BK-'.$booking->id);
        $itemName = $item?->item_name ?: 'your booked service';

        self::send(
            recipients: $booking->customer,
            title: '⭐ How was your event experience?',
            message: "Please take a moment to rate and review {$itemName} for '{$booking->event_name}'.",
            actionUrl: route('customer.bookings.show', $booking->id),
            category: 'review',
            type: 'customer_review_reminder',
            icon: '⭐',
            role: 'customer',
            meta: [
                'booking_id' => $booking->id,
                'booking_reference' => $ref,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | COMMON / REMINDERS
    |--------------------------------------------------------------------------
    */

    /**
     * Upcoming event reminder for both customer and supplier.
     */
    public static function notifyUpcomingEventReminder(User $user, Booking $booking, int $daysRemaining): void
    {
        $ref = $booking->booking_reference ?: ('#BK-'.$booking->id);
        $timeText = $daysRemaining === 0 ? 'today!' : ($daysRemaining === 1 ? 'tomorrow!' : "in {$daysRemaining} days!");
        $role = $user->role;

        $actionUrl = $role === 'supplier'
            ? route('supplier.bookings.index')
            : route('customer.bookings.show', $booking->id);

        self::send(
            recipients: $user,
            title: "Upcoming Event: {$booking->event_name}",
            message: "Reminder: Event '{$booking->event_name}' [{$ref}] is scheduled {$timeText}",
            actionUrl: $actionUrl,
            category: 'booking',
            type: 'upcoming_event_reminder',
            icon: '⏰',
            role: $role,
            meta: [
                'booking_id' => $booking->id,
                'booking_reference' => $ref,
                'days_remaining' => $daysRemaining,
            ]
        );
    }
}
