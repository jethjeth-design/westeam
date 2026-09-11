import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function SuppliersIndex({ suppliers, categories = [], locations = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedLocation, setSelectedLocation] = useState(filters.location || 'all');

    // Filter pills
    const pillCategories = ['all', ...categories.slice(0, 6).map((c) => c.name), 'Others'];

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get('/suppliers', {
            search: search || undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            location: selectedLocation !== 'all' ? selectedLocation : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePillClick = (catName) => {
        setSelectedCategory(catName);
        router.get('/suppliers', {
            search: search || undefined,
            category: catName !== 'all' ? catName : undefined,
            location: selectedLocation !== 'all' ? selectedLocation : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <PublicLayout title="Our Trusted Suppliers">
            <Head>
                <meta name="description" content="Discover talented and reliable event suppliers for your special moments." />
            </Head>

            {/* Header Title Section */}
            <div className="bg-[#F8F5EF] pt-12 pb-8 border-b border-[#EFE7D8]/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#24221E] tracking-tight">
                        Our Trusted Suppliers
                    </h1>
                    <p className="mt-3 text-sm sm:text-base text-[#77736C] max-w-2xl mx-auto">
                        Discover talented and reliable suppliers for your special moments.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Search & Dropdown Filter Bar */}
                <form
                    onSubmit={handleSearch}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EFE7D8] shadow-xs flex flex-col md:flex-row items-center gap-3 mb-8"
                >
                    {/* Search Input */}
                    <div className="relative flex-1 w-full">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search supplier name..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F5EF] border border-[#EFE7D8] text-sm text-[#24221E] placeholder-[#77736C] focus:ring-2 focus:ring-[#C99632] focus:border-transparent outline-none"
                        />
                        <svg
                            className="w-4 h-4 text-[#A87520] absolute left-3.5 top-1/2 -translate-y-1/2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* All Categories Dropdown */}
                    <div className="w-full md:w-52">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full py-2.5 px-3 rounded-xl bg-[#F8F5EF] border border-[#EFE7D8] text-sm text-[#24221E] focus:ring-2 focus:ring-[#C99632] focus:border-transparent outline-none"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* All Locations Dropdown */}
                    <div className="w-full md:w-52">
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="w-full py-2.5 px-3 rounded-xl bg-[#F8F5EF] border border-[#EFE7D8] text-sm text-[#24221E] focus:ring-2 focus:ring-[#C99632] focus:border-transparent outline-none"
                        >
                            <option value="all">All Locations</option>
                            {locations.map((loc, idx) => (
                                <option key={idx} value={loc}>
                                    {loc}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Search Submit Button */}
                    <button
                        type="submit"
                        className="w-full md:w-auto px-8 py-2.5 rounded-xl bg-[#C99632] hover:bg-[#A87520] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                    >
                        Search
                    </button>
                </form>

                {/* Category Pill Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
                    {pillCategories.map((catName, idx) => {
                        const isSelected =
                            selectedCategory.toLowerCase() === catName.toLowerCase() ||
                            (catName === 'all' && (!selectedCategory || selectedCategory === 'all'));

                        return (
                            <button
                                key={idx}
                                onClick={() => handlePillClick(catName)}
                                className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider capitalize whitespace-nowrap transition-all duration-200 border ${
                                    isSelected
                                        ? 'bg-[#C99632] text-white border-[#C99632] shadow-xs'
                                        : 'bg-white text-[#77736C] border-[#EFE7D8] hover:border-[#C99632] hover:text-[#24221E]'
                                }`}
                            >
                                {catName}
                            </button>
                        );
                    })}
                </div>

                {/* Suppliers Cards Grid (4 Columns as in design) */}
                {suppliers.data && suppliers.data.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {suppliers.data.map((supplier) => (
                            <div
                                key={supplier.id}
                                className="bg-white rounded-2xl overflow-hidden border border-[#EFE7D8] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group"
                            >
                                {/* Card Photo */}
                                <div className="relative h-48 w-full overflow-hidden bg-[#EFE7D8]">
                                    <img
                                        src={supplier.cover_photo_url || supplier.profile_picture_url}
                                        alt={supplier.business_name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#24221E]/80 backdrop-blur-xs text-white text-[10px] font-bold tracking-wider uppercase">
                                        {supplier.category}
                                    </span>
                                    <button
                                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#C99632] flex items-center justify-center transition-colors shadow-xs"
                                        title="Save to favorites"
                                    >
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Content Details */}
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
                                            <span className="text-[#C99632] font-bold">★</span>
                                            <span className="font-bold text-[#24221E]">{supplier.rating}</span>
                                            <span className="text-[#77736C]">({supplier.reviews_count} reviews)</span>
                                        </div>

                                        {/* Location */}
                                        <p className="text-xs text-[#77736C] mt-2 flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5 text-[#C99632]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="line-clamp-1">{supplier.address}</span>
                                        </p>
                                    </div>

                                    {/* View Profile Action */}
                                    <div className="mt-5 pt-4 border-t border-[#EFE7D8]">
                                        <Link
                                            href={`/suppliers/${supplier.user_id}`}
                                            className="block w-full text-center py-2.5 rounded-full border border-[#DCC9A8] hover:border-[#C99632] hover:bg-[#C99632] hover:text-white text-xs font-bold text-[#24221E] uppercase tracking-wider transition-all duration-200"
                                        >
                                            View Profile
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-3xl border border-[#EFE7D8] p-8">
                        <div className="w-16 h-16 rounded-full bg-[#EFE7D8] text-[#C99632] flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="font-serif font-bold text-lg text-[#24221E]">No suppliers found</h3>
                        <p className="text-xs text-[#77736C] mt-1 max-w-sm mx-auto">
                            Try adjusting your search criteria, category, or location filter.
                        </p>
                    </div>
                )}

                {/* Pagination Controls */}
                {suppliers.links && suppliers.links.length > 3 && (
                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EFE7D8] pt-6">
                        <p className="text-xs text-[#77736C]">
                            Showing {suppliers.from || 0} - {suppliers.to || 0} of {suppliers.total} suppliers
                        </p>
                        <div className="flex items-center gap-1.5">
                            {suppliers.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    preserveScroll
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                                        link.active
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
        </PublicLayout>
    );
}
