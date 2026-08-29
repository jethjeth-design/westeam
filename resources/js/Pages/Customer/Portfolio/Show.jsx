import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({
    portfolio,
    relatedPortfolios = [],
}) {
    const supplier = portfolio?.supplier;
    const profile =
        supplier?.supplier_profile ||
        supplier?.supplierProfile;

    const businessName =
        profile?.business_name ||
        supplier?.name ||
        'Event Supplier';

    const [lightboxIndex, setLightboxIndex] = useState(null);

    const images = portfolio?.images || [];

    const getImageUrl = (image) => {
        if (!image) {
            return '/images/placeholder.jpg';
        }

        if (image.image_url) {
            return image.image_url;
        }

        if (image.url) {
            return image.url;
        }

        if (image.path) {
            if (
                image.path.startsWith('http://') ||
                image.path.startsWith('https://') ||
                image.path.startsWith('/')
            ) {
                return image.path;
            }

            return `/storage/${image.path}`;
        }

        if (image.image) {
            if (
                image.image.startsWith('http://') ||
                image.image.startsWith('https://') ||
                image.image.startsWith('/')
            ) {
                return image.image;
            }

            return `/storage/${image.image}`;
        }

        return '/images/placeholder.jpg';
    };

    const openLightbox = (index) => {
        setLightboxIndex(index);
    };

    const closeLightbox = () => {
        setLightboxIndex(null);
    };

    const nextImage = () => {
        if (images.length === 0) return;
        setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const prevImage = () => {
        if (images.length === 0) return;
        setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleKeyDown = (event) => {
        if (lightboxIndex === null) return;
        if (event.key === 'Escape') closeLightbox();
        if (event.key === 'ArrowRight') nextImage();
        if (event.key === 'ArrowLeft') prevImage();
    };

    const getPortfolioCover = (item) => {
        if (!item) return '/images/placeholder.jpg';
        if (item.cover_image_url) return item.cover_image_url;
        if (item.cover_image?.image_url) return item.cover_image.image_url;
        if (item.cover_image?.url) return item.cover_image.url;
        return '/images/placeholder.jpg';
    };

    return (
        <>
            <Head title={`${portfolio?.title || 'Portfolio'} - ${businessName}`} />

            <div
                className="min-h-screen bg-slate-50 text-slate-900"
                tabIndex={-1}
                onKeyDown={handleKeyDown}
            >
                {/* Header */}
                <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <Link
                            href={route('customer.suppliers.portfolio', portfolio.supplier_id)}
                            className="flex items-center gap-2 text-xs font-bold text-slate-600 transition hover:text-indigo-600"
                        >
                            <span className="text-base">←</span>
                            <span>Back to {businessName}'s Portfolio</span>
                        </Link>

                        <div className="flex items-center gap-3">
                            <Link
                                href={route('customer.suppliers.show', portfolio.supplier_id)}
                                className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                            >
                                View Supplier Details
                            </Link>
                            <Link
                                href={route('customer.dashboard')}
                                className="rounded-xl bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
                            >
                                Dashboard
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Project Showcase Top Header */}
                <section className="border-b border-slate-200/80 bg-white">
                    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="flex flex-wrap items-center gap-2">
                            {portfolio?.event_category && (
                                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-600/10">
                                    {portfolio.event_category.name}
                                </span>
                            )}
                            {portfolio?.is_featured && (
                                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/10">
                                    ⭐ Featured Showcase
                                </span>
                            )}
                        </div>

                        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                            {portfolio?.title}
                        </h1>

                        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-500">
                            {portfolio?.client_name && (
                                <div className="flex items-center gap-1.5">
                                    <span>👤</span>
                                    <span className="font-semibold text-slate-700">Client: {portfolio.client_name}</span>
                                </div>
                            )}
                            {portfolio?.event_date && (
                                <div className="flex items-center gap-1.5">
                                    <span>📅</span>
                                    <span className="font-semibold text-slate-700">
                                        {new Date(portfolio.event_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                            )}
                            {portfolio?.location && (
                                <div className="flex items-center gap-1.5">
                                    <span>📍</span>
                                    <span className="font-semibold text-slate-700">{portfolio.location}</span>
                                </div>
                            )}
                        </div>

                        {portfolio?.description && (
                            <div className="mt-8 rounded-3xl border border-slate-100 bg-slate-50/80 p-6 sm:p-8">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Project Overview & Highlights
                                </h3>
                                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                                    {portfolio.description}
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Photo Gallery Grid */}
                <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900">
                                Photo Gallery
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Showing {images.length} {images.length === 1 ? 'photograph' : 'photographs'}
                            </p>
                        </div>

                        {images.length > 0 && (
                            <p className="text-xs text-indigo-600 font-semibold">
                                Click any photo to view in high resolution
                            </p>
                        )}
                    </div>

                    {images.length > 0 ? (
                        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {images.map((image, index) => (
                                <button
                                    type="button"
                                    key={image.id || index}
                                    onClick={() => openLightbox(index)}
                                    className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white text-left shadow-xs transition duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl"
                                >
                                    <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                                        <img
                                            src={getImageUrl(image)}
                                            alt={image.caption || portfolio.title}
                                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                            onError={(event) => {
                                                event.currentTarget.src = '/images/placeholder.jpg';
                                            }}
                                        />
                                    </div>

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

                                    <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                        <span className="inline-flex rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-md">
                                            View Photo 🔍
                                        </span>
                                    </div>

                                    {/* Caption */}
                                    {image.caption && (
                                        <div className="p-4">
                                            <p className="line-clamp-2 text-xs font-medium text-slate-600">
                                                {image.caption}
                                            </p>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-8 rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                            <div className="text-4xl">📷</div>
                            <h3 className="mt-3 text-base font-bold text-slate-900">
                                No photos available
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                This supplier has not attached photographs to this project yet.
                            </p>
                        </div>
                    )}

                    {/* Related Projects */}
                    {relatedPortfolios.length > 0 && (
                        <section className="mt-16 border-t border-slate-200/80 pt-12">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">
                                        More Projects from {businessName}
                                    </h2>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Explore additional milestones and event themes.
                                    </p>
                                </div>

                                <Link
                                    href={route('customer.suppliers.portfolio', portfolio.supplier_id)}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                                >
                                    View All Works →
                                </Link>
                            </div>

                            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {relatedPortfolios.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={route('customer.portfolios.show', item.id)}
                                        className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
                                    >
                                        <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                                            <img
                                                src={getPortfolioCover(item)}
                                                alt={item.title || 'Portfolio project'}
                                                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                            />
                                        </div>

                                        <div className="p-5">
                                            <h4 className="line-clamp-1 text-sm font-bold text-slate-900 transition group-hover:text-indigo-600">
                                                {item.title}
                                            </h4>
                                            <p className="mt-1 text-[11px] font-medium text-slate-500">
                                                {item.event_category?.name || 'Event'}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                {/* Lightbox */}
                {lightboxIndex !== null && images[lightboxIndex] && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 p-4 backdrop-blur-md"
                        onClick={closeLightbox}
                    >
                        <button
                            type="button"
                            onClick={closeLightbox}
                            className="absolute right-5 top-5 z-50 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold text-white transition hover:bg-white/30"
                        >
                            ✕
                        </button>

                        {images.length > 1 && (
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    prevImage();
                                }}
                                className="absolute left-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-2xl bg-white/20 text-2xl text-white transition hover:bg-white/30"
                            >
                                ‹
                            </button>
                        )}

                        <div
                            className="relative max-h-[85vh] max-w-5xl text-center"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <img
                                src={getImageUrl(images[lightboxIndex])}
                                alt={images[lightboxIndex]?.caption || portfolio.title}
                                className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl"
                            />

                            {images[lightboxIndex]?.caption && (
                                <p className="mt-3 text-xs text-white/90">
                                    {images[lightboxIndex].caption}
                                </p>
                            )}

                            <p className="mt-1 text-[11px] text-white/60 font-mono">
                                {lightboxIndex + 1} / {images.length}
                            </p>
                        </div>

                        {images.length > 1 && (
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    nextImage();
                                }}
                                className="absolute right-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-2xl bg-white/20 text-2xl text-white transition hover:bg-white/30"
                            >
                                ›
                            </button>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}