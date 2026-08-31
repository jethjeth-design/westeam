@extends('emails.layouts.master', [
    'subject' => $subject ?? 'New Booking Request',
    'headerCategory' => ($recipientType ?? 'supplier') === 'customer' ? 'Booking Confirmation' : 'Booking Notification',
    'headerDate' => now()->format('F j, Y')
])

@section('content')
@php
    $isCustomer = ($recipientType ?? 'supplier') === 'customer';
    $isCoordinator = ($recipientType ?? 'supplier') === 'coordinator';
    
    $customerName = $booking->customer->name ?? 'Valued Customer';
    $location = $booking->event_location ?? 'To be announced';
    $eventType = $booking->event_name ?? 'Special Celebration';
    $guestCount = $booking->guest_count ? number_format($booking->guest_count).' Guests' : 'Not specified';
    $eventDate = $booking->event_date ? (is_string($booking->event_date) ? date('F j, Y', strtotime($booking->event_date)) : $booking->event_date->format('F j, Y')) : 'Date pending';
    if (!empty($booking->event_time)) {
        $eventDate .= ' • ' . $booking->event_time;
    }
    $totalAmount = '₱' . number_format($booking->total_amount, 2);
    $specialRequests = $booking->special_requests ?? null;
    $ref = $booking->booking_reference ?? ('#BK-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT));
@endphp

<!-- GREETING & SUMMARY HEADER CARD -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
    <tr>
        <!-- Left: Icon + Greeting -->
        <td valign="top" style="padding-right: 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td valign="top" width="56" style="width: 56px; padding-right: 14px;">
                        <table role="presentation" width="52" height="52" cellpadding="0" cellspacing="0" border="0" style="background-color: #FDF9F3; border: 1.5px solid #F0E2CD; border-radius: 50%; text-align: center;">
                            <tr>
                                <td align="center" valign="middle" style="height: 52px; text-align: center; vertical-align: middle;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C09D62" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                        <circle cx="8" cy="14" r="1" fill="#C09D62"></circle>
                                        <circle cx="12" cy="14" r="1" fill="#C09D62"></circle>
                                        <circle cx="16" cy="14" r="1" fill="#C09D62"></circle>
                                    </svg>
                                </td>
                            </tr>
                        </table>
                    </td>
                    <td valign="top">
                        <div style="font-size: 19px; font-weight: 800; color: #1E232F; line-height: 1.25; font-family: 'Plus Jakarta Sans', sans-serif;">
                            Hello {{ $recipientName ?? 'there' }},
                        </div>
                        <div style="font-size: 13.5px; color: #586071; line-height: 1.5; margin-top: 6px;">
                            @if($isCustomer)
                                Your booking request has been submitted successfully. Please review the details below while waiting for supplier confirmation.
                            @elseif($isCoordinator)
                                You have received a new <strong>Team Package</strong> reservation. Please review the booking items and coordinate with your team.
                            @else
                                You have received a new booking request. Please review the event details below and respond at your earliest convenience.
                            @endif
                        </div>
                    </td>
                </tr>
            </table>
        </td>

        <!-- Right: Booking ID Box -->
        <td valign="top" align="right" width="200" style="width: 200px;" class="stack-column mobile-pt-15">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF8F5; border: 1px solid #EFEAE2; border-radius: 12px; padding: 14px 16px; text-align: left;">
                <tr>
                    <td>
                        <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase; letter-spacing: 0.5px;">
                            Booking ID
                        </div>
                        <div style="font-size: 16px; font-weight: 800; color: #C09D62; margin-top: 2px; font-family: monospace; letter-spacing: 0.5px;">
                            {{ $ref }}
                        </div>
                        <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 10px;">
                            Status
                        </div>
                        <div style="margin-top: 3px;">
                            @include('emails.components.status-badge', ['status' => $booking->overall_status ?? 'pending'])
                        </div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

<!-- BOOKING DETAILS SECTION -->
<div style="font-size: 15px; font-weight: 800; color: #1E232F; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; border-bottom: 1px solid #F0ECE4; padding-bottom: 8px;">
    Booking Details
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
    <tr>
        <!-- Row 1: Left (Customer / Supplier) | Right (Location) -->
        <td width="50%" valign="top" class="details-cell" style="padding-right: 12px; padding-bottom: 14px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td width="28" valign="top" style="padding-right: 8px;">
                        <span style="font-size: 16px; color: #C09D62;">👤</span>
                    </td>
                    <td valign="top">
                        <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase; letter-spacing: 0.3px;">
                            {{ $isCustomer ? 'Booked By' : 'Customer Name' }}
                        </div>
                        <div style="font-size: 13.5px; font-weight: 700; color: #2D3142; margin-top: 2px;">
                            {{ $customerName }}
                        </div>
                    </td>
                </tr>
            </table>
        </td>

        <td width="50%" valign="top" class="details-cell" style="padding-left: 12px; padding-bottom: 14px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td width="28" valign="top" style="padding-right: 8px;">
                        <span style="font-size: 16px; color: #C09D62;">📍</span>
                    </td>
                    <td valign="top">
                        <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase; letter-spacing: 0.3px;">
                            Event Location
                        </div>
                        <div style="font-size: 13.5px; font-weight: 700; color: #2D3142; margin-top: 2px;">
                            {{ $location }}
                        </div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <tr>
        <!-- Row 2: Left (Event Type) | Right (Guest Count) -->
        <td width="50%" valign="top" class="details-cell" style="padding-right: 12px; padding-bottom: 14px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td width="28" valign="top" style="padding-right: 8px;">
                        <span style="font-size: 16px; color: #C09D62;">💍</span>
                    </td>
                    <td valign="top">
                        <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase; letter-spacing: 0.3px;">
                            Event Type / Name
                        </div>
                        <div style="font-size: 13.5px; font-weight: 700; color: #2D3142; margin-top: 2px;">
                            {{ $eventType }}
                        </div>
                    </td>
                </tr>
            </table>
        </td>

        <td width="50%" valign="top" class="details-cell" style="padding-left: 12px; padding-bottom: 14px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td width="28" valign="top" style="padding-right: 8px;">
                        <span style="font-size: 16px; color: #C09D62;">👥</span>
                    </td>
                    <td valign="top">
                        <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase; letter-spacing: 0.3px;">
                            Estimated Guests
                        </div>
                        <div style="font-size: 13.5px; font-weight: 700; color: #2D3142; margin-top: 2px;">
                            {{ $guestCount }}
                        </div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <tr>
        <!-- Row 3: Left (Event Date) | Right (Amount) -->
        <td width="50%" valign="top" class="details-cell" style="padding-right: 12px; padding-bottom: 6px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td width="28" valign="top" style="padding-right: 8px;">
                        <span style="font-size: 16px; color: #C09D62;">📅</span>
                    </td>
                    <td valign="top">
                        <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase; letter-spacing: 0.3px;">
                            Event Schedule
                        </div>
                        <div style="font-size: 13.5px; font-weight: 700; color: #2D3142; margin-top: 2px;">
                            {{ $eventDate }}
                        </div>
                    </td>
                </tr>
            </table>
        </td>

        <td width="50%" valign="top" class="details-cell" style="padding-left: 12px; padding-bottom: 6px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td width="28" valign="top" style="padding-right: 8px;">
                        <span style="font-size: 16px; color: #C09D62;">💳</span>
                    </td>
                    <td valign="top">
                        <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase; letter-spacing: 0.3px;">
                            Total Amount
                        </div>
                        <div style="font-size: 15px; font-weight: 800; color: #1E232F; margin-top: 2px;">
                            {{ $totalAmount }}
                        </div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

<!-- ITEM DETAILS IF PROVIDED -->
@if(isset($bookingItem) && $bookingItem)
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px; background-color: #FAF8F5; border: 1px solid #EFEAE2; border-radius: 10px; padding: 12px 16px;">
    <tr>
        <td valign="middle">
            <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase;">Requested Package / Service</div>
            <div style="font-size: 13.5px; font-weight: 700; color: #1E232F; margin-top: 2px;">
                {{ $bookingItem->item_name }}
            </div>
        </td>
        <td valign="middle" align="right" style="font-size: 14px; font-weight: 800; color: #C09D62;">
            ₱{{ number_format($bookingItem->unit_price, 2) }}
        </td>
    </tr>
</table>
@endif

<!-- SPECIAL REQUESTS / MESSAGE FROM CUSTOMER CALLOUT -->
@if(!empty($specialRequests))
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; background-color: #FDFBF7; border: 1px solid #EFE4D2; border-radius: 12px; padding: 16px 18px;">
    <tr>
        <td valign="top">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td width="24" valign="top" style="padding-right: 6px;">
                        <span style="color: #C09D62; font-size: 15px;">⭐</span>
                    </td>
                    <td valign="top">
                        <div style="font-size: 12px; font-weight: 700; color: #78582A; text-transform: uppercase; letter-spacing: 0.5px;">
                            Message from Customer
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2" style="padding-top: 8px;">
                        <div style="font-size: 13px; color: #4A453E; line-height: 1.5; font-style: italic;">
                            "{{ $specialRequests }}"
                        </div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
@endif

<!-- ACTION BUTTONS SECTION -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px; margin-bottom: 20px;">
    <tr>
        <td align="center" style="text-align: center;">
            @if(!$isCustomer)
                <!-- Supplier Actions -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                    <tr>
                        <td align="center" style="padding: 0 6px;">
                            <a href="{{ $actionUrl ?? url('/supplier/bookings') }}" class="btn-primary" style="background-color: #4E6E58; color: #FFFFFF; border-radius: 8px; padding: 13px 28px; font-weight: 700; font-size: 14px; display: inline-block; text-decoration: none;">
                                ✓ Accept Booking
                            </a>
                        </td>
                        <td align="center" style="padding: 0 6px;">
                            <a href="{{ $actionUrl ?? url('/supplier/bookings') }}" class="btn-secondary" style="background-color: #FFFFFF; color: #D9534F; border: 1px solid #E89E9B; border-radius: 8px; padding: 12px 24px; font-weight: 700; font-size: 14px; display: inline-block; text-decoration: none;">
                                ✕ Decline Booking
                            </a>
                        </td>
                    </tr>
                </table>
                <div style="font-size: 11.5px; color: #8F95A3; margin-top: 10px; font-weight: 500;">
                    Please respond within 3 business days to secure this event.
                </div>
            @else
                <!-- Customer Action -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                    <tr>
                        <td align="center">
                            <a href="{{ $actionUrl ?? url('/customer/bookings') }}" class="btn-gold" style="background-color: #C09D62; color: #FFFFFF; border-radius: 8px; padding: 13px 32px; font-weight: 700; font-size: 14px; display: inline-block; text-decoration: none;">
                                View Booking Details →
                            </a>
                        </td>
                    </tr>
                </table>
                <div style="font-size: 11.5px; color: #8F95A3; margin-top: 10px;">
                    Track status updates in real-time in your customer portal.
                </div>
            @endif
        </td>
    </tr>
</table>
@endsection
