import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function GalleryIndex({ portfolios, pills = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [activePortfolioModal, setActivePortfolioModal] = useState(null);
    const [modalPhotoIndex, setModalPhotoIndex] = useState(0);

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        router.get('/gallery', {
            search: search || undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePillClick = (catName) => {
        setSelectedCategory(catName);
        router.get('/gallery', {
            search: search || undefined,
            category: catName !== 'all' ? catName : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const openPortfolioModal = (item) => {
        setActivePortfolioModal(item);
        setModalPhotoIndex(0);
    };

    return (
        <PublicLayout title="Our Gallery">
            <Head>
                <meta name="description" content="Explore beautiful moments captured by our talented event and wedding suppliers." />
            </Head>

            {/* Header Title Section */}
            <div className="bg-[#F8F5EF] pt-12 pb-8 border-b border-[#EFE7D8]/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#24221E] tracking-tight">
                        Our Gallery
                    </h1>
                    <p className="mt-3 text-sm sm:text-base text-[#77736C] max-w-2xl mx-auto">
                        Explore beautiful moments captured by our talented suppliers.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                {/* Search & Categories Dropdown Filter Card */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EFE7D8] shadow-xs mb-6">
                    <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        {/* Search Gallery Input */}
                        <div className="relative sm:col-span-6 lg:col-span-7">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search gallery by title, supplier, or location..."
                                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#F8F5EF] border border-[#EFE7D8] text-xs sm:text-sm text-[#24221E] placeholder-[#77736C] focus:ring-2 focus:ring-[#C99632] outline-none transition-all"
                            />
                            <svg className="w-4 h-4 text-[#A87520] absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        router.get('/gallery', {
                                            search: undefined,
                                            category: selectedCategory !== 'all' ? selectedCategory : undefined,
                                        }, { preserveState: true, replace: true });
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77736C] hover:text-[#24221E]"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Categories Dropdown */}
                        <div className="sm:col-span-4 lg:col-span-3 relative">
                            <select
                                value={selectedCategory}
                                onChange={(e) => handlePillClick(e.target.value)}
                                className="w-full appearance-none py-2.5 pl-3.5 pr-9 rounded-xl bg-[#F8F5EF] border border-[#EFE7D8] text-xs sm:text-sm text-[#24221E] font-medium focus:ring-2 focus:ring-[#C99632] focus:border-transparent outline-none cursor-pointer transition-all"
                            >
                                <option value="all">All Categories</option>
                                {pills.filter((p) => p !== 'All').map((pill, idx) => (
                                    <option key={idx} value={pill}>
                                        {pill}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#77736C]">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="sm:col-span-2 lg:col-span-2 flex items-center gap-2">
                            <button
                                type="submit"
                                className="w-full py-2.5 rounded-xl bg-[#C99632] hover:bg-[#A87520] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                            >
                                Search
                            </button>
                            {(search || (selectedCategory && selectedCategory !== 'all')) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        setSelectedCategory('all');
                                        router.get('/gallery', {}, { preserveState: true, replace: true });
                                    }}
                                    className="px-3 py-2.5 rounded-xl border border-[#DCC9A8] hover:border-[#C99632] bg-[#F8F5EF] text-[#24221E] text-xs font-bold uppercase tracking-wider transition-colors"
                                    title="Reset filters"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Gallery Portfolio Cards Grid (3 Columns matching design image) */}
                {portfolios.data && portfolios.data.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {portfolios.data.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => openPortfolioModal(item)}
                                className="bg-white rounded-2xl overflow-hidden border border-[#EFE7D8] shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col group transform hover:-translate-y-1"
                            >
                                {/* Cover Photo Container */}
                                <div className="relative h-56 w-full overflow-hidden bg-[#EFE7D8]">
                                    <img
                                        src={item.cover_image_url}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {/* Photo Count Badge */}
                                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#24221E]/80 backdrop-blur-xs text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-xs">
                                        <svg className="w-3.5 h-3.5 text-[#C99632]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>{item.images_count}</span>
                                    </div>
                                </div>

                                {/* Content Details */}
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-serif font-bold text-lg text-[#24221E] group-hover:text-[#A87520] transition-colors line-clamp-1">
                                            {item.title}
                                        </h3>

                                        {/* Artist / Supplier Business Name Clearly Displayed */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-5 h-5 rounded-full overflow-hidden border border-[#DCC9A8] shrink-0">
                                                <img
                                                    src={item.supplier.profile_picture_url}
                                                    alt={item.supplier.business_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-[#24221E] group-hover:text-[#C99632] transition-colors line-clamp-1">
                                                {item.supplier.business_name}
                                            </span>
                                        </div>

                                        {/* Event Category Badge */}
                                        {item.event_category && (
                                            <div className="mt-3 flex items-center gap-1 text-xs text-[#77736C]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#C99632]" />
                                                <span>{item.event_category.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-3xl border border-[#EFE7D8] p-8">
                        <p className="text-sm text-[#77736C]">No gallery portfolios found for this filter.</p>
                    </div>
                )}

                {/* Pagination */}
                {portfolios.links && portfolios.links.length > 3 && (
                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EFE7D8] pt-6">
                        <p className="text-xs text-[#77736C]">
                            Showing {portfolios.from || 0} - {portfolios.to || 0} of {portfolios.total} portfolios
                        </p>
                        <div className="flex items-center gap-1.5">
                            {portfolios.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    preserveScroll
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${link.active
                                        ? 'bg-[#C99632] text-white'
                                        : !link.url
                                            ? 'text-gray-300 pointer-events-none'
                                            : 'bg-white text-[#24221E] border border-[#EFE7D8] hover:bg-[#EFE7D8]'
                                        }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Complete Portfolio Viewer Modal */}
            {activePortfolioModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-[#EFE7D8] animate-in fade-in zoom-in-95">
                        {/* Header */}
                        <div className="p-6 border-b border-[#EFE7D8] flex items-center justify-between">
                            <div>
                                <h2 className="font-serif font-bold text-2xl text-[#24221E]">
                                    {activePortfolioModal.title}
                                </h2>
                                <p className="text-xs text-[#77736C] mt-1">
                                    By <span className="font-bold text-[#24221E]">{activePortfolioModal.supplier.business_name}</span>
                                    {activePortfolioModal.event_date && ` • ${activePortfolioModal.event_date}`}
                                </p>
                            </div>
                            <button
                                onClick={() => setActivePortfolioModal(null)}
                                className="p-2 text-[#77736C] hover:text-[#24221E] font-bold text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Main Active Photo */}
                            <div className="relative rounded-2xl overflow-hidden h-80 sm:h-[420px] bg-black">
                                <img
                                    src={
                                        activePortfolioModal.images[modalPhotoIndex]?.image_url ||
                                        activePortfolioModal.cover_image_url
                                    }
                                    alt={activePortfolioModal.title}
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            {/* Thumbnails row */}
                            {activePortfolioModal.images.length > 1 && (
                                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                                    {activePortfolioModal.images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setModalPhotoIndex(i)}
                                            className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${i === modalPhotoIndex ? 'border-[#C99632] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                                                }`}
                                        >
                                            <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Description */}
                            {activePortfolioModal.description && (
                                <div className="p-5 rounded-2xl bg-[#F8F5EF] border border-[#EFE7D8]">
                                    <h4 className="font-serif font-bold text-sm text-[#24221E] mb-2">Portfolio Overview</h4>
                                    <p className="text-xs text-[#77736C] leading-relaxed whitespace-pre-line">
                                        {activePortfolioModal.description}
                                    </p>
                                </div>
                            )}

                            {/* Supplier Quick Card */}
                            <div className="pt-4 border-t border-[#EFE7D8] flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={activePortfolioModal.supplier.profile_picture_url}
                                        alt={activePortfolioModal.supplier.business_name}
                                        className="w-12 h-12 rounded-full object-cover border border-[#DCC9A8]"
                                    />
                                    <div>
                                        <h4 className="font-bold text-sm text-[#24221E]">{activePortfolioModal.supplier.business_name}</h4>
                                        <p className="text-xs text-[#77736C]">{activePortfolioModal.supplier.address || 'Verified Supplier'}</p>
                                    </div>
                                </div>
                                <Link
                                    href={`/suppliers/${activePortfolioModal.supplier.id}`}
                                    className="px-6 py-2.5 rounded-full bg-[#C99632] hover:bg-[#A87520] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                                >
                                    View Full Profile
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
