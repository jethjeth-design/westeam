import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import RatingStars from '@/Components/RatingStars';

export default function Index({
    reviews = {},
    ratingStats = { average: 0, count: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
    counts = { total: 0, approved: 0, pending: 0, rejected: 0 },
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [rating, setRating] = useState(filters.rating || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [searchTimeout, setSearchTimeout] = useState(null);

    const applyFilters = useCallback(
        (newSearch, newRating, newStatus) => {
            router.get(
                route('supplier.reviews.index'),
                { search: newSearch, rating: newRating, status: newStatus },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        },
        []
    );

    const handleSearch = (value) => {
        setSearch(value);
        if (searchTimeout) clearTimeout(searchTimeout);
        const timeout = setTimeout(() => {
            applyFilters(value, rating, status);
        }, 400);
        setSearchTimeout(timeout);
    };

    const handleRating = (value) => {
        setRating(value);
        applyFilters(search, value, status);
    };

    const handleStatus = (value) => {
        setStatus(value);
        applyFilters(search, rating, value);
    };

    const reviewList = reviews?.data || [];
    const paginationLinks = reviews?.links || [];
    const totalCount = ratingStats?.count || 0;
    const averageScore = Number(ratingStats?.average || 0).toFixed(1);
    const distribution = ratingStats?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    const getStatusBadge = (st) => {
        switch (st) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Published
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                        Pending Review
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                        Hidden
                    </span>
                );
            default:
                return null;
        }
    };

    const getCustomerAvatar = (customer) => {
        const pic = customer?.profile_picture;
        if (!pic) return null;
        if (pic.startsWith('http://') || pic.startsWith('https://') || pic.startsWith('/')) {
            return pic;
        }
        return `/storage/${pic}`;
    };

    return (
        <DashboardLayout>
            <Head title="Reviews & Ratings - Supplier Portal" />

            <div className="min-h-screen bg-slate-50/60 p-6 lg:p-10">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                                ⭐ Reputation & Feedback
                            </span>
                            <span className="text-xs text-slate-400">• Supplier Portal</span>
                        </div>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                            Client Reviews & Ratings
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Track client testimonials, verify performance metrics, and build trust with future event organizers.
                        </p>
                    </div>
                </div>

                {/* Top Metrics Cards */}
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Average Rating
                        </span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-amber-500">{averageScore}</span>
                            <span className="text-sm font-bold text-amber-400">/ 5.0</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">Based on published ratings</p>
                    </div>

                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Published Reviews
                        </span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-emerald-600">{counts.approved}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">Visible on public profile</p>
                    </div>

                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            5-Star Reviews
                        </span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-indigo-600">
                                {distribution[5] || 0}
                            </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">Top quality feedback</p>
                    </div>

                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Total Received
                        </span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">{counts.total}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">All submissions</p>
                    </div>
                </div>

                {/* Rating Breakdown Card */}
                <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
                    <div className="grid gap-8 md:grid-cols-12 md:items-center">
                        {/* Score Box */}
                        <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50/70 via-violet-50/40 to-slate-50 p-6 text-center border border-indigo-100/60 md:col-span-4">
                            <span className="text-5xl font-black tracking-tight text-slate-900">
                                {averageScore}
                            </span>
                            <div className="mt-2.5">
                                <RatingStars rating={averageScore} size="lg" />
                            </div>
                            <p className="mt-2 text-xs font-bold text-slate-700">
                                {totalCount} {totalCount === 1 ? 'Published Review' : 'Published Reviews'}
                            </p>
                            <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-[11px] font-bold text-emerald-800">
                                ✓ Verified Event Bookings
                            </span>
                        </div>

                        {/* Star Breakdown Bars */}
                        <div className="space-y-2.5 md:col-span-8">
                            {[5, 4, 3, 2, 1].map((stars) => {
                                const count = distribution[stars] || 0;
                                const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                                const isSelected = rating === String(stars);

                                return (
                                    <button
                                        key={stars}
                                        type="button"
                                        onClick={() => handleRating(isSelected ? 'all' : String(stars))}
                                        className={`w-full flex items-center gap-3 rounded-2xl px-4 py-2 transition text-left ${
                                            isSelected
                                                ? 'bg-indigo-50 ring-2 ring-indigo-500/20'
                                                : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1 w-16 shrink-0 text-xs font-extrabold text-slate-700">
                                            <span>{stars}</span>
                                            <span className="text-amber-400">★</span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>

                                        <div className="flex items-center justify-end gap-2 w-24 shrink-0 text-right text-xs">
                                            <span className="font-bold text-slate-800">{count}</span>
                                            <span className="text-[11px] text-slate-400">({percentage}%)</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                🔍
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search by client name, booked service, or feedback text..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>

                        {/* Rating Dropdown */}
                        <select
                            value={rating}
                            onChange={(e) => handleRating(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white"
                        >
                            <option value="all">All Star Ratings</option>
                            <option value="5">5 Stars ★★★★★</option>
                            <option value="4">4 Stars ★★★★</option>
                            <option value="3">3 Stars ★★★</option>
                            <option value="2">2 Stars ★★</option>
                            <option value="1">1 Star ★</option>
                        </select>

                        {/* Status Dropdown */}
                        <select
                            value={status}
                            onChange={(e) => handleStatus(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white"
                        >
                            <option value="all">All Statuses</option>
                            <option value="approved">Published (Approved)</option>
                            <option value="pending">Pending Moderation</option>
                            <option value="rejected">Hidden / Rejected</option>
                        </select>
                    </div>

                    <span className="shrink-0 text-xs font-bold text-slate-500">
                        {reviews?.total || 0} reviews found
                    </span>
                </div>

                {/* Reviews List */}
                <div className="mt-6 space-y-4">
                    {reviewList.length > 0 ? (
                        reviewList.map((review) => {
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
                                    className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-indigo-200 hover:shadow-md"
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex items-start gap-4">
                                            {/* Avatar */}
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-indigo-100 text-base font-black text-indigo-700 shadow-xs">
                                                {avatar ? (
                                                    <img
                                                        src={avatar}
                                                        alt={customerName}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    customerName.charAt(0).toUpperCase()
                                                )}
                                            </div>

                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-sm font-bold text-slate-900">
                                                        {customerName}
                                                    </h3>
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-700/10">
                                                        ✓ Verified Client
                                                    </span>
                                                    {getStatusBadge(review.status)}
                                                </div>

                                                <p className="mt-0.5 text-xs text-slate-400">
                                                    {review.customer?.email} {reviewDate && `• ${reviewDate}`}
                                                </p>

                                                {/* Booked Item Tag */}
                                                {review.item_name && (
                                                    <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-100">
                                                        <span className="text-slate-400">Booked:</span>
                                                        <span className="font-bold text-slate-900">
                                                            {review.item_name}
                                                        </span>
                                                        {review.item_type && (
                                                            <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-indigo-700">
                                                                {review.item_type}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Rating Stars */}
                                        <div className="flex items-center gap-2 self-start rounded-xl bg-amber-50/80 px-3 py-1.5 border border-amber-100">
                                            <RatingStars rating={review.rating} size="sm" showScore={true} />
                                        </div>
                                    </div>

                                    {/* Review Comment Content */}
                                    <div className="mt-4 rounded-2xl bg-slate-50/50 p-4 border border-slate-100">
                                        <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                                            "{review.comment}"
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        /* Empty state */
                        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
                                ⭐
                            </div>
                            <h3 className="mt-4 text-base font-bold text-slate-900">
                                {counts.total === 0 ? 'No Reviews Received Yet' : 'No Reviews Matching Filter'}
                            </h3>
                            <p className="mt-1 max-w-sm text-xs text-slate-500">
                                {counts.total === 0
                                    ? 'Customer ratings and feedback will appear here once clients complete bookings for your services or packages.'
                                    : 'Try resetting your filters or searching with different keywords.'}
                            </p>
                            {(search || rating !== 'all' || status !== 'all') && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        setRating('all');
                                        setStatus('all');
                                        applyFilters('', 'all', 'all');
                                    }}
                                    className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
                                >
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {paginationLinks.length > 3 && (
                    <div className="mt-8 flex items-center justify-center gap-1.5">
                        {paginationLinks.map((link, idx) => (
                            <button
                                key={idx}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                    link.active
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : link.url
                                        ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                        : 'text-slate-300 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
