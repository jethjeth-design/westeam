import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';

export default function Edit({ portfolio, categories = [] }) {
    const { flash } = usePage().props;
    const fileInputRef = useRef(null);

    // Form fields
    const [title, setTitle] = useState(portfolio.title || '');
    const [eventCategoryId, setEventCategoryId] = useState(
        portfolio.event_category_id ? String(portfolio.event_category_id) : ''
    );
    const [description, setDescription] = useState(portfolio.description || '');
    const [eventDate, setEventDate] = useState(
        portfolio.event_date ? portfolio.event_date.split('T')[0] : ''
    );
    const [clientName, setClientName] = useState(portfolio.client_name || '');
    const [location, setLocation] = useState(portfolio.location || '');
    const [isFeatured, setIsFeatured] = useState(Boolean(portfolio.is_featured));
    const [isPublished, setIsPublished] = useState(Boolean(portfolio.is_published));

    // Existing images state
    const [existingImages, setExistingImages] = useState(portfolio.images || []);
    const [deletedImageIds, setDeletedImageIds] = useState([]);
    const [existingCaptions, setExistingCaptions] = useState(
        (portfolio.images || []).reduce((acc, img) => {
            acc[img.id] = img.caption || '';
            return acc;
        }, {})
    );
    const initialCover =
        (portfolio.images || []).find((img) => img.is_cover)?.id ||
        (portfolio.images && portfolio.images.length > 0 ? portfolio.images[0].id : null);
    const [coverImageId, setCoverImageId] = useState(initialCover);

    // New uploaded files state
    const [newPreviews, setNewPreviews] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    // Handle new file selections
    const handleFiles = (files) => {
        const fileList = Array.from(files).filter((file) =>
            file.type.startsWith('image/')
        );
        if (fileList.length === 0) return;

        const previews = fileList.map((file) => ({
            file,
            url: URL.createObjectURL(file),
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2),
            caption: '',
        }));

        setNewPreviews((prev) => [...prev, ...previews]);
    };

    const handleFileInputChange = (e) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const removeNewPreview = (idxToRemove) => {
        setNewPreviews((prev) => prev.filter((_, idx) => idx !== idxToRemove));
    };

    const handleNewCaptionChange = (idx, value) => {
        const updated = [...newPreviews];
        updated[idx].caption = value;
        setNewPreviews(updated);
    };

    // Mark existing image for deletion
    const markDeleteExisting = (imageId) => {
        setDeletedImageIds((prev) => [...prev, imageId]);
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));

        // If the cover photo is deleted, choose another remaining photo
        if (coverImageId === imageId) {
            const remaining = existingImages.filter((img) => img.id !== imageId);
            setCoverImageId(remaining.length > 0 ? remaining[0].id : null);
        }
    };

    // Update existing caption
    const handleExistingCaptionChange = (imageId, value) => {
        setExistingCaptions((prev) => ({
            ...prev,
            [imageId]: value,
        }));
    };

    // Submit form
    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('title', title);
        if (eventCategoryId) formData.append('event_category_id', eventCategoryId);
        formData.append('description', description);
        if (eventDate) formData.append('event_date', eventDate);
        if (clientName) formData.append('client_name', clientName);
        if (location) formData.append('location', location);
        formData.append('is_featured', isFeatured ? '1' : '0');
        formData.append('is_published', isPublished ? '1' : '0');

        if (coverImageId) {
            formData.append('cover_image_id', coverImageId);
        }

        // Deleted images
        deletedImageIds.forEach((id) => {
            formData.append('deleted_image_ids[]', id);
        });

        // Existing captions
        Object.entries(existingCaptions).forEach(([id, cap]) => {
            formData.append(`existing_captions[${id}]`, cap);
        });

        // New files & captions
        newPreviews.forEach((item, index) => {
            formData.append('new_images[]', item.file);
            formData.append('new_captions[]', item.caption);
        });

        router.post(route('supplier.portfolio.update', portfolio.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                setProcessing(false);
            },
            onError: (errs) => {
                setProcessing(false);
                setErrors(errs);
            },
        });
    };

    return (
        <DashboardLayout>
            <Head title={`Edit "${portfolio.title}" - Supplier Dashboard`} />

            <div className="min-h-screen bg-gray-50/50 p-6 lg:p-10 dark:bg-gray-950">
                {/* Notification Flash */}
                {flash?.success && (
                    <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-sm dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white font-bold">
                                ✓
                            </span>
                            <p className="text-sm font-medium">{flash.success}</p>
                        </div>
                    </div>
                )}

                {/* Header & Breadcrumbs */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Link
                                href={route('supplier.portfolio.index')}
                                className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                                ← Back to Portfolio
                            </Link>
                            <span>/</span>
                            <span className="text-gray-900 dark:text-white">Edit Project</span>
                        </div>

                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Edit Portfolio Project
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Update project details, manage uploaded photos, or add more imagery.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('suppliers.portfolio.show', portfolio.supplier_id)}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <span>Preview Live</span>
                            <span>↗</span>
                        </Link>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Left 2 Columns: Details, Existing Photos, New Uploads */}
                        <div className="space-y-8 lg:col-span-2">
                            {/* Card: Project Essentials */}
                            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs sm:p-8 dark:border-gray-800 dark:bg-gray-900">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Project Essentials
                                </h2>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Edit the project headline and event information.
                                </p>

                                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                    {/* Title */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                            Project Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g., Sarah & John's Grand Wedding at Tagaytay"
                                            className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                        {errors.title && (
                                            <p className="mt-1 text-xs text-red-500">{errors.title}</p>
                                        )}
                                    </div>

                                    {/* Event Category */}
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                            Event Category
                                        </label>
                                        <select
                                            value={eventCategoryId}
                                            onChange={(e) => setEventCategoryId(e.target.value)}
                                            className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        >
                                            <option value="">Select Category (Optional)</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.event_category_id && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.event_category_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* Event Date */}
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                            Event Date
                                        </label>
                                        <input
                                            type="date"
                                            value={eventDate}
                                            onChange={(e) => setEventDate(e.target.value)}
                                            className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                        {errors.event_date && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.event_date}
                                            </p>
                                        )}
                                    </div>

                                    {/* Client Name */}
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                            Client / Couple Name
                                        </label>
                                        <input
                                            type="text"
                                            value={clientName}
                                            onChange={(e) => setClientName(e.target.value)}
                                            placeholder="e.g., Sarah & John Santos"
                                            className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                        {errors.client_name && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.client_name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Location / Venue */}
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                            Venue / Location
                                        </label>
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="e.g., Antonio's Tagaytay, Cavite"
                                            className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                        {errors.location && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.location}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Card: Project Description */}
                            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs sm:p-8 dark:border-gray-800 dark:bg-gray-900">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Project Description & Highlights
                                </h2>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Describe the theme, setup, special services provided, or client testimonials.
                                </p>

                                <div className="mt-6">
                                    <textarea
                                        rows={5}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Write an overview of this project..."
                                        className="w-full rounded-xl border border-gray-300 bg-white p-4 text-sm text-gray-900 shadow-xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-xs text-red-500">{errors.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Card: Existing Photos Gallery Manager */}
                            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs sm:p-8 dark:border-gray-800 dark:bg-gray-900">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                            Current Photos ({existingImages.length})
                                        </h2>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Choose a Cover Image, edit photo captions, or delete unwanted photos.
                                        </p>
                                    </div>
                                </div>

                                {existingImages.length > 0 ? (
                                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {existingImages.map((img) => {
                                            const isCover = coverImageId === img.id;
                                            return (
                                                <div
                                                    key={img.id}
                                                    className={`group relative flex flex-col overflow-hidden rounded-xl border p-2.5 transition ${
                                                        isCover
                                                            ? 'border-indigo-500 bg-indigo-50/20 ring-2 ring-indigo-500/20 dark:bg-indigo-950/20'
                                                            : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800'
                                                    }`}
                                                >
                                                    {/* Thumbnail */}
                                                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                                                        <img
                                                            src={img.image_url}
                                                            alt={img.caption || 'Portfolio photo'}
                                                            className="h-full w-full object-cover"
                                                        />

                                                        {/* Cover Photo Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setCoverImageId(img.id)}
                                                            className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold shadow-xs transition ${
                                                                isCover
                                                                    ? 'bg-indigo-600 text-white'
                                                                    : 'bg-black/60 text-white/90 hover:bg-black'
                                                            }`}
                                                        >
                                                            {isCover ? '★ Cover Photo' : 'Set as Cover'}
                                                        </button>

                                                        {/* Delete Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => markDeleteExisting(img.id)}
                                                            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600/90 text-xs font-bold text-white shadow-xs transition hover:bg-red-700"
                                                            title="Delete photo"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>

                                                    {/* Caption input */}
                                                    <div className="mt-2">
                                                        <input
                                                            type="text"
                                                            value={existingCaptions[img.id] ?? ''}
                                                            onChange={(e) =>
                                                                handleExistingCaptionChange(
                                                                    img.id,
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Photo caption..."
                                                            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-2 py-1 text-xs text-gray-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-6 text-center text-xs text-gray-400 dark:border-gray-800">
                                        No existing photos remain. Please upload new photos below.
                                    </div>
                                )}
                            </div>

                            {/* Card: Upload Additional Photos */}
                            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs sm:p-8 dark:border-gray-800 dark:bg-gray-900">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Upload More Photos
                                </h2>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Append new photos to this portfolio project.
                                </p>

                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                                        isDragging
                                            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                                            : 'border-gray-300 bg-gray-50/50 hover:border-indigo-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                                    }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                        onChange={handleFileInputChange}
                                        className="hidden"
                                    />
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-xl text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                                        ☁️
                                    </div>
                                    <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">
                                        Drag & drop more images here, or{' '}
                                        <span className="text-indigo-600 hover:underline dark:text-indigo-400">
                                            browse files
                                        </span>
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        JPG, PNG, or WEBP (Up to 5MB each)
                                    </p>
                                </div>

                                {/* New Previews Grid */}
                                {newPreviews.length > 0 && (
                                    <div className="mt-6 space-y-3">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                            New Photos to Add ({newPreviews.length})
                                        </p>

                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            {newPreviews.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="group relative flex flex-col overflow-hidden rounded-xl border border-indigo-200 bg-indigo-50/20 p-2 dark:border-indigo-900 dark:bg-indigo-950/20"
                                                >
                                                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                                                        <img
                                                            src={item.url}
                                                            alt={item.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <span className="absolute left-2 top-2 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                                            New
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeNewPreview(index)}
                                                            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600/90 text-xs font-bold text-white shadow-xs transition hover:bg-red-700"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>

                                                    <div className="mt-2 space-y-1.5">
                                                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                                                            <span className="line-clamp-1 max-w-[140px]">
                                                                {item.name}
                                                            </span>
                                                            <span>{item.size} MB</span>
                                                        </div>

                                                        <input
                                                            type="text"
                                                            value={item.caption}
                                                            onChange={(e) =>
                                                                handleNewCaptionChange(index, e.target.value)
                                                            }
                                                            placeholder="Add caption..."
                                                            className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900 transition focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Settings & Submit */}
                        <div className="space-y-6">
                            {/* Card: Visibility Settings */}
                            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    Publishing Options
                                </h3>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Control visibility and highlights.
                                </p>

                                <div className="mt-5 space-y-4">
                                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-3.5 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
                                        <input
                                            type="checkbox"
                                            checked={isPublished}
                                            onChange={(e) => setIsPublished(e.target.checked)}
                                            className="mt-0.5 h-4 w-4 rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <div>
                                            <span className="block text-xs font-semibold text-gray-900 dark:text-white">
                                                Published
                                            </span>
                                            <span className="block text-[11px] text-gray-500 dark:text-gray-400">
                                                Visible to customers in showcase.
                                            </span>
                                        </div>
                                    </label>

                                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-3.5 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
                                        <input
                                            type="checkbox"
                                            checked={isFeatured}
                                            onChange={(e) => setIsFeatured(e.target.checked)}
                                            className="mt-0.5 h-4 w-4 rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <div>
                                            <span className="block text-xs font-semibold text-gray-900 dark:text-white">
                                                ⭐ Featured Project
                                            </span>
                                            <span className="block text-[11px] text-gray-500 dark:text-gray-400">
                                                Pin at the top of your portfolio.
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Card: Actions */}
                            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-500 hover:to-indigo-600 hover:shadow-md disabled:opacity-50"
                                >
                                    {processing ? 'Saving Changes...' : 'Save Changes'}
                                </button>

                                <Link
                                    href={route('supplier.portfolio.index')}
                                    className="mt-3 block w-full rounded-xl border border-gray-300 py-2.5 text-center text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
