import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useRef } from 'react';

export default function Index({ services = [], categories = [] }) {
    const [editingService, setEditingService] = useState(null);
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

    const resetForm = () => {
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
    };

    const startEditing = (service) => {
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingService) {
            // For Laravel file uploads with PUT, send as POST with _method = PUT
            post(`/supplier/services/${editingService.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    resetForm();
                },
            });
        } else {
            post('/supplier/services', {
                preserveScroll: true,
                onSuccess: () => {
                    resetForm();
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
                if (editingService?.id === serviceToDelete.id) {
                    resetForm();
                }
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
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Services</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage the individual services you offer.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={resetForm}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                    >
                        <span className="text-lg leading-none">+</span>
                        Add New Service
                    </button>
                </div>

                {/* What are Services? Info Banner */}
                <div className="mt-6 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-blue-50/60 to-purple-50/50 p-5 shadow-sm">
                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600/10 text-xl text-indigo-600">
                                ℹ️
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900">What are Services?</h2>
                                <p className="mt-0.5 text-sm text-gray-600">
                                    Services are individual items that customers can book on their own or that can be included in packages.
                                </p>
                            </div>
                        </div>

                        <div className="hidden rounded-xl bg-white/80 px-4 py-2 text-2xl shadow-sm backdrop-blur-sm sm:flex">
                            🎬 📸 💍
                        </div>
                    </div>
                </div>

                {/* Main 2-Column Section */}
                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Left Column: Your Services List (7 Cols) */}
                    <div className="lg:col-span-7">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">
                                Your Services <span className="text-indigo-600">({services.length})</span>
                            </h2>
                            <span className="text-xs text-gray-400">
                                {services.filter((s) => s.is_active).length} Active
                            </span>
                        </div>

                        {services.length === 0 ? (
                            <div className="mt-4 rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                                    🛠️
                                </div>
                                <h3 className="mt-3 text-base font-semibold text-gray-900">No services yet</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Create your first service using the form on the right.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-4">
                                {services.map((service) => {
                                    const isCurrentlyEditing = editingService?.id === service.id;
                                    return (
                                        <div
                                            key={service.id}
                                            className={`group relative overflow-hidden rounded-2xl border bg-white p-4 transition-all duration-200 hover:shadow-md ${isCurrentlyEditing
                                                ? 'border-indigo-600 ring-2 ring-indigo-600/20'
                                                : 'border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Thumbnail Image or Category Icon */}
                                                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 shadow-inner">
                                                    {service.image_path ? (
                                                        <img
                                                            src={service.image_path}
                                                            alt={service.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-2xl">
                                                            {getCategoryIcon(service.category)}
                                                        </span>
                                                    )}
                                                    <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-md bg-white/90 text-xs shadow-xs">
                                                        {getCategoryIcon(service.category)}
                                                    </span>
                                                </div>

                                                {/* Details */}
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="truncate text-base font-bold text-gray-900">
                                                            {service.name}
                                                        </h3>
                                                        {service.category && (
                                                            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                                                                {service.category}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                                                        {service.description || 'No description provided.'}
                                                    </p>

                                                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => startEditing(service)}
                                                            className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-800"
                                                        >
                                                            Edit
                                                        </button>
                                                        <span className="text-gray-300">•</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleStatus(service)}
                                                            className="text-xs font-medium text-gray-500 hover:text-gray-700"
                                                        >
                                                            {service.is_active ? 'Mark Inactive' : 'Mark Active'}
                                                        </button>
                                                        <span className="text-gray-300">•</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => confirmDelete(service)}
                                                            className="text-xs font-medium text-red-500 hover:text-red-700"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Price & Status */}
                                                <div className="flex flex-col items-end justify-between gap-2 text-right">
                                                    <span className="text-base font-bold text-gray-900">
                                                        ₱{Number(service.price || 0).toLocaleString('en-PH', {
                                                            minimumFractionDigits: 2,
                                                        })}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() => toggleStatus(service)}
                                                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition ${service.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 hover:bg-emerald-100'
                                                            : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 hover:bg-amber-100'
                                                            }`}
                                                    >
                                                        {service.is_active ? 'Active' : 'Inactive'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Helper Tip */}
                        <div className="mt-6 flex items-center gap-2 rounded-xl bg-amber-50/80 p-3.5 text-xs text-amber-800 ring-1 ring-amber-200">
                            <span>💡</span>
                            <span>
                                <strong>Tip:</strong> Create services first, then include them in packages to offer bundled deals.
                            </span>
                        </div>
                    </div>

                    {/* Right Column: Add / Edit Service Form + Sidebar Guide (5 Cols) */}
                    <div className="space-y-6 lg:col-span-5">
                        {/* Form Card */}
                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
                            <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-600">
                                            {editingService ? '✏️' : '➕'}
                                        </span>
                                        <div>
                                            <h2 className="text-base font-bold text-gray-900">
                                                {editingService ? 'Edit Service' : 'Add New Service'}
                                            </h2>
                                            <p className="text-xs text-gray-500">
                                                {editingService
                                                    ? 'Update your service details and pricing.'
                                                    : 'Create a new service for your customers.'}
                                            </p>
                                        </div>
                                    </div>

                                    {editingService && (
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                                        >
                                            Cancel Edit
                                        </button>
                                    )}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 p-6">
                                {/* Service Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">
                                        Service Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Wedding Photography"
                                        className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-xs outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                </div>

                                {/* Category Dropdown / Selector */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">Category</label>
                                    <select
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-xs outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
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

                                {/* Description */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Full day coverage (8-10 hours). High-resolution edited photos with online gallery."
                                        className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-xs outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-xs text-red-500">{errors.description}</p>
                                    )}
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">
                                        Price <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative mt-1.5">
                                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 font-semibold text-gray-500">
                                            ₱
                                        </span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.price}
                                            onChange={(e) => setData('price', e.target.value)}
                                            placeholder="25,000.00"
                                            className="w-full rounded-xl border border-gray-300 py-2.5 pl-8 pr-3.5 text-sm font-semibold shadow-xs outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-400">Set the individual price for this service.</p>
                                    {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
                                </div>

                                {/* Upload Image Dropzone */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">Upload Image</label>
                                    <div
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mt-1.5 flex cursor-pointer items-center justify-between rounded-xl border-2 border-dashed border-gray-300 p-3.5 transition hover:border-indigo-400 hover:bg-indigo-50/30"
                                    >
                                        <div className="flex items-center gap-3">
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="h-12 w-12 rounded-lg object-cover ring-1 ring-gray-200"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-xl text-indigo-600">
                                                    📷
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-xs font-medium text-gray-800">
                                                    {imagePreview ? 'Change image' : 'Click to upload or drag & drop'}
                                                </p>
                                                <p className="text-[11px] text-gray-400">PNG, JPG up to 5MB</p>
                                            </div>
                                        </div>

                                        <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
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

                                {/* Status Switch */}
                                <div className="flex items-center justify-between pt-1">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-700">Status</p>
                                        <p className="text-[11px] text-gray-400">
                                            Active services are visible to customers and selectable in packages.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={data.is_active}
                                        onClick={() => setData('is_active', !data.is_active)}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${data.is_active ? 'bg-indigo-600' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${data.is_active ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                        />
                                    </button>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-3 pt-3">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-95"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
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

                        {/* Side Explanation Guide Card (from Mockup) */}
                        <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/70 via-indigo-50/40 to-white p-5 shadow-xs">
                            <div className="flex items-center gap-2 text-indigo-700">
                                <span>⭐</span>
                                <h3 className="text-sm font-bold">What is a Service?</h3>
                            </div>

                            <p className="mt-2 text-xs leading-relaxed text-gray-600">
                                A service is an individual offering with its own price. It can be booked separately by customers or bundled into rich discounted packages.
                            </p>

                            <div className="mt-4 border-t border-purple-100/80 pt-3">
                                <p className="text-xs font-bold text-gray-800">Examples:</p>
                                <ul className="mt-1.5 space-y-1 text-xs text-gray-600">
                                    <li className="flex items-center gap-1.5">
                                        <span className="text-indigo-500">•</span> Wedding Photography
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <span className="text-indigo-500">•</span> Wedding Videography & Cinematic Reels
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <span className="text-indigo-500">•</span> Prenup Photo Session
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <span className="text-indigo-500">•</span> Aerial Drone Coverage
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <span className="text-indigo-500">•</span> Same-Day Edit (SDE)
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Workflow Banner: How Services and Packages Work Together (from Mockup) */}
                <div className="mt-12 overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
                        <div className="lg:col-span-8">
                            <h3 className="text-base font-bold text-gray-900">
                                How Services and Packages Work Together
                            </h3>

                            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
                                {/* Step 1 */}
                                <div className="flex flex-1 items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-lg text-indigo-600">
                                        🛠️
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">1. Create Services</p>
                                        <p className="text-[11px] text-gray-500">
                                            Add individual services with their own prices.
                                        </p>
                                    </div>
                                </div>

                                <div className="hidden text-gray-300 sm:block">➔</div>

                                {/* Step 2 */}
                                <div className="flex flex-1 items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-lg text-purple-600">
                                        📦
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">2. Build Packages</p>
                                        <p className="text-[11px] text-gray-500">
                                            Select services and set an attractive bundle price.
                                        </p>
                                    </div>
                                </div>

                                <div className="hidden text-gray-300 sm:block">➔</div>

                                {/* Step 3 */}
                                <div className="flex flex-1 items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-lg text-emerald-600">
                                        👥
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">3. Customers Book</p>
                                        <p className="text-[11px] text-gray-500">
                                            Customers book single services or discounted bundles.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Example Box */}
                        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 lg:col-span-4">
                            <p className="text-xs font-bold text-indigo-900">Real Example:</p>
                            <p className="mt-1 text-xs text-indigo-700">
                                Combine “Wedding Photography” (₱25k) + “Videography” (₱30k) + “Prenup” (₱12k) into a package for <strong>₱55,000</strong> instead of ₱67,000 (₱12,000 savings for customers)!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && serviceToDelete && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
                    onClick={() => setShowDeleteModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-2xl text-red-600">
                            🗑️
                        </div>

                        <h3 className="mt-4 text-lg font-bold text-gray-900">Delete Service?</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Are you sure you want to delete{' '}
                            <strong className="text-gray-800">{serviceToDelete.name}</strong>? Packages containing this service will lose this association.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
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