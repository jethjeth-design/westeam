import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

export default function Index({
    packages = {},
    eventCategories = [],
    approvedSuppliers = [],
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedType, setSelectedType] = useState(filters.package_type || 'all'); // 'all' | 'individual' | 'team'
    const [selectedSupplier, setSelectedSupplier] = useState(filters.supplier_id || 'all');
    const [selectedPriceRange, setSelectedPriceRange] = useState(filters.price_range || 'all');
    const [selectedSort, setSelectedSort] = useState(filters.sort || 'featured');
    const [searchTimeout, setSearchTimeout] = useState(null);

    const applyFilters = useCallback(
        (updatedParams) => {
            const params = {
                search,
                category: selectedCategory,
                package_type: selectedType,
                supplier_id: selectedSupplier,
                price_range: selectedPriceRange,
                sort: selectedSort,
                ...updatedParams,
            };

            Object.keys(params).forEach((key) => {
                if (params[key] === 'all' || params[key] === '') {
                    delete params[key];
                }
            });

            router.get(route('customer.packages.index'), params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [search, selectedCategory, selectedType, selectedSupplier, selectedPriceRange, selectedSort]
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

    const handleTypeChange = (value) => {
        setSelectedType(value);
        applyFilters({ package_type: value });
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
        setSelectedType('all');
        setSelectedSupplier('all');
        setSelectedPriceRange('all');
        setSelectedSort('featured');
        router.get(route('customer.packages.index'), {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const packageList = packages?.data || [];
    const paginationLinks = packages?.links || [];

    const getPackageImage = (pkg) => {
        if (!pkg.image_path) {
            return 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
        }
        if (pkg.image_path.startsWith('http://') || pkg.image_path.startsWith('https://') || pkg.image_path.startsWith('/')) {
            return pkg.image_path;
        }
        return `/storage/${pkg.image_path}`;
    };

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
            <Head title="Browse Event & Team Packages - Westeam" />

            <div className="min-h-screen bg-[#F8F5EF] p-4 sm:p-6 lg:p-8 text-[#24221E]">
                {/* Hero Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-[#EFE7D8] px-2.5 py-1 text-xs font-bold text-[#A87520]">
                                📦 Curated Packages
                            </span>
                            <span className="text-xs text-[#77736C]">• Individual & Collaborative Team Packages</span>
                        </div>
                        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#24221E] font-serif">
                            Browse Event & Wedding Packages
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-[#77736C] max-w-2xl leading-relaxed">
                            Complete turnkey event packages combining styling, photography, catering, and planning from top suppliers and multi-vendor teams.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('customer.services.index')}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DCC9A8] bg-white text-[#24221E] text-xs font-bold shadow-2xs hover:bg-[#EFE7D8] transition"
                        >
                            <span>🛠️</span>
                            <span>View Services</span>
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

                {/* Filter and Search Bar Card */}
                <div className="mt-8 rounded-3xl border border-[#EFE7D8] bg-white p-4 sm:p-5 shadow-xs space-y-4">
                    {/* Top Segment: Package Type Switcher */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#77736C] mr-2 shrink-0">
                            Package Type:
                        </span>
                        <button
                            type="button"
                            onClick={() => handleTypeChange('all')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                                selectedType === 'all'
                                    ? 'bg-[#C99632] text-white shadow-2xs'
                                    : 'bg-[#F8F5EF] text-[#24221E] hover:bg-[#EFE7D8]'
                            }`}
                        >
                            All Packages
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTypeChange('individual')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                                selectedType === 'individual'
                                    ? 'bg-[#C99632] text-white shadow-2xs'
                                    : 'bg-[#F8F5EF] text-[#24221E] hover:bg-[#EFE7D8]'
                            }`}
                        >
                            Individual Vendor Packages
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTypeChange('team')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                selectedType === 'team'
                                    ? 'bg-[#C99632] text-white shadow-2xs'
                                    : 'bg-[#F8F5EF] text-[#24221E] hover:bg-[#EFE7D8]'
                            }`}
                        >
                            <span>👥</span>
                            <span>Team Packages</span>
                        </button>
                    </div>

                    {/* Filter Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                        {/* Search Input */}
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#77736C]">
                                🔍
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Search packages, team, inclusions..."
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

                        {/* Event Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="rounded-xl border border-[#DCC9A8] bg-[#F8F5EF]/60 px-3.5 py-2.5 text-xs text-[#24221E] outline-none transition focus:border-[#C99632] focus:bg-white focus:ring-2 focus:ring-[#C99632]/20"
                        >
                            <option value="all">All Event Categories</option>
                            {eventCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>

                        {/* Supplier Filter */}
                        <select
                            value={selectedSupplier}
                            onChange={(e) => handleSupplierChange(e.target.value)}
                            className="rounded-xl border border-[#DCC9A8] bg-[#F8F5EF]/60 px-3.5 py-2.5 text-xs text-[#24221E] outline-none transition focus:border-[#C99632] focus:bg-white focus:ring-2 focus:ring-[#C99632]/20"
                        >
                            <option value="all">All Suppliers & Coordinators</option>
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
                            <option value="under_20k">Under ₱20,000</option>
                            <option value="20k_50k">₱20,000 - ₱50,000</option>
                            <option value="50k_100k">₱50,000 - ₱100,000</option>
                            <option value="over_100k">Over ₱100,000</option>
                        </select>
                    </div>

                    {/* Secondary Row: Result counts and sort */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EFE7D8]/70">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#A87520] bg-[#EFE7D8] px-3 py-1 rounded-xl">
                                {packages?.total || 0} Packages Available
                            </span>

                            {(search || selectedCategory !== 'all' || selectedType !== 'all' || selectedSupplier !== 'all' || selectedPriceRange !== 'all') && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1 rounded-xl cursor-pointer"
                                >
                                    Reset Filters ✕
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-[#77736C]">Sort By:</span>
                            <select
                                value={selectedSort}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="rounded-xl border border-[#DCC9A8] bg-white px-3 py-1.5 text-xs text-[#24221E] outline-none focus:border-[#C99632]"
                            >
                                <option value="featured">Featured / Top Packages</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="newest">Newest First</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Packages Grid */}
                {packageList.length > 0 ? (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {packageList.map((pkg) => {
                            const isTeam = Boolean(pkg.team_id && pkg.team);
                            const supplier = pkg.supplier || pkg.team?.coordinator;
                            const profile = supplier?.supplier_profile || supplier?.supplierProfile;
                            const businessName = isTeam
                                ? `${pkg.team.name} (Team Package)`
                                : profile?.business_name || supplier?.name || 'Verified Supplier';
                            const coordinatorName = profile?.business_name || supplier?.name;
                            const picture = getProfilePicture(profile);
                            const imageUrl = getPackageImage(pkg);
                            const acceptedMembers = pkg.team?.accepted_members || pkg.team?.acceptedMembers || [];
                            const servicesIncluded = pkg.services || [];

                            return (
                                <div
                                    key={pkg.id}
                                    className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[#EFE7D8] bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:border-[#C99632] hover:shadow-lg"
                                >
                                    <div>
                                        {/* Package Cover Image Banner */}
                                        <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                                            <img
                                                src={imageUrl}
                                                alt={pkg.name}
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                            {/* Top Floating Badges */}
                                            <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
                                                {isTeam ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-600/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold text-white shadow-xs">
                                                        <span>👥</span>
                                                        <span>Team Package</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-emerald-600/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold text-white shadow-xs">
                                                        ✓ Individual Package
                                                    </span>
                                                )}

                                                {pkg.is_top_package && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold text-white shadow-xs">
                                                        ⭐ Top Rated
                                                    </span>
                                                )}
                                            </div>

                                            {/* Bottom Overlay Price & Category */}
                                            <div className="absolute bottom-3 inset-x-4 flex items-end justify-between">
                                                <span className="rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
                                                    {pkg.event_category?.name || 'All Events'}
                                                </span>
                                                <span className="text-xl font-black text-white drop-shadow-md">
                                                    ₱{Number(pkg.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Package Body */}
                                        <div className="p-5">
                                            <h3 className="text-base font-extrabold text-[#24221E] group-hover:text-[#A87520] transition-colors leading-snug">
                                                {pkg.name}
                                            </h3>

                                            {pkg.description && (
                                                <p className="mt-2 text-xs text-[#77736C] line-clamp-2 leading-relaxed">
                                                    {pkg.description}
                                                </p>
                                            )}

                                            {/* Services Included Chips */}
                                            {servicesIncluded.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-1">
                                                    {servicesIncluded.slice(0, 4).map((s) => (
                                                        <span
                                                            key={s.id}
                                                            className="rounded-lg bg-[#EFE7D8]/80 px-2 py-0.5 text-[10px] font-semibold text-[#A87520]"
                                                        >
                                                            {s.name}
                                                        </span>
                                                    ))}
                                                    {servicesIncluded.length > 4 && (
                                                        <span className="rounded-lg bg-[#EFE7D8]/50 px-1.5 py-0.5 text-[10px] text-[#77736C]">
                                                            +{servicesIncluded.length - 4} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Inclusions summary */}
                                            {pkg.inclusions && (
                                                <div className="mt-3.5 p-3 rounded-2xl bg-[#F8F5EF] border border-[#EFE7D8]">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#77736C]">Key Inclusions:</p>
                                                    <p className="text-xs text-[#24221E] mt-0.5 line-clamp-2 leading-relaxed">
                                                        {pkg.inclusions}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Supplier / Team Info */}
                                            <div className="mt-4 flex items-center gap-3 pt-3 border-t border-[#EFE7D8]">
                                                <Link
                                                    href={route('customer.suppliers.portfolio', supplier?.id || 1)}
                                                    className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white bg-gradient-to-tr from-[#C99632] to-[#A87520] text-white flex items-center justify-center font-bold text-xs shadow-2xs hover:scale-105 transition-transform"
                                                    title="View Profile"
                                                >
                                                    {picture ? (
                                                        <img src={picture} alt={businessName} className="h-full w-full object-cover" />
                                                    ) : (
                                                        coordinatorName?.charAt(0)?.toUpperCase() || 'S'
                                                    )}
                                                </Link>

                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-bold text-[#24221E] truncate">
                                                        {isTeam ? pkg.team.name : businessName}
                                                    </p>
                                                    <p className="text-[10px] text-[#77736C] truncate">
                                                        {isTeam
                                                            ? `Coordinated by ${coordinatorName} • ${acceptedMembers.length + 1} vendors`
                                                            : profile?.address || 'Verified Supplier'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="p-5 pt-0 flex items-center justify-between gap-2">
                                        <Link
                                            href={route('customer.suppliers.portfolio', supplier?.id || 1)}
                                            className="rounded-xl border border-[#DCC9A8] bg-white px-3.5 py-2 text-xs font-bold text-[#24221E] hover:bg-[#EFE7D8] transition"
                                        >
                                            {isTeam ? 'Team Details' : 'View Supplier'}
                                        </Link>

                                        <Link
                                            href={route('customer.bookings.create', { package_id: pkg.id })}
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
                            📦
                        </div>
                        <h3 className="mt-4 text-base font-bold text-[#24221E]">No packages match your search</h3>
                        <p className="mt-1 text-xs text-[#77736C] max-w-md mx-auto">
                            Try resetting your filters or selecting a different package category or vendor.
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
