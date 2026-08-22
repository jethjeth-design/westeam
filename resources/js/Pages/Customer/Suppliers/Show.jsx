import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useCallback, useEffect } from 'react';

export default function Show({
    supplier,
    services = [],
    packages = [],
    portfolios = [],
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

    const businessName =
        profile?.business_name ||
        supplier?.name ||
        'Event Supplier';

    const supplierCategories =
        profile?.categories || [];

    /*
    |--------------------------------------------------------------------------
    | Profile Picture
    |--------------------------------------------------------------------------
    */

    const getProfilePicture = () => {
        const picture = profile?.profile_picture;

        if (!picture) {
            return null;
        }

        if (
            picture.startsWith('http://') ||
            picture.startsWith('https://') ||
            picture.startsWith('/')
        ) {
            return picture;
        }

        return `/storage/${picture}`;
    };

    const profilePicture = getProfilePicture();

    /*
    |--------------------------------------------------------------------------
    | Tab State
    |--------------------------------------------------------------------------
    */

    const tabs = [
        {
            id: 'services',
            label: 'Services',
            count: services.length,
            icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.049.58.025 1.192-.14 1.743" />
                </svg>
            ),
        },
        {
            id: 'packages',
            label: 'Packages',
            count: packages.length,
            icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
            ),
        },
        {
            id: 'portfolio',
            label: 'Portfolio',
            count: portfolios.length,
            icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M2.25 18V6a2.25 2.25 0 0 1 2.25-2.25h15A2.25 2.25 0 0 1 21.75 6v12A2.25 2.25 0 0 1 19.5 20.25H4.5A2.25 2.25 0 0 1 2.25 18Z" />
                </svg>
            ),
        },
    ];

    const [activeTab, setActiveTab] = useState('services');

    /*
    |--------------------------------------------------------------------------
    | Portfolio Lightbox
    |--------------------------------------------------------------------------
    */

    const [lightboxProject, setLightboxProject] =
        useState(null);

    const [lightboxImageIndex, setLightboxImageIndex] =
        useState(0);

    const openLightbox = useCallback(
        (portfolio, imageIndex = 0) => {
            setLightboxProject(portfolio);
            setLightboxImageIndex(imageIndex);
        },
        []
    );

    const closeLightbox = useCallback(() => {
        setLightboxProject(null);
        setLightboxImageIndex(0);
    }, []);

    const nextImage = useCallback(() => {
        if (!lightboxProject) return;

        const images =
            lightboxProject.images || [];

        setLightboxImageIndex((prev) =>
            prev < images.length - 1 ? prev + 1 : 0
        );
    }, [lightboxProject]);

    const prevImage = useCallback(() => {
        if (!lightboxProject) return;

        const images =
            lightboxProject.images || [];

        setLightboxImageIndex((prev) =>
            prev > 0 ? prev - 1 : images.length - 1
        );
    }, [lightboxProject]);

    /*
    |--------------------------------------------------------------------------
    | Keyboard Navigation for Lightbox
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!lightboxProject) return;

            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowRight') {
                nextImage();
            } else if (e.key === 'ArrowLeft') {
                prevImage();
            }
        };

        window.addEventListener(
            'keydown',
            handleKeyDown
        );

        return () =>
            window.removeEventListener(
                'keydown',
                handleKeyDown
            );
    }, [
        lightboxProject,
        closeLightbox,
        nextImage,
        prevImage,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Image URL Helper
    |--------------------------------------------------------------------------
    */

    const getImageUrl = useCallback((image) => {
        if (!image) return null;

        if (image.image_url) return image.image_url;
        if (image.url) return image.url;

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

        return null;
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Format Price
    |--------------------------------------------------------------------------
    */

    const formatPrice = (price) => {
        const num = parseFloat(price);
        if (isNaN(num)) return price;

        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(num);
    };

    /*
    |--------------------------------------------------------------------------
    | Format Date
    |--------------------------------------------------------------------------
    */

    const formatDate = (dateStr) => {
        if (!dateStr) return null;

        try {
            return new Date(
                dateStr
            ).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <DashboardLayout>
            <Head
                title={`${businessName} — Supplier Profile`}
            />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

                {/* =========================================================
                    PROFILE HEADER
                ========================================================== */}

                <section className="relative overflow-hidden border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">

                    {/* Background Decoration */}
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-100 via-violet-50 to-transparent opacity-70 blur-3xl dark:from-indigo-950/40 dark:via-violet-950/20" />
                        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-gradient-to-tr from-purple-100 via-pink-50 to-transparent opacity-50 blur-3xl dark:from-purple-950/30 dark:via-pink-950/10" />
                    </div>

                    <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8">

                        {/* Back Button */}
                        <Link
                            href={route(
                                'customer.suppliers.index'
                            )}
                            className="mb-8 inline-flex items-center gap-2 rounded-xl bg-gray-100/80 px-4 py-2.5 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all hover:bg-gray-200/80 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-700/80"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            Back to Suppliers
                        </Link>

                        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">

                            {/* Profile Picture */}
                            <div className="relative">
                                <div className="h-24 w-24 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 p-0.5 shadow-xl shadow-indigo-500/20 sm:h-28 sm:w-28">
                                    <div className="h-full w-full overflow-hidden rounded-[14px] bg-white dark:bg-gray-900">
                                        {profilePicture ? (
                                            <img
                                                src={profilePicture}
                                                alt={businessName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 text-3xl font-bold text-white sm:text-4xl">
                                                {businessName
                                                    .charAt(
                                                        0
                                                    )
                                                    .toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Verified Badge */}
                                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md dark:bg-gray-900">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1">

                                <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                                    {businessName}
                                </h1>

                                {/* Category Badges */}
                                {supplierCategories.length >
                                    0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {supplierCategories.map(
                                            (cat) => (
                                                <span
                                                    key={
                                                        cat.id
                                                    }
                                                    className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                                                >
                                                    {
                                                        cat.name
                                                    }
                                                </span>
                                            )
                                        )}
                                    </div>
                                )}

                                {/* Location */}
                                {profile?.address && (
                                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z" />
                                        </svg>
                                        {
                                            profile.address
                                        }
                                    </div>
                                )}

                                {/* Contact */}
                                {profile?.contact_number && (
                                    <div className="mt-1.5 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                                        </svg>
                                        {
                                            profile.contact_number
                                        }
                                    </div>
                                )}

                            </div>

                        </div>

                        {/* Description */}
                        {profile?.description && (
                            <div className="mt-6 max-w-4xl rounded-xl bg-gray-50/80 p-5 backdrop-blur-sm dark:bg-gray-800/50">
                                <p className="text-sm leading-7 text-gray-600 dark:text-gray-400">
                                    {
                                        profile.description
                                    }
                                </p>
                            </div>
                        )}

                    </div>

                </section>


                {/* =========================================================
                    TAB NAVIGATION
                ========================================================== */}

                <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/95">

                    <div className="mx-auto max-w-7xl px-6 lg:px-8">

                        <nav className="flex gap-1" aria-label="Tabs">

                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    id={`tab-${tab.id}`}
                                    onClick={() =>
                                        setActiveTab(
                                            tab.id
                                        )
                                    }
                                    className={`relative flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-all duration-200 ${
                                        activeTab ===
                                        tab.id
                                            ? 'text-indigo-600 dark:text-indigo-400'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    {tab.icon}

                                    {tab.label}

                                    {/* Count Badge */}
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                            activeTab ===
                                            tab.id
                                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                        }`}
                                    >
                                        {tab.count}
                                    </span>

                                    {/* Active indicator */}
                                    {activeTab ===
                                        tab.id && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                                    )}
                                </button>
                            ))}

                        </nav>

                    </div>

                </div>


                {/* =========================================================
                    TAB CONTENT
                ========================================================== */}

                <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

                    {/* =====================================================
                        SERVICES TAB
                    ====================================================== */}

                    {activeTab === 'services' && (

                        <div>

                            {services.length > 0 ? (

                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                                    {services.map(
                                        (service) => (

                                            <div
                                                key={
                                                    service.id
                                                }
                                                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                                            >

                                                {/* Icon */}
                                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20">
                                                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.049.58.025 1.192-.14 1.743" />
                                                    </svg>
                                                </div>

                                                {/* Name */}
                                                <h3 className="mt-4 text-base font-bold text-gray-900 dark:text-white">
                                                    {
                                                        service.name
                                                    }
                                                </h3>

                                                {/* Description */}
                                                {service.description && (
                                                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                                                        {
                                                            service.description
                                                        }
                                                    </p>
                                                )}

                                            </div>

                                        )
                                    )}

                                </div>

                            ) : (

                                <EmptyState
                                    icon="🛠️"
                                    title="No services listed"
                                    description="This supplier hasn't listed any services yet."
                                />

                            )}

                        </div>

                    )}


                    {/* =====================================================
                        PACKAGES TAB
                    ====================================================== */}

                    {activeTab === 'packages' && (

                        <div>

                            {packages.length > 0 ? (

                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                                    {packages.map(
                                        (pkg) => (

                                            <div
                                                key={
                                                    pkg.id
                                                }
                                                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                                            >

                                                {/* Header */}
                                                <div className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 p-5">

                                                    {/* Event Category */}
                                                    {pkg.event_category && (
                                                        <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                                                            {
                                                                pkg
                                                                    .event_category
                                                                    .name
                                                            }
                                                        </span>
                                                    )}

                                                    <h3 className="mt-3 text-lg font-bold text-white">
                                                        {
                                                            pkg.name
                                                        }
                                                    </h3>

                                                    <div className="mt-2 flex items-baseline gap-1">
                                                        <span className="text-3xl font-black text-white">
                                                            {formatPrice(
                                                                pkg.price
                                                            )}
                                                        </span>
                                                    </div>

                                                </div>

                                                {/* Body */}
                                                <div className="flex flex-1 flex-col p-5">

                                                    {/* Description */}
                                                    {pkg.description && (
                                                        <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                                                            {
                                                                pkg.description
                                                            }
                                                        </p>
                                                    )}

                                                    {/* Inclusions */}
                                                    {pkg.inclusions && (
                                                        <div className="mt-4">
                                                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                                                What&apos;s
                                                                Included
                                                            </h4>
                                                            <div className="mt-2 space-y-2">
                                                                {pkg.inclusions
                                                                    .split(
                                                                        '\n'
                                                                    )
                                                                    .filter(
                                                                        (
                                                                            line
                                                                        ) =>
                                                                            line.trim()
                                                                    )
                                                                    .map(
                                                                        (
                                                                            line,
                                                                            idx
                                                                        ) => (
                                                                            <div
                                                                                key={idx}
                                                                                className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                                                                            >
                                                                                <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                                                </svg>
                                                                                {line.trim()}
                                                                            </div>
                                                                        )
                                                                    )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Services in Package */}
                                                    {pkg.services &&
                                                        pkg
                                                            .services
                                                            .length >
                                                            0 && (
                                                            <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                                                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                                                    Services
                                                                </h4>
                                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                                    {pkg.services.map(
                                                                        (
                                                                            svc
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    svc.id
                                                                                }
                                                                                className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"
                                                                            >
                                                                                {
                                                                                    svc.name
                                                                                }
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            ) : (

                                <EmptyState
                                    icon="📦"
                                    title="No packages available"
                                    description="This supplier hasn't created any packages yet."
                                />

                            )}

                        </div>

                    )}


                    {/* =====================================================
                        PORTFOLIO TAB
                    ====================================================== */}

                    {activeTab === 'portfolio' && (

                        <div>

                            {portfolios.length > 0 ? (

                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                                    {portfolios.map(
                                        (portfolio) => {

                                            const coverUrl =
                                                portfolio.cover_image_url;

                                            return (
                                                <article
                                                    key={
                                                        portfolio.id
                                                    }
                                                    className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
                                                    onClick={() =>
                                                        openLightbox(
                                                            portfolio
                                                        )
                                                    }
                                                >

                                                    {/* Cover Image */}
                                                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                                                        {coverUrl ? (
                                                            <img
                                                                src={coverUrl}
                                                                alt={
                                                                    portfolio.title ||
                                                                    'Portfolio'
                                                                }
                                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
                                                                <div className="text-center">
                                                                    <div className="text-5xl">
                                                                        📸
                                                                    </div>
                                                                    <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                        No
                                                                        cover
                                                                        image
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Hover overlay */}
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                            <span className="rounded-full bg-white/90 px-5 py-2 text-sm font-bold text-gray-900 shadow-lg backdrop-blur-sm">
                                                                View
                                                                Gallery
                                                                →
                                                            </span>
                                                        </div>

                                                        {/* Image Count */}
                                                        {portfolio
                                                            .images
                                                            ?.length >
                                                            0 && (
                                                            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M2.25 18V6a2.25 2.25 0 0 1 2.25-2.25h15A2.25 2.25 0 0 1 21.75 6v12A2.25 2.25 0 0 1 19.5 20.25H4.5A2.25 2.25 0 0 1 2.25 18Z" />
                                                                </svg>
                                                                {
                                                                    portfolio
                                                                        .images
                                                                        .length
                                                                }
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Details */}
                                                    <div className="p-5">

                                                        <h3 className="line-clamp-1 text-lg font-bold text-gray-900 dark:text-white">
                                                            {
                                                                portfolio.title
                                                            }
                                                        </h3>

                                                        {portfolio.event_category && (
                                                            <span className="mt-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                                                                {
                                                                    portfolio
                                                                        .event_category
                                                                        .name
                                                                }
                                                            </span>
                                                        )}

                                                        {portfolio.description && (
                                                            <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                                                                {
                                                                    portfolio.description
                                                                }
                                                            </p>
                                                        )}

                                                        {/* Meta Info */}
                                                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
                                                            {portfolio.event_date && (
                                                                <span className="flex items-center gap-1">
                                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                                                    </svg>
                                                                    {formatDate(
                                                                        portfolio.event_date
                                                                    )}
                                                                </span>
                                                            )}
                                                            {portfolio.location && (
                                                                <span className="flex items-center gap-1">
                                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z" />
                                                                    </svg>
                                                                    {
                                                                        portfolio.location
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>

                                                    </div>

                                                </article>
                                            );
                                        }
                                    )}

                                </div>

                            ) : (

                                <EmptyState
                                    icon="📸"
                                    title="No portfolio projects"
                                    description="This supplier hasn't published any portfolio projects yet."
                                />

                            )}

                        </div>

                    )}

                </main>


                {/* =========================================================
                    PORTFOLIO LIGHTBOX
                ========================================================== */}

                {lightboxProject && (

                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
                        onClick={closeLightbox}
                    >

                        <div
                            className="relative flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            {/* Close Button */}
                            <button
                                onClick={closeLightbox}
                                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Image */}
                            <div className="relative flex min-h-[300px] items-center justify-center bg-gray-950 sm:min-h-[400px]">

                                {lightboxProject.images
                                    ?.length > 0 ? (

                                    <>
                                        <img
                                            src={
                                                getImageUrl(
                                                    lightboxProject
                                                        .images[
                                                        lightboxImageIndex
                                                    ]
                                                ) || ''
                                            }
                                            alt={
                                                lightboxProject
                                                    .images[
                                                    lightboxImageIndex
                                                ]
                                                    ?.caption ||
                                                lightboxProject.title
                                            }
                                            className="max-h-[55vh] w-full object-contain"
                                        />

                                        {/* Navigation Arrows */}
                                        {lightboxProject
                                            .images
                                            .length >
                                            1 && (

                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
                                                >
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                                    </svg>
                                                </button>

                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
                                                >
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                                    </svg>
                                                </button>
                                            </>

                                        )}

                                        {/* Image Counter */}
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                            {lightboxImageIndex + 1}{' '}
                                            /{' '}
                                            {
                                                lightboxProject
                                                    .images
                                                    .length
                                            }
                                        </div>
                                    </>

                                ) : (

                                    <div className="text-center text-gray-500">
                                        <div className="text-5xl">
                                            📸
                                        </div>
                                        <p className="mt-2 text-sm">
                                            No images
                                            in this
                                            project
                                        </p>
                                    </div>

                                )}

                            </div>

                            {/* Project Details */}
                            <div className="max-h-[35vh] overflow-y-auto p-6">

                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {
                                        lightboxProject.title
                                    }
                                </h2>

                                {lightboxProject.event_category && (
                                    <span className="mt-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                                        {
                                            lightboxProject
                                                .event_category
                                                .name
                                        }
                                    </span>
                                )}

                                {lightboxProject.description && (
                                    <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
                                        {
                                            lightboxProject.description
                                        }
                                    </p>
                                )}

                                {/* Meta Details */}
                                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">

                                    {lightboxProject.event_date && (
                                        <span className="flex items-center gap-1.5">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                            </svg>
                                            {formatDate(
                                                lightboxProject.event_date
                                            )}
                                        </span>
                                    )}

                                    {lightboxProject.location && (
                                        <span className="flex items-center gap-1.5">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z" />
                                            </svg>
                                            {
                                                lightboxProject.location
                                            }
                                        </span>
                                    )}

                                    {lightboxProject.client_name && (
                                        <span className="flex items-center gap-1.5">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                            </svg>
                                            {
                                                lightboxProject.client_name
                                            }
                                        </span>
                                    )}

                                </div>

                                {/* Thumbnail Strip */}
                                {lightboxProject
                                    .images
                                    ?.length > 1 && (

                                    <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                                        {lightboxProject.images.map(
                                            (
                                                img,
                                                idx
                                            ) => (
                                                <button
                                                    key={
                                                        img.id ||
                                                        idx
                                                    }
                                                    onClick={() =>
                                                        setLightboxImageIndex(
                                                            idx
                                                        )
                                                    }
                                                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                                                        idx ===
                                                        lightboxImageIndex
                                                            ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                                                            : 'border-transparent opacity-60 hover:opacity-100'
                                                    }`}
                                                >
                                                    <img
                                                        src={
                                                            getImageUrl(
                                                                img
                                                            ) ||
                                                            ''
                                                        }
                                                        alt={
                                                            img.caption ||
                                                            `Image ${idx + 1}`
                                                        }
                                                        className="h-full w-full object-cover"
                                                    />
                                                </button>
                                            )
                                        )}
                                    </div>

                                )}

                            </div>

                        </div>

                    </div>

                )}

            </div>
        </DashboardLayout>
    );
}


/*
|--------------------------------------------------------------------------
| Empty State Component
|--------------------------------------------------------------------------
*/

function EmptyState({ icon, title, description }) {
    return (
        <div className="rounded-3xl border-2 border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-3xl dark:bg-indigo-950">
                {icon}
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                {title}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
                {description}
            </p>
        </div>
    );
}
