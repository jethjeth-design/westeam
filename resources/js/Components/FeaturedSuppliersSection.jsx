import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function FeaturedSuppliersSection({
    featuredSuppliers = [],
    eventCategories = [],
    isActive = true,
    title = 'Featured Suppliers',
    subtitle = 'Verified premier suppliers with exemplary ratings and proven event execution.',
    isCustomer = false,
}) {
    if (isActive === false) return null;

    const [supplierSlide, setSupplierSlide] = useState(0);

    const filteredSuppliers = useMemo(() => {
        const list = featuredSuppliers || [];
        return [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }, [featuredSuppliers]);

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

    const getSupplierUrl = (supplier) => {
        const targetId = supplier.user_id || supplier.id;
        return isCustomer ? `/customer/suppliers/${targetId}` : `/suppliers/${targetId}`;
    };

    const viewAllUrl = isCustomer ? '/customer/suppliers' : '/suppliers';

    return (
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#EFE7D8]/60">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE7D8]/80 border border-[#DCC9A8]/60 text-[#A87520] text-[10px] font-bold tracking-wider uppercase mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C99632]" />
                        Top Performers
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24221E]">
                        {title}
                    </h2>
                    <p className="text-[#77736C] text-sm mt-1.5">
                        {subtitle}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {filteredSuppliers.length > 3 && (
                        <div className="hidden sm:flex items-center gap-2">
                            <button
                                onClick={prevSupplierSlide}
                                aria-label="Previous Suppliers"
                                className="w-9 h-9 rounded-full bg-white border border-[#DCC9A8] hover:border-[#C99632] hover:bg-[#EFE7D8] text-[#24221E] flex items-center justify-center transition-all duration-200 shadow-xs active:scale-95 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={nextSupplierSlide}
                                aria-label="Next Suppliers"
                                className="w-9 h-9 rounded-full bg-white border border-[#DCC9A8] hover:border-[#C99632] hover:bg-[#EFE7D8] text-[#24221E] flex items-center justify-center transition-all duration-200 shadow-xs active:scale-95 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}

                    <Link
                        href={viewAllUrl}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C99632] hover:text-[#A87520] group"
                    >
                        <span>View All Suppliers</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* Suppliers Podium Container */}
            {visibleSuppliers.length > 0 ? (
                <div className={`flex flex-col lg:flex-row items-end justify-center gap-6 lg:gap-4 ${visibleSuppliers.length === 1 ? 'lg:justify-center' : ''}`}>
                    {visibleSuppliers.map((supplier, idx) => {
                        // idx=0 → left (2nd), idx=1 → centre (1st/best), idx=2 → right (3rd)
                        const isCentre = visibleSuppliers.length === 3 ? idx === 1 : visibleSuppliers.length === 1;
                        const rank = visibleSuppliers.length === 3
                            ? (idx === 1 ? 1 : idx === 0 ? 2 : 3)
                            : idx + 1;

                        const rankConfig = {
                            1: { badge: '🏆 #1 Top Rated', badgeBg: 'bg-[#C99632]', ring: 'ring-2 ring-[#C99632]/60', scale: 'lg:scale-[1.06]', headerH: 'h-56 sm:h-64', zIndex: 'z-10' },
                            2: { badge: '🥈 #2 Top Pick', badgeBg: 'bg-[#77736C]', ring: 'ring-1 ring-[#DCC9A8]', scale: '', headerH: 'h-48 sm:h-56', zIndex: '' },
                            3: { badge: '🥉 #3 Top Pick', badgeBg: 'bg-[#A87520]/80', ring: 'ring-1 ring-[#DCC9A8]', scale: '', headerH: 'h-48 sm:h-56', zIndex: '' },
                        }[rank] || { badge: '⭐ Featured', badgeBg: 'bg-[#C99632]', ring: 'ring-1 ring-[#DCC9A8]', scale: '', headerH: 'h-48 sm:h-56', zIndex: '' };

                        const supplierLink = getSupplierUrl(supplier);

                        return (
                            <Link
                                key={supplier.id || idx}
                                href={supplierLink}
                                className={`relative flex-1 lg:max-w-sm w-full rounded-3xl overflow-hidden border border-[#EFE7D8] shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col group bg-white ${rankConfig.ring} ${rankConfig.scale} ${rankConfig.zIndex} hover:-translate-y-2 cursor-pointer block text-inherit`}
                            >
                                {/* Cover Photo */}
                                <div className={`relative ${rankConfig.headerH} w-full overflow-hidden bg-[#EFE7D8] shrink-0`}>
                                    <img
                                        src={supplier.cover_photo_url || supplier.profile_picture_url}
                                        alt={supplier.business_name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#24221E]/70 via-transparent to-transparent" />

                                    {/* Rank Badge */}
                                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full ${rankConfig.badgeBg} text-white text-[10px] font-bold tracking-wider shadow-md`}>
                                        {rankConfig.badge}
                                    </div>

                                    {/* Category chip */}
                                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[9px] font-bold tracking-wider uppercase">
                                        {supplier.category || 'Specialist'}
                                    </div>

                                    {/* Profile avatar */}
                                    <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden bg-white">
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

                                {/* Card Body */}
                                <div className="p-5 sm:p-6 flex flex-col flex-1">
                                    <h3 className={`font-serif font-bold text-[#24221E] leading-tight line-clamp-1 group-hover:text-[#A87520] transition-colors ${isCentre ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'}`}>
                                        {supplier.business_name}
                                    </h3>

                                    <p className="text-xs text-[#77736C] mt-1 font-medium line-clamp-1">
                                        {supplier.categories && supplier.categories.length > 0
                                            ? supplier.categories.join(' • ')
                                            : supplier.category}
                                    </p>

                                    {/* Rating Row */}
                                    <div className="flex items-center gap-2 mt-3">
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(supplier.rating || 5) ? 'text-[#C99632]' : 'text-[#DCC9A8]'}`} fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="font-bold text-[#24221E] text-xs">{(supplier.rating || 5.0).toFixed(1)}</span>
                                        <span className="text-[#77736C] text-xs">({supplier.reviews_count || 0} {(supplier.reviews_count || 0) === 1 ? 'review' : 'reviews'})</span>
                                    </div>

                                    {/* Short info */}
                                    <p className="text-xs text-[#77736C] mt-3 leading-relaxed line-clamp-2 flex-1">
                                        {supplier.short_info || supplier.description || 'Dedicated professional providing top-quality event services tailored to your needs.'}
                                    </p>

                                    {/* Location */}
                                    <p className="text-xs text-[#77736C] mt-3 flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5 text-[#C99632] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="line-clamp-1">{supplier.address || 'Metro Manila, Philippines'}</span>
                                    </p>

                                    {/* CTA */}
                                    <div className="mt-5 pt-4 border-t border-[#EFE7D8]">
                                        <span
                                            className={`block w-full text-center py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow-md ${
                                                isCentre
                                                    ? 'bg-[#C99632] text-white group-hover:bg-[#A87520]'
                                                    : 'bg-white border border-[#DCC9A8] text-[#24221E] group-hover:border-[#C99632] group-hover:bg-[#EFE7D8]'
                                            }`}
                                        >
                                            View Profile & Portfolio
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 px-4 rounded-3xl bg-[#F8F5EF] border border-[#EFE7D8]">
                    <div className="w-16 h-16 rounded-full bg-[#EFE7D8] flex items-center justify-center mx-auto text-[#C99632] mb-3">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="font-serif font-bold text-lg text-[#24221E]">No Featured Suppliers Available</h3>
                    <p className="text-xs sm:text-sm text-[#77736C] max-w-md mx-auto mt-1">
                        Our featured suppliers list is being updated by the curation team.
                    </p>
                    <div className="mt-5 flex items-center justify-center gap-3">
                        <Link
                            href={viewAllUrl}
                            className="px-6 py-2.5 rounded-full bg-[#C99632] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#A87520] transition-colors shadow-xs"
                        >
                            Browse All Suppliers
                        </Link>
                    </div>
                </div>
            )}
        </section>
    );
}
