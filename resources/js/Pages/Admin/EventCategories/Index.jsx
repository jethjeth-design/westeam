import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ categories }) {
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);

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

    // Open Add Modal
    const openAddModal = () => {
        setEditingCategory(null);

        reset();
        clearErrors();

        setData({
            name: '',
            description: '',
            is_active: true,
        });

        setShowFormModal(true);
    };

    // Open Edit Modal
    const openEditModal = (category) => {
        setEditingCategory(category);

        clearErrors();

        setData({
            name: category.name || '',
            description: category.description || '',
            is_active: Boolean(category.is_active),
        });

        setShowFormModal(true);
    };

    // Close Form Modal
    const closeFormModal = () => {
        if (processing) return;

        setShowFormModal(false);
        setEditingCategory(null);
        reset();
        clearErrors();
    };

    // Submit Add/Edit
    const submit = (e) => {
        e.preventDefault();

        if (editingCategory) {
            put(`/admin/event-categories/${editingCategory.id}`, {
                onSuccess: () => {
                    setShowFormModal(false);
                    setEditingCategory(null);
                    reset();
                },
            });
        } else {
            post('/admin/event-categories', {
                onSuccess: () => {
                    setShowFormModal(false);
                    reset();
                },
            });
        }
    };

    // Open Delete Modal
    const openDeleteModal = (category) => {
        setDeletingCategory(category);
        setShowDeleteModal(true);
    };

    // Close Delete Modal
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setDeletingCategory(null);
    };

    // Delete Category
    const deleteCategory = () => {
        if (!deletingCategory) return;

        router.delete(
            `/admin/event-categories/${deletingCategory.id}`,
            {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setDeletingCategory(null);
                },
            }
        );
    };

    return (
        <DashboardLayout>
            <Head title="Event Categories" />

            <div className="p-6">

                {/* HEADER */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Event Categories
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage the event categories available to suppliers.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                    >
                        <span className="mr-2 text-lg">+</span>
                        Add Category
                    </button>

                </div>

                {/* TABLE */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    <div className="overflow-x-auto">

                        <table className="w-full text-left text-sm">

                            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-6 py-4">
                                        Category
                                    </th>

                                    <th className="px-6 py-4">
                                        Description
                                    </th>

                                    <th className="px-6 py-4">
                                        Packages
                                    </th>

                                    <th className="px-6 py-4">
                                        Status
                                    </th>

                                    <th className="px-6 py-4 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {categories.data.length > 0 ? (

                                    categories.data.map((category) => (

                                        <tr
                                            key={category.id}
                                            className="transition hover:bg-gray-50"
                                        >

                                            {/* CATEGORY */}
                                            <td className="px-6 py-4">

                                                <div className="font-semibold text-gray-900">
                                                    {category.name}
                                                </div>

                                                <div className="text-xs text-gray-400">
                                                    ID #{category.id}
                                                </div>

                                            </td>

                                            {/* DESCRIPTION */}
                                            <td className="max-w-md px-6 py-4 text-gray-500">
                                                {category.description ||
                                                    'No description'}
                                            </td>

                                            {/* PACKAGES */}
                                            <td className="px-6 py-4">

                                                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                                                    {category.packages_count}{' '}
                                                    {category.packages_count === 1
                                                        ? 'package'
                                                        : 'packages'}
                                                </span>

                                            </td>

                                            {/* STATUS */}
                                            <td className="px-6 py-4">

                                                {category.is_active ? (

                                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                        Active
                                                    </span>

                                                ) : (

                                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                                        Inactive
                                                    </span>

                                                )}

                                            </td>

                                            {/* ACTIONS */}
                                            <td className="px-6 py-4">

                                                <div className="flex justify-end gap-2">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditModal(category)
                                                        }
                                                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openDeleteModal(category)
                                                        }
                                                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-6 py-12 text-center"
                                        >

                                            <div className="text-4xl">
                                                🎉
                                            </div>

                                            <h3 className="mt-3 font-semibold text-gray-900">
                                                No event categories
                                            </h3>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Create your first event category.
                                            </p>

                                            <button
                                                onClick={openAddModal}
                                                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                                            >
                                                Add Category
                                            </button>

                                        </td>
                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                    {/* PAGINATION */}
                    {categories.links &&
                        categories.links.length > 3 && (

                            <div className="flex flex-wrap gap-2 border-t px-6 py-4">

                                {categories.links.map((link, index) => (

                                    <button
                                        key={index}
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                router.get(link.url);
                                            }
                                        }}
                                        className={`rounded-lg px-3 py-2 text-sm ${
                                            link.active
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        } ${
                                            !link.url
                                                ? 'cursor-not-allowed opacity-50'
                                                : ''
                                        }`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />

                                ))}

                            </div>

                        )}

                </div>

            </div>

            {/* ===================================================== */}
            {/* ADD / EDIT MODAL */}
            {/* ===================================================== */}

            {showFormModal && (

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            closeFormModal();
                        }
                    }}
                >

                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                        {/* MODAL HEADER */}
                        <div className="flex items-center justify-between border-b px-6 py-5">

                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingCategory
                                        ? 'Edit Event Category'
                                        : 'Add Event Category'}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {editingCategory
                                        ? 'Update the event category information.'
                                        : 'Create a new category for supplier packages.'}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeFormModal}
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                                ✕
                            </button>

                        </div>

                        {/* FORM */}
                        <form onSubmit={submit}>

                            <div className="space-y-5 px-6 py-6">

                                {/* NAME */}
                                <div>

                                    <label className="block text-sm font-semibold text-gray-700">
                                        Category Name
                                    </label>

                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData(
                                                'name',
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. Wedding"
                                        className="mt-2 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.name}
                                        </p>
                                    )}

                                </div>

                                {/* DESCRIPTION */}
                                <div>

                                    <label className="block text-sm font-semibold text-gray-700">
                                        Description
                                    </label>

                                    <textarea
                                        rows="4"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                'description',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Describe this event category..."
                                        className="mt-2 w-full resize-none rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.description}
                                        </p>
                                    )}

                                </div>

                                {/* ACTIVE */}
                                <div className="rounded-lg bg-gray-50 p-4">

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
                                            <div className="text-sm font-semibold text-gray-800">
                                                Active Category
                                            </div>

                                            <div className="text-xs text-gray-500">
                                                Suppliers can select active
                                                categories when creating packages.
                                            </div>
                                        </div>

                                    </label>

                                </div>

                            </div>

                            {/* FOOTER */}
                            <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">

                                <button
                                    type="button"
                                    onClick={closeFormModal}
                                    disabled={processing}
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Saving...'
                                        : editingCategory
                                            ? 'Save Changes'
                                            : 'Create Category'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* ===================================================== */}
            {/* DELETE CONFIRMATION MODAL */}
            {/* ===================================================== */}

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

                        <div className="p-6">

                            {/* ICON */}
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl">
                                ⚠️
                            </div>

                            {/* TEXT */}
                            <h2 className="mt-4 text-xl font-bold text-gray-900">
                                Delete Event Category?
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Are you sure you want to delete{' '}
                                <span className="font-semibold text-gray-800">
                                    "{deletingCategory.name}"
                                </span>
                                ?
                            </p>

                            {deletingCategory.packages_count > 0 && (

                                <div className="mt-4 rounded-lg bg-red-50 p-4">

                                    <p className="text-sm font-medium text-red-700">
                                        This category is currently being used
                                        by{' '}
                                        {deletingCategory.packages_count}{' '}
                                        package
                                        {deletingCategory.packages_count !== 1
                                            ? 's'
                                            : ''}
                                        .
                                    </p>

                                    <p className="mt-1 text-xs text-red-600">
                                        You cannot delete a category that is
                                        being used by packages.
                                    </p>

                                </div>

                            )}

                        </div>

                        {/* FOOTER */}
                        <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">

                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={deleteCategory}
                                disabled={
                                    deletingCategory.packages_count > 0
                                }
                                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
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