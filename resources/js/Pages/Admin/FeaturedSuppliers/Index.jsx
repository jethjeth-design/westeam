import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';

export default function Index({
    currentlyFeatured = [],
    qualifiedPending = [],
    allRankings = [],
    stats = {},
    filters = {},
}) {
    const [activeTab, setActiveTab] = useState(filters.tab || 'featured');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [actionInProgress, setActionInProgress] = useState(null);

    // Search filter function
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('admin.featured-suppliers.index'),
            { search: searchTerm, tab: activeTab },
            { preserveState: true, replace: true }
        );
    };

    // Recalculate automatic system rankings
    const handleRecalculate = () => {
        if (isRecalculating) return;
        setIsRecalculating(true);
        router.post(
            route('admin.featured-suppliers.recalculate'),
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsRecalculating(false),
            }
        );
    };

    // Feature action
    const handleFeature = (supplier) => {
        setActionInProgress(supplier.id);
        router.post(
            route('admin.featured-suppliers.feature', supplier.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setActionInProgress(null);
                    if (selectedSupplier?.id === supplier.id) {
                        setSelectedSupplier((prev) => ({
                            ...prev,
                            is_featured: true,
                            is_ranking_excluded: false,
                        }));
                    }
                },
            }
        );
    };

    // Unfeature action
    const handleUnfeature = (supplier) => {
        setActionInProgress(supplier.id);
        router.post(
            route('admin.featured-suppliers.unfeature', supplier.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setActionInProgress(null);
                    if (selectedSupplier?.id === supplier.id) {
                        setSelectedSupplier((prev) => ({
                            ...prev,
                            is_featured: false,
                            is_ranking_excluded: true,
                        }));
                    }
                },
            }
        );
    };

    // Restore to automatic evaluation
    const handleRestoreAuto = (supplier) => {
        setActionInProgress(supplier.id);
        router.post(
            route('admin.featured-suppliers.restore-auto', supplier.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setActionInProgress(null);
                    if (selectedSupplier?.id === supplier.id) {
                        setSelectedSupplier((prev) => ({
                            ...prev,
                            is_ranking_excluded: false,
                        }));
                    }
                },
            }
        );
    };

    // Toggle feature status
    const handleToggle = (supplier) => {
        setActionInProgress(supplier.id);
        router.post(
            route('admin.featured-suppliers.toggle', supplier.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setActionInProgress(null);
                    if (selectedSupplier?.id === supplier.id) {
                        setSelectedSupplier((prev) => ({
                            ...prev,
                            is_featured: !prev.is_featured,
                            is_ranking_excluded: prev.is_featured,
                        }));
                    }
                },
            }
        );
    };

    // Get the dataset for current tab
    const currentList = useMemo(() => {
        if (activeTab === 'featured') return currentlyFeatured;
        if (activeTab === 'qualified') return qualifiedPending;
        return allRankings;
    }, [activeTab, currentlyFeatured, qualifiedPending, allRankings]);

    // Star renderer helper
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.3 && rating % 1 <= 0.7;
        const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

        return (
            <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(fullStars)].map((_, i) => (
                    <span key={`f-${i}`} className="text-sm">★</span>
                ))}
                {hasHalf && <span className="text-sm opacity-80">★</span>}
                {[...Array(Math.max(0, emptyStars))].map((_, i) => (
                    <span key={`e-${i}`} className="text-sm text-slate-200">★</span>
                ))}
                <span className="ml-1.5 text-xs font-bold text-slate-700">{Number(rating).toFixed(1)}</span>
            </div>
        );
    };

    // Rank badge styling
    const getRankBadge = (rank) => {
        if (rank === 1) {
            return (
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 text-xs font-black shadow-xs ring-2 ring-amber-400/50">
                    🥇
                </span>
            );
        }
        if (rank === 2) {
            return (
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-xs font-black shadow-xs ring-2 ring-slate-300">
                    🥈
                </span>
            );
        }
        if (rank === 3) {
            return (
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-900 text-xs font-black shadow-xs ring-2 ring-amber-600/30">
                    🥉
                </span>
            );
        }
        return (
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                #{rank}
            </span>
        );
    };

    return (
        <DashboardLayout>
            <Head title="Featured Supplier Management - Westeam" />

            <div className="min-h-screen bg-slate-50/60 p-6 lg:p-8 space-y-6">

                {/* ========================================================================= */}
                {/* HEADER & QUICK ACTIONS                                                    */}
                {/* ========================================================================= */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                                <span>⭐</span>
                                <span>Admin Portal</span>
                            </span>
                            <span className="text-xs text-slate-400">• Supplier Discovery System</span>
                        </div>
                        <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                            Featured Supplier Management
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Automatically calculate ratings, verified reviews & completed bookings to qualify and feature top suppliers.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={handleRecalculate}
                            disabled={isRecalculating}
                            className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:from-indigo-700 hover:to-violet-700 active:scale-95 ${
                                isRecalculating ? 'opacity-75 cursor-not-allowed' : ''
                            }`}
                        >
                            <span className={`text-sm ${isRecalculating ? 'animate-spin' : ''}`}>🔄</span>
                            <span>{isRecalculating ? 'Recalculating Rankings...' : 'Recalculate & Sync Rankings'}</span>
                        </button>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* STATS OVERVIEW CARDS                                                      */}
                {/* ========================================================================= */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Currently Featured */}
                    <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Currently Featured</span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-base shadow-xs ring-1 ring-amber-500/20">
                                ⭐
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">{stats.total_featured ?? 0}</span>
                            <span className="text-xs font-semibold text-emerald-600">Active spotlight</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">
                            Suppliers actively granted Featured status on platform
                        </p>
                    </div>

                    {/* Card 2: Qualified Suppliers */}
                    <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Qualified Candidates</span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-base shadow-xs ring-1 ring-emerald-500/20">
                                🎖️
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">{stats.total_qualified ?? 0}</span>
                            <span className="text-xs font-semibold text-indigo-600">
                                {qualifiedPending.length} pending feature
                            </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">
                            Passed all 4 automated performance rules
                        </p>
                    </div>

                    {/* Card 3: Total Evaluated */}
                    <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Suppliers Evaluated</span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-base shadow-xs ring-1 ring-violet-500/20">
                                🏢
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">{stats.total_suppliers ?? 0}</span>
                            <span className="text-xs font-semibold text-slate-500">Approved pool</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">
                            Total approved vendor profiles in ranking index
                        </p>
                    </div>

                    {/* Card 4: Qualification Rules Pill */}
                    <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/70 to-orange-50/40 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Qualification Rules</span>
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold">
                                ℹ️
                            </span>
                        </div>
                        <div className="mt-2.5 space-y-1 text-xs text-amber-900/90 font-medium">
                            <div className="flex items-center gap-1.5">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>Rating <strong className="font-bold">≥ 4.5 Stars</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>Reviews <strong className="font-bold">≥ 5 Verified</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>Completed <strong className="font-bold">≥ 5 Bookings</strong></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* SEARCH & NAVIGATION TABS                                                  */}
                {/* ========================================================================= */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-1 rounded-2xl bg-slate-200/70 p-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab('featured')}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                                activeTab === 'featured'
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <span>⭐ Currently Featured</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                                activeTab === 'featured' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-300 text-slate-700'
                            }`}>
                                {currentlyFeatured.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('qualified')}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                                activeTab === 'qualified'
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <span>🎖️ Qualified Candidates</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                                activeTab === 'qualified' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-300 text-slate-700'
                            }`}>
                                {qualifiedPending.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('all')}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                                activeTab === 'all'
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <span>📊 All Rankings Leaderboard</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                                activeTab === 'all' ? 'bg-slate-100 text-slate-700' : 'bg-slate-300 text-slate-700'
                            }`}>
                                {allRankings.length}
                            </span>
                        </button>
                    </div>

                    {/* Search bar */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">🔍</span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search suppliers, categories..."
                                className="w-64 sm:w-72 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                        <button
                            type="submit"
                            className="rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-900"
                        >
                            Filter
                        </button>
                    </form>
                </div>

                {/* ========================================================================= */}
                {/* SUPPLIER TABLE LIST                                                       */}
                {/* ========================================================================= */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    <th className="py-4 pl-6 pr-3 w-16 text-center">Rank</th>
                                    <th className="py-4 px-4 min-w-[220px]">Supplier</th>
                                    <th className="py-4 px-4 text-center">Average Rating</th>
                                    <th className="py-4 px-4 text-center">Customer Reviews</th>
                                    <th className="py-4 px-4 text-center">Completed Bookings</th>
                                    <th className="py-4 px-4 text-center">Featured Score</th>
                                    <th className="py-4 px-4 text-center">Qualification Status</th>
                                    <th className="py-4 pr-6 pl-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {currentList.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center text-slate-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <span className="text-4xl">🌟</span>
                                                <p className="text-sm font-bold text-slate-600">No suppliers found in this view</p>
                                                <p className="text-xs text-slate-400">
                                                    {activeTab === 'featured'
                                                        ? 'No featured suppliers currently active. Manually feature a candidate or run recalculate.'
                                                        : activeTab === 'qualified'
                                                        ? 'No pending qualified candidates. Suppliers must meet ≥4.5★ rating, ≥5 reviews, and ≥5 completed bookings.'
                                                        : 'No suppliers match your search query.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentList.map((supplier) => {
                                        const isActionLoading = actionInProgress === supplier.id;

                                        return (
                                            <tr
                                                key={supplier.id}
                                                className={`transition-colors hover:bg-slate-50/80 ${
                                                    supplier.is_featured ? 'bg-amber-50/20' : ''
                                                }`}
                                            >
                                                {/* Rank Badge */}
                                                <td className="py-4 pl-6 pr-3 text-center">
                                                    {getRankBadge(supplier.rank)}
                                                </td>

                                                {/* Supplier info */}
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                                                            {supplier.profile_picture ? (
                                                                <img
                                                                    src={`/storage/${supplier.profile_picture}`}
                                                                    alt={supplier.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center font-bold text-slate-400 text-base">
                                                                    🏢
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-slate-900 truncate max-w-[180px]">
                                                                    {supplier.name}
                                                                </p>
                                                                {supplier.is_featured && (
                                                                    <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-800 ring-1 ring-amber-400/40">
                                                                        ⭐ Featured
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-slate-400 truncate">
                                                                {supplier.user?.email}
                                                            </p>
                                                            {/* Category Tags */}
                                                            <div className="mt-1 flex flex-wrap gap-1">
                                                                {supplier.categories?.slice(0, 2).map((cat) => (
                                                                    <span
                                                                        key={cat.id}
                                                                        className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600"
                                                                    >
                                                                        {cat.name}
                                                                    </span>
                                                                ))}
                                                                {supplier.categories?.length > 2 && (
                                                                    <span className="text-[9px] font-bold text-slate-400">
                                                                        +{supplier.categories.length - 2}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Average Rating */}
                                                <td className="py-4 px-4 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        {renderStars(supplier.average_rating)}
                                                        <span className="text-[10px] text-slate-400 mt-0.5">
                                                            {supplier.reviews_count > 0 ? 'Verified Reviews' : 'No ratings yet'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Customer Reviews (Completed bookings only) */}
                                                <td className="py-4 px-4 text-center">
                                                    <div className="inline-flex flex-col items-center">
                                                        <span className="font-bold text-slate-800 text-sm">
                                                            {supplier.reviews_count}
                                                        </span>
                                                        <span className={`text-[10px] font-semibold ${
                                                            supplier.reviews_count >= 5 ? 'text-emerald-600' : 'text-slate-400'
                                                        }`}>
                                                            {supplier.reviews_count >= 5 ? '✓ Meets requirement' : `${5 - supplier.reviews_count} needed`}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Completed Bookings */}
                                                <td className="py-4 px-4 text-center">
                                                    <div className="inline-flex flex-col items-center">
                                                        <span className="font-bold text-slate-800 text-sm">
                                                            {supplier.completed_bookings_count}
                                                        </span>
                                                        <span className={`text-[10px] font-semibold ${
                                                            supplier.completed_bookings_count >= 5 ? 'text-emerald-600' : 'text-slate-400'
                                                        }`}>
                                                            {supplier.completed_bookings_count >= 5 ? '✓ Meets requirement' : `${5 - supplier.completed_bookings_count} needed`}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Featured Score */}
                                                <td className="py-4 px-4 text-center">
                                                    <div className="inline-flex flex-col items-center">
                                                        <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl ring-1 ring-inset ring-indigo-700/10 text-xs">
                                                            {Number(supplier.featured_score).toFixed(1)} pts
                                                        </span>
                                                        <div className="mt-1.5 w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1.5 rounded-full"
                                                                style={{ width: `${Math.min(100, (supplier.featured_score / 150) * 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Qualification Status */}
                                                <td className="py-4 px-4 text-center">
                                                    {supplier.is_qualified ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                                            <span>✓</span>
                                                            <span>Qualified</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500 ring-1 ring-inset ring-slate-400/20">
                                                            <span>⏳</span>
                                                            <span>In Progress</span>
                                                        </span>
                                                    )}
                                                    {supplier.is_ranking_excluded && (
                                                        <div className="mt-1">
                                                            <span className="inline-flex items-center text-[9px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                                                Admin Override
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="py-4 pr-6 pl-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* Details button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedSupplier(supplier)}
                                                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-indigo-600"
                                                        >
                                                            Inspect
                                                        </button>

                                                        {/* Featured status control */}
                                                        {supplier.is_featured ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUnfeature(supplier)}
                                                                disabled={isActionLoading}
                                                                className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-600 hover:text-white"
                                                            >
                                                                {isActionLoading ? '...' : 'Remove Feature'}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleFeature(supplier)}
                                                                disabled={isActionLoading}
                                                                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                                                                    supplier.is_qualified
                                                                        ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                                                                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
                                                                }`}
                                                            >
                                                                {isActionLoading ? '...' : 'Feature Now'}
                                                            </button>
                                                        )}

                                                        {/* Restore Auto if manually excluded */}
                                                        {supplier.is_ranking_excluded && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRestoreAuto(supplier)}
                                                                title="Restore to automatic evaluation"
                                                                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                                            >
                                                                Reset Auto
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* SUPPLIER INSPECTION MODAL / SLIDE-OVER                                    */}
                {/* ========================================================================= */}
                {selectedSupplier && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)' }}
                        onClick={() => setSelectedSupplier(null)}
                    >
                        <div
                            className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-fade-in"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header Banner */}
                            <div className="relative h-32 shrink-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 p-6">
                                {selectedSupplier.cover_photo_url && (
                                    <img
                                        src={selectedSupplier.cover_photo_url}
                                        alt="Cover"
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                                <button
                                    type="button"
                                    onClick={() => setSelectedSupplier(null)}
                                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/40"
                                >
                                    ✕
                                </button>

                                <div className="absolute bottom-4 left-6 flex items-center gap-3">
                                    <div className="h-16 w-16 overflow-hidden rounded-2xl border-2 border-white bg-white shadow-md">
                                        {selectedSupplier.profile_picture ? (
                                            <img
                                                src={`/storage/${selectedSupplier.profile_picture}`}
                                                alt={selectedSupplier.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-2xl">🏢</div>
                                        )}
                                    </div>
                                    <div className="text-white">
                                        <h3 className="text-lg font-black leading-tight drop-shadow-sm">
                                            {selectedSupplier.name}
                                        </h3>
                                        <p className="text-xs text-white/80">{selectedSupplier.user?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Content Scroll Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                {/* Performance Matrix */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rating</p>
                                        <p className="mt-1 text-base font-black text-slate-900">
                                            {Number(selectedSupplier.average_rating).toFixed(1)} ★
                                        </p>
                                        <span className="text-[9px] text-slate-400">Target ≥ 4.5</span>
                                    </div>
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reviews</p>
                                        <p className="mt-1 text-base font-black text-slate-900">
                                            {selectedSupplier.reviews_count}
                                        </p>
                                        <span className="text-[9px] text-slate-400">Target ≥ 5</span>
                                    </div>
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completed</p>
                                        <p className="mt-1 text-base font-black text-slate-900">
                                            {selectedSupplier.completed_bookings_count}
                                        </p>
                                        <span className="text-[9px] text-slate-400">Target ≥ 5</span>
                                    </div>
                                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3 text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Score</p>
                                        <p className="mt-1 text-base font-black text-indigo-700">
                                            {Number(selectedSupplier.featured_score).toFixed(1)}
                                        </p>
                                        <span className="text-[9px] text-indigo-500">Rank #{selectedSupplier.rank}</span>
                                    </div>
                                </div>

                                {/* Qualification Checklist */}
                                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Qualification Requirements Audit
                                    </h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">1. Approved Active Supplier Profile</span>
                                            <span className={`font-bold ${selectedSupplier.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {selectedSupplier.status === 'approved' ? '✓ Passed' : '✕ Pending/Rejected'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">2. At least 5 Completed Bookings</span>
                                            <span className={`font-bold ${selectedSupplier.completed_bookings_count >= 5 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {selectedSupplier.completed_bookings_count >= 5
                                                    ? `✓ Passed (${selectedSupplier.completed_bookings_count}/5)`
                                                    : `✕ Incomplete (${selectedSupplier.completed_bookings_count}/5)`}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">3. At least 5 Customer Reviews (Completed Bookings Only)</span>
                                            <span className={`font-bold ${selectedSupplier.reviews_count >= 5 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {selectedSupplier.reviews_count >= 5
                                                    ? `✓ Passed (${selectedSupplier.reviews_count}/5)`
                                                    : `✕ Incomplete (${selectedSupplier.reviews_count}/5)`}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">4. Average Rating of at least 4.5 Stars</span>
                                            <span className={`font-bold ${selectedSupplier.average_rating >= 4.5 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {selectedSupplier.average_rating >= 4.5
                                                    ? `✓ Passed (${Number(selectedSupplier.average_rating).toFixed(1)}/5.0)`
                                                    : `✕ Below threshold (${Number(selectedSupplier.average_rating).toFixed(1)}/5.0)`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Reviews from completed bookings */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                            Verified Reviews ({selectedSupplier.recent_reviews?.length || 0})
                                        </h4>
                                        <span className="text-[11px] text-slate-400">Strictly from completed bookings</span>
                                    </div>
                                    {selectedSupplier.recent_reviews?.length > 0 ? (
                                        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                                            {selectedSupplier.recent_reviews.map((rev) => (
                                                <div
                                                    key={rev.id}
                                                    className="rounded-xl border border-slate-100 bg-white p-3 shadow-2xs text-xs"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-bold text-slate-800">{rev.customer_name}</span>
                                                            <span className="text-[10px] text-slate-400">• {rev.item_name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                                                            <span>★</span>
                                                            <span>{rev.rating}</span>
                                                        </div>
                                                    </div>
                                                    <p className="mt-1 text-slate-600 italic">"{rev.comment}"</p>
                                                    <p className="mt-1 text-[10px] text-slate-400">{rev.created_at}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic py-2">
                                            No verified reviews from completed bookings yet.
                                        </p>
                                    )}
                                </div>

                                {/* Recent Completed Bookings */}
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                                        Recent Completed Bookings ({selectedSupplier.recent_bookings?.length || 0})
                                    </h4>
                                    {selectedSupplier.recent_bookings?.length > 0 ? (
                                        <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                            {selectedSupplier.recent_bookings.map((booking) => (
                                                <div
                                                    key={booking.id}
                                                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs"
                                                >
                                                    <div>
                                                        <p className="font-bold text-slate-800">{booking.event_name}</p>
                                                        <p className="text-[10px] text-slate-400">
                                                            {booking.booking_reference} • {booking.item_name}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                                            Completed
                                                        </span>
                                                        <p className="text-[10px] text-slate-400 mt-0.5">{booking.event_date}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic py-2">
                                            No completed bookings recorded yet.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer Controls */}
                            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={() => setSelectedSupplier(null)}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                                >
                                    Close
                                </button>

                                <div className="flex items-center gap-2">
                                    {selectedSupplier.is_featured ? (
                                        <button
                                            type="button"
                                            onClick={() => handleUnfeature(selectedSupplier)}
                                            className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700"
                                        >
                                            Remove from Featured
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleFeature(selectedSupplier)}
                                            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700"
                                        >
                                            Feature This Supplier
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
}
