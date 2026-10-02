<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Console\Command;

class SeedDemoNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:seed-demo {--clear : Clear existing notifications before seeding}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed comprehensive sample notifications for Admin, Supplier, and Customer roles';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if ($this->option('clear')) {
            \DB::table('notifications')->truncate();
            $this->info('Cleared existing notifications table.');
        }

        $admins = User::where('role', 'admin')->get();
        $suppliers = User::where('role', 'supplier')->get();
        $customers = User::where('role', 'customer')->get();

        $booking = Booking::with(['customer', 'items.supplier'])->first();
        $ref = $booking?->booking_reference ?? '#BK-2026-0001';
        $bookingId = $booking?->id ?? 1;

        // ── 1. ADMIN NOTIFICATIONS ───────────────────────────────────────────
        $this->info("Seeding Admin notifications (for {$admins->count()} admins)...");
        foreach ($admins as $admin) {
            // New supplier registration
            NotificationService::send(
                recipients: $admin,
                title: 'New Supplier Registered',
                message: 'Grand Ballroom & Catering Inc. registered as a supplier and requires credentials verification.',
                actionUrl: route('admin.suppliers.index'),
                category: 'supplier',
                type: 'admin_new_supplier',
                icon: '🏢',
                role: 'admin',
                meta: ['demo' => true]
            );

            // Supplier profile updated
            NotificationService::send(
                recipients: $admin,
                title: 'Supplier Profile Updated',
                message: 'Starlight Photo & Studio updated their service areas and resubmitted for admin review.',
                actionUrl: route('admin.suppliers.index'),
                category: 'supplier',
                type: 'admin_supplier_profile_updated',
                icon: '📝',
                role: 'admin',
                meta: ['demo' => true]
            );

            // New customer registration
            NotificationService::send(
                recipients: $admin,
                title: 'New Customer Registered',
                message: 'Maria Santos (maria.santos@example.com) created an event planning account.',
                actionUrl: route('admin.customers.index'),
                category: 'customer',
                type: 'admin_new_customer',
                icon: '👤',
                role: 'admin',
                meta: ['demo' => true]
            );

            // New review requires attention
            NotificationService::send(
                recipients: $admin,
                title: 'New Review Requires Moderation',
                message: "Customer John Doe submitted a 5-star review for 'Premium Floral Arch & Setup'.",
                actionUrl: route('admin.reviews.index'),
                category: 'review',
                type: 'admin_review_attention',
                icon: '⭐',
                role: 'admin',
                meta: ['demo' => true]
            );

            // Important booking activity
            NotificationService::send(
                recipients: $admin,
                title: "Booking Confirmed: {$ref}",
                message: "Booking {$ref} has been confirmed with all downpayments verified (Total: ₱85,000.00).",
                actionUrl: route('admin.bookings.index'),
                category: 'booking',
                type: 'admin_booking_activity',
                icon: '📅',
                role: 'admin',
                meta: ['demo' => true]
            );
        }

        // ── 2. SUPPLIER NOTIFICATIONS ─────────────────────────────────────────
        $this->info("Seeding Supplier notifications (for {$suppliers->count()} suppliers)...");
        foreach ($suppliers as $supplier) {
            // New booking request
            NotificationService::send(
                recipients: $supplier,
                title: "New Booking Request: {$ref}",
                message: "You have a new booking request for 'Santos-Reyes Wedding Reception' on Nov 15, 2026.",
                actionUrl: route('supplier.bookings.index'),
                category: 'booking',
                type: 'supplier_new_booking',
                icon: '📅',
                role: 'supplier',
                meta: ['demo' => true]
            );

            // Booking cancelled
            NotificationService::send(
                recipients: $supplier,
                title: 'Booking Cancelled: #BK-2026-9042',
                message: "Customer cancelled booking request for 'Birthday Garden Soiree'. Dates have been freed in your calendar.",
                actionUrl: route('supplier.bookings.index'),
                category: 'booking',
                type: 'supplier_booking_cancelled',
                icon: '🚫',
                role: 'supplier',
                meta: ['demo' => true]
            );

            // New payment submitted
            NotificationService::send(
                recipients: $supplier,
                title: "Payment Received to Verify: {$ref}",
                message: 'Customer submitted ₱15,000.00 downpayment via GCash. Reference: 981273645012.',
                actionUrl: route('supplier.payments.index'),
                category: 'payment',
                type: 'supplier_payment_submitted',
                icon: '💰',
                role: 'supplier',
                meta: ['demo' => true]
            );

            // Payment resubmitted
            NotificationService::send(
                recipients: $supplier,
                title: "Payment Proof Resubmitted: {$ref}",
                message: 'Customer resubmitted clear receipt screenshot with updated reference number 981273645019.',
                actionUrl: route('supplier.payments.index'),
                category: 'payment',
                type: 'supplier_payment_resubmitted',
                icon: '🔄',
                role: 'supplier',
                meta: ['demo' => true]
            );

            // New message
            NotificationService::send(
                recipients: $supplier,
                title: 'New Message from Maria Santos',
                message: '"Hi! Could we add an extra 2 hours for the acoustic duo setup during dinner?"',
                actionUrl: route('messages.index'),
                category: 'message',
                type: 'new_message',
                icon: '💬',
                role: 'supplier',
                meta: ['demo' => true]
            );

            // New review
            NotificationService::send(
                recipients: $supplier,
                title: 'New 5-Star Review Received! ⭐',
                message: '"Absolutely stunning photography and seamless coordination. Our guests were mesmerized!"',
                actionUrl: route('supplier.reviews.index'),
                category: 'review',
                type: 'supplier_new_review',
                icon: '⭐',
                role: 'supplier',
                meta: ['demo' => true]
            );

            // Team Package activity
            NotificationService::send(
                recipients: $supplier,
                title: 'Team Update: Elite Wedding Collective',
                message: 'Coordinator added your Photography Package into the "Grand Nuptials 2026" bundle.',
                actionUrl: route('supplier.teams.index'),
                category: 'team',
                type: 'supplier_team_activity',
                icon: '👥',
                role: 'supplier',
                meta: ['demo' => true]
            );

            // Upcoming event reminder
            NotificationService::send(
                recipients: $supplier,
                title: 'Upcoming Event in 3 Days! ⏰',
                message: "Reminder: 'De Leon Debut & Celebration' [{$ref}] is scheduled in 3 days on Saturday.",
                actionUrl: route('supplier.bookings.index'),
                category: 'booking',
                type: 'upcoming_event_reminder',
                icon: '⏰',
                role: 'supplier',
                meta: ['demo' => true]
            );

            // Admin approval
            NotificationService::send(
                recipients: $supplier,
                title: '🎉 Business Profile Approved!',
                message: 'Your business profile and documents have been verified by Westeam Admin. Your profile is live!',
                actionUrl: route('supplier.dashboard'),
                category: 'supplier',
                type: 'supplier_approved',
                icon: '✅',
                role: 'supplier',
                meta: ['demo' => true]
            );
        }

        // ── 3. CUSTOMER NOTIFICATIONS ─────────────────────────────────────────
        $this->info("Seeding Customer notifications (for {$customers->count()} customers)...");
        foreach ($customers as $customer) {
            $customerBookingUrl = route('customer.bookings.index');

            // Booking accepted
            NotificationService::send(
                recipients: $customer,
                title: 'Booking Accepted: Acoustic Trio Band',
                message: "Harmony Strings accepted your booking for 'Our Dream Wedding 2026'.",
                actionUrl: $customerBookingUrl,
                category: 'booking',
                type: 'customer_booking_accepted',
                icon: '✅',
                role: 'customer',
                meta: ['demo' => true]
            );

            // Booking rejected
            NotificationService::send(
                recipients: $customer,
                title: 'Booking Request Update',
                message: 'Lakeside Pavilion was fully booked on your requested date. Tap to browse alternative venues.',
                actionUrl: route('customer.suppliers.index'),
                category: 'booking',
                type: 'customer_booking_rejected',
                icon: '❌',
                role: 'customer',
                meta: ['demo' => true]
            );

            // Downpayment required
            NotificationService::send(
                recipients: $customer,
                title: "Downpayment Required: {$ref}",
                message: 'Your booking has been accepted! Please submit 20% downpayment (₱8,000.00) to confirm your reservation.',
                actionUrl: $customerBookingUrl,
                category: 'payment',
                type: 'customer_downpayment_required',
                icon: '💳',
                role: 'customer',
                meta: ['demo' => true]
            );

            // Payment submitted
            NotificationService::send(
                recipients: $customer,
                title: "Payment Proof Submitted: {$ref}",
                message: 'Your GCash receipt for ₱8,000.00 is submitted and awaiting supplier verification.',
                actionUrl: $customerBookingUrl,
                category: 'payment',
                type: 'customer_payment_submitted',
                icon: '💳',
                role: 'customer',
                meta: ['demo' => true]
            );

            // Payment verified
            NotificationService::send(
                recipients: $customer,
                title: "Payment Verified: {$ref}",
                message: 'Gold Star Catering verified your payment of ₱8,000.00. Official receipt attached.',
                actionUrl: $customerBookingUrl,
                category: 'payment',
                type: 'customer_payment_verified',
                icon: '✅',
                role: 'customer',
                meta: ['demo' => true]
            );

            // Payment rejected
            NotificationService::send(
                recipients: $customer,
                title: 'Payment Verification Notice',
                message: 'Receipt reference number was illegible. Please upload a clear screenshot of your GCash receipt.',
                actionUrl: $customerBookingUrl,
                category: 'payment',
                type: 'customer_payment_rejected',
                icon: '⚠️',
                role: 'customer',
                meta: ['demo' => true]
            );

            // Booking confirmed
            NotificationService::send(
                recipients: $customer,
                title: "Booking Confirmed! {$ref} 🎉",
                message: "All downpayments verified! Your event 'Our Dream Wedding 2026' is officially locked in.",
                actionUrl: $customerBookingUrl,
                category: 'booking',
                type: 'customer_booking_confirmed',
                icon: '🎉',
                role: 'customer',
                meta: ['demo' => true]
            );

            // New message
            NotificationService::send(
                recipients: $customer,
                title: 'New Message from Chef Antonio',
                message: '"We have finalized the tasting menu for your review. Let us know your preferred soup choice."',
                actionUrl: route('messages.index'),
                category: 'message',
                type: 'new_message',
                icon: '💬',
                role: 'customer',
                meta: ['demo' => true]
            );

            // Upcoming event reminder
            NotificationService::send(
                recipients: $customer,
                title: 'Upcoming Event in 7 Days! ⏰',
                message: "Your event 'Our Dream Wedding 2026' is in exactly one week! Check your itinerary with suppliers.",
                actionUrl: $customerBookingUrl,
                category: 'booking',
                type: 'upcoming_event_reminder',
                icon: '⏰',
                role: 'customer',
                meta: ['demo' => true]
            );

            // Review reminder
            NotificationService::send(
                recipients: $customer,
                title: '⭐ How was your event experience?',
                message: "We hope your celebration was magical! Share a review for 'Gold Star Catering' to help future couples.",
                actionUrl: $customerBookingUrl,
                category: 'review',
                type: 'customer_review_reminder',
                icon: '⭐',
                role: 'customer',
                meta: ['demo' => true]
            );

            // Booking cancellation
            NotificationService::send(
                recipients: $customer,
                title: 'Booking Cancellation Confirmed',
                message: "Your cancellation request for 'Pre-wedding Photo Shoot' has been completed.",
                actionUrl: $customerBookingUrl,
                category: 'booking',
                type: 'customer_booking_cancelled',
                icon: '🚫',
                role: 'customer',
                meta: ['demo' => true]
            );
        }

        $this->info('Completed seeding all demo notifications!');

        return Command::SUCCESS;
    }
}
