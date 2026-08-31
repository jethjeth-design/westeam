@extends('emails.layouts.master', [
    'subject' => $subject ?? '👥 Team Package Reservation',
    'headerCategory' => 'Team Package Booking',
    'headerDate' => now()->format('F j, Y')
])

@section('content')
@php
    $customerName = $booking->customer->name ?? 'Valued Customer';
    $teamName = $booking->team->name ?? 'Wedding Supplier Team';
    $coordinatorName = $booking->team->coordinator->name ?? 'Lead Coordinator';
    $location = $booking->event_location ?? 'To be announced';
    $eventType = $booking->event_name ?? 'Special Celebration';
    $eventDate = $booking->event_date ? (is_string($booking->event_date) ? date('F j, Y', strtotime($booking->event_date)) : $booking->event_date->format('F j, Y')) : 'Date pending';
    if (!empty($booking->event_time)) {
        $eventDate .= ' • ' . $booking->event_time;
    }
    $totalAmount = '₱' . number_format($booking->total_amount, 2);
    $specialRequests = $booking->special_requests ?? null;
    $ref = $booking->booking_reference ?? ('#BK-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT));
    $isCoordinator = ($role ?? 'coordinator') === 'coordinator';
@endphp

<!-- GREETING & SUMMARY HEADER CARD -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
    <tr>
        <td valign="top" style="padding-right: 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td valign="top" width="56" style="width: 56px; padding-right: 14px;">
                        <table role="presentation" width="52" height="52" cellpadding="0" cellspacing="0" border="0" style="background-color: #FBF8F2; border: 1.5px solid #E5D6BD; border-radius: 50%; text-align: center;">
                            <tr>
                                <td align="center" valign="middle" style="height: 52px; text-align: center; vertical-align: middle;">
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C09D62" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                </td>
                            </tr>
                        </table>
                    </td>
                    <td valign="top">
                        <div style="font-size: 19px; font-weight: 800; color: #1E232F; line-height: 1.25; font-family: 'Plus Jakarta Sans', sans-serif;">
                            Hello {{ $recipientName ?? 'Team' }},
                        </div>
                        <div style="font-size: 13.5px; color: #586071; line-height: 1.5; margin-top: 6px;">
                            A new multi-supplier <strong>Team Package</strong> reservation has been booked for <strong>{{ $teamName }}</strong>.
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
                            Team Booking
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

<!-- TEAM HIGHLIGHT BANNER -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 22px; background: linear-gradient(135deg, #FCF9F3 0%, #FFFFFF 100%); border: 1.5px solid #EBE1D0; border-radius: 14px; padding: 16px 18px;">
    <tr>
        <td>
            <div style="font-size: 11px; font-weight: 700; color: #C09D62; text-transform: uppercase; letter-spacing: 0.8px;">
                👥 Booked Team Package
            </div>
            <div style="font-size: 16px; font-weight: 800; color: #1E232F; margin-top: 4px;">
                {{ $teamName }}
            </div>
            <div style="font-size: 12.5px; color: #64748B; margin-top: 2px;">
                Coordinated by <strong>{{ $coordinatorName }}</strong>
            </div>
        </td>
        <td valign="middle" align="right" style="padding-left: 15px;">
            <div style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase;">Total Package</div>
            <div style="font-size: 18px; font-weight: 800; color: #1E232F; margin-top: 2px;">
                {{ $totalAmount }}
            </div>
        </td>
    </tr>
</table>

<!-- EVENT DETAILS -->
<div style="font-size: 15px; font-weight: 800; color: #1E232F; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; border-bottom: 1px solid #F0ECE4; padding-bottom: 8px;">
    Event Overview
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
    <tr>
        <td width="50%" valign="top" class="details-cell" style="padding-right: 12px; padding-bottom: 12px;">
            <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase;">Customer</div>
            <div style="font-size: 13.5px; font-weight: 700; color: #2D3142; margin-top: 2px;">{{ $customerName }}</div>
        </td>
        <td width="50%" valign="top" class="details-cell" style="padding-left: 12px; padding-bottom: 12px;">
            <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase;">Date & Schedule</div>
            <div style="font-size: 13.5px; font-weight: 700; color: #2D3142; margin-top: 2px;">{{ $eventDate }}</div>
        </td>
    </tr>
    <tr>
        <td width="50%" valign="top" class="details-cell" style="padding-right: 12px; padding-bottom: 6px;">
            <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase;">Location</div>
            <div style="font-size: 13.5px; font-weight: 700; color: #2D3142; margin-top: 2px;">{{ $location }}</div>
        </td>
        <td width="50%" valign="top" class="details-cell" style="padding-left: 12px; padding-bottom: 6px;">
            <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase;">Guest Count</div>
            <div style="font-size: 13.5px; font-weight: 700; color: #2D3142; margin-top: 2px;">{{ $booking->guest_count ? number_format($booking->guest_count).' Guests' : 'Not specified' }}</div>
        </td>
    </tr>
</table>

<!-- ITEM BREAKDOWN IF PRESENT -->
@if($booking->items && $booking->items->isNotEmpty())
<div style="font-size: 13.5px; font-weight: 700; color: #1E232F; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; margin-top: 14px;">
    Team Services Included
</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px; border-collapse: separate; border-spacing: 0 6px;">
    @foreach($booking->items as $item)
    <tr>
        <td style="background-color: #FAF8F5; border: 1px solid #EFEAE2; border-radius: 8px; padding: 10px 14px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td valign="middle">
                        <div style="font-size: 13px; font-weight: 700; color: #2D3142;">
                            {{ $item->item_name }}
                        </div>
                        <div style="font-size: 11.5px; color: #767E91; margin-top: 2px;">
                            Supplier: {{ $item->supplier->supplierProfile->business_name ?? ($item->supplier->name ?? 'Team Member') }}
                        </div>
                    </td>
                    <td valign="middle" align="right" style="padding-left: 10px;">
                        <span style="font-size: 13px; font-weight: 700; color: #C09D62;">
                            ₱{{ number_format($item->unit_price, 2) }}
                        </span>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    @endforeach
</table>
@endif

<!-- SPECIAL REQUESTS -->
@if(!empty($specialRequests))
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; background-color: #FDFBF7; border: 1px solid #EFE4D2; border-radius: 12px; padding: 14px 16px;">
    <tr>
        <td valign="top">
            <div style="font-size: 11px; font-weight: 700; color: #78582A; text-transform: uppercase;">
                Customer Notes / Special Requests
            </div>
            <div style="font-size: 12.5px; color: #4A453E; line-height: 1.5; font-style: italic; margin-top: 4px;">
                "{{ $specialRequests }}"
            </div>
        </td>
    </tr>
</table>
@endif

<!-- ACTION BUTTON -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px; margin-bottom: 20px;">
    <tr>
        <td align="center" style="text-align: center;">
            <a href="{{ $actionUrl ?? url('/supplier/bookings') }}" class="btn-primary" style="background-color: #4E6E58; color: #FFFFFF; border-radius: 8px; padding: 13px 32px; font-weight: 700; font-size: 14px; display: inline-block; text-decoration: none;">
                {{ $isCoordinator ? 'Manage Team Booking →' : 'View Team Schedule →' }}
            </a>
            <div style="font-size: 11.5px; color: #8F95A3; margin-top: 10px;">
                Coordinate with your team members in the EWS messaging workspace.
            </div>
        </td>
    </tr>
</table>
@endsection
