import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function HeroBanner({
    banners = [],
    isActive = true,
    isCustomer = false,
}) {
    if (isActive === false) return null;

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
            button_url: isCustomer ? '/customer/suppliers' : '/suppliers',
            secondary_button_text: 'View Packages',
            secondary_button_url: isCustomer ? '#top-packages' : '/packages',
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

    // Compute customer-aware link URLs
    const getPrimaryUrl = (url) => {
        if (isCustomer && (!url || url === '/suppliers')) {
            return '/customer/suppliers';
        }
        return url || (isCustomer ? '/customer/suppliers' : '/suppliers');
    };

    const getSecondaryUrl = (url) => {
        if (isCustomer && (!url || url === '/packages')) {
            return '#top-packages';
        }
        return url || (isCustomer ? '#top-packages' : '/packages');
    };

    return (
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
                    <div className="absolute inset-0 bg-gradient-to-r from-[#24221E]/85 via-[#24221E]/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#24221E]/60 via-transparent to-black/20" />
                </div>
            ))}

            {/* Left/Right Navigation Arrows */}
            {bannerList.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        aria-label="Previous Slide"
                        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white border border-white/30 flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg group cursor-pointer"
                    >
                        <svg className="w-5 h-5 text-white group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        aria-label="Next Slide"
                        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white border border-white/30 flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg group cursor-pointer"
                    >
                        <svg className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            {/* Hero Banner Content */}
            <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="max-w-xl lg:max-w-2xl animate-fade-in">
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
                            href={getPrimaryUrl(activeBanner.button_url)}
                            className="px-8 py-3.5 rounded-full bg-[#C99632] hover:bg-[#A87520] text-white text-xs sm:text-sm font-bold tracking-wider uppercase shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                            {activeBanner.button_text || 'Explore Suppliers'}
                        </Link>
                        <Link
                            href={getSecondaryUrl(activeBanner.secondary_button_url)}
                            className="px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white border-2 border-white/30 hover:border-white/60 text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200"
                        >
                            {activeBanner.secondary_button_text || 'View Packages'}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Banner Dot Indicators */}
            {bannerList.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-[#24221E]/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    {bannerList.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                            className={`transition-all duration-300 rounded-full cursor-pointer ${
                                index === currentSlide
                                    ? 'w-7 h-2 bg-[#C99632]'
                                    : 'w-2 h-2 bg-white/50 hover:bg-white'
                            }`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
