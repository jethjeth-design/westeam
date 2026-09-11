import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function SupplierShow({ supplier }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedPortfolio, setSelectedPortfolio] = useState(null);

    const profile = supplier.profile;
    const services = supplier.services || [];
    const packages = supplier.packages || [];
    const portfolios = supplier.portfolios || [];
    const reviews = supplier.reviews || [];
    const ratingStats = supplier.rating_stats || { average: 4.9, count: 0, distribution: {} };

    return (
        <PublicLayout title={`${profile.business_name} - Supplier Profile`}>
            <Head>
                <meta name="description" content={profile.description || `${profile.business_name} on Event & Wedding Supplier Management.`} />
            </Head>

            {/* Hero Cover Banner */}
            <div className="relative h-64 sm:h-80 lg:h-96 w-full bg-[#24221E] overflow-hidden">
                <img
                    src={profile.cover_photo_url}
                    alt={profile.business_name}
                    className="w-full h-full object-cover object-center opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#24221E]/90 via-[#24221E]/30 to-transparent" />

                {/* Back to Suppliers Button */}
                <div className="absolute top-6 left-4 sm:left-8 z-10">
                    <Link
                        href="/suppliers"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white border border-white/30 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to Suppliers</span>
                    </Link>
                </div>
            </div>

            {/* Profile Info Header Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative -mt-20 sm:-mt-24 mb-10 bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE7D8] shadow-lg flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        {/* Profile Picture */}
                        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-[#EFE7D8] shrink-0">
                            <img
                                src={profile.profile_picture_url}
                                alt={profile.business_name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Text Details */}
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                {profile.categories && profile.categories.map((cat, i) => (
                                    <span key={i} className="px-3 py-1 rounded-full bg-[#EFE7D8] text-[#A87520] text-xs font-bold uppercase tracking-wider">
                                        {cat}
                                    </span>
                                ))}
                                {profile.is_featured && (
                                    <span className="px-3 py-1 rounded-full bg-[#C99632] text-white text-xs font-bold uppercase tracking-wider">
                                        Featured
                                    </span>
                                )}
                            </div>

                            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24221E]">
                                {profile.business_name}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-[#77736C]">
                                <div className="flex items-center gap-1">
                                    <span className="text-[#C99632] font-bold text-sm">★</span>
                                    <span className="font-bold text-[#24221E] text-sm">{ratingStats.average}</span>
                                    <span>({ratingStats.count} reviews)</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5 text-[#C99632]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    <span>{profile.address}</span>
                                </div>
                                {profile.years_of_experience > 0 && (
                                    <>
                                        <span>•</span>
                                        <span>{profile.years_of_experience}+ Years Experience</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact CTA */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Link
                            href={route('register')}
                            className="flex-1 md:flex-none px-6 py-3 rounded-full bg-[#C99632] hover:bg-[#A87520] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs text-center"
                        >
                            Book or Inquire
                        </Link>
                    </div>
                </div>

                {/* Subnav Tabs */}
                <div className="flex items-center gap-2 border-b border-[#EFE7D8] pb-4 mb-8 overflow-x-auto scrollbar-none">
                    {[
                        { key: 'overview', label: 'Overview' },
                        { key: 'packages', label: `Packages (${packages.length})` },
                        { key: 'services', label: `Services (${services.length})` },
                        { key: 'portfolio', label: `Portfolio (${portfolios.length})` },
                        { key: 'reviews', label: `Reviews (${reviews.length})` },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                activeTab === tab.key
                                    ? 'bg-[#24221E] text-white shadow-xs'
                                    : 'text-[#77736C] hover:text-[#24221E] hover:bg-[#EFE7D8]/60'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab 1: OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                        {/* Description and Highlights */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE7D8]">
                                <h2 className="font-serif text-xl font-bold text-[#24221E] mb-4">About Us</h2>
                                <p className="text-sm text-[#77736C] leading-relaxed whitespace-pre-line">
                                    {profile.description || 'Welcome to our business profile! We specialize in delivering unforgettable experiences for weddings, birthdays, debuts, corporate milestones, and private celebrations.'}
                                </p>
                            </div>

                            {/* Featured Packages Preview */}
                            {packages.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="font-serif text-xl font-bold text-[#24221E]">Top Packages</h2>
                                        <button onClick={() => setActiveTab('packages')} className="text-xs font-bold text-[#C99632] uppercase">
                                            View all {packages.length}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {packages.slice(0, 2).map((pkg) => (
                                            <div key={pkg.id} className="bg-white p-5 rounded-2xl border border-[#EFE7D8] shadow-xs">
                                                <h3 className="font-serif font-bold text-base text-[#24221E]">{pkg.name}</h3>
                                                <p className="text-sm font-bold text-[#C99632] mt-1">₱{Number(pkg.price).toLocaleString()}</p>
                                                <p className="text-xs text-[#77736C] mt-2 line-clamp-2">{pkg.description || pkg.inclusions}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar: Business & Contact Info */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-3xl border border-[#EFE7D8]">
                                <h3 className="font-serif font-bold text-base text-[#24221E] mb-4">Business Information</h3>
                                <dl className="space-y-3 text-xs">
                                    <div>
                                        <dt className="text-[#77736C]">Business Address</dt>
                                        <dd className="font-semibold text-[#24221E] mt-0.5">{profile.address}</dd>
                                    </div>
                                    {profile.contact_number && (
                                        <div>
                                            <dt className="text-[#77736C]">Contact Number</dt>
                                            <dd className="font-semibold text-[#24221E] mt-0.5">{profile.contact_number}</dd>
                                        </div>
                                    )}
                                    {profile.facebook_page && (
                                        <div>
                                            <dt className="text-[#77736C]">Facebook Page</dt>
                                            <dd className="mt-0.5">
                                                <a href={profile.facebook_page} target="_blank" rel="noreferrer" className="text-[#C99632] hover:underline font-semibold">
                                                    Visit Facebook
                                                </a>
                                            </dd>
                                        </div>
                                    )}
                                    <div>
                                        <dt className="text-[#77736C]">Categories</dt>
                                        <dd className="font-semibold text-[#24221E] mt-0.5">{profile.categories?.join(', ') || 'Event Services'}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 2: PACKAGES */}
                {activeTab === 'packages' && (
                    <div className="mb-16">
                        {packages.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {packages.map((pkg) => (
                                    <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden border border-[#EFE7D8] shadow-xs flex flex-col justify-between">
                                        <div className="p-6">
                                            {pkg.event_category && (
                                                <span className="px-3 py-1 rounded-full bg-[#EFE7D8] text-[#A87520] text-[10px] font-bold uppercase tracking-wider">
                                                    {pkg.event_category.name}
                                                </span>
                                            )}
                                            <h3 className="font-serif font-bold text-lg text-[#24221E] mt-3">{pkg.name}</h3>
                                            <p className="text-xl font-bold text-[#C99632] mt-2">₱{Number(pkg.price).toLocaleString()}</p>
                                            <p className="text-xs text-[#77736C] mt-3 leading-relaxed">{pkg.description}</p>
                                            {pkg.inclusions && (
                                                <div className="mt-4 pt-4 border-t border-[#EFE7D8]">
                                                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#24221E] mb-2">Inclusions</h4>
                                                    <p className="text-xs text-[#77736C] whitespace-pre-line">{pkg.inclusions}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6 pt-0">
                                            <Link
                                                href={route('packages.show', pkg.id)}
                                                className="block w-full text-center py-2.5 rounded-full bg-[#EFE7D8] hover:bg-[#C99632] hover:text-white text-xs font-bold text-[#24221E] uppercase tracking-wider transition-colors"
                                            >
                                                View Package
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-3xl border border-[#EFE7D8]">
                                <p className="text-sm text-[#77736C]">No packages published yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 3: SERVICES */}
                {activeTab === 'services' && (
                    <div className="mb-16">
                        {services.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {services.map((srv) => (
                                    <div key={srv.id} className="bg-white p-6 rounded-2xl border border-[#EFE7D8] shadow-xs">
                                        <h3 className="font-serif font-bold text-base text-[#24221E]">{srv.name}</h3>
                                        <p className="text-sm font-bold text-[#C99632] mt-1">₱{Number(srv.price).toLocaleString()}</p>
                                        <p className="text-xs text-[#77736C] mt-2 leading-relaxed">{srv.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-3xl border border-[#EFE7D8]">
                                <p className="text-sm text-[#77736C]">No individual services listed yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 4: PORTFOLIO */}
                {activeTab === 'portfolio' && (
                    <div className="mb-16">
                        {portfolios.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {portfolios.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedPortfolio(item)}
                                        className="bg-white rounded-2xl overflow-hidden border border-[#EFE7D8] shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer group"
                                    >
                                        <div className="relative h-56 w-full overflow-hidden bg-[#EFE7D8]">
                                            <img
                                                src={item.cover_image_url || (item.images && item.images[0]?.image_url) || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {item.event_category && (
                                                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#24221E]/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                                                    {item.event_category.name}
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-serif font-bold text-base text-[#24221E] group-hover:text-[#A87520] transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-xs text-[#77736C] mt-1 line-clamp-2">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-3xl border border-[#EFE7D8]">
                                <p className="text-sm text-[#77736C]">No portfolio items posted yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 5: REVIEWS */}
                {activeTab === 'reviews' && (
                    <div className="mb-16">
                        {reviews.length > 0 ? (
                            <div className="space-y-4">
                                {reviews.map((rev) => (
                                    <div key={rev.id} className="bg-white p-6 rounded-2xl border border-[#EFE7D8]">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-sm text-[#24221E]">{rev.customer?.name || 'Verified Client'}</h4>
                                            <div className="flex items-center text-[#C99632] text-xs">
                                                {'★'.repeat(rev.rating)}
                                            </div>
                                        </div>
                                        <p className="text-xs text-[#77736C] mt-2 leading-relaxed">{rev.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-3xl border border-[#EFE7D8]">
                                <p className="text-sm text-[#77736C]">No reviews posted yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Portfolio Viewer Modal */}
            {selectedPortfolio && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-[#EFE7D8]">
                            <h3 className="font-serif font-bold text-lg text-[#24221E]">{selectedPortfolio.title}</h3>
                            <button onClick={() => setSelectedPortfolio(null)} className="text-sm font-bold text-[#77736C] hover:text-[#24221E]">
                                ✕
                            </button>
                        </div>
                        <div className="mt-4">
                            <img
                                src={selectedPortfolio.cover_image_url || (selectedPortfolio.images && selectedPortfolio.images[0]?.image_url)}
                                alt={selectedPortfolio.title}
                                className="w-full h-72 object-cover rounded-2xl"
                            />
                            <p className="text-xs text-[#77736C] mt-4 leading-relaxed">{selectedPortfolio.description}</p>
                        </div>
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
