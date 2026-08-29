import { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function BookingModal({
    isOpen,
    onClose,
    bookingType = 'service', // 'service' | 'supplier_package' | 'team_package' | 'multi_supplier'
    title = 'Book Services',
    items = [], // Array of { supplier_id, item_type: 'service'|'package'|'team_package', item_id, item_name, unit_price, supplier_name }
    teamId = null,
}) {
    if (!isOpen) return null;

    const totalPrice = items.reduce((acc, curr) => acc + Number(curr.unit_price || 0), 0);

    const { data, setData, post, processing, errors, reset } = useForm({
        booking_type: bookingType,
        team_id: teamId,
        event_name: '',
        event_date: '',
        event_time: '',
        event_location: '',
        guest_count: '',
        special_requests: '',
        items: items.map((it) => ({
            supplier_id: it.supplier_id,
            item_type: it.item_type || 'service',
            item_id: it.item_id || null,
            item_name: it.item_name,
            unit_price: it.unit_price,
        })),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('customer.bookings.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                                {bookingType === 'team_package'
                                    ? '👥 Team Package Reservation'
                                    : bookingType === 'supplier_package'
                                    ? '📦 Package Booking'
                                    : bookingType === 'multi_supplier'
                                    ? '🤖 Multi-Supplier Booking'
                                    : '🛠️ Service Booking'}
                            </span>
                        </div>
                        <h2 className="mt-1.5 text-xl font-black tracking-tight text-slate-900">
                            {title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    {/* Selected Items Summary Card */}
                    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-purple-50/20 to-white p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                            Included Items & Suppliers ({items.length})
                        </p>

                        <div className="mt-3 divide-y divide-indigo-100/60">
                            {items.map((it, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2 text-xs">
                                    <div>
                                        <p className="font-bold text-slate-900">{it.item_name}</p>
                                        {it.supplier_name && (
                                            <p className="text-slate-500">By: {it.supplier_name}</p>
                                        )}
                                    </div>
                                    <span className="font-extrabold text-slate-900">
                                        ₱{Number(it.unit_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-indigo-200 pt-3">
                            <span className="text-xs font-extrabold text-indigo-950">Total Estimated Price:</span>
                            <span className="text-lg font-black text-indigo-600">
                                ₱{Number(totalPrice).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    {/* Event Details */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Event Name */}
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700">
                                Event Name / Celebration Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.event_name}
                                onChange={(e) => setData('event_name', e.target.value)}
                                placeholder="e.g., Sarah & John's Grand Wedding"
                                className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                            {errors.event_name && (
                                <p className="mt-1 text-xs text-red-500">{errors.event_name}</p>
                            )}
                        </div>

                        {/* Event Date */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700">
                                Event Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.event_date}
                                onChange={(e) => setData('event_date', e.target.value)}
                                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                            {errors.event_date && (
                                <p className="mt-1 text-xs text-red-500">{errors.event_date}</p>
                            )}
                        </div>

                        {/* Event Time */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700">
                                Event Time (Optional)
                            </label>
                            <input
                                type="time"
                                value={data.event_time}
                                onChange={(e) => setData('event_time', e.target.value)}
                                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700">
                                Venue / Location <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.event_location}
                                onChange={(e) => setData('event_location', e.target.value)}
                                placeholder="e.g. Radisson Blu Hotel, Cebu"
                                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                            {errors.event_location && (
                                <p className="mt-1 text-xs text-red-500">{errors.event_location}</p>
                            )}
                        </div>

                        {/* Guest Count */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700">
                                Estimated Guests (Optional)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={data.guest_count}
                                onChange={(e) => setData('guest_count', e.target.value)}
                                placeholder="e.g., 150"
                                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>

                        {/* Special Requests */}
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700">
                                Notes & Special Instructions (Optional)
                            </label>
                            <textarea
                                rows="3"
                                value={data.special_requests}
                                onChange={(e) => setData('special_requests', e.target.value)}
                                placeholder="Include theme preferences, color palettes, special requirements, or questions..."
                                className="mt-1.5 w-full rounded-xl border border-slate-300 p-3.5 text-sm text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                    </div>

                    {/* Notice */}
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900">
                        <p>
                            <strong>Status Policy:</strong> Submitting will create a <strong>Pending</strong> reservation. The supplier(s) or team coordinator will receive an email & dashboard notification to accept or decline.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                        >
                            {processing ? 'Submitting Request...' : 'Confirm & Request Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
