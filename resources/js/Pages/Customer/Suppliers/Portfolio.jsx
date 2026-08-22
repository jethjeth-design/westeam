import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useMemo, useCallback } from 'react';

export default function Portfolio({
    supplier,
    portfolios = [],
    categories = [],
    selectedCategory = 'all',
}) {
    /*
    |--------------------------------------------------------------------------
    | Supplier Profile
    |--------------------------------------------------------------------------
    */

    const profile =
        supplier?.supplier_profile ||
        supplier?.supplierProfile ||
        null;

    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    const [currentCategory, setCurrentCategory] =
        useState(selectedCategory || 'all');

    const [searchQuery, setSearchQuery] = useState('');

    const [activeProject, setActiveProject] =
        useState(null);

    const [activeImageIndex, setActiveImageIndex] =
        useState(0);

    /*
    |--------------------------------------------------------------------------
    | Supplier Information
    |--------------------------------------------------------------------------
    */

    const businessName =
        profile?.business_name ||
        supplier?.name ||
        'Event Supplier';

    const supplierId =
        supplier?.id;

    /*
    |--------------------------------------------------------------------------
    | Image URL Helper
    |--------------------------------------------------------------------------
    |
    | Supports the possible image structures from Laravel.
    |
    */

    const getImageUrl = useCallback((image) => {
        if (!image) {
            return null;
        }

        /*
        | Laravel accessor:
        | image_url
        */

        if (image.image_url) {
            return image.image_url;
        }

        /*
        | url
        */

        if (image.url) {
            return image.url;
        }

        /*
        | path
        */

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

        /*
        | image
        */

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

        return null;
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Supplier Profile Picture
    |--------------------------------------------------------------------------
    */

    const profilePic = useMemo(() => {
        return getImageUrl({
            image: profile?.profile_picture,
        });
    }, [profile?.profile_picture, getImageUrl]);

    /*
    |--------------------------------------------------------------------------
    | Portfolio Cover Image
    |--------------------------------------------------------------------------
    */

    const getCoverUrl = useCallback(
        (portfolio) => {
            /*
            | Laravel accessor
            */

            if (portfolio?.cover_image_url) {
                return portfolio.cover_image_url;
            }

            /*
            | coverImage relationship
            */

            if (portfolio?.cover_image) {
                const cover = getImageUrl(
                    portfolio.cover_image
                );

                if (cover) {
                    return cover;
                }
            }

            /*
            | images relationship
            */

            if (
                portfolio?.images &&
                portfolio.images.length > 0
            ) {
                return getImageUrl(
                    portfolio.images[0]
                );
            }

            return null;
        },
        [getImageUrl]
    );

    /*
    |--------------------------------------------------------------------------
    | Filter Portfolio
    |--------------------------------------------------------------------------
    */

    const filteredPortfolios = useMemo(() => {
        const query =
            searchQuery.trim().toLowerCase();

        return portfolios.filter((portfolio) => {
            /*
            | Category
            */

            const matchesCategory =
                currentCategory === 'all' ||
                String(
                    portfolio.event_category_id
                ) === String(currentCategory);

            /*
            | Search
            */

            const matchesSearch =
                !query ||
                portfolio.title
                    ?.toLowerCase()
                    .includes(query) ||
                portfolio.client_name
                    ?.toLowerCase()
                    .includes(query) ||
                portfolio.location
                    ?.toLowerCase()
                    .includes(query) ||
                portfolio.description
                    ?.toLowerCase()
                    .includes(query);

            return (
                matchesCategory &&
                matchesSearch
            );
        });
    }, [
        portfolios,
        currentCategory,
        searchQuery,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Open Project
    |--------------------------------------------------------------------------
    */

    const openProject = (
        project,
        imageIndex = 0
    ) => {
        setActiveProject(project);
        setActiveImageIndex(imageIndex);

        document.body.style.overflow = 'hidden';
    };

    /*
    |--------------------------------------------------------------------------
    | Close Project
    |--------------------------------------------------------------------------
    */

    const closeProject = useCallback(() => {
        setActiveProject(null);
        setActiveImageIndex(0);

        document.body.style.overflow = '';
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Next Image
    |--------------------------------------------------------------------------
    */

    const nextImage = useCallback(() => {
        if (
            !activeProject?.images ||
            activeProject.images.length === 0
        ) {
            return;
        }

        setActiveImageIndex((current) => {
            if (
                current >=
                activeProject.images.length - 1
            ) {
                return 0;
            }

            return current + 1;
        });
    }, [activeProject]);

    /*
    |--------------------------------------------------------------------------
    | Previous Image
    |--------------------------------------------------------------------------
    */

    const prevImage = useCallback(() => {
        if (
            !activeProject?.images ||
            activeProject.images.length === 0
        ) {
            return;
        }

        setActiveImageIndex((current) => {
            if (current <= 0) {
                return (
                    activeProject.images.length - 1
                );
            }

            return current - 1;
        });
    }, [activeProject]);

    /*
    |--------------------------------------------------------------------------
    | Keyboard Navigation
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!activeProject) {
                return;
            }

            if (event.key === 'Escape') {
                closeProject();
            }

            if (event.key === 'ArrowRight') {
                nextImage();
            }

            if (event.key === 'ArrowLeft') {
                prevImage();
            }
        };

        window.addEventListener(
            'keydown',
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [
        activeProject,
        closeProject,
        nextImage,
        prevImage,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Restore Body Scroll
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Active Project Images
    |--------------------------------------------------------------------------
    */

    const activeImages =
        activeProject?.images || [];

    const activeImage =
        activeImages[activeImageIndex] || null;

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">

            <Head
                title={`${businessName} - Portfolio`}
            />

            {/* =============================================================
                NAVIGATION
            ============================================================= */}

            <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/90 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-900/90">

                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

                    <Link
                        href={route(
                            'customer.suppliers.index'
                        )}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700 transition hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
                    >
                        <span className="text-lg">
                            ←
                        </span>

                        <span>
                            Back to Portfolios
                        </span>
                    </Link>


                    <div className="flex items-center gap-3">

                        <Link
                            href={route(
                                'customer.suppliers.index'
                            )}
                            className="hidden rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 sm:block dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Explore Suppliers
                        </Link>


                        {supplierId && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (
                                        profile?.contact_number
                                    ) {
                                        window.location.href =
                                            `tel:${profile.contact_number}`;
                                    } else if (
                                        supplier?.email
                                    ) {
                                        window.location.href =
                                            `mailto:${supplier.email}`;
                                    } else {
                                        alert(
                                            `Please contact ${businessName} through the system.`
                                        );
                                    }
                                }}
                                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                            >
                                Inquire / Book
                            </button>
                        )}

                    </div>

                </div>

            </header>


            {/* =============================================================
                SUPPLIER HERO
            ============================================================= */}

            <section className="border-b border-gray-200 bg-gradient-to-b from-indigo-50 via-white to-gray-50 dark:border-gray-800 dark:from-gray-900 dark:via-gray-950 dark:to-gray-950">

                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

                    <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">

                        {/* Profile Image */}

                        <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-indigo-100 shadow-lg dark:border-gray-800 dark:bg-indigo-950">

                            {profilePic ? (

                                <img
                                    src={profilePic}
                                    alt={businessName}
                                    className="h-full w-full object-cover"
                                    onError={(event) => {
                                        event.currentTarget.style.display =
                                            'none';
                                    }}
                                />

                            ) : (

                                <div className="flex h-full w-full items-center justify-center text-4xl">
                                    🏢
                                </div>

                            )}

                        </div>


                        {/* Supplier Details */}

                        <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">

                                <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                                    {businessName}
                                </h1>

                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                    ✓ Verified Supplier
                                </span>

                            </div>


                            {/* Categories */}

                            {profile?.categories?.length > 0 && (

                                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">

                                    {profile.categories.map(
                                        (category) => (

                                            <span
                                                key={category.id}
                                                className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                                            >
                                                {category.name}
                                            </span>

                                        )
                                    )}

                                </div>

                            )}


                            {/* Metadata */}

                            <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-gray-600 sm:justify-start dark:text-gray-400">

                                {profile?.address && (

                                    <span className="flex items-center gap-1.5">
                                        📍
                                        {profile.address}
                                    </span>

                                )}

                                <span className="flex items-center gap-1.5">
                                    📸
                                    {portfolios.length}{' '}
                                    {portfolios.length === 1
                                        ? 'Project'
                                        : 'Projects'}
                                </span>

                            </div>


                            {/* Description */}

                            {profile?.description && (

                                <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                                    {profile.description}
                                </p>

                            )}

                        </div>

                    </div>

                </div>

            </section>


            {/* =============================================================
                FILTERS
            ============================================================= */}

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    {/* Categories */}

                    <div className="flex flex-wrap gap-2">

                        <button
                            type="button"
                            onClick={() =>
                                setCurrentCategory('all')
                            }
                            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${currentCategory === 'all'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
                                }`}
                        >
                            All Works
                            {' '}
                            ({portfolios.length})
                        </button>


                        {categories.map(
                            (category) => (

                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() =>
                                        setCurrentCategory(
                                            category.id
                                        )
                                    }
                                    className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${String(
                                        currentCategory
                                    ) ===
                                        String(
                                            category.id
                                        )
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {category.name}
                                </button>

                            )
                        )}

                    </div>


                    {/* Search */}

                    <div className="relative w-full lg:w-80">

                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            🔍
                        </span>

                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(event) =>
                                setSearchQuery(
                                    event.target.value
                                )
                            }
                            placeholder="Search projects..."
                            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-4 text-xs text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                        />

                    </div>

                </div>


                {/* =========================================================
                    PROJECT GRID
                ========================================================== */}

                {filteredPortfolios.length > 0 ? (

                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                        {filteredPortfolios.map(
                            (portfolio) => {

                                const coverUrl =
                                    getCoverUrl(
                                        portfolio
                                    );

                                const imageCount =
                                    portfolio.images
                                        ?.length || 0;

                                return (

                                    <article
                                        key={portfolio.id}
                                        className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
                                    >

                                        {/* =================================================
                                            IMAGE
                                        ================================================== */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                openProject(
                                                    portfolio,
                                                    0
                                                )
                                            }
                                            className="relative block w-full text-left"
                                        >

                                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">

                                                {coverUrl ? (

                                                    <img
                                                        src={coverUrl}
                                                        alt={
                                                            portfolio.title ||
                                                            'Portfolio project'
                                                        }
                                                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                                        onError={(
                                                            event
                                                        ) => {
                                                            event.currentTarget.style.display =
                                                                'none';
                                                        }}
                                                    />

                                                ) : (

                                                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400 dark:bg-gray-800">
                                                        <div className="text-center">
                                                            <div className="text-4xl">
                                                                📸
                                                            </div>
                                                            <p className="mt-2 text-xs">
                                                                No cover image
                                                            </p>
                                                        </div>
                                                    </div>

                                                )}


                                                {/* Overlay */}

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70" />


                                                {/* Category */}

                                                <div className="absolute left-3 top-3">

                                                    {portfolio.event_category && (

                                                        <span className="rounded-lg bg-black/60 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
                                                            {
                                                                portfolio
                                                                    .event_category
                                                                    .name
                                                            }
                                                        </span>

                                                    )}

                                                </div>


                                                {/* Image Count */}

                                                <div className="absolute right-3 top-3 rounded-lg bg-black/60 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
                                                    📸{' '}
                                                    {imageCount}{' '}
                                                    {imageCount === 1
                                                        ? 'Photo'
                                                        : 'Photos'}
                                                </div>


                                                {/* Title */}

                                                <div className="absolute bottom-4 left-4 right-4 text-white">

                                                    <h3 className="line-clamp-1 text-lg font-bold">
                                                        {portfolio.title ||
                                                            'Untitled Project'}
                                                    </h3>

                                                    <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-gray-200">

                                                        {portfolio.location && (
                                                            <span>
                                                                📍{' '}
                                                                {
                                                                    portfolio.location
                                                                }
                                                            </span>
                                                        )}

                                                        {portfolio.event_date && (
                                                            <span>
                                                                📅{' '}
                                                                {new Date(
                                                                    portfolio.event_date
                                                                ).toLocaleDateString(
                                                                    'en-US',
                                                                    {
                                                                        month: 'short',
                                                                        year: 'numeric',
                                                                    }
                                                                )}
                                                            </span>
                                                        )}

                                                    </div>

                                                </div>

                                            </div>

                                        </button>


                                        {/* =================================================
                                            DESCRIPTION
                                        ================================================== */}

                                        {portfolio.description && (

                                            <div className="px-4 pt-4">

                                                <p className="line-clamp-2 text-xs leading-6 text-gray-600 dark:text-gray-400">
                                                    {
                                                        portfolio.description
                                                    }
                                                </p>

                                            </div>

                                        )}


                                        {/* =================================================
                                            FOOTER
                                        ================================================== */}

                                        <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-4 dark:border-gray-800">

                                            <div className="min-w-0">

                                                {portfolio.client_name ? (

                                                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                                        Client:{' '}
                                                        {
                                                            portfolio.client_name
                                                        }
                                                    </p>

                                                ) : (

                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Portfolio Project
                                                    </p>

                                                )}

                                            </div>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openProject(
                                                        portfolio,
                                                        0
                                                    )
                                                }
                                                className="flex-shrink-0 text-xs font-bold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400"
                                            >
                                                View Gallery →
                                            </button>

                                        </div>

                                    </article>

                                );
                            }
                        )}

                    </div>

                ) : (

                    /* =====================================================
                        EMPTY STATE
                    ====================================================== */

                    <div className="mt-10 rounded-3xl border-2 border-dashed border-gray-200 bg-white px-6 py-20 text-center dark:border-gray-800 dark:bg-gray-900">

                        <div className="text-5xl">
                            📸
                        </div>

                        <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                            No projects found
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">

                            {searchQuery ||
                                currentCategory !== 'all'
                                ? 'No portfolio projects match your current filters.'
                                : `${businessName} has not published any portfolio projects yet.`}

                        </p>

                        {(searchQuery ||
                            currentCategory !== 'all') && (

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setCurrentCategory(
                                            'all'
                                        );
                                    }}
                                    className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                                >
                                    Clear Filters
                                </button>

                            )}

                    </div>

                )}

            </main>


            {/* =============================================================
                LIGHTBOX
            ============================================================= */}

            {activeProject && (

                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
                    onClick={closeProject}
                >

                    {/* Close */}

                    <button
                        type="button"
                        onClick={closeProject}
                        className="absolute right-5 top-5 z-[110] flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xl font-bold text-white transition hover:bg-white/20"
                    >
                        ✕
                    </button>


                    {/* Content */}

                    <div
                        className="flex h-full w-full flex-col lg:flex-row"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* =================================================
                            IMAGE AREA
                        ================================================== */}

                        <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center p-4 lg:p-8">

                            {/* Previous */}

                            {activeImages.length > 1 && (

                                <button
                                    type="button"
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition hover:bg-white/20"
                                >
                                    ‹
                                </button>

                            )}


                            {/* Image */}

                            <div className="flex max-h-[70vh] max-w-full items-center justify-center">

                                {activeImage ? (

                                    <img
                                        src={getImageUrl(
                                            activeImage
                                        )}
                                        alt={
                                            activeImage.caption ||
                                            activeProject.title
                                        }
                                        className="max-h-[65vh] max-w-full rounded-xl object-contain shadow-2xl"
                                        onError={(event) => {
                                            event.currentTarget.style.display =
                                                'none';
                                        }}
                                    />

                                ) : (

                                    <div className="rounded-xl bg-white/10 px-8 py-12 text-sm text-gray-400">
                                        No photos available
                                    </div>

                                )}

                            </div>


                            {/* Next */}

                            {activeImages.length > 1 && (

                                <button
                                    type="button"
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition hover:bg-white/20"
                                >
                                    ›
                                </button>

                            )}


                            {/* Caption */}

                            {activeImage && (

                                <div className="mt-4 text-center">

                                    <p className="text-sm font-semibold text-white">
                                        {activeImage.caption ||
                                            activeProject.title}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        Photo{' '}
                                        {activeImageIndex +
                                            1}{' '}
                                        of{' '}
                                        {activeImages.length}
                                    </p>

                                </div>

                            )}


                            {/* Thumbnail Strip */}

                            {activeImages.length > 1 && (

                                <div className="mt-4 flex max-w-2xl gap-2 overflow-x-auto rounded-xl bg-black/30 p-2">

                                    {activeImages.map(
                                        (
                                            image,
                                            index
                                        ) => {

                                            const url =
                                                getImageUrl(
                                                    image
                                                );

                                            return (

                                                <button
                                                    key={
                                                        image.id ||
                                                        index
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        setActiveImageIndex(
                                                            index
                                                        )
                                                    }
                                                    className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${activeImageIndex ===
                                                        index
                                                        ? 'border-indigo-500 ring-2 ring-indigo-500/50'
                                                        : 'border-transparent opacity-50 hover:opacity-100'
                                                        }`}
                                                >

                                                    {url && (

                                                        <img
                                                            src={url}
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                        />

                                                    )}

                                                </button>

                                            );
                                        }
                                    )}

                                </div>

                            )}

                        </div>


                        {/* =================================================
                            PROJECT DETAILS
                        ================================================== */}

                        <aside className="w-full flex-shrink-0 overflow-y-auto border-t border-white/10 bg-gray-900 p-6 lg:w-96 lg:border-l lg:border-t-0">

                            <div className="space-y-6">

                                {/* Title */}

                                <div>

                                    <span className="rounded-lg bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-400">

                                        {activeProject
                                            .event_category
                                            ?.name ||
                                            'Event Project'}

                                    </span>

                                    <h2 className="mt-3 text-2xl font-black text-white">
                                        {activeProject.title ||
                                            'Untitled Project'}
                                    </h2>

                                </div>


                                {/* Supplier */}

                                <div className="rounded-xl bg-white/5 p-4">

                                    <p className="text-xs text-gray-400">
                                        Supplier
                                    </p>

                                    {supplierId ? (

                                        <Link
                                            href={route(
                                                'customer.suppliers.portfolio',
                                                supplierId
                                            )}
                                            onClick={
                                                closeProject
                                            }
                                            className="mt-1 block text-sm font-bold text-indigo-400 transition hover:text-indigo-300"
                                        >
                                            {businessName}
                                        </Link>

                                    ) : (

                                        <p className="mt-1 text-sm font-bold text-white">
                                            {businessName}
                                        </p>

                                    )}

                                </div>


                                {/* Metadata */}

                                <div className="space-y-3 rounded-xl bg-white/5 p-4 text-xs">

                                    {activeProject.client_name && (

                                        <div className="flex justify-between gap-4">

                                            <span className="text-gray-400">
                                                Client
                                            </span>

                                            <span className="text-right font-semibold text-white">
                                                {
                                                    activeProject.client_name
                                                }
                                            </span>

                                        </div>

                                    )}


                                    {activeProject.event_date && (

                                        <div className="flex justify-between gap-4">

                                            <span className="text-gray-400">
                                                Date
                                            </span>

                                            <span className="text-right font-semibold text-white">
                                                {new Date(
                                                    activeProject.event_date
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


                                    {activeProject.location && (

                                        <div className="flex justify-between gap-4">

                                            <span className="text-gray-400">
                                                Location
                                            </span>

                                            <span className="text-right font-semibold text-white">
                                                {
                                                    activeProject.location
                                                }
                                            </span>

                                        </div>

                                    )}

                                </div>


                                {/* Description */}

                                {activeProject.description && (

                                    <div>

                                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                            About This Project
                                        </h3>

                                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-300">
                                            {
                                                activeProject.description
                                            }
                                        </p>

                                    </div>

                                )}


                                {/* Booking */}

                                <div className="border-t border-white/10 pt-5">

                                    <p className="text-xs leading-5 text-gray-400">
                                        Like this supplier's work?
                                        Contact them about your
                                        upcoming event.
                                    </p>


                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (
                                                profile?.contact_number
                                            ) {
                                                window.location.href =
                                                    `tel:${profile.contact_number}`;
                                            } else if (
                                                supplier?.email
                                            ) {
                                                window.location.href =
                                                    `mailto:${supplier.email}`;
                                            } else {
                                                alert(
                                                    `Please contact ${businessName} through the system.`
                                                );
                                            }
                                        }}
                                        className="mt-4 w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white transition hover:bg-indigo-700"
                                    >
                                        💬 Inquire About This Supplier
                                    </button>

                                </div>

                            </div>

                        </aside>

                    </div>

                </div>

            )}

        </div>
    );
}