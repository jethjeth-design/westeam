import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';

export default function Index({
    portfolios = [],
    categories = [],
    filters = { search: '', category: 'all', status: 'all' },
}) {
    const { flash } = usePage().props;

    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');

    const [deletingPortfolio, setDeletingPortfolio] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Calculate quick stats
    const stats = useMemo(() => {
        const total = portfolios.length;
        const published = portfolios.filter((p) => p.is_published).length;
        const drafts = total - published;
        const featured = portfolios.filter((p) => p.is_featured).length;
        const totalPhotos = portfolios.reduce((acc, p) => acc + (p.images ? p.images.length : 0), 0);

        return { total, published, drafts, featured, totalPhotos };
    }, [portfolios]);

    // Client-side filtering
    const filteredPortfolios = useMemo(() => {
        return portfolios.filter((item) => {
            const matchesSearch =
                !search ||
                item.title?.toLowerCase().includes(search.toLowerCase()) ||
                item.client_name?.toLowerCase().includes(search.toLowerCase()) ||
                item.location?.toLowerCase().includes(search.toLowerCase());

            const matchesCategory =
                selectedCategory === 'all' ||
                String(item.event_category_id) === String(selectedCategory);

            const matchesStatus =
                selectedStatus === 'all' ||
                (selectedStatus === 'published' && item.is_published) ||
                (selectedStatus === 'draft' && !item.is_published) ||
                (selectedStatus === 'featured' && item.is_featured);

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [portfolios, search, selectedCategory, selectedStatus]);

    const openDeleteModal = (portfolio) => {
        setDeletingPortfolio(portfolio);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setDeletingPortfolio(null);
        setShowDeleteModal(false);
    };

    const confirmDelete = () => {
        if (!deletingPortfolio) return;
        setIsDeleting(true);

        router.delete(route('supplier.portfolio.destroy', deletingPortfolio.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleting(false);
                closeDeleteModal();
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <DashboardLayout>
            <Head title="My Portfolio - Supplier Dashboard" />

            <div className="min-h-screen bg-ivory/60 p-4 sm:p-6 lg:p-8">
                {/* Notification Flash */}
                {flash?.success && (
                    <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-emerald-800 shadow-xs">
                        <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm">
                                ✓
                            </span>
                            <p className="text-sm font-semibold">{flash.success}</p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-champagne px-2.5 py-1 text-xs font-bold text-darkgold ring-1 ring-inset ring-indigo-700/10">
                                📸 Showcase Works
                            </span>
                            <span className="text-xs text-warmgray">• Portfolio Galleries</span>
                        </div>
                        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-softcharcoal">
                            Portfolio Showcase
                        </h1>
                        <p className="mt-1 text-sm text-warmgray">
                            Showcase your past events, upload photo galleries, and attract more clients.
                        </p>
                    </div>

                    <Link
                        href={route('supplier.portfolio.create')}
                        className="inline-flex items-center gap-2 rounded-xl bg-champagnegold px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-darkgold active:scale-95"
                    >
                        <span className="text-lg font-bold leading-none">+</span>
                        <span>Add Portfolio Project</span>
                    </Link>
                </div>

                {/* Statistics Cards */}
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-5">
                    <div className="overflow-hidden rounded-2xl border border-warmbeige/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-warmgray">
                                Total Projects
                            </span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-champagne text-champagnegold font-bold">
                                📁
                            </div>
                        </div>
                        <p className="mt-3 text-2xl font-black text-softcharcoal">{stats.total}</p>
                        <p className="mt-0.5 text-xs text-warmgray">{stats.totalPhotos} photos uploaded</p>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-warmbeige/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-warmgray">
                                Published
                            </span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
                                🌐
                            </div>
                        </div>
                        <p className="mt-3 text-2xl font-black text-emerald-600">{stats.published}</p>
                        <p className="mt-0.5 text-xs text-warmgray">Visible to customers</p>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-warmbeige/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-warmgray">
                                Drafts
                            </span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 font-bold">
                                📝
                            </div>
                        </div>
                        <p className="mt-3 text-2xl font-black text-amber-600">{stats.drafts}</p>
                        <p className="mt-0.5 text-xs text-warmgray">Hidden from public</p>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-warmbeige/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-warmgray">
                                Featured
                            </span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 font-bold">
                                ⭐
                            </div>
                        </div>
                        <p className="mt-3 text-2xl font-black text-purple-600">{stats.featured}</p>
                        <p className="mt-0.5 text-xs text-warmgray">Highlighted on top</p>
                    </div>
                </div>

                {/* Filters & Search Controls */}
                <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-warmbeige/80 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-warmgray">
                                🔍
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by title, client, location..."
                                className="w-full rounded-xl border border-warmbeige bg-ivory/50 py-2 pl-9 pr-4 text-xs text-softcharcoal outline-none transition focus:border-champagnegold focus:bg-white focus:ring-2 focus:ring-champagne"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-warmgray hover:text-softcharcoal"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Category Dropdown */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="rounded-xl border border-warmbeige bg-ivory/50 px-3 py-2 text-xs text-softcharcoal outline-none transition focus:border-champagnegold focus:bg-white focus:ring-2 focus:ring-champagne"
                        >
                            <option value="all">All Event Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 rounded-xl bg-champagne p-1">
                        {[
                            { label: 'All', value: 'all' },
                            { label: 'Published', value: 'published' },
                            { label: 'Drafts', value: 'draft' },
                            { label: 'Featured', value: 'featured' },
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setSelectedStatus(tab.value)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                    selectedStatus === tab.value
                                        ? 'bg-white text-champagnegold shadow-xs'
                                        : 'text-softcharcoal hover:text-softcharcoal'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Portfolio Grid */}
                {filteredPortfolios.length > 0 ? (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredPortfolios.map((portfolio) => {
                            const coverUrl =
                                portfolio.cover_image_url ||
                                (portfolio.images && portfolio.images.length > 0
                                    ? portfolio.images[0].image_url
                                    : null);
                            const imageCount = portfolio.images ? portfolio.images.length : 0;

                            return (
                                <div
                                    key={portfolio.id}
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-warmbeige/80 bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-md"
                                >
                                    {/* Cover Image */}
                                    <div className="relative aspect-video w-full overflow-hidden bg-champagne">
                                        {coverUrl ? (
                                            <img
                                                src={coverUrl}
                                                alt={portfolio.title}
                                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                onError={(e) => {
                                                    e.currentTarget.src =
                                                        'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=60';
                                                }}
                                            />
                                        ) : (
                                            <div className="flex h-full w-full flex-col items-center justify-center text-warmgray bg-gradient-to-br from-indigo-50 to-champagne">
                                                <span className="text-3xl">🖼️</span>
                                                <span className="mt-1 text-xs font-semibold text-warmgray">No photos uploaded</span>
                                            </div>
                                        )}

                                        {/* Status Badges Overlay */}
                                        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
                                            {portfolio.is_published ? (
                                                <span className="rounded-md bg-emerald-600/90 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs backdrop-blur-xs">
                                                    ● Published
                                                </span>
                                            ) : (
                                                <span className="rounded-md bg-amber-600/90 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs backdrop-blur-xs">
                                                    Draft
                                                </span>
                                            )}

                                            {portfolio.is_featured && (
                                                <span className="rounded-md bg-purple-600/90 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs backdrop-blur-xs">
                                                    ⭐ Featured
                                                </span>
                                            )}

                                            {portfolio.video_url && (
                                                <span className="rounded-md bg-indigo-900/90 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs backdrop-blur-xs">
                                                    🎥 Video
                                                </span>
                                            )}
                                        </div>

                                        {/* Photos Count Badge */}
                                        <div className="absolute bottom-3 right-3 rounded-lg bg-black/65 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-xs">
                                            📸 {imageCount} {imageCount === 1 ? 'photo' : 'photos'}
                                        </div>

                                        {/* Category Badge */}
                                        {portfolio.event_category && (
                                            <div className="absolute bottom-3 left-3 rounded-lg bg-champagnegold/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-xs">
                                                {portfolio.event_category.name}
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Content */}
                                    <div className="flex flex-1 flex-col justify-between p-5">
                                        <div>
                                            <h3 className="line-clamp-1 text-base font-bold text-softcharcoal group-hover:text-champagnegold">
                                                {portfolio.title}
                                            </h3>

                                            {/* Details Meta */}
                                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-warmgray">
                                                {portfolio.event_date && (
                                                    <span className="flex items-center gap-1">
                                                        <span>📅</span>
                                                        <span>
                                                            {new Date(portfolio.event_date).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                            })}
                                                        </span>
                                                    </span>
                                                )}
                                                {portfolio.location && (
                                                    <span className="flex items-center gap-1">
                                                        <span>📍</span>
                                                        <span className="line-clamp-1">{portfolio.location}</span>
                                                    </span>
                                                )}
                                                {portfolio.client_name && (
                                                    <span className="flex items-center gap-1">
                                                        <span>👤</span>
                                                        <span>{portfolio.client_name}</span>
                                                    </span>
                                                )}
                                            </div>

                                            {portfolio.description && (
                                                <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-softcharcoal">
                                                    {portfolio.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions Footer */}
                                        <div className="mt-5 flex items-center justify-between border-t border-champagne pt-3.5">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route('supplier.portfolio.show', portfolio.id)}
                                                    className="inline-flex items-center gap-1 rounded-xl border border-warmbeige bg-white px-3 py-1.5 text-xs font-bold text-softcharcoal transition hover:border-indigo-200 hover:bg-champagne/50 hover:text-champagnegold shadow-2xs"
                                                >
                                                    <span>Show Portfolio</span>
                                                    <span>👁️</span>
                                                </Link>

                                                <Link
                                                    href={route('supplier.portfolio.edit', portfolio.id)}
                                                    className="rounded-xl border border-warmbeige bg-white px-3 py-1.5 text-xs font-semibold text-softcharcoal transition hover:bg-champagne hover:text-champagnegold"
                                                >
                                                    Edit
                                                </Link>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => openDeleteModal(portfolio)}
                                                className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-warmbeige bg-white p-12 text-center shadow-xs">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-champagne text-3xl">
                            📸
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-softcharcoal">
                            No portfolio projects found
                        </h3>
                        <p className="mt-1 max-w-sm text-xs text-warmgray">
                            {search || selectedCategory !== 'all' || selectedStatus !== 'all'
                                ? 'No projects match your current filters. Try adjusting your search query.'
                                : 'Start building your supplier portfolio! Upload photos of past events to impress prospective customers.'}
                        </p>
                        <div className="mt-6 flex gap-3">
                            <Link
                                href={route('supplier.portfolio.create')}
                                className="rounded-xl bg-champagnegold px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-darkgold"
                            >
                                + Create First Project
                            </Link>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && deletingPortfolio && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                        <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                            <div className="flex items-center gap-3 text-red-600">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-xl font-bold">
                                    🗑️
                                </span>
                                <h3 className="text-lg font-bold text-softcharcoal">
                                    Delete Portfolio Project?
                                </h3>
                            </div>

                            <p className="mt-3 text-xs text-softcharcoal leading-relaxed">
                                Are you sure you want to delete <strong className="text-softcharcoal">"{deletingPortfolio.title}"</strong>? All associated photos will be permanently deleted.
                            </p>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeDeleteModal}
                                    disabled={isDeleting}
                                    className="rounded-xl border border-warmbeige px-4 py-2 text-xs font-semibold text-softcharcoal hover:bg-ivory"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete Project'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
