import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';

export default function Show({ portfolio }) {
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const images = portfolio?.images || [];
    const category = portfolio?.event_category;

    const getImageUrl = (image) => {
        if (!image) return '/images/placeholder.jpg';
        if (image.image_url) return image.image_url;
        if (image.url) return image.url;
        if (image.image_path) {
            return image.image_path.startsWith('http') || image.image_path.startsWith('/')
                ? image.image_path
                : `/storage/${image.image_path}`;
        }
        return '/images/placeholder.jpg';
    };

    const nextImage = useCallback(() => {
        if (images.length === 0) return;
        setLightboxIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }, [images.length]);

    const prevImage = useCallback(() => {
        if (images.length === 0) return;
        setLightboxIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    }, [images.length]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (lightboxIndex === null) return;
            if (e.key === 'Escape') setLightboxIndex(null);
            else if (e.key === 'ArrowRight') nextImage();
            else if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, nextImage, prevImage]);

    // Parse video embeds (YouTube / Vimeo / Direct Video)
    const renderVideoPlayer = (url) => {
        if (!url) return null;

        // YouTube
        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        if (ytMatch) {
            return (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
                    <iframe
                        src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full border-0"
                    />
                </div>
            );
        }

        // Vimeo
        const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
        if (vimeoMatch) {
            return (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
                    <iframe
                        src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
                        title="Vimeo video player"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full border-0"
                    />
                </div>
            );
        }

        // Direct Video File (MP4, WebM, etc.) or storage path
        return (
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
                <video
                    src={url}
                    controls
                    className="h-full w-full object-contain"
                >
                    Your browser does not support the video tag.
                </video>
            </div>
        );
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${portfolio.title}"?`)) {
            setIsDeleting(true);
            router.delete(route('supplier.portfolio.destroy', portfolio.id), {
                onFinish: () => setIsDeleting(false),
            });
        }
    };

    return (
        <DashboardLayout>
            <Head title={`${portfolio.title} — Portfolio Details`} />

            <div className="min-h-screen bg-slate-50/60 p-6 lg:p-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    {/* Top Navigation & Actions Bar */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <Link
                                href={route('supplier.portfolio.index')}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-indigo-600"
                            >
                                <span>←</span>
                                <span>Back to Portfolios</span>
                            </Link>

                            <span className="text-xs text-slate-300">/</span>
                            <span className="truncate text-xs font-semibold text-slate-500 max-w-[200px]">
                                {portfolio.title}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                href={route('supplier.portfolio.edit', portfolio.id)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700"
                            >
                                <span>✏️</span>
                                <span>Edit Project</span>
                            </Link>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-bold text-red-600 shadow-2xs transition hover:bg-red-50 disabled:opacity-50"
                            >
                                <span>🗑️</span>
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>

                    {/* Hero Header Card */}
                    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
                        <div className="flex flex-wrap items-center gap-2.5">
                            {category && (
                                <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                                    {category.name}
                                </span>
                            )}

                            {portfolio.is_featured && (
                                <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                                    ⭐ Featured Project
                                </span>
                            )}

                            <span
                                className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                                    portfolio.is_published
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-slate-100 text-slate-600'
                                }`}
                            >
                                {portfolio.is_published ? '● Published' : '○ Draft (Hidden)'}
                            </span>

                            {portfolio.video_url && (
                                <span className="rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">
                                    🎥 Video Included
                                </span>
                            )}
                        </div>

                        <h1 className="mt-3 text-2xl sm:text-3xl font-black text-slate-900">
                            {portfolio.title}
                        </h1>

                        {portfolio.description && (
                            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                                {portfolio.description}
                            </p>
                        )}

                        {/* Metadata Pills */}
                        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-100 pt-5 text-xs text-slate-500">
                            {portfolio.client_name && (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-slate-400">👤 Client:</span>
                                    <strong className="text-slate-800">{portfolio.client_name}</strong>
                                </div>
                            )}

                            {portfolio.event_date && (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-slate-400">📅 Event Date:</span>
                                    <strong className="text-slate-800">
                                        {new Date(portfolio.event_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </strong>
                                </div>
                            )}

                            {portfolio.location && (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-slate-400">📍 Location:</span>
                                    <strong className="text-slate-800">{portfolio.location}</strong>
                                </div>
                            )}

                            <div className="flex items-center gap-1.5">
                                <span className="text-slate-400">🖼️ Photos:</span>
                                <strong className="text-slate-800">{images.length} uploaded</strong>
                            </div>
                        </div>
                    </div>

                    {/* Video Portfolio Section (if present) */}
                    {portfolio.video_url && (
                        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-base">
                                        🎥
                                    </span>
                                    <div>
                                        <h2 className="text-base font-extrabold text-slate-900">
                                            Video Portfolio Reel
                                        </h2>
                                        <p className="text-xs text-slate-400">
                                            Embedded highlight video or reel for this project
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="max-w-4xl mx-auto">
                                {renderVideoPlayer(portfolio.video_url)}
                            </div>
                        </div>
                    )}

                    {/* Image Gallery Section */}
                    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900">
                                    Project Photo Gallery ({images.length})
                                </h2>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    Click any image to view full high-resolution lightbox
                                </p>
                            </div>

                            <Link
                                href={route('supplier.portfolio.edit', portfolio.id)}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                            >
                                + Add / Manage Photos
                            </Link>
                        </div>

                        {images.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                {images.map((img, idx) => {
                                    const imgUrl = getImageUrl(img);
                                    return (
                                        <div
                                            key={img.id || idx}
                                            onClick={() => setLightboxIndex(idx)}
                                            className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/70 transition hover:shadow-lg"
                                        >
                                            <img
                                                src={imgUrl}
                                                alt={img.caption || `Portfolio image ${idx + 1}`}
                                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                            />

                                            {img.is_cover && (
                                                <span className="absolute top-2 left-2 rounded-lg bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                                    ★ Cover
                                                </span>
                                            )}

                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                                <span className="text-xs font-bold bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                                                    🔍 View
                                                </span>
                                            </div>

                                            {img.caption && (
                                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-[11px] text-white truncate">
                                                    {img.caption}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                                No photos attached to this portfolio yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Lightbox Modal */}
                {lightboxIndex !== null && images[lightboxIndex] && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
                        onClick={() => setLightboxIndex(null)}
                    >
                        <button
                            type="button"
                            onClick={() => setLightboxIndex(null)}
                            className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 text-lg transition"
                        >
                            ✕
                        </button>

                        {images.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        prevImage();
                                    }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 text-xl transition"
                                >
                                    ‹
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        nextImage();
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 text-xl transition"
                                >
                                    ›
                                </button>
                            </>
                        )}

                        <div
                            className="relative max-h-[85vh] max-w-5xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={getImageUrl(images[lightboxIndex])}
                                alt={images[lightboxIndex].caption || 'Portfolio photo'}
                                className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl"
                            />
                            {images[lightboxIndex].caption && (
                                <p className="mt-2 text-center text-xs font-semibold text-white/90">
                                    {images[lightboxIndex].caption}
                                </p>
                            )}
                            <p className="mt-1 text-center text-[11px] text-white/50">
                                {lightboxIndex + 1} of {images.length}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
