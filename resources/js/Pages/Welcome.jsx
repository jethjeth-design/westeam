import FeaturedSuppliersSection from '@/Components/FeaturedSuppliersSection';
import HeroBanner from '@/Components/HeroBanner';
import TopPackagesSection from '@/Components/TopPackagesSection';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({
    banners = [],
    sections = {},
    settings = {},
    eventCategories = [],
    featuredSuppliers = [],
    topPackages = [],
    services = [],
    galleryItems = [],
    highlights = [],
}) {
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
            {/* 1. HERO BANNER SLIDER (Shared Reusable Component)                          */}
            {/* ========================================================================= */}
            <HeroBanner
                banners={banners}
                isActive={sections.hero_slider?.is_active !== false}
                isCustomer={false}
            />

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
            {/* 4. FEATURED SUPPLIERS SECTION (Shared Reusable Component)                  */}
            {/* ========================================================================= */}
            <FeaturedSuppliersSection
                featuredSuppliers={featuredSuppliers}
                eventCategories={eventCategories}
                isActive={sections.featured_suppliers?.is_active !== false}
                title={sections.featured_suppliers?.title || 'Featured Suppliers'}
                subtitle={sections.featured_suppliers?.subtitle || 'Verified premier suppliers with exemplary ratings and proven event execution.'}
                isCustomer={false}
            />

            {/* ========================================================================= */}
            {/* 5. TOP 3 PACKAGES SPOTLIGHT (Shared Reusable Component)                   */}
            {/* ========================================================================= */}
            <TopPackagesSection
                topPackages={topPackages}
                isActive={true}
                isCustomer={false}
            />

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