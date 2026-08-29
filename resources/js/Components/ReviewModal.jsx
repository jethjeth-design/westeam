import { useForm } from '@inertiajs/react';
import RatingStars from './RatingStars';
import { useEffect } from 'react';

export default function ReviewModal({
    isOpen,
    onClose,
    bookingItem,
    booking,
}) {
    if (!isOpen || !bookingItem) return null;

    const supplierName =
        bookingItem.supplier?.supplier_profile?.business_name ||
        bookingItem.supplier?.name ||
        'Supplier';

    const { data, setData, post, processing, errors, reset } = useForm({
        booking_item_id: bookingItem.id,
        rating: 5,
        comment: '',
    });

    useEffect(() => {
        setData('booking_item_id', bookingItem.id);
    }, [bookingItem]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('customer.reviews.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-lg bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-700/10">
                                ⭐ Verified Review
                            </span>
                            <span className="text-xs text-slate-400">
                                {booking?.booking_reference || 'Completed Booking'}
                            </span>
                        </div>
                        <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">
                            Rate & Review {supplierName}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                            For service: <strong className="text-slate-700">{bookingItem.item_name}</strong>
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    {/* Star Rating Section */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Overall Rating <span className="text-red-500">*</span>
                        </label>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col items-center justify-center gap-2">
                            <RatingStars
                                rating={data.rating}
                                size="xl"
                                interactive={true}
                                onChange={(val) => setData('rating', val)}
                            />
                            <p className="text-[11px] text-slate-400">
                                Click or tap the stars above to select your rating (1 to 5)
                            </p>
                        </div>
                        {errors.rating && (
                            <p className="mt-1 text-xs font-bold text-red-600">{errors.rating}</p>
                        )}
                    </div>

                    {/* Written Review */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                Written Feedback <span className="text-red-500">*</span>
                            </label>
                            <span className="text-[11px] text-slate-400">
                                {data.comment.length} / 2000 characters
                            </span>
                        </div>
                        <textarea
                            rows={4}
                            value={data.comment}
                            onChange={(e) => setData('comment', e.target.value)}
                            placeholder="Share your experience! How was their professionalism, quality of service, communication, and punctuality during your event?"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                            required
                        />
                        {errors.comment && (
                            <p className="mt-1 text-xs font-bold text-red-600">{errors.comment}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !data.rating || data.comment.trim().length < 3}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                <>
                                    <span>⭐ Submit Review</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
