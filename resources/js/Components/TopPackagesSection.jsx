import { Link } from '@inertiajs/react';

export default function TopPackagesSection({
    topPackages = [],
    isActive = true,
    title = 'Top Packages of the Season',
    subtitle = 'Handpicked from our highest-rated suppliers — the packages customers love most.',
    isCustomer = false,
}) {
    if (isActive === false || !topPackages || topPackages.length === 0) return null;

    const getPackageBookingUrl = (pkg) => {
        if (isCustomer) {
            return `/customer/suppliers/${pkg.supplier_id}?package_id=${pkg.id}`;
        }
        return `/suppliers/${pkg.supplier_id}`;
    };

    const exploreAllUrl = isCustomer ? '/customer/suppliers' : '/packages';

    return (
        <section id="top-packages" className="py-20 sm:py-24 bg-gradient-to-b from-[#F8F5EF] to-white relative overflow-hidden border-t border-[#EFE7D8]/60">
            {/* Decorative background ambient glows */}
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
                        {title}
                    </h2>
                    <p className="text-[#77736C] text-sm sm:text-base mt-3 max-w-xl mx-auto leading-relaxed">
                        {subtitle}
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
                        }[rank] || { badge: '⭐ Featured Package', badgeBg: 'bg-[#C99632]', ring: 'ring-1 ring-[#DCC9A8]', scale: '', cardBg: 'bg-white', headerH: 'h-48 sm:h-56', zIndex: '' };

                        const packageUrl = getPackageBookingUrl(pkg);

                        return (
                            <div
                                key={pkg.id || idx}
                                className={`relative flex-1 lg:max-w-sm w-full rounded-3xl overflow-hidden border border-[#EFE7D8] shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col group ${rankConfig.cardBg} ${rankConfig.ring} ${rankConfig.scale} ${rankConfig.zIndex} hover:-translate-y-2`}
                            >
                                {/* Package Image */}
                                <Link href={packageUrl} className="relative block overflow-hidden">
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
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Card Body */}
                                <div className="p-5 sm:p-6 flex flex-col flex-1">
                                    <Link href={packageUrl}>
                                        <h3 className={`font-serif font-bold text-[#24221E] leading-tight line-clamp-2 group-hover:text-[#A87520] transition-colors ${isCentre ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'}`}>
                                            {pkg.name}
                                        </h3>
                                    </Link>

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
                                            href={packageUrl}
                                            className={`shrink-0 px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                                                isCentre
                                                    ? 'bg-[#C99632] hover:bg-[#A87520] text-white'
                                                    : 'bg-white border border-[#DCC9A8] hover:border-[#C99632] hover:bg-[#EFE7D8] text-[#24221E]'
                                            }`}
                                        >
                                            {isCustomer ? 'Book Package' : 'Book Now'}
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
                        href={exploreAllUrl}
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
    );
}
