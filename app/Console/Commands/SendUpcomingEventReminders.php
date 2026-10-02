<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendUpcomingEventReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-event-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send upcoming event notifications to customers and suppliers for active bookings';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $today = Carbon::today();
        $targetDates = [
            0 => $today->toDateString(),
            1 => $today->copy()->addDay()->toDateString(),
            3 => $today->copy()->addDays(3)->toDateString(),
            7 => $today->copy()->addDays(7)->toDateString(),
        ];

        $this->info('Scanning for upcoming events...');

        $bookings = Booking::with(['customer', 'items.supplier', 'team.coordinator'])
            ->whereIn('overall_status', ['confirmed', 'accepted'])
            ->whereIn('event_date', array_values($targetDates))
            ->get();

        $count = 0;

        foreach ($bookings as $booking) {
            $eventDate = Carbon::parse($booking->event_date)->startOfDay();
            $daysRemaining = (int) $today->diffInDays($eventDate, false);

            if ($daysRemaining < 0) {
                continue;
            }

            // Remind customer
            if ($booking->customer) {
                NotificationService::notifyUpcomingEventReminder($booking->customer, $booking, $daysRemaining);
                $count++;
            }

            // Remind suppliers
            $notifiedSupplierIds = [];

            foreach ($booking->items as $item) {
                if ($item->supplier && ! in_array($item->supplier_id, $notifiedSupplierIds, true)) {
                    NotificationService::notifyUpcomingEventReminder($item->supplier, $booking, $daysRemaining);
                    $notifiedSupplierIds[] = $item->supplier_id;
                    $count++;
                }
            }

            // Remind team coordinator if applicable
            if ($booking->team && $booking->team->coordinator && ! in_array($booking->team->coordinator_id, $notifiedSupplierIds, true)) {
                NotificationService::notifyUpcomingEventReminder($booking->team->coordinator, $booking, $daysRemaining);
                $count++;
            }
        }

        $this->info("Successfully sent {$count} upcoming event reminders across {$bookings->count()} bookings.");

        return Command::SUCCESS;
    }
}
