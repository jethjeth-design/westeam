import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ReviewModal from '@/Components/ReviewModal';
import RatingStars from '@/Components/RatingStars';

export default function Show({ booking }) {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedReviewItem, setSelectedReviewItem] = useState(null);

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
            case 'accepted':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        <span className="h-2 w-2 rounded-full bg-emerald-600" />
                        Accepted
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
                        Pending Supplier Review
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
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-extrabold text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                        <span className="h-2 w-2 rounded-full bg-indigo-600" />
                        Completed
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600 ring-1 ring-inset ring-slate-500/20">
                        <span className="h-2 w-2 rounded-full bg-slate-500" />
                        Cancelled
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <DashboardLayout>
            <Head title={`Booking ${booking.booking_reference} - ${booking.event_name}`} />

            <div className="min-h-screen bg-slate-50/60 p-6 lg:p-10">
                {/* Header & Back Link */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Link
                                href={route('customer.bookings.index')}
                                className="transition hover:text-indigo-600"
                            >
                                ← Back to My Bookings
                            </Link>
                            <span>/</span>
                            <span className="font-mono font-bold text-slate-900">
                                {booking.booking_reference}
                            </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                                {booking.event_name}
                            </h1>
                            {getStatusBadge(booking.overall_status)}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
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
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                        >
                            💬 Contact Suppliers
                        </Link>
                    </div>
                </div>

                <div className="mt-8 grid gap-8 lg:grid-cols-3">
                    {/* Left 2 Cols: Services & Vendor Responses */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Booked Services Card */}
                        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
                            <h2 className="text-lg font-bold text-slate-900">
                                Reserved Services & Suppliers ({booking.items?.length || 0})
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Real-time status and feedback from each individual supplier.
                            </p>

                            <div className="mt-6 space-y-4">
                                {booking.items?.map((item) => (
                                    <div
                                        key={item.id}
                                        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 transition hover:border-indigo-200"
                                    >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base font-extrabold text-slate-900">
                                                        {item.item_name}
                                                    </span>
                                                    <span className="rounded-md bg-slate-200/60 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                                                        {item.item_type}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    Supplier:{' '}
                                                    <strong className="text-slate-800">
                                                        {item.supplier?.supplier_profile?.business_name ||
                                                            item.supplier?.name}
                                                    </strong>
                                                </p>
                                            </div>

                                            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                                                <span className="text-base font-black text-slate-900">
                                                    ₱{Number(item.unit_price).toLocaleString('en-PH', {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </span>
                                                {getStatusBadge(item.status)}
                                            </div>
                                        </div>

                                        {/* Review Section for Completed Items */}
                                        {(item.status === 'completed' || booking.overall_status === 'completed') && (
                                            <div className="mt-4 border-t border-slate-200/80 pt-3.5">
                                                {item.review ? (
                                                    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                                                    ✓ Reviewed by You
                                                                </span>
                                                                <RatingStars rating={item.review.rating} size="xs" showScore={true} />
                                                            </div>
                                                            <span className="text-[11px] text-slate-400">
                                                                {new Date(item.review.created_at).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                })}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 text-xs italic text-slate-700 whitespace-pre-line">
                                                            "{item.review.comment}"
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-purple-50/40 p-4">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-base">🎉</span>
                                                                <h4 className="text-xs font-extrabold text-slate-900">
                                                                    Service completed! How was your experience?
                                                                </h4>
                                                            </div>
                                                            <p className="mt-0.5 text-[11px] text-slate-500">
                                                                Leave a 1–5 star rating and written review to help other planners.
                                                            </p>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenReview(item)}
                                                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95 shrink-0"
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
                                                <p className="mt-2 text-[11px] text-red-600">
                                                    You can browse our directory to pick an alternative supplier for this service.
                                                </p>
                                            </div>
                                        )}

                                        {/* Responded timestamp */}
                                        {item.responded_at && (
                                            <p className="mt-3 text-[11px] text-slate-400">
                                                Responded on {new Date(item.responded_at).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Special Requests */}
                        {booking.special_requests && (
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                                    Special Notes & Event Instructions
                                </h3>
                                <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
                                    {booking.special_requests}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Col: Event Details & Summary */}
                    <div className="space-y-6">
                        {/* Event Details Card */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
                            <h3 className="text-base font-bold text-slate-900">
                                Event Details
                            </h3>

                            <div className="mt-5 space-y-4 text-xs">
                                <div>
                                    <span className="text-slate-400">Event Date:</span>
                                    <p className="mt-0.5 font-bold text-slate-900 text-sm">
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
                                        <span className="text-slate-400">Event Time:</span>
                                        <p className="mt-0.5 font-bold text-slate-900">
                                            ⏰ {booking.event_time}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <span className="text-slate-400">Venue / Location:</span>
                                    <p className="mt-0.5 font-bold text-slate-900">
                                        📍 {booking.event_location}
                                    </p>
                                </div>

                                {booking.guest_count && (
                                    <div>
                                        <span className="text-slate-400">Estimated Guest Count:</span>
                                        <p className="mt-0.5 font-bold text-slate-900">
                                            👥 {booking.guest_count} Attendees
                                        </p>
                                    </div>
                                )}

                                {booking.team && (
                                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3.5">
                                        <p className="font-bold text-indigo-950">Team Package Booking</p>
                                        <p className="text-[11px] text-indigo-700">
                                            Team: {booking.team.name}
                                        </p>
                                        {booking.team.coordinator && (
                                            <p className="mt-1 text-[11px] text-indigo-600">
                                                Coordinator: {booking.team.coordinator.name}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
                            <h3 className="text-base font-bold text-slate-900">
                                Financial Summary
                            </h3>

                            <div className="mt-4 space-y-2 text-xs">
                                <div className="flex justify-between text-slate-600">
                                    <span>Services Subtotal:</span>
                                    <span className="font-bold text-slate-900">
                                        ₱{Number(booking.total_amount).toLocaleString('en-PH', {
                                            minimumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Platform Fee:</span>
                                    <span className="font-bold text-emerald-600">FREE</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-100 pt-3 text-sm font-black text-slate-900">
                                    <span>Total Amount:</span>
                                    <span className="text-lg text-indigo-600">
                                        ₱{Number(booking.total_amount).toLocaleString('en-PH', {
                                            minimumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
                    onClick={() => setShowCancelModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-2xl text-red-600">
                            ⚠️
                        </div>
                        <h3 className="mt-4 text-lg font-black text-slate-900">
                            Cancel this booking?
                        </h3>
                        <p className="mt-2 text-xs text-slate-500">
                            Are you sure you want to cancel booking{' '}
                            <strong>{booking.booking_reference}</strong>? The suppliers will be notified immediately.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowCancelModal(false)}
                                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
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
        </DashboardLayout>
    );
}
