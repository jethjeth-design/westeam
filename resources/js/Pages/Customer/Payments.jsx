import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';

function StatusBadge({ status }) {
    const map = {
        verified: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        rejected: 'bg-red-50 text-red-700 ring-red-600/20',
    };
    const labels = {
        verified: '✓ Verified',
        pending: '⏳ Pending',
        rejected: '✕ Rejected',
    };
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ring-1 ring-inset ${map[status] || map.pending}`}
        >
            {labels[status] || status}
        </span>
    );
}

export default function CustomerPayments({ payments = { data: [], links: [] }, metrics = {} }) {
    return (
        <DashboardLayout>
            <Head title="My Payment History - Westeam" />

            <div className="min-h-screen bg-ivory/60 p-4 sm:p-6 lg:p-10">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-champagne px-2.5 py-1 text-xs font-bold text-darkgold">
                                💳 Payment History
                            </span>
                            <span className="text-xs text-warmgray">• GCash Booking Payments</span>
                        </div>
                        <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-softcharcoal">
                            My Payment Records
                        </h1>
                        <p className="mt-1 text-sm text-warmgray">
                            All your GCash payment submissions for booked services and packages.
                        </p>
                    </div>
                    <Link
                        href={route('customer.bookings.index')}
                        className="inline-flex items-center gap-2 rounded-2xl border border-warmbeige bg-white px-4 py-2.5 text-xs font-bold text-softcharcoal shadow-xs hover:bg-champagne/40 transition active:scale-95"
                    >
                        📅 Back to My Bookings
                    </Link>
                </div>

                {/* Summary Cards */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-500/10 to-white p-5 shadow-xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Total Paid (Verified)</span>
                        <div className="mt-2 text-2xl font-black text-emerald-950">
                            ₱{Number(metrics?.totalPaid || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-[11px] text-emerald-700 mt-0.5">Confirmed verified payments</p>
                    </div>

                    <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Pending Verification</span>
                        <div className="mt-2 text-2xl font-black text-amber-950">
                            {metrics?.pendingCount || 0} payment{metrics?.pendingCount !== 1 ? 's' : ''}
                        </div>
                        <p className="text-[11px] text-amber-700 mt-0.5">Waiting for supplier to verify</p>
                    </div>

                    <div className="rounded-3xl border border-red-200 bg-red-50/30 p-5 shadow-xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">Rejected</span>
                        <div className="mt-2 text-2xl font-black text-red-950">
                            {metrics?.rejectedCount || 0} payment{metrics?.rejectedCount !== 1 ? 's' : ''}
                        </div>
                        <p className="text-[11px] text-red-700 mt-0.5">Need to resubmit</p>
                    </div>
                </div>

                {/* Payment Records Table */}
                <div className="mt-8 rounded-3xl border border-warmbeige bg-white shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-champagne bg-ivory/50 text-[11px] font-extrabold uppercase tracking-wider text-warmgray">
                                    <th className="py-4 px-5">Date</th>
                                    <th className="py-4 px-4">Booking</th>
                                    <th className="py-4 px-4">Supplier</th>
                                    <th className="py-4 px-4">Package / Service</th>
                                    <th className="py-4 px-4">Payment Type</th>
                                    <th className="py-4 px-4">Reference #</th>
                                    <th className="py-4 px-4">Amount</th>
                                    <th className="py-4 px-4">Status</th>
                                    <th className="py-4 px-5">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-warmbeige/50 text-xs text-softcharcoal">
                                {payments?.data?.length > 0 ? (
                                    payments.data.map((payment) => {
                                        const supplier = payment.supplier;
                                        const booking = payment.booking;
                                        const bookingItem = payment.booking_item;
                                        const supplierName = supplier?.supplier_profile?.business_name || supplier?.name || 'Supplier';
                                        const itemName = bookingItem?.item_name || booking?.event_name || '—';

                                        return (
                                            <tr key={payment.id} className="hover:bg-champagne/20 transition-colors">
                                                <td className="py-4 px-5">
                                                    <div className="font-bold text-softcharcoal">
                                                        {new Date(payment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Link
                                                        href={route('customer.bookings.show', booking?.id)}
                                                        className="font-mono font-bold text-champagnegold hover:underline"
                                                    >
                                                        {booking?.booking_reference || `#BK-${booking?.id}`}
                                                    </Link>
                                                </td>
                                                <td className="py-4 px-4 font-semibold text-softcharcoal">
                                                    {supplierName}
                                                </td>
                                                <td className="py-4 px-4 text-softcharcoal">
                                                    <div className="truncate max-w-[180px]">{itemName}</div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="inline-flex rounded-md bg-warmbeige/50 px-2 py-0.5 text-[10px] font-bold text-softcharcoal capitalize">
                                                        {payment.payment_type ? payment.payment_type.replace('_', ' ') : '—'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 font-mono font-bold text-warmgray">
                                                    {payment.reference_number}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="font-extrabold text-softcharcoal">
                                                        ₱{Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <StatusBadge status={payment.status} />
                                                    {payment.status === 'rejected' && payment.rejection_reason && (
                                                        <p className="text-[10px] text-red-600 mt-0.5 truncate max-w-[140px]" title={payment.rejection_reason}>
                                                            {payment.rejection_reason}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="py-4 px-5">
                                                    {(payment.status === 'rejected' || payment.status === 'pending') && (
                                                        <Link
                                                            href={`/customer/payments/create?booking_id=${booking?.id}&booking_item_id=${bookingItem?.id || ''}`}
                                                            className="rounded-xl bg-champagnegold px-3 py-1.5 text-xs font-bold text-white hover:bg-darkgold shadow-xs transition active:scale-95 inline-flex items-center gap-1"
                                                        >
                                                            {payment.status === 'rejected' ? '↩ Resubmit' : '👁 View'}
                                                        </Link>
                                                    )}
                                                    {payment.status === 'verified' && (
                                                        <Link
                                                            href={route('customer.bookings.show', booking?.id)}
                                                            className="rounded-xl border border-warmbeige px-3 py-1.5 text-xs font-bold text-softcharcoal hover:bg-champagne/40 transition"
                                                        >
                                                            View Booking
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="py-12 text-center text-warmgray">
                                            <div className="text-4xl mb-3">💳</div>
                                            <p className="font-bold text-softcharcoal text-sm">No payment records yet</p>
                                            <p className="text-xs text-warmgray mt-1">
                                                After you book a service and submit a GCash payment, it will appear here.
                                            </p>
                                            <Link
                                                href={route('customer.bookings.index')}
                                                className="mt-4 inline-flex rounded-2xl bg-champagnegold px-5 py-2 text-xs font-bold text-white hover:bg-darkgold transition"
                                            >
                                                View My Bookings
                                            </Link>
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
                                {payments.from || 0}–{payments.to || 0} of {payments.total || 0} records
                            </span>
                            <div className="flex gap-1">
                                {payments.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveScroll
                                        className={`rounded-xl px-3 py-1 text-xs font-bold transition ${link.active ? 'bg-champagnegold text-white' : link.url ? 'bg-white border border-warmbeige text-softcharcoal hover:bg-champagne' : 'text-gray-300 pointer-events-none'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
