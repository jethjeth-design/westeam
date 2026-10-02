import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ReviewModal from '@/Components/ReviewModal';
import RatingStars from '@/Components/RatingStars';
import GCashPaymentModal from '@/Components/GCashPaymentModal';

export default function Show({ booking }) {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedReviewItem, setSelectedReviewItem] = useState(null);

    // Payment Modal State
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedItemForPayment, setSelectedItemForPayment] = useState(null);
    const [selectedSupplierForPayment, setSelectedSupplierForPayment] = useState(null);
    const [selectedPaymentSetting, setSelectedPaymentSetting] = useState(null);
    const [existingPaymentRecord, setExistingPaymentRecord] = useState(null);

    const handleOpenPaymentModal = (item = null) => {
        setSelectedItemForPayment(item);

        let targetSupplier = null;
        let setting = null;
        let prevPayment = null;

        if (booking.booking_type === 'team_package') {
            targetSupplier = booking.team?.coordinator;
            setting = targetSupplier?.payment_setting || targetSupplier?.paymentSetting;
            prevPayment = booking.payments?.find(
                (p) => p.supplier_id === targetSupplier?.id
            );
        } else if (item) {
            targetSupplier = item.supplier;
            setting = targetSupplier?.payment_setting || targetSupplier?.paymentSetting;
            prevPayment =
                item.payments?.[0] ||
                booking.payments?.find(
                    (p) => p.booking_item_id === item.id || p.supplier_id === targetSupplier?.id
                );
        } else {
            const firstItem = booking.items?.[0];
            targetSupplier = firstItem?.supplier;
            setting = targetSupplier?.payment_setting || targetSupplier?.paymentSetting;
            prevPayment = booking.payments?.[0];
        }

        setSelectedSupplierForPayment(targetSupplier);
        setSelectedPaymentSetting(setting);
        setExistingPaymentRecord(prevPayment);
        setPaymentModalOpen(true);
    };

    const handleOpenReview = (item) => {
        setSelectedReviewItem(item);
        setReviewModalOpen(true);
    };

    const handleCancel = () => {
        setCancelling(true);
        router.post(
            route('customer.bookings.cancel', booking.id),
            {},
            {
                onFinish: () => {
                    setCancelling(false);
                    setShowCancelModal(false);
                },
            }
        );
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 ring-1 ring-inset ring-emerald-600/30">
                        <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                        ✓ Confirmed
                    </span>
                );
            case 'accepted':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700 ring-1 ring-inset ring-blue-600/20">
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                        Accepted
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
                        Pending Review
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-extrabold text-red-700 ring-1 ring-inset ring-red-600/20">
                        <span className="h-2 w-2 rounded-full bg-red-600" />
                        Declined
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-champagne px-3 py-1 text-xs font-extrabold text-darkgold ring-1 ring-inset ring-champagnegold/20">
                        <span className="h-2 w-2 rounded-full bg-champagnegold" />
                        Completed
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-champagne px-3 py-1 text-xs font-extrabold text-softcharcoal ring-1 ring-inset ring-warmgray/20">
                        <span className="h-2 w-2 rounded-full bg-warmgray" />
                        Cancelled
                    </span>
                );
            default:
                return null;
        }
    };

    const getPaymentBadge = (paymentStatus) => {
        switch (paymentStatus) {
            case 'Fully Paid':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-600/20">
                        ✓ Fully Paid
                    </span>
                );
            case 'Partially Paid':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800 ring-1 ring-emerald-600/30">
                        ✓ Downpayment Verified
                    </span>
                );
            case 'Pending Verification':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-600/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                        Pending Verification
                    </span>
                );
            case 'Payment Rejected':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700 ring-1 ring-red-600/20">
                        ⚠️ Payment Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-warmbeige/50 px-3 py-1 text-xs font-bold text-warmgray ring-1 ring-warmgray/20">
                        Unpaid
                    </span>
                );
        }
    };

    const isAccepted = ['accepted', 'confirmed'].includes(booking.overall_status) ||
        booking.items?.some((i) => ['accepted', 'confirmed'].includes(i.status));

    const rejectedPayment = booking.payments?.find((p) => p.status === 'rejected');

    return (
        <DashboardLayout>
            <Head title={`Booking ${booking.booking_reference} - ${booking.event_name}`} />

            <div className="min-h-screen bg-ivory/60 p-4 sm:p-6 lg:p-10">
                {/* Header & Back Link */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-warmgray">
                            <Link
                                href={route('customer.bookings.index')}
                                className="transition hover:text-champagnegold font-semibold"
                            >
                                ← Back to My Bookings
                            </Link>
                            <span>/</span>
                            <span className="font-mono font-bold text-softcharcoal">
                                {booking.booking_reference}
                            </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-softcharcoal">
                                {booking.event_name}
                            </h1>
                            {getStatusBadge(booking.overall_status)}
                            {getPaymentBadge(booking.payment_status)}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {isAccepted && booking.payment_status !== 'Fully Paid' && booking.payment_status !== 'Pending Verification' && (
                            <button
                                type="button"
                                onClick={() => handleOpenPaymentModal()}
                                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white shadow-md hover:bg-blue-500 transition active:scale-95"
                            >
                                💳 Pay Downpayment
                            </button>
                        )}

                        {['pending', 'accepted'].includes(booking.overall_status) && (
                            <button
                                type="button"
                                onClick={() => setShowCancelModal(true)}
                                className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 shadow-xs hover:bg-red-50 transition"
                            >
                                Cancel Booking
                            </button>
                        )}

                        <Link
                            href={route('messages.index')}
                            className="rounded-xl bg-champagnegold px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-darkgold transition"
                        >
                            💬 Contact Suppliers
                        </Link>
                    </div>
                </div>

                {/* ── Status Notices ── */}
                {booking.overall_status === 'pending' && (
                    <div className="mt-6 flex items-center gap-2.5 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs text-amber-800">
                        <span className="text-lg">⏳</span>
                        <div>
                            <span className="font-bold">Awaiting Supplier Confirmation:</span>{' '}
                            <span>The supplier is reviewing your booking request. Once accepted, you will receive instructions and the GCash QR code here to secure your booking with a downpayment.</span>
                        </div>
                    </div>
                )}

                {rejectedPayment && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-900 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                                <span className="text-xl">⚠️</span>
                                <div>
                                    <h4 className="font-black text-red-800">
                                        Previous Payment Declined by Supplier
                                    </h4>
                                    <p className="mt-0.5 text-red-700 italic">
                                        "{rejectedPayment.rejection_reason || 'Please provide a valid reference number and clear screenshot receipt.'}"
                                    </p>
                                    <p className="mt-1 text-[11px] text-red-600">
                                        You can submit another payment proof below.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleOpenPaymentModal()}
                                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition shrink-0"
                            >
                                Resubmit Payment Now →
                            </button>
                        </div>
                    </div>
                )}

                {booking.payment_status === 'Pending Verification' && (
                    <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-950">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-200 text-amber-900 font-bold">
                                ⌛
                            </span>
                            <div>
                                <h4 className="font-black">Downpayment Submitted (Pending Verification)</h4>
                                <p className="text-[11px] text-amber-800">
                                    Your GCash receipt has been uploaded and is waiting for supplier verification. Booking will become Confirmed once approved.
                                </p>
                            </div>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 font-mono text-[10px] font-bold text-amber-900 border border-amber-200">
                            Verification Pending
                        </span>
                    </div>
                )}

                {['Partially Paid', 'Fully Paid'].includes(booking.payment_status) && (
                    <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-950">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
                                ✓
                            </span>
                            <div>
                                <h4 className="font-black text-emerald-900">Booking Confirmed & Downpayment Verified</h4>
                                <p className="text-[11px] text-emerald-800">
                                    Verified Amount: ₱{Number(booking.verified_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })} • Remaining Balance: ₱{Number(booking.remaining_balance).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 font-bold text-emerald-800 text-[11px]">
                            {booking.payment_status}
                        </span>
                    </div>
                )}

                <div className="mt-8 grid gap-8 lg:grid-cols-3">
                    {/* Left 2 Cols: Services & Vendor Responses */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Booked Services Card */}
                        <div className="overflow-hidden rounded-3xl border border-warmbeige/80 bg-white p-6 shadow-xs sm:p-8">
                            <h2 className="text-lg font-bold text-softcharcoal">
                                Reserved Services & Suppliers ({booking.items?.length || 0})
                            </h2>
                            <p className="mt-1 text-xs text-warmgray">
                                Real-time status, supplier downpayment QR access, and verified receipts.
                            </p>

                            <div className="mt-6 space-y-4">
                                {booking.items?.map((item) => {
                                    const itemAccepted = ['accepted', 'confirmed'].includes(item.status);
                                    const itemSupplier = item.supplier;
                                    const itemSetting = itemSupplier?.payment_setting || itemSupplier?.paymentSetting;
                                    const itemDownpaymentPct = itemSetting?.downpayment_percentage || 20;
                                    const itemDownpayment = Math.round(Number(item.unit_price) * (itemDownpaymentPct / 100));
                                    const itemPayment = item.payments?.[0];

                                    return (
                                        <div
                                            key={item.id}
                                            className="overflow-hidden rounded-2xl border border-warmbeige/80 bg-ivory/50 p-5 transition hover:border-indigo-200"
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base font-extrabold text-softcharcoal">
                                                            {item.item_name}
                                                        </span>
                                                        <span className="rounded-md bg-warmbeige/60 px-2 py-0.5 text-[10px] font-bold uppercase text-softcharcoal">
                                                            {item.item_type}
                                                        </span>
                                                    </div>
                                                    <p className="mt-0.5 text-xs text-warmgray">
                                                        Supplier:{' '}
                                                        <strong className="text-softcharcoal">
                                                            {itemSupplier?.supplier_profile?.business_name ||
                                                                itemSupplier?.name}
                                                        </strong>
                                                    </p>
                                                </div>

                                                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                                                    <span className="text-base font-black text-softcharcoal">
                                                        ₱{Number(item.unit_price).toLocaleString('en-PH', {
                                                            minimumFractionDigits: 2,
                                                        })}
                                                    </span>
                                                    {getStatusBadge(item.status)}
                                                </div>
                                            </div>

                                            {/* Item Downpayment Action Row */}
                                            {itemAccepted && booking.booking_type !== 'team_package' && (
                                                <div className="mt-4 pt-3.5 border-t border-warmbeige/70 flex flex-wrap items-center justify-between gap-2">
                                                    <div className="text-xs text-warmgray">
                                                        <span>Required Downpayment ({itemDownpaymentPct}%): </span>
                                                        <strong className="text-softcharcoal font-bold">
                                                            ₱{itemDownpayment.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                        </strong>
                                                        {item.verified_amount > 0 && (
                                                            <span className="ml-2 text-emerald-700 font-bold">
                                                                (Paid: ₱{Number(item.verified_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })})
                                                            </span>
                                                        )}
                                                    </div>

                                                    {item.verified_amount > 0 ? (
                                                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                                                            ✓ Downpayment Verified
                                                        </span>
                                                    ) : itemPayment?.status === 'pending' ? (
                                                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 ring-1 ring-amber-600/20">
                                                            ⏳ Pending Verification
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenPaymentModal(item)}
                                                            className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
                                                        >
                                                            <span>💳 Pay Downpayment</span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Review Section for Completed Items */}
                                            {(item.status === 'completed' || booking.overall_status === 'completed') && (
                                                <div className="mt-4 border-t border-warmbeige/80 pt-3.5">
                                                    {item.review ? (
                                                        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                                                        ✓ Reviewed by You
                                                                    </span>
                                                                    <RatingStars rating={item.review.rating} size="xs" showScore={true} />
                                                                </div>
                                                                <span className="text-[11px] text-warmgray">
                                                                    {new Date(item.review.created_at).toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric',
                                                                    })}
                                                                </span>
                                                            </div>
                                                            <p className="mt-2 text-xs italic text-softcharcoal whitespace-pre-line">
                                                                "{item.review.comment}"
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-champagne bg-gradient-to-r from-indigo-50/80 to-purple-50/40 p-4">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-base">🎉</span>
                                                                    <h4 className="text-xs font-extrabold text-softcharcoal">
                                                                        Service completed! How was your experience?
                                                                    </h4>
                                                                </div>
                                                                <p className="mt-0.5 text-[11px] text-warmgray">
                                                                    Leave a 1–5 star rating and written review to help other planners.
                                                                </p>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenReview(item)}
                                                                className="inline-flex items-center gap-1.5 rounded-xl bg-champagnegold px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-darkgold active:scale-95 shrink-0"
                                                            >
                                                                <span>⭐</span>
                                                                <span>Write Review</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Rejection Reason Notice */}
                                            {item.status === 'rejected' && item.rejection_reason && (
                                                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                                                    <p className="font-bold">Supplier Decline Reason:</p>
                                                    <p className="mt-0.5 text-red-700 italic">
                                                        "{item.rejection_reason}"
                                                    </p>
                                                </div>
                                            )}

                                            {/* Responded timestamp */}
                                            {item.responded_at && (
                                                <p className="mt-3 text-[11px] text-warmgray">
                                                    Responded on {new Date(item.responded_at).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Payment Transactions & Receipts History */}
                        {booking.payments && booking.payments.length > 0 && (
                            <div className="overflow-hidden rounded-3xl border border-warmbeige/80 bg-white p-6 shadow-xs sm:p-8">
                                <h3 className="text-base font-bold text-softcharcoal">
                                    Submitted Payments & GCash Proof ({booking.payments.length})
                                </h3>

                                <div className="mt-4 divide-y divide-warmbeige/50">
                                    {booking.payments.map((p) => (
                                        <div key={p.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                            <div className="flex items-center gap-3">
                                                {p.receipt_url ? (
                                                    <a href={p.receipt_url} target="_blank" rel="noopener noreferrer">
                                                        <img
                                                            src={p.receipt_url}
                                                            alt="Receipt"
                                                            className="h-12 w-12 rounded-xl object-cover ring-1 ring-warmbeige hover:opacity-80 transition"
                                                        />
                                                    </a>
                                                ) : (
                                                    <div className="h-12 w-12 rounded-xl bg-ivory flex items-center justify-center text-xl">
                                                        🧾
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-softcharcoal">
                                                            Ref: {p.reference_number}
                                                        </span>
                                                        <span className="rounded-md bg-warmbeige/50 px-2 py-0.5 text-[10px] font-bold uppercase text-softcharcoal">
                                                            {p.payment_type}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-warmgray mt-0.5">
                                                        {new Date(p.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end gap-3">
                                                <span className="font-black text-softcharcoal text-sm">
                                                    ₱{Number(p.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </span>
                                                <span
                                                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                                        p.status === 'verified'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : p.status === 'rejected'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                    }`}
                                                >
                                                    {p.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Special Requests */}
                        {booking.special_requests && (
                            <div className="rounded-3xl border border-warmbeige/80 bg-white p-6 shadow-xs sm:p-8">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-softcharcoal">
                                    Special Notes & Event Instructions
                                </h3>
                                <p className="mt-2 whitespace-pre-line text-sm text-softcharcoal">
                                    {booking.special_requests}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Col: Event Details & Financial Summary */}
                    <div className="space-y-6">
                        {/* Event Details Card */}
                        <div className="rounded-3xl border border-warmbeige/80 bg-white p-6 shadow-xs">
                            <h3 className="text-base font-bold text-softcharcoal">
                                Event Details
                            </h3>

                            <div className="mt-5 space-y-4 text-xs">
                                <div>
                                    <span className="text-warmgray">Event Date:</span>
                                    <p className="mt-0.5 font-bold text-softcharcoal text-sm">
                                        📅{' '}
                                        {new Date(booking.event_date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>

                                {booking.event_time && (
                                    <div>
                                        <span className="text-warmgray">Event Time:</span>
                                        <p className="mt-0.5 font-bold text-softcharcoal">
                                            ⏰ {booking.event_time}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <span className="text-warmgray">Venue / Location:</span>
                                    <p className="mt-0.5 font-bold text-softcharcoal">
                                        📍 {booking.event_location}
                                    </p>
                                </div>

                                {booking.guest_count && (
                                    <div>
                                        <span className="text-warmgray">Estimated Guest Count:</span>
                                        <p className="mt-0.5 font-bold text-softcharcoal">
                                            👥 {booking.guest_count} Attendees
                                        </p>
                                    </div>
                                )}

                                {booking.team && (
                                    <div className="rounded-2xl border border-champagne bg-champagne/50 p-3.5">
                                        <p className="font-bold text-indigo-950">Team Package Booking</p>
                                        <p className="text-[11px] text-darkgold">
                                            Team: {booking.team.name}
                                        </p>
                                        {booking.team.coordinator && (
                                            <p className="mt-1 text-[11px] text-champagnegold">
                                                Coordinator: {booking.team.coordinator.name}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="rounded-3xl border border-warmbeige/80 bg-white p-6 shadow-xs">
                            <h3 className="text-base font-bold text-softcharcoal">
                                Financial Summary
                            </h3>

                            <div className="mt-4 space-y-2.5 text-xs">
                                <div className="flex justify-between text-softcharcoal">
                                    <span>Total Contract Price:</span>
                                    <span className="font-bold text-softcharcoal">
                                        ₱{Number(booking.total_amount).toLocaleString('en-PH', {
                                            minimumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>

                                <div className="flex justify-between text-emerald-700">
                                    <span>Amount Verified (Paid):</span>
                                    <span className="font-black">
                                        ₱{Number(booking.verified_amount).toLocaleString('en-PH', {
                                            minimumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>

                                <div className="flex justify-between text-softcharcoal">
                                    <span>Remaining Balance:</span>
                                    <span className="font-black text-amber-700">
                                        ₱{Number(booking.remaining_balance).toLocaleString('en-PH', {
                                            minimumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>

                                <div className="flex justify-between border-t border-champagne pt-3 text-sm font-black text-softcharcoal">
                                    <span>Payment Status:</span>
                                    <span>{getPaymentBadge(booking.payment_status)}</span>
                                </div>

                                {isAccepted && booking.payment_status !== 'Fully Paid' && booking.payment_status !== 'Pending Verification' && (
                                    <button
                                        type="button"
                                        onClick={() => handleOpenPaymentModal()}
                                        className="mt-3 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-black text-white shadow-sm hover:bg-blue-700 transition"
                                    >
                                        💳 Pay GCash Downpayment
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-softcharcoal/60 p-4 backdrop-blur-sm"
                    onClick={() => setShowCancelModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-2xl text-red-600">
                            ⚠️
                        </div>
                        <h3 className="mt-4 text-lg font-black text-softcharcoal">
                            Cancel this booking?
                        </h3>
                        <p className="mt-2 text-xs text-warmgray">
                            Are you sure you want to cancel booking{' '}
                            <strong>{booking.booking_reference}</strong>? The suppliers will be notified immediately.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowCancelModal(false)}
                                className="rounded-xl border border-warmbeige px-4 py-2 text-xs font-bold text-softcharcoal hover:bg-ivory"
                            >
                                Nevermind
                            </button>
                            <button
                                type="button"
                                disabled={cancelling}
                                onClick={handleCancel}
                                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {cancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {selectedReviewItem && (
                <ReviewModal
                    isOpen={reviewModalOpen}
                    onClose={() => {
                        setReviewModalOpen(false);
                        setSelectedReviewItem(null);
                    }}
                    bookingItem={selectedReviewItem}
                    booking={booking}
                />
            )}

            {/* GCash Payment Modal */}
            <GCashPaymentModal
                isOpen={paymentModalOpen}
                onClose={() => {
                    setPaymentModalOpen(false);
                    setSelectedItemForPayment(null);
                    setSelectedSupplierForPayment(null);
                    setSelectedPaymentSetting(null);
                    setExistingPaymentRecord(null);
                }}
                booking={booking}
                selectedItem={selectedItemForPayment}
                supplier={selectedSupplierForPayment}
                paymentSetting={selectedPaymentSetting}
                existingPayment={existingPaymentRecord}
            />
        </DashboardLayout>
    );
}
