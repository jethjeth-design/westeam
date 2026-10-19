import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

export default function Index({
    services = {},
    categories = [],
    approvedSuppliers = [],
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedSupplier, setSelectedSupplier] = useState(filters.supplier_id || 'all');
    const [selectedPriceRange, setSelectedPriceRange] = useState(filters.price_range || 'all');
    const [selectedSort, setSelectedSort] = useState(filters.sort || 'newest');
    const [searchTimeout, setSearchTimeout] = useState(null);

    const applyFilters = useCallback(
        (updatedParams) => {
            const params = {
                search,
                category: selectedCategory,
                supplier_id: selectedSupplier,
                price_range: selectedPriceRange,
                sort: selectedSort,
                ...updatedParams,
            };

            // Remove default 'all' or empty strings
            Object.keys(params).forEach((key) => {
                if (params[key] === 'all' || params[key] === '') {
                    delete params[key];
                }
            });

            router.get(route('customer.services.index'), params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [search, selectedCategory, selectedSupplier, selectedPriceRange, selectedSort]
    );

    const handleSearchChange = (value) => {
        setSearch(value);
        if (searchTimeout) clearTimeout(searchTimeout);

        const timeout = setTimeout(() => {
            applyFilters({ search: value });
        }, 400);

        setSearchTimeout(timeout);
    };

    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
        applyFilters({ category: value });
    };

    const handleSupplierChange = (value) => {
        setSelectedSupplier(value);
        applyFilters({ supplier_id: value });
    };

    const handlePriceChange = (value) => {
        setSelectedPriceRange(value);
        applyFilters({ price_range: value });
    };

    const handleSortChange = (value) => {
        setSelectedSort(value);
        applyFilters({ sort: value });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedCategory('all');
        setSelectedSupplier('all');
        setSelectedPriceRange('all');
        setSelectedSort('newest');
        router.get(route('customer.services.index'), {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const serviceList = services?.data || [];
    const paginationLinks = services?.links || [];

    const getProfilePicture = (profile) => {
        const picture = profile?.profile_picture;
        if (!picture) return null;
        if (picture.startsWith('http://') || picture.startsWith('https://') || picture.startsWith('/')) {
            return picture;
        }
        return `/storage/${picture}`;
    };

    return (
        <DashboardLayout>
            <Head title="Browse Event Services - Westeam" />

            <div className="min-h-screen bg-[#F8F5EF] p-4 sm:p-6 lg:p-8 text-[#24221E]">
                {/* Hero Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-[#EFE7D8] px-2.5 py-1 text-xs font-bold text-[#A87520]">
                                🛠️ Available Services
                            </span>
                            <span className="text-xs text-[#77736C]">• Verified Event & Wedding Pros</span>
                        </div>
                        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#24221E] font-serif">
                            Browse Event & Wedding Services
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-[#77736C] max-w-2xl leading-relaxed">
                            Discover tailored services from approved suppliers—from photography and videography to catering, hair & makeup, styling, and coordination.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('customer.packages.index')}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DCC9A8] bg-white text-[#24221E] text-xs font-bold shadow-2xs hover:bg-[#EFE7D8] transition"
                        >
                            <span>📦</span>
                            <span>View Packages</span>
                        </Link>
                        <Link
                            href={route('customer.bookings.create')}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C99632] to-[#A87520] text-white text-xs font-bold shadow-xs hover:shadow-md transition"
                        >
                            <span>✨</span>
                            <span>Book an Event</span>
                        </Link>
                    </div>
                </div>

                {/* Search & Filters Card */}
                <div className="mt-8 rounded-3xl border border-[#EFE7D8] bg-white p-4 sm:p-5 shadow-xs space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Search Input */}
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#77736C]">
                                🔍
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Search by service or vendor..."
                                className="w-full rounded-xl border border-[#DCC9A8] bg-[#F8F5EF]/60 py-2.5 pl-10 pr-8 text-xs text-[#24221E] outline-none transition focus:border-[#C99632] focus:bg-white focus:ring-2 focus:ring-[#C99632]/20"
                            />
                            {search && (
                                <button
                                    onClick={() => handleSearchChange('')}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-[#77736C] hover:text-[#24221E]"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="rounded-xl border border-[#DCC9A8] bg-[#F8F5EF]/60 px-3.5 py-2.5 text-xs text-[#24221E] outline-none transition focus:border-[#C99632] focus:bg-white focus:ring-2 focus:ring-[#C99632]/20"
                        >
                            <option value="all">All Service Categories</option>
                            {categories.map((cat, idx) => (
                                <option key={idx} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>

                        {/* Supplier Filter */}
                        <select
                            value={selectedSupplier}
                            onChange={(e) => handleSupplierChange(e.target.value)}
                            className="rounded-xl border border-[#DCC9A8] bg-[#F8F5EF]/60 px-3.5 py-2.5 text-xs text-[#24221E] outline-none transition focus:border-[#C99632] focus:bg-white focus:ring-2 focus:ring-[#C99632]/20"
                        >
                            <option value="all">All Approved Suppliers</option>
                            {approvedSuppliers.map((sup) => (
                                <option key={sup.user_id} value={sup.user_id}>
                                    {sup.business_name}
                                </option>
                            ))}
                        </select>

                        {/* Price Range Filter */}
                        <select
                            value={selectedPriceRange}
                            onChange={(e) => handlePriceChange(e.target.value)}
                            className="rounded-xl border border-[#DCC9A8] bg-[#F8F5EF]/60 px-3.5 py-2.5 text-xs text-[#24221E] outline-none transition focus:border-[#C99632] focus:bg-white focus:ring-2 focus:ring-[#C99632]/20"
                        >
                            <option value="all">Any Price Range</option>
                            <option value="under_5k">Under ₱5,000</option>
                            <option value="5k_15k">₱5,000 - ₱15,000</option>
                            <option value="15k_30k">₱15,000 - ₱30,000</option>
                            <option value="over_30k">Over ₱30,000</option>
                        </select>
                    </div>

                    {/* Secondary Row: Active Filter Counters & Sort */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EFE7D8]/70">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#A87520] bg-[#EFE7D8] px-3 py-1 rounded-xl">
                                {services?.total || 0} Services Found
                            </span>

                            {(search || selectedCategory !== 'all' || selectedSupplier !== 'all' || selectedPriceRange !== 'all') && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1 rounded-xl cursor-pointer"
                                >
                                    Reset Filters ✕
                                </button>
                            )}
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-[#77736C]">Sort By:</span>
                            <select
                                value={selectedSort}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="rounded-xl border border-[#DCC9A8] bg-white px-3 py-1.5 text-xs text-[#24221E] outline-none focus:border-[#C99632]"
                            >
                                <option value="newest">Newest Added</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="name_asc">Service Name (A-Z)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Services Grid */}
                {serviceList.length > 0 ? (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {serviceList.map((service) => {
                            const supplier = service.supplier;
                            const profile = supplier?.supplier_profile || supplier?.supplierProfile;
                            const businessName = profile?.business_name || supplier?.name || 'Verified Supplier';
                            const picture = getProfilePicture(profile);

                            return (
                                <div
                                    key={service.id}
                                    className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[#EFE7D8] bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:border-[#C99632] hover:shadow-lg p-6"
                                >
                                    <div>
                                        {/* Category & Price Row */}
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="inline-flex items-center rounded-lg bg-[#EFE7D8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#A87520]">
                                                {service.category || 'General Service'}
                                            </span>

                                            <div className="text-right">
                                                <span className="text-lg font-black text-[#A87520]">
                                                    ₱{Number(service.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Service Title */}
                                        <Link
                                            href={route('customer.services.show', service.id)}
                                            className="mt-3 block text-base font-extrabold text-[#24221E] hover:text-[#A87520] transition-colors leading-snug"
                                        >
                                            {service.name}
                                        </Link>

                                        {/* Description */}
                                        {service.description && (
                                            <p className="mt-2 text-xs leading-relaxed text-[#77736C] line-clamp-3">
                                                {service.description}
                                            </p>
                                        )}

                                        {/* Supplier Details Cardlet */}
                                        <div className="mt-5 flex items-center gap-3 p-3 rounded-2xl bg-[#F8F5EF] border border-[#EFE7D8]/80">
                                            <Link
                                                href={route('customer.suppliers.portfolio', service.supplier_id)}
                                                className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white bg-gradient-to-tr from-[#C99632] to-[#A87520] text-white flex items-center justify-center font-bold text-xs shadow-2xs hover:scale-105 transition-transform"
                                                title={`View ${businessName}'s Portfolio`}
                                            >
                                                {picture ? (
                                                    <img src={picture} alt={businessName} className="h-full w-full object-cover" />
                                                ) : (
                                                    businessName.charAt(0).toUpperCase()
                                                )}
                                            </Link>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Link
                                                        href={route('customer.suppliers.portfolio', service.supplier_id)}
                                                        className="text-xs font-bold text-[#24221E] hover:text-[#C99632] truncate transition-colors"
                                                    >
                                                        {businessName}
                                                    </Link>
                                                    <span className="text-[10px] text-emerald-600 font-bold shrink-0">✓</span>
                                                </div>

                                                {profile?.address ? (
                                                    <p className="text-[10px] text-[#77736C] truncate mt-0.5">
                                                        📍 {profile.address}
                                                    </p>
                                                ) : (
                                                    <p className="text-[10px] text-[#77736C] truncate mt-0.5">
                                                        Verified Event Supplier
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="mt-6 pt-4 border-t border-[#EFE7D8] flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <Link
                                                href={route('customer.services.show', service.id)}
                                                className="rounded-xl border border-[#DCC9A8] bg-white px-3.5 py-2 text-xs font-bold text-[#24221E] hover:bg-[#EFE7D8] hover:text-[#A87520] transition"
                                            >
                                                View Service
                                            </Link>
                                            <Link
                                                href={route('customer.suppliers.portfolio', service.supplier_id)}
                                                className="hidden sm:inline-block rounded-xl border border-[#EFE7D8] bg-[#F8F5EF] px-2.5 py-2 text-[11px] font-semibold text-[#77736C] hover:bg-[#EFE7D8] hover:text-[#24221E] transition"
                                                title={`View ${businessName}'s Portfolio`}
                                            >
                                                Portfolio
                                            </Link>
                                        </div>

                                        <Link
                                            href={route('customer.bookings.create', { service_id: service.id })}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C99632] to-[#A87520] px-4 py-2 text-xs font-bold text-white shadow-xs hover:shadow-md transition transform active:scale-95"
                                        >
                                            <span>Book Now</span>
                                            <span>→</span>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="mt-10 rounded-3xl border-2 border-dashed border-[#DCC9A8] bg-white p-12 text-center shadow-xs">
                        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-[#EFE7D8] text-3xl">
                            🛠️
                        </div>
                        <h3 className="mt-4 text-base font-bold text-[#24221E]">No services match your filters</h3>
                        <p className="mt-1 text-xs text-[#77736C] max-w-md mx-auto">
                            Try adjusting your search criteria, category selection, or price range to explore more available vendor services.
                        </p>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#C99632] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#A87520] transition"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {paginationLinks.length > 3 && (
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
                        {paginationLinks.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                preserveScroll
                                preserveState
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                                    link.active
                                        ? 'bg-[#C99632] text-white shadow-xs'
                                        : link.url
                                        ? 'bg-white text-[#24221E] border border-[#EFE7D8] hover:bg-[#EFE7D8]'
                                        : 'bg-white/50 text-[#77736C]/50 border border-transparent cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
