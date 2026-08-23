import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';

export default function Index({
    suppliers = {},
    categories = [],
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [searchTimeout, setSearchTimeout] = useState(null);

    const handleSearch = useCallback(
        (value) => {
            setSearch(value);
            if (searchTimeout) clearTimeout(searchTimeout);

            const timeout = setTimeout(() => {
                router.get(
                    route('customer.suppliers.index'),
                    { search: value, category: selectedCategory },
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            }, 400);

            setSearchTimeout(timeout);
        },
        [selectedCategory, searchTimeout]
    );

    const handleCategory = (value) => {
        setSelectedCategory(value);
        router.get(
            route('customer.suppliers.index'),
            { search, category: value },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const getProfilePicture = (profile) => {
        const picture = profile?.profile_picture;
        if (!picture) return null;
        if (picture.startsWith('http://') || picture.startsWith('https://') || picture.startsWith('/')) {
            return picture;
        }
        return `/storage/${picture}`;
    };

    const getPortfolioPreviewImages = (profile) => {
        const portfolios = profile?.user?.portfolios || [];
        const images = [];
        for (const portfolio of portfolios) {
            if (images.length >= 3) break;
            const coverUrl = portfolio.cover_image_url;
            if (coverUrl) images.push(coverUrl);
        }
        return images;
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedCategory('all');
        router.get(route('customer.suppliers.index'), {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const supplierList = suppliers?.data || [];
    const paginationLinks = suppliers?.links || [];

    return (
        <DashboardLayout>
            <Head title="Find Suppliers - Westeam" />

            <div className="min-h-screen bg-slate-50/60 p-6 lg:p-8">
                {/* Hero Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                                🔍 Supplier Directory
                            </span>
                            <span className="text-xs text-slate-400">• Verified Event & Wedding Pros</span>
                        </div>
                        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                            Find Your Perfect Supplier
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Browse verified wedding photographers, caterers, stylists, coordinators, and book direct or team packages.
                        </p>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                🔍
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search suppliers by name, category, or location..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                            />
                            {search && (
                                <button
                                    onClick={() => handleSearch('')}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 hover:text-slate-600"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Category Dropdown */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => handleCategory(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 lg:w-60"
                        >
                            <option value="all">All Event Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Active Supplier Counter */}
                    <span className="shrink-0 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700">
                        {suppliers?.total || 0} Suppliers Found
                    </span>
                </div>

                {/* Category Pills */}
                {categories.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => handleCategory('all')}
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                                selectedCategory === 'all'
                                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                            }`}
                        >
                            All
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => handleCategory(String(category.id))}
                                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                                    selectedCategory === String(category.id)
                                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                                        : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Suppliers Grid */}
                {supplierList.length > 0 ? (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {supplierList.map((profile) => {
                            const picture = getProfilePicture(profile);
                            const previewImages = getPortfolioPreviewImages(profile);
                            const businessName = profile.business_name || profile.user?.name || 'Event Supplier';
                            const supplierCategories = profile.categories || [];

                            return (
                                <div
                                    key={profile.id}
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-md"
                                >
                                    {/* Mini Portfolio Banner */}
                                    <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                                        {previewImages.length > 0 ? (
                                            <div className="flex h-full gap-0.5">
                                                {previewImages.slice(0, 3).map((imgUrl, idx) => (
                                                    <div key={idx} className="relative h-full flex-1 overflow-hidden">
                                                        <img
                                                            src={imgUrl}
                                                            alt={`Portfolio ${idx + 1}`}
                                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-indigo-50/50 to-slate-100">
                                                <span className="text-3xl">🏢</span>
                                                <span className="mt-1 text-xs font-semibold text-slate-400">Verified Supplier</span>
                                            </div>
                                        )}

                                        <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
                                            ✓ Verified
                                        </span>
                                    </div>

                                    {/* Body Info */}
                                    <div className="relative flex flex-1 flex-col justify-between p-5 pt-0">
                                        {/* Avatar floating */}
                                        <div className="-mt-8 mb-3 flex items-end justify-between">
                                            <div className="h-16 w-16 overflow-hidden rounded-2xl border-3 border-white bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                                                {picture ? (
                                                    <img src={picture} alt={businessName} className="h-full w-full object-cover" />
                                                ) : (
                                                    businessName.charAt(0).toUpperCase()
                                                )}
                                            </div>

                                            {/* Chat button shortcut */}
                                            {profile.user_id && (
                                                <button
                                                    type="button"
                                                    onClick={() => router.post(route('messages.direct', profile.user_id))}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-600 hover:text-white"
                                                    title="Message this supplier"
                                                >
                                                    <span>💬</span>
                                                    <span>Chat</span>
                                                </button>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="line-clamp-1 text-base font-extrabold text-slate-900 group-hover:text-indigo-600">
                                                {businessName}
                                            </h3>

                                            {/* Categories */}
                                            {supplierCategories.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {supplierCategories.slice(0, 3).map((cat) => (
                                                        <span
                                                            key={cat.id}
                                                            className="rounded-lg bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700"
                                                        >
                                                            {cat.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Description */}
                                            {profile.description && (
                                                <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-slate-600">
                                                    {profile.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Footer Links */}
                                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5">
                                            {profile.address ? (
                                                <span className="truncate text-[11px] text-slate-400 max-w-[140px]">
                                                    📍 {profile.address}
                                                </span>
                                            ) : (
                                                <span />
                                            )}

                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route('customer.suppliers.portfolio', profile.user_id)}
                                                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                                >
                                                    Gallery
                                                </Link>
                                                <Link
                                                    href={route('customer.suppliers.show', profile.user_id)}
                                                    className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
                                                >
                                                    Profile →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                            🔍
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-slate-900">
                            No suppliers found
                        </h3>
                        <p className="mt-1 max-w-sm text-xs text-slate-500">
                            No verified suppliers match your current filter. Try resetting your search.
                        </p>
                        <button
                            onClick={clearFilters}
                            className="mt-5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {paginationLinks.length > 3 && (
                    <div className="mt-8 flex items-center justify-center gap-1.5">
                        {paginationLinks.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                    link.active
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : link.url
                                        ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                        : 'text-slate-300 cursor-not-allowed'
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