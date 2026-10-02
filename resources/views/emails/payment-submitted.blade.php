@extends('emails.layouts.master', [
    'subject' => $subject ?? 'Payment Submitted for Verification',
    'headerCategory' => ($recipientType ?? 'customer') === 'customer' ? 'Payment Confirmation' : 'New Payment Notification',
    'headerDate' => now()->format('F j, Y')
])

@section('content')
@php
    $isCustomer = ($recipientType ?? 'customer') === 'customer';
    $customerName = $payment->customer->name ?? 'Valued Customer';
    $supplierName = $payment->supplier->name ?? 'Supplier';
    $booking = $payment->booking;
    $ref = $booking->booking_reference ?? ('#BK-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT));
    $paymentAmount = '₱' . number_format($payment->amount, 2);
    $paymentTypeFormatted = ucwords(str_replace('_', ' ', $payment->payment_type));
    $refNumber = $payment->reference_number;
    $submittedDate = $payment->created_at->format('F j, Y • g:i A');
@endphp

<!-- GREETING & SUMMARY HEADER CARD -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
    <tr>
        <td valign="top" style="padding-right: 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td valign="top" width="56" style="width: 56px; padding-right: 14px;">
                        <table role="presentation" width="52" height="52" cellpadding="0" cellspacing="0" border="0" style="background-color: #FDF9F3; border: 1.5px solid #F0E2CD; border-radius: 50%; text-align: center;">
                            <tr>
                                <td align="center" valign="middle" style="height: 52px; text-align: center; vertical-align: middle;">
                                    <span style="font-size: 24px;">💳</span>
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
                                Your payment of <strong style="color: #1E232F;">{{ $paymentAmount }}</strong> has been submitted and is currently <strong>Pending Verification</strong> by <strong>{{ $supplierName }}</strong>.
                            @else
                                Customer <strong style="color: #1E232F;">{{ $customerName }}</strong> has submitted a payment of <strong style="color: #1E232F;">{{ $paymentAmount }}</strong> via GCash for booking <strong>{{ $ref }}</strong>. Please review and verify the transaction.
                            @endif
                        </div>
                    </td>
                </tr>
            </table>
        </td>

        <td valign="top" align="right" width="200" style="width: 200px;" class="stack-column mobile-pt-15">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF8F5; border: 1px solid #EFEAE2; border-radius: 12px; padding: 14px 16px; text-align: left;">
                <tr>
                    <td>
                        <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase; letter-spacing: 0.5px;">
                            Booking Reference
                        </div>
                        <div style="font-size: 15px; font-weight: 800; color: #C09D62; margin-top: 2px; font-family: monospace;">
                            {{ $ref }}
                        </div>
                        <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 10px;">
                            Payment Status
                        </div>
                        <div style="margin-top: 4px;">
                            <span style="display: inline-block; background-color: #FEF3C7; color: #92400E; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #FDE68A;">
                                ⏳ Pending Verification
                            </span>
                        </div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

<!-- PAYMENT DETAILS TABLE -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFFFFF; border: 1px solid #EAE6DF; border-radius: 14px; margin-bottom: 24px; overflow: hidden;">
    <tr>
        <td style="padding: 18px 24px; background-color: #FBF9F6; border-bottom: 1px solid #EAE6DF;">
            <div style="font-size: 14px; font-weight: 800; color: #1E232F; text-transform: uppercase; letter-spacing: 1px;">
                Transaction Breakdown
            </div>
        </td>
    </tr>
    <tr>
        <td style="padding: 20px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td style="padding: 8px 0; font-size: 13.5px; color: #6D7588;">Payment Type:</td>
                    <td align="right" style="padding: 8px 0; font-size: 13.5px; font-weight: 700; color: #1E232F;">{{ $paymentTypeFormatted }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-size: 13.5px; color: #6D7588;">Payment Method:</td>
                    <td align="right" style="padding: 8px 0; font-size: 13.5px; font-weight: 700; color: #1E232F;">GCash</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-size: 13.5px; color: #6D7588;">GCash Reference Number:</td>
                    <td align="right" style="padding: 8px 0; font-size: 14px; font-weight: 800; color: #C09D62; font-family: monospace;">{{ $refNumber }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-size: 13.5px; color: #6D7588;">Submitted On:</td>
                    <td align="right" style="padding: 8px 0; font-size: 13.5px; font-weight: 600; color: #1E232F;">{{ $submittedDate }}</td>
                </tr>
                <tr>
                    <td style="padding: 14px 0 6px 0; border-top: 1px solid #EFEAE2; font-size: 15px; font-weight: 800; color: #1E232F;">Amount Submitted:</td>
                    <td align="right" style="padding: 14px 0 6px 0; border-top: 1px solid #EFEAE2; font-size: 18px; font-weight: 900; color: #4E6E58;">{{ $paymentAmount }}</td>
                </tr>
            </table>
        </td>
    </tr>
</table>

<!-- CALL TO ACTION -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 12px; margin-bottom: 20px; text-align: center;">
    <tr>
        <td align="center">
            <a href="{{ $actionUrl }}" class="btn-primary" style="background-color: #4E6E58; color: #FFFFFF; font-weight: 700; font-size: 14px; padding: 13px 32px; border-radius: 10px; text-decoration: none; display: inline-block;">
                {{ $isCustomer ? 'View Booking & Payments' : 'Review & Verify Payment' }}
            </a>
        </td>
    </tr>
</table>
@endsection
