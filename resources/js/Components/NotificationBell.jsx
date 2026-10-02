import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function NotificationBell({ align = 'right', className = '' }) {
    const { unread_notifications_count = 0, recent_notifications = [] } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
    const [markingAll, setMarkingAll] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside or Escape
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const displayedNotifications = activeTab === 'unread'
        ? recent_notifications.filter((n) => !n.read)
        : recent_notifications;

    const handleNotificationClick = (notification) => {
        setIsOpen(false);
        if (!notification.read) {
            router.visit(route('notifications.go', notification.id));
        } else {
            router.visit(notification.action_url || route('notifications.index'));
        }
    };

    const handleMarkAsRead = (e, notification) => {
        e.stopPropagation();
        router.post(
            route('notifications.mark-as-read', notification.id),
            {},
            { preserveScroll: true, preserveState: true }
        );
    };

    const handleMarkAllAsRead = (e) => {
        e.stopPropagation();
        if (unread_notifications_count === 0 || markingAll) return;
        setMarkingAll(true);
        router.post(
            route('notifications.mark-all-read'),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setMarkingAll(false),
            }
        );
    };

    const getCategoryBadge = (category) => {
        switch (category) {
            case 'booking':
                return { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: '📅' };
            case 'payment':
                return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '💳' };
            case 'message':
                return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '💬' };
            case 'review':
                return { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: '⭐' };
            case 'supplier':
                return { bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: '🏢' };
            case 'team':
                return { bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: '👥' };
            case 'customer':
                return { bg: 'bg-teal-50 text-teal-700 border-teal-200', icon: '👤' };
            default:
                return { bg: 'bg-champagne/60 text-darkgold border-warmbeige', icon: '🔔' };
        }
    };

    return (
        <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
            {/* Notification Bell Button */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition duration-150 focus:outline-none focus:ring-2 focus:ring-champagnegold/40 ${isOpen
                    ? 'bg-champagne text-darkgold ring-1 ring-warmbeige'
                    : 'text-softcharcoal hover:bg-champagne/60 hover:text-darkgold'
                    }`}
                aria-label={`Notifications (${unread_notifications_count} unread)`}
                aria-expanded={isOpen}
            >
                {/* Bell SVG */}
                <svg
                    className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'scale-105' : 'group-hover:rotate-12'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>

                {/* Unread Count Badge */}
                {unread_notifications_count > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 px-1.5 text-[10px] font-black text-white shadow-sm ring-2 ring-white animate-pulse">
                        {unread_notifications_count > 99 ? '99+' : unread_notifications_count}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className={`absolute mt-2 w-[calc(100vw-2rem)] sm:w-96 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 border border-warmbeige/70 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 ${align === 'right' ? 'right-0' : 'left-0'
                        }`}
                >
                    {/* Dropdown Header */}
                    <div className="flex items-center justify-between border-b border-warmbeige/40 bg-gradient-to-r from-ivory to-white px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-softcharcoal">Notifications</span>
                            {unread_notifications_count > 0 ? (
                                <span className="rounded-full bg-champagnegold/15 px-2 py-0.5 text-[11px] font-bold text-darkgold">
                                    {unread_notifications_count} new
                                </span>
                            ) : (
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                    All read
                                </span>
                            )}
                        </div>

                        {unread_notifications_count > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllAsRead}
                                disabled={markingAll}
                                className="text-[11px] font-semibold text-darkgold hover:text-champagnegold transition disabled:opacity-50 flex items-center gap-1"
                            >
                                <span>✓</span>
                                <span>{markingAll ? 'Marking...' : 'Mark all read'}</span>
                            </button>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex border-b border-warmbeige/40 bg-ivory/40 px-3 pt-1.5 text-xs">
                        <button
                            type="button"
                            onClick={() => setActiveTab('all')}
                            className={`pb-2 px-3 font-semibold transition border-b-2 -mb-[1px] ${activeTab === 'all'
                                ? 'border-champagnegold text-darkgold font-bold'
                                : 'border-transparent text-warmgray hover:text-softcharcoal'
                                }`}
                        >
                            All ({recent_notifications.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('unread')}
                            className={`pb-2 px-3 font-semibold transition border-b-2 -mb-[1px] ${activeTab === 'unread'
                                ? 'border-champagnegold text-darkgold font-bold'
                                : 'border-transparent text-warmgray hover:text-softcharcoal'
                                }`}
                        >
                            Unread ({unread_notifications_count})
                        </button>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-warmbeige/30 scrollbar-thin scrollbar-thumb-warmbeige">
                        {displayedNotifications.length === 0 ? (
                            <div className="py-10 text-center px-4">
                                <div className="mx-auto mb-2.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-champagne/50 text-2xl">
                                    🎉
                                </div>
                                <p className="text-xs font-bold text-softcharcoal">
                                    {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                                </p>
                                <p className="text-[11px] text-warmgray mt-0.5">
                                    You're all caught up with your activities!
                                </p>
                            </div>
                        ) : (
                            displayedNotifications.map((n) => {
                                const badge = getCategoryBadge(n.category);
                                return (
                                    <div
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`group relative flex items-start gap-3 p-3.5 transition cursor-pointer ${!n.read
                                            ? 'bg-champagne/25 hover:bg-champagne/45'
                                            : 'bg-white hover:bg-ivory/60'
                                            }`}
                                    >
                                        {/* Category Icon */}
                                        <div
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base border shadow-2xs ${badge.bg}`}
                                        >
                                            {n.icon || badge.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-1">
                                                <p
                                                    className={`truncate text-xs font-bold leading-tight ${!n.read ? 'text-softcharcoal font-black' : 'text-softcharcoal/85'
                                                        }`}
                                                >
                                                    {n.title}
                                                </p>
                                                {!n.read && (
                                                    <span
                                                        className="h-2 w-2 shrink-0 rounded-full bg-champagnegold shadow-xs"
                                                        title="Unread"
                                                    />
                                                )}
                                            </div>

                                            <p className="mt-0.5 text-[11px] text-warmgray line-clamp-2 leading-relaxed">
                                                {n.message}
                                            </p>

                                            <div className="mt-1.5 flex items-center justify-between">
                                                <span className="text-[10px] text-warmgray/80 font-medium">
                                                    {n.created_at_human}
                                                </span>

                                                {!n.read && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleMarkAsRead(e, n)}
                                                        className="text-[10px] font-semibold text-darkgold hover:text-champagnegold opacity-80 group-hover:opacity-100 transition"
                                                        title="Mark as read"
                                                    >
                                                        Mark read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-warmbeige/40 bg-gradient-to-r from-ivory to-white p-2.5 text-center">
                        <Link
                            href={route('notifications.index')}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-darkgold hover:text-champagnegold transition"
                        >
                            <span>View all notifications</span>
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
