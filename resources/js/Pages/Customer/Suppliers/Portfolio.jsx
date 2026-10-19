import BookingModal from '@/Components/BookingModal';
import RatingStars from '@/Components/RatingStars';
import SupplierReviewsSummary from '@/Components/SupplierReviewsSummary';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function Portfolio({
    supplier,
    portfolios = [],
    services = [],
    packages = [],
    categories = [],
    reviews = [],
    ratingStats = { average: 0, count: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
    selectedCategory = 'all',
}) {
    const profile = supplier?.supplier_profile || supplier?.supplierProfile || null;
    const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio' | 'services' | 'packages' | 'reviews'
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
                const first = portfolio.images[0];
                const url = getImageUrl(first);
                if (url) return url;
            }
            return null;
        },
        [getImageUrl]
    );

    const filteredPortfolios = useMemo(() => {
        return portfolios.filter((item) => {
            const matchesCat =
                currentCategory === 'all' ||
                String(item.event_category_id) === String(currentCategory);

            const q = searchQuery.toLowerCase().trim();
            const matchesQuery =
                !q ||
                item.title?.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q) ||
                item.location?.toLowerCase().includes(q) ||
                item.client_name?.toLowerCase().includes(q);

            return matchesCat && matchesQuery;
        });
    }, [portfolios, currentCategory, searchQuery]);

    const openProject = (project, imgIndex = 0) => {
        setActiveProject(project);
        setActiveImageIndex(imgIndex);
        document.body.style.overflow = 'hidden';
    };

    const closeProject = useCallback(() => {
        setActiveProject(null);
        setActiveImageIndex(0);
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
        <DashboardLayout>
            <Head title={`${businessName} - Portfolio & Work Gallery`} />

            <div className="min-h-screen bg-[#F8F5EF] text-[#24221E] antialiased pb-20">
                {/* Secondary Breadcrumbs Top Bar */}
                <div className="border-b border-[#EFE7D8] bg-white/95 backdrop-blur-md sticky top-20 z-30">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                        <Link
                            href={route('customer.suppliers.index')}
                            className="flex items-center gap-2 text-xs font-bold text-[#77736C] transition hover:text-[#C99632]"
                        >
                            <span className="text-base">←</span>
                            <span>Back to Gallery</span>
                        </Link>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={() => router.post(route('messages.direct', supplierId))}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCC9A8] bg-[#F8F5EF] px-3.5 py-2 text-xs font-bold text-[#24221E] shadow-2xs transition hover:bg-[#EFE7D8]"
                            >
                                <span>💬</span>
                                <span>Direct Chat</span>
                            </button>

                            <Link
                                href={route('customer.bookings.create', { supplier_id: supplierId })}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C99632] to-[#A87520] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:scale-105 active:scale-95"
                            >
                                <span>📅</span>
                                <span>Book This Supplier</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Supplier Hero Section */}
                <section className="border-b border-[#EFE7D8] bg-white">
                    {/* Cover Banner */}
                    {coverPhoto && (
                        <div className="relative h-44 sm:h-64 w-full overflow-hidden bg-slate-900">
                            <img
                                src={coverPhoto}
                                alt={`${businessName} Cover`}
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </div>
                    )}

                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
                            {/* Profile Avatar */}
                            <div className={`${coverPhoto ? '-mt-16 sm:-mt-20' : ''} h-28 w-28 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-gradient-to-tr from-[#C99632] to-[#A87520] font-bold text-white text-3xl flex items-center justify-center shadow-xl relative z-10`}>
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
                                    <h1 className="text-2xl font-black tracking-tight text-[#24221E] sm:text-3xl font-serif">
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
                                        <span className="rounded-xl bg-[#EFE7D8] px-2.5 py-1 text-xs font-bold text-[#A87520]">
                                            ⏳ {profile.years_of_experience}+ Years Experience
                                        </span>
                                    ) : null}

                                    {fbUrl && (
                                        <a
                                            href={fbUrl.startsWith('http') ? fbUrl : `https://${fbUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-[#C99632] hover:text-white transition"
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
                                                className="rounded-lg bg-[#EFE7D8]/80 px-3 py-1 text-xs font-semibold text-[#A87520]"
                                            >
                                                {category.name}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Location & Portfolio Count */}
                                <div className="mt-3 flex flex-wrap justify-center gap-5 text-xs text-[#77736C] sm:justify-start">
                                    {profile?.address && (
                                        <span className="flex items-center gap-1.5 font-medium text-[#24221E]">
                                            📍 {profile.address}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5 font-medium text-[#24221E]">
                                        📸 {portfolios.length} Published {portfolios.length === 1 ? 'Project' : 'Projects'}
                                    </span>
                                    <span className="flex items-center gap-1.5 font-medium text-[#24221E]">
                                        🛠️ {services.length} {services.length === 1 ? 'Service' : 'Services'}
                                    </span>
                                    <span className="flex items-center gap-1.5 font-medium text-[#24221E]">
                                        📦 {packages.length} {packages.length === 1 ? 'Package' : 'Packages'}
                                    </span>
                                </div>

                                {profile?.description && (
                                    <p className="mt-3 max-w-3xl text-xs sm:text-sm leading-relaxed text-[#77736C]">
                                        {profile.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Navigation Tabs Bar */}
                        <div className="mt-8 flex items-center gap-2 border-b border-[#EFE7D8] overflow-x-auto pb-px">
                            <button
                                type="button"
                                onClick={() => setActiveTab('portfolio')}
                                className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                                    activeTab === 'portfolio'
                                        ? 'border-[#C99632] text-[#A87520] bg-[#EFE7D8]/30 rounded-t-xl'
                                        : 'border-transparent text-[#77736C] hover:text-[#24221E]'
                                }`}
                            >
                                <span>📸</span>
                                <span>Portfolio Works</span>
                                <span className="ml-1 rounded-full bg-[#EFE7D8] px-2 py-0.5 text-[10px] text-[#A87520]">
                                    {portfolios.length}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('services')}
                                className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                                    activeTab === 'services'
                                        ? 'border-[#C99632] text-[#A87520] bg-[#EFE7D8]/30 rounded-t-xl'
                                        : 'border-transparent text-[#77736C] hover:text-[#24221E]'
                                }`}
                            >
                                <span>🛠️</span>
                                <span>Services</span>
                                <span className="ml-1 rounded-full bg-[#EFE7D8] px-2 py-0.5 text-[10px] text-[#A87520]">
                                    {services.length}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('packages')}
                                className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                                    activeTab === 'packages'
                                        ? 'border-[#C99632] text-[#A87520] bg-[#EFE7D8]/30 rounded-t-xl'
                                        : 'border-transparent text-[#77736C] hover:text-[#24221E]'
                                }`}
                            >
                                <span>📦</span>
                                <span>Packages</span>
                                <span className="ml-1 rounded-full bg-[#EFE7D8] px-2 py-0.5 text-[10px] text-[#A87520]">
                                    {packages.length}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('reviews')}
                                className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                                    activeTab === 'reviews'
                                        ? 'border-[#C99632] text-[#A87520] bg-[#EFE7D8]/30 rounded-t-xl'
                                        : 'border-transparent text-[#77736C] hover:text-[#24221E]'
                                }`}
                            >
                                <span>⭐</span>
                                <span>Reviews & Ratings</span>
                                <span className="ml-1 rounded-full bg-[#EFE7D8] px-2 py-0.5 text-[10px] text-[#A87520]">
                                    {reviews.length}
                                </span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Main Content Area based on Active Tab */}
                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* TAB 1: PORTFOLIO WORKS */}
                    {activeTab === 'portfolio' && (
                        <div>
                            {/* Filter and Search Bar */}
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                {/* Categories Tabs */}
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentCategory('all')}
                                        className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                                            currentCategory === 'all'
                                                ? 'bg-[#C99632] text-white shadow-xs'
                                                : 'bg-white text-[#24221E] border border-[#EFE7D8] hover:bg-[#EFE7D8]'
                                        }`}
                                    >
                                        All Projects ({portfolios.length})
                                    </button>

                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCurrentCategory(String(cat.id))}
                                            className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                                                String(currentCategory) === String(cat.id)
                                                    ? 'bg-[#C99632] text-white shadow-xs'
                                                    : 'bg-white text-[#24221E] border border-[#EFE7D8] hover:bg-[#EFE7D8]'
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
                                        className="w-full rounded-xl border border-[#DCC9A8] bg-white py-2 pl-9 pr-4 text-xs text-[#24221E] shadow-2xs focus:border-[#C99632] focus:outline-none"
                                    />
                                    <span className="pointer-events-none absolute left-3 top-2.5 text-xs text-[#77736C]">
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
                                                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[#EFE7D8] bg-white shadow-xs transition duration-300 hover:-translate-y-1 hover:border-[#C99632] hover:shadow-xl"
                                            >
                                                <div>
                                                    {/* Cover Image Container */}
                                                    <div
                                                        className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-[#EFE7D8]"
                                                        onClick={() => openProject(portfolio, 0)}
                                                    >
                                                        {cover ? (
                                                            <img
                                                                src={cover}
                                                                alt={portfolio.title}
                                                                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center bg-[#EFE7D8] text-3xl">
                                                                📷
                                                            </div>
                                                        )}

                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

                                                        {portfolio.is_featured && (
                                                            <span className="absolute left-3 top-3 rounded-md bg-[#C99632] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
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
                                                        <span className="rounded-md bg-[#EFE7D8] px-2 py-0.5 text-[10px] font-bold text-[#A87520]">
                                                            {portfolio.event_category?.name || 'Event Project'}
                                                        </span>

                                                        <h3 className="mt-2 line-clamp-1 text-base font-black text-[#24221E] transition group-hover:text-[#C99632]">
                                                            {portfolio.title}
                                                        </h3>

                                                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#77736C]">
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
                                                            <p className="mt-2.5 line-clamp-2 text-xs text-[#77736C]">
                                                                {portfolio.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action Bar */}
                                                <div className="flex items-center justify-between border-t border-[#EFE7D8] px-5 py-3.5 bg-[#F8F5EF]/50">
                                                    <span className="text-[11px] text-[#77736C]">
                                                        {portfolio.client_name ? `Client: ${portfolio.client_name}` : 'Milestone Work'}
                                                    </span>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openProject(portfolio, 0)}
                                                            className="text-xs font-bold text-[#A87520] hover:text-[#C99632] cursor-pointer"
                                                        >
                                                            Quick View
                                                        </button>
                                                        <span className="text-[#DCC9A8]">•</span>
                                                        <Link
                                                            href={route('customer.portfolios.show', portfolio.id)}
                                                            className="text-xs font-bold text-[#24221E] hover:text-[#C99632]"
                                                        >
                                                            Full Details →
                                                        </Link>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="mt-10 rounded-3xl border-2 border-dashed border-[#DCC9A8] bg-white px-6 py-16 text-center">
                                    <div className="text-4xl">📸</div>
                                    <h3 className="mt-4 text-lg font-bold text-[#24221E]">No projects found</h3>
                                    <p className="mt-1 text-xs text-[#77736C]">
                                        {searchQuery || currentCategory !== 'all'
                                            ? 'No portfolio projects match your filters.'
                                            : `${businessName} has not published projects yet.`}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: SERVICES */}
                    {activeTab === 'services' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold font-serif text-[#24221E]">
                                        Available Services
                                    </h2>
                                    <p className="text-xs text-[#77736C] mt-0.5">
                                        Services offered directly by {businessName}.
                                    </p>
                                </div>
                                <span className="px-3 py-1 rounded-xl bg-[#EFE7D8] text-[#A87520] font-bold text-xs">
                                    {services.length} {services.length === 1 ? 'Service' : 'Services'}
                                </span>
                            </div>

                            {services.length > 0 ? (
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {services.map((service) => (
                                        <div
                                            key={service.id}
                                            className="rounded-3xl border border-[#EFE7D8] bg-white p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between gap-2">
                                                    {service.category && (
                                                        <span className="px-2.5 py-0.5 rounded-lg bg-[#EFE7D8] text-[#A87520] font-bold text-[10px] uppercase tracking-wider">
                                                            {service.category}
                                                        </span>
                                                    )}
                                                    <span className="text-lg font-black text-[#A87520]">
                                                        ₱{Number(service.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>

                                                <h3 className="text-base font-bold text-[#24221E] mt-3">
                                                    {service.name}
                                                </h3>

                                                {service.description && (
                                                    <p className="text-xs text-[#77736C] mt-2 leading-relaxed">
                                                        {service.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-[#EFE7D8] flex items-center justify-between">
                                                <span className="text-[11px] text-[#77736C]">Verified Vendor Service</span>
                                                <Link
                                                    href={route('customer.bookings.create', { service_id: service.id })}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C99632] hover:bg-[#A87520] text-white text-xs font-bold shadow-xs transition"
                                                >
                                                    <span>Book Now</span>
                                                    <span>→</span>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-3xl border-2 border-dashed border-[#DCC9A8] bg-white px-6 py-16 text-center">
                                    <div className="text-4xl">🛠️</div>
                                    <h3 className="mt-4 text-base font-bold text-[#24221E]">No standalone services listed</h3>
                                    <p className="mt-1 text-xs text-[#77736C]">
                                        Check available packages or reach out via direct message.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: PACKAGES */}
                    {activeTab === 'packages' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold font-serif text-[#24221E]">
                                        Available Packages
                                    </h2>
                                    <p className="text-xs text-[#77736C] mt-0.5">
                                        Curated packages and bundled offerings from {businessName}.
                                    </p>
                                </div>
                                <span className="px-3 py-1 rounded-xl bg-[#EFE7D8] text-[#A87520] font-bold text-xs">
                                    {packages.length} {packages.length === 1 ? 'Package' : 'Packages'}
                                </span>
                            </div>

                            {packages.length > 0 ? (
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {packages.map((pkg) => (
                                        <div
                                            key={pkg.id}
                                            className="rounded-3xl border border-[#EFE7D8] bg-white p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="px-2.5 py-0.5 rounded-lg bg-[#EFE7D8] text-[#A87520] font-bold text-[10px]">
                                                        {pkg.event_category?.name || 'All Events'}
                                                    </span>
                                                    {pkg.is_top_package && (
                                                        <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 font-bold text-[10px]">
                                                            ⭐ Top Package
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="text-base font-bold text-[#24221E] mt-3">
                                                    {pkg.name}
                                                </h3>

                                                <div className="mt-2 text-xl font-black text-[#A87520]">
                                                    ₱{Number(pkg.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </div>

                                                {pkg.description && (
                                                    <p className="text-xs text-[#77736C] mt-2 leading-relaxed">
                                                        {pkg.description}
                                                    </p>
                                                )}

                                                {pkg.inclusions && (
                                                    <div className="mt-4 p-3 rounded-2xl bg-[#F8F5EF] border border-[#EFE7D8]">
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#77736C]">Inclusions:</p>
                                                        <p className="text-xs text-[#24221E] mt-1 whitespace-pre-line leading-relaxed">
                                                            {pkg.inclusions}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-[#EFE7D8] flex items-center justify-between">
                                                <span className="text-[11px] text-[#77736C]">Turnkey Package</span>
                                                <Link
                                                    href={route('customer.bookings.create', { package_id: pkg.id })}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C99632] hover:bg-[#A87520] text-white text-xs font-bold shadow-xs transition"
                                                >
                                                    <span>Book Package</span>
                                                    <span>→</span>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-3xl border-2 border-dashed border-[#DCC9A8] bg-white px-6 py-16 text-center">
                                    <div className="text-4xl">📦</div>
                                    <h3 className="mt-4 text-base font-bold text-[#24221E]">No packages listed yet</h3>
                                    <p className="mt-1 text-xs text-[#77736C]">
                                        Browse the services tab or send an inquiry for custom quotes.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 4: REVIEWS & RATINGS */}
                    {activeTab === 'reviews' && (
                        <div>
                            <SupplierReviewsSummary
                                ratingStats={ratingStats}
                                reviews={reviews}
                                title={`Client Reviews for ${businessName}`}
                                subtitle="Verified feedback from past wedding and milestone celebrations."
                            />
                        </div>
                    )}
                </main>
            </div>

            {/* Lightbox / Project Details Quick Modal */}
            {activeProject && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
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
                            className="absolute right-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFE7D8] text-[#24221E] hover:bg-[#DCC9A8] transition cursor-pointer"
                        >
                            ✕
                        </button>

                        {/* Image Viewer */}
                        <div className="relative flex flex-1 flex-col items-center justify-center bg-slate-950 p-6">
                            {activeImages.length > 1 && (
                                <button
                                    type="button"
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-2xl bg-white/20 text-2xl text-white transition hover:bg-white/30 cursor-pointer"
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
                                    <div className="text-sm text-[#77736C]">No photos available</div>
                                )}
                            </div>

                            {activeImages.length > 1 && (
                                <button
                                    type="button"
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-2xl bg-white/20 text-2xl text-white transition hover:bg-white/30 cursor-pointer"
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
                                    <p className="mt-0.5 text-[10px] text-[#A87520] font-mono">
                                        Photo {activeImageIndex + 1} of {activeImages.length}
                                    </p>
                                </div>
                            )}

                            {/* Thumbnails */}
                            {activeImages.length > 1 && (
                                <div className="mt-3 flex max-w-md gap-2 overflow-x-auto rounded-xl bg-white/10 p-1.5">
                                    {activeImages.map((img, idx) => (
                                        <button
                                            key={img.id || idx}
                                            type="button"
                                            onClick={() => setActiveImageIndex(idx)}
                                            className={`h-10 w-10 shrink-0 overflow-hidden rounded-lg border-2 transition cursor-pointer ${
                                                activeImageIndex === idx
                                                    ? 'border-[#C99632] ring-2 ring-[#C99632]/50'
                                                    : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                        >
                                            <img
                                                src={getImageUrl(img)}
                                                alt="thumb"
                                                className="h-full w-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Project Details Panel */}
                        <div className="flex w-full flex-col justify-between p-6 lg:w-80 lg:p-8">
                            <div>
                                <span className="rounded-md bg-[#EFE7D8] px-2.5 py-1 text-[10px] font-bold text-[#A87520]">
                                    {activeProject.event_category?.name || 'Milestone Portfolio'}
                                </span>

                                <h2 className="mt-2 text-lg font-black text-[#24221E] font-serif">
                                    {activeProject.title}
                                </h2>

                                <div className="mt-3 space-y-1 text-xs text-[#77736C]">
                                    {activeProject.client_name && (
                                        <p>👤 Client: {activeProject.client_name}</p>
                                    )}
                                    {activeProject.event_date && (
                                        <p>
                                            📅 Date:{' '}
                                            {new Date(activeProject.event_date).toLocaleDateString()}
                                        </p>
                                    )}
                                    {activeProject.location && <p>📍 {activeProject.location}</p>}
                                </div>

                                {activeProject.description && (
                                    <div className="mt-4">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#77736C]">
                                            Description
                                        </p>
                                        <p className="mt-1 whitespace-pre-line text-xs text-[#24221E] leading-relaxed">
                                            {activeProject.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 border-t border-[#EFE7D8] pt-4 space-y-2">
                                <Link
                                    href={route('customer.portfolios.show', activeProject.id)}
                                    className="block w-full rounded-xl border border-[#DCC9A8] py-2.5 text-center text-xs font-bold text-[#24221E] hover:bg-[#F8F5EF] transition"
                                >
                                    Open Full Gallery Page
                                </Link>

                                <Link
                                    href={route('customer.bookings.create', { supplier_id: supplierId })}
                                    className="block w-full rounded-xl bg-gradient-to-r from-[#C99632] to-[#A87520] py-2.5 text-center text-xs font-bold text-white hover:shadow-md transition"
                                >
                                    Book This Supplier
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}