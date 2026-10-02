import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export default function PackagesIndex({ packages, eventCategories = [], approvedSuppliers = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');
    const [supplierId, setSupplierId] = useState(filters.supplier_id || 'all');
    const [priceRange, setPriceRange] = useState(filters.price_range || 'all');
    const [selectedCategories, setSelectedCategories] = useState(
        Array.isArray(filters.categories)
            ? filters.categories.map(Number)
            : filters.category && filters.category !== 'all'
                ? [Number(filters.category)]
                : []
    );
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Sync body scroll lock with mobile drawer
    useEffect(() => {
        if (isMobileFilterOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileFilterOpen]);

    // Calculate active filter count
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (search.trim()) count++;
        if (category !== 'all') count++;
        if (supplierId !== 'all') count++;
        if (priceRange !== 'all') count++;
        if (selectedCategories.length > 0) count += selectedCategories.length;
        return count;
    }, [search, category, supplierId, priceRange, selectedCategories]);

    const applyFilters = (overrides = {}) => {
        const nextSearch = overrides.search !== undefined ? overrides.search : search;
        const nextCategory = overrides.category !== undefined ? overrides.category : category;
        const nextSupplier = overrides.supplierId !== undefined ? overrides.supplierId : supplierId;
        const nextPrice = overrides.priceRange !== undefined ? overrides.priceRange : priceRange;
        const nextCategories = overrides.selectedCategories !== undefined ? overrides.selectedCategories : selectedCategories;

        router.get('/packages', {
            search: nextSearch.trim() || undefined,
            category: nextCategory !== 'all' ? nextCategory : undefined,
            supplier_id: nextSupplier !== 'all' ? nextSupplier : undefined,
            price_range: nextPrice !== 'all' ? nextPrice : undefined,
            categories: nextCategories.length > 0 ? nextCategories : undefined,
        }, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleFilterSubmit = (e) => {
        if (e) e.preventDefault();
        applyFilters();
        setIsMobileFilterOpen(false);
    };

    const toggleCategoryCheckbox = (catId) => {
        const idNum = Number(catId);
        let updated;
        if (selectedCategories.includes(idNum)) {
            updated = selectedCategories.filter((id) => id !== idNum);
        } else {
            updated = [...selectedCategories, idNum];
        }
        setSelectedCategories(updated);
        applyFilters({ selectedCategories: updated });
    };

    const handleSingleCategoryPill = (catId) => {
        if (catId === 'all') {
            setSelectedCategories([]);
            setCategory('all');
            applyFilters({ selectedCategories: [], category: 'all' });
        } else {
            const idNum = Number(catId);
            const isSelected = selectedCategories.length === 1 && selectedCategories[0] === idNum;
            const updated = isSelected ? [] : [idNum];
            setSelectedCategories(updated);
            setCategory('all');
            applyFilters({ selectedCategories: updated, category: 'all' });
        }
    };

    const clearAllFilters = () => {
        setSearch('');
        setCategory('all');
        setSupplierId('all');
        setPriceRange('all');
        setSelectedCategories([]);
        router.get('/packages', {}, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
        setIsMobileFilterOpen(false);
    };

    const removeCategoryFilter = (catId) => {
        const updated = selectedCategories.filter((id) => id !== Number(catId));
        setSelectedCategories(updated);
        applyFilters({ selectedCategories: updated });
    };

    return (
        <PublicLayout title="Our Packages & Services">
            <Head>
                <meta name="description" content="Explore a wide range of packages from our trusted event and wedding suppliers." />
            </Head>

            {/* Header Title Section */}
            <div className="bg-[#F8F5EF] pt-12 pb-8 border-b border-[#EFE7D8]/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE7D8]/80 border border-[#DCC9A8]/60 text-[#A87520] text-[11px] font-bold tracking-wider uppercase mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C99632]" />
                        Tailored Event Solutions
                    </div>
                    <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#24221E] tracking-tight">
                        Our Packages & Services
                    </h1>
                    <p className="mt-3 text-sm sm:text-base text-[#77736C] max-w-2xl mx-auto leading-relaxed">
                        Explore expertly curated event packages and professional services from our verified suppliers.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

                {/* Top Desktop Search & Quick Filter Bar */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EFE7D8] shadow-xs mb-8">
                    <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                        {/* Search Input */}
                        <div className="relative sm:col-span-2 lg:col-span-4">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search package name, inclusions..."
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
                                        applyFilters({ search: '' });
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77736C] hover:text-[#24221E]"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Suppliers Dropdown */}
                        <div className="lg:col-span-3">
                            <select
                                value={supplierId}
                                onChange={(e) => {
                                    setSupplierId(e.target.value);
                                    applyFilters({ supplierId: e.target.value });
                                }}
                                className="w-full py-2.5 px-3 rounded-xl bg-[#F8F5EF] border border-[#EFE7D8] text-xs sm:text-sm text-[#24221E] focus:ring-2 focus:ring-[#C99632] outline-none cursor-pointer"
                            >
                                <option value="all">All Suppliers</option>
                                {approvedSuppliers.map((s) => (
                                    <option key={s.user_id} value={s.user_id}>
                                        {s.business_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range Dropdown */}
                        <div className="lg:col-span-3">
                            <select
                                value={priceRange}
                                onChange={(e) => {
                                    setPriceRange(e.target.value);
                                    applyFilters({ priceRange: e.target.value });
                                }}
                                className="w-full py-2.5 px-3 rounded-xl bg-[#F8F5EF] border border-[#EFE7D8] text-xs sm:text-sm text-[#24221E] focus:ring-2 focus:ring-[#C99632] outline-none cursor-pointer"
                            >
                                <option value="all">Price Range (Any)</option>
                                <option value="under_20k">Under ₱20,000</option>
                                <option value="20k_50k">₱20,000 - ₱50,000</option>
                                <option value="50k_100k">₱50,000 - ₱100,000</option>
                                <option value="over_100k">Above ₱100,000</option>
                            </select>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 lg:col-span-2">
                            <button
                                type="submit"
                                className="flex-1 py-2.5 rounded-xl bg-[#C99632] hover:bg-[#A87520] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                            >
                                Search
                            </button>

                            {/* Mobile Filter Drawer Trigger Button */}
                            <button
                                type="button"
                                onClick={() => setIsMobileFilterOpen(true)}
                                className="lg:hidden flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#24221E] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors shrink-0 shadow-xs"
                                aria-label="Open filter sidebar"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                {activeFilterCount > 0 && (
                                    <span className="w-5 h-5 rounded-full bg-[#C99632] text-white text-[10px] flex items-center justify-center font-bold">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Active Filters Pill Bar */}
                    {activeFilterCount > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#EFE7D8] flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-bold text-[#77736C] uppercase tracking-wider mr-1">
                                Active Filters:
                            </span>

                            {search.trim() && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFE7D8] text-xs font-medium text-[#24221E]">
                                    Keyword: "{search}"
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            applyFilters({ search: '' });
                                        }}
                                        className="hover:text-red-500 font-bold ml-1"
                                    >
                                        ✕
                                    </button>
                                </span>
                            )}

                            {selectedCategories.map((catId) => {
                                const catObj = eventCategories.find((c) => Number(c.id) === Number(catId));
                                if (!catObj) return null;
                                return (
                                    <span
                                        key={catId}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C99632]/15 text-[#A87520] text-xs font-semibold"
                                    >
                                        {catObj.name}
                                        <button
                                            type="button"
                                            onClick={() => removeCategoryFilter(catId)}
                                            className="hover:text-red-600 font-bold ml-1"
                                        >
                                            ✕
                                        </button>
                                    </span>
                                );
                            })}

                            {priceRange !== 'all' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFE7D8] text-xs font-medium text-[#24221E]">
                                    {priceRange === 'under_20k' && 'Under ₱20,000'}
                                    {priceRange === '20k_50k' && '₱20,000 - ₱50,000'}
                                    {priceRange === '50k_100k' && '₱50,000 - ₱100,000'}
                                    {priceRange === 'over_100k' && 'Above ₱100,000'}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPriceRange('all');
                                            applyFilters({ priceRange: 'all' });
                                        }}
                                        className="hover:text-red-500 font-bold ml-1"
                                    >
                                        ✕
                                    </button>
                                </span>
                            )}

                            {supplierId !== 'all' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFE7D8] text-xs font-medium text-[#24221E]">
                                    Supplier: {approvedSuppliers.find((s) => String(s.user_id) === String(supplierId))?.business_name || 'Selected'}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSupplierId('all');
                                            applyFilters({ supplierId: 'all' });
                                        }}
                                        className="hover:text-red-500 font-bold ml-1"
                                    >
                                        ✕
                                    </button>
                                </span>
                            )}

                            <button
                                type="button"
                                onClick={clearAllFilters}
                                className="text-xs font-bold text-[#A87520] hover:text-[#24221E] underline ml-2 transition-colors"
                            >
                                Reset All
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Content Layout (Desktop Sidebar + Packages Grid) */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    {/* Desktop Left Sidebar: Event Category & Additional Filters */}
                    <aside className="hidden lg:block lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl border border-[#EFE7D8] shadow-xs sticky top-28 space-y-6">
                            {/* Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-[#EFE7D8]">
                                <h3 className="font-serif font-bold text-base text-[#24221E] flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#C99632]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    Event Categories
                                </h3>
                                {selectedCategories.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedCategories([]);
                                            applyFilters({ selectedCategories: [] });
                                        }}
                                        className="text-[11px] text-[#A87520] hover:underline font-semibold"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            {/* Category Checkbox List */}
                            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                                {eventCategories.map((cat) => {
                                    const isChecked = selectedCategories.includes(Number(cat.id));
                                    return (
                                        <label
                                            key={cat.id}
                                            className={`flex items-center justify-between text-xs cursor-pointer p-2 rounded-xl transition-colors ${isChecked
                                                    ? 'bg-[#F8F5EF] text-[#A87520] font-bold border border-[#DCC9A8]'
                                                    : 'text-[#24221E] hover:bg-[#F8F5EF]/60 hover:text-[#C99632]'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleCategoryCheckbox(cat.id)}
                                                    className="w-4 h-4 rounded text-[#C99632] focus:ring-[#C99632] border-[#DCC9A8]"
                                                />
                                                <span>{cat.name}</span>
                                            </div>
                                            {cat.packages_count > 0 && (
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isChecked ? 'bg-[#C99632] text-white' : 'bg-[#EFE7D8] text-[#77736C]'
                                                    }`}>
                                                    {cat.packages_count}
                                                </span>
                                            )}
                                        </label>
                                    );
                                })}
                            </div>

                            {/* Price Range Filter Radio/Cards */}
                            <div className="pt-4 border-t border-[#EFE7D8]">
                                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#77736C] mb-3">
                                    Budget Range
                                </h4>
                                <div className="space-y-1.5">
                                    {[
                                        { key: 'all', label: 'All Budgets' },
                                        { key: 'under_20k', label: 'Under ₱20,000' },
                                        { key: '20k_50k', label: '₱20,000 - ₱50,000' },
                                        { key: '50k_100k', label: '₱50,000 - ₱100,000' },
                                        { key: 'over_100k', label: 'Above ₱100,000' },
                                    ].map((p) => (
                                        <button
                                            key={p.key}
                                            type="button"
                                            onClick={() => {
                                                setPriceRange(p.key);
                                                applyFilters({ priceRange: p.key });
                                            }}
                                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${priceRange === p.key
                                                    ? 'bg-[#C99632] text-white font-bold'
                                                    : 'text-[#77736C] hover:bg-[#F8F5EF] hover:text-[#24221E]'
                                                }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Right Side: Packages Grid */}
                    <div className="lg:col-span-3">
                        {/* Status bar */}
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs font-semibold text-[#77736C]">
                                Showing <span className="text-[#24221E] font-bold">{packages.total || 0}</span> available packages
                            </p>

                            {/* Mobile drawer trigger in sub-header */}
                            <button
                                type="button"
                                onClick={() => setIsMobileFilterOpen(true)}
                                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#DCC9A8] bg-white text-xs font-bold text-[#24221E] hover:border-[#C99632]"
                            >
                                <svg className="w-3.5 h-3.5 text-[#C99632]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                                <span>Filter by Category</span>
                                {selectedCategories.length > 0 && (
                                    <span className="w-4 h-4 rounded-full bg-[#C99632] text-white text-[9px] flex items-center justify-center font-bold">
                                        {selectedCategories.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {packages.data && packages.data.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {packages.data.map((pkg) => (
                                    <div
                                        key={pkg.id}
                                        className="bg-white rounded-2xl overflow-hidden border border-[#EFE7D8] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                                    >
                                        {/* Image */}
                                        <div className="relative h-48 w-full overflow-hidden bg-[#EFE7D8]">
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
                                            {pkg.is_top_package && (
                                                <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-[#C99632] text-white text-[9px] font-bold uppercase tracking-wider shadow-xs">
                                                    ★ Top Package
                                                </span>
                                            )}
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
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#77736C] hover:text-[#C99632] mt-1.5 transition-colors"
                                                >
                                                    <span className="w-4 h-4 rounded-full bg-[#EFE7D8] flex items-center justify-center text-[10px]">👤</span>
                                                    <span className="line-clamp-1">{pkg.supplier.business_name}</span>
                                                </Link>

                                                {/* Rating & Reviews */}
                                                <div className="flex items-center gap-1.5 mt-2 text-xs">
                                                    <span className="text-[#C99632] font-bold">★</span>
                                                    <span className="font-bold text-[#24221E]">{pkg.rating}</span>
                                                    <span className="text-[#77736C]">({pkg.reviews_count} reviews)</span>
                                                </div>

                                                {/* Description Preview */}
                                                {pkg.description && (
                                                    <p className="text-xs text-[#77736C] mt-2 line-clamp-2 leading-relaxed">
                                                        {pkg.description}
                                                    </p>
                                                )}

                                                {/* Price */}
                                                <p className="font-serif font-bold text-lg text-[#C99632] mt-3">
                                                    {pkg.formatted_price}
                                                </p>
                                            </div>

                                            {/* Action Button */}
                                            <div className="mt-5 pt-4 border-t border-[#EFE7D8]">
                                                <button
                                                    onClick={() => setSelectedPackage(pkg)}
                                                    className="w-full text-center py-2.5 rounded-full border border-[#DCC9A8] hover:border-[#C99632] hover:bg-[#C99632] hover:text-white text-xs font-bold text-[#24221E] uppercase tracking-wider transition-all duration-200"
                                                >
                                                    View Package Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#EFE7D8] shadow-xs">
                                <div className="w-16 h-16 rounded-full bg-[#F8F5EF] border border-[#EFE7D8] flex items-center justify-center mx-auto text-[#C99632] mb-3">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="font-serif font-bold text-lg text-[#24221E]">No Packages Found</h3>
                                <p className="text-xs sm:text-sm text-[#77736C] max-w-md mx-auto mt-1">
                                    We couldn't find any packages matching your current filter criteria.
                                </p>
                                <button
                                    type="button"
                                    onClick={clearAllFilters}
                                    className="mt-5 px-6 py-2.5 rounded-full bg-[#C99632] hover:bg-[#A87520] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {packages.links && packages.links.length > 3 && (
                            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EFE7D8] pt-6">
                                <p className="text-xs text-[#77736C]">
                                    Showing {packages.from || 0} - {packages.to || 0} of {packages.total} packages
                                </p>
                                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                    {packages.links.map((link, i) => (
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
                </div>
            </div>

            {/* ========================================================================= */}
            {/* MOBILE FILTER SIDEBAR DRAWER (Responsive for mobile & tablets)           */}
            {/* ========================================================================= */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    {/* Backdrop */}
                    <div
                        onClick={() => setIsMobileFilterOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                    />

                    {/* Slide-over Panel */}
                    <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
                        {/* Drawer Header */}
                        <div className="p-4 sm:p-5 border-b border-[#EFE7D8] flex items-center justify-between bg-[#F8F5EF]">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#C99632]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                <h3 className="font-serif font-bold text-base text-[#24221E]">
                                    Filters
                                </h3>
                                {activeFilterCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-[#C99632] text-white text-[10px] font-bold">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="p-2 rounded-xl text-[#77736C] hover:text-[#24221E] hover:bg-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Drawer Scrollable Content */}
                        <div className="p-5 flex-1 overflow-y-auto space-y-6">
                            {/* Search */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#77736C] mb-2">
                                    Search Packages
                                </label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Keywords, package name..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EF] border border-[#EFE7D8] text-xs text-[#24221E] focus:ring-2 focus:ring-[#C99632] outline-none"
                                />
                            </div>

                            {/* Event Categories Checkboxes */}
                            <div>
                                <div className="flex items-center justify-between mb-2.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#77736C]">
                                        Event Category
                                    </label>
                                    {selectedCategories.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedCategories([])}
                                            className="text-[11px] text-[#A87520] font-semibold"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {eventCategories.map((cat) => {
                                        const isChecked = selectedCategories.includes(Number(cat.id));
                                        return (
                                            <label
                                                key={cat.id}
                                                className={`flex items-center justify-between text-xs p-2 rounded-xl cursor-pointer transition-colors ${isChecked
                                                        ? 'bg-[#F8F5EF] text-[#A87520] font-bold border border-[#DCC9A8]'
                                                        : 'text-[#24221E] hover:bg-[#F8F5EF]/60'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => {
                                                            const idNum = Number(cat.id);
                                                            if (selectedCategories.includes(idNum)) {
                                                                setSelectedCategories(selectedCategories.filter((id) => id !== idNum));
                                                            } else {
                                                                setSelectedCategories([...selectedCategories, idNum]);
                                                            }
                                                        }}
                                                        className="w-4 h-4 rounded text-[#C99632] focus:ring-[#C99632] border-[#DCC9A8]"
                                                    />
                                                    <span>{cat.name}</span>
                                                </div>
                                                {cat.packages_count > 0 && (
                                                    <span className="text-[10px] bg-[#EFE7D8] text-[#77736C] px-2 py-0.5 rounded-full font-semibold">
                                                        {cat.packages_count}
                                                    </span>
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#77736C] mb-2">
                                    Price Range
                                </label>
                                <select
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(e.target.value)}
                                    className="w-full py-2.5 px-3 rounded-xl bg-[#F8F5EF] border border-[#EFE7D8] text-xs text-[#24221E] focus:ring-2 focus:ring-[#C99632] outline-none"
                                >
                                    <option value="all">All Prices</option>
                                    <option value="under_20k">Under ₱20,000</option>
                                    <option value="20k_50k">₱20,000 - ₱50,000</option>
                                    <option value="50k_100k">₱50,000 - ₱100,000</option>
                                    <option value="over_100k">Above ₱100,000</option>
                                </select>
                            </div>

                            {/* Suppliers */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#77736C] mb-2">
                                    Supplier
                                </label>
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
                        </div>

                        {/* Drawer Footer Actions */}
                        <div className="p-4 border-t border-[#EFE7D8] bg-[#F8F5EF] flex items-center gap-3">
                            <button
                                type="button"
                                onClick={clearAllFilters}
                                className="flex-1 py-2.5 rounded-xl border border-[#DCC9A8] bg-white text-[#24221E] text-xs font-bold uppercase tracking-wider hover:bg-[#EFE7D8] transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                onClick={handleFilterSubmit}
                                className="flex-1 py-2.5 rounded-xl bg-[#C99632] hover:bg-[#A87520] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* PACKAGE DETAILS MODAL                                                     */}
            {/* ========================================================================= */}
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
                        <div className="mt-4 rounded-2xl overflow-hidden h-56 sm:h-64 w-full bg-[#EFE7D8]">
                            <img
                                src={selectedPackage.image_url}
                                alt={selectedPackage.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex items-center justify-between mt-5 py-3.5 px-5 rounded-2xl bg-[#F8F5EF] border border-[#EFE7D8]">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#77736C]">Package Rate</span>
                                <p className="font-serif font-bold text-2xl text-[#C99632]">
                                    {selectedPackage.formatted_price}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#77736C]">Customer Rating</span>
                                <div className="flex items-center gap-1 mt-0.5 justify-end">
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
                            <div className="pt-4 border-t border-[#EFE7D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                                    className="px-5 py-2.5 text-center rounded-full bg-[#C99632] hover:bg-[#A87520] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                                >
                                    View Supplier Profile
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
