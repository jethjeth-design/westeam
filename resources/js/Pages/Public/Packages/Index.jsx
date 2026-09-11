import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function PackagesIndex({ packages, eventCategories = [], approvedSuppliers = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');
    const [supplierId, setSupplierId] = useState(filters.supplier_id || 'all');
    const [priceRange, setPriceRange] = useState(filters.price_range || 'all');
    const [selectedCategories, setSelectedCategories] = useState(filters.categories || []);
    const [selectedPackage, setSelectedPackage] = useState(null);

    const handleFilterSubmit = (e) => {
        if (e) e.preventDefault();
        router.get('/packages', {
            search: search || undefined,
            category: category !== 'all' ? category : undefined,
            supplier_id: supplierId !== 'all' ? supplierId : undefined,
            price_range: priceRange !== 'all' ? priceRange : undefined,
            categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const toggleCategoryCheckbox = (catId) => {
        let updated;
        if (selectedCategories.includes(catId)) {
            updated = selectedCategories.filter((id) => id !== catId);
        } else {
            updated = [...selectedCategories, catId];
        }
        setSelectedCategories(updated);
        router.get('/packages', {
            search: search || undefined,
            category: category !== 'all' ? category : undefined,
            supplier_id: supplierId !== 'all' ? supplierId : undefined,
            price_range: priceRange !== 'all' ? priceRange : undefined,
            categories: updated.length > 0 ? updated : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <PublicLayout title="Our Packages & Services">
            <Head>
                <meta name="description" content="Explore a wide range of packages from our trusted event and wedding suppliers." />
            </Head>

            {/* Header Title Section */}
            <div className="bg-[#F8F5EF] pt-12 pb-8 border-b border-[#EFE7D8]/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#24221E] tracking-tight">
                        Our Packages & Services
                    </h1>
                    <p className="mt-3 text-sm sm:text-base text-[#77736C] max-w-2xl mx-auto">
                        Explore a wide range of packages from our trusted suppliers.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Top Filter Bar (Matches Design Mockup 4) */}
                <form
                    onSubmit={handleFilterSubmit}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EFE7D8] shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-10 items-center"
                >
                    {/* Search Input */}
                    <div className="relative lg:col-span-1">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search package name..."
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F8F5EF] border border-[#EFE7D8] text-xs text-[#24221E] placeholder-[#77736C] focus:ring-2 focus:ring-[#C99632] outline-none"
                        />
                        <svg className="w-4 h-4 text-[#A87520] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* All Categories */}
                    <div>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full py-2.5 px-3 rounded-xl bg-[#F8F5EF] border border-[#EFE7D8] text-xs text-[#24221E] focus:ring-2 focus:ring-[#C99632] outline-none"
                        >
                            <option value="all">All Categories</option>
                            {eventCategories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* All Suppliers */}
                    <div>
                        <select
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                            className="w-full py-2.5 px-3 rounded-xl bg-[#F8F5EF] border border-[#EFE7D8] text-xs text-[#24221E] focus:ring-2 focus:ring-[#C99632] outline-none"
                        >
                            <option value="all">All Suppliers</option>
                            {approvedSuppliers.map((s) => (
                                <option key={s.user_id} value={s.user_id}>
                                    {s.business_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Price Range */}
                    <div>
                        <select
                            value={priceRange}
                            onChange={(e) => setPriceRange(e.target.value)}
                            className="w-full py-2.5 px-3 rounded-xl bg-[#F8F5EF] border border-[#EFE7D8] text-xs text-[#24221E] focus:ring-2 focus:ring-[#C99632] outline-none"
                        >
                            <option value="all">Price Range</option>
                            <option value="under_20k">Under ₱20,000</option>
                            <option value="20k_50k">₱20,000 - ₱50,000</option>
                            <option value="50k_100k">₱50,000 - ₱100,000</option>
                            <option value="over_100k">Above ₱100,000</option>
                        </select>
                    </div>

                    {/* Filter Button */}
                    <div>
                        <button
                            type="submit"
                            className="w-full py-2.5 rounded-xl bg-[#C99632] hover:bg-[#A87520] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                        >
                            Filter
                        </button>
                    </div>
                </form>

                {/* Main Content Layout (Sidebar + Packages Grid) */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar: Event Category Checkboxes */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl border border-[#EFE7D8] shadow-xs sticky top-28">
                            <h3 className="font-serif font-bold text-base text-[#24221E] pb-3 border-b border-[#EFE7D8] mb-4">
                                Event Category
                            </h3>
                            <div className="space-y-3">
                                {eventCategories.map((cat) => {
                                    const isChecked = selectedCategories.includes(cat.id);
                                    return (
                                        <label
                                            key={cat.id}
                                            className="flex items-center justify-between text-xs text-[#24221E] cursor-pointer hover:text-[#C99632] transition-colors py-0.5"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleCategoryCheckbox(cat.id)}
                                                    className="w-4 h-4 rounded text-[#C99632] focus:ring-[#C99632] border-[#DCC9A8]"
                                                />
                                                <span className={isChecked ? 'font-bold text-[#A87520]' : ''}>
                                                    {cat.name}
                                                </span>
                                            </div>
                                            {cat.packages_count > 0 && (
                                                <span className="text-[10px] text-[#77736C] bg-[#EFE7D8] px-2 py-0.5 rounded-full font-semibold">
                                                    {cat.packages_count}
                                                </span>
                                            )}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Packages Grid (3 columns matching design) */}
                    <div className="lg:col-span-3">
                        {packages.data && packages.data.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {packages.data.map((pkg) => (
                                    <div
                                        key={pkg.id}
                                        className="bg-white rounded-2xl overflow-hidden border border-[#EFE7D8] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                                    >
                                        {/* Image */}
                                        <div className="relative h-44 w-full overflow-hidden bg-[#EFE7D8]">
                                            <img
                                                src={pkg.image_url}
                                                alt={pkg.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {pkg.event_category && (
                                                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#24221E]/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                                                    {pkg.event_category.name}
                                                </span>
                                            )}
                                            <button
                                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#C99632] flex items-center justify-center transition-colors shadow-xs"
                                                title="Save package"
                                            >
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Body */}
                                        <div className="p-5 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-serif font-bold text-base text-[#24221E] line-clamp-1 group-hover:text-[#A87520] transition-colors">
                                                    {pkg.name}
                                                </h3>

                                                {/* Supplier Name */}
                                                <Link
                                                    href={`/suppliers/${pkg.supplier.id}`}
                                                    className="inline-block text-xs font-semibold text-[#77736C] hover:text-[#C99632] mt-1 transition-colors"
                                                >
                                                    👤 {pkg.supplier.business_name}
                                                </Link>

                                                {/* Rating & Reviews */}
                                                <div className="flex items-center gap-1.5 mt-2 text-xs">
                                                    <span className="text-[#C99632] font-bold">★</span>
                                                    <span className="font-bold text-[#24221E]">{pkg.rating}</span>
                                                    <span className="text-[#77736C]">({pkg.reviews_count} reviews)</span>
                                                </div>

                                                {/* Price */}
                                                <p className="font-serif font-bold text-lg text-[#24221E] mt-3">
                                                    {pkg.formatted_price}
                                                </p>
                                            </div>

                                            {/* Action Button */}
                                            <div className="mt-5 pt-4 border-t border-[#EFE7D8]">
                                                <button
                                                    onClick={() => setSelectedPackage(pkg)}
                                                    className="w-full text-center py-2.5 rounded-full border border-[#DCC9A8] hover:border-[#C99632] hover:bg-[#C99632] hover:text-white text-xs font-bold text-[#24221E] uppercase tracking-wider transition-all duration-200"
                                                >
                                                    View Package
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-3xl border border-[#EFE7D8] p-8">
                                <p className="text-sm text-[#77736C]">No packages found matching the selected criteria.</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {packages.links && packages.links.length > 3 && (
                            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EFE7D8] pt-6">
                                <p className="text-xs text-[#77736C]">
                                    Showing {packages.from || 0} - {packages.to || 0} of {packages.total} packages
                                </p>
                                <div className="flex items-center gap-1.5">
                                    {packages.links.map((link, i) => (
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
                </div>
            </div>

            {/* Package Details Modal */}
            {selectedPackage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-[#EFE7D8] shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="flex items-start justify-between pb-4 border-b border-[#EFE7D8]">
                            <div>
                                {selectedPackage.event_category && (
                                    <span className="px-3 py-1 rounded-full bg-[#EFE7D8] text-[#A87520] text-[10px] font-bold uppercase tracking-wider">
                                        {selectedPackage.event_category.name}
                                    </span>
                                )}
                                <h2 className="font-serif font-bold text-2xl text-[#24221E] mt-2">
                                    {selectedPackage.name}
                                </h2>
                                <p className="text-xs text-[#77736C] mt-1">
                                    Provided by <span className="font-semibold text-[#24221E]">{selectedPackage.supplier.business_name}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedPackage(null)}
                                className="p-2 text-[#77736C] hover:text-[#24221E] text-base font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Package Image & Price */}
                        <div className="mt-4 rounded-2xl overflow-hidden h-56 w-full bg-[#EFE7D8]">
                            <img
                                src={selectedPackage.image_url}
                                alt={selectedPackage.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex items-center justify-between mt-5 py-3 px-5 rounded-2xl bg-[#F8F5EF] border border-[#EFE7D8]">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#77736C]">Package Rate</span>
                                <p className="font-serif font-bold text-2xl text-[#C99632]">
                                    {selectedPackage.formatted_price}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#77736C]">Customer Rating</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-[#C99632] font-bold">★</span>
                                    <span className="font-bold text-sm text-[#24221E]">{selectedPackage.rating}</span>
                                    <span className="text-xs text-[#77736C]">({selectedPackage.reviews_count} reviews)</span>
                                </div>
                            </div>
                        </div>

                        {/* Description & Inclusions */}
                        <div className="mt-6 space-y-4 text-xs text-[#77736C]">
                            <div>
                                <h4 className="font-serif font-bold text-sm text-[#24221E] mb-2">Description</h4>
                                <p className="leading-relaxed whitespace-pre-line">{selectedPackage.description || 'Complete package service tailored to your exact specifications.'}</p>
                            </div>

                            {selectedPackage.inclusions && (
                                <div>
                                    <h4 className="font-serif font-bold text-sm text-[#24221E] mb-2">Package Inclusions</h4>
                                    <div className="p-4 rounded-2xl bg-[#F8F5EF] border border-[#EFE7D8] whitespace-pre-line leading-relaxed text-[#24221E]">
                                        {selectedPackage.inclusions}
                                    </div>
                                </div>
                            )}

                            {/* Supplier Quick Card */}
                            <div className="pt-4 border-t border-[#EFE7D8] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={selectedPackage.supplier.profile_picture_url}
                                        alt={selectedPackage.supplier.business_name}
                                        className="w-12 h-12 rounded-full object-cover border border-[#DCC9A8]"
                                    />
                                    <div>
                                        <p className="font-bold text-sm text-[#24221E]">{selectedPackage.supplier.business_name}</p>
                                        <p className="text-[11px] text-[#77736C]">{selectedPackage.supplier.address}</p>
                                    </div>
                                </div>
                                <Link
                                    href={`/suppliers/${selectedPackage.supplier.id}`}
                                    className="px-5 py-2.5 rounded-full bg-[#C99632] hover:bg-[#A87520] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                                >
                                    View Supplier
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
