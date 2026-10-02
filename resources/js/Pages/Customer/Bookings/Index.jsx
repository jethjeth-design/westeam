import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import GCashPaymentModal from '@/Components/GCashPaymentModal';

export default function Index({ bookings, upcomingBooking }) {
    const [statusFilter, setStatusFilter] = useState('all');

    // Payment Modal State
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
    const [selectedItemForPayment, setSelectedItemForPayment] = useState(null);
    const [selectedSupplierForPayment, setSelectedSupplierForPayment] = useState(null);
    const [selectedPaymentSetting, setSelectedPaymentSetting] = useState(null);
    const [existingPaymentRecord, setExistingPaymentRecord] = useState(null);

    const bookingList = bookings?.data || [];

    const filteredBookings = bookingList.filter((b) => {
        if (statusFilter === 'all') return true;
        return b.overall_status === statusFilter;
    });

    const handleOpenPaymentModal = (booking, item = null) => {
        setSelectedBookingForPayment(booking);
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
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        Accepted (Awaiting Downpayment)
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                        Pending Review
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-extrabold text-red-700 ring-1 ring-inset ring-red-600/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                        Declined
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-champagne px-3 py-1 text-xs font-extrabold text-darkgold ring-1 ring-inset ring-champagnegold/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-champagnegold" />
                        Completed
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-champagne px-3 py-1 text-xs font-extrabold text-softcharcoal ring-1 ring-inset ring-warmgray/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-warmgray" />
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
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-black text-emerald-700 ring-1 ring-emerald-600/20">
                        ✓ Fully Paid
                    </span>
                );
            case 'Partially Paid':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 ring-1 ring-emerald-600/30">
                        ✓ Downpayment Verified
                    </span>
                );
            case 'Pending Verification':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-black text-amber-700 ring-1 ring-amber-600/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                        Pending Verification
                    </span>
                );
            case 'Payment Rejected':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-black text-red-700 ring-1 ring-red-600/20">
                        ⚠️ Payment Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-warmbeige/50 px-2.5 py-0.5 text-[11px] font-bold text-warmgray ring-1 ring-warmgray/20">
                        Unpaid
                    </span>
                );
        }
    };

    const getBookingTypeLabel = (type) => {
        switch (type) {
            case 'team_package':
                return '👥 Team Package';
            case 'supplier_package':
                return '📦 Supplier Package';
            case 'multi_supplier':
                return '🤖 Multi-Supplier AI';
            default:
                return '🛠️ Single Service';
        }
    };

    return (
        <DashboardLayout>
            <Head title="My Bookings & Events - Westeam" />

            <div className="min-h-screen bg-ivory/60 p-4 sm:p-6 lg:p-10">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-md bg-champagne px-2.5 py-0.5 text-xs font-bold text-darkgold">
                                📅 Event Reservations & Payments
                            </span>
                        </div>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-softcharcoal">
                            My Bookings
                        </h1>
                        <p className="mt-1 text-sm text-warmgray">
                            Track vendor booking confirmations, pay required GCash downpayments directly, and verify balances.
                        </p>
                    </div>

                    <Link
                        href={route('customer.suppliers.index')}
                        className="inline-flex items-center gap-2 rounded-xl bg-champagnegold px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-darkgold active:scale-95"
                    >
                        <span>+ Book More Suppliers</span>
                    </Link>
                </div>

                {/* Featured Upcoming Event Details Highlight */}
                {upcomingBooking && (
                    <div className="mt-8 overflow-hidden rounded-3xl border border-champagne bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-6 text-white shadow-xl lg:p-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold backdrop-blur-md">
                                        ⭐ Upcoming Highlight Event
                                    </span>
                                    {getStatusBadge(upcomingBooking.overall_status)}
                                    {getPaymentBadge(upcomingBooking.payment_status)}
                                </div>
                                <h2 className="text-2xl font-black sm:text-3xl">
                                    {upcomingBooking.event_name}
                                </h2>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-indigo-200">
                                    <div className="flex items-center gap-1.5">
                                        <span>📅</span>
                                        <span className="font-semibold text-white">
                                            {new Date(upcomingBooking.event_date).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span>📍</span>
                                        <span className="font-semibold text-white">{upcomingBooking.event_location}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span>👥</span>
                                        <span className="font-semibold text-white">
                                            {upcomingBooking.items?.length || 0} Supplier Service(s)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                                <div className="text-left lg:text-right">
                                    <p className="text-xs text-indigo-300">Total Investment</p>
                                    <p className="text-2xl font-black text-white">
                                        ₱{Number(upcomingBooking.total_amount).toLocaleString('en-PH', {
                                            minimumFractionDigits: 2,
                                        })}
                                    </p>
                                    {upcomingBooking.verified_amount > 0 && (
                                        <p className="text-xs text-emerald-300 font-semibold mt-0.5">
                                            Paid: ₱{Number(upcomingBooking.verified_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })} • Bal: ₱{Number(upcomingBooking.remaining_balance).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {['accepted', 'confirmed'].includes(upcomingBooking.overall_status) &&
                                        upcomingBooking.payment_status !== 'Fully Paid' &&
                                        upcomingBooking.payment_status !== 'Pending Verification' && (
                                            <button
                                                type="button"
                                                onClick={() => handleOpenPaymentModal(upcomingBooking)}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-md hover:bg-blue-500 transition active:scale-95"
                                            >
                                                <span>💳 Pay Downpayment</span>
                                            </button>
                                        )}

                                    <Link
                                        href={route('customer.bookings.show', upcomingBooking.id)}
                                        className="rounded-xl bg-white px-5 py-2.5 text-xs font-extrabold text-indigo-900 shadow-md transition hover:bg-champagne active:scale-95"
                                    >
                                        View Details →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Filter Tabs */}
                <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-warmbeige/80 pb-4">
                    {['all', 'pending', 'accepted', 'confirmed', 'completed', 'rejected', 'cancelled'].map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setStatusFilter(tab)}
                            className={`rounded-xl px-4 py-2 text-xs font-bold capitalize transition ${
                                statusFilter === tab
                                    ? 'bg-champagnegold text-white shadow-xs'
                                    : 'bg-white text-softcharcoal hover:bg-champagne hover:text-softcharcoal'
                            }`}
                        >
                            {tab === 'all' ? 'All Bookings' : tab}
                        </button>
                    ))}
                </div>

                {/* Bookings List */}
                <div className="mt-6 space-y-6">
                    {filteredBookings.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-warmbeige bg-white p-12 text-center shadow-xs">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-champagne text-2xl">
                                📅
                            </div>
                            <h3 className="mt-4 text-base font-bold text-softcharcoal">No bookings found</h3>
                            <p className="mt-1 text-xs text-warmgray">
                                {statusFilter === 'all'
                                    ? "You haven't requested any supplier bookings yet."
                                    : `No bookings currently under '${statusFilter}' status.`}
                            </p>
                            <Link
                                href={route('customer.suppliers.index')}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-champagnegold px-5 py-2.5 text-xs font-bold text-white transition hover:bg-darkgold"
                            >
                                Explore Verified Suppliers
                            </Link>
                        </div>
                    ) : (
                        filteredBookings.map((booking) => {
                            const isTeamPackage = booking.booking_type === 'team_package';
                            const isMultiSupplier = booking.booking_type === 'multi_supplier' || (booking.items && booking.items.length > 1 && !isTeamPackage);
                            const hasAcceptedItems = booking.items?.some((i) => ['accepted', 'confirmed'].includes(i.status));
                            const isAccepted = ['accepted', 'confirmed'].includes(booking.overall_status) || hasAcceptedItems;

                            // Latest rejected payment if any
                            const rejectedPayment = booking.payments?.find((p) => p.status === 'rejected');

                            return (
                                <div
                                    key={booking.id}
                                    className="group overflow-hidden rounded-3xl border border-warmbeige/80 bg-white p-6 shadow-xs transition hover:border-indigo-200 hover:shadow-md"
                                >
                                    {/* Top Row: Meta, Status, and Action */}
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="space-y-1.5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-mono text-xs font-bold text-champagnegold">
                                                    {booking.booking_reference}
                                                </span>
                                                <span className="text-warmbeige">•</span>
                                                <span className="text-xs font-semibold text-warmgray">
                                                    {getBookingTypeLabel(booking.booking_type)}
                                                </span>
                                                {getStatusBadge(booking.overall_status)}
                                                {getPaymentBadge(booking.payment_status)}
                                            </div>

                                            <h3 className="text-lg font-black text-softcharcoal">
                                                {booking.event_name}
                                            </h3>

                                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-warmgray">
                                                <div className="flex items-center gap-1">
                                                    <span>📅</span>
                                                    <span>
                                                        {new Date(booking.event_date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span>📍</span>
                                                    <span>{booking.event_location}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span>👥</span>
                                                    <span>{booking.items?.length || 0} Service(s)</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price & Action */}
                                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 border-t border-champagne pt-3 sm:border-none sm:pt-0">
                                            <div>
                                                <p className="text-[11px] text-warmgray sm:text-right">Total Price</p>
                                                <p className="text-lg font-black text-softcharcoal">
                                                    ₱{Number(booking.total_amount).toLocaleString('en-PH', {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </p>
                                                {booking.verified_amount > 0 && (
                                                    <p className="text-[11px] text-emerald-700 font-bold sm:text-right">
                                                        Paid: ₱{Number(booking.verified_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                    </p>
                                                )}
                                                {booking.remaining_balance > 0 && booking.verified_amount > 0 && (
                                                    <p className="text-[10px] text-warmgray sm:text-right">
                                                        Bal: ₱{Number(booking.remaining_balance).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Single or Team Package Main Pay Downpayment button */}
                                                {!isMultiSupplier && isAccepted && booking.payment_status !== 'Fully Paid' && booking.payment_status !== 'Pending Verification' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenPaymentModal(booking)}
                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-black text-white shadow-xs hover:bg-blue-700 transition active:scale-95"
                                                    >
                                                        <span>💳 Pay Downpayment</span>
                                                    </button>
                                                )}

                                                <Link
                                                    href={route('customer.bookings.show', booking.id)}
                                                    className="rounded-xl border border-warmbeige bg-ivory px-4 py-2 text-xs font-bold text-softcharcoal transition hover:bg-champagne hover:text-champagnegold"
                                                >
                                                    View Details →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── GCASH DOWNPAYMENT NOTIFICATION BANNER ── */}
                                    {/* A. If Booking is still Pending */}
                                    {booking.overall_status === 'pending' && !hasAcceptedItems && (
                                        <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-3 text-xs text-amber-800">
                                            <span className="text-base">⏳</span>
                                            <div>
                                                <span className="font-bold">Awaiting Supplier Acceptance:</span>{' '}
                                                <span>The supplier's GCash QR code and downpayment option will appear here once the supplier accepts your reservation.</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* B. If Payment Rejected Alert */}
                                    {rejectedPayment && (
                                        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-900 space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-start gap-2">
                                                    <span className="text-lg">⚠️</span>
                                                    <div>
                                                        <p className="font-black text-red-800">
                                                            Downpayment Proof Declined by Supplier
                                                        </p>
                                                        <p className="mt-0.5 text-red-700 italic">
                                                            "{rejectedPayment.rejection_reason || 'Please provide a valid reference number and clear screenshot receipt.'}"
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenPaymentModal(booking)}
                                                    className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition shrink-0"
                                                >
                                                    Resubmit Payment →
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* C. If Payment Submitted & Pending Verification */}
                                    {booking.payment_status === 'Pending Verification' && (
                                        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900">
                                            <div className="flex items-center gap-2.5">
                                                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-200/80 text-amber-900 font-bold">
                                                    ⌛
                                                </span>
                                                <div>
                                                    <p className="font-black text-amber-950">
                                                        Downpayment Submitted (Pending Verification)
                                                    </p>
                                                    <p className="text-[11px] text-amber-800">
                                                        The supplier has been notified and is verifying your GCash payment proof.
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="rounded-lg bg-white px-2.5 py-1 font-mono text-[10px] font-bold text-amber-900 border border-amber-200">
                                                Receipt Uploaded
                                            </span>
                                        </div>
                                    )}

                                    {/* D. If Payment Verified / Confirmed */}
                                    {(booking.payment_status === 'Partially Paid' || booking.payment_status === 'Fully Paid') && (
                                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-950">
                                            <div className="flex items-center gap-2.5">
                                                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-xs">
                                                    ✓
                                                </span>
                                                <div>
                                                    <p className="font-black text-emerald-900">
                                                        Booking Confirmed & Downpayment Verified
                                                    </p>
                                                    <p className="text-[11px] text-emerald-800">
                                                        Amount Paid: <strong className="font-bold">₱{Number(booking.verified_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>
                                                        {booking.remaining_balance > 0 && (
                                                            <> • Remaining Balance: <strong className="font-bold">₱{Number(booking.remaining_balance).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong></>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="rounded-full bg-emerald-100 px-3 py-1 font-bold text-emerald-800 text-[11px]">
                                                {booking.payment_status}
                                            </span>
                                        </div>
                                    )}

                                    {/* ── Multi-Supplier / Items Breakdown ── */}
                                    {booking.items && booking.items.length > 0 && (
                                        <div className="mt-4 border-t border-warmbeige/70 pt-4 space-y-3">
                                            <div className="flex items-center justify-between text-xs font-bold text-warmgray">
                                                <span>
                                                    {isTeamPackage
                                                        ? `Team Package Services (${booking.items.length})`
                                                        : isMultiSupplier
                                                        ? `Multiple Suppliers & Services (${booking.items.length})`
                                                        : 'Booked Service'}
                                                </span>
                                                {isTeamPackage && booking.team?.coordinator && (
                                                    <span className="text-[11px] text-champagnegold">
                                                        Team Coordinator: <strong>{booking.team.coordinator.name}</strong>
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid gap-2.5 sm:grid-cols-2">
                                                {booking.items.map((item) => {
                                                    const itemAccepted = ['accepted', 'confirmed'].includes(item.status);
                                                    const itemSupplier = item.supplier;
                                                    const itemSetting = itemSupplier?.payment_setting || itemSupplier?.paymentSetting;
                                                    const itemDownpaymentPct = itemSetting?.downpayment_percentage || 20;
                                                    const itemDownpayment = Math.round(Number(item.unit_price) * (itemDownpaymentPct / 100));

                                                    // Item payment status
                                                    const itemPayment = item.payments?.[0];
                                                    const isItemPaid = item.verified_amount > 0 || itemPayment?.status === 'verified';
                                                    const isItemPending = itemPayment?.status === 'pending';
                                                    const isItemRejected = itemPayment?.status === 'rejected';

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            className="flex flex-col justify-between rounded-2xl border border-warmbeige/70 bg-ivory/40 p-3.5 text-xs transition hover:border-blue-200"
                                                        >
                                                            <div className="space-y-1">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="min-w-0">
                                                                        <h4 className="font-black text-softcharcoal truncate">
                                                                            {item.item_name}
                                                                        </h4>
                                                                        <p className="text-[11px] text-warmgray">
                                                                            Supplier: <strong className="text-softcharcoal">{itemSupplier?.supplier_profile?.business_name || itemSupplier?.name || 'Vendor'}</strong>
                                                                        </p>
                                                                    </div>
                                                                    <span className="font-black text-softcharcoal shrink-0">
                                                                        ₱{Number(item.unit_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                                    </span>
                                                                </div>

                                                                {/* Item Acceptance Status */}
                                                                <div className="flex items-center gap-1.5 pt-1">
                                                                    <span
                                                                        className={`h-2 w-2 rounded-full ${
                                                                            item.status === 'confirmed'
                                                                                ? 'bg-emerald-600'
                                                                                : item.status === 'accepted'
                                                                                ? 'bg-blue-600'
                                                                                : item.status === 'rejected'
                                                                                ? 'bg-red-500'
                                                                                : 'bg-amber-500'
                                                                        }`}
                                                                    />
                                                                    <span className="text-[11px] font-semibold text-softcharcoal capitalize">
                                                                        {item.status === 'confirmed' ? 'Confirmed' : item.status === 'accepted' ? 'Accepted' : item.status}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Multi-Supplier Downpayment Button per Item */}
                                                            {isMultiSupplier && (
                                                                <div className="mt-3 pt-2 border-t border-warmbeige/50 flex items-center justify-between">
                                                                    {itemAccepted ? (
                                                                        isItemPaid ? (
                                                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                                                                ✓ Downpayment Verified (₱{Number(item.verified_amount).toLocaleString('en-PH')})
                                                                            </span>
                                                                        ) : isItemPending ? (
                                                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                                                                                ⏳ Pending Verification
                                                                            </span>
                                                                        ) : isItemRejected ? (
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-[10px] text-red-600 font-bold">Declined</span>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleOpenPaymentModal(booking, item)}
                                                                                    className="rounded-lg bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-red-700"
                                                                                >
                                                                                    Resubmit
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleOpenPaymentModal(booking, item)}
                                                                                className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-xs hover:bg-blue-700 transition"
                                                                            >
                                                                                <span>💳 Pay Downpayment (₱{itemDownpayment.toLocaleString('en-PH')})</span>
                                                                            </button>
                                                                        )
                                                                    ) : (
                                                                        <span className="text-[10px] text-warmgray italic">
                                                                            QR unlocks upon supplier acceptance
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* GCash Payment Modal */}
            <GCashPaymentModal
                isOpen={paymentModalOpen}
                onClose={() => {
                    setPaymentModalOpen(false);
                    setSelectedBookingForPayment(null);
                    setSelectedItemForPayment(null);
                    setSelectedSupplierForPayment(null);
                    setSelectedPaymentSetting(null);
                    setExistingPaymentRecord(null);
                }}
                booking={selectedBookingForPayment}
                selectedItem={selectedItemForPayment}
                supplier={selectedSupplierForPayment}
                paymentSetting={selectedPaymentSetting}
                existingPayment={existingPaymentRecord}
            />
        </DashboardLayout>
    );
}
