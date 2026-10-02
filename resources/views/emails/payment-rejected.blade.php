@extends('emails.layouts.master', [
    'subject' => $subject ?? 'Payment Verification Update - Action Required',
    'headerCategory' => 'Payment Notice',
    'headerDate' => now()->format('F j, Y')
])

@section('content')
@php
    $customerName = $payment->customer->name ?? 'Valued Customer';
    $supplierName = $payment->supplier->name ?? 'Supplier';
    $booking = $payment->booking;
    $ref = $booking->booking_reference ?? ('#BK-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT));
    $paymentAmount = '₱' . number_format($payment->amount, 2);
    $paymentTypeFormatted = ucwords(str_replace('_', ' ', $payment->payment_type));
    $refNumber = $payment->reference_number;
    $rejectionReason = $payment->rejection_reason ?? 'Invalid reference number or unverified receipt image.';
@endphp

<!-- GREETING & ALERT HEADER CARD -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
    <tr>
        <td valign="top" style="padding-right: 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td valign="top" width="56" style="width: 56px; padding-right: 14px;">
                        <table role="presentation" width="52" height="52" cellpadding="0" cellspacing="0" border="0" style="background-color: #FEF2F2; border: 1.5px solid #FECACA; border-radius: 50%; text-align: center;">
                            <tr>
                                <td align="center" valign="middle" style="height: 52px; text-align: center; vertical-align: middle;">
                                    <span style="font-size: 24px;">⚠️</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                    <td valign="top">
                        <div style="font-size: 19px; font-weight: 800; color: #991B1B; line-height: 1.25; font-family: 'Plus Jakarta Sans', sans-serif;">
                            Payment Declined
                        </div>
                        <div style="font-size: 13.5px; color: #586071; line-height: 1.5; margin-top: 6px;">
                            Hello {{ $recipientName ?? 'there' }}, your payment submission for booking <strong>{{ $ref }}</strong> could not be verified by <strong>{{ $supplierName }}</strong>.
                        </div>
                    </td>
                </tr>
            </table>
        </td>

        <td valign="top" align="right" width="200" style="width: 200px;" class="stack-column mobile-pt-15">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 14px 16px; text-align: left;">
                <tr>
                    <td>
                        <div style="font-size: 11px; font-weight: 600; color: #991B1B; text-transform: uppercase; letter-spacing: 0.5px;">
                            Payment Status
                        </div>
                        <div style="font-size: 16px; font-weight: 800; color: #DC2626; margin-top: 2px;">
                            ✕ Rejected
                        </div>
                        <div style="font-size: 11px; font-weight: 600; color: #8F95A3; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 10px;">
                            Booking Reference
                        </div>
                        <div style="font-size: 14px; font-weight: 800; color: #C09D62; margin-top: 2px; font-family: monospace;">
                            {{ $ref }}
                        </div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

<!-- REJECTION REASON CALLOUT BOX -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF5F5; border-left: 4px solid #EF4444; border-top: 1px solid #FED7D7; border-right: 1px solid #FED7D7; border-bottom: 1px solid #FED7D7; border-radius: 8px; margin-bottom: 24px;">
    <tr>
        <td style="padding: 16px 20px;">
            <div style="font-size: 12px; font-weight: 800; color: #991B1B; text-transform: uppercase; letter-spacing: 0.5px;">
                Supplier Reason for Rejection:
            </div>
            <div style="font-size: 14px; color: #7F1D1D; font-weight: 600; margin-top: 6px; line-height: 1.5;">
                “{{ $rejectionReason }}”
            </div>
        </td>
    </tr>
</table>

<!-- REJECTED TRANSACTION DETAILS -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFFFFF; border: 1px solid #EAE6DF; border-radius: 14px; margin-bottom: 24px; overflow: hidden;">
    <tr>
        <td style="padding: 18px 24px; background-color: #FBF9F6; border-bottom: 1px solid #EAE6DF;">
            <div style="font-size: 14px; font-weight: 800; color: #1E232F; text-transform: uppercase; letter-spacing: 1px;">
                Submission Details
            </div>
        </td>
    </tr>
    <tr>
        <td style="padding: 20px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td style="padding: 8px 0; font-size: 13.5px; color: #6D7588;">Booking Reference:</td>
                    <td align="right" style="padding: 8px 0; font-size: 13.5px; font-weight: 700; color: #1E232F;">{{ $ref }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-size: 13.5px; color: #6D7588;">Payment Type:</td>
                    <td align="right" style="padding: 8px 0; font-size: 13.5px; font-weight: 700; color: #1E232F;">{{ $paymentTypeFormatted }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-size: 13.5px; color: #6D7588;">Submitted Amount:</td>
                    <td align="right" style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #1E232F;">{{ $paymentAmount }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-size: 13.5px; color: #6D7588;">Reference Number:</td>
                    <td align="right" style="padding: 8px 0; font-size: 14px; font-weight: 800; color: #C09D62; font-family: monospace;">{{ $refNumber }}</td>
                </tr>
            </table>
        </td>
    </tr>
</table>

<!-- NEXT STEPS INSTRUCTIONS -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF8F5; border: 1px solid #EFEAE2; border-radius: 12px; margin-bottom: 24px;">
    <tr>
        <td style="padding: 18px 22px;">
            <div style="font-size: 13px; font-weight: 800; color: #1E232F; margin-bottom: 8px;">
                How to Submit a Corrected Payment:
            </div>
            <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #586071; line-height: 1.6;">
                <li>Please double-check your GCash transaction history for the correct reference number.</li>
                <li>Make sure the uploaded receipt clearly shows the date, amount, and reference number.</li>
                <li>Click the button below to submit a corrected payment with the verified receipt details.</li>
            </ol>
        </td>
    </tr>
</table>

<!-- CALL TO ACTION -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 12px; margin-bottom: 20px; text-align: center;">
    <tr>
        <td align="center">
            <a href="{{ $actionUrl }}" class="btn-primary" style="background-color: #C09D62; color: #FFFFFF; font-weight: 700; font-size: 14px; padding: 13px 32px; border-radius: 10px; text-decoration: none; display: inline-block;">
                Submit Corrected Payment
            </a>
        </td>
    </tr>
</table>
@endsection
