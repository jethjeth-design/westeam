<?php

namespace App\Services;

use App\Models\BookingItem;
use App\Models\User;
use Carbon\Carbon;
use Google\Client as GoogleClient;
use Google\Service\Calendar as GoogleCalendar;
use Google\Service\Calendar\Event as GoogleEvent;
use Google\Service\Calendar\EventDateTime as GoogleEventDateTime;
use Illuminate\Support\Facades\Log;
use Throwable;

class GoogleCalendarService
{
    /**
     * Check if Google OAuth credentials are configured in services.
     */
    public static function isConfigured(): bool
    {
        return ! empty(config('services.google.client_id'))
            && ! empty(config('services.google.client_secret'));
    }

    /**
     * Instantiate and configure a Google Client.
     */
    public function makeClient(?string $redirectUri = null): GoogleClient
    {
        $client = new GoogleClient;
        $client->setClientId(config('services.google.client_id'));
        $client->setClientSecret(config('services.google.client_secret'));
        $client->setAccessType('offline');
        $client->setPrompt('consent');
        $client->addScope([
            'openid',
            'profile',
            'email',
            GoogleCalendar::CALENDAR_EVENTS,
        ]);

        if (! $redirectUri) {
            $configured = config('services.google.calendar_redirect', '/supplier/calendar/callback');
            $redirectUri = (str_starts_with($configured, 'http://') || str_starts_with($configured, 'https://'))
                ? $configured
                : url($configured);
        }
        $client->setRedirectUri($redirectUri);

        return $client;
    }

    /**
     * Build an authenticated Google Client for a supplier.
     */
    public function getAuthenticatedClient(User $supplier): ?GoogleClient
    {
        if (! self::isConfigured()) {
            return null;
        }

        $account = $supplier->calendarAccount;
        if (! $account || ! $account->is_connected || empty($account->access_token)) {
            return null;
        }

        $client = $this->makeClient();

        $tokenArray = [
            'access_token' => $account->access_token,
            'refresh_token' => $account->refresh_token,
            'expires_in' => $account->expires_at ? max(0, $account->expires_at->diffInSeconds(now())) : 3600,
            'created' => $account->updated_at ? $account->updated_at->timestamp : time(),
        ];

        $client->setAccessToken($tokenArray);

        // Refresh token if expired
        if ($client->isAccessTokenExpired()) {
            if ($account->refresh_token) {
                try {
                    $newToken = $client->fetchAccessTokenWithRefreshToken($account->refresh_token);

                    if (! isset($newToken['error'])) {
                        $expiresIn = $newToken['expires_in'] ?? 3600;
                        $account->update([
                            'access_token' => $newToken['access_token'] ?? $account->access_token,
                            'expires_at' => now()->addSeconds($expiresIn),
                            'refresh_token' => $newToken['refresh_token'] ?? $account->refresh_token,
                        ]);
                    } else {
                        Log::warning("Google Calendar token refresh failed for supplier {$supplier->id}: ".($newToken['error_description'] ?? $newToken['error']));

                        return null;
                    }
                } catch (Throwable $e) {
                    Log::error("Exception refreshing Google Calendar token for supplier {$supplier->id}: ".$e->getMessage());

                    return null;
                }
            } else {
                Log::warning("No refresh token available for supplier {$supplier->id}");

                return null;
            }
        }

        return $client;
    }

    /**
     * Sync a single BookingItem to the supplier's Google Calendar.
     * Creates, updates, or deletes the calendar event based on status.
     */
    public function syncBookingItem(BookingItem $item): bool
    {
        $supplier = $item->supplier;
        if (! $supplier) {
            return false;
        }

        $client = $this->getAuthenticatedClient($supplier);
        if (! $client) {
            // Supplier does not have a connected calendar or sync is not configured
            return false;
        }

        $calendarService = new GoogleCalendar($client);
        $account = $supplier->calendarAccount;
        $calendarId = $account->calendar_id ?: 'primary';

        $item->loadMissing(['booking.customer']);
        $booking = $item->booking;

        if (! $booking) {
            return false;
        }

        // If the booking or item is cancelled or rejected, remove the event from calendar
        if (in_array($item->status, ['cancelled', 'rejected']) || in_array($booking->overall_status, ['cancelled', 'rejected'])) {
            return $this->removeBookingItem($item);
        }

        // Only sync confirmed or accepted bookings
        if (! in_array($item->status, ['confirmed', 'accepted'])) {
            return false;
        }

        try {
            $eventData = $this->buildGoogleEvent($item, $booking);

            if ($item->google_calendar_event_id) {
                // Attempt to update existing Google Calendar event
                try {
                    $updatedEvent = $calendarService->events->update(
                        $calendarId,
                        $item->google_calendar_event_id,
                        $eventData
                    );

                    $item->update([
                        'calendar_synced_at' => now(),
                    ]);

                    $account->update(['last_synced_at' => now()]);

                    return true;
                } catch (Throwable $updateException) {
                    // If event was deleted on Google Calendar (404), fall through to insert
                    if ($updateException->getCode() === 404) {
                        Log::info("Calendar event {$item->google_calendar_event_id} not found in Google. Re-creating...");
                    } else {
                        throw $updateException;
                    }
                }
            }

            // Insert new event
            $createdEvent = $calendarService->events->insert($calendarId, $eventData);

            $item->update([
                'google_calendar_event_id' => $createdEvent->getId(),
                'calendar_synced_at' => now(),
            ]);

            $account->update(['last_synced_at' => now()]);

            return true;
        } catch (Throwable $e) {
            Log::error("Failed to sync booking item #{$item->id} to Google Calendar: ".$e->getMessage(), [
                'item_id' => $item->id,
                'supplier_id' => $supplier->id,
            ]);

            return false;
        }
    }

