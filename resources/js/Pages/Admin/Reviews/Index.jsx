import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import RatingStars from '@/Components/RatingStars';

export default function Index({
    reviews = {},
    stats = { total: 0, approved: 0, pending: 0, rejected: 0, average_rating: 0 },
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [rating, setRating] = useState(filters.rating || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [deleteModalReview, setDeleteModalReview] = useState(null);

    const applyFilters = useCallback(
        (newSearch, newRating, newStatus) => {
            router.get(
                route('admin.reviews.index'),
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

    const handleApprove = (reviewId) => {
        router.post(route('admin.reviews.approve', reviewId), {}, { preserveScroll: true });
    };

    const handleReject = (reviewId) => {
        router.post(route('admin.reviews.reject', reviewId), {}, { preserveScroll: true });
    };

    const handleDelete = () => {
        if (!deleteModalReview) return;
        router.delete(route('admin.reviews.destroy', deleteModalReview.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteModalReview(null),
        });
    };

    const reviewList = reviews?.data || [];
    const paginationLinks = reviews?.links || [];

    const getStatusBadge = (st) => {
        switch (st) {
            case 'approved':
                return (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        ✓ Approved
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        ⏳ Pending
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/20">
                        ✕ Rejected
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <DashboardLayout>
            <Head title="Review Moderation - Admin" />

            <div className="min-h-screen bg-slate-50/60 p-6 lg:p-10">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                                🛡️ Admin Portal
                            </span>
                            <span className="text-xs text-slate-400">• Reviews & Trust</span>
                        </div>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                            Reviews & Ratings Moderation
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Monitor customer ratings, verify genuine feedback, and moderate reviews across all suppliers.
                        </p>
                    </div>
                </div>

                {/* Metrics Stats */}
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Total Reviews
                        </span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Approved
                        </span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-emerald-600">{stats.approved}</span>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            System Avg Rating
                        </span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-amber-500">
                                {Number(stats.average_rating || 0).toFixed(1)} ★
                            </span>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Rejected / Hidden
                        </span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-red-600">{stats.rejected}</span>
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
                                placeholder="Search by customer, supplier, service name, or feedback text..."
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
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <span className="shrink-0 text-xs font-bold text-slate-500">
                        {reviews?.total || 0} reviews found
                    </span>
                </div>

                {/* Table */}
                <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Supplier</th>
                                    <th className="px-6 py-4">Booked Item</th>
                                    <th className="px-6 py-4">Rating</th>
                                    <th className="px-6 py-4">Review & Comment</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {reviewList.length > 0 ? (
                                    reviewList.map((review) => (
                                        <tr key={review.id} className="transition hover:bg-slate-50/60">
                                            {/* Customer */}
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">
                                                    {review.customer?.name || 'Customer'}
                                                </div>
                                                <div className="text-[11px] text-slate-400">
                                                    {review.customer?.email}
                                                </div>
                                            </td>

                                            {/* Supplier */}
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">
                                                    {review.supplier?.supplier_profile?.business_name ||
                                                        review.supplier?.name ||
                                                        'Supplier'}
                                                </div>
                                                <div className="text-[11px] text-slate-400">
                                                    {review.supplier?.email}
                                                </div>
                                            </td>

                                            {/* Booked Item */}
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">
                                                    {review.item_name}
                                                </div>
                                                {review.item_type && (
                                                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                                                        {review.item_type}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Rating */}
                                            <td className="px-6 py-4">
                                                <RatingStars rating={review.rating} size="xs" showScore={true} />
                                            </td>

                                            {/* Comment */}
                                            <td className="px-6 py-4 max-w-xs">
                                                <p className="line-clamp-2 text-slate-700 leading-relaxed">
                                                    {review.comment}
                                                </p>
                                                <span className="mt-1 block text-[10px] text-slate-400">
                                                    {new Date(review.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(review.status)}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {review.status !== 'approved' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleApprove(review.id)}
                                                            className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition"
                                                            title="Approve Review"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}

                                                    {review.status !== 'rejected' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReject(review.id)}
                                                            className="rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 hover:bg-amber-100 transition"
                                                            title="Reject / Hide Review"
                                                        >
                                                            Hide
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteModalReview(review)}
                                                        className="rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100 transition"
                                                        title="Delete Permanently"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-12 text-center text-slate-400">
                                            No reviews found matching the selected filter criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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

            {/* Delete Confirmation Modal */}
            {deleteModalReview && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
                    onClick={() => setDeleteModalReview(null)}
                >
                    <div
                        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-2xl text-red-600">
                            🗑️
                        </div>
                        <h3 className="mt-4 text-lg font-black text-slate-900">
                            Permanently Delete Review?
                        </h3>
                        <p className="mt-2 text-xs text-slate-500">
                            Are you sure you want to delete the review by{' '}
                            <strong>{deleteModalReview.customer?.name}</strong> for{' '}
                            <strong>{deleteModalReview.item_name}</strong>? This action cannot be undone.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteModalReview(null)}
                                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
                            >
                                Yes, Delete Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
