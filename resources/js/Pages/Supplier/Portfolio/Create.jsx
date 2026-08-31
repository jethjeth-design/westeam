import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useRef } from 'react';

export default function Create({ categories = [] }) {
    const fileInputRef = useRef(null);
    const [previewImages, setPreviewImages] = useState([]);
    const [coverIndex, setCoverIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        event_category_id: '',
        description: '',
        video_url: '',
        video_file: null,
        event_date: '',
        client_name: '',
        location: '',
        is_featured: false,
        is_published: true,
        images: [],
        cover_index: 0,
        captions: [],
    });

    // Handle file selection
    const handleFiles = (files) => {
        const fileList = Array.from(files).filter((file) =>
            file.type.startsWith('image/')
        );

        if (fileList.length === 0) return;

        const newPreviews = fileList.map((file) => ({
            file,
            url: URL.createObjectURL(file),
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2), // MB
            caption: '',
        }));

        const updatedPreviews = [...previewImages, ...newPreviews];
        setPreviewImages(updatedPreviews);

        const updatedFiles = updatedPreviews.map((p) => p.file);
        const updatedCaptions = updatedPreviews.map((p) => p.caption);

        setData((prev) => ({
            ...prev,
            images: updatedFiles,
            captions: updatedCaptions,
            cover_index: coverIndex,
        }));
    };

    const handleFileInputChange = (e) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    };

    // Drag and Drop
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

    // Remove an image from preview
    const removeImage = (indexToRemove) => {
        const updated = previewImages.filter((_, idx) => idx !== indexToRemove);
        setPreviewImages(updated);

        let newCover = coverIndex;
        if (coverIndex === indexToRemove) {
            newCover = 0;
        } else if (coverIndex > indexToRemove) {
            newCover = coverIndex - 1;
        }
        setCoverIndex(newCover);

        setData((prev) => ({
            ...prev,
            images: updated.map((p) => p.file),
            captions: updated.map((p) => p.caption),
            cover_index: newCover,
        }));
    };

    const selectCover = (index) => {
        setCoverIndex(index);
        setData('cover_index', index);
    };

    const handleCaptionChange = (index, value) => {
        const updated = [...previewImages];
        updated[index].caption = value;
        setPreviewImages(updated);

        const captions = updated.map((p) => p.caption);
        setData('captions', captions);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('supplier.portfolio.store'), {
            forceFormData: true,
        });
    };

    return (
        <DashboardLayout>
            <Head title="Create Portfolio Project - Supplier Dashboard" />

            <div className="min-h-screen bg-slate-50/60 p-6 lg:p-10">
                {/* Header & Back Link */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Link
                            href={route('supplier.portfolio.index')}
                            className="font-medium transition hover:text-indigo-600"
                        >
                            ← Back to Portfolio
                        </Link>
                        <span>/</span>
                        <span className="font-bold text-slate-900">Create New Project</span>
                    </div>

                    <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                        Add Portfolio Project
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Upload photos of your past events and tell the story behind your craftsmanship.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Left 2 Columns: Project Details & Story */}
                        <div className="space-y-8 lg:col-span-2">
                            {/* Card: Project Essentials */}
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
                                <h2 className="text-lg font-black text-slate-900">
                                    Project Essentials
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Provide basic information about this event or milestone.
                                </p>

                                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                    {/* Title */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                            Project Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
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
                                            value={data.event_category_id}
                                            onChange={(e) => setData('event_category_id', e.target.value)}
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
                                            value={data.event_date}
                                            onChange={(e) => setData('event_date', e.target.value)}
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
                                            value={data.client_name}
                                            onChange={(e) => setData('client_name', e.target.value)}
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
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
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

                            {/* Card: Project Story & Description */}
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
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Write a brief overview of this event project, key highlights, floral concepts, photography style, or unique features..."
                                        className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm text-slate-900 shadow-xs transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-xs text-red-500">{errors.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Card: Video Portfolio (Reel / Highlight) */}
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
                                            Add a highlight reel or showcase video from YouTube, Vimeo, direct MP4 link, or upload a video file.
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
                                                value={data.video_url}
                                                onChange={(e) => setData('video_url', e.target.value)}
                                                placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                                                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-xs transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                            />
                                            {data.video_url && (
                                                <button
                                                    type="button"
                                                    onClick={() => setData('video_url', '')}
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
                                        <span className="text-[11px] font-bold text-slate-400 uppercase">OR Upload Video File</span>
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
                                                    setData('video_file', e.target.files[0]);
                                                }
                                            }}
                                            className="mt-2 block w-full text-xs text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-purple-50 file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-purple-700 hover:file:bg-purple-100"
                                        />
                                        {errors.video_file && (
                                            <p className="mt-1 text-xs text-red-500">{errors.video_file}</p>
                                        )}
                                    </div>

                                    {/* Video URL Preview */}
                                    {data.video_url && (
                                        <div className="mt-4 overflow-hidden rounded-2xl border border-purple-100 bg-purple-50/30 p-4">
                                            <p className="mb-2 text-xs font-bold text-purple-900">
                                                Preview:
                                            </p>
                                            <div className="relative aspect-video w-full max-w-lg overflow-hidden rounded-xl bg-black">
                                                {data.video_url.includes('youtube.com') || data.video_url.includes('youtu.be') ? (
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${
                                                            data.video_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)?.[1] || ''
                                                        }`}
                                                        title="Video Preview"
                                                        className="h-full w-full border-0"
                                                        allowFullScreen
                                                    />
                                                ) : data.video_url.includes('vimeo.com') ? (
                                                    <iframe
                                                        src={`https://player.vimeo.com/video/${
                                                            data.video_url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)/)?.[1] || ''
                                                        }`}
                                                        title="Video Preview"
                                                        className="h-full w-full border-0"
                                                        allowFullScreen
                                                    />
                                                ) : (
                                                    <video src={data.video_url} controls className="h-full w-full object-contain" />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card: Photo Gallery Upload */}
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-lg font-black text-slate-900">
                                            Project Photos
                                        </h2>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Upload high resolution photos. Choose one image to be the Cover Photo.
                                        </p>
                                    </div>
                                    <span className="mt-2 text-xs font-bold text-indigo-600 sm:mt-0">
                                        {previewImages.length} photo(s) selected
                                    </span>
                                </div>

                                {/* Drag and Drop Dropzone */}
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
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl text-indigo-600">
                                        ☁️
                                    </div>
                                    <p className="mt-3 text-sm font-bold text-slate-900">
                                        Drag & drop images here, or{' '}
                                        <span className="text-indigo-600 hover:underline">
                                            browse files
                                        </span>
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Upload multiple JPG, PNG, or WEBP images (Up to 5MB each)
                                    </p>
                                </div>

                                {errors.images && (
                                    <p className="mt-2 text-xs text-red-500">{errors.images}</p>
                                )}

                                {/* Image Preview Grid */}
                                {previewImages.length > 0 && (
                                    <div className="mt-6 space-y-3">
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Selected Photos & Captions
                                        </p>

                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            {previewImages.map((item, index) => {
                                                const isCover = coverIndex === index;
                                                return (
                                                    <div
                                                        key={index}
                                                        className={`group relative flex flex-col overflow-hidden rounded-2xl border p-2.5 transition ${
                                                            isCover
                                                                ? 'border-indigo-500 bg-indigo-50/30 ring-2 ring-indigo-500/20'
                                                                : 'border-slate-200 bg-white'
                                                        }`}
                                                    >
                                                        {/* Thumbnail Box */}
                                                        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
                                                            <img
                                                                src={item.url}
                                                                alt={item.name}
                                                                className="h-full w-full object-cover"
                                                            />

                                                            {/* Cover Photo Badge */}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    selectCover(index);
                                                                }}
                                                                className={`absolute left-2 top-2 rounded-lg px-2.5 py-1 text-[10px] font-extrabold shadow-sm transition ${
                                                                    isCover
                                                                        ? 'bg-indigo-600 text-white'
                                                                        : 'bg-black/60 text-white/90 hover:bg-black'
                                                                }`}
                                                            >
                                                                {isCover ? '★ Cover Image' : 'Set as Cover'}
                                                            </button>

                                                            {/* Remove Button */}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeImage(index);
                                                                }}
                                                                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-xs transition hover:bg-red-700"
                                                                title="Remove Photo"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>

                                                        {/* Caption */}
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
                                                                    handleCaptionChange(index, e.target.value)
                                                                }
                                                                placeholder="Add caption (optional)..."
                                                                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs text-slate-900 transition focus:border-indigo-600 focus:bg-white focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Settings, Visibility & Actions */}
                        <div className="space-y-6">
                            {/* Card: Publishing Settings */}
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
                                <h3 className="text-base font-black text-slate-900">
                                    Publishing Options
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Control project visibility to clients.
                                </p>

                                <div className="mt-5 space-y-3.5">
                                    {/* Published Toggle */}
                                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50">
                                        <input
                                            type="checkbox"
                                            checked={data.is_published}
                                            onChange={(e) => setData('is_published', e.target.checked)}
                                            className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <div>
                                            <span className="block text-xs font-bold text-slate-900">
                                                Publish Project Immediately
                                            </span>
                                            <span className="block text-[11px] text-slate-500">
                                                Make this project publicly visible in your showcase.
                                            </span>
                                        </div>
                                    </label>

                                    {/* Featured Toggle */}
                                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50">
                                        <input
                                            type="checkbox"
                                            checked={data.is_featured}
                                            onChange={(e) => setData('is_featured', e.target.checked)}
                                            className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <div>
                                            <span className="block text-xs font-bold text-slate-900">
                                                ⭐ Feature on Profile
                                            </span>
                                            <span className="block text-[11px] text-slate-500">
                                                Pins this project to the top of your portfolio.
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
                                    {processing ? (
                                        <span>Saving Project...</span>
                                    ) : (
                                        <>
                                            <span>Save & Publish Project</span>
                                            <span>→</span>
                                        </>
                                    )}
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
