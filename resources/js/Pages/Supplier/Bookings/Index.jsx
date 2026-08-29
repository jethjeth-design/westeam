import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ bookingItems, teamBookings }) {
    const { auth } = usePage().props;
    const [activeTab, setActiveTab] = useState('individual'); // 'individual' | 'teams'
    const [statusFilter, setStatusFilter] = useState('all');

    // Reject Modal state
    const [rejectingItem, setRejectingItem] = useState(null);
    const [rejectingTeamBooking, setRejectingTeamBooking] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processingAction, setProcessingAction] = useState(false);

    const itemsList = bookingItems?.data || [];

    const filteredItems = itemsList.filter((item) => {
        if (statusFilter === 'all') return true;
        return item.status === statusFilter;
    });

    const handleAcceptItem = (item) => {
        setProcessingAction(true);
        router.post(
            route('supplier.bookings.items.accept', item.id),
            {},
            {
                onFinish: () => setProcessingAction(false),
            }
        );
    };

    const handleRejectItemSubmit = (e) => {
        e.preventDefault();
        if (!rejectingItem || !rejectionReason.trim()) return;

        setProcessingAction(true);
        router.post(
            route('supplier.bookings.items.reject', rejectingItem.id),
            {
                rejection_reason: rejectionReason,
            },
            {
                onSuccess: () => {
                    setRejectingItem(null);
                    setRejectionReason('');
                },
                onFinish: () => setProcessingAction(false),
            }
        );
    };

    const handleCompleteItem = (item) => {
        setProcessingAction(true);
        router.post(
            route('supplier.bookings.items.complete', item.id),
            {},
            {
                onFinish: () => setProcessingAction(false),
            }
        );
    };

    // Team Coordinator Actions
    const handleAcceptTeam = (booking) => {
        setProcessingAction(true);
        router.post(
            route('supplier.bookings.teams.accept', booking.id),
            {},
            {
                onFinish: () => setProcessingAction(false),
            }
        );
    };

    const handleRejectTeamSubmit = (e) => {
        e.preventDefault();
        if (!rejectingTeamBooking || !rejectionReason.trim()) return;

        setProcessingAction(true);
        router.post(
            route('supplier.bookings.teams.reject', rejectingTeamBooking.id),
            {
                rejection_reason: rejectionReason,
            },
            {
                onSuccess: () => {
                    setRejectingTeamBooking(null);
                    setRejectionReason('');
                },
                onFinish: () => setProcessingAction(false),
            }
        );
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'accepted':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        ✓ Accepted
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        ⏳ Pending
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/20">
                        ✕ Declined
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                        🎉 Completed
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-500/20">
                        Cancelled
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <DashboardLayout>
            <Head title="Booking Requests - Supplier Dashboard" />

            <div className="min-h-screen bg-slate-50/60 p-6 lg:p-10">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                                💼 Supplier Orders
                            </span>
                        </div>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                            Client Bookings & Requests
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Accept or decline incoming client booking requests and provide feedback.
                        </p>
                    </div>

                    {/* Tabs for Coordinator vs Individual */}
                    <div className="flex rounded-2xl bg-slate-200/80 p-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab('individual')}
                            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                                activeTab === 'individual'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            My Services ({itemsList.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('teams')}
                            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                                activeTab === 'teams'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            👥 Coordinated Teams ({teamBookings?.length || 0})
                        </button>
                    </div>
                </div>

                {/* Individual Booking Requests Tab */}
                {activeTab === 'individual' && (
                    <div className="mt-8 space-y-6">
                        {/* Filter Tabs */}
                        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-4">
                            {['all', 'pending', 'accepted', 'completed', 'rejected', 'cancelled'].map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setStatusFilter(tab)}
                                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition ${
                                        statusFilter === tab
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                >
                                    {tab === 'all' ? 'All Requests' : tab}
                                </button>
                            ))}
                        </div>

                        {/* List */}
                        {filteredItems.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                                    📬
                                </div>
                                <h3 className="mt-4 text-base font-bold text-slate-900">
                                    No requests found
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    You have no booking requests matching the filter criteria.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredItems.map((item) => {
                                    const booking = item.booking;
                                    return (
                                        <div
                                            key={item.id}
                                            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-indigo-200 hover:shadow-md"
                                        >
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                {/* Left details */}
                                                <div className="space-y-2">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-mono text-xs font-bold text-indigo-600">
                                                            {booking?.booking_reference}
                                                        </span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="text-xs font-bold text-slate-900">
                                                            {item.item_name}
                                                        </span>
                                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                                                            {item.item_type}
                                                        </span>
                                                        {getStatusBadge(item.status)}
                                                    </div>

                                                    <h3 className="text-lg font-black text-slate-900">
                                                        {booking?.event_name}
                                                    </h3>

                                                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
                                                        <div>
                                                            Client: <strong className="text-slate-800">{booking?.customer?.name}</strong>
                                                        </div>
                                                        <div>
                                                            📅{' '}
                                                            {booking?.event_date &&
                                                                new Date(booking.event_date).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                })}
                                                        </div>
                                                        <div>📍 {booking?.event_location}</div>
                                                        {booking?.guest_count && (
                                                            <div>👥 {booking.guest_count} Guests</div>
                                                        )}
                                                    </div>

                                                    {booking?.special_requests && (
                                                        <p className="mt-2 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-100">
                                                            <strong>Client Note:</strong> {booking.special_requests}
                                                        </p>
                                                    )}

                                                    {item.status === 'rejected' && item.rejection_reason && (
                                                        <p className="mt-2 text-xs text-red-600">
                                                            <strong>Your Decline Reason:</strong> "{item.rejection_reason}"
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Price & Action Buttons */}
                                                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 border-t border-slate-100 pt-4 lg:border-none lg:pt-0">
                                                    <div className="text-left lg:text-right">
                                                        <p className="text-[11px] text-slate-400">Offer Price</p>
                                                        <p className="text-xl font-black text-slate-900">
                                                            ₱{Number(item.unit_price).toLocaleString('en-PH', {
                                                                minimumFractionDigits: 2,
                                                            })}
                                                        </p>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-2">
                                                        {item.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    disabled={processingAction}
                                                                    onClick={() => handleAcceptItem(item)}
                                                                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                                                                >
                                                                    Accept Request
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    disabled={processingAction}
                                                                    onClick={() => setRejectingItem(item)}
                                                                    className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 shadow-xs transition hover:bg-red-50 active:scale-95 disabled:opacity-50"
                                                                >
                                                                    Decline
                                                                </button>
                                                            </>
                                                        )}

                                                        {item.status === 'accepted' && (
                                                            <button
                                                                type="button"
                                                                disabled={processingAction}
                                                                onClick={() => handleCompleteItem(item)}
                                                                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                                                            >
                                                                Mark as Completed
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Coordinated Teams Tab */}
                {activeTab === 'teams' && (
                    <div className="mt-8 space-y-6">
                        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs text-indigo-900">
                            💡 <strong>Team Coordinator Notice:</strong> You are the designated Coordinator for the team(s) below. Accepting or declining a team package updates the booking for all collaborating suppliers.
                        </div>

                        {teamBookings?.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                                    👥
                                </div>
                                <h3 className="mt-4 text-base font-bold text-slate-900">
                                    No Team Package Bookings Yet
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    When clients book full team packages you coordinate, they will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {teamBookings.map((tBooking) => (
                                    <div
                                        key={tBooking.id}
                                        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-indigo-200 hover:shadow-md"
                                    >
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-indigo-600">
                                                        {tBooking.booking_reference}
                                                    </span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="rounded-md bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700">
                                                        Team: {tBooking.team?.name}
                                                    </span>
                                                    {getStatusBadge(tBooking.overall_status)}
                                                </div>

                                                <h3 className="text-lg font-black text-slate-900">
                                                    {tBooking.event_name}
                                                </h3>

                                                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
                                                    <div>Client: <strong className="text-slate-800">{tBooking.customer?.name}</strong></div>
                                                    <div>
                                                        📅{' '}
                                                        {new Date(tBooking.event_date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </div>
                                                    <div>📍 {tBooking.event_location}</div>
                                                </div>

                                                {/* Team Members in this booking */}
                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                    <span className="text-[11px] font-bold text-slate-400 uppercase">Team Members:</span>
                                                    {tBooking.items?.map((item) => (
                                                        <span
                                                            key={item.id}
                                                            className="rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200/60"
                                                        >
                                                            {item.item_name} ({item.supplier?.name})
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Price & Actions */}
                                            <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 border-t border-slate-100 pt-4 lg:border-none lg:pt-0">
                                                <div className="text-left lg:text-right">
                                                    <p className="text-[11px] text-slate-400">Total Team Package</p>
                                                    <p className="text-xl font-black text-slate-900">
                                                        ₱{Number(tBooking.total_amount).toLocaleString('en-PH', {
                                                            minimumFractionDigits: 2,
                                                        })}
                                                    </p>
                                                </div>

                                                {tBooking.overall_status === 'pending' && (
                                                    <div className="flex items-center gap-2">
                                                        {tBooking.team?.coordinator_id === auth?.user?.id ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    disabled={processingAction}
                                                                    onClick={() => handleAcceptTeam(tBooking)}
                                                                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                                                                >
                                                                    Accept for Team
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    disabled={processingAction}
                                                                    onClick={() => setRejectingTeamBooking(tBooking)}
                                                                    className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 shadow-xs transition hover:bg-red-50 active:scale-95 disabled:opacity-50"
                                                                >
                                                                    Decline Team Package
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200/70">
                                                                Coordinated by {tBooking.team?.coordinator?.name || 'Lead Coordinator'}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Rejection Reason Modal (For individual item) */}
            {rejectingItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
                    onClick={() => setRejectingItem(null)}
                >
                    <div
                        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-black text-slate-900">
                            Decline Booking Request
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                            Please provide a reason why you cannot accept{' '}
                            <strong>{rejectingItem.item_name}</strong> on this date.
                        </p>

                        <form onSubmit={handleRejectItemSubmit} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700">
                                    Reason for Declining <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows="4"
                                    required
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="e.g., Already fully booked on this date, outside service area, or schedule conflict..."
                                    className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 shadow-xs focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setRejectingItem(null)}
                                    className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processingAction || !rejectionReason.trim()}
                                    className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    {processingAction ? 'Submitting...' : 'Confirm Decline'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Rejection Reason Modal (For Team Booking) */}
            {rejectingTeamBooking && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
                    onClick={() => setRejectingTeamBooking(null)}
                >
                    <div
                        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-black text-slate-900">
                            Decline Team Package Booking
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                            As Coordinator, provide a reason why Team{' '}
                            <strong>{rejectingTeamBooking.team?.name}</strong> cannot accept this reservation.
                        </p>

                        <form onSubmit={handleRejectTeamSubmit} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700">
                                    Reason for Declining <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows="4"
                                    required
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="e.g. One or more key team suppliers are unavailable on this date..."
                                    className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 shadow-xs focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setRejectingTeamBooking(null)}
                                    className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processingAction || !rejectionReason.trim()}
                                    className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    {processingAction ? 'Submitting...' : 'Decline Team Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
