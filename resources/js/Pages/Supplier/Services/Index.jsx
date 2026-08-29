import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useRef } from 'react';

export default function Index({ services = [], categories = [] }) {
    const [editingService, setEditingService] = useState(null);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    // Form for Add / Edit
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        category: '',
        price: '',
        description: '',
        image: null,
        is_active: true,
        _method: 'POST',
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const openCreateModal = () => {
        setEditingService(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        clearErrors();
        reset({
            name: '',
            category: '',
            price: '',
            description: '',
            image: null,
            is_active: true,
            _method: 'POST',
        });
        setShowServiceModal(true);
    };

    const openEditModal = (service) => {
        setEditingService(service);
        setImagePreview(service.image_path || null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        clearErrors();
        setData({
            name: service.name || '',
            category: service.category || '',
            price: service.price ? String(service.price) : '',
            description: service.description || '',
            image: null,
            is_active: Boolean(service.is_active),
            _method: 'PUT',
        });
        setShowServiceModal(true);
    };

    const closeServiceModal = () => {
        setShowServiceModal(false);
        setEditingService(null);
        setImagePreview(null);
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingService) {
            post(`/supplier/services/${editingService.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    closeServiceModal();
                },
            });
        } else {
            post('/supplier/services', {
                preserveScroll: true,
                onSuccess: () => {
                    closeServiceModal();
                },
            });
        }
    };

    const toggleStatus = (service) => {
        router.put(
            `/supplier/services/${service.id}`,
            {
                name: service.name,
                category: service.category,
                price: service.price,
                description: service.description,
                is_active: !service.is_active,
            },
            { preserveScroll: true }
        );
    };

    const confirmDelete = (service) => {
        setServiceToDelete(service);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        if (!serviceToDelete) return;
        router.delete(`/supplier/services/${serviceToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteModal(false);
                setServiceToDelete(null);
            },
        });
    };

    // Category icon helper
    const getCategoryIcon = (categoryName) => {
        const cat = (categoryName || '').toLowerCase();
        if (cat.includes('photo')) return '📷';
        if (cat.includes('video')) return '🎥';
        if (cat.includes('makeup') || cat.includes('hair') || cat.includes('beauty')) return '💄';
        if (cat.includes('cater') || cat.includes('food')) return '🍽️';
        if (cat.includes('decor') || cat.includes('flor')) return '💐';
        if (cat.includes('music') || cat.includes('dj') || cat.includes('sound')) return '🎵';
        if (cat.includes('plan') || cat.includes('coord')) return '📋';
        if (cat.includes('cake') || cat.includes('dessert')) return '🎂';
        if (cat.includes('venue') || cat.includes('place')) return '🏰';
        return '✨';
    };

    return (
        <DashboardLayout>
            <Head title="Services - Supplier Dashboard" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                                🛠️ Supplier Offerings
                            </span>
                        </div>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Services</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage the individual standalone services you offer to customers and event packages.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-95"
                    >
                        <span className="text-lg leading-none">+</span>
                        Add New Service
                    </button>
                </div>

                {/* What are Services? Info Banner */}
                <div className="mt-6 overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-blue-50/60 to-purple-50/50 p-6 shadow-xs">
                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-2xl text-white shadow-md shadow-indigo-600/20">
                                💡
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Standalone Services & Bundles</h2>
                                <p className="mt-0.5 text-xs text-slate-600">
                                    Services are individual offerings that customers can book individually, through AI bundles, or as part of solo and multi-vendor team packages.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-2 text-2xl shadow-xs backdrop-blur-sm">
                            <span>🎬</span>
                            <span>📸</span>
                            <span>💍</span>
                            <span>💐</span>
                        </div>
                    </div>
                </div>

                {/* Services Grid Roster */}
                <div className="mt-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black text-slate-900">
                            Your Services <span className="text-indigo-600">({services.length})</span>
                        </h2>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                            {services.filter((s) => s.is_active).length} Active Services
                        </span>
                    </div>

                    {services.length === 0 ? (
                        <div className="mt-6 rounded-3xl border-2 border-dashed border-slate-300 bg-white p-16 text-center shadow-xs">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-3xl">
                                🛠️
                            </div>
                            <h3 className="mt-4 text-lg font-bold text-slate-900">No services added yet</h3>
                            <p className="mt-1 text-xs text-slate-500">
                                Start showcasing your work by clicking the button below to open the service creator modal.
                            </p>
                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 active:scale-95"
                            >
                                + Add First Service
                            </button>
                        </div>
                    ) : (
                        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {services.map((service) => (
                                <div
                                    key={service.id}
                                    className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
                                >
                                    <div>
                                        {/* Image banner or fallback icon */}
                                        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 shadow-inner">
                                            {service.image_path ? (
                                                <img
                                                    src={service.image_path}
                                                    alt={service.name}
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-slate-100 to-indigo-50 text-4xl">
                                                    {getCategoryIcon(service.category)}
                                                </div>
                                            )}

                                            <span className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-sm shadow-md backdrop-blur-xs">
                                                {getCategoryIcon(service.category)}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => toggleStatus(service)}
                                                className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-md transition ${
                                                    service.is_active
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-amber-600 text-white'
                                                }`}
                                            >
                                                {service.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </div>

                                        {/* Content */}
                                        <div className="mt-4">
                                            <div className="flex items-center gap-2">
                                                <h3 className="truncate text-base font-black text-slate-900">
                                                    {service.name}
                                                </h3>
                                            </div>

                                            {service.category && (
                                                <span className="mt-1 inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                                                    {service.category}
                                                </span>
                                            )}

                                            <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                                                {service.description || 'No description provided.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer / Price & Action */}
                                    <div className="mt-5 border-t border-slate-100 pt-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-slate-400">Price</span>
                                                <p className="text-base font-black text-slate-900">
                                                    ₱{Number(service.price || 0).toLocaleString('en-PH', {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(service)}
                                                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => confirmDelete(service)}
                                                    className="rounded-xl border border-red-100 bg-red-50/50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add / Edit Service Modal */}
            {showServiceModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
                    onClick={closeServiceModal}
                >
                    <div
                        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-lg">
                                    {editingService ? '✏️' : '➕'}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">
                                        {editingService ? 'Edit Service' : 'Add New Service'}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {editingService
                                            ? 'Update pricing and service specifications.'
                                            : 'Add a new service offering to your profile.'}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeServiceModal}
                                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700">
                                    Service Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Cinematic Wedding Highlight Film"
                                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                            </div>

                            {/* Category & Price */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700">Category</label>
                                    <select
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.name}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && (
                                        <p className="mt-1 text-xs text-red-500">{errors.category}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700">
                                        Price (₱) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        placeholder="25,000.00"
                                        className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                    />
                                    {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows="3"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Describe deliverables, hours of coverage, equipment included..."
                                    className="mt-1.5 w-full rounded-xl border border-slate-300 p-3.5 text-xs text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-xs text-red-500">{errors.description}</p>
                                )}
                            </div>

                            {/* Upload Image */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700">Cover Photo</label>
                                <div
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-1.5 flex cursor-pointer items-center justify-between rounded-2xl border-2 border-dashed border-slate-300 p-3.5 transition hover:border-indigo-500 hover:bg-indigo-50/20"
                                >
                                    <div className="flex items-center gap-3">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200"
                                            />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600">
                                                📷
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">
                                                {imagePreview ? 'Click to change photo' : 'Upload service photo'}
                                            </p>
                                            <p className="text-[10px] text-slate-400">JPG, PNG, WEBP (Max 5MB)</p>
                                        </div>
                                    </div>

                                    <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                        Browse
                                    </span>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
                            </div>

                            {/* Active Switch */}
                            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                <div>
                                    <p className="text-xs font-bold text-slate-800">Active Service Status</p>
                                    <p className="text-[10px] text-slate-500">
                                        Active services can be booked and added to packages.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={data.is_active}
                                    onClick={() => setData('is_active', !data.is_active)}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                                        data.is_active ? 'bg-indigo-600' : 'bg-slate-300'
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                                            data.is_active ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={closeServiceModal}
                                    className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Saving...'
                                        : editingService
                                        ? 'Update Service'
                                        : 'Save Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && serviceToDelete && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
                    onClick={() => setShowDeleteModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-2xl text-red-600">
                            🗑️
                        </div>

                        <h3 className="mt-4 text-lg font-black text-slate-900">Delete Service?</h3>
                        <p className="mt-2 text-xs text-slate-500">
                            Are you sure you want to delete{' '}
                            <strong className="text-slate-800">{serviceToDelete.name}</strong>? Packages containing this service will be updated.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
                            >
                                Delete Service
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}