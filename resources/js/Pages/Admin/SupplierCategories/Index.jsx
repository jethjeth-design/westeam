import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ categories = [] }) {
    /*
    |--------------------------------------------------------------------------
    | Modal State
    |--------------------------------------------------------------------------
    */

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);

    const [search, setSearch] = useState('');

    /*
    |--------------------------------------------------------------------------
    | Form
    |--------------------------------------------------------------------------
    */

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        name: '',
        description: '',
        is_active: true,
    });

    /*
    |--------------------------------------------------------------------------
    | Open Add Modal
    |--------------------------------------------------------------------------
    */

    const openAddModal = () => {
        setEditingCategory(null);

        clearErrors();

        setData({
            name: '',
            description: '',
            is_active: true,
        });

        setShowModal(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Open Edit Modal
    |--------------------------------------------------------------------------
    */

    const openEditModal = (category) => {
        setEditingCategory(category);

        clearErrors();

        setData({
            name: category.name || '',
            description: category.description || '',
            is_active: Boolean(category.is_active),
        });

        setShowModal(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Close Modal
    |--------------------------------------------------------------------------
    */

    const closeModal = () => {
        if (processing) return;

        setShowModal(false);
        setEditingCategory(null);

        reset();
        clearErrors();
    };

    /*
    |--------------------------------------------------------------------------
    | Submit Add / Edit
    |--------------------------------------------------------------------------
    */

    const submit = (e) => {
        e.preventDefault();

        if (editingCategory) {
            put(
                `/admin/supplier-categories/${editingCategory.id}`,
                {
                    preserveScroll: true,

                    onSuccess: () => {
                        setShowModal(false);
                        setEditingCategory(null);
                        reset();
                    },
                }
            );
        } else {
            post('/admin/supplier-categories', {
                preserveScroll: true,

                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Delete Modal
    |--------------------------------------------------------------------------
    */

    const openDeleteModal = (category) => {
        setDeletingCategory(category);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setDeletingCategory(null);
    };

    /*
    |--------------------------------------------------------------------------
    | Delete Category
    |--------------------------------------------------------------------------
    */

    const deleteCategory = () => {
        if (!deletingCategory) return;

        router.delete(
            `/admin/supplier-categories/${deletingCategory.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setShowDeleteModal(false);
                    setDeletingCategory(null);
                },
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    const filteredCategories = categories.filter((category) => {
        const searchText = search.toLowerCase().trim();

        return (
            category.name
                ?.toLowerCase()
                .includes(searchText) ||
            category.description
                ?.toLowerCase()
                .includes(searchText)
        );
    });

    return (
        <DashboardLayout>

            <Head title="Supplier Categories" />

            <div className="p-6">

                {/* =========================================================
                    HEADER
                ========================================================= */}

                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Supplier Categories
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage the categories available to suppliers.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <span className="mr-2 text-lg">
                            +
                        </span>

                        Add Supplier Category
                    </button>

                </div>


                {/* =========================================================
                    TABLE CONTAINER
                ========================================================= */}

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                    {/* =====================================================
                        TABLE HEADER / SEARCH
                    ===================================================== */}

                    <div className="border-b border-gray-200 p-4">

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                                <h2 className="text-base font-semibold text-gray-900">
                                    All Supplier Categories
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    {filteredCategories.length}{' '}
                                    {filteredCategories.length === 1
                                        ? 'category'
                                        : 'categories'}
                                </p>
                            </div>

                            <div className="relative w-full sm:w-80">

                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    🔍
                                </span>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    placeholder="Search categories..."
                                    className="w-full rounded-xl border-gray-300 py-2.5 pl-11 pr-4 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />

                            </div>

                        </div>

                    </div>


                    {/* =====================================================
                        TABLE
                    ===================================================== */}

                    {filteredCategories.length > 0 ? (

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[800px] text-left">

                                <thead className="bg-gray-50">

                                    <tr>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            #
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Category
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Description
                                        </th>

                                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Suppliers
                                        </th>

                                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody className="divide-y divide-gray-100">

                                    {filteredCategories.map(
                                        (category, index) => (

                                            <tr
                                                key={category.id}
                                                className="transition hover:bg-gray-50"
                                            >

                                                {/* NUMBER */}

                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                                                    {index + 1}
                                                </td>


                                                {/* CATEGORY */}

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-lg">
                                                            🏢
                                                        </div>

                                                        <div>

                                                            <p className="font-semibold text-gray-900">
                                                                {category.name}
                                                            </p>

                                                            <p className="text-xs text-gray-400">
                                                                ID: #{category.id}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* DESCRIPTION */}

                                                <td className="max-w-md px-6 py-4">

                                                    {category.description ? (

                                                        <p className="line-clamp-2 text-sm text-gray-500">
                                                            {category.description}
                                                        </p>

                                                    ) : (

                                                        <span className="text-sm italic text-gray-400">
                                                            No description
                                                        </span>

                                                    )}

                                                </td>


                                                {/* SUPPLIER COUNT */}

                                                <td className="px-6 py-4 text-center">

                                                    <span className="inline-flex min-w-10 items-center justify-center rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700">
                                                        {category.suppliers_count ??
                                                            0}
                                                    </span>

                                                </td>


                                                {/* STATUS */}

                                                <td className="px-6 py-4 text-center">

                                                    {category.is_active ? (

                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">

                                                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                                                            Active

                                                        </span>

                                                    ) : (

                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">

                                                            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />

                                                            Inactive

                                                        </span>

                                                    )}

                                                </td>


                                                {/* ACTIONS */}

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center justify-end gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    category
                                                                )
                                                            }
                                                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                                                        >
                                                            ✏️ Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    category
                                                                )
                                                            }
                                                            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                                        >
                                                            🗑️ Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    ) : (

                        /* =================================================
                           EMPTY STATE
                        ================================================= */

                        <div className="px-6 py-16 text-center">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                                🏢
                            </div>

                            <h2 className="mt-5 text-xl font-bold text-gray-900">

                                {search
                                    ? 'No categories found'
                                    : 'No supplier categories yet'}

                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">

                                {search
                                    ? 'Try searching with a different category name.'
                                    : 'Create your first supplier category to organize your suppliers.'}

                            </p>

                            {!search && (

                                <button
                                    type="button"
                                    onClick={openAddModal}
                                    className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                                >
                                    + Add Supplier Category
                                </button>

                            )}

                        </div>

                    )}

                </div>

            </div>


            {/* =================================================================
                ADD / EDIT MODAL
            ================================================================= */}

            {showModal && (

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
                    onMouseDown={(e) => {

                        if (
                            e.target === e.currentTarget &&
                            !processing
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                        {/* MODAL HEADER */}

                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

                            <div>

                                <h2 className="text-xl font-bold text-gray-900">

                                    {editingCategory
                                        ? 'Edit Supplier Category'
                                        : 'Add Supplier Category'}

                                </h2>

                                <p className="mt-1 text-sm text-gray-500">

                                    {editingCategory
                                        ? 'Update the supplier category information.'
                                        : 'Create a new category for suppliers.'}

                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={processing}
                                className="rounded-lg p-2 text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                            >
                                ✕
                            </button>

                        </div>


                        {/* FORM */}

                        <form onSubmit={submit}>

                            <div className="space-y-6 px-6 py-6">

                                {/* CATEGORY NAME */}

                                <div>

                                    <label
                                        htmlFor="category-name"
                                        className="mb-2 block text-sm font-semibold text-gray-700"
                                    >
                                        Category Name
                                    </label>

                                    <input
                                        id="category-name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData(
                                                'name',
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. Photography"
                                        className="w-full rounded-xl border-gray-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    {errors.name && (

                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.name}
                                        </p>

                                    )}

                                </div>


                                {/* DESCRIPTION */}

                                <div>

                                    <label
                                        htmlFor="category-description"
                                        className="mb-2 block text-sm font-semibold text-gray-700"
                                    >
                                        Description
                                    </label>

                                    <textarea
                                        id="category-description"
                                        rows="4"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                'description',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Describe the type of supplier..."
                                        className="w-full resize-none rounded-xl border-gray-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    {errors.description && (

                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.description}
                                        </p>

                                    )}

                                </div>


                                {/* ACTIVE */}

                                <div className="rounded-xl bg-gray-50 p-4">

                                    <label className="flex cursor-pointer items-center gap-3">

                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) =>
                                                setData(
                                                    'is_active',
                                                    e.target.checked
                                                )
                                            }
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />

                                        <div>

                                            <p className="text-sm font-semibold text-gray-800">
                                                Active Category
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                Active categories can be
                                                selected by suppliers.
                                            </p>

                                        </div>

                                    </label>

                                </div>

                            </div>


                            {/* FOOTER */}

                            <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={processing}
                                    className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {processing
                                        ? 'Saving...'
                                        : editingCategory
                                            ? 'Save Changes'
                                            : 'Add Category'}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =================================================================
                DELETE CONFIRMATION MODAL
            ================================================================= */}

            {showDeleteModal && deletingCategory && (

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
                    onMouseDown={(e) => {

                        if (e.target === e.currentTarget) {
                            closeDeleteModal();
                        }

                    }}
                >

                    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

                        {/* CONTENT */}

                        <div className="p-6">

                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
                                ⚠️
                            </div>

                            <h2 className="mt-5 text-xl font-bold text-gray-900">
                                Delete Supplier Category?
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-500">

                                Are you sure you want to delete{' '}

                                <span className="font-semibold text-gray-800">
                                    "{deletingCategory.name}"
                                </span>
                                ?

                            </p>

                            {deletingCategory.suppliers_count > 0 && (

                                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">

                                    <p className="text-sm font-semibold text-amber-800">
                                        This category is currently being used.
                                    </p>

                                    <p className="mt-1 text-xs text-amber-700">
                                        {
                                            deletingCategory.suppliers_count
                                        }{' '}
                                        supplier(s) are assigned to this
                                        category. The category cannot be
                                        deleted until they are reassigned.
                                    </p>

                                </div>

                            )}

                        </div>


                        {/* FOOTER */}

                        <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">

                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={deleteCategory}
                                disabled={
                                    deletingCategory.suppliers_count > 0
                                }
                                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Delete Category
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </DashboardLayout>
    );
}