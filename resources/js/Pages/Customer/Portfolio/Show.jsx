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

    /*
    |--------------------------------------------------------------------------
    | Portfolio Images
    |--------------------------------------------------------------------------
    */

    const images = portfolio?.images || [];

    /*
    |--------------------------------------------------------------------------
    | Get Image URL
    |--------------------------------------------------------------------------
    */

    const getImageUrl = (image) => {
        if (!image) {
            return '/images/placeholder.jpg';
        }

        // If Laravel provides image_url
        if (image.image_url) {
            return image.image_url;
        }

        // If image contains url
        if (image.url) {
            return image.url;
        }

        // If image contains path
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

        // If image contains image
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

    /*
    |--------------------------------------------------------------------------
    | Lightbox
    |--------------------------------------------------------------------------
    */

    const openLightbox = (index) => {
        setLightboxIndex(index);
    };

    const closeLightbox = () => {
        setLightboxIndex(null);
    };

    const nextImage = () => {
        if (images.length === 0) {
            return;
        }

        setLightboxIndex((prev) =>
            prev === images.length - 1
                ? 0
                : prev + 1
        );
    };

    const prevImage = () => {
        if (images.length === 0) {
            return;
        }

        setLightboxIndex((prev) =>
            prev === 0
                ? images.length - 1
                : prev - 1
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Keyboard Navigation
    |--------------------------------------------------------------------------
    */

    const handleKeyDown = (event) => {
        if (lightboxIndex === null) {
            return;
        }

        if (event.key === 'Escape') {
            closeLightbox();
        }

        if (event.key === 'ArrowRight') {
            nextImage();
        }

        if (event.key === 'ArrowLeft') {
            prevImage();
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Cover Image For Related Portfolio
    |--------------------------------------------------------------------------
    */

    const getPortfolioCover = (item) => {
        if (!item) {
            return '/images/placeholder.jpg';
        }

        if (item.cover_image_url) {
            return item.cover_image_url;
        }

        if (item.cover_image?.image_url) {
            return item.cover_image.image_url;
        }

        if (item.cover_image?.url) {
            return item.cover_image.url;
        }

        if (item.cover_image?.path) {
            if (
                item.cover_image.path.startsWith('http://') ||
                item.cover_image.path.startsWith('https://') ||
                item.cover_image.path.startsWith('/')
            ) {
                return item.cover_image.path;
            }

            return `/storage/${item.cover_image.path}`;
        }

        if (item.cover_image?.image) {
            if (
                item.cover_image.image.startsWith('http://') ||
                item.cover_image.image.startsWith('https://') ||
                item.cover_image.image.startsWith('/')
            ) {
                return item.cover_image.image;
            }

            return `/storage/${item.cover_image.image}`;
        }

        return '/images/placeholder.jpg';
    };

    return (
        <>
            <Head
                title={`${portfolio?.title || 'Portfolio'} - ${businessName}`}
            />

            <div
                className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100"
                tabIndex={-1}
                onKeyDown={handleKeyDown}
            >
                {/* =========================================================
                    HEADER
                ========================================================== */}

                <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/90 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-900/90">

                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

                        {/* Back to Supplier Portfolio */}

                        <Link
                            href={route(
                                'customer.suppliers.portfolio',
                                portfolio.supplier_id
                            )}
                            className="flex items-center gap-2 text-sm font-semibold text-gray-700 transition hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
                        >
                            <span className="text-lg">
                                ←
                            </span>

                            <span>
                                Back to {businessName}'s Portfolio
                            </span>
                        </Link>

                        {/* Home */}

                        <Link
                            href={route('customer.dashboard')}
                            className="text-sm font-semibold text-gray-500 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                            Dashboard
                        </Link>

                    </div>
                </header>


                {/* =========================================================
                    PROJECT HEADER
                ========================================================== */}

                <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">

                    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">

                        {/* Categories */}

                        <div className="flex flex-wrap items-center gap-2">

                            {portfolio?.event_category && (
                                <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                                    {portfolio.event_category.name}
                                </span>
                            )}

                            {portfolio?.is_featured && (
                                <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                    ⭐ Featured Project
                                </span>
                            )}

                        </div>


                        {/* Title */}

                        <h1 className="mt-5 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
                            {portfolio?.title}
                        </h1>


                        {/* Supplier */}

                        <div className="mt-5">

                            <Link
                                href={route(
                                    'customer.suppliers.portfolio',
                                    portfolio.supplier_id
                                )}
                                className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                                <span>
                                    View {businessName}'s complete portfolio
                                </span>

                                <span>
                                    →
                                </span>
                            </Link>

                        </div>


                        {/* Metadata */}

                        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-600 dark:text-gray-300">

                            {portfolio?.client_name && (
                                <div className="flex items-center gap-2">
                                    <span>👤</span>
                                    <span>
                                        {portfolio.client_name}
                                    </span>
                                </div>
                            )}

                            {portfolio?.event_date && (
                                <div className="flex items-center gap-2">
                                    <span>📅</span>

                                    <span>
                                        {new Date(
                                            portfolio.event_date
                                        ).toLocaleDateString(
                                            'en-US',
                                            {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            }
                                        )}
                                    </span>
                                </div>
                            )}

                            {portfolio?.location && (
                                <div className="flex items-center gap-2">
                                    <span>📍</span>

                                    <span>
                                        {portfolio.location}
                                    </span>
                                </div>
                            )}

                        </div>


                        {/* Description */}

                        {portfolio?.description && (
                            <div className="mt-8 rounded-2xl bg-gray-50 p-6 dark:bg-gray-800/50">

                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Project Overview
                                </h3>

                                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-700 dark:text-gray-300">
                                    {portfolio.description}
                                </p>

                            </div>
                        )}

                    </div>

                </section>


                {/* =========================================================
                    GALLERY
                ========================================================== */}

                <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

                        <div>

                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                                Photo Gallery
                            </h2>

                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {images.length}{' '}
                                {images.length === 1
                                    ? 'photo'
                                    : 'photos'}
                            </p>

                        </div>

                        {images.length > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Click an image to view it
                            </p>
                        )}

                    </div>


                    {/* =====================================================
                        IMAGE GRID
                    ====================================================== */}

                    {images.length > 0 ? (

                        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                            {images.map((image, index) => (

                                <button
                                    type="button"
                                    key={image.id || index}
                                    onClick={() =>
                                        openLightbox(index)
                                    }
                                    className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
                                >

                                    <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">

                                        <img
                                            src={getImageUrl(image)}
                                            alt={
                                                image.caption ||
                                                portfolio.title
                                            }
                                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                            onError={(event) => {
                                                event.currentTarget.src =
                                                    '/images/placeholder.jpg';
                                            }}
                                        />

                                    </div>


                                    {/* Overlay */}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

                                    <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">

                                        <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold text-gray-900 shadow-lg">
                                            View Photo →
                                        </span>

                                    </div>


                                    {/* Caption */}

                                    {image.caption && (
                                        <div className="p-4">

                                            <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                                                {image.caption}
                                            </p>

                                        </div>
                                    )}

                                </button>

                            ))}

                        </div>

                    ) : (

                        <div className="mt-8 rounded-3xl border-2 border-dashed border-gray-300 bg-white px-6 py-20 text-center dark:border-gray-800 dark:bg-gray-900">

                            <div className="text-5xl">
                                📷
                            </div>

                            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                                No photos yet
                            </h3>

                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                This supplier has not uploaded photos
                                for this project yet.
                            </p>

                        </div>

                    )}


                    {/* =====================================================
                        RELATED PROJECTS
                    ====================================================== */}

                    {relatedPortfolios.length > 0 && (

                        <section className="mt-16 border-t border-gray-200 pt-12 dark:border-gray-800">

                            <div className="flex items-center justify-between">

                                <div>

                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                                        More Works from {businessName}
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Explore more projects from this supplier.
                                    </p>

                                </div>

                                <Link
                                    href={route(
                                        'customer.suppliers.portfolio',
                                        portfolio.supplier_id
                                    )}
                                    className="hidden text-sm font-bold text-indigo-600 hover:text-indigo-700 sm:block dark:text-indigo-400"
                                >
                                    View All →
                                </Link>

                            </div>


                            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                                {relatedPortfolios.map(
                                    (item) => (

                                        <Link
                                            key={item.id}
                                            href={route(
                                                'customer.portfolios.show',
                                                item.id
                                            )}
                                            className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
                                        >

                                            <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">

                                                <img
                                                    src={getPortfolioCover(item)}
                                                    alt={
                                                        item.title ||
                                                        'Portfolio project'
                                                    }
                                                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                                    onError={(
                                                        event
                                                    ) => {
                                                        event.currentTarget.src =
                                                            '/images/placeholder.jpg';
                                                    }}
                                                />

                                            </div>

                                            <div className="p-5">

                                                <h4 className="line-clamp-1 text-base font-bold text-gray-900 transition group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                                                    {item.title}
                                                </h4>

                                                <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    {item
                                                        .event_category
                                                        ?.name ||
                                                        'Event'}
                                                </p>

                                            </div>

                                        </Link>

                                    )
                                )}

                            </div>

                        </section>

                    )}

                </main>


                {/* =========================================================
                    LIGHTBOX
                ========================================================== */}

                {lightboxIndex !== null &&
                    images[lightboxIndex] && (

                        <div
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
                            onClick={closeLightbox}
                        >

                            {/* Close */}

                            <button
                                type="button"
                                onClick={closeLightbox}
                                className="absolute right-5 top-5 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xl font-bold text-white transition hover:bg-white/20"
                            >
                                ✕
                            </button>


                            {/* Previous */}

                            {images.length > 1 && (
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        prevImage();
                                    }}
                                    className="absolute left-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition hover:bg-white/20"
                                >
                                    ‹
                                </button>
                            )}


                            {/* Image */}

                            <div
                                className="relative max-h-[90vh] max-w-6xl text-center"
                                onClick={(event) =>
                                    event.stopPropagation()
                                }
                            >

                                <img
                                    src={getImageUrl(
                                        images[lightboxIndex]
                                    )}
                                    alt={
                                        images[lightboxIndex]
                                            ?.caption ||
                                        portfolio.title
                                    }
                                    className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
                                />

                                {images[lightboxIndex]
                                    ?.caption && (
                                        <p className="mt-4 text-sm text-white/90">
                                            {
                                                images[
                                                    lightboxIndex
                                                ].caption
                                            }
                                        </p>
                                    )}

                                <p className="mt-2 text-xs text-white/50">
                                    {lightboxIndex + 1} /{' '}
                                    {images.length}
                                </p>

                            </div>


                            {/* Next */}

                            {images.length > 1 && (
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        nextImage();
                                    }}
                                    className="absolute right-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition hover:bg-white/20"
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