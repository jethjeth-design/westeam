import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import BookingModal from '@/Components/BookingModal';
import RatingStars from '@/Components/RatingStars';
import SupplierReviewsSummary from '@/Components/SupplierReviewsSummary';

export default function Portfolio({
    supplier,
    portfolios = [],
    categories = [],
    reviews = [],
    ratingStats = { average: 0, count: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
    selectedCategory = 'all',
}) {
    const profile = supplier?.supplier_profile || supplier?.supplierProfile || null;
    const [currentCategory, setCurrentCategory] = useState(selectedCategory || 'all');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeProject, setActiveProject] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showBookingModal, setShowBookingModal] = useState(false);

    const businessName = profile?.business_name || supplier?.name || 'Event Supplier';
    const supplierId = supplier?.id;
    const fbUrl = profile?.facebook_url || profile?.facebook_page;

    const getImageUrl = useCallback((image) => {
        if (!image) return null;
        if (image.image_url) return image.image_url;
        if (image.url) return image.url;
        if (image.path) {
            if (image.path.startsWith('http://') || image.path.startsWith('https://') || image.path.startsWith('/')) {
                return image.path;
            }
            return `/storage/${image.path}`;
        }
        if (image.image) {
            if (image.image.startsWith('http://') || image.image.startsWith('https://') || image.image.startsWith('/')) {
                return image.image;
            }
            return `/storage/${image.image}`;
        }
        return null;
    }, []);

    const profilePic = useMemo(() => {
        return getImageUrl({ image: profile?.profile_picture });
    }, [profile?.profile_picture, getImageUrl]);

    const coverPhoto = useMemo(() => {
        return getImageUrl({ image: profile?.cover_photo });
    }, [profile?.cover_photo, getImageUrl]);

    const getCoverUrl = useCallback(
        (portfolio) => {
            if (portfolio?.cover_image_url) return portfolio.cover_image_url;
            if (portfolio?.cover_image) {
                const cover = getImageUrl(portfolio.cover_image);
                if (cover) return cover;
            }
            if (portfolio?.images && portfolio.images.length > 0) {
                return getImageUrl(portfolio.images[0]);
            }
            return null;
        },
        [getImageUrl]
    );

    const filteredPortfolios = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return portfolios.filter((portfolio) => {
            const matchesCategory =
                currentCategory === 'all' ||
                String(portfolio.event_category_id) === String(currentCategory);

            const matchesSearch =
                !query ||
                portfolio.title?.toLowerCase().includes(query) ||
                portfolio.client_name?.toLowerCase().includes(query) ||
                portfolio.location?.toLowerCase().includes(query) ||
                portfolio.description?.toLowerCase().includes(query);

            return matchesCategory && matchesSearch;
        });
    }, [portfolios, currentCategory, searchQuery]);

    const openProject = (project, imageIndex = 0) => {
        setActiveProject(project);
        setActiveImageIndex(imageIndex);
        document.body.style.overflow = 'hidden';
    };

    const closeProject = useCallback(() => {
        setActiveProject(null);
        document.body.style.overflow = '';
    }, []);

    const nextImage = useCallback(() => {
        if (!activeProject?.images?.length) return;
        setActiveImageIndex((current) => {
            if (current >= activeProject.images.length - 1) return 0;
            return current + 1;
        });
    }, [activeProject]);

    const prevImage = useCallback(() => {
        if (!activeProject?.images?.length) return;
        setActiveImageIndex((current) => {
            if (current <= 0) return activeProject.images.length - 1;
            return current - 1;
        });
    }, [activeProject]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!activeProject) return;
            if (event.key === 'Escape') closeProject();
            if (event.key === 'ArrowRight') nextImage();
            if (event.key === 'ArrowLeft') prevImage();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeProject, closeProject, nextImage, prevImage]);

    useEffect(() => {
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const activeImages = activeProject?.images || [];
    const activeImage = activeImages[activeImageIndex] || null;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
            <Head title={`${businessName} - Portfolio & Work Gallery`} />

            {/* Navigation Bar */}
            <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
                    <Link
                        href={route('customer.suppliers.index')}
                        className="flex items-center gap-2 text-xs font-bold text-slate-600 transition hover:text-indigo-600"
                    >
                        <span className="text-base">←</span>
                        <span>Back to Supplier Directory</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('customer.suppliers.show', supplierId)}
                            className="hidden rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 sm:block"
                        >
                            Supplier Profile
                        </Link>

                        <button
                            type="button"
                            onClick={() => setShowBookingModal(true)}
                            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                        >
                            📅 Book This Supplier
                        </button>
                    </div>
                </div>
            </header>

            {/* Supplier Hero Section */}
            <section className="border-b border-slate-200/80 bg-white">
                {/* Optional Cover Banner */}
                {coverPhoto && (
                    <div className="relative h-44 sm:h-60 w-full overflow-hidden bg-slate-800">
                        <img
                            src={coverPhoto}
                            alt={`${businessName} Cover`}
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                    </div>
                )}

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
                        {/* Profile Avatar */}
                        <div className={`${coverPhoto ? '-mt-16' : ''} h-28 w-28 shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-indigo-600 font-bold text-white text-3xl flex items-center justify-center shadow-lg relative z-10`}>
                            {profilePic ? (
                                <img
                                    src={profilePic}
                                    alt={businessName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                businessName.charAt(0).toUpperCase()
                            )}
                        </div>

                        {/* Supplier Info */}
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                                    {businessName}
                                </h1>
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                    ✓ Verified Supplier
                                </span>
                            </div>

                            {/* Ratings & Experience Row */}
                            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                                <div className="flex items-center gap-1.5 rounded-xl bg-amber-50/80 px-2.5 py-1 border border-amber-100">
                                    <RatingStars
                                        rating={ratingStats.average}
                                        size="xs"
                                        showScore={true}
                                        count={ratingStats.count}
                                    />
                                </div>

                                {profile?.years_of_experience ? (
                                    <span className="rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                                        ⏳ {profile.years_of_experience}+ Years Exp
                                    </span>
                                ) : null}

                                {fbUrl && (
                                    <a
                                        href={fbUrl.startsWith('http') ? fbUrl : `https://${fbUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition"
                                        title="Facebook Page"
                                    >
                                        <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                        <span>Facebook</span>
                                    </a>
                                )}
                            </div>

                            {/* Categories */}
                            {profile?.categories?.length > 0 && (
                                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                                    {profile.categories.map((category) => (
                                        <span
                                            key={category.id}
                                            className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
                                        >
                                            {category.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="mt-3 flex flex-wrap justify-center gap-5 text-xs text-slate-500 sm:justify-start">
                                {profile?.address && (
                                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                                        📍 {profile.address}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                                    📸 {portfolios.length} Portfolio {portfolios.length === 1 ? 'Project' : 'Projects'}
                                </span>
                            </div>

                            {profile?.description && (
                                <p className="mt-3 max-w-3xl text-xs leading-relaxed text-slate-600">
                                    {profile.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Filters & Grid */}
            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Categories Tabs */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setCurrentCategory('all')}
                            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                                currentCategory === 'all'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-white text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                            All Projects ({portfolios.length})
                        </button>

                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setCurrentCategory(String(cat.id))}
                                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                                    String(currentCategory) === String(cat.id)
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'bg-white text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full max-w-xs">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search projects by title, venue..."
                            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none"
                        />
                        <span className="pointer-events-none absolute left-3 top-2.5 text-xs text-slate-400">
                            🔍
                        </span>
                    </div>
                </div>

                {/* Portfolio Grid */}
                {filteredPortfolios.length > 0 ? (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredPortfolios.map((portfolio) => {
                            const cover = getCoverUrl(portfolio);
                            const photoCount = portfolio.images?.length || 0;

                            return (
                                <article
                                    key={portfolio.id}
                                    className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs transition duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl"
                                >
                                    <div>
                                        {/* Cover Image Container */}
                                        <div
                                            className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-slate-100"
                                            onClick={() => openProject(portfolio, 0)}
                                        >
                                            {cover ? (
                                                <img
                                                    src={cover}
                                                    alt={portfolio.title}
                                                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/images/placeholder.jpg';
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-slate-100 text-3xl">
                                                    📷
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

                                            {portfolio.is_featured && (
                                                <span className="absolute left-3 top-3 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                                                    ⭐ Featured
                                                </span>
                                            )}

                                            {portfolio.video_url && (
                                                <span className="absolute left-3 bottom-3 rounded-md bg-purple-900/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
                                                    🎥 Video
                                                </span>
                                            )}

                                            <span className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
                                                📷 {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div className="p-5">
                                            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                                                {portfolio.event_category?.name || 'Event Project'}
                                            </span>

                                            <h3 className="mt-2 line-clamp-1 text-base font-black text-slate-900 transition group-hover:text-indigo-600">
                                                {portfolio.title}
                                            </h3>

                                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                                                {portfolio.event_date && (
                                                    <span>
                                                        📅{' '}
                                                        {new Date(portfolio.event_date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                )}
                                                {portfolio.location && <span>📍 {portfolio.location}</span>}
                                            </div>

                                            {portfolio.description && (
                                                <p className="mt-2.5 line-clamp-2 text-xs text-slate-600">
                                                    {portfolio.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5 bg-slate-50/50">
                                        <span className="text-[11px] text-slate-500">
                                            {portfolio.client_name ? `Client: ${portfolio.client_name}` : 'Past Milestone'}
                                        </span>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openProject(portfolio, 0)}
                                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                                            >
                                                Quick View
                                            </button>
                                            <span className="text-slate-300">•</span>
                                            <Link
                                                href={route('customer.portfolios.show', portfolio.id)}
                                                className="text-xs font-bold text-slate-700 hover:text-indigo-600"
                                            >
                                                Full Gallery →
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-10 rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-20 text-center">
                        <div className="text-4xl">📸</div>
                        <h3 className="mt-4 text-lg font-bold text-slate-900">No projects found</h3>
                        <p className="mt-1 text-xs text-slate-500">
                            {searchQuery || currentCategory !== 'all'
                                ? 'No portfolio projects match your search filters.'
                                : `${businessName} has not published projects in this category yet.`}
                        </p>
                        {(searchQuery || currentCategory !== 'all') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setCurrentCategory('all');
                                }}
                                className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-indigo-700"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                )}

                {/* Ratings & Customer Reviews Section */}
                <div className="mt-16 pt-12 border-t border-slate-200/80">
                    <SupplierReviewsSummary
                        ratingStats={ratingStats}
                        reviews={reviews}
                        title={`Reviews & Ratings for ${businessName}`}
                        subtitle="What clients say about events delivered by this supplier."
                    />
                </div>
            </main>

            {/* Lightbox / Project Details Quick Modal (Light Themed) */}
            {activeProject && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-md"
                    onClick={closeProject}
                >
                    <div
                        className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl lg:flex-row"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={closeProject}
                            className="absolute right-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                        >
                            ✕
                        </button>

                        {/* Image Viewer (Left / Top) */}
                        <div className="relative flex flex-1 flex-col items-center justify-center bg-slate-950 p-6">
                            {activeImages.length > 1 && (
                                <button
                                    type="button"
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-2xl bg-white/20 text-2xl text-white transition hover:bg-white/30"
                                >
                                    ‹
                                </button>
                            )}

                            <div className="flex max-h-[60vh] max-w-full items-center justify-center">
                                {activeImage ? (
                                    <img
                                        src={getImageUrl(activeImage)}
                                        alt={activeImage.caption || activeProject.title}
                                        className="max-h-[55vh] max-w-full rounded-2xl object-contain shadow-2xl"
                                    />
                                ) : (
                                    <div className="text-sm text-slate-400">No photos available</div>
                                )}
                            </div>

                            {activeImages.length > 1 && (
                                <button
                                    type="button"
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-2xl bg-white/20 text-2xl text-white transition hover:bg-white/30"
                                >
                                    ›
                                </button>
                            )}

                            {/* Caption & Counter */}
                            {activeImage && (
                                <div className="mt-3 text-center">
                                    <p className="text-xs font-semibold text-white">
                                        {activeImage.caption || activeProject.title}
                                    </p>
                                    <p className="mt-0.5 text-[10px] text-slate-400 font-mono">
                                        Photo {activeImageIndex + 1} of {activeImages.length}
                                    </p>
                                </div>
                            )}

                            {/* Thumbnails */}
                            {activeImages.length > 1 && (
                                <div className="mt-3 flex max-w-md gap-2 overflow-x-auto rounded-xl bg-white/10 p-1.5">
                                    {activeImages.map((img, idx) => {
                                        const url = getImageUrl(img);
                                        return (
                                            <button
                                                key={img.id || idx}
                                                type="button"
                                                onClick={() => setActiveImageIndex(idx)}
                                                className={`h-10 w-10 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                                                    activeImageIndex === idx
                                                        ? 'border-indigo-500 ring-2 ring-indigo-500/50'
                                                        : 'border-transparent opacity-60 hover:opacity-100'
                                                }`}
                                            >
                                                {url && <img src={url} alt="" className="h-full w-full object-cover" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Project Details Sidebar (Right / Bottom) */}
                        <div className="flex w-full flex-col justify-between overflow-y-auto p-6 lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-slate-100">
                            <div className="space-y-4">
                                <div>
                                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                                        {activeProject.event_category?.name || 'Project Showcase'}
                                    </span>
                                    <h3 className="mt-1.5 text-xl font-black text-slate-900">
                                        {activeProject.title}
                                    </h3>
                                </div>

                                <div className="space-y-2 rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-600 border border-slate-100">
                                    {activeProject.client_name && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Client:</span>
                                            <span className="font-bold text-slate-900">{activeProject.client_name}</span>
                                        </div>
                                    )}
                                    {activeProject.event_date && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Date:</span>
                                            <span className="font-bold text-slate-900">
                                                 {new Date(activeProject.event_date).toLocaleDateString('en-US', {
                                                     month: 'short',
                                                     day: 'numeric',
                                                     year: 'numeric',
                                                 })}
                                            </span>
                                        </div>
                                    )}
                                    {activeProject.location && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Location:</span>
                                            <span className="font-bold text-slate-900">{activeProject.location}</span>
                                        </div>
                                    )}
                                </div>

                                {activeProject.video_url && (
                                    <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-3">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-purple-900 mb-2">
                                            🎥 Highlight Video
                                        </p>
                                        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                                            {activeProject.video_url.includes('youtube.com') || activeProject.video_url.includes('youtu.be') ? (
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${
                                                        activeProject.video_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)?.[1] || ''
                                                    }`}
                                                    title="Highlight Video"
                                                    className="h-full w-full border-0"
                                                    allowFullScreen
                                                />
                                            ) : activeProject.video_url.includes('vimeo.com') ? (
                                                <iframe
                                                    src={`https://player.vimeo.com/video/${
                                                        activeProject.video_url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)/)?.[1] || ''
                                                    }`}
                                                    title="Highlight Video"
                                                    className="h-full w-full border-0"
                                                    allowFullScreen
                                                />
                                            ) : (
                                                <video src={activeProject.video_url} controls className="h-full w-full object-contain" />
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeProject.description && (
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Description
                                        </p>
                                        <p className="mt-1 whitespace-pre-line text-xs text-slate-600 leading-relaxed">
                                            {activeProject.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 border-t border-slate-100 pt-4 space-y-2">
                                <Link
                                    href={route('customer.portfolios.show', activeProject.id)}
                                    className="block w-full rounded-xl border border-slate-200 py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                                >
                                    Open Full Gallery Page
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => {
                                        closeProject();
                                        setShowBookingModal(true);
                                    }}
                                    className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition"
                                >
                                    Book This Supplier
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Modal */}
            <BookingModal
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                bookingType="service"
                title={`Book ${businessName}`}
                items={[
                    {
                        supplier_id: supplierId,
                        item_type: 'service',
                        item_id: null,
                        item_name: `${businessName} Event Service Package`,
                        unit_price: 25000.0,
                        supplier_name: businessName,
                    },
                ]}
            />
        </div>
    );
}