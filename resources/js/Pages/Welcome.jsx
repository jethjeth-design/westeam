import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export default function Welcome({
    banners = [],
    sections = {},
    settings = {},
    eventCategories = [],
    featuredSuppliers = [],
    topPackages = [],
    galleryItems = [],
    highlights = [],
}) {
    // -------------------------------------------------------------
    // 1. Hero Banner Slider State
    // -------------------------------------------------------------
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const bannerList = banners && banners.length > 0 ? banners : [
        {
            id: 1,
            badge: 'Your Perfect Event Starts Here',
            title: 'Find the Best Suppliers for Your Special Moments',
            subtitle: 'Connect with trusted suppliers, explore amazing packages, and make your dream event a reality.',
            image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80',
            button_text: 'Explore Suppliers',
            button_url: '/suppliers',
            secondary_button_text: 'View Packages',
            secondary_button_url: '/packages',
        },
    ];

    useEffect(() => {
        if (!isAutoPlaying || bannerList.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % bannerList.length);
        }, 5500);

        return () => clearInterval(interval);
    }, [isAutoPlaying, bannerList.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % bannerList.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + bannerList.length) % bannerList.length);
    const activeBanner = bannerList[currentSlide] || bannerList[0];

    // -------------------------------------------------------------
    // 2. Featured Suppliers Filter & Carousel State
    // -------------------------------------------------------------
    const [supplierSearch, setSupplierSearch] = useState('');
    const [supplierCategoryFilter, setSupplierCategoryFilter] = useState('all');
    const [supplierSlide, setSupplierSlide] = useState(0);

    const filteredSuppliers = useMemo(() => {
        let list = featuredSuppliers || [];

        if (supplierCategoryFilter !== 'all') {
            list = list.filter((s) => {
                if (s.event_category_ids && s.event_category_ids.includes(Number(supplierCategoryFilter))) {
                    return true;
                }
                const selectedCategory = eventCategories.find((c) => String(c.id) === String(supplierCategoryFilter));
                if (selectedCategory && s.categories) {
                    const catName = selectedCategory.name.toLowerCase();
                    return s.categories.some((c) => c.toLowerCase().includes(catName)) ||
                        (s.category && s.category.toLowerCase().includes(catName));
                }
                return false;
            });
        }

        if (supplierSearch.trim()) {
            const query = supplierSearch.toLowerCase().trim();
            list = list.filter((s) => {
                const businessName = (s.business_name || '').toLowerCase();
                const category = (s.category || '').toLowerCase();
                const categories = Array.isArray(s.categories) ? s.categories.join(' ').toLowerCase() : '';
                const description = (s.short_info || s.description || '').toLowerCase();
                const address = (s.address || '').toLowerCase();

                return businessName.includes(query) ||
                    category.includes(query) ||
                    categories.includes(query) ||
                    description.includes(query) ||
                    address.includes(query);
            });
        }

        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }, [featuredSuppliers, supplierCategoryFilter, supplierSearch, eventCategories]);

    const visibleSuppliers = useMemo(() => {
        if (!filteredSuppliers || filteredSuppliers.length === 0) return [];
        const countToShow = Math.min(3, filteredSuppliers.length);
        const result = [];
        for (let i = 0; i < countToShow; i++) {
            result.push(filteredSuppliers[(supplierSlide + i) % filteredSuppliers.length]);
        }
        
        // Place the highest rated (first item) in the middle if there are 3 items
        if (result.length === 3) {
            return [result[1], result[0], result[2]];
        }
        
        return result;
    }, [filteredSuppliers, supplierSlide]);

    const nextSupplierSlide = () => {
        if (filteredSuppliers.length <= 3) return;
        setSupplierSlide((prev) => (prev >= filteredSuppliers.length - 1 ? 0 : prev + 1));
    };

    const prevSupplierSlide = () => {
        if (filteredSuppliers.length <= 3) return;
        setSupplierSlide((prev) => (prev <= 0 ? filteredSuppliers.length - 1 : prev - 1));
    };

    // Curated Fallbacks for Event Category imagery
    const fallbackCategoryPhotos = {
        wedding: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
        birthday: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
        debut: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80',
        corporate: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
        anniversary: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
        other: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
    };

    const getCategoryPhoto = (cat) => {
        if (cat.image_url) return cat.image_url;
        const lower = cat.name.toLowerCase();
        if (lower.includes('wed')) return fallbackCategoryPhotos.wedding;
        if (lower.includes('birth')) return fallbackCategoryPhotos.birthday;
        if (lower.includes('debut')) return fallbackCategoryPhotos.debut;
        if (lower.includes('corp') || lower.includes('summit')) return fallbackCategoryPhotos.corporate;
        if (lower.includes('anniv')) return fallbackCategoryPhotos.anniversary;
        return fallbackCategoryPhotos.other;
    };

    // Highlight icons mapping
    const getHighlightIcon = (iconName) => {
        switch (iconName) {
            case 'shield-check':
                return (
                    <svg className="w-6 h-6 text-[#A87520]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                );
            case 'sparkles':
                return (
                    <svg className="w-6 h-6 text-[#A87520]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                );
            case 'calendar-check':
                return (
                    <svg className="w-6 h-6 text-[#A87520]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                );
            case 'gift':
            default:
                return (
                    <svg className="w-6 h-6 text-[#A87520]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                );
        }
    };

    return (
        <PublicLayout title="Home - Event & Wedding Supplier Management">
            <Head>
                <meta
                    name="description"
                    content="Discover and book premier wedding and event suppliers, photographers, caterers, stylists, and top curated packages."
                />
            </Head>

            {/* ========================================================================= */}
            {/* 1. HERO BANNER SLIDER                                                     */}
            {/* ========================================================================= */}
            {sections.hero_slider?.is_active !== false && (
                <section
                    className="relative w-full h-[620px] lg:h-[680px] overflow-hidden bg-[#24221E]"
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                >
                    {/* Background Slides */}
                    {bannerList.map((banner, index) => (
                        <div
                            key={banner.id || index}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                                } transition-transform duration-[7000ms]`}
                        >
                            <img
                                src={banner.image_url}
                                alt={banner.title}
                                className="w-full h-full object-cover object-center"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#24221E]/85 via-[#24221E]/40 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#24221E]/60 via-transparent to-black/20" />
                        </div>
                    ))}

                    {/* Left/Right Navigation Arrows */}
                    <button
                        onClick={prevSlide}
                        aria-label="Previous Slide"
                        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white border border-white/30 flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg group"
                    >
                        <svg className="w-5 h-5 text-white group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        aria-label="Next Slide"
                        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white border border-white/30 flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg group"
                    >
                        <svg className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Hero Banner Content Card */}
                    <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
                        <div className="max-w-xl lg:max-w-2xl bg-white/10 backdrop-blur-md p-6 sm:p-8 lg:p-10 rounded-3xl border border-white/20 shadow-xl animate-fade-in">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#EFE7D8] text-xs font-bold tracking-wider uppercase mb-5 shadow-xs">
                                <span className="w-2 h-2 rounded-full bg-[#C99632] animate-pulse" />
                                {activeBanner.badge || 'Your Perfect Event Starts Here'}
                            </div>

                            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.15] mb-4 drop-shadow-md">
                                {activeBanner.title}
                            </h1>

                            <p className="text-[#DFDAD4] text-sm sm:text-base leading-relaxed mb-8 drop-shadow-sm">
                                {activeBanner.subtitle}
                            </p>

                            <div className="flex flex-wrap items-center gap-4">
                                <Link
                                    href={activeBanner.button_url || '/suppliers'}
                                    className="px-8 py-3.5 rounded-full bg-[#C99632] hover:bg-[#A87520] text-white text-xs sm:text-sm font-bold tracking-wider uppercase shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                                >
                                    {activeBanner.button_text || 'Explore Suppliers'}
                                </Link>
                                <Link
                                    href={activeBanner.secondary_button_url || '/packages'}
                                    className="px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white border-2 border-white/30 hover:border-white/60 text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200"
                                >
                                    {activeBanner.secondary_button_text || 'View Packages'}
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Banner Dot Indicators */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-[#24221E]/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                        {bannerList.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                                className={`transition-all duration-300 rounded-full ${index === currentSlide
                                    ? 'w-7 h-2 bg-[#C99632]'
                                    : 'w-2 h-2 bg-white/50 hover:bg-white'
                                    }`}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* ========================================================================= */}
            {/* 2. HIGHLIGHTS FEATURE BAR                                                 */}
            {/* ========================================================================= */}
            {sections.feature_highlights?.is_active !== false && (
                <section className="relative z-20 -mt-8 sm:-mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {(highlights && highlights.length > 0 ? highlights : [
                            { icon: 'shield-check', title: 'Trusted Suppliers', subtitle: 'Verified & Professional' },
                            { icon: 'sparkles', title: 'Quality Services', subtitle: 'Premium Experience' },
                            { icon: 'calendar-check', title: 'Easy Booking', subtitle: 'Simple & Secure' },
                            { icon: 'gift', title: 'Best Packages', subtitle: 'For Every Occasion' },
                        ]).map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#EFE7D8] shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-[#EFE7D8]/80 border border-[#DCC9A8]/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    {getHighlightIcon(item.icon)}
                                </div>
                                <div>
                                    <h3 className="font-serif font-bold text-sm text-[#24221E] leading-tight">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-[#77736C] mt-0.5 font-medium">
                                        {item.subtitle}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ========================================================================= */}
            {/* 3. EVENT CATEGORIES SECTION ("Browse by Event Type")                      */}
            {/* ========================================================================= */}
            {sections.event_categories?.is_active !== false && eventCategories.length > 0 && (
                <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE7D8]/80 border border-[#DCC9A8]/60 text-[#A87520] text-[10px] font-bold tracking-wider uppercase mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#C99632]" />
                                Celebrate Every Milestone
                            </div>
                            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24221E]">
                                {sections.event_categories?.title || 'Browse by Event Type'}
                            </h2>
                            <p className="text-[#77736C] text-sm mt-1.5 max-w-xl">
                                {sections.event_categories?.subtitle || 'Explore tailored services and experienced suppliers for every occasion.'}
                            </p>
                        </div>

                        <Link
                            href="/events"
                            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C99632] hover:text-[#A87520] group self-start sm:self-auto"
                        >
                            <span>View All Events</span>
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                        {eventCategories.slice(0, 6).map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/events?category_id=${cat.id}`}
                                className="group relative rounded-2xl overflow-hidden bg-white border border-[#EFE7D8] shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col"
                            >
                                <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-[#EFE7D8]">
                                    <img
                                        src={getCategoryPhoto(cat)}
                                        alt={cat.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = fallbackCategoryPhotos.wedding;
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#24221E]/90 via-[#24221E]/30 to-transparent" />

                                    <div className="absolute bottom-3 left-3 right-3 text-white">
                                        <h3 className="font-serif font-bold text-sm sm:text-base leading-tight group-hover:text-[#EFE7D8] transition-colors">
                                            {cat.name}
                                        </h3>
                                        <p className="text-[11px] text-[#DFDAD4] mt-0.5">
                                            {cat.packages_count} {cat.packages_count === 1 ? 'Package' : 'Packages'}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* ========================================================================= */}
            {/* 4. FEATURED SUPPLIERS SECTION (Single Source: Featured Supplier Mgmt)      */}
            {/* ========================================================================= */}
            {sections.featured_suppliers?.is_active !== false && (
                <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#EFE7D8]/60">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE7D8]/80 border border-[#DCC9A8]/60 text-[#A87520] text-[10px] font-bold tracking-wider uppercase mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#C99632]" />
                                Top Performers
                            </div>
                            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24221E]">
                                {sections.featured_suppliers?.title || 'Featured Suppliers'}
                            </h2>
                            <p className="text-[#77736C] text-sm mt-1.5">
                                {sections.featured_suppliers?.subtitle || 'Verified premier suppliers with exemplary ratings and proven event execution.'}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {filteredSuppliers.length > 3 && (
                                <div className="hidden sm:flex items-center gap-2">
                                    <button
                                        onClick={prevSupplierSlide}
                                        aria-label="Previous Suppliers"
                                        className="w-9 h-9 rounded-full bg-white border border-[#DCC9A8] hover:border-[#C99632] hover:bg-[#EFE7D8] text-[#24221E] flex items-center justify-center transition-all duration-200 shadow-xs active:scale-95"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={nextSupplierSlide}
                                        aria-label="Next Suppliers"
                                        className="w-9 h-9 rounded-full bg-white border border-[#DCC9A8] hover:border-[#C99632] hover:bg-[#EFE7D8] text-[#24221E] flex items-center justify-center transition-all duration-200 shadow-xs active:scale-95"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            <Link
                                href="/suppliers"
                                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C99632] hover:text-[#A87520] group"
                            >
                                <span>View All Suppliers</span>
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Search & Event Categories Filtering for Featured Suppliers */}
                    <div className="bg-white p-4 rounded-2xl border border-[#EFE7D8] shadow-2xs mb-8 space-y-3">
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            {/* Search Input */}
                            <div className="relative flex-1 w-full">
                                <input
                                    type="text"
                                    value={supplierSearch}
                                    onChange={(e) => {
                                        setSupplierSearch(e.target.value);
                                        setSupplierSlide(0);
                                    }}
                                    placeholder="Search featured suppliers by name, category, or location..."
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F8F5EF] border border-[#EFE7D8] text-sm text-[#24221E] placeholder-[#77736C] focus:ring-2 focus:ring-[#C99632] focus:border-transparent outline-none transition-all"
                                />
                                <svg
                                    className="w-4 h-4 text-[#A87520] absolute left-3.5 top-1/2 -translate-y-1/2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {supplierSearch && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSupplierSearch('');
                                            setSupplierSlide(0);
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77736C] hover:text-[#24221E] p-1"
                                        aria-label="Clear supplier search"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Category Dropdown Filter */}
                            <div className="w-full sm:w-1/3 md:w-1/4 relative">
                                <select
                                    value={supplierCategoryFilter}
                                    onChange={(e) => {
                                        setSupplierCategoryFilter(e.target.value);
                                        setSupplierSlide(0);
                                    }}
                                    className="w-full appearance-none py-2.5 pl-3.5 pr-9 rounded-xl bg-[#F8F5EF] border border-[#EFE7D8] text-sm text-[#24221E] font-medium focus:ring-2 focus:ring-[#C99632] focus:border-transparent outline-none cursor-pointer transition-all"
                                >
                                    <option value="all">All Event Categories</option>
                                    {eventCategories.map((cat) => (
                                        <option key={cat.id} value={String(cat.id)}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#77736C]">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Suppliers Grid Container */}
                    <div className="relative">
                        {visibleSuppliers.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {visibleSuppliers.map((supplier, index) => (
                                    <div
                                        key={supplier.id || index}
                                        className="bg-white rounded-2xl overflow-hidden border border-[#EFE7D8] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
                                    >
                                        {/* Cover Photo */}
                                        <div className="relative h-48 w-full overflow-hidden bg-[#EFE7D8]">
                                            <img
                                                src={supplier.cover_photo_url || supplier.profile_picture_url}
                                                alt={supplier.business_name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
                                                }}
                                            />
                                            <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#24221E]/80 backdrop-blur-xs text-white text-[10px] font-bold tracking-wider uppercase shadow-xs">
                                                {supplier.category || 'Specialist'}
                                            </span>

                                            {/* Profile Picture Thumbnail */}
                                            <div className="absolute -bottom-4 left-4 w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md bg-white">
                                                <img
                                                    src={supplier.profile_picture_url}
                                                    alt={supplier.business_name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Content Area */}
                                        <div className="p-5 pt-6 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-serif font-bold text-base text-[#24221E] line-clamp-1 group-hover:text-[#A87520] transition-colors">
                                                    {supplier.business_name}
                                                </h3>

                                                <p className="text-xs text-[#77736C] mt-1 line-clamp-1 font-medium">
                                                    {supplier.categories && supplier.categories.length > 0
                                                        ? supplier.categories.join(' • ')
                                                        : supplier.category}
                                                </p>

                                                {/* Short Business Info */}
                                                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                                                    {supplier.short_info || supplier.description}
                                                </p>

                                                {/* Rating & Reviews */}
                                                <div className="flex items-center gap-1.5 mt-3 text-xs">
                                                    <span className="text-[#C99632] font-bold text-sm leading-none">★</span>
                                                    <span className="font-bold text-[#24221E]">{supplier.rating || 5.0}</span>
                                                    <span className="text-[#77736C]">({supplier.reviews_count || 0} reviews)</span>
                                                </div>

                                                {/* Location */}
                                                <p className="text-xs text-[#77736C] mt-2 flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5 text-[#C99632] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="line-clamp-1">{supplier.address || 'Metro Manila, Philippines'}</span>
                                                </p>
                                            </div>

                                            {/* Action Button */}
                                            <div className="mt-5 pt-4 border-t border-[#EFE7D8]">
                                                <Link
                                                    href={`/suppliers/${supplier.user_id || supplier.id}`}
                                                    className="block w-full text-center py-2.5 rounded-full border border-[#DCC9A8] hover:border-[#C99632] hover:bg-[#C99632] hover:text-white text-xs font-bold text-[#24221E] uppercase tracking-wider transition-all duration-200 shadow-2xs"
                                                >
                                                    View Profile
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 px-4 rounded-3xl bg-[#F8F5EF] border border-[#EFE7D8]">
                                <div className="w-16 h-16 rounded-full bg-[#EFE7D8] flex items-center justify-center mx-auto text-[#C99632] mb-3">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-serif font-bold text-lg text-[#24221E]">No Featured Suppliers Found</h3>
                                <p className="text-xs sm:text-sm text-[#77736C] max-w-md mx-auto mt-1">
                                    {supplierSearch || supplierCategoryFilter !== 'all'
                                        ? 'No featured suppliers match your search and category criteria.'
                                        : 'There are currently no featured suppliers matching this category.'}
                                </p>
                                <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
                                    {(supplierSearch || supplierCategoryFilter !== 'all') && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSupplierSearch('');
                                                setSupplierCategoryFilter('all');
                                                setSupplierSlide(0);
                                            }}
                                            className="px-6 py-2.5 rounded-full border border-[#DCC9A8] hover:border-[#C99632] bg-white text-[#24221E] font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                    <Link
                                        href="/suppliers"
                                        className="px-6 py-2.5 rounded-full bg-[#C99632] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#A87520] transition-colors shadow-xs"
                                    >
                                        Browse All Suppliers
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* ========================================================================= */}
            {/* 5. TOP 3 PACKAGES SPOTLIGHT — highest-rated in the centre                */}
            {/* ========================================================================= */}
            {topPackages && topPackages.length > 0 && (
                <section className="py-20 sm:py-24 bg-gradient-to-b from-[#F8F5EF] to-white relative overflow-hidden">
                    {/* Decorative background blobs */}
                    <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#C99632]/8 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-[#C99632]/8 blur-3xl pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        {/* Section Header */}
                        <div className="text-center mb-14">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFE7D8]/80 border border-[#DCC9A8]/60 text-[#A87520] text-[10px] font-bold tracking-widest uppercase mb-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#C99632]" />
                                Best Rated
                            </div>
                            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#24221E] leading-tight">
                                Top Packages of the Season
                            </h2>
                            <p className="text-[#77736C] text-sm sm:text-base mt-3 max-w-xl mx-auto leading-relaxed">
                                Handpicked from our highest-rated suppliers — the packages customers love most.
                            </p>
                        </div>

                        {/* 3-Card Podium Layout */}
                        <div className={`flex flex-col lg:flex-row items-end justify-center gap-6 lg:gap-4 ${topPackages.length === 1 ? 'lg:justify-center' : ''}`}>
                            {topPackages.map((pkg, idx) => {
                                // idx=0 → left (2nd best), idx=1 → centre (best), idx=2 → right (3rd best)
                                const isCentre = topPackages.length === 3 ? idx === 1 : topPackages.length === 1;
                                const rank = topPackages.length === 3
                                    ? (idx === 1 ? 1 : idx === 0 ? 2 : 3)
                                    : idx + 1;

                                const rankConfig = {
                                    1: { badge: '🏆 #1 Best Rated', badgeBg: 'bg-[#C99632]', ring: 'ring-2 ring-[#C99632]/60', scale: 'lg:scale-[1.06]', cardBg: 'bg-white', headerH: 'h-56 sm:h-64', zIndex: 'z-10' },
                                    2: { badge: '🥈 #2 Top Pick', badgeBg: 'bg-[#77736C]', ring: 'ring-1 ring-[#DCC9A8]', scale: '', cardBg: 'bg-white', headerH: 'h-48 sm:h-56', zIndex: '' },
                                    3: { badge: '🥉 #3 Top Pick', badgeBg: 'bg-[#A87520]/80', ring: 'ring-1 ring-[#DCC9A8]', scale: '', cardBg: 'bg-white', headerH: 'h-48 sm:h-56', zIndex: '' },
                                }[rank];

                                return (
                                    <div
                                        key={pkg.id}
                                        className={`relative flex-1 lg:max-w-sm w-full rounded-3xl overflow-hidden border border-[#EFE7D8] shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col group ${rankConfig.cardBg} ${rankConfig.ring} ${rankConfig.scale} ${rankConfig.zIndex} hover:-translate-y-2`}
                                    >
                                        {/* Package Image */}
                                        <div className={`relative ${rankConfig.headerH} w-full overflow-hidden bg-[#EFE7D8] shrink-0`}>
                                            <img
                                                src={pkg.image_path}
                                                alt={pkg.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
                                                }}
                                            />
                                            {/* Gradient overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#24221E]/70 via-transparent to-transparent" />

                                            {/* Rank Badge */}
                                            <div className={`absolute top-3 left-3 px-3 py-1 rounded-full ${rankConfig.badgeBg} text-white text-[10px] font-bold tracking-wider shadow-md`}>
                                                {rankConfig.badge}
                                            </div>

                                            {/* Category chip */}
                                            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[9px] font-bold tracking-wider uppercase">
                                                {pkg.event_category}
                                            </div>

                                            {/* Supplier avatar */}
                                            {pkg.supplier_avatar && (
                                                <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full border-2 border-white shadow-md overflow-hidden bg-white">
                                                    <img
                                                        src={pkg.supplier_avatar}
                                                        alt={pkg.supplier_name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'; }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-5 sm:p-6 flex flex-col flex-1">
                                            <h3 className={`font-serif font-bold text-[#24221E] leading-tight line-clamp-2 group-hover:text-[#A87520] transition-colors ${isCentre ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'}`}>
                                                {pkg.name}
                                            </h3>

                                            <p className="text-xs text-[#77736C] mt-1 font-medium">by {pkg.supplier_name}</p>

                                            {/* Rating Row */}
                                            <div className="flex items-center gap-2 mt-3">
                                                <div className="flex items-center gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(pkg.rating) ? 'text-[#C99632]' : 'text-[#DCC9A8]'}`} fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <span className="font-bold text-[#24221E] text-xs">{pkg.rating.toFixed(1)}</span>
                                                <span className="text-[#77736C] text-xs">({pkg.reviews_count} {pkg.reviews_count === 1 ? 'review' : 'reviews'})</span>
                                            </div>

                                            {/* Description */}
                                            {pkg.description && (
                                                <p className="text-xs text-[#77736C] mt-3 leading-relaxed line-clamp-2 flex-1">
                                                    {pkg.description}
                                                </p>
                                            )}

                                            {/* Inclusions preview */}
                                            {pkg.inclusions && pkg.inclusions.length > 0 && (
                                                <ul className="mt-3 space-y-1.5">
                                                    {pkg.inclusions.slice(0, isCentre ? 4 : 3).map((inc, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-[11px] text-[#77736C]">
                                                            <svg className="w-3 h-3 text-[#C99632] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            <span className="line-clamp-1">{inc}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            {/* Price & CTA */}
                                            <div className="mt-5 pt-4 border-t border-[#EFE7D8] flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-[10px] text-[#77736C] uppercase tracking-wider font-medium">Starting at</p>
                                                    <p className={`font-bold text-[#24221E] ${isCentre ? 'text-2xl' : 'text-xl'}`}>
                                                        ₱{pkg.price.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                    </p>
                                                </div>
                                                <Link
                                                    href={`/suppliers/${pkg.supplier_id}`}
                                                    className={`shrink-0 px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${isCentre
                                                        ? 'bg-[#C99632] hover:bg-[#A87520] text-white'
                                                        : 'bg-white border border-[#DCC9A8] hover:border-[#C99632] hover:bg-[#EFE7D8] text-[#24221E]'
                                                    }`}
                                                >
                                                    Book Now
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* View All Packages Link */}
                        <div className="mt-12 text-center">
                            <Link
                                href="/packages"
                                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-[#DCC9A8] hover:border-[#C99632] text-[#24221E] hover:text-[#A87520] font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 shadow-xs hover:shadow-md bg-white"
                            >
                                <span>Explore All Packages</span>
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ========================================================================= */}
            {/* 6. PROMOTIONAL BANNER SECTION (Full-bleed)                               */}
            {/* ========================================================================= */}
            {sections.promo_banner?.is_active !== false && (
                <section className="relative overflow-hidden mt-8">
                    <img
                        src={settings.promo_background_image || 'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=2000&q=80'}
                        alt="Event celebration"
                        className="w-full h-80 sm:h-96 lg:h-[480px] object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#24221E]/90 via-[#24221E]/60 to-transparent" />

                    <div className="absolute inset-0 flex items-center px-6 sm:px-16 lg:px-28">
                        <div className="max-w-lg text-white">
                            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4">
                                {settings.promo_heading || 'Make Your Event More Special'}
                            </h2>
                            <p className="text-xs sm:text-sm text-[#DFDAD4] leading-relaxed mb-8">
                                {settings.promo_description || 'From weddings to birthdays, debuts, corporate events, and intimate milestones, our verified partners bring the expertise and passion to make every detail unforgettable.'}
                            </p>
                            <Link
                                href={settings.promo_button_url || '/packages'}
                                className="inline-block px-8 py-3.5 rounded-full bg-[#C99632] hover:bg-[#A87520] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                                {settings.promo_button_text || 'Browse Packages'}
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}