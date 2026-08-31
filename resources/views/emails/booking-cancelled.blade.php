@extends('emails.layouts.master', [
    'subject' => $subject ?? 'Booking Cancelled',
    'headerCategory' => 'Booking Cancelled',
    'headerDate' => now()->format('F j, Y')
])

@section('content')
@php
    $customerName = $booking->customer->name ?? 'Valued Customer';
    $location = $booking->event_location ?? 'To be announced';
    $eventType = $booking->event_name ?? 'Special Celebration';
    $eventDate = $booking->event_date ? (is_string($booking->event_date) ? date('F j, Y', strtotime($booking->event_date)) : $booking->event_date->format('F j, Y')) : 'Date pending';
    $totalAmount = '₱' . number_format($booking->total_amount, 2);
    $ref = $booking->booking_reference ?? ('#BK-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT));
@endphp

<!-- GREETING & SUMMARY HEADER CARD -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
    <tr>
        <td valign="top" style="padding-right: 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td valign="top" width="56" style="width: 56px; padding-right: 14px;">
                        <table role="presentation" width="52" height="52" cellpadding="0" cellspacing="0" border="0" style="background-color: #F3F4F6; border: 1.5px solid #E5E7EB; border-radius: 50%; text-align: center;">
                            <tr>
                                <td align="center" valign="middle" style="height: 52px; text-align: center; vertical-align: middle;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4B5563" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
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
                            The booking for <strong>{{ $eventType }}</strong> ({{ $ref }}) has been marked as <span style="color: #4B5563; font-weight: 700;">Cancelled</span>.
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
                            @include('emails.components.status-badge', ['status' => 'cancelled'])
                        </div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

<!-- BOOKING DETAILS SECTION -->
<div style="font-size: 15px; font-weight: 800; color: #1E232F; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; border-bottom: 1px solid #F0ECE4; padding-bottom: 8px;">
    Cancelled Booking Details
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
    <tr>
        <td width="50%" valign="top" class="details-cell" style="padding-right: 12px; padding-bottom: 12px;">
            <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase;">Customer</div>
            <div style="font-size: 13.5px; font-weight: 700; color: #2D3142; margin-top: 2px;">{{ $customerName }}</div>
        </td>
        <td width="50%" valign="top" class="details-cell" style="padding-left: 12px; padding-bottom: 12px;">
            <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase;">Event Date</div>
            <div style="font-size: 13.5px; font-weight: 700; color: #2D3142; margin-top: 2px;">{{ $eventDate }}</div>
        </td>
    </tr>
    <tr>
        <td width="50%" valign="top" class="details-cell" style="padding-right: 12px; padding-bottom: 6px;">
            <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase;">Location</div>
            <div style="font-size: 13.5px; font-weight: 700; color: #2D3142; margin-top: 2px;">{{ $location }}</div>
        </td>
        <td width="50%" valign="top" class="details-cell" style="padding-left: 12px; padding-bottom: 6px;">
            <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase;">Total Booking Value</div>
            <div style="font-size: 13.5px; font-weight: 700; color: #2D3142; margin-top: 2px;">{{ $totalAmount }}</div>
        </td>
    </tr>
</table>

<!-- ACTION BUTTON -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px; margin-bottom: 20px;">
    <tr>
        <td align="center" style="text-align: center;">
            <a href="{{ $actionUrl ?? url('/customer/bookings') }}" class="btn-primary" style="background-color: #2D3142; color: #FFFFFF; border-radius: 8px; padding: 13px 32px; font-weight: 700; font-size: 14px; display: inline-block; text-decoration: none;">
                View Booking Summary →
            </a>
            <div style="font-size: 11.5px; color: #8F95A3; margin-top: 10px;">
                Your calendar schedule has been updated accordingly.
            </div>
        </td>
    </tr>
</table>
@endsection
