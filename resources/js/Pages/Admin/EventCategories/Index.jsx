import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ categories }) {
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        name: '',
        description: '',
        image: null,
        is_active: true,
        _method: 'POST',
    });

    // Open Add Modal
    const openAddModal = () => {
        setEditingCategory(null);
        setImagePreview(null);
        reset();
        clearErrors();

        setData({
            name: '',
            description: '',
            image: null,
            is_active: true,
            _method: 'POST',
        });

        setShowFormModal(true);
    };

    // Open Edit Modal
    const openEditModal = (category) => {
        setEditingCategory(category);
        setImagePreview(category.image_url || null);
        clearErrors();

        setData({
            name: category.name || '',
            description: category.description || '',
            image: null,
            is_active: Boolean(category.is_active),
            _method: 'PUT',
        });

        setShowFormModal(true);
    };

    // Close Form Modal
    const closeFormModal = () => {
        if (processing) return;

        setShowFormModal(false);
        setEditingCategory(null);
        setImagePreview(null);
        reset();
        clearErrors();
    };

    // Submit Add/Edit
    const submit = (e) => {
        e.preventDefault();

        if (editingCategory) {
            post(`/admin/event-categories/${editingCategory.id}`, {
                forceFormData: true,
                onSuccess: () => {
                    setShowFormModal(false);
                    setEditingCategory(null);
                    setImagePreview(null);
                    reset();
                },
            });
        } else {
            post('/admin/event-categories', {
                forceFormData: true,
                onSuccess: () => {
                    setShowFormModal(false);
                    setImagePreview(null);
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
                        <h1 className="text-2xl font-bold text-softcharcoal">
                            Event Categories
                        </h1>

                        <p className="mt-1 text-sm text-warmgray">
                            Manage the event categories available to suppliers.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center rounded-lg bg-champagnegold px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-darkgold"
                    >
                        <span className="mr-2 text-lg">+</span>
                        Add Category
                    </button>

                </div>

                {/* TABLE */}
                <div className="overflow-hidden rounded-xl border border-warmbeige bg-white shadow-sm">

                    <div className="overflow-x-auto">

                        <table className="w-full text-left text-sm">

                            <thead className="border-b bg-ivory text-xs uppercase text-warmgray">
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

                            <tbody className="divide-y divide-champagne">

                                {categories.data.length > 0 ? (

                                    categories.data.map((category) => (

                                        <tr
                                            key={category.id}
                                            className="transition hover:bg-ivory"
                                        >

                                            {/* CATEGORY */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {category.image_url ? (
                                                        <img
                                                            src={category.image_url}
                                                            alt={category.name}
                                                            className="w-10 h-10 rounded-xl object-cover border border-warmbeige shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl bg-champagne border border-champagne flex items-center justify-center text-champagnegold font-bold text-sm shrink-0">
                                                            {category.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-semibold text-softcharcoal">
                                                            {category.name}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            ID #{category.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* DESCRIPTION */}
                                            <td className="max-w-md px-6 py-4 text-warmgray">
                                                {category.description ||
                                                    'No description'}
                                            </td>

                                            {/* PACKAGES */}
                                            <td className="px-6 py-4">

                                                <span className="rounded-full bg-champagne px-3 py-1 text-xs font-medium text-darkgold">
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

                                                    <span className="rounded-full bg-champagne px-3 py-1 text-xs font-semibold text-warmgray">
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
                                                        className="rounded-lg border border-warmbeige px-3 py-2 text-xs font-medium text-softcharcoal transition hover:bg-champagne"
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

                                            <h3 className="mt-3 font-semibold text-softcharcoal">
                                                No event categories
                                            </h3>

                                            <p className="mt-1 text-sm text-warmgray">
                                                Create your first event category.
                                            </p>

                                            <button
                                                onClick={openAddModal}
                                                className="mt-4 rounded-lg bg-champagnegold px-4 py-2 text-sm font-semibold text-white hover:bg-darkgold"
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
                                                ? 'bg-champagnegold text-white'
                                                : 'bg-champagne text-softcharcoal hover:bg-gray-200'
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
                                <h2 className="text-xl font-bold text-softcharcoal">
                                    {editingCategory
                                        ? 'Edit Event Category'
                                        : 'Add Event Category'}
                                </h2>

                                <p className="mt-1 text-sm text-warmgray">
                                    {editingCategory
                                        ? 'Update the event category information.'
                                        : 'Create a new category for supplier packages.'}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeFormModal}
                                className="rounded-lg p-2 text-gray-400 hover:bg-champagne hover:text-warmgray"
                            >
                                ✕
                            </button>

                        </div>

                        {/* FORM */}
                        <form onSubmit={submit}>

                            <div className="space-y-5 px-6 py-6">

                                {/* NAME */}
                                <div>

                                    <label className="block text-sm font-semibold text-softcharcoal">
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
                                        className="mt-2 w-full rounded-lg border-warmbeige shadow-sm focus:border-champagnegold focus:ring-champagnegold"
                                    />

                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.name}
                                        </p>
                                    )}

                                </div>

                                {/* CATEGORY PHOTO UPLOAD */}
                                <div>
                                    <label className="block text-sm font-semibold text-softcharcoal">
                                        Category Photo
                                    </label>

                                    <div className="mt-2 flex flex-col gap-2">
                                        {imagePreview ? (
                                            <div className="relative rounded-xl overflow-hidden border border-warmbeige h-40 bg-champagne group">
                                                <img
                                                    src={imagePreview}
                                                    alt="Category preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <label className="cursor-pointer px-3 py-1.5 bg-white text-softcharcoal rounded-lg text-xs font-semibold shadow hover:bg-champagnegold hover:text-white transition">
                                                        Change Photo
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    setData('image', file);
                                                                    setImagePreview(URL.createObjectURL(file));
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setData('image', null);
                                                            setImagePreview(null);
                                                        }}
                                                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold shadow hover:bg-red-700 transition"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center h-32 px-4 py-5 border-2 border-dashed border-warmbeige hover:border-champagnegold rounded-xl cursor-pointer bg-ivory hover:bg-champagne/40 transition">
                                                <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-xs font-medium text-softcharcoal">Click to upload category photo</span>
                                                <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, WEBP up to 5MB</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setData('image', file);
                                                            setImagePreview(URL.createObjectURL(file));
                                                        }
                                                    }}
                                                />
                                            </label>
                                        )}
                                        {errors.image && (
                                            <p className="text-red-600 text-xs mt-1 font-medium">{errors.image}</p>
                                        )}
                                    </div>
                                </div>

                                {/* DESCRIPTION */}
                                <div>

                                    <label className="block text-sm font-semibold text-softcharcoal">
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
                                        className="mt-2 w-full resize-none rounded-lg border-warmbeige shadow-sm focus:border-champagnegold focus:ring-champagnegold"
                                    />

                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.description}
                                        </p>
                                    )}

                                </div>

                                {/* ACTIVE */}
                                <div className="rounded-lg bg-ivory p-4">

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
                                            className="h-4 w-4 rounded border-warmbeige text-champagnegold focus:ring-champagnegold"
                                        />

                                        <div>
                                            <div className="text-sm font-semibold text-softcharcoal">
                                                Active Category
                                            </div>

                                            <div className="text-xs text-warmgray">
                                                Suppliers can select active
                                                categories when creating packages.
                                            </div>
                                        </div>

                                    </label>

                                </div>

                            </div>

                            {/* FOOTER */}
                            <div className="flex justify-end gap-3 border-t bg-ivory px-6 py-4">

                                <button
                                    type="button"
                                    onClick={closeFormModal}
                                    disabled={processing}
                                    className="rounded-lg border border-warmbeige bg-white px-4 py-2.5 text-sm font-semibold text-softcharcoal hover:bg-ivory disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-champagnegold px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-darkgold disabled:cursor-not-allowed disabled:opacity-50"
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
                            <h2 className="mt-4 text-xl font-bold text-softcharcoal">
                                Delete Event Category?
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-warmgray">
                                Are you sure you want to delete{' '}
                                <span className="font-semibold text-softcharcoal">
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
                        <div className="flex justify-end gap-3 border-t bg-ivory px-6 py-4">

                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                className="rounded-lg border border-warmbeige bg-white px-4 py-2.5 text-sm font-semibold text-softcharcoal hover:bg-ivory"
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