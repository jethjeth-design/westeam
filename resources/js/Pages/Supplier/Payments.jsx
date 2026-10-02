import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Payments({
    payments = { data: [], links: [] },
    filters = {},
    metrics = {},
}) {
    // Filter states
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [paymentType, setPaymentType] = useState(filters.payment_type || 'all');
    const [dateFilter, setDateFilter] = useState(filters.date_filter || 'all');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');

    // Modal states
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [paymentToReject, setPaymentToReject] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [receiptZoomUrl, setReceiptZoomUrl] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Apply filters
    const applyFilters = (overrides = {}) => {
        const queryParams = {
            search: overrides.search !== undefined ? overrides.search : search,
            status: overrides.status !== undefined ? overrides.status : status,
            payment_type: overrides.payment_type !== undefined ? overrides.payment_type : paymentType,
            date_filter: overrides.date_filter !== undefined ? overrides.date_filter : dateFilter,
            from_date: overrides.from_date !== undefined ? overrides.from_date : fromDate,
            to_date: overrides.to_date !== undefined ? overrides.to_date : toDate,
        };

        // Remove empty keys
        Object.keys(queryParams).forEach(
            (key) => (queryParams[key] === '' || queryParams[key] === 'all' || queryParams[key] === null) && delete queryParams[key]
        );

        router.get(route('supplier.payments.index'), queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatus('all');
        setPaymentType('all');
        setDateFilter('all');
        setFromDate('');
        setToDate('');
        router.get(route('supplier.payments.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Verify Action
    const handleVerify = (payment) => {
        if (!confirm(`Are you sure you want to verify the payment of ₱${Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}?`)) {
            return;
        }

        setIsProcessing(true);
        router.post(
            route('supplier.payments.verify', payment.id),
            {},
            {
                onSuccess: () => {
                    setIsProcessing(false);
                    setDetailsModalOpen(false);
                    setSelectedPayment(null);
                },
                onError: () => setIsProcessing(false),
            }
        );
    };

    // Open Reject Modal
    const openRejectModal = (payment) => {
        setPaymentToReject(payment);
        setRejectionReason('');
        setRejectModalOpen(true);
    };

    // Submit Rejection
    const handleRejectSubmit = (e) => {
        e.preventDefault();
        if (!paymentToReject || !rejectionReason.trim()) return;

        setIsProcessing(true);
        router.post(
            route('supplier.payments.reject', paymentToReject.id),
            { rejection_reason: rejectionReason },
            {
                onSuccess: () => {
                    setIsProcessing(false);
                    setRejectModalOpen(false);
                    setPaymentToReject(null);
                    setRejectionReason('');
                    if (selectedPayment?.id === paymentToReject.id) {
                        setDetailsModalOpen(false);
                        setSelectedPayment(null);
                    }
                },
                onError: () => setIsProcessing(false),
            }
        );
    };

    // Open Details Modal
    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
        setDetailsModalOpen(true);
    };

    return (
        <DashboardLayout>
            <Head title="Supplier Payment Management - Westeam" />

            <div className="min-h-screen bg-ivory/60 p-4 sm:p-6 lg:p-10">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-champagne px-2.5 py-1 text-xs font-bold text-darkgold">
                                💰 Financial Management
                            </span>
                            <span className="text-xs text-warmgray">• Customer Payments &amp; Verification</span>
                        </div>
                        <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-softcharcoal">
                            Payment Management
                        </h1>
                        <p className="mt-1 text-sm text-warmgray">
                            Verify customer GCash payments, track transaction receipts, and monitor your booking revenue.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('supplier.payment-settings')}
                            className="inline-flex items-center gap-2 rounded-2xl border border-warmbeige bg-white px-4 py-2.5 text-xs font-bold text-softcharcoal shadow-xs hover:bg-champagne/40 transition active:scale-95"
                        >
                            <span>⚙️ GCash QR Settings</span>
                        </Link>
                    </div>
                </div>

                {/* ── Summary Metrics Cards ── */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                    {/* Total Verified Revenue */}
                    <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white p-5 shadow-xs lg:col-span-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                                Total Verified Revenue
                            </span>
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold text-sm">
                                ₱
                            </span>
                        </div>
                        <div className="mt-3 text-2xl sm:text-3xl font-black text-emerald-950">
                            ₱{Number(metrics?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-emerald-700">
                            Verified customer payments only
                        </p>
                    </div>

                    {/* This Month Revenue */}
                    <div className="rounded-3xl border border-warmbeige bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-warmgray">
                                This Month
                            </span>
                            <span className="text-base">📅</span>
                        </div>
                        <div className="mt-2 text-xl font-black text-softcharcoal">
                            ₱{Number(metrics?.thisMonthRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="mt-1 text-[11px] text-warmgray">
                            Month-to-date verified
                        </p>
                    </div>

                    {/* This Week Revenue */}
                    <div className="rounded-3xl border border-warmbeige bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-warmgray">
                                This Week
                            </span>
                            <span className="text-base">📈</span>
                        </div>
                        <div className="mt-2 text-xl font-black text-softcharcoal">
                            ₱{Number(metrics?.thisWeekRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="mt-1 text-[11px] text-warmgray">
                            Current week verified
                        </p>
                    </div>

                    {/* Pending Payments */}
                    <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                                Pending Action
                            </span>
                            <span className="flex h-6 px-2 items-center justify-center rounded-full bg-amber-500 text-white font-black text-[10px]">
                                {metrics?.pendingPayments || 0}
                            </span>
                        </div>
                        <div className="mt-2 text-xl font-black text-amber-950">
                            ₱{Number(metrics?.pendingPaymentAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="mt-1 text-[11px] text-amber-700 font-medium">
                            Awaiting your verification
                        </p>
                    </div>

                    {/* Remaining Balance */}
                    <div className="rounded-3xl border border-warmbeige bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-warmgray">
                                Remaining Balance
                            </span>
                            <span className="text-base">⏳</span>
                        </div>
                        <div className="mt-2 text-xl font-black text-softcharcoal">
                            ₱{Number(metrics?.remainingBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="mt-1 text-[11px] text-warmgray">
                            {metrics?.completedPayments || 0} completed payments
                        </p>
                    </div>
                </div>

                {/* ── Filters & Search Bar ── */}
                <div className="mt-8 rounded-3xl border border-warmbeige bg-white p-5 shadow-xs space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        {/* Search Input */}
                        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search customer, booking, ref..."
                                className="w-full rounded-2xl border border-warmbeige bg-ivory/30 pl-10 pr-4 py-2 text-xs text-softcharcoal focus:border-champagnegold focus:ring-1 focus:ring-champagnegold transition"
                            />
                            <span className="absolute left-3.5 top-2.5 text-warmgray text-xs">
                                🔍
                            </span>
                        </form>

                        {/* Status Filter Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                            {[
                                { key: 'all', label: 'All Status' },
                                { key: 'pending', label: 'Pending Verification', badge: metrics?.pendingPayments },
                                { key: 'verified', label: 'Verified' },
                                { key: 'rejected', label: 'Rejected' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => {
                                        setStatus(tab.key);
                                        applyFilters({ status: tab.key });
                                    }}
                                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${status === tab.key
                                            ? 'bg-champagnegold text-white shadow-xs'
                                            : 'bg-ivory text-softcharcoal hover:bg-champagne/40'
                                        }`}
                                >
                                    <span>{tab.label}</span>
                                    {tab.badge > 0 && (
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${status === tab.key ? 'bg-white text-darkgold' : 'bg-amber-500 text-white'}`}>
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Secondary Filters: Type & Date Range */}
                    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-champagne text-xs">
                        {/* Payment Type */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-warmgray font-semibold">Type:</span>
                            <select
                                value={paymentType}
                                onChange={(e) => {
                                    setPaymentType(e.target.value);
                                    applyFilters({ payment_type: e.target.value });
                                }}
                                className="rounded-xl border border-warmbeige bg-white px-2.5 py-1 text-xs text-softcharcoal focus:border-champagnegold focus:ring-1 focus:ring-champagnegold"
                            >
                                <option value="all">All Types</option>
                                <option value="downpayment">Downpayment</option>
                                <option value="balance">Remaining Balance</option>
                                <option value="full_payment">Full Payment</option>
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-warmgray font-semibold">Date:</span>
                            <select
                                value={dateFilter}
                                onChange={(e) => {
                                    setDateFilter(e.target.value);
                                    applyFilters({ date_filter: e.target.value });
                                }}
                                className="rounded-xl border border-warmbeige bg-white px-2.5 py-1 text-xs text-softcharcoal focus:border-champagnegold focus:ring-1 focus:ring-champagnegold"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="this_week">This Week</option>
                                <option value="this_month">This Month</option>
                                <option value="this_year">This Year</option>
                                <option value="custom">Custom Date Range</option>
                            </select>
                        </div>

                        {/* Custom Date Inputs */}
                        {dateFilter === 'custom' && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="rounded-xl border border-warmbeige bg-white px-2 py-1 text-xs text-softcharcoal"
                                />
                                <span className="text-warmgray">to</span>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="rounded-xl border border-warmbeige bg-white px-2 py-1 text-xs text-softcharcoal"
                                />
                                <button
                                    type="button"
                                    onClick={() => applyFilters({ from_date: fromDate, to_date: toDate })}
                                    className="rounded-xl bg-champagnegold text-white px-3 py-1 font-bold hover:bg-darkgold"
                                >
                                    Filter
                                </button>
                            </div>
                        )}

                        {/* Clear Filters Button */}
                        {(search || status !== 'all' || paymentType !== 'all' || dateFilter !== 'all') && (
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="ml-auto text-warmgray hover:text-red-600 font-bold transition flex items-center gap-1"
                            >
                                ✕ Reset Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Transaction Table ── */}
                <div className="mt-6 rounded-3xl border border-warmbeige bg-white shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-champagne bg-ivory/50 text-[11px] font-extrabold uppercase tracking-wider text-warmgray">
                                    <th className="py-4 px-5">Date</th>
                                    <th className="py-4 px-4">Customer</th>
                                    <th className="py-4 px-4">Booking</th>
                                    <th className="py-4 px-4">Package / Service</th>
                                    <th className="py-4 px-4">Type</th>
                                    <th className="py-4 px-4">Amount</th>
                                    <th className="py-4 px-4">Status</th>
                                    <th className="py-4 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-warmbeige/50 text-xs text-softcharcoal">
                                {payments?.data?.length > 0 ? (
                                    payments.data.map((payment) => {
                                        const customer = payment.customer;
                                        const booking = payment.booking;
                                        const bookingItem = payment.booking_item;
                                        const itemName = bookingItem?.item_name || booking?.event_name || 'Event Booking';

                                        return (
                                            <tr key={payment.id} className="hover:bg-champagne/20 transition-colors">
                                                {/* Date & Ref Number */}
                                                <td className="py-4 px-5">
                                                    <div className="font-bold text-softcharcoal">
                                                        {new Date(payment.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </div>
                                                    <div className="text-[10px] font-mono text-warmgray mt-0.5">
                                                        Ref: {payment.reference_number}
                                                    </div>
                                                </td>

                                                {/* Customer */}
                                                <td className="py-4 px-4">
                                                    <div className="font-bold text-softcharcoal">
                                                        {customer?.name || 'Customer'}
                                                    </div>
                                                    <div className="text-[11px] text-warmgray truncate max-w-[140px]">
                                                        {customer?.email}
                                                    </div>
                                                </td>

                                                {/* Booking */}
                                                <td className="py-4 px-4">
                                                    <div className="font-mono font-bold text-champagnegold">
                                                        {booking?.booking_reference || `#BK-${booking?.id}`}
                                                    </div>
                                                    <div className="text-[11px] text-warmgray truncate max-w-[140px]">
                                                        {booking?.event_name}
                                                    </div>
                                                </td>

                                                {/* Package / Service */}
                                                <td className="py-4 px-4 font-semibold text-softcharcoal">
                                                    <div className="truncate max-w-[180px]">
                                                        {itemName}
                                                    </div>
                                                    <div className="text-[10px] text-warmgray capitalize">
                                                        {booking?.booking_type ? booking.booking_type.replace('_', ' ') : 'Booking'}
                                                    </div>
                                                </td>

                                                {/* Payment Type */}
                                                <td className="py-4 px-4">
                                                    <span className="inline-flex rounded-md bg-warmbeige/50 px-2 py-0.5 text-[10px] font-bold text-softcharcoal capitalize">
                                                        {payment.payment_type ? payment.payment_type.replace('_', ' ') : 'Payment'}
                                                    </span>
                                                </td>

                                                {/* Amount */}
                                                <td className="py-4 px-4">
                                                    <span className="font-extrabold text-sm text-softcharcoal">
                                                        ₱{Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>

                                                {/* Status Badge */}
                                                <td className="py-4 px-4">
                                                    {payment.status === 'verified' && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                                            <span>✓</span> Verified
                                                        </span>
                                                    )}
                                                    {payment.status === 'pending' && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-700 ring-1 ring-inset ring-amber-600/20 animate-pulse">
                                                            <span>⏳</span> Pending
                                                        </span>
                                                    )}
                                                    {payment.status === 'rejected' && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-extrabold text-red-700 ring-1 ring-inset ring-red-600/20">
                                                            <span>✕</span> Rejected
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="py-4 px-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewDetails(payment)}
                                                            className="rounded-xl border border-warmbeige bg-white px-3 py-1.5 text-xs font-bold text-softcharcoal hover:bg-champagne/40 transition active:scale-95"
                                                        >
                                                            View
                                                        </button>

                                                        {payment.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleVerify(payment)}
                                                                    disabled={isProcessing}
                                                                    className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition active:scale-95 disabled:opacity-50"
                                                                >
                                                                    Verify
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openRejectModal(payment)}
                                                                    disabled={isProcessing}
                                                                    className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 shadow-xs transition active:scale-95 disabled:opacity-50"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="py-12 text-center text-warmgray">
                                            <div className="text-3xl mb-2">💳</div>
                                            <p className="font-bold text-softcharcoal">No payment records found</p>
                                            <p className="text-xs text-warmgray mt-0.5">
                                                Payments submitted by customers for your bookings will appear here.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {payments?.links?.length > 3 && (
                        <div className="flex items-center justify-between border-t border-champagne px-5 py-3 bg-ivory/30">
                            <span className="text-xs text-warmgray">
                                Showing {payments.from || 0} to {payments.to || 0} of {payments.total || 0} payment records
                            </span>
                            <div className="flex gap-1">
                                {payments.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveScroll
                                        className={`rounded-xl px-3 py-1 text-xs font-bold transition ${link.active
                                                ? 'bg-champagnegold text-white shadow-xs'
                                                : link.url
                                                    ? 'bg-white border border-warmbeige text-softcharcoal hover:bg-champagne'
                                                    : 'text-gray-300 pointer-events-none'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* ── PAYMENT DETAILS MODAL (Requirement 6) ── */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {detailsModalOpen && selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-softcharcoal/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
                    <div className="relative w-full max-w-2xl rounded-3xl border border-warmbeige bg-white p-6 sm:p-8 shadow-2xl my-8">
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setDetailsModalOpen(false)}
                            className="absolute right-5 top-5 h-8 w-8 rounded-full border border-warmbeige bg-white text-warmgray hover:text-softcharcoal flex items-center justify-center font-bold text-sm shadow-xs transition"
                        >
                            ✕
                        </button>

                        <div className="flex items-center gap-3 border-b border-champagne pb-4">
                            <div className="h-10 w-10 rounded-2xl bg-champagne text-darkgold flex items-center justify-center text-xl font-bold">
                                💳
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-softcharcoal">
                                    Payment Transaction Details
                                </h3>
                                <p className="text-xs text-warmgray">
                                    Reference #{selectedPayment.reference_number} • Payment ID: #{selectedPayment.id}
                                </p>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="mt-6 space-y-6 max-h-[70vh] overflow-y-auto pr-1">
                            {/* Status Banner */}
                            <div className={`p-4 rounded-2xl border ${selectedPayment.status === 'verified'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                    : selectedPayment.status === 'rejected'
                                        ? 'bg-red-50 border-red-200 text-red-900'
                                        : 'bg-amber-50 border-amber-200 text-amber-900'
                                }`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider">
                                        Current Status:
                                    </span>
                                    <span className="font-extrabold text-sm uppercase">
                                        {selectedPayment.status}
                                    </span>
                                </div>
                                {selectedPayment.status === 'verified' && (
                                    <p className="text-xs mt-1">
                                        Verified on {new Date(selectedPayment.verified_at).toLocaleString()} by {selectedPayment.verifier?.name || 'Supplier'}
                                    </p>
                                )}
                                {selectedPayment.status === 'rejected' && (
                                    <div className="mt-2 text-xs">
                                        <span className="font-bold">Rejection Reason:</span> “{selectedPayment.rejection_reason}”
                                    </div>
                                )}
                            </div>

                            {/* Booking & Event Overview */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-warmbeige bg-ivory/30 p-4 text-xs">
                                <div>
                                    <span className="text-warmgray block">Booking ID / Reference:</span>
                                    <span className="font-extrabold text-softcharcoal text-sm font-mono">
                                        {selectedPayment.booking?.booking_reference || `#BK-${selectedPayment.booking?.id}`}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-warmgray block">Customer Name:</span>
                                    <span className="font-bold text-softcharcoal text-sm">
                                        {selectedPayment.customer?.name} ({selectedPayment.customer?.email})
                                    </span>
                                </div>
                                <div>
                                    <span className="text-warmgray block">Event Type &amp; Name:</span>
                                    <span className="font-bold text-softcharcoal">
                                        {selectedPayment.booking?.event_name}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-warmgray block">Event Date &amp; Location:</span>
                                    <span className="font-bold text-softcharcoal">
                                        {selectedPayment.booking?.event_date ? new Date(selectedPayment.booking.event_date).toLocaleDateString() : 'N/A'} • {selectedPayment.booking?.event_location}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-warmgray block">Package / Service:</span>
                                    <span className="font-bold text-softcharcoal">
                                        {selectedPayment.booking_item?.item_name || 'Event Booking'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-warmgray block">Payment Method:</span>
                                    <span className="font-bold text-softcharcoal uppercase">
                                        {selectedPayment.payment_method}
                                    </span>
                                </div>
                            </div>

                            {/* Financial Breakdown */}
                            <div className="rounded-2xl border border-warmbeige bg-white p-4 space-y-2 text-xs">
                                <div className="flex justify-between py-1 border-b border-champagne">
                                    <span className="text-warmgray">Total Booking Amount:</span>
                                    <span className="font-bold text-softcharcoal">
                                        ₱{Number(selectedPayment.booking?.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-champagne">
                                    <span className="text-warmgray">Payment Type:</span>
                                    <span className="font-bold capitalize text-softcharcoal">
                                        {selectedPayment.payment_type ? selectedPayment.payment_type.replace('_', ' ') : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-champagne">
                                    <span className="text-warmgray font-bold">This Payment Amount:</span>
                                    <span className="font-black text-sm text-champagnegold">
                                        ₱{Number(selectedPayment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-warmgray">GCash Reference Number:</span>
                                    <span className="font-mono font-bold text-softcharcoal">
                                        {selectedPayment.reference_number}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Receipt Image */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-softcharcoal mb-2">
                                    Payment Receipt Proof
                                </label>
                                {selectedPayment.receipt_url ? (
                                    <div className="rounded-2xl border border-warmbeige overflow-hidden bg-black/5 p-2 text-center group relative">
                                        <img
                                            src={selectedPayment.receipt_url}
                                            alt="Payment Receipt"
                                            className="max-h-72 w-auto mx-auto object-contain rounded-xl cursor-zoom-in"
                                            onClick={() => setReceiptZoomUrl(selectedPayment.receipt_url)}
                                        />
                                        <div className="mt-2 flex justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setReceiptZoomUrl(selectedPayment.receipt_url)}
                                                className="text-xs font-bold text-champagnegold hover:underline"
                                            >
                                                🔍 Click to Enlarge Receipt
                                            </button>
                                            <span className="text-warmgray">•</span>
                                            <a
                                                href={selectedPayment.receipt_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs font-bold text-darkgold hover:underline"
                                            >
                                                Open in New Tab
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-warmgray italic">No receipt attached</p>
                                )}
                            </div>

                            {/* Customer Notes */}
                            {selectedPayment.customer_notes && (
                                <div className="rounded-2xl border border-warmbeige bg-ivory/30 p-3 text-xs">
                                    <span className="font-bold text-softcharcoal block mb-0.5">Customer Message / Note:</span>
                                    <p className="text-warmgray italic">{selectedPayment.customer_notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="mt-6 pt-4 border-t border-champagne flex flex-wrap items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => setDetailsModalOpen(false)}
                                className="rounded-2xl border border-warmbeige px-5 py-2.5 text-xs font-bold text-softcharcoal hover:bg-champagne/40 transition"
                            >
                                Close
                            </button>

                            {selectedPayment.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openRejectModal(selectedPayment)}
                                        disabled={isProcessing}
                                        className="rounded-2xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 shadow-xs transition active:scale-95 disabled:opacity-50"
                                    >
                                        ✕ Reject Payment
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleVerify(selectedPayment)}
                                        disabled={isProcessing}
                                        className="rounded-2xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition active:scale-95 disabled:opacity-50"
                                    >
                                        ✓ Verify Payment
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* ── REJECTION REASON PROMPT MODAL ── */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {rejectModalOpen && paymentToReject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-softcharcoal/50 backdrop-blur-xs animate-fade-in">
                    <div className="relative w-full max-w-md rounded-3xl border border-red-200 bg-white p-6 shadow-2xl">
                        <div className="flex items-center gap-3 border-b border-red-100 pb-3">
                            <div className="h-9 w-9 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-lg">
                                ⚠️
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-red-950">
                                    Reject Customer Payment
                                </h3>
                                <p className="text-xs text-red-700">
                                    Ref #{paymentToReject.reference_number} • ₱{Number(paymentToReject.amount).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleRejectSubmit} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-softcharcoal mb-1.5">
                                    Rejection Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows="4"
                                    required
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Explain why this payment is declined (e.g. Reference number not found in GCash statement, invalid receipt screenshot, incorrect amount sent...)"
                                    className="w-full rounded-2xl border border-warmbeige p-3 text-xs text-softcharcoal focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                />
                                <p className="text-[11px] text-warmgray mt-1">
                                    This explanation will be emailed to the customer so they can submit a corrected payment.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-champagne">
                                <button
                                    type="button"
                                    onClick={() => setRejectModalOpen(false)}
                                    className="rounded-2xl border border-warmbeige px-4 py-2 text-xs font-bold text-softcharcoal hover:bg-champagne/40"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isProcessing || !rejectionReason.trim()}
                                    className="rounded-2xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-xs disabled:opacity-50"
                                >
                                    {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* ── FULLSCREEN RECEIPT ZOOM MODAL ── */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {receiptZoomUrl && (
                <div
                    onClick={() => setReceiptZoomUrl(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-zoom-out animate-fade-in"
                >
                    <div className="relative max-w-3xl max-h-[90vh]">
                        <img
                            src={receiptZoomUrl}
                            alt="Receipt Zoomed"
                            className="max-h-[85vh] w-auto rounded-2xl shadow-2xl object-contain mx-auto"
                        />
                        <button
                            type="button"
                            onClick={() => setReceiptZoomUrl(null)}
                            className="absolute -top-10 right-0 text-white text-sm font-bold bg-white/20 px-3 py-1 rounded-full hover:bg-white/40"
                        >
                            ✕ Close
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