    /**
     * Remove a booking item's event from Google Calendar.
     */
    public function removeBookingItem(BookingItem $item): bool
    {
        if (! $item->google_calendar_event_id) {
            return true;
        }

        $supplier = $item->supplier;
        if (! $supplier) {
            return false;
        }

        $client = $this->getAuthenticatedClient($supplier);
        if (! $client) {
            return false;
        }

        try {
            $calendarService = new GoogleCalendar($client);
            $account = $supplier->calendarAccount;
            $calendarId = $account->calendar_id ?: 'primary';

            try {
                $calendarService->events->delete($calendarId, $item->google_calendar_event_id);
            } catch (Throwable $e) {
                // If already deleted in Google (404/410), ignore
                if ($e->getCode() !== 404 && $e->getCode() !== 410) {
                    throw $e;
                }
            }

            $item->update([
                'google_calendar_event_id' => null,
                'calendar_synced_at' => now(),
            ]);

            return true;
        } catch (Throwable $e) {
            Log::error("Failed to delete event {$item->google_calendar_event_id} from Google Calendar: ".$e->getMessage());

            return false;
        }
    }

    /**
     * Resync all confirmed/accepted bookings for a supplier.
     */
    public function syncAllSupplierBookings(User $supplier): array
    {
        $items = BookingItem::where('supplier_id', $supplier->id)
            ->whereIn('status', ['confirmed', 'accepted'])
            ->whereHas('booking', function ($q) {
                $q->whereNotIn('overall_status', ['cancelled', 'rejected']);
            })
            ->get();

        $synced = 0;
        $failed = 0;

        foreach ($items as $item) {
            if ($this->syncBookingItem($item)) {
                $synced++;
            } else {
                $failed++;
            }
        }

        return [
            'total' => $items->count(),
            'synced' => $synced,
            'failed' => $failed,
        ];
    }

    /**
     * Build Google Event object with rich details.
     */
    protected function buildGoogleEvent(BookingItem $item, $booking): GoogleEvent
    {
        $customerName = $booking->customer?->name ?? 'Client';
        $customerEmail = $booking->customer?->email ?? 'N/A';
        $customerPhone = $booking->customer?->contact_number ?? $booking->customer?->phone ?? 'N/A';

        $summary = "[Confirmed] {$booking->event_name} - {$item->item_name}";

        $descriptionLines = [
            '=========================================',
            'WESTEAM EVENT BOOKING DETAILS',
            '=========================================',
            "Event: {$booking->event_name}",
            "Booking Reference: {$booking->booking_reference}",
            "Package / Service: {$item->item_name} (".ucfirst($item->item_type).')',
            'Unit Price: ₱'.number_format((float) $item->unit_price, 2),
            'Status: '.ucfirst($item->status),
            '',
            'CUSTOMER DETAILS:',
            "Name: {$customerName}",
            "Email: {$customerEmail}",
            "Phone: {$customerPhone}",
            '',
            'EVENT LOCATION / VENUE:',
            "{$booking->event_location}",
            '',
            'GUEST COUNT: '.($booking->guest_count ?: 'Not specified'),
            'SPECIAL REQUESTS / NOTES: '.($booking->special_requests ?: 'None'),
            '=========================================',
            'Synchronized automatically from Westeam Booking System.',
        ];

        $description = implode("\n", $descriptionLines);

        $event = new GoogleEvent([
            'summary' => $summary,
            'location' => $booking->event_location,
            'description' => $description,
            'status' => 'confirmed',
        ]);

        $appTimezone = config('app.timezone', 'Asia/Manila');
        $eventDate = $booking->event_date instanceof Carbon
            ? $booking->event_date->format('Y-m-d')
            : (string) $booking->event_date;

        if (! empty($booking->event_time)) {
            // Formats with specific start and end time (default duration 4 hours)
            try {
                $startTimeStr = date('H:i:s', strtotime($booking->event_time));
                $startCarbon = Carbon::parse("{$eventDate} {$startTimeStr}", $appTimezone);
                $endCarbon = (clone $startCarbon)->addHours(4);

                $startDateTime = new GoogleEventDateTime([
                    'dateTime' => $startCarbon->toRfc3339String(),
                    'timeZone' => $appTimezone,
                ]);

                $endDateTime = new GoogleEventDateTime([
                    'dateTime' => $endCarbon->toRfc3339String(),
                    'timeZone' => $appTimezone,
                ]);

                $event->setStart($startDateTime);
                $event->setEnd($endDateTime);
            } catch (Throwable) {
                // Fallback to all-day event
                $this->setAllDayEvent($event, $eventDate);
            }
        } else {
            // All-day event
            $this->setAllDayEvent($event, $eventDate);
        }

        return $event;
    }

    /**
     * Set event as an all-day event.
     */
    protected function setAllDayEvent(GoogleEvent $event, string $dateString): void
    {
        $start = new GoogleEventDateTime;
        $start->setDate($dateString);

        // Google Calendar all-day end date is exclusive, so next day
        $endDate = Carbon::parse($dateString)->addDay()->format('Y-m-d');
        $end = new GoogleEventDateTime;
        $end->setDate($endDate);

        $event->setStart($start);
        $event->setEnd($end);
    }
}
