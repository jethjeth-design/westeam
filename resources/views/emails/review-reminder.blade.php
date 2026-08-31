@extends('emails.layouts.master', [
    'subject' => $subject ?? '⭐ How was your event? Share your review',
    'headerCategory' => 'Review & Feedback',
    'headerDate' => now()->format('F j, Y')
])

@section('content')
@php
    $customerName = $recipientName ?? $booking->customer->name ?? 'Valued Customer';
    $supplierName = $bookingItem->supplier->supplierProfile->business_name ?? ($bookingItem->supplier->name ?? 'your supplier');
    $itemName = $bookingItem->item_name ?? 'Completed Service';
    $eventType = $booking->event_name ?? 'Celebration Event';
    $eventDate = $booking->event_date ? (is_string($booking->event_date) ? date('F j, Y', strtotime($booking->event_date)) : $booking->event_date->format('F j, Y')) : 'Recent event';
    $ref = $booking->booking_reference ?? ('#BK-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT));
@endphp

<!-- GREETING & SUMMARY HEADER CARD -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
    <tr>
        <td valign="top" style="padding-right: 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td valign="top" width="56" style="width: 56px; padding-right: 14px;">
                        <table role="presentation" width="52" height="52" cellpadding="0" cellspacing="0" border="0" style="background-color: #FEF9EE; border: 1.5px solid #F6E0B5; border-radius: 50%; text-align: center;">
                            <tr>
                                <td align="center" valign="middle" style="height: 52px; text-align: center; vertical-align: middle;">
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="#F59E0B" stroke="#D97706" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
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
                            We hope your <strong>{{ $eventType }}</strong> was unforgettable! How was your experience with <strong>{{ $supplierName }}</strong>?
                        </div>
                    </td>
                </tr>
            </table>
        </td>

        <!-- Right: Status Box -->
        <td valign="top" align="right" width="200" style="width: 200px;" class="stack-column mobile-pt-15">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF8F5; border: 1px solid #EFEAE2; border-radius: 12px; padding: 14px 16px; text-align: left;">
                <tr>
                    <td>
                        <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase; letter-spacing: 0.5px;">
                            Booking Reference
                        </div>
                        <div style="font-size: 16px; font-weight: 800; color: #C09D62; margin-top: 2px; font-family: monospace; letter-spacing: 0.5px;">
                            {{ $ref }}
                        </div>
                        <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 10px;">
                            Service Status
                        </div>
                        <div style="margin-top: 3px;">
                            @include('emails.components.status-badge', ['status' => 'completed'])
                        </div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

<!-- STAR RATING PROMPT CARD -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; background: linear-gradient(180deg, #FFFCF7 0%, #FAF6EE 100%); border: 1.5px solid #F0E4CE; border-radius: 14px; padding: 22px 20px; text-align: center;">
    <tr>
        <td align="center">
            <div style="font-size: 11.5px; font-weight: 700; color: #B45309; text-transform: uppercase; letter-spacing: 1px;">
                Rate Your Experience
            </div>
            <div style="font-size: 17px; font-weight: 800; color: #1E232F; margin-top: 4px;">
                {{ $itemName }}
            </div>
            <div style="font-size: 13px; color: #767E91; margin-top: 2px;">
                Delivered by {{ $supplierName }} on {{ $eventDate }}
            </div>

            <!-- Visual Stars -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 14px auto 8px auto;">
                <tr>
                    @for($i = 1; $i <= 5; $i++)
                    <td style="padding: 0 4px;">
                        <a href="{{ $actionUrl ?? url('/customer/bookings') }}" style="text-decoration: none; font-size: 26px; color: #F59E0B; line-height: 1;">
                            ★
                        </a>
                    </td>
                    @endfor
                </tr>
            </table>
            
            <div style="font-size: 12px; color: #8F95A3; margin-top: 4px;">
                Click any star to submit your review & rating.
            </div>
        </td>
    </tr>
</table>

<!-- WHY REVIEWS MATTER NOTE -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px; background-color: #FAF8F5; border: 1px solid #EFEAE2; border-radius: 10px; padding: 14px 16px;">
    <tr>
        <td width="30" valign="top" style="padding-right: 10px;">
            <span style="font-size: 16px;">💡</span>
        </td>
        <td valign="top" style="font-size: 12.5px; color: #64748B; line-height: 1.5;">
            Your feedback helps other couples & event organizers find trusted suppliers, while helping <strong>{{ $supplierName }}</strong> earn verified badges.
        </td>
    </tr>
</table>

<!-- ACTION BUTTON -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px; margin-bottom: 20px;">
    <tr>
        <td align="center" style="text-align: center;">
            <a href="{{ $actionUrl ?? url('/customer/bookings') }}" class="btn-gold" style="background-color: #C09D62; color: #FFFFFF; border-radius: 8px; padding: 14px 34px; font-weight: 700; font-size: 14.5px; display: inline-block; text-decoration: none;">
                ⭐ Write a Review for {{ $supplierName }}
            </a>
            <div style="font-size: 11.5px; color: #8F95A3; margin-top: 10px;">
                Takes less than 60 seconds to share your thoughts.
            </div>
        </td>
    </tr>
</table>
@endsection
