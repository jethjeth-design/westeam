@extends('emails.layouts.master', [
    'subject' => $subject ?? 'Booking Request Declined',
    'headerCategory' => 'Booking Update',
    'headerDate' => now()->format('F j, Y')
])

@section('content')
@php
    $customerName = $booking->customer->name ?? $recipientName ?? 'Valued Customer';
    $supplierName = $bookingItem->supplier->supplierProfile->business_name ?? ($bookingItem->supplier->name ?? 'Your Supplier');
    $location = $booking->event_location ?? 'To be announced';
    $eventType = $booking->event_name ?? 'Special Celebration';
    $eventDate = $booking->event_date ? (is_string($booking->event_date) ? date('F j, Y', strtotime($booking->event_date)) : $booking->event_date->format('F j, Y')) : 'Date pending';
    $itemName = $bookingItem->item_name ?? 'Event Package/Service';
    $ref = $booking->booking_reference ?? ('#BK-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT));
    $reason = $rejectionReason ?? $bookingItem->rejection_reason ?? 'The supplier is unavailable on the requested date.';
@endphp

<!-- GREETING & SUMMARY HEADER CARD -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
    <tr>
        <td valign="top" style="padding-right: 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td valign="top" width="56" style="width: 56px; padding-right: 14px;">
                        <table role="presentation" width="52" height="52" cellpadding="0" cellspacing="0" border="0" style="background-color: #FEF2F2; border: 1.5px solid #FECACA; border-radius: 50%; text-align: center;">
                            <tr>
                                <td align="center" valign="middle" style="height: 52px; text-align: center; vertical-align: middle;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="15" y1="9" x2="9" y2="15"></line>
                                        <line x1="9" y1="9" x2="15" y2="15"></line>
                                    </svg>
                                </td>
                            </tr>
                        </table>
                    </td>
                    <td valign="top">
                        <div style="font-size: 19px; font-weight: 800; color: #1E232F; line-height: 1.25; font-family: 'Plus Jakarta Sans', sans-serif;">
                            Hello {{ $customerName }},
                        </div>
                        <div style="font-size: 13.5px; color: #586071; line-height: 1.5; margin-top: 6px;">
                            We regret to inform you that <strong>{{ $supplierName }}</strong> is unable to accept your booking request for <strong>{{ $itemName }}</strong> at this time.
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
                            @include('emails.components.status-badge', ['status' => 'rejected'])
                        </div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

<!-- REJECTION REASON CALLOUT BOX -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 22px; background-color: #FFF5F5; border: 1.5px solid #FED7D7; border-radius: 12px; padding: 16px 18px;">
    <tr>
        <td valign="top">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td width="24" valign="top" style="padding-right: 6px;">
                        <span style="color: #E53E3E; font-size: 15px;">⚠️</span>
                    </td>
                    <td valign="top">
                        <div style="font-size: 12px; font-weight: 700; color: #9B2C2C; text-transform: uppercase; letter-spacing: 0.5px;">
                            Reason for Declining
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2" style="padding-top: 6px;">
                        <div style="font-size: 13.5px; color: #4A5568; line-height: 1.5; font-style: italic;">
                            "{{ $reason }}"
                        </div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

<!-- BOOKING DETAILS SECTION -->
<div style="font-size: 15px; font-weight: 800; color: #1E232F; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; border-bottom: 1px solid #F0ECE4; padding-bottom: 8px;">
    Requested Event Details
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
    <tr>
        <td width="50%" valign="top" class="details-cell" style="padding-right: 12px; padding-bottom: 12px;">
            <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase;">Event</div>
            <div style="font-size: 13.5px; font-weight: 700; color: #2D3142; margin-top: 2px;">{{ $eventType }}</div>
        </td>
        <td width="50%" valign="top" class="details-cell" style="padding-left: 12px; padding-bottom: 12px;">
            <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase;">Date & Time</div>
            <div style="font-size: 13.5px; font-weight: 700; color: #2D3142; margin-top: 2px;">{{ $eventDate }}</div>
        </td>
    </tr>
    <tr>
        <td width="50%" valign="top" class="details-cell" style="padding-right: 12px; padding-bottom: 6px;">
            <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase;">Location</div>
            <div style="font-size: 13.5px; font-weight: 700; color: #2D3142; margin-top: 2px;">{{ $location }}</div>
        </td>
        <td width="50%" valign="top" class="details-cell" style="padding-left: 12px; padding-bottom: 6px;">
            <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase;">Requested Service</div>
            <div style="font-size: 13.5px; font-weight: 700; color: #2D3142; margin-top: 2px;">{{ $itemName }}</div>
        </td>
    </tr>
</table>

<!-- EXPLORE OTHER SUPPLIERS CTA -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px; margin-bottom: 20px;">
    <tr>
        <td align="center" style="text-align: center;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                <tr>
                    <td align="center" style="padding: 0 6px;">
                        <a href="{{ url('/customer/suppliers') }}" class="btn-gold" style="background-color: #C09D62; color: #FFFFFF; border-radius: 8px; padding: 13px 26px; font-weight: 700; font-size: 14px; display: inline-block; text-decoration: none;">
                            🔍 Find Alternative Suppliers
                        </a>
                    </td>
                    <td align="center" style="padding: 0 6px;">
                        <a href="{{ url('/customer/bookings/' . $booking->id) }}" class="btn-secondary" style="background-color: #FFFFFF; color: #586071; border: 1px solid #D5DBE1; border-radius: 8px; padding: 12px 22px; font-weight: 700; font-size: 14px; display: inline-block; text-decoration: none;">
                            View Booking
                        </a>
                    </td>
                </tr>
            </table>
            <div style="font-size: 11.5px; color: #8F95A3; margin-top: 10px;">
                Our directory features many other verified suppliers ready for your event date.
            </div>
        </td>
    </tr>
</table>
@endsection
