import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ notifications, counts, filters = {} }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.filter || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');

    const handleFilterChange = (newStatus, newCategory, newSearch) => {
        router.get(
            route('notifications.index'),
            {
                filter: newStatus ?? statusFilter,
                category: newCategory ?? categoryFilter,
                search: newSearch ?? search,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleFilterChange(statusFilter, categoryFilter, search);
    };

    const handleMarkAllRead = () => {
        router.post(
            route('notifications.mark-all-read'),
            {},
            { preserveScroll: true }
        );
    };

    const handleClearRead = () => {
        if (confirm('Are you sure you want to clear all read notifications?')) {
            router.post(
                route('notifications.clear-read'),
                {},
                { preserveScroll: true }
            );
        }
    };

    const handleMarkAsRead = (id) => {
        router.post(
            route('notifications.mark-as-read', id),
            {},
            { preserveScroll: true, preserveState: true }
        );
    };

    const handleDelete = (id) => {
        router.delete(
            route('notifications.destroy', id),
            { preserveScroll: true, preserveState: true }
        );
    };

    const categories = [
        { key: 'all', label: 'All Categories', icon: '🔔' },
        { key: 'booking', label: 'Bookings', icon: '📅' },
        { key: 'payment', label: 'Payments', icon: '💳' },
        { key: 'message', label: 'Messages', icon: '💬' },
        { key: 'review', label: 'Reviews', icon: '⭐' },
        { key: 'supplier', label: 'Suppliers', icon: '🏢' },
        { key: 'team', label: 'Teams', icon: '👥' },
        { key: 'customer', label: 'Customers', icon: '👤' },
        { key: 'system', label: 'System', icon: '🛡️' },
    ];

    const getCategoryBadge = (category) => {
        switch (category) {
            case 'booking':
                return { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: '📅', label: 'Booking' };
            case 'payment':
                return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '💳', label: 'Payment' };
            case 'message':
                return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '💬', label: 'Message' };
            case 'review':
                return { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: '⭐', label: 'Review' };
            case 'supplier':
                return { bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: '🏢', label: 'Supplier' };
            case 'team':
                return { bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: '👥', label: 'Team' };
            case 'customer':
                return { bg: 'bg-teal-50 text-teal-700 border-teal-200', icon: '👤', label: 'Customer' };
            default:
                return { bg: 'bg-champagne/60 text-darkgold border-warmbeige', icon: '🔔', label: 'System' };
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin':
                return '🛡️ Admin Portal';
            case 'supplier':
                return '💼 Supplier Portal';
            case 'customer':
                return '🎉 Customer Portal';
            default:
                return '🔔 Notification Portal';
        }
    };

    const notificationItems = notifications?.data || [];

    return (
        <DashboardLayout>
            <Head title="Notification Center - Westeam" />

            <div className="min-h-screen bg-ivory/60 p-4 sm:p-6 lg:p-10">
                {/* Header Section */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-champagne px-2.5 py-1 text-xs font-bold text-darkgold ring-1 ring-inset ring-indigo-700/10">
                                {getRoleBadge(user?.role)}
                            </span>
                            <span className="text-xs text-warmgray">• Notification Center</span>
                        </div>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-softcharcoal">
                            Notification Center
                        </h1>
                        <p className="mt-1 text-sm text-warmgray">
                            Review your booking alerts, payment verifications, inquiries, and platform notices.
                        </p>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {counts?.unread > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                className="inline-flex items-center gap-1.5 rounded-2xl bg-champagnegold px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-darkgold active:scale-95"
                            >
                                <span>✓</span>
                                <span>Mark all as read ({counts.unread})</span>
                            </button>
                        )}

                        {counts?.read > 0 && (
                            <button
                                type="button"
                                onClick={handleClearRead}
                                className="inline-flex items-center gap-1.5 rounded-2xl border border-warmbeige bg-white px-4 py-2.5 text-xs font-bold text-warmgray shadow-2xs transition hover:bg-red-50 hover:text-red-700 hover:border-red-200 active:scale-95"
                            >
                                <span>🗑️</span>
                                <span>Clear read</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters & Search Control Card */}
                <div className="mt-8 rounded-3xl border border-warmbeige/80 bg-white p-5 shadow-xs">
                    {/* Top Row: Search & Status Tabs */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                        {/* Status Tabs */}
                        <div className="flex items-center gap-1.5 bg-ivory/60 p-1 rounded-2xl border border-warmbeige/40">
                            {[
                                { key: 'all', label: 'All', count: counts?.all || 0 },
                                { key: 'unread', label: 'Unread', count: counts?.unread || 0 },
                                { key: 'read', label: 'Read', count: counts?.read || 0 },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => {
                                        setStatusFilter(tab.key);
                                        handleFilterChange(tab.key, categoryFilter, search);
                                    }}
                                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${statusFilter === tab.key
                                        ? 'bg-white text-darkgold shadow-xs ring-1 ring-warmbeige/60'
                                        : 'text-warmgray hover:text-softcharcoal'
                                        }`}
                                >
                                    <span>{tab.label}</span>
                                    <span
                                        className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${statusFilter === tab.key
                                            ? 'bg-champagnegold/20 text-darkgold'
                                            : 'bg-warmgray/15 text-warmgray'
                                            }`}
                                    >
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Search Bar */}
                        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search notifications by keyword..."
                                className="w-full rounded-2xl border-warmbeige/80 bg-ivory/30 pl-10 pr-10 text-xs font-medium text-softcharcoal placeholder-warmgray/70 focus:border-champagnegold focus:ring-champagnegold"
                            />
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-warmgray">
                                🔍
                            </span>
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        handleFilterChange(statusFilter, categoryFilter, '');
                                    }}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-warmgray hover:text-softcharcoal"
                                >
                                    ✕
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Bottom Row: Category Chips */}
                    <div className="mt-4 pt-4 border-t border-warmbeige/30 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-warmbeige">
                        {categories.map((cat) => (
                            <button
                                key={cat.key}
                                type="button"
                                onClick={() => {
                                    setCategoryFilter(cat.key);
                                    handleFilterChange(statusFilter, cat.key, search);
                                }}
                                className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${categoryFilter === cat.key
                                    ? 'bg-champagnegold text-white shadow-xs font-bold'
                                    : 'bg-champagne/40 text-softcharcoal hover:bg-champagne/80'
                                    }`}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notifications Cards Container */}
                <div className="mt-6 space-y-3">
                    {notificationItems.length === 0 ? (
                        <div className="rounded-3xl border border-warmbeige/80 bg-white p-12 text-center shadow-xs">
                            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-champagne/50 text-3xl">
                                🔔
                            </div>
                            <h3 className="text-base font-extrabold text-softcharcoal">No notifications found</h3>
                            <p className="mt-1 text-xs text-warmgray max-w-sm mx-auto">
                                {statusFilter === 'unread'
                                    ? 'Great job! You have no unread notifications right now.'
                                    : 'There are no notifications matching your current filters.'}
                            </p>
                            {(statusFilter !== 'all' || categoryFilter !== 'all' || search) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStatusFilter('all');
                                        setCategoryFilter('all');
                                        setSearch('');
                                        handleFilterChange('all', 'all', '');
                                    }}
                                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-champagne px-4 py-2 text-xs font-bold text-darkgold hover:bg-champagne/80 transition"
                                >
                                    Reset all filters
                                </button>
                            )}
                        </div>
                    ) : (
                        notificationItems.map((n) => {
                            const badge = getCategoryBadge(n.category);

                            return (
                                <div
                                    key={n.id}
                                    className={`group relative rounded-3xl border transition duration-150 p-5 shadow-xs hover:shadow-md ${!n.read
                                        ? 'border-champagnegold/40 bg-white ring-1 ring-champagnegold/20'
                                        : 'border-warmbeige/70 bg-white/95'
                                        }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        {/* Left / Main info */}
                                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                            {/* Category Avatar */}
                                            <div
                                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl border shadow-2xs ${badge.bg}`}
                                            >
                                                {n.icon || badge.icon}
                                            </div>

                                            {/* Text Content */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${badge.bg}`}
                                                    >
                                                        {badge.label}
                                                    </span>

                                                    {!n.read && (
                                                        <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-black text-amber-700 ring-1 ring-amber-500/20">
                                                            NEW
                                                        </span>
                                                    )}

                                                    <span className="text-[11px] text-warmgray font-medium">
                                                        • {n.created_at_human}
                                                    </span>
                                                </div>

                                                <h2
                                                    className={`text-sm tracking-tight leading-snug ${!n.read
                                                        ? 'font-black text-softcharcoal'
                                                        : 'font-bold text-softcharcoal/90'
                                                        }`}
                                                >
                                                    {n.title}
                                                </h2>

                                                <p className="mt-1 text-xs text-warmgray leading-relaxed">
                                                    {n.message}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right Action Buttons */}
                                        <div className="flex items-center sm:self-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-warmbeige/30">
                                            {/* Open Target Button */}
                                            <Link
                                                href={route('notifications.go', n.id)}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-champagne px-3.5 py-2 text-xs font-bold text-darkgold hover:bg-champagnegold hover:text-white transition active:scale-95 shadow-2xs"
                                            >
                                                <span>Open Details</span>
                                                <span>→</span>
                                            </Link>

                                            {/* Mark read toggle */}
                                            {!n.read ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleMarkAsRead(n.id)}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-warmbeige/70 text-warmgray hover:bg-champagne/60 hover:text-darkgold transition"
                                                    title="Mark as read"
                                                >
                                                    ✓
                                                </button>
                                            ) : (
                                                <span
                                                    className="inline-flex h-9 w-9 items-center justify-center text-xs text-emerald-600 opacity-60"
                                                    title="Already read"
                                                >
                                                    ✓
                                                </span>
                                            )}

                                            {/* Delete notification */}
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(n.id)}
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-warmgray/60 hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition"
                                                title="Delete notification"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {notifications?.links && notifications.links.length > 3 && (
                    <div className="mt-8 flex justify-center items-center gap-1">
                        {notifications.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                preserveScroll
                                preserveState
                                className={`flex h-9 min-w-[36px] items-center justify-center rounded-xl px-3 text-xs font-bold transition ${link.active
                                    ? 'bg-champagnegold text-white shadow-xs'
                                    : !link.url
                                        ? 'text-warmgray/40 cursor-not-allowed'
                                        : 'bg-white text-softcharcoal border border-warmbeige/80 hover:bg-champagne/50'
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
