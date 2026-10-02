import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';

export default function Index({
    currentlyTop = [],
    qualifiedPending = [],
    allRankings = [],
    stats = {},
    categories = [],
    filters = {},
}) {
    const [activeTab, setActiveTab] = useState(filters.tab || 'top');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [detailTab, setDetailTab] = useState('reviews'); // 'reviews', 'bookings', 'details'
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [actionInProgress, setActionInProgress] = useState(null);

    // Search and filter submission
    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get(
            route('admin.top-packages.index'),
            {
                search: searchTerm,
                tab: activeTab,
                category_id: selectedCategory,
                status: selectedStatus,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedStatus('all');
        router.get(
            route('admin.top-packages.index'),
            { tab: activeTab },
            { preserveState: true, replace: true }
        );
    };

    // Tab switch
    const switchTab = (tabKey) => {
        setActiveTab(tabKey);
        router.get(
            route('admin.top-packages.index'),
            {
                search: searchTerm,
                tab: tabKey,
                category_id: selectedCategory,
                status: selectedStatus,
            },
            { preserveState: true, replace: true }
        );
    };

    // Recalculate automatic system rankings
    const handleRecalculate = () => {
        if (isRecalculating) return;
        setIsRecalculating(true);
        router.post(
            route('admin.top-packages.recalculate'),
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsRecalculating(false),
            }
        );
    };

    // Feature action
    const handleFeature = (pkg) => {
        setActionInProgress(pkg.id);
        router.post(
            route('admin.top-packages.feature', pkg.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setActionInProgress(null);
                    if (selectedPackage?.id === pkg.id) {
                        setSelectedPackage((prev) => ({
                            ...prev,
                            is_top_package: true,
                            is_ranking_excluded: false,
                        }));
                    }
                },
            }
        );
    };

    // Unfeature action
    const handleUnfeature = (pkg) => {
        setActionInProgress(pkg.id);
        router.post(
            route('admin.top-packages.unfeature', pkg.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setActionInProgress(null);
                    if (selectedPackage?.id === pkg.id) {
                        setSelectedPackage((prev) => ({
                            ...prev,
                            is_top_package: false,
                            is_ranking_excluded: true,
                        }));
                    }
                },
            }
        );
    };

    // Toggle Top Package status
    const handleToggleTop = (pkg) => {
        setActionInProgress(pkg.id);
        router.post(
            route('admin.top-packages.toggle', pkg.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setActionInProgress(null);
                    if (selectedPackage?.id === pkg.id) {
                        setSelectedPackage((prev) => ({
                            ...prev,
                            is_top_package: !prev.is_top_package,
                            is_ranking_excluded: prev.is_top_package,
                        }));
                    }
                },
            }
        );
    };

    // Restore to automatic evaluation
    const handleRestoreAuto = (pkg) => {
        setActionInProgress(pkg.id);
        router.post(
            route('admin.top-packages.restore-auto', pkg.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setActionInProgress(null);
                    if (selectedPackage?.id === pkg.id) {
                        setSelectedPackage((prev) => ({
                            ...prev,
                            is_ranking_excluded: false,
                        }));
                    }
                },
            }
        );
    };

    // Toggle active / disabled status
    const handleToggleActive = (pkg) => {
        setActionInProgress(pkg.id);
        router.post(
            route('admin.top-packages.toggle-active', pkg.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setActionInProgress(null);
                    if (selectedPackage?.id === pkg.id) {
                        setSelectedPackage((prev) => ({
                            ...prev,
                            is_active: !prev.is_active,
                        }));
                    }
                },
            }
        );
    };

    // Current dataset based on tab
    const currentList = useMemo(() => {
        if (activeTab === 'top') return currentlyTop;
        if (activeTab === 'qualified') return qualifiedPending;
        return allRankings;
    }, [activeTab, currentlyTop, qualifiedPending, allRankings]);

    // Star rating helper
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
                    <span key={`e-${i}`} className="text-sm text-warmbeige">★</span>
                ))}
            </div>
        );
    };

    return (
        <DashboardLayout>
            <Head title="Top Packages - Admin" />

            <div className="min-h-screen bg-ivory/60 p-4 sm:p-6 lg:p-8 space-y-6">

                {/* ========================================================================= */}
                {/* HEADER & QUICK ACTIONS                                                    */}
                {/* ========================================================================= */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-champagne px-2.5 py-1 text-xs font-bold text-darkgold ring-1 ring-inset ring-champagnegold/20">
                                <span>🏆</span>
                                <span>Admin Portal</span>
                            </span>
                            <span className="text-xs text-warmgray">• Performance & Discovery</span>
                        </div>
                        <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-softcharcoal">
                            Top Packages Management
                        </h1>
                        <p className="mt-1 text-sm text-warmgray">
                            Automatically evaluate and rank top-performing packages by ratings, reviews, and completed bookings with admin control.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={handleRecalculate}
                            disabled={isRecalculating}
                            className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-champagnegold to-darkgold px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-champagnegold/20 transition-all hover:from-indigo-700 hover:to-violet-700 active:scale-95 ${
                                isRecalculating ? 'opacity-75 cursor-not-allowed' : ''
                            }`}
                        >
                            <span className={`text-sm ${isRecalculating ? 'animate-spin' : ''}`}>🔄</span>
                            <span>{isRecalculating ? 'Recalculating...' : 'Recalculate & Sync Rankings'}</span>
                        </button>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* STATS OVERVIEW CARDS                                                      */}
                {/* ========================================================================= */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Currently Top Packages */}
                    <div className="rounded-2xl border border-champagne bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-warmgray">Top Packages</span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-base shadow-xs ring-1 ring-amber-500/20">
                                🏆
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-softcharcoal">{stats.total_top ?? 0}</span>
                            <span className="text-xs font-semibold text-emerald-600">Active spotlight</span>
                        </div>
                        <p className="mt-1 text-[11px] text-warmgray">
                            Packages currently marked as Top Packages
                        </p>
                    </div>

                    {/* Card 2: Qualified Candidates */}
                    <div className="rounded-2xl border border-champagne bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-warmgray">Qualified Candidates</span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-base shadow-xs ring-1 ring-emerald-500/20">
                                🎖️
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-softcharcoal">{stats.total_qualified ?? 0}</span>
                            <span className="text-xs font-semibold text-champagnegold">
                                {qualifiedPending.length} pending top
                            </span>
                        </div>
                        <p className="mt-1 text-[11px] text-warmgray">
                            Passed all 5 automated qualification rules
                        </p>
                    </div>

                    {/* Card 3: Total Evaluated Packages */}
                    <div className="rounded-2xl border border-champagne bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-warmgray">Active Packages</span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-base shadow-xs ring-1 ring-blue-500/20">
                                📦
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-softcharcoal">{stats.total_active ?? 0}</span>
                            <span className="text-xs text-warmgray">/ {stats.total_packages ?? 0} total</span>
                        </div>
                        <p className="mt-1 text-[11px] text-warmgray">
                            Enabled packages available for customer booking
                        </p>
                    </div>

                    {/* Card 4: Top Ranked Leader */}
                    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Top Ranked Leader</span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-base">
                                🥇
                            </span>
                        </div>
                        {stats.leader ? (
                            <div className="mt-3">
                                <p className="text-base font-black text-softcharcoal truncate" title={stats.leader.name}>
                                    {stats.leader.name}
                                </p>
                                <div className="mt-1 flex items-center gap-2 text-xs">
                                    <span className="font-bold text-amber-600">Score: {Number(stats.leader.score).toFixed(1)}</span>
                                    <span className="text-warmbeige">•</span>
                                    <span className="text-softcharcoal">{Number(stats.leader.rating).toFixed(1)} ★</span>
                                    <span className="text-warmbeige">•</span>
                                    <span className="text-warmgray truncate">{stats.leader.supplier_name}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-3 text-xs text-warmgray italic">No packages ranked yet</div>
                        )}
                        <p className="mt-1 text-[11px] text-amber-700/70">
                            Highest composite performance score
                        </p>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* QUALIFICATION CRITERIA CALLOUT BANNER                                     */}
                {/* ========================================================================= */}
                <div className="rounded-2xl border border-champagne bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-ivory p-4 sm:p-5 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-champagnegold text-white font-black text-sm shadow-sm">
                                📋
                            </span>
                            <div>
                                <h3 className="text-sm font-bold text-softcharcoal">
                                    Automatic Top Package Qualification Criteria
                                </h3>
                                <p className="text-xs text-warmgray mt-0.5">
                                    Packages must strictly satisfy all 5 requirements to qualify for automatic Top Package status:
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-softcharcoal shadow-xs border border-warmbeige">
                                <span className="text-emerald-500">✓</span> Active Package
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-softcharcoal shadow-xs border border-warmbeige">
                                <span className="text-emerald-500">✓</span> Approved Supplier
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-softcharcoal shadow-xs border border-warmbeige">
                                <span className="text-emerald-500">✓</span> ≥ 5 Completed Bookings
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-softcharcoal shadow-xs border border-warmbeige">
                                <span className="text-emerald-500">✓</span> ≥ 5 Reviews (Completed Only)
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-softcharcoal shadow-xs border border-warmbeige">
                                <span className="text-emerald-500">✓</span> ≥ 4.5 ★ Rating
                            </span>
                        </div>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* SEARCH, CATEGORY, STATUS & NAVIGATION TABS                                */}
                {/* ========================================================================= */}
                <div className="rounded-2xl border border-warmbeige bg-white p-4 shadow-xs space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Tabs */}
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => switchTab('top')}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                                    activeTab === 'top'
                                        ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                                        : 'bg-champagne text-softcharcoal hover:bg-warmbeige/80'
                                }`}
                            >
                                <span>🏆 Top Packages</span>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                                    activeTab === 'top' ? 'bg-white/20 text-white' : 'bg-warmbeige text-softcharcoal'
                                }`}>
                                    {currentlyTop.length}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => switchTab('qualified')}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                                    activeTab === 'qualified'
                                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                                        : 'bg-champagne text-softcharcoal hover:bg-warmbeige/80'
                                }`}
                            >
                                <span>🎖️ Qualified Candidates</span>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                                    activeTab === 'qualified' ? 'bg-white/20 text-white' : 'bg-warmbeige text-softcharcoal'
                                }`}>
                                    {qualifiedPending.length}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => switchTab('all')}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                                    activeTab === 'all'
                                        ? 'bg-champagnegold text-white shadow-sm shadow-champagnegold/30'
                                        : 'bg-champagne text-softcharcoal hover:bg-warmbeige/80'
                                }`}
                            >
                                <span>📊 All Ranked Packages</span>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                                    activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-warmbeige text-softcharcoal'
                                }`}>
                                    {allRankings.length}
                                </span>
                            </button>
                        </div>

                        {/* Search & Filters */}
                        <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search package, supplier, category..."
                                    className="w-60 rounded-xl border border-warmbeige bg-ivory/50 py-2 pl-8 pr-3 text-xs text-softcharcoal placeholder:text-warmgray focus:border-champagnegold focus:bg-white focus:outline-none focus:ring-2 focus:ring-champagne transition"
                                />
                                <span className="absolute left-2.5 top-2.5 text-xs text-warmgray">🔍</span>
                            </div>

                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="rounded-xl border border-warmbeige bg-ivory/50 py-2 px-3 text-xs text-softcharcoal focus:border-champagnegold focus:bg-white focus:outline-none focus:ring-2 focus:ring-champagne transition"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>

                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="rounded-xl border border-warmbeige bg-ivory/50 py-2 px-3 text-xs text-softcharcoal focus:border-champagnegold focus:bg-white focus:outline-none focus:ring-2 focus:ring-champagne transition"
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Disabled Only</option>
                            </select>

                            <button
                                type="submit"
                                className="rounded-xl bg-champagnegold px-3.5 py-2 text-xs font-bold text-white hover:bg-darkgold transition"
                            >
                                Filter
                            </button>

                            {(searchTerm || selectedCategory || selectedStatus !== 'all') && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="rounded-xl border border-warmbeige px-3 py-2 text-xs font-semibold text-warmgray hover:bg-ivory transition"
                                >
                                    Reset
                                </button>
                            )}
                        </form>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* PACKAGES TABLE                                                            */}
                {/* ========================================================================= */}
                <div className="overflow-hidden rounded-2xl border border-warmbeige bg-white shadow-xs">
                    {currentList.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-champagne bg-ivory/80 text-[11px] font-bold uppercase tracking-wider text-warmgray">
                                    <tr>
                                        <th className="px-4 py-3.5 w-14">Rank</th>
                                        <th className="px-4 py-3.5">Package Details</th>
                                        <th className="px-4 py-3.5">Supplier</th>
                                        <th className="px-4 py-3.5">Price</th>
                                        <th className="px-4 py-3.5">Customer Rating</th>
                                        <th className="px-4 py-3.5">Bookings</th>
                                        <th className="px-4 py-3.5">Top Score</th>
                                        <th className="px-4 py-3.5">Status</th>
                                        <th className="px-4 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-champagne text-softcharcoal">
                                    {currentList.map((pkg) => {
                                        const isRankTop3 = pkg.rank <= 3;
                                        return (
                                            <tr
                                                key={pkg.id}
                                                className={`transition hover:bg-ivory/80 ${
                                                    pkg.is_top_package ? 'bg-amber-50/20' : ''
                                                }`}
                                            >
                                                {/* Rank */}
                                                <td className="px-4 py-3.5">
                                                    <span
                                                        className={`inline-flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black shadow-xs ${
                                                            pkg.rank === 1
                                                                ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-500/30'
                                                                : pkg.rank === 2
                                                                ? 'bg-warmbeige text-softcharcoal ring-1 ring-warmgray/30'
                                                                : pkg.rank === 3
                                                                ? 'bg-amber-700/20 text-amber-900 ring-1 ring-amber-800/20'
                                                                : 'bg-champagne text-softcharcoal'
                                                        }`}
                                                    >
                                                        {pkg.rank === 1 ? '🥇' : pkg.rank === 2 ? '🥈' : pkg.rank === 3 ? '🥉' : `#${pkg.rank}`}
                                                    </span>
                                                </td>

                                                {/* Package Details */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-warmbeige bg-champagne flex items-center justify-center">
                                                            {pkg.image_path ? (
                                                                <img
                                                                    src={`/storage/${pkg.image_path}`}
                                                                    alt={pkg.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-xl">📦</span>
                                                            )}
                                                        </div>
                                                        <div className="max-w-xs">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <span className="font-extrabold text-softcharcoal text-sm hover:text-champagnegold transition cursor-pointer"
                                                                    onClick={() => setSelectedPackage(pkg)}
                                                                >
                                                                    {pkg.name}
                                                                </span>
                                                                {pkg.is_top_package && (
                                                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                                                        🏆 Top
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="mt-1 flex items-center gap-2 text-[11px] text-warmgray">
                                                                {pkg.event_category && (
                                                                    <span className="font-semibold text-softcharcoal">
                                                                        {pkg.event_category.name}
                                                                    </span>
                                                                )}
                                                                <span>•</span>
                                                                <span>{pkg.team ? '👥 Team Package' : '🧑 Solo Package'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Supplier */}
                                                <td className="px-4 py-3.5">
                                                    <div>
                                                        <p className="font-bold text-softcharcoal text-xs">
                                                            {pkg.supplier.business_name}
                                                        </p>
                                                        <p className="text-[11px] text-warmgray">
                                                            {pkg.supplier.name}
                                                        </p>
                                                        <span className={`inline-block mt-0.5 text-[9px] font-bold ${
                                                            pkg.supplier.status === 'approved' ? 'text-emerald-600' : 'text-amber-600'
                                                        }`}>
                                                            {pkg.supplier.status === 'approved' ? '✓ Approved Supplier' : 'Pending Verification'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Price */}
                                                <td className="px-4 py-3.5">
                                                    <span className="font-black text-softcharcoal text-sm">
                                                        ₱{Number(pkg.price).toLocaleString()}
                                                    </span>
                                                </td>

                                                {/* Rating & Reviews */}
                                                <td className="px-4 py-3.5">
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            {renderStars(pkg.average_rating)}
                                                            <span className="font-black text-softcharcoal text-xs">
                                                                {Number(pkg.average_rating).toFixed(1)}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-warmgray mt-0.5">
                                                            {pkg.reviews_count} verified {pkg.reviews_count === 1 ? 'review' : 'reviews'}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Bookings */}
                                                <td className="px-4 py-3.5">
                                                    <div>
                                                        <span className="font-bold text-softcharcoal text-xs">
                                                            {pkg.completed_bookings_count} completed
                                                        </span>
                                                        {pkg.recent_bookings_count > 0 && (
                                                            <p className="text-[10px] font-semibold text-champagnegold mt-0.5">
                                                                +{pkg.recent_bookings_count} recent (60d)
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Score */}
                                                <td className="px-4 py-3.5">
                                                    <div className="inline-flex flex-col">
                                                        <span className="inline-flex items-center gap-1 rounded-lg bg-champagne px-2.5 py-1 text-xs font-black text-darkgold ring-1 ring-inset ring-champagnegold/20">
                                                            <span>⭐</span>
                                                            <span>{Number(pkg.top_score).toFixed(1)}</span>
                                                        </span>
                                                        <span className="text-[9px] text-warmgray mt-0.5 text-center">
                                                            Score pts
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Status Badges */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${
                                                                pkg.is_active
                                                                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                                                    : 'bg-rose-50 text-rose-700 ring-rose-600/20'
                                                            }`}
                                                        >
                                                            {pkg.is_active ? '● Active' : '○ Disabled'}
                                                        </span>

                                                        {pkg.is_qualified ? (
                                                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700 ring-1 ring-inset ring-blue-600/20">
                                                                ✓ Qualified 5/5
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-full bg-champagne px-2 py-0.5 text-[9px] font-medium text-warmgray">
                                                                Pending criteria
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                        {/* Feature / Unfeature Button */}
                                                        {pkg.is_top_package ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUnfeature(pkg)}
                                                                disabled={actionInProgress === pkg.id}
                                                                className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-800 hover:bg-amber-100 transition active:scale-95"
                                                                title="Remove from Top Packages"
                                                            >
                                                                Remove Top
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleFeature(pkg)}
                                                                disabled={actionInProgress === pkg.id}
                                                                className="rounded-lg bg-amber-500 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-amber-600 transition shadow-xs active:scale-95"
                                                                title="Mark as Top Package"
                                                            >
                                                                Make Top
                                                            </button>
                                                        )}

                                                        {/* Enable / Disable Package */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleActive(pkg)}
                                                            disabled={actionInProgress === pkg.id}
                                                            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition active:scale-95 ${
                                                                pkg.is_active
                                                                    ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                                                                    : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                            }`}
                                                            title={pkg.is_active ? 'Disable this package' : 'Enable this package'}
                                                        >
                                                            {pkg.is_active ? 'Disable' : 'Enable'}
                                                        </button>

                                                        {/* Restore Auto button if excluded */}
                                                        {pkg.is_ranking_excluded && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRestoreAuto(pkg)}
                                                                disabled={actionInProgress === pkg.id}
                                                                className="rounded-lg border border-warmbeige bg-white px-2 py-1.5 text-[10px] font-semibold text-softcharcoal hover:bg-ivory transition"
                                                                title="Restore automatic qualification evaluation"
                                                            >
                                                                Auto
                                                            </button>
                                                        )}

                                                        {/* View Details */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedPackage(pkg);
                                                                setDetailTab('reviews');
                                                            }}
                                                            className="rounded-lg border border-warmbeige bg-white px-2.5 py-1.5 text-[11px] font-semibold text-softcharcoal hover:bg-ivory transition"
                                                        >
                                                            Details
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <span className="text-4xl">🏆</span>
                            <h3 className="mt-3 text-sm font-bold text-softcharcoal">No packages match the current criteria</h3>
                            <p className="mt-1 text-xs text-warmgray">
                                Try changing your search keywords, event category filter, or switch tabs above.
                            </p>
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="mt-4 inline-flex items-center rounded-xl bg-champagnegold px-4 py-2 text-xs font-bold text-white hover:bg-darkgold"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* ========================================================================= */}
                {/* PACKAGE DETAIL & VERIFICATION DRAWER / MODAL                              */}
                {/* ========================================================================= */}
                {selectedPackage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-softcharcoal/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                        <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

                            {/* Modal Header */}
                            <div className="relative bg-gradient-to-r from-indigo-900 via-softcharcoal to-indigo-950 p-6 text-white">
                                <button
                                    type="button"
                                    onClick={() => setSelectedPackage(null)}
                                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/40"
                                >
                                    ✕
                                </button>

                                <div className="flex items-start gap-4 pr-10">
                                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white/40 bg-white/10 flex items-center justify-center shadow-md">
                                        {selectedPackage.image_path ? (
                                            <img
                                                src={`/storage/${selectedPackage.image_path}`}
                                                alt={selectedPackage.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-3xl">📦</span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-lg font-black leading-tight drop-shadow-xs">
                                                {selectedPackage.name}
                                            </h3>
                                            {selectedPackage.is_top_package && (
                                                <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-softcharcoal">
                                                    🏆 TOP PACKAGE
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-0.5 text-xs text-indigo-200">
                                            By {selectedPackage.supplier.business_name} • {selectedPackage.event_category?.name || 'Package'}
                                        </p>
                                        <p className="mt-1 text-sm font-black text-amber-300">
                                            ₱{Number(selectedPackage.price).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Action Bar */}
                            <div className="flex items-center justify-between border-b border-champagne bg-ivory px-6 py-2.5 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${
                                        selectedPackage.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`} />
                                    <span className="font-bold text-softcharcoal">
                                        {selectedPackage.is_active ? 'Package is Active' : 'Package is Disabled'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {selectedPackage.is_top_package ? (
                                        <button
                                            type="button"
                                            onClick={() => handleUnfeature(selectedPackage)}
                                            className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition"
                                        >
                                            Remove from Top
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleFeature(selectedPackage)}
                                            className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-white hover:bg-amber-600 transition"
                                        >
                                            Set as Top Package
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => handleToggleActive(selectedPackage)}
                                        className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                                            selectedPackage.is_active
                                                ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                                                : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                        }`}
                                    >
                                        {selectedPackage.is_active ? 'Disable Package' : 'Enable Package'}
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-5">

                                {/* Performance Matrix */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="rounded-2xl border border-champagne bg-ivory/80 p-3 text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-warmgray">Rating</p>
                                        <p className="mt-1 text-base font-black text-softcharcoal">
                                            {Number(selectedPackage.average_rating).toFixed(1)} ★
                                        </p>
                                        <span className="text-[9px] text-warmgray">Rule ≥ 4.5 ★</span>
                                    </div>
                                    <div className="rounded-2xl border border-champagne bg-ivory/80 p-3 text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-warmgray">Reviews</p>
                                        <p className="mt-1 text-base font-black text-softcharcoal">
                                            {selectedPackage.reviews_count}
                                        </p>
                                        <span className="text-[9px] text-warmgray">Rule ≥ 5 reviews</span>
                                    </div>
                                    <div className="rounded-2xl border border-champagne bg-ivory/80 p-3 text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-warmgray">Completed</p>
                                        <p className="mt-1 text-base font-black text-softcharcoal">
                                            {selectedPackage.completed_bookings_count}
                                        </p>
                                        <span className="text-[9px] text-warmgray">Rule ≥ 5 bookings</span>
                                    </div>
                                    <div className="rounded-2xl border border-champagne bg-champagne/50 p-3 text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-champagnegold">Top Score</p>
                                        <p className="mt-1 text-base font-black text-darkgold">
                                            {Number(selectedPackage.top_score).toFixed(1)}
                                        </p>
                                        <span className="text-[9px] text-champagnegold">Rank #{selectedPackage.rank}</span>
                                    </div>
                                </div>

                                {/* 5-Point Qualification Checklist */}
                                <div className="rounded-2xl border border-warmbeige bg-ivory/50 p-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-softcharcoal mb-2.5">
                                        Top Package Qualification Checklist
                                    </h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="text-softcharcoal">1. Package is Active</span>
                                            <span className={`font-bold ${selectedPackage.criteria?.is_active ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {selectedPackage.criteria?.is_active ? '✓ Passed (Active)' : '✕ Disabled'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-softcharcoal">2. Belongs to Approved Supplier</span>
                                            <span className={`font-bold ${selectedPackage.criteria?.supplier_is_approved ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {selectedPackage.criteria?.supplier_is_approved ? '✓ Passed (Approved)' : '✕ Pending/Unapproved'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-softcharcoal">3. At least 5 Completed Bookings</span>
                                            <span className={`font-bold ${selectedPackage.criteria?.has_enough_bookings ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {selectedPackage.criteria?.has_enough_bookings
                                                    ? `✓ Passed (${selectedPackage.completed_bookings_count}/5)`
                                                    : `✕ Incomplete (${selectedPackage.completed_bookings_count}/5)`}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-softcharcoal">4. At least 5 Reviews (Completed Bookings Only)</span>
                                            <span className={`font-bold ${selectedPackage.criteria?.has_enough_reviews ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {selectedPackage.criteria?.has_enough_reviews
                                                    ? `✓ Passed (${selectedPackage.reviews_count}/5)`
                                                    : `✕ Incomplete (${selectedPackage.reviews_count}/5)`}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-softcharcoal">5. Average Rating of at least 4.5 Stars</span>
                                            <span className={`font-bold ${selectedPackage.criteria?.has_high_rating ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {selectedPackage.criteria?.has_high_rating
                                                    ? `✓ Passed (${Number(selectedPackage.average_rating).toFixed(1)}/5.0)`
                                                    : `✕ Below 4.5 ★ (${Number(selectedPackage.average_rating).toFixed(1)}/5.0)`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Internal Tabs: Reviews vs Bookings vs Package Info */}
                                <div className="border-b border-warmbeige">
                                    <div className="flex items-center gap-4 text-xs font-bold">
                                        <button
                                            type="button"
                                            onClick={() => setDetailTab('reviews')}
                                            className={`pb-2 transition ${
                                                detailTab === 'reviews'
                                                    ? 'border-b-2 border-champagnegold text-champagnegold'
                                                    : 'text-warmgray hover:text-softcharcoal'
                                            }`}
                                        >
                                            Customer Reviews ({selectedPackage.recent_reviews?.length || 0})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDetailTab('bookings')}
                                            className={`pb-2 transition ${
                                                detailTab === 'bookings'
                                                    ? 'border-b-2 border-champagnegold text-champagnegold'
                                                    : 'text-warmgray hover:text-softcharcoal'
                                            }`}
                                        >
                                            Completed Bookings ({selectedPackage.recent_bookings?.length || 0})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDetailTab('details')}
                                            className={`pb-2 transition ${
                                                detailTab === 'details'
                                                    ? 'border-b-2 border-champagnegold text-champagnegold'
                                                    : 'text-warmgray hover:text-softcharcoal'
                                            }`}
                                        >
                                            Package Specifications
                                        </button>
                                    </div>
                                </div>

                                {/* Tab Content 1: Reviews */}
                                {detailTab === 'reviews' && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-xs text-warmgray">
                                            <span>Showing verified reviews from completed bookings:</span>
                                            <span>Only approved reviews count towards ranking</span>
                                        </div>
                                        {selectedPackage.recent_reviews && selectedPackage.recent_reviews.length > 0 ? (
                                            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                                                {selectedPackage.recent_reviews.map((rev) => (
                                                    <div
                                                        key={rev.id}
                                                        className="rounded-xl border border-champagne bg-ivory/60 p-3 text-xs"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-softcharcoal">
                                                                    {rev.customer_name}
                                                                </span>
                                                                <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                                                                    Verified Booking
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-black text-amber-500">
                                                                    {rev.rating} ★
                                                                </span>
                                                                <span className="text-[10px] text-warmgray">
                                                                    {rev.created_at}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="mt-1.5 text-softcharcoal italic">
                                                            "{rev.comment}"
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border border-dashed border-warmbeige p-6 text-center text-xs text-warmgray">
                                                No customer reviews recorded from completed bookings yet.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tab Content 2: Bookings */}
                                {detailTab === 'bookings' && (
                                    <div className="space-y-3">
                                        <div className="text-xs text-warmgray">
                                            Showing recent completed bookings for this package:
                                        </div>
                                        {selectedPackage.recent_bookings && selectedPackage.recent_bookings.length > 0 ? (
                                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                                {selectedPackage.recent_bookings.map((bk) => (
                                                    <div
                                                        key={bk.id}
                                                        className="flex items-center justify-between rounded-xl border border-champagne bg-ivory/60 p-3 text-xs"
                                                    >
                                                        <div>
                                                            <span className="font-mono font-bold text-darkgold">
                                                                {bk.booking_reference}
                                                            </span>
                                                            <p className="font-semibold text-softcharcoal mt-0.5">
                                                                {bk.event_name}
                                                            </p>
                                                            <p className="text-[10px] text-warmgray">
                                                                Customer: {bk.customer_name} • Date: {bk.event_date}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                                                                Completed
                                                            </span>
                                                            <p className="text-xs font-bold text-softcharcoal mt-1">
                                                                ₱{Number(bk.unit_price).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border border-dashed border-warmbeige p-6 text-center text-xs text-warmgray">
                                                No completed bookings recorded for this package yet.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tab Content 3: Package Specifications & Inclusions */}
                                {detailTab === 'details' && (
                                    <div className="space-y-4 text-xs">
                                        {selectedPackage.description && (
                                            <div>
                                                <h5 className="font-bold uppercase tracking-wider text-warmgray text-[10px]">
                                                    Description
                                                </h5>
                                                <p className="mt-1 text-softcharcoal whitespace-pre-line leading-relaxed">
                                                    {selectedPackage.description}
                                                </p>
                                            </div>
                                        )}

                                        {selectedPackage.inclusions && (
                                            <div>
                                                <h5 className="font-bold uppercase tracking-wider text-warmgray text-[10px]">
                                                    Package Inclusions
                                                </h5>
                                                <div className="mt-1.5 rounded-xl border border-warmbeige bg-ivory/50 p-3">
                                                    <p className="text-softcharcoal whitespace-pre-line leading-relaxed">
                                                        {selectedPackage.inclusions}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="rounded-xl border border-champagne bg-ivory/80 p-3">
                                            <h5 className="font-bold uppercase tracking-wider text-warmgray text-[10px] mb-1.5">
                                                Supplier Profile & Contact
                                            </h5>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <span className="text-warmgray">Business Name:</span>
                                                    <p className="font-semibold text-softcharcoal">{selectedPackage.supplier.business_name}</p>
                                                </div>
                                                <div>
                                                    <span className="text-warmgray">Email:</span>
                                                    <p className="font-semibold text-softcharcoal">{selectedPackage.supplier.email}</p>
                                                </div>
                                                <div>
                                                    <span className="text-warmgray">Contact:</span>
                                                    <p className="font-semibold text-softcharcoal">{selectedPackage.supplier.contact_number || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-warmgray">Supplier Status:</span>
                                                    <p className="font-semibold text-emerald-600">{selectedPackage.supplier.status}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="border-t border-champagne bg-ivory px-6 py-3 text-right">
                                <button
                                    type="button"
                                    onClick={() => setSelectedPackage(null)}
                                    className="rounded-xl bg-softcharcoal px-4 py-2 text-xs font-bold text-white hover:bg-softcharcoal transition"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
