import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';

export default function Index({
    packages = [],
    soloPackages = [],
    teamPackages = [],
    services = [],
}) {
    const [packageTab, setPackageTab] = useState('solo'); // 'solo' | 'team'
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
    const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price_asc' | 'price_desc' | 'name_asc'
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingPackage, setDeletingPackage] = useState(null);

    const activePackages = packageTab === 'team' ? teamPackages : soloPackages;

    const filteredPackages = useMemo(() => {
        let list = activePackages.filter((pkg) => {
            // Status match
            if (statusFilter === 'active' && !pkg.is_active) return false;
            if (statusFilter === 'inactive' && pkg.is_active) return false;

            // Search query match
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const nameMatch = (pkg.name || '').toLowerCase().includes(query);
                const descMatch = (pkg.description || '').toLowerCase().includes(query);
                const inclusionsMatch = (pkg.inclusions || '').toLowerCase().includes(query);
                const servicesMatch = (pkg.services || []).some((s) =>
                    (s.name || '').toLowerCase().includes(query)
                );

                if (!nameMatch && !descMatch && !inclusionsMatch && !servicesMatch) {
                    return false;
                }
            }

            return true;
        });

        // Sorting
        return list.sort((a, b) => {
            if (sortBy === 'price_asc') {
                return Number(a.price || 0) - Number(b.price || 0);
            }
            if (sortBy === 'price_desc') {
                return Number(b.price || 0) - Number(a.price || 0);
            }
            if (sortBy === 'name_asc') {
                return (a.name || '').localeCompare(b.name || '');
            }
            // default newest
            return (b.id || 0) - (a.id || 0);
        });
    }, [activePackages, searchQuery, statusFilter, sortBy]);

    const openDeleteModal = (pkg) => {
        setDeletingPackage(pkg);
        setShowDeleteModal(true);
    };

    const deletePackage = () => {
        if (!deletingPackage) return;
        router.delete(`/supplier/packages/${deletingPackage.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteModal(false);
                setDeletingPackage(null);
            },
        });
    };

    const toggleStatus = (pkg) => {
        router.put(
            `/supplier/packages/${pkg.id}`,
            {
                name: pkg.name,
                event_category_id: pkg.event_category_id,
                price: pkg.price,
                description: pkg.description,
                inclusions: pkg.inclusions,
                service_ids: pkg.services ? pkg.services.map((s) => s.id) : [],
                is_active: !pkg.is_active,
            },
            { preserveScroll: true }
        );
    };

    return (
        <DashboardLayout>
            <Head title="My Packages - Supplier Portal" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-softcharcoal">
                            My Packages
                        </h1>
                        <p className="mt-1 text-sm text-warmgray">
                            Create and manage bundled event packages to offer attractive deals to customers.
                        </p>
                    </div>

                    <Link
                        href={route('supplier.packages.create')}
                        className="inline-flex items-center gap-2 rounded-xl bg-champagnegold px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-darkgold active:scale-95"
                    >
                        <span className="text-lg leading-none">+</span>
                        Add New Package
                    </Link>
                </div>

                {/* Package Type Tabs */}
                <div className="mt-6 flex items-center gap-2">
                    <button
                        onClick={() => { setPackageTab('solo'); }}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                            packageTab === 'solo'
                                ? 'bg-champagnegold text-white shadow-sm'
                                : 'bg-white text-warmgray border border-warmbeige hover:bg-ivory'
                        }`}
                    >
                        🧑 Solo Packages
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                            packageTab === 'solo' ? 'bg-white/20 text-white' : 'bg-champagne text-darkgold'
                        }`}>
                            {soloPackages.length}
                        </span>
                    </button>
                    <button
                        onClick={() => { setPackageTab('team'); }}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                            packageTab === 'team'
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'bg-white text-warmgray border border-warmbeige hover:bg-ivory'
                        }`}
                    >
                        👥 Team Packages
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                            packageTab === 'team' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-700'
                        }`}>
                            {teamPackages.length}
                        </span>
                    </button>
                </div>

                {/* Live Search & Filter Bar */}
                <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-warmbeige/80 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
                    {/* Live Search Input */}
                    <div className="relative flex-1">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-gray-400">
                            🔍
                        </span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Live search by name, description, inclusions, or services..."
                            className="w-full rounded-xl border border-warmbeige py-2 pl-9 pr-8 text-xs text-softcharcoal shadow-xs outline-none focus:border-champagnegold focus:ring-2 focus:ring-champagne"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-gray-400 hover:text-warmgray"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Filter Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Status Filter Buttons */}
                        <div className="flex rounded-xl bg-champagne p-1">
                            <button
                                type="button"
                                onClick={() => setStatusFilter('all')}
                                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                                    statusFilter === 'all'
                                        ? 'bg-white text-champagnegold shadow-xs'
                                        : 'text-warmgray hover:text-softcharcoal'
                                }`}
                            >
                                All
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('active')}
                                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                                    statusFilter === 'active'
                                        ? 'bg-white text-emerald-600 shadow-xs'
                                        : 'text-warmgray hover:text-softcharcoal'
                                }`}
                            >
                                Active
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('inactive')}
                                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                                    statusFilter === 'inactive'
                                        ? 'bg-white text-softcharcoal shadow-xs'
                                        : 'text-warmgray hover:text-softcharcoal'
                                }`}
                            >
                                Inactive
                            </button>
                        </div>

                        {/* Sort Dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="rounded-xl border border-warmbeige py-1.5 pl-3 pr-8 text-xs font-semibold text-softcharcoal shadow-xs outline-none focus:border-champagnegold focus:ring-2 focus:ring-champagne"
                        >
                            <option value="newest">Sort: Newest First</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="name_asc">Name: A to Z</option>
                        </select>
                    </div>
                </div>

                {/* Package Cards Grid */}
                {filteredPackages.length > 0 ? (
                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredPackages.map((pkg) => {
                            const servicesTotal = (pkg.services || []).reduce(
                                (acc, s) => acc + Number(s.price || 0),
                                0
                            );
                            const savings = servicesTotal - Number(pkg.price || 0);

                            return (
                                <div
                                    key={pkg.id}
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-warmbeige bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-md"
                                >
                                    {/* Showcase Image Banner */}
                                    <div className="relative h-44 w-full overflow-hidden bg-gray-900">
                                        {pkg.image_path ? (
                                            <img
                                                src={pkg.image_path}
                                                alt={pkg.name}
                                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                            />
                                        ) : pkg.services && pkg.services[0]?.image_path ? (
                                            <img
                                                src={pkg.services[0].image_path}
                                                alt={pkg.name}
                                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-softcharcoal text-white">
                                                <span className="text-3xl">📦 💍</span>
                                                <span className="mt-1 text-xs text-white/70">
                                                    {pkg.event_category?.name || 'Package'}
                                                </span>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                        {/* Status Pill on top right */}
                                        <div className="absolute right-3 top-3">
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus(pkg)}
                                                className={`rounded-full px-2.5 py-0.5 text-xs font-bold shadow-xs backdrop-blur-xs transition ${
                                                    pkg.is_active
                                                        ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                                                        : 'bg-gray-800/80 text-gray-300 hover:bg-gray-800'
                                                }`}
                                            >
                                                {pkg.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </div>

                                        {/* Category Badge on top left */}
                                        <div className="absolute left-3 top-3">
                                            <span className="rounded-lg bg-white/90 px-2.5 py-1 text-xs font-bold text-darkgold shadow-xs backdrop-blur-xs">
                                                {pkg.event_category?.name || 'Package'}
                                            </span>
                                        </div>

                                        {/* Title in image overlay */}
                                        <div className="absolute bottom-3 left-3 right-3">
                                            <h3 className="truncate text-base font-bold text-white">
                                                {pkg.name}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="flex flex-1 flex-col justify-between p-5">
                                        <div className="space-y-3.5">
                                            {/* Description */}
                                            <p className="line-clamp-2 text-xs text-warmgray">
                                                {pkg.description || 'No description provided.'}
                                            </p>

                                            {/* Included Services list pills */}
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                                    Included Services ({(pkg.services || []).length})
                                                </p>
                                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                                    {(pkg.services || []).length > 0 ? (
                                                        pkg.services.map((service) => (
                                                            <span
                                                                key={service.id}
                                                                className="inline-flex items-center gap-1 rounded-md bg-champagne px-2 py-0.5 text-[11px] font-medium text-darkgold"
                                                            >
                                                                ✓ {service.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-400">
                                                            No services attached.
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Special Inclusions text */}
                                            {pkg.inclusions && (
                                                <div className="rounded-lg bg-ivory p-2.5 text-[11px] text-warmgray">
                                                    <span className="font-semibold text-softcharcoal">
                                                        Highlights:{' '}
                                                    </span>
                                                    <span className="line-clamp-1">{pkg.inclusions}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Price & Savings */}
                                        <div className="mt-5 border-t border-champagne pt-3.5">
                                            <div className="flex items-end justify-between">
                                                <div>
                                                    {servicesTotal > 0 && savings > 0 && (
                                                        <span className="block text-xs text-gray-400 line-through">
                                                            ₱
                                                            {servicesTotal.toLocaleString('en-PH', {
                                                                minimumFractionDigits: 2,
                                                            })}
                                                        </span>
                                                    )}
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className="text-lg font-extrabold text-softcharcoal">
                                                            ₱
                                                            {Number(pkg.price || 0).toLocaleString('en-PH', {
                                                                minimumFractionDigits: 2,
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>

                                                {savings > 0 && (
                                                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                                                        Save ₱{savings.toLocaleString('en-PH')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 border-t border-champagne bg-ivory/60 p-3">
                                        <Link
                                            href={route('supplier.packages.edit', pkg.id)}
                                            className="flex-1 rounded-xl border border-warmbeige bg-white py-2 text-center text-xs font-semibold text-softcharcoal transition hover:bg-champagne"
                                        >
                                            Edit Package
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => openDeleteModal(pkg)}
                                            className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="mt-8 rounded-2xl border-2 border-dashed border-warmbeige bg-white p-12 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-champagne text-2xl">
                            📦
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-softcharcoal">No packages found</h3>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-warmgray">
                            {searchQuery || statusFilter !== 'all'
                                ? 'No packages match your live search or filter criteria. Try adjusting your search.'
                                : 'Create your first package bundle and offer discounted service combinations to customers.'}
                        </p>
                        <Link
                            href={route('supplier.packages.create')}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-champagnegold px-5 py-2.5 text-sm font-semibold text-white hover:bg-darkgold"
                        >
                            + Create Package
                        </Link>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && deletingPackage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
                    onClick={() => setShowDeleteModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-2xl text-red-600">
                            🗑️
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-softcharcoal">Delete Package?</h3>
                        <p className="mt-2 text-sm text-warmgray">
                            Are you sure you want to delete{' '}
                            <strong className="text-softcharcoal">{deletingPackage.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                className="rounded-xl border border-warmbeige px-4 py-2 text-xs font-semibold text-softcharcoal hover:bg-ivory"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={deletePackage}
                                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                            >
                                Delete Package
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}