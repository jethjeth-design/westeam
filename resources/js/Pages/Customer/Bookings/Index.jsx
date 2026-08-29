import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ bookings, upcomingBooking }) {
    const [statusFilter, setStatusFilter] = useState('all');

    const bookingList = bookings?.data || [];

    const filteredBookings = bookingList.filter((b) => {
        if (statusFilter === 'all') return true;
        return b.overall_status === statusFilter;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'accepted':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        Accepted
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                        Pending
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-extrabold text-red-700 ring-1 ring-inset ring-red-600/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                        Declined
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-extrabold text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                        Completed
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600 ring-1 ring-inset ring-slate-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                        Cancelled
                    </span>
                );
            default:
                return null;
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

            <div className="min-h-screen bg-slate-50/60 p-6 lg:p-10">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                                📅 Event Reservations
                            </span>
                        </div>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                            My Bookings
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Track vendor booking statuses, response feedback, and upcoming event milestones.
                        </p>
                    </div>

                    <Link
                        href={route('customer.suppliers.index')}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                    >
                        <span>+ Book More Suppliers</span>
                    </Link>
                </div>

                {/* Featured Upcoming Event Details Highlight */}
                {upcomingBooking && (
                    <div className="mt-8 overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-6 text-white shadow-xl lg:p-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="space-y-3">
                                <span className="inline-flex items-center rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold backdrop-blur-md">
                                    ⭐ Upcoming Highlight Event
                                </span>
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
                                </div>
                                <Link
                                    href={route('customer.bookings.show', upcomingBooking.id)}
                                    className="rounded-xl bg-white px-5 py-2.5 text-xs font-extrabold text-indigo-900 shadow-md transition hover:bg-indigo-50 active:scale-95"
                                >
                                    View Full Event Breakdown →
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Filter Tabs */}
                <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-4">
                    {['all', 'pending', 'accepted', 'completed', 'rejected', 'cancelled'].map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setStatusFilter(tab)}
                            className={`rounded-xl px-4 py-2 text-xs font-bold capitalize transition ${
                                statusFilter === tab
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            {tab === 'all' ? 'All Bookings' : tab}
                        </button>
                    ))}
                </div>

                {/* Bookings List */}
                <div className="mt-6 space-y-4">
                    {filteredBookings.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                                📅
                            </div>
                            <h3 className="mt-4 text-base font-bold text-slate-900">No bookings found</h3>
                            <p className="mt-1 text-xs text-slate-500">
                                {statusFilter === 'all'
                                    ? "You haven't requested any supplier bookings yet."
                                    : `No bookings currently under '${statusFilter}' status.`}
                            </p>
                            <Link
                                href={route('customer.suppliers.index')}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
                            >
                                Explore Verified Suppliers
                            </Link>
                        </div>
                    ) : (
                        filteredBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-indigo-200 hover:shadow-md"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-indigo-600">
                                                {booking.booking_reference}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-xs font-semibold text-slate-500">
                                                {getBookingTypeLabel(booking.booking_type)}
                                            </span>
                                            {getStatusBadge(booking.overall_status)}
                                        </div>

                                        <h3 className="text-lg font-black text-slate-900">
                                            {booking.event_name}
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
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
                                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 border-t border-slate-100 pt-3 sm:border-none sm:pt-0">
                                        <div>
                                            <p className="text-[11px] text-slate-400 sm:text-right">Total Amount</p>
                                            <p className="text-lg font-black text-slate-900">
                                                ₱{Number(booking.total_amount).toLocaleString('en-PH', {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </p>
                                        </div>

                                        <Link
                                            href={route('customer.bookings.show', booking.id)}
                                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
                                        >
                                            View Details →
                                        </Link>
                                    </div>
                                </div>

                                {/* Items mini breakdown */}
                                {booking.items && booking.items.length > 0 && (
                                    <div className="mt-4 border-t border-slate-100 pt-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {booking.items.map((item) => (
                                                <span
                                                    key={item.id}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200/60"
                                                >
                                                    <span>{item.item_name}</span>
                                                    <span className="text-slate-400">({item.supplier?.name || 'Vendor'})</span>
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            item.status === 'accepted'
                                                                ? 'bg-emerald-500'
                                                                : item.status === 'rejected'
                                                                ? 'bg-red-500'
                                                                : item.status === 'completed'
                                                                ? 'bg-indigo-500'
                                                                : 'bg-amber-500'
                                                        }`}
                                                    />
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
