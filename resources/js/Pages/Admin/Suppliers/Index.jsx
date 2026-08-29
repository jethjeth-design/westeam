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
                    'bg-gray-100 text-gray-600'
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

            <div className="space-y-6">

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Suppliers
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
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
                                className="w-full rounded-xl border-gray-300
                                           focus:border-indigo-500
                                           focus:ring-indigo-500"
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
                            className="rounded-xl border-gray-300
                                       focus:border-indigo-500
                                       focus:ring-indigo-500"
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
                            className="rounded-xl bg-indigo-600
                                       px-5 py-2.5 font-semibold
                                       text-white transition
                                       hover:bg-indigo-700"
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

                            <thead className="border-b bg-gray-50">

                                <tr>

                                    <th className="px-6 py-4 text-left
                                                   text-xs font-semibold
                                                   uppercase text-gray-500">
                                        Supplier
                                    </th>

                                    <th className="px-6 py-4 text-left
                                                   text-xs font-semibold
                                                   uppercase text-gray-500">
                                        Category
                                    </th>

                                    <th className="px-6 py-4 text-left
                                                   text-xs font-semibold
                                                   uppercase text-gray-500">
                                        Status
                                    </th>

                                    <th className="px-6 py-4 text-right
                                                   text-xs font-semibold
                                                   uppercase text-gray-500">
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-gray-100">

                                {suppliers?.data?.length > 0 ? (

                                    suppliers.data.map(
                                        (supplier) => (

                                            <tr
                                                key={supplier.id}
                                                className="transition hover:bg-gray-50"
                                            >

                                                {/* Supplier */}

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="h-11 w-11
                                                                        overflow-hidden
                                                                        rounded-full
                                                                        bg-gray-100">

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

                                                            <p className="font-semibold text-gray-900">
                                                                {supplier.business_name ||
                                                                    supplier.user?.name}
                                                            </p>

                                                            <p className="text-sm text-gray-500">
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
                                                                                   bg-indigo-50
                                                                                   px-2 py-1
                                                                                   text-xs
                                                                                   font-medium
                                                                                   text-indigo-700"
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
                                                                       border-gray-200
                                                                       px-3 py-2
                                                                       text-sm
                                                                       font-medium
                                                                       text-gray-700
                                                                       transition
                                                                       hover:bg-gray-50"
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
                                                       text-gray-500"
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
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white text-gray-700 ring-1 ring-gray-200'
                                    } ${
                                        !link.url
                                            ? 'cursor-not-allowed opacity-50'
                                            : 'hover:bg-gray-50'
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

                    <div className="fixed inset-0 z-50 flex items-center
                                    justify-center bg-black/50 p-4">

                        <div
                            className="w-full max-w-2xl overflow-hidden
                                       rounded-2xl bg-white shadow-2xl"
                        >

                            {/* Modal Header */}

                            <div className="flex items-center justify-between
                                            border-b px-6 py-4">

                                <div>

                                    <h2 className="text-lg font-bold text-gray-900">
                                        Supplier Details
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Review supplier information
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={closeViewModal}
                                    className="rounded-lg p-2 text-gray-400
                                               hover:bg-gray-100 hover:text-gray-600"
                                >
                                    ✕
                                </button>

                            </div>


                            {/* Modal Body */}

                            <div className="max-h-[70vh] overflow-y-auto p-6">

                                {/* Profile */}

                                <div className="flex flex-col items-center
                                                gap-4 sm:flex-row">

                                    <div className="h-24 w-24 overflow-hidden
                                                    rounded-2xl bg-gray-100">

                                        {selectedSupplier.profile_picture ? (

                                            <img
                                                src={`/storage/${selectedSupplier.profile_picture}`}
                                                alt={
                                                    selectedSupplier.business_name
                                                }
                                                className="h-full w-full object-cover"
                                            />

                                        ) : (

                                            <div className="flex h-full
                                                            items-center
                                                            justify-center
                                                            text-3xl">
                                                👤
                                            </div>

                                        )}

                                    </div>


                                    <div className="text-center sm:text-left">

                                        <h3 className="text-xl font-bold text-gray-900">
                                            {selectedSupplier.business_name ||
                                                selectedSupplier.user?.name}
                                        </h3>

                                        <p className="text-sm text-gray-500">
                                            {selectedSupplier.user?.email}
                                        </p>

                                        <div className="mt-2">
                                            {statusBadge(
                                                selectedSupplier.status
                                            )}
                                        </div>

                                    </div>

                                </div>


                                {/* Information */}

                                <div className="mt-6 grid gap-4 sm:grid-cols-2">

                                    <div className="rounded-xl bg-gray-50 p-4">

                                        <p className="text-xs font-semibold
                                                      uppercase text-gray-400">
                                            Contact Number
                                        </p>

                                        <p className="mt-1 text-sm font-medium
                                                      text-gray-800">
                                            {selectedSupplier.contact_number ||
                                                'Not provided'}
                                        </p>

                                    </div>


                                    <div className="rounded-xl bg-gray-50 p-4">

                                        <p className="text-xs font-semibold
                                                      uppercase text-gray-400">
                                            Address
                                        </p>

                                        <p className="mt-1 text-sm font-medium
                                                      text-gray-800">
                                            {selectedSupplier.address ||
                                                'Not provided'}
                                        </p>

                                    </div>

                                    <div className="rounded-xl bg-gray-50 p-4">

                                        <p className="text-xs font-semibold
                                                      uppercase text-gray-400">
                                            Years of Experience
                                        </p>

                                        <p className="mt-1 text-sm font-medium
                                                      text-gray-800">
                                            {selectedSupplier.years_of_experience
                                                ? `${selectedSupplier.years_of_experience} Years`
                                                : 'Not specified'}
                                        </p>

                                    </div>

                                    <div className="rounded-xl bg-gray-50 p-4">

                                        <p className="text-xs font-semibold
                                                      uppercase text-gray-400">
                                            Facebook Page / URL
                                        </p>

                                        {selectedSupplier.facebook_page || selectedSupplier.facebook_url ? (
                                            <a
                                                href={(selectedSupplier.facebook_page || selectedSupplier.facebook_url).startsWith('http')
                                                    ? (selectedSupplier.facebook_page || selectedSupplier.facebook_url)
                                                    : `https://${selectedSupplier.facebook_page || selectedSupplier.facebook_url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-1 text-sm font-medium text-blue-600 hover:underline truncate block"
                                            >
                                                {selectedSupplier.facebook_page || selectedSupplier.facebook_url}
                                            </a>
                                        ) : (
                                            <p className="mt-1 text-sm font-medium text-gray-800">
                                                Not provided
                                            </p>
                                        )}

                                    </div>

                                </div>

                                {/* Cover Photo Preview */}
                                {selectedSupplier.cover_photo && (
                                    <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                                        <p className="bg-gray-50 px-3 py-1.5 text-xs font-semibold uppercase text-gray-500">
                                            Cover Photo
                                        </p>
                                        <img
                                            src={`/storage/${selectedSupplier.cover_photo}`}
                                            alt="Supplier Cover"
                                            className="h-36 w-full object-cover"
                                        />
                                    </div>
                                )}


                                {/* Categories */}

                                <div className="mt-5">

                                    <p className="mb-2 text-sm font-semibold
                                                  text-gray-700">
                                        Supplier Categories
                                    </p>

                                    <div className="flex flex-wrap gap-2">

                                        {selectedSupplier.categories?.length > 0 ? (

                                            selectedSupplier.categories.map(
                                                (category) => (

                                                    <span
                                                        key={category.id}
                                                        className="rounded-lg
                                                                   bg-indigo-50
                                                                   px-3 py-1.5
                                                                   text-sm
                                                                   font-medium
                                                                   text-indigo-700"
                                                    >
                                                        {category.name}
                                                    </span>

                                                )
                                            )

                                        ) : (

                                            <span className="text-sm text-gray-400">
                                                No categories selected.
                                            </span>

                                        )}

                                    </div>

                                </div>


                                {/* Description */}

                                <div className="mt-5">

                                    <p className="mb-2 text-sm font-semibold
                                                  text-gray-700">
                                        Description
                                    </p>

                                    <div className="rounded-xl bg-gray-50 p-4">

                                        <p className="whitespace-pre-line
                                                      text-sm text-gray-600">
                                            {selectedSupplier.description ||
                                                'No description provided.'}
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* Modal Footer */}

                            <div className="flex justify-end gap-2
                                            border-t bg-gray-50 px-6 py-4">

                                <button
                                    type="button"
                                    onClick={closeViewModal}
                                    className="rounded-xl border
                                               border-gray-200 bg-white
                                               px-4 py-2.5 text-sm
                                               font-semibold text-gray-700
                                               hover:bg-gray-50"
                                >
                                    Close
                                </button>


                                {selectedSupplier.status === 'pending' && (

                                    <>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                closeViewModal();
                                                openApproveModal(
                                                    selectedSupplier
                                                );
                                            }}
                                            className="rounded-xl bg-green-600
                                                       px-4 py-2.5 text-sm
                                                       font-semibold text-white
                                                       hover:bg-green-700"
                                        >
                                            Approve Supplier
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                closeViewModal();
                                                openRejectModal(
                                                    selectedSupplier
                                                );
                                            }}
                                            className="rounded-xl bg-red-600
                                                       px-4 py-2.5 text-sm
                                                       font-semibold text-white
                                                       hover:bg-red-700"
                                        >
                                            Reject Supplier
                                        </button>
                                    </>

                                )}

                            </div>

                        </div>

                    </div>

                )}


                {/* =====================================================
                    APPROVE MODAL
                ====================================================== */}

                {showApproveModal && selectedSupplier && (

                    <div className="fixed inset-0 z-[60] flex items-center
                                    justify-center bg-black/50 p-4">

                        <div className="w-full max-w-md rounded-2xl
                                        bg-white shadow-2xl">

                            <div className="p-6">

                                <div className="mx-auto flex h-14 w-14
                                                items-center justify-center
                                                rounded-full bg-green-100
                                                text-2xl">
                                    ✓
                                </div>


                                <div className="mt-4 text-center">

                                    <h2 className="text-xl font-bold text-gray-900">
                                        Approve Supplier?
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-gray-500">

                                        Are you sure you want to approve{' '}

                                        <span className="font-semibold text-gray-800">
                                            {selectedSupplier.business_name ||
                                                selectedSupplier.user?.name}
                                        </span>
                                        ?

                                        <br />

                                        This supplier will become visible
                                        to customers and can receive bookings.

                                    </p>

                                </div>

                            </div>


                            <div className="flex justify-end gap-3
                                            border-t bg-gray-50 px-6 py-4">

                                <button
                                    type="button"
                                    onClick={closeApproveModal}
                                    disabled={processing}
                                    className="rounded-xl border
                                               border-gray-200 bg-white
                                               px-4 py-2.5 text-sm
                                               font-semibold text-gray-700
                                               hover:bg-gray-50
                                               disabled:opacity-50"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="button"
                                    onClick={approveSupplier}
                                    disabled={processing}
                                    className="rounded-xl bg-green-600
                                               px-4 py-2.5 text-sm
                                               font-semibold text-white
                                               hover:bg-green-700
                                               disabled:cursor-not-allowed
                                               disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Approving...'
                                        : 'Yes, Approve'}
                                </button>

                            </div>

                        </div>

                    </div>

                )}


                {/* =====================================================
                    REJECT MODAL
                ====================================================== */}

                {showRejectModal && selectedSupplier && (

                    <div className="fixed inset-0 z-[60] flex items-center
                                    justify-center bg-black/50 p-4">

                        <div className="w-full max-w-lg rounded-2xl
                                        bg-white shadow-2xl">

                            <form onSubmit={rejectSupplier}>

                                {/* Header */}

                                <div className="flex items-center
                                                justify-between border-b
                                                px-6 py-4">

                                    <div>

                                        <h2 className="text-lg font-bold text-gray-900">
                                            Reject Supplier
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            Provide a reason for rejection.
                                        </p>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={closeRejectModal}
                                        disabled={processing}
                                        className="rounded-lg p-2 text-gray-400
                                                   hover:bg-gray-100
                                                   hover:text-gray-600"
                                    >
                                        ✕
                                    </button>

                                </div>


                                {/* Body */}

                                <div className="p-6">

                                    <div className="rounded-xl bg-red-50 p-4">

                                        <p className="text-sm text-red-700">

                                            You are rejecting:

                                            <span className="ml-1 font-bold">
                                                {selectedSupplier.business_name ||
                                                    selectedSupplier.user?.name}
                                            </span>

                                        </p>

                                    </div>


                                    <div className="mt-5">

                                        <label
                                            htmlFor="rejection_reason"
                                            className="mb-2 block text-sm
                                                       font-semibold text-gray-700"
                                        >
                                            Rejection Reason
                                            <span className="ml-1 text-gray-400">
                                                (Optional)
                                            </span>
                                        </label>

                                        <textarea
                                            id="rejection_reason"
                                            value={rejectionReason}
                                            onChange={(e) =>
                                                setRejectionReason(
                                                    e.target.value
                                                )
                                            }
                                            rows="5"
                                            placeholder="Explain why this supplier application is being rejected..."
                                            className="w-full rounded-xl
                                                       border-gray-300
                                                       text-sm
                                                       focus:border-red-500
                                                       focus:ring-red-500"
                                        />

                                        <p className="mt-2 text-xs text-gray-400">
                                            This reason can be shown to the
                                            supplier so they know what needs
                                            to be corrected.
                                        </p>

                                    </div>

                                </div>


                                {/* Footer */}

                                <div className="flex justify-end gap-3
                                                border-t bg-gray-50 px-6 py-4">

                                    <button
                                        type="button"
                                        onClick={closeRejectModal}
                                        disabled={processing}
                                        className="rounded-xl border
                                                   border-gray-200 bg-white
                                                   px-4 py-2.5 text-sm
                                                   font-semibold text-gray-700
                                                   hover:bg-gray-50
                                                   disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-xl bg-red-600
                                                   px-4 py-2.5 text-sm
                                                   font-semibold text-white
                                                   hover:bg-red-700
                                                   disabled:cursor-not-allowed
                                                   disabled:opacity-50"
                                    >
                                        {processing
                                            ? 'Rejecting...'
                                            : 'Reject Supplier'}
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