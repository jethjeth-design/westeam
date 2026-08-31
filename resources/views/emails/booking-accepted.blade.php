@extends('emails.layouts.master', [
    'subject' => $subject ?? '✓ Booking Confirmed',
    'headerCategory' => 'Booking Confirmed',
    'headerDate' => now()->format('F j, Y')
])

@section('content')
@php
    $customerName = $booking->customer->name ?? $recipientName ?? 'Valued Customer';
    $supplierName = $bookingItem->supplier->supplierProfile->business_name ?? ($bookingItem->supplier->name ?? 'Your Supplier');
    $location = $booking->event_location ?? 'To be announced';
    $eventType = $booking->event_name ?? 'Special Celebration';
    $eventDate = $booking->event_date ? (is_string($booking->event_date) ? date('F j, Y', strtotime($booking->event_date)) : $booking->event_date->format('F j, Y')) : 'Date pending';
    if (!empty($booking->event_time)) {
        $eventDate .= ' • ' . $booking->event_time;
    }
    $itemName = $bookingItem->item_name ?? 'Reserved Event Package/Service';
    $itemPrice = '₱' . number_format($bookingItem->unit_price ?? $booking->total_amount, 2);
    $ref = $booking->booking_reference ?? ('#BK-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT));
@endphp

<!-- GREETING & SUMMARY HEADER CARD -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
    <tr>
        <td valign="top" style="padding-right: 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td valign="top" width="56" style="width: 56px; padding-right: 14px;">
                        <table role="presentation" width="52" height="52" cellpadding="0" cellspacing="0" border="0" style="background-color: #ECFDF5; border: 1.5px solid #A7F3D0; border-radius: 50%; text-align: center;">
                            <tr>
                                <td align="center" valign="middle" style="height: 52px; text-align: center; vertical-align: middle;">
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                </td>
                            </tr>
                        </table>
                    </td>
                    <td valign="top">
                        <div style="font-size: 19px; font-weight: 800; color: #1E232F; line-height: 1.25; font-family: 'Plus Jakarta Sans', sans-serif;">
                            Great news, {{ $customerName }}!
                        </div>
                        <div style="font-size: 13.5px; color: #586071; line-height: 1.5; margin-top: 6px;">
                            Your booking request with <strong>{{ $supplierName }}</strong> has been officially <span style="color: #16A34A; font-weight: 700;">accepted & confirmed</span>.
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
                            @include('emails.components.status-badge', ['status' => 'accepted'])
                        </div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

<!-- CONFIRMED ITEM CARD -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 22px; background: linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%); border: 1.5px solid #BBF7D0; border-radius: 14px; padding: 18px 20px;">
    <tr>
        <td valign="top">
            <div style="font-size: 11px; font-weight: 700; color: #16A34A; text-transform: uppercase; letter-spacing: 0.8px;">
                ✓ Confirmed Reservation
            </div>
            <div style="font-size: 16px; font-weight: 800; color: #1E232F; margin-top: 4px;">
                {{ $itemName }}
            </div>
            <div style="font-size: 12.5px; color: #64748B; margin-top: 2px;">
                Provided by <strong>{{ $supplierName }}</strong>
            </div>
        </td>
        <td valign="middle" align="right" style="padding-left: 15px;">
            <div style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase;">Amount</div>
            <div style="font-size: 18px; font-weight: 800; color: #16A34A; margin-top: 2px;">
                {{ $itemPrice }}
            </div>
        </td>
    </tr>
</table>

<!-- BOOKING DETAILS SECTION -->
<div style="font-size: 15px; font-weight: 800; color: #1E232F; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; border-bottom: 1px solid #F0ECE4; padding-bottom: 8px;">
    Event Details
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
    <tr>
        <td width="50%" valign="top" class="details-cell" style="padding-right: 12px; padding-bottom: 14px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td width="28" valign="top" style="padding-right: 8px;"><span style="font-size: 16px; color: #C09D62;">💍</span></td>
                    <td valign="top">
                        <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase;">Event Name</div>
                        <div style="font-size: 13.5px; font-weight: 700; color: #2D3142; margin-top: 2px;">{{ $eventType }}</div>
                    </td>
                </tr>
            </table>
        </td>
        <td width="50%" valign="top" class="details-cell" style="padding-left: 12px; padding-bottom: 14px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td width="28" valign="top" style="padding-right: 8px;"><span style="font-size: 16px; color: #C09D62;">📍</span></td>
                    <td valign="top">
                        <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase;">Location</div>
                        <div style="font-size: 13.5px; font-weight: 700; color: #2D3142; margin-top: 2px;">{{ $location }}</div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td width="50%" valign="top" class="details-cell" style="padding-right: 12px; padding-bottom: 6px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td width="28" valign="top" style="padding-right: 8px;"><span style="font-size: 16px; color: #C09D62;">📅</span></td>
                    <td valign="top">
                        <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase;">Event Schedule</div>
                        <div style="font-size: 13.5px; font-weight: 700; color: #2D3142; margin-top: 2px;">{{ $eventDate }}</div>
                    </td>
                </tr>
            </table>
        </td>
        <td width="50%" valign="top" class="details-cell" style="padding-left: 12px; padding-bottom: 6px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td width="28" valign="top" style="padding-right: 8px;"><span style="font-size: 16px; color: #C09D62;">👥</span></td>
                    <td valign="top">
                        <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase;">Guest Count</div>
                        <div style="font-size: 13.5px; font-weight: 700; color: #2D3142; margin-top: 2px;">{{ $booking->guest_count ? number_format($booking->guest_count).' Guests' : 'Not specified' }}</div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

<!-- SUPPLIER RESPONSE NOTES CALLOUT -->
@if(!empty($responseNotes))
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; background-color: #F8FAF9; border: 1px solid #D5E7DF; border-radius: 12px; padding: 16px 18px;">
    <tr>
        <td valign="top">
            <div style="font-size: 12px; font-weight: 700; color: #2C6E49; text-transform: uppercase; letter-spacing: 0.5px;">
                💬 Note from {{ $supplierName }}
            </div>
            <div style="font-size: 13px; color: #2D3748; line-height: 1.5; font-style: italic; margin-top: 6px;">
                "{{ $responseNotes }}"
            </div>
        </td>
    </tr>
</table>
@endif

<!-- ACTION BUTTON -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px; margin-bottom: 20px;">
    <tr>
        <td align="center" style="text-align: center;">
            <a href="{{ $actionUrl ?? url('/customer/bookings') }}" class="btn-primary" style="background-color: #4E6E58; color: #FFFFFF; border-radius: 8px; padding: 14px 36px; font-weight: 700; font-size: 14.5px; display: inline-block; text-decoration: none;">
                View Booking Details →
            </a>
            <div style="font-size: 11.5px; color: #8F95A3; margin-top: 10px;">
                You can message the supplier directly or manage schedule updates anytime.
            </div>
        </td>
    </tr>
</table>
@endsection
