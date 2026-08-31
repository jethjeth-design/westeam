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
    const [videoUrl, setVideoUrl] = useState(portfolio.video_url || '');
    const [videoFile, setVideoFile] = useState(null);
    const [clearVideo, setClearVideo] = useState(false);

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

    const markDeleteExisting = (imageId) => {
        setDeletedImageIds((prev) => [...prev, imageId]);
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));

        if (coverImageId === imageId) {
            const remaining = existingImages.filter((img) => img.id !== imageId);
            setCoverImageId(remaining.length > 0 ? remaining[0].id : null);
        }
    };

    const handleExistingCaptionChange = (imageId, value) => {
        setExistingCaptions((prev) => ({
            ...prev,
            [imageId]: value,
        }));
    };

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

        if (clearVideo) {
            formData.append('clear_video', '1');
        } else if (videoFile) {
            formData.append('video_file', videoFile);
        } else {
            formData.append('video_url', videoUrl);
        }

        if (coverImageId) {
            formData.append('cover_image_id', coverImageId);
        }

        deletedImageIds.forEach((id) => {
            formData.append('deleted_image_ids[]', id);
        });

        Object.entries(existingCaptions).forEach(([id, cap]) => {
            formData.append(`existing_captions[${id}]`, cap);
        });

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

            <div className="min-h-screen bg-slate-50/60 p-6 lg:p-10">
                {/* Header & Breadcrumbs */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Link
                                href={route('supplier.portfolio.index')}
                                className="font-medium transition hover:text-indigo-600"
                            >
                                ← Back to Portfolio
                            </Link>
                            <span>/</span>
                            <span className="font-bold text-slate-900">Edit Project</span>
                        </div>

                        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                            Edit Portfolio Project
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Update project details, manage uploaded photos, or add more imagery.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('supplier.portfolio.show', portfolio.id)}
                            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-indigo-600"
                        >
                            <span>Show Portfolio</span>
                            <span>👁️</span>
                        </Link>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Left 2 Columns */}
                        <div className="space-y-8 lg:col-span-2">
                            {/* Card: Project Essentials */}
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
                                <h2 className="text-lg font-black text-slate-900">
                                    Project Essentials
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Edit the project headline and event information.
                                </p>

                                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                    {/* Title */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                            Project Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g., Sarah & John's Grand Wedding at Tagaytay"
                                            className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-xs transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                        />
                                        {errors.title && (
                                            <p className="mt-1 text-xs text-red-500">{errors.title}</p>
                                        )}
                                    </div>

                                    {/* Event Category */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                            Event Category
                                        </label>
                                        <select
                                            value={eventCategoryId}
                                            onChange={(e) => setEventCategoryId(e.target.value)}
                                            className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                            Event Date
                                        </label>
                                        <input
                                            type="date"
                                            value={eventDate}
                                            onChange={(e) => setEventDate(e.target.value)}
                                            className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                        />
                                        {errors.event_date && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.event_date}
                                            </p>
                                        )}
                                    </div>

                                    {/* Client Name */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                            Client / Couple Name
                                        </label>
                                        <input
                                            type="text"
                                            value={clientName}
                                            onChange={(e) => setClientName(e.target.value)}
                                            placeholder="e.g., Sarah & John Santos"
                                            className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-xs transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                        />
                                        {errors.client_name && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.client_name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Location / Venue */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                            Venue / Location
                                        </label>
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="e.g., Antonio's Tagaytay, Cavite"
                                            className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-xs transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
                                <h2 className="text-lg font-black text-slate-900">
                                    Project Description & Highlights
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Describe the theme, setup, special services provided, or client testimonials.
                                </p>

                                <div className="mt-6">
                                    <textarea
                                        rows={5}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Write an overview of this project..."
                                        className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm text-slate-900 shadow-xs transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-xs text-red-500">{errors.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Card: Video Portfolio */}
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-base">
                                        🎥
                                    </span>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-900">
                                            Video Portfolio (Optional)
                                        </h2>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Add or update a highlight reel from YouTube, Vimeo, direct MP4 link, or upload a video file.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                            Video URL (YouTube / Vimeo / MP4 link)
                                        </label>
                                        <div className="relative mt-2">
                                            <input
                                                type="url"
                                                value={videoUrl}
                                                onChange={(e) => {
                                                    setVideoUrl(e.target.value);
                                                    setClearVideo(false);
                                                }}
                                                placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                                                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-xs transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                            />
                                            {videoUrl && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setVideoUrl('');
                                                        setClearVideo(true);
                                                    }}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 hover:text-slate-600"
                                                >
                                                    ✕ Clear
                                                </button>
                                            )}
                                        </div>
                                        {errors.video_url && (
                                            <p className="mt-1 text-xs text-red-500">{errors.video_url}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="h-px flex-1 bg-slate-200" />
                                        <span className="text-[11px] font-bold text-slate-400 uppercase">OR Upload New Video File</span>
                                        <div className="h-px flex-1 bg-slate-200" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                            Upload Video File (MP4, WEBM, MOV up to 50MB)
                                        </label>
                                        <input
                                            type="file"
                                            accept="video/mp4,video/webm,video/ogg,video/quicktime"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    setVideoFile(e.target.files[0]);
                                                    setClearVideo(false);
                                                }
                                            }}
                                            className="mt-2 block w-full text-xs text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-purple-50 file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-purple-700 hover:file:bg-purple-100"
                                        />
                                        {errors.video_file && (
                                            <p className="mt-1 text-xs text-red-500">{errors.video_file}</p>
                                        )}
                                    </div>

                                    {/* Video URL Preview */}
                                    {videoUrl && !clearVideo && (
                                        <div className="mt-4 overflow-hidden rounded-2xl border border-purple-100 bg-purple-50/30 p-4">
                                            <p className="mb-2 text-xs font-bold text-purple-900">
                                                Preview Video:
                                            </p>
                                            <div className="relative aspect-video w-full max-w-lg overflow-hidden rounded-xl bg-black">
                                                {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${
                                                            videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)?.[1] || ''
                                                        }`}
                                                        title="Video Preview"
                                                        className="h-full w-full border-0"
                                                        allowFullScreen
                                                    />
                                                ) : videoUrl.includes('vimeo.com') ? (
                                                    <iframe
                                                        src={`https://player.vimeo.com/video/${
                                                            videoUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)/)?.[1] || ''
                                                        }`}
                                                        title="Video Preview"
                                                        className="h-full w-full border-0"
                                                        allowFullScreen
                                                    />
                                                ) : (
                                                    <video src={videoUrl} controls className="h-full w-full object-contain" />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card: Existing Photos Gallery Manager */}
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-black text-slate-900">
                                            Current Photos ({existingImages.length})
                                        </h2>
                                        <p className="mt-1 text-xs text-slate-500">
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
                                                    className={`group relative flex flex-col overflow-hidden rounded-2xl border p-2.5 transition ${
                                                        isCover
                                                            ? 'border-indigo-500 bg-indigo-50/30 ring-2 ring-indigo-500/20'
                                                            : 'border-slate-200 bg-white'
                                                    }`}
                                                >
                                                    {/* Thumbnail */}
                                                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
                                                        <img
                                                            src={img.image_url}
                                                            alt={img.caption || 'Portfolio photo'}
                                                            className="h-full w-full object-cover"
                                                        />

                                                        {/* Cover Photo Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setCoverImageId(img.id)}
                                                            className={`absolute left-2 top-2 rounded-lg px-2.5 py-1 text-[10px] font-extrabold shadow-sm transition ${
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
                                                            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-xs transition hover:bg-red-700"
                                                            title="Delete photo"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>

                                                    {/* Caption input */}
                                                    <div className="mt-2.5">
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
                                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs text-slate-900 transition focus:border-indigo-600 focus:bg-white focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400">
                                        No existing photos remain. Please upload new photos below.
                                    </div>
                                )}
                            </div>

                            {/* Card: Upload Additional Photos */}
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
                                <h2 className="text-lg font-black text-slate-900">
                                    Upload More Photos
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Append new photos to this portfolio project.
                                </p>

                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-all ${
                                        isDragging
                                            ? 'border-indigo-500 bg-indigo-50/50'
                                            : 'border-slate-300 bg-slate-50/50 hover:border-indigo-400 hover:bg-slate-50'
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
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-xl text-indigo-600">
                                        ☁️
                                    </div>
                                    <p className="mt-3 text-sm font-bold text-slate-900">
                                        Drag & drop more images here, or{' '}
                                        <span className="text-indigo-600 hover:underline">
                                            browse files
                                        </span>
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        JPG, PNG, or WEBP (Up to 5MB each)
                                    </p>
                                </div>

                                {/* New Previews Grid */}
                                {newPreviews.length > 0 && (
                                    <div className="mt-6 space-y-3">
                                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                                            New Photos to Add ({newPreviews.length})
                                        </p>

                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            {newPreviews.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-indigo-200 bg-indigo-50/30 p-2.5"
                                                >
                                                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
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
                                                            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-xs transition hover:bg-red-700"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>

                                                    <div className="mt-2.5 space-y-1.5">
                                                        <div className="flex items-center justify-between text-[11px] text-slate-500">
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
                                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 transition focus:border-indigo-600 focus:outline-none"
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
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
                                <h3 className="text-base font-black text-slate-900">
                                    Publishing Options
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Control visibility and highlights.
                                </p>

                                <div className="mt-5 space-y-3.5">
                                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50">
                                        <input
                                            type="checkbox"
                                            checked={isPublished}
                                            onChange={(e) => setIsPublished(e.target.checked)}
                                            className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <div>
                                            <span className="block text-xs font-bold text-slate-900">
                                                Published
                                            </span>
                                            <span className="block text-[11px] text-slate-500">
                                                Visible to customers in showcase.
                                            </span>
                                        </div>
                                    </label>

                                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50">
                                        <input
                                            type="checkbox"
                                            checked={isFeatured}
                                            onChange={(e) => setIsFeatured(e.target.checked)}
                                            className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <div>
                                            <span className="block text-xs font-bold text-slate-900">
                                                ⭐ Featured Project
                                            </span>
                                            <span className="block text-[11px] text-slate-500">
                                                Pin at the top of your portfolio.
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Card: Actions */}
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? 'Saving Changes...' : 'Save Changes'}
                                </button>

                                <Link
                                    href={route('supplier.portfolio.index')}
                                    className="mt-3 block w-full rounded-2xl border border-slate-300 py-2.5 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-50"
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
