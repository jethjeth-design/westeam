import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Welcome({ banners = [], sections = {}, settings = {}, featuredSuppliers = [], highlights = [] }) {
    // 6-photo banner slider state
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Featured suppliers carousel state
    const [supplierSlide, setSupplierSlide] = useState(0);

    // Curated fallback suppliers matching design mockup
    const defaultFeaturedSuppliers = [
        {
            id: 1,
            user_id: 15,
            business_name: 'ABC Photography',
            category: 'Photography',
            categories: ['Photography', 'Videography'],
            cover_photo_url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80',
            profile_picture_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            rating: 4.9,
            reviews_count: 35,
            address: 'Manila, Philippines',
            is_featured: true,
        },
        {
            id: 2,
            user_id: 16,
            business_name: 'Dream Events',
            category: 'Event Planner',
            categories: ['Event Planner', 'Event Coordination'],
            cover_photo_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
            profile_picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            rating: 4.8,
            reviews_count: 28,
            address: 'Cebu, Philippines',
            is_featured: true,
        },
        {
            id: 3,
            user_id: 17,
            business_name: 'Elegant Catering',
            category: 'Catering',
            categories: ['Catering', 'Banquet'],
            cover_photo_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
            profile_picture_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
            rating: 4.7,
            reviews_count: 22,
            address: 'Davao, Philippines',
            is_featured: true,
        },
        {
            id: 4,
            user_id: 18,
            business_name: 'Bloom Decoration',
            category: 'Decoration',
            categories: ['Decoration', 'Floral Styling'],
            cover_photo_url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
            profile_picture_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
            rating: 4.6,
            reviews_count: 18,
            address: 'Quezon City, Philippines',
            is_featured: true,
        },
        {
            id: 5,
            user_id: 19,
            business_name: 'Vision Videography',
            category: 'Videography',
            categories: ['Videography', 'Cinematography'],
            cover_photo_url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80',
            profile_picture_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
            rating: 4.8,
            reviews_count: 20,
            address: 'Manila, Philippines',
            is_featured: true,
        },
        {
            id: 6,
            user_id: 24,
            business_name: 'Tasteful Bites',
            category: 'Catering',
            categories: ['Catering', 'Pastry'],
            cover_photo_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
            profile_picture_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
            rating: 4.6,
            reviews_count: 15,
            address: 'Laguna, Philippines',
            is_featured: true,
        },
        {
            id: 7,
            user_id: 15,
            business_name: 'Perfect Moments',
            category: 'Photography',
            categories: ['Photography', 'Portraits'],
            cover_photo_url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
            profile_picture_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
            rating: 4.7,
            reviews_count: 19,
            address: 'Cavite, Philippines',
            is_featured: true,
        },
        {
            id: 8,
            user_id: 17,
            business_name: 'Event Styling Co.',
            category: 'Decoration',
            categories: ['Decoration', 'Event Design'],
            cover_photo_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
            profile_picture_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            rating: 4.5,
            reviews_count: 12,
            address: 'Taguig, Philippines',
            is_featured: true,
        },
    ];

    // Merge backend suppliers with fallback if fewer than 4 exist
    const allSuppliers = (() => {
        if (!featuredSuppliers || featuredSuppliers.length === 0) {
            return defaultFeaturedSuppliers;
        }
        if (featuredSuppliers.length < 4) {
            const existingIds = new Set(featuredSuppliers.map((s) => s.id));
            const fillers = defaultFeaturedSuppliers.filter((s) => !existingIds.has(s.id));
            return [...featuredSuppliers, ...fillers];
        }
        return featuredSuppliers;
    })();

    const prevSupplierSlide = () => {
        setSupplierSlide((prev) => (prev <= 0 ? Math.max(0, allSuppliers.length - 4) : prev - 1));
    };

    const nextSupplierSlide = () => {
        setSupplierSlide((prev) => (prev >= allSuppliers.length - 4 ? 0 : prev + 1));
    };

    // Calculate currently visible 4 suppliers (with wrap-around if needed)
    const visibleSuppliers = [];
    const countToShow = Math.min(4, allSuppliers.length);
    for (let i = 0; i < countToShow; i++) {
        visibleSuppliers.push(allSuppliers[(supplierSlide + i) % allSuppliers.length]);
    }

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

    // Automatic slide rotation
    useEffect(() => {
        if (!isAutoPlaying || bannerList.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % bannerList.length);
        }, 5500);

        return () => clearInterval(interval);
    }, [isAutoPlaying, bannerList.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % bannerList.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + bannerList.length) % bannerList.length);
    };

    const activeBanner = bannerList[currentSlide] || bannerList[0];

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
                <meta name="description" content="Discover and book premier wedding and event suppliers, photographers, caterers, stylists, and exclusive packages." />
            </Head>

            {/* ========================================================================= */}
            {/* 1. 6-PHOTO BANNER SLIDER (Hero Section)                                   */}
            {/* ========================================================================= */}
            <section
                className="relative w-full h-[620px] lg:h-[680px] overflow-hidden bg-[#24221E]"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
            >
                {/* Background Slides */}
                {bannerList.map((banner, index) => (
                    <div
                        key={banner.id || index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                        } transition-transform duration-[7000ms]`}
                    >
                        <img
                            src={banner.image_url}
                            alt={banner.title}
                            className="w-full h-full object-cover object-center"
                        />
                        {/* Elegant luxury gradient overlays */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#24221E]/80 via-[#24221E]/40 to-transparent" />
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

                {/* Hero Floating Content Card (Matches Design Mockup) */}
                <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
                    <div className="max-w-xl lg:max-w-2xl bg-[#F8F5EF]/95 backdrop-blur-md p-8 sm:p-10 lg:p-12 rounded-3xl border border-[#DCC9A8]/50 shadow-2xl animate-fade-in">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFE7D8] border border-[#DCC9A8] text-[#A87520] text-xs font-bold tracking-wider uppercase mb-5 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-[#C99632] animate-pulse" />
                            {activeBanner.badge || 'Your Perfect Event Starts Here'}
                        </div>

                        {/* Title */}
                        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#24221E] leading-[1.15] mb-4">
                            {activeBanner.title}
                        </h1>

                        {/* Subtitle / Description */}
                        <p className="text-[#77736C] text-sm sm:text-base leading-relaxed mb-8">
                            {activeBanner.subtitle}
                        </p>

                        {/* Call to Action Buttons */}
                        <div className="flex flex-wrap items-center gap-4">
                            <Link
                                href={activeBanner.button_url || '/suppliers'}
                                className="px-8 py-3.5 rounded-full bg-[#C99632] hover:bg-[#A87520] text-white text-xs sm:text-sm font-bold tracking-wider uppercase shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                                {activeBanner.button_text || 'Explore Suppliers'}
                            </Link>
                            <Link
                                href={activeBanner.secondary_button_url || '/packages'}
                                className="px-8 py-3.5 rounded-full bg-transparent hover:bg-[#EFE7D8]/80 text-[#24221E] border-2 border-[#DCC9A8] hover:border-[#C99632] text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200"
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
                            className={`transition-all duration-300 rounded-full ${
                                index === currentSlide
                                    ? 'w-7 h-2 bg-[#C99632]'
                                    : 'w-2 h-2 bg-white/50 hover:bg-white'
                            }`}
                        />
                    ))}
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 2. HIGHLIGHTS FEATURE BAR (4 Value Propositions)                          */}
            {/* ========================================================================= */}
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

            {/* ========================================================================= */}
            {/* 3. FEATURED SUPPLIERS SECTION                                             */}
            {/* ========================================================================= */}
            <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE7D8]/80 border border-[#DCC9A8]/60 text-[#A87520] text-[10px] font-bold tracking-wider uppercase mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C99632]" />
                            Top Performers
                        </div>
                        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24221E]">
                            Featured Suppliers
                        </h2>
                        <p className="text-[#77736C] text-sm mt-1.5">
                            Top-rated suppliers based on customer reviews and bookings.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Carousel mini indicator / arrow controls */}
                        {allSuppliers.length > 4 && (
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
                            <span>View All</span>
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Suppliers Carousel Container */}
                <div className="relative">
                    {/* Floating Side Arrows (Visible on larger screens) */}
                    {allSuppliers.length > 4 && (
                        <>
                            <button
                                onClick={prevSupplierSlide}
                                aria-label="Previous Suppliers"
                                className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 backdrop-blur-xs border border-[#DCC9A8] shadow-md hover:bg-[#EFE7D8] hover:scale-105 text-[#24221E] items-center justify-center transition-all duration-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={nextSupplierSlide}
                                aria-label="Next Suppliers"
                                className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 backdrop-blur-xs border border-[#DCC9A8] shadow-md hover:bg-[#EFE7D8] hover:scale-105 text-[#24221E] items-center justify-center transition-all duration-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}

                    {/* Suppliers Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {visibleSuppliers.map((supplier, index) => (
                            <div
                                key={supplier.id || index}
                                className="bg-white rounded-2xl overflow-hidden border border-[#EFE7D8] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
                            >
                                {/* Photo Container */}
                                <div className="relative h-52 w-full overflow-hidden bg-[#EFE7D8]">
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
                                    <button
                                        type="button"
                                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#C99632] flex items-center justify-center transition-all shadow-xs hover:scale-110"
                                        title="Save to favorites"
                                        aria-label="Save to favorites"
                                    >
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-serif font-bold text-base text-[#24221E] line-clamp-1 group-hover:text-[#A87520] transition-colors">
                                            {supplier.business_name}
                                        </h3>
                                        <p className="text-xs text-[#77736C] mt-1 line-clamp-1">
                                            {supplier.categories && supplier.categories.length > 0
                                                ? supplier.categories.join(' • ')
                                                : supplier.category}
                                        </p>

                                        {/* Rating & Reviews */}
                                        <div className="flex items-center gap-1.5 mt-3 text-xs">
                                            <span className="text-[#C99632] font-bold text-sm leading-none">★</span>
                                            <span className="font-bold text-[#24221E]">{supplier.rating || 4.9}</span>
                                            <span className="text-[#77736C]">({supplier.reviews_count || 15} reviews)</span>
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
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 4. PROMOTIONAL BANNER SECTION ("Make Your Event More Special")             */}
            {/* ========================================================================= */}
            <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#DCC9A8]/40">
                    <img
                        src={settings.promo_background_image || 'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=2000&q=80'}
                        alt="Event celebration"
                        className="w-full h-80 sm:h-96 object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#24221E]/90 via-[#24221E]/60 to-transparent" />

                    <div className="absolute inset-0 flex items-center px-6 sm:px-12 lg:px-16">
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
                </div>
            </section>
        </PublicLayout>
    );
}