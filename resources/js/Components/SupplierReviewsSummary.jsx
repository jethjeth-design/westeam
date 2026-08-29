import { useState, useMemo } from 'react';
import RatingStars from './RatingStars';

export default function SupplierReviewsSummary({
    ratingStats = { average: 0, count: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
    reviews = [],
    title = "Customer Reviews & Ratings",
    subtitle = "Real feedback from couples and event planners who successfully booked services.",
}) {
    const [selectedStarFilter, setSelectedStarFilter] = useState('all');

    const totalCount = ratingStats?.count || reviews.length || 0;
    const averageScore = Number(ratingStats?.average || 0).toFixed(1);
    const distribution = ratingStats?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    const filteredReviews = useMemo(() => {
        if (selectedStarFilter === 'all') return reviews;
        return reviews.filter((r) => Number(r.rating) === Number(selectedStarFilter));
    }, [reviews, selectedStarFilter]);

    const getCustomerAvatar = (customer) => {
        const pic = customer?.profile_picture;
        if (!pic) return null;
        if (pic.startsWith('http://') || pic.startsWith('https://') || pic.startsWith('/')) {
            return pic;
        }
        return `/storage/${pic}`;
    };

    return (
        <div className="space-y-8">
            {/* Header & Overview Card */}
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
                <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900">{title}</h2>
                    {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
                </div>

                <div className="mt-6 grid gap-8 md:grid-cols-12 md:items-center">
                    {/* Score Box */}
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 p-6 text-center border border-amber-100/80 md:col-span-4">
                        <span className="text-5xl font-black tracking-tight text-slate-900">
                            {averageScore}
                        </span>
                        <div className="mt-2">
                            <RatingStars rating={averageScore} size="lg" />
                        </div>
                        <p className="mt-2 text-xs font-bold text-slate-700">
                            {totalCount} {totalCount === 1 ? 'Verified Review' : 'Verified Reviews'}
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            ✓ 100% Verified Bookings
                        </span>
                    </div>

                    {/* Star Breakdown Bars */}
                    <div className="space-y-2.5 md:col-span-8">
                        {[5, 4, 3, 2, 1].map((stars) => {
                            const count = distribution[stars] || 0;
                            const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

                            return (
                                <button
                                    key={stars}
                                    type="button"
                                    onClick={() =>
                                        setSelectedStarFilter(
                                            selectedStarFilter === String(stars) ? 'all' : String(stars)
                                        )
                                    }
                                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-1.5 transition text-left ${
                                        selectedStarFilter === String(stars)
                                            ? 'bg-indigo-50/80 ring-1 ring-indigo-200'
                                            : 'hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-1 w-14 shrink-0 text-xs font-extrabold text-slate-700">
                                        <span>{stars}</span>
                                        <span className="text-amber-400">★</span>
                                    </div>

                                    {/* Bar */}
                                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-amber-400 transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-end gap-2 w-20 shrink-0 text-right text-xs">
                                        <span className="font-bold text-slate-800">{count}</span>
                                        <span className="text-[11px] text-slate-400">({percentage}%)</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Filter Pills */}
            {totalCount > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 mr-2">Filter by:</span>
                    <button
                        type="button"
                        onClick={() => setSelectedStarFilter('all')}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                            selectedStarFilter === 'all'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        All Ratings ({totalCount})
                    </button>
                    {[5, 4, 3, 2, 1].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setSelectedStarFilter(String(star))}
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                                selectedStarFilter === String(star)
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {star} ★ ({distribution[star] || 0})
                        </button>
                    ))}
                </div>
            )}

            {/* Reviews Feed */}
            {filteredReviews.length > 0 ? (
                <div className="space-y-4">
                    {filteredReviews.map((review) => {
                        const avatar = getCustomerAvatar(review.customer);
                        const customerName = review.customer?.name || 'Verified Client';
                        const reviewDate = review.created_at
                            ? new Date(review.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                              })
                            : null;

                        return (
                            <div
                                key={review.id}
                                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-slate-300"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center shadow-xs">
                                            {avatar ? (
                                                <img src={avatar} alt={customerName} className="h-full w-full object-cover" />
                                            ) : (
                                                customerName.charAt(0).toUpperCase()
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-bold text-slate-900">{customerName}</h4>
                                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-700/10">
                                                    ✓ Verified Customer
                                                </span>
                                            </div>
                                            {reviewDate && (
                                                <p className="text-[11px] text-slate-400">{reviewDate}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <RatingStars rating={review.rating} size="sm" />
                                    </div>
                                </div>

                                {/* Booked Item Badge */}
                                {review.item_name && (
                                    <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600 border border-slate-100">
                                        <span className="text-slate-400">Booked:</span>
                                        <span className="font-bold text-slate-800">{review.item_name}</span>
                                        {review.item_type && (
                                            <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-indigo-700">
                                                {review.item_type}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Comment Content */}
                                <p className="mt-3 text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                                    {review.comment}
                                </p>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Empty state */
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
                        ⭐
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-900">
                        {totalCount === 0 ? 'No Reviews Yet' : 'No Reviews Matching Filter'}
                    </h3>
                    <p className="mt-1 max-w-sm text-xs text-slate-500">
                        {totalCount === 0
                            ? 'Verified customer ratings and reviews will appear here once clients complete bookings with this supplier.'
                            : 'Try selecting a different star filter to view other feedback.'}
                    </p>
                    {selectedStarFilter !== 'all' && (
                        <button
                            type="button"
                            onClick={() => setSelectedStarFilter('all')}
                            className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
