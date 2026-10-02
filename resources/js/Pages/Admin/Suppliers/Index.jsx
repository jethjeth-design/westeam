import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({
    suppliers,
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    // Modal states
    const [showViewModal, setShowViewModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    const searchSuppliers = (e) => {
        e.preventDefault();

        router.get(
            route('admin.suppliers.index'),
            {
                search,
                status,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | View Supplier
    |--------------------------------------------------------------------------
    */

    const openViewModal = (supplier) => {
        setSelectedSupplier(supplier);
        setShowViewModal(true);
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedSupplier(null);
    };

    /*
    |--------------------------------------------------------------------------
    | Approve Supplier
    |--------------------------------------------------------------------------
    */

    const openApproveModal = (supplier) => {
        setSelectedSupplier(supplier);
        setShowApproveModal(true);
    };

    const closeApproveModal = () => {
        setShowApproveModal(false);
        setSelectedSupplier(null);
    };

    const approveSupplier = () => {
        if (!selectedSupplier) return;

        setProcessing(true);

        router.post(
            route(
                'admin.suppliers.approve',
                selectedSupplier.id
            ),
            {},
            {
                preserveScroll: true,

                onSuccess: () => {
                    setShowApproveModal(false);
                    setSelectedSupplier(null);
                },

                onFinish: () => {
                    setProcessing(false);
                },
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Reject Supplier
    |--------------------------------------------------------------------------
    */

    const openRejectModal = (supplier) => {
        setSelectedSupplier(supplier);
        setRejectionReason('');
        setShowRejectModal(true);
    };

    const closeRejectModal = () => {
        setShowRejectModal(false);
        setSelectedSupplier(null);
        setRejectionReason('');
    };

    const rejectSupplier = (e) => {
        e.preventDefault();

        if (!selectedSupplier) return;

        setProcessing(true);

        router.post(
            route(
                'admin.suppliers.reject',
                selectedSupplier.id
            ),
            {
                rejection_reason: rejectionReason,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setShowRejectModal(false);
                    setSelectedSupplier(null);
                    setRejectionReason('');
                },

                onFinish: () => {
                    setProcessing(false);
                },
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Status Badge
    |--------------------------------------------------------------------------
    */

    const statusBadge = (supplierStatus) => {
        const styles = {
            pending:
                'bg-yellow-100 text-yellow-700',
            approved:
                'bg-green-100 text-green-700',
            rejected:
                'bg-red-100 text-red-700',
        };

        return (
            <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    styles[supplierStatus] ||
                    'bg-champagne text-warmgray'
                }`}
            >
                {supplierStatus
                    ?.charAt(0)
                    .toUpperCase() +
                    supplierStatus?.slice(1)}
            </span>
        );
    };

    return (
        <DashboardLayout>
            <Head title="Suppliers" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <div>
                    <h1 className="text-2xl font-bold text-softcharcoal">
                        Suppliers
                    </h1>

                    <p className="mt-1 text-sm text-warmgray">
                        Review and manage supplier applications.
                    </p>
                </div>


                {/* =====================================================
                    SEARCH + FILTER
                ====================================================== */}

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">

                    <form
                        onSubmit={searchSuppliers}
                        className="flex flex-col gap-3 md:flex-row"
                    >

                        <div className="flex-1">

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search suppliers..."
                                className="w-full rounded-xl border-warmbeige
                                           focus:border-champagnegold
                                           focus:ring-champagnegold"
                            />

                        </div>


                        <select
                            value={status}
                            onChange={(e) => {
                                const value = e.target.value;

                                setStatus(value);

                                router.get(
                                    route(
                                        'admin.suppliers.index'
                                    ),
                                    {
                                        search,
                                        status: value,
                                    },
                                    {
                                        preserveState: true,
                                        replace: true,
                                    }
                                );
                            }}
                            className="rounded-xl border-warmbeige
                                       focus:border-champagnegold
                                       focus:ring-champagnegold"
                        >
                            <option value="all">
                                All Suppliers
                            </option>

                            <option value="pending">
                                Pending
                            </option>

                            <option value="approved">
                                Approved
                            </option>

                            <option value="rejected">
                                Rejected
                            </option>
                        </select>


                        <button
                            type="submit"
                            className="rounded-xl bg-champagnegold
                                       px-5 py-2.5 font-semibold
                                       text-white transition
                                       hover:bg-darkgold"
                        >
                            Search
                        </button>

                    </form>

                </div>


                {/* =====================================================
                    SUPPLIER TABLE
                ====================================================== */}

                <div className="overflow-hidden rounded-2xl bg-white
                                shadow-sm ring-1 ring-gray-200">

                    <div className="overflow-x-auto">

                        <table className="min-w-full">

                            <thead className="border-b bg-ivory">

                                <tr>

                                    <th className="px-6 py-4 text-left
                                                   text-xs font-semibold
                                                   uppercase text-warmgray">
                                        Supplier
                                    </th>

                                    <th className="px-6 py-4 text-left
                                                   text-xs font-semibold
                                                   uppercase text-warmgray">
                                        Category
                                    </th>

                                    <th className="px-6 py-4 text-left
                                                   text-xs font-semibold
                                                   uppercase text-warmgray">
                                        Status
                                    </th>

                                    <th className="px-6 py-4 text-right
                                                   text-xs font-semibold
                                                   uppercase text-warmgray">
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-champagne">

                                {suppliers?.data?.length > 0 ? (

                                    suppliers.data.map(
                                        (supplier) => (

                                            <tr
                                                key={supplier.id}
                                                className="transition hover:bg-ivory"
                                            >

                                                {/* Supplier */}

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="h-11 w-11
                                                                        overflow-hidden
                                                                        rounded-full
                                                                        bg-champagne">

                                                            {supplier.profile_picture ? (

                                                                <img
                                                                    src={`/storage/${supplier.profile_picture}`}
                                                                    alt={
                                                                        supplier.business_name ||
                                                                        supplier.user?.name
                                                                    }
                                                                    className="h-full w-full object-cover"
                                                                />

                                                            ) : (

                                                                <div className="flex h-full
                                                                                items-center
                                                                                justify-center
                                                                                text-lg">
                                                                    👤
                                                                </div>

                                                            )}

                                                        </div>


                                                        <div>

                                                            <p className="font-semibold text-softcharcoal">
                                                                {supplier.business_name ||
                                                                    supplier.user?.name}
                                                            </p>

                                                            <p className="text-sm text-warmgray">
                                                                {supplier.user?.email}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* Categories */}

                                                <td className="px-6 py-4">

                                                    <div className="flex flex-wrap gap-1">

                                                        {supplier.categories?.length > 0 ? (

                                                            supplier.categories.map(
                                                                (category) => (

                                                                    <span
                                                                        key={category.id}
                                                                        className="rounded-lg
                                                                                   bg-champagne
                                                                                   px-2 py-1
                                                                                   text-xs
                                                                                   font-medium
                                                                                   text-darkgold"
                                                                    >
                                                                        {category.name}
                                                                    </span>

                                                                )
                                                            )

                                                        ) : (

                                                            <span className="text-sm text-gray-400">
                                                                No category
                                                            </span>

                                                        )}

                                                    </div>

                                                </td>


                                                {/* Status */}

                                                <td className="px-6 py-4">

                                                    {statusBadge(
                                                        supplier.status
                                                    )}

                                                </td>


                                                {/* Actions */}

                                                <td className="px-6 py-4">

                                                    <div className="flex justify-end gap-2">

                                                        {/* VIEW */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openViewModal(
                                                                    supplier
                                                                )
                                                            }
                                                            className="rounded-lg
                                                                       border
                                                                       border-warmbeige
                                                                       px-3 py-2
                                                                       text-sm
                                                                       font-medium
                                                                       text-softcharcoal
                                                                       transition
                                                                       hover:bg-ivory"
                                                        >
                                                            View
                                                        </button>


                                                        {/* APPROVE */}

                                                        {supplier.status === 'pending' && (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openApproveModal(
                                                                        supplier
                                                                    )
                                                                }
                                                                className="rounded-lg
                                                                           bg-green-600
                                                                           px-3 py-2
                                                                           text-sm
                                                                           font-semibold
                                                                           text-white
                                                                           transition
                                                                           hover:bg-green-700"
                                                            >
                                                                Approve
                                                            </button>

                                                        )}


                                                        {/* REJECT */}

                                                        {supplier.status === 'pending' && (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openRejectModal(
                                                                        supplier
                                                                    )
                                                                }
                                                                className="rounded-lg
                                                                           bg-red-600
                                                                           px-3 py-2
                                                                           text-sm
                                                                           font-semibold
                                                                           text-white
                                                                           transition
                                                                           hover:bg-red-700"
                                                            >
                                                                Reject
                                                            </button>

                                                        )}

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )

                                ) : (

                                    <tr>

                                        <td
                                            colSpan="4"
                                            className="px-6 py-12 text-center
                                                       text-warmgray"
                                        >
                                            No suppliers found.
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>


                {/* =====================================================
                    PAGINATION
                ====================================================== */}

                {suppliers?.links && (

                    <div className="flex flex-wrap gap-2">

                        {suppliers.links.map(
                            (link, index) => (

                                <button
                                    key={index}
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url &&
                                        router.get(
                                            link.url,
                                            {},
                                            {
                                                preserveState: true,
                                            }
                                        )
                                    }
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    className={`rounded-lg px-3 py-2 text-sm ${
                                        link.active
                                            ? 'bg-champagnegold text-white'
                                            : 'bg-white text-softcharcoal ring-1 ring-gray-200'
                                    } ${
                                        !link.url
                                            ? 'cursor-not-allowed opacity-50'
                                            : 'hover:bg-ivory'
                                    }`}
                                />

                            )
                        )}

                    </div>

                )}


                {/* =====================================================
                    VIEW SUPPLIER MODAL
                ====================================================== */}

                {showViewModal && selectedSupplier && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ backgroundColor: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)' }}
                        onClick={closeViewModal}
                    >
                        <div
                            className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
                            style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Cover + Avatar Hero */}
                            <div className="relative h-40 w-full shrink-0 bg-gradient-to-r from-champagnegold via-purple-600 to-pink-600">
                                {selectedSupplier.cover_photo && (
                                    <img
                                        src={`/storage/${selectedSupplier.cover_photo}`}
                                        alt="Cover"
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                                {/* Close button */}
                                <button
                                    type="button"
                                    onClick={closeViewModal}
                                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/40"
                                >
                                    ✕
                                </button>

                                {/* Status badge */}
                                <div className="absolute left-4 top-4">
                                    {statusBadge(selectedSupplier.status)}
                                </div>

                                {/* Avatar overlapping cover */}
                                <div className="absolute -bottom-12 left-6 h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-champagne shadow-xl">
                                    {selectedSupplier.profile_picture ? (
                                        <img
                                            src={`/storage/${selectedSupplier.profile_picture}`}
                                            alt={selectedSupplier.business_name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-3xl">👤</div>
                                    )}
                                </div>
                            </div>

                            {/* Scrollable body */}
                            <div className="overflow-y-auto flex-1 px-6 pb-6" style={{ paddingTop: '3.5rem' }}>

                                {/* Name + email */}
                                <div>
                                    <h2 className="text-xl font-black text-softcharcoal">
                                        {selectedSupplier.business_name || selectedSupplier.user?.name}
                                    </h2>
                                    <p className="mt-0.5 text-sm text-warmgray">{selectedSupplier.user?.email}</p>
                                    {selectedSupplier.user?.name && selectedSupplier.business_name && (
                                        <p className="mt-0.5 text-xs text-warmgray">Account: {selectedSupplier.user.name}</p>
                                    )}
                                </div>

                                {/* Info grid */}
                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    <div className="flex items-start gap-3 rounded-2xl border border-champagne bg-ivory p-4">
                                        <span className="mt-0.5 text-lg">📞</span>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-warmgray">Contact Number</p>
                                            <p className="mt-0.5 text-sm font-semibold text-softcharcoal">
                                                {selectedSupplier.contact_number || <span className="font-normal text-warmgray">Not provided</span>}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 rounded-2xl border border-champagne bg-ivory p-4">
                                        <span className="mt-0.5 text-lg">📍</span>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-warmgray">Address</p>
                                            <p className="mt-0.5 text-sm font-semibold text-softcharcoal">
                                                {selectedSupplier.address || <span className="font-normal text-warmgray">Not provided</span>}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 rounded-2xl border border-champagne bg-ivory p-4">
                                        <span className="mt-0.5 text-lg">⏳</span>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-warmgray">Experience</p>
                                            <p className="mt-0.5 text-sm font-semibold text-softcharcoal">
                                                {selectedSupplier.years_of_experience
                                                    ? `${selectedSupplier.years_of_experience} Years`
                                                    : <span className="font-normal text-warmgray">Not specified</span>}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 rounded-2xl border border-champagne bg-ivory p-4">
                                        <span className="mt-0.5 text-lg">🔗</span>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-warmgray">Facebook Page</p>
                                            {selectedSupplier.facebook_page || selectedSupplier.facebook_url ? (
                                                <a
                                                    href={(selectedSupplier.facebook_page || selectedSupplier.facebook_url).startsWith('http')
                                                        ? (selectedSupplier.facebook_page || selectedSupplier.facebook_url)
                                                        : `https://${selectedSupplier.facebook_page || selectedSupplier.facebook_url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-0.5 block truncate text-sm font-semibold text-blue-600 hover:underline"
                                                >
                                                    {selectedSupplier.facebook_page || selectedSupplier.facebook_url}
                                                </a>
                                            ) : (
                                                <p className="mt-0.5 text-sm text-warmgray">Not provided</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Categories */}
                                {selectedSupplier.categories?.length > 0 && (
                                    <div className="mt-5">
                                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-warmgray">Supplier Categories</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSupplier.categories.map((cat) => (
                                                <span
                                                    key={cat.id}
                                                    className="rounded-xl bg-champagne px-3 py-1.5 text-xs font-bold text-darkgold ring-1 ring-inset ring-indigo-200"
                                                >
                                                    {cat.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}



                                {/* Description */}
                                {selectedSupplier.description && (
                                    <div className="mt-5">
                                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-warmgray">About</p>
                                        <div className="rounded-2xl border border-champagne bg-ivory p-4">
                                            <p className="whitespace-pre-line text-sm leading-relaxed text-softcharcoal">
                                                {selectedSupplier.description}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex shrink-0 items-center justify-between border-t border-champagne bg-ivory px-6 py-4">
                                <button
                                    type="button"
                                    onClick={closeViewModal}
                                    className="rounded-xl border border-warmbeige bg-white px-4 py-2.5 text-xs font-bold text-softcharcoal shadow-xs transition hover:bg-ivory"
                                >
                                    Close
                                </button>

                                {selectedSupplier.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => { closeViewModal(); openRejectModal(selectedSupplier); }}
                                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-600 hover:text-white"
                                        >
                                            ✕ Reject
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { closeViewModal(); openApproveModal(selectedSupplier); }}
                                            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
                                        >
                                            ✓ Approve Supplier
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}


                {/* =====================================================
                    APPROVE MODAL
                ====================================================== */}

                {showApproveModal && selectedSupplier && (
                    <div
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                        style={{ backgroundColor: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(8px)' }}
                        onClick={closeApproveModal}
                    >
                        <div
                            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Green gradient header */}
                            <div className="bg-gradient-to-br from-emerald-500 to-green-600 px-6 py-8 text-center text-white">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl shadow-inner backdrop-blur-sm">
                                    ✓
                                </div>
                                <h2 className="text-xl font-black">Approve Supplier?</h2>
                                <p className="mt-1 text-sm text-emerald-100">
                                    This action will make the supplier visible to customers.
                                </p>
                            </div>

                            <div className="p-6">
                                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-center">
                                    <p className="text-sm text-softcharcoal">
                                        You are approving{' '}
                                        <span className="font-black text-softcharcoal">
                                            {selectedSupplier.business_name || selectedSupplier.user?.name}
                                        </span>
                                        . They will be able to receive bookings from customers immediately.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 border-t border-champagne bg-ivory px-6 py-4">
                                <button
                                    type="button"
                                    onClick={closeApproveModal}
                                    disabled={processing}
                                    className="flex-1 rounded-xl border border-warmbeige bg-white py-2.5 text-xs font-bold text-softcharcoal transition hover:bg-ivory disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={approveSupplier}
                                    disabled={processing}
                                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? '⏳ Approving...' : '✓ Yes, Approve'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {/* =====================================================
                    REJECT MODAL
                ====================================================== */}

                {showRejectModal && selectedSupplier && (
                    <div
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                        style={{ backgroundColor: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(8px)' }}
                        onClick={closeRejectModal}
                    >
                        <div
                            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <form onSubmit={rejectSupplier}>
                                {/* Red gradient header */}
                                <div className="bg-gradient-to-br from-red-500 to-rose-600 px-6 py-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl backdrop-blur-sm">
                                                ✕
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-black">Reject Supplier</h2>
                                                <p className="text-xs text-red-100">Provide a reason for rejection</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={closeRejectModal}
                                            disabled={processing}
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/40"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    {/* Who is being rejected */}
                                    <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
                                        <div className="h-10 w-10 overflow-hidden rounded-xl bg-red-100 shrink-0">
                                            {selectedSupplier.profile_picture ? (
                                                <img src={`/storage/${selectedSupplier.profile_picture}`} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-lg">👤</div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wide text-red-500">Rejecting</p>
                                            <p className="text-sm font-black text-softcharcoal">
                                                {selectedSupplier.business_name || selectedSupplier.user?.name}
                                            </p>
                                            <p className="text-xs text-warmgray">{selectedSupplier.user?.email}</p>
                                        </div>
                                    </div>

                                    {/* Rejection reason */}
                                    <div>
                                        <label
                                            htmlFor="rejection_reason"
                                            className="mb-2 block text-xs font-bold uppercase tracking-wide text-softcharcoal"
                                        >
                                            Rejection Reason
                                            <span className="ml-1 font-normal normal-case text-warmgray">(optional)</span>
                                        </label>
                                        <textarea
                                            id="rejection_reason"
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            rows="4"
                                            placeholder="Explain why this supplier application is being rejected so they can correct it..."
                                            className="w-full rounded-xl border-warmbeige text-sm focus:border-red-400 focus:ring-red-400"
                                        />
                                        <p className="mt-1.5 text-xs text-warmgray">
                                            💡 This reason may be shown to the supplier so they know what to correct.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3 border-t border-champagne bg-ivory px-6 py-4">
                                    <button
                                        type="button"
                                        onClick={closeRejectModal}
                                        disabled={processing}
                                        className="flex-1 rounded-xl border border-warmbeige bg-white py-2.5 text-xs font-bold text-softcharcoal transition hover:bg-ivory disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {processing ? '⏳ Rejecting...' : '✕ Reject Supplier'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
}