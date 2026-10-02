import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Sidebar({ isOpen = false, onClose = () => { } }) {
    const page = usePage();
    const auth = page.props?.auth;
    const url = page.url || window.location.pathname;

    const user = auth?.user;

    const supplierStatus =
        user?.role === 'supplier'
            ? user?.supplier_profile?.status
            : null;

    const supplierApproved = supplierStatus === 'approved';
    const supplierPending = supplierStatus === 'pending';
    const supplierRejected = supplierStatus === 'rejected';

    const unreadMessagesCount = page.props?.unread_messages_count || 0;
    const pendingBookingsCount = page.props?.pending_bookings_count || 0;
    const unreadNotificationsCount = page.props?.unread_notifications_count || 0;

    const [settingsOpen, setSettingsOpen] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Active route matcher
    |--------------------------------------------------------------------------
    */
    const isItemActive = (itemHref) => {
        if (!itemHref) return false;
        try {
            const itemUrl = new URL(itemHref, window.location.origin);
            const itemPath = itemUrl.pathname;
            const currentCleanPath = (url || '').split('?')[0];

            if (currentCleanPath === itemPath) return true;

            const rootPaths = ['/', '/admin/dashboard', '/supplier/dashboard', '/customer/dashboard'];
            if (rootPaths.includes(itemPath)) {
                return currentCleanPath === itemPath;
            }

            return currentCleanPath.startsWith(itemPath + '/') || currentCleanPath === itemPath;
        } catch {
            return false;
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Admin Menu
    |--------------------------------------------------------------------------
    */
    const adminMenu = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
        //{ name: 'Homepage Management', href: route('admin.homepage.index'), icon: '🎨' },
        { name: 'Users', href: '/admin/users', icon: '👥' },
        { name: 'Suppliers', href: route('admin.suppliers.index'), icon: '🏢' },
        { name: 'Customers', href: '/admin/customers', icon: '👤' },
        { name: 'Packages', href: '/admin/packages', icon: '📦' },
        { name: 'Bookings', href: '/admin/bookings', icon: '📅' },
        { name: 'Schedules', href: '/admin/schedules', icon: '📆' },
        //{ name: 'Messages', href: route('messages.index'), icon: '💬', badge: unreadMessagesCount },
        { name: 'Featured Suppliers', href: route('admin.featured-suppliers.index'), icon: '🌟' },
        { name: 'Top Packages', href: route('admin.top-packages.index'), icon: '🏆' },
        { name: 'Reviews & Ratings', href: '/admin/reviews', icon: '⭐' },
        { name: 'Notifications', href: route('notifications.index'), icon: '🔔', badge: unreadNotificationsCount },
        { name: 'Reports', href: '/admin/reports', icon: '📈' },
    ];

    /*
    |--------------------------------------------------------------------------
    | Supplier Menu
    |--------------------------------------------------------------------------
    */
    const supplierMenu = [
        { name: 'Dashboard', href: '/supplier/dashboard', icon: '📊' },

        ...(supplierApproved
            ? [
                { name: 'My Services', href: route('supplier.services.index'), icon: '🛠️' },
                { name: 'Packages', href: route('supplier.packages.index'), icon: '📦' },
                { name: 'My Teams', href: route('supplier.teams.index'), icon: '👥' },
                { name: 'Bookings', href: route('supplier.bookings.index'), icon: '📅', badge: pendingBookingsCount },
                { name: 'Availability', href: '/supplier/availability', icon: '🗓️' },
                { name: 'Portfolio', href: route('supplier.portfolio.index'), icon: '📸' },
                { name: 'Messages', href: route('messages.index'), icon: '💬', badge: unreadMessagesCount },
                { name: 'Payments', href: '/supplier/payments', icon: '💰' },
                //{ name: 'Payment Settings', href: route('supplier.payment-settings'), icon: '💳' },
                { name: 'Reviews', href: route('supplier.reviews.index'), icon: '⭐' },
                { name: 'Notifications', href: route('notifications.index'), icon: '🔔', badge: unreadNotificationsCount },
            ]
            : [
                { name: 'Notifications', href: route('notifications.index'), icon: '🔔', badge: unreadNotificationsCount },
            ]),

        { name: 'Settings', href: route('supplier.settings'), icon: '⚙️' },
    ];

    /*
    |--------------------------------------------------------------------------
    | Customer Menu
    |--------------------------------------------------------------------------
    */
    const customerMenu = [
        { name: 'Dashboard', href: '/customer/dashboard', icon: '📊' },
        { name: 'Find Suppliers', href: route('customer.suppliers.index'), icon: '🔍' },
        { name: 'My Events', href: '/customer/events', icon: '🎉' },
        { name: 'My Bookings', href: route('customer.bookings.index'), icon: '📅' },
        { name: 'Messages', href: route('messages.index'), icon: '💬', badge: unreadMessagesCount },
        { name: 'Payments', href: '/customer/payments', icon: '💳' },
        { name: 'Profile', href: route('profile.edit'), icon: '👤' },
        { name: 'Notifications', href: route('notifications.index'), icon: '🔔', badge: unreadNotificationsCount },
        { name: 'Settings', href: '/customer/settings', icon: '⚙️' },
    ];

    let menu = [];
    if (user?.role === 'admin') {
        menu = adminMenu;
    } else if (user?.role === 'supplier') {
        menu = supplierMenu;
    } else if (user?.role === 'customer') {
        menu = customerMenu;
    }

    const handleLinkClick = () => {
        // Close sidebar on mobile when a nav link is clicked
        if (window.innerWidth < 1024) {
            onClose();
        }
    };

    const sidebarContent = (
        <aside className="flex h-full w-64 shrink-0 flex-col border-r border-warmbeige bg-white shadow-xs select-none">
            {/* Logo + Mobile Close Button */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-champagne px-4 lg:px-6">
                <Link href="/" className="flex items-center gap-2.5" onClick={handleLinkClick}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-champagnegold to-darkgold text-white font-black text-base shadow-sm shadow-champagnegold/20">
                        W
                    </span>
                    <div>
                        <h1 className="text-base font-extrabold tracking-tight text-softcharcoal leading-none">
                            WESTEAM
                        </h1>
                        <span className="text-[10px] font-semibold text-warmgray uppercase tracking-wider">
                            Events &amp; Weddings
                        </span>
                    </div>
                </Link>
                {/* Close button — only visible on mobile */}
                <button
                    type="button"
                    onClick={onClose}
                    className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-warmgray hover:bg-champagne hover:text-softcharcoal transition"
                    aria-label="Close sidebar"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* User Details */}
            <div className="shrink-0 border-b border-champagne p-4 bg-ivory/50">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-champagne text-darkgold font-bold text-sm shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-softcharcoal">{user?.name}</p>
                        <p className="text-[11px] capitalize font-medium text-warmgray">{user?.role} Portal</p>
                    </div>
                </div>

                {user?.role === 'supplier' && (
                    <div className="mt-2.5">
                        {supplierPending && (
                            <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-inset ring-amber-700/10">
                                ⏳ Pending Approval
                            </span>
                        )}
                        {supplierApproved && (
                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-700/10">
                                ✓ Verified Supplier
                            </span>
                        )}
                        {supplierRejected && (
                            <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-700 ring-1 ring-inset ring-red-700/10">
                                ✕ Rejected
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Scrollable Nav List */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-warmbeige">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-warmgray mb-1">
                    Navigation
                </p>

                {menu.map((item) => {
                    const active = isItemActive(item.href);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={handleLinkClick}
                            className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${active
                                ? 'bg-champagnegold text-white shadow-md shadow-champagnegold/25 font-bold ring-1 ring-champagnegold'
                                : 'text-softcharcoal hover:bg-champagne/60 hover:text-darkgold'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-base leading-none transition-transform group-hover:scale-110">
                                    {item.icon}
                                </span>
                                <span>{item.name}</span>
                            </div>

                            {Boolean(item.badge && item.badge > 0) && (
                                <span
                                    className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold shadow-xs transition-all ${active
                                        ? 'bg-white text-darkgold'
                                        : 'bg-rose-500 text-white animate-pulse'
                                        }`}
                                >
                                    {item.badge > 99 ? '99+' : item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}

                {/* Admin Settings Dropdown */}
                {user?.role === 'admin' && (
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => setSettingsOpen(!settingsOpen)}
                            className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-softcharcoal transition hover:bg-champagne hover:text-softcharcoal active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-base leading-none">⚙️</span>
                                <span>Settings</span>
                            </div>
                            <span className={`text-[10px] text-warmgray transition-transform ${settingsOpen ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </button>

                        {settingsOpen && (
                            <div className="mt-1 ml-4 space-y-1 border-l-2 border-warmbeige pl-2">
                                <Link
                                    href={route('admin.event-categories.index')}
                                    onClick={handleLinkClick}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${isItemActive(route('admin.event-categories.index'))
                                        ? 'bg-champagnegold text-white font-bold shadow-xs'
                                        : 'text-softcharcoal hover:bg-champagne hover:text-champagnegold'
                                        }`}
                                >
                                    <span>🎉</span>
                                    <span>Event Categories</span>
                                </Link>
                                <Link
                                    href={route('admin.supplier-categories.index')}
                                    onClick={handleLinkClick}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${isItemActive(route('admin.supplier-categories.index'))
                                        ? 'bg-champagnegold text-white font-bold shadow-xs'
                                        : 'text-softcharcoal hover:bg-champagne hover:text-champagnegold'
                                        }`}
                                >
                                    <span>🏷️</span>
                                    <span>Supplier Categories</span>
                                </Link>
                                <Link
                                    href={route('profile.edit')}
                                    onClick={handleLinkClick}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${isItemActive(route('profile.edit'))
                                        ? 'bg-champagnegold text-white font-bold shadow-xs'
                                        : 'text-softcharcoal hover:bg-champagne hover:text-champagnegold'
                                        }`}
                                >
                                    <span>👥</span>
                                    <span>Account Profile</span>
                                </Link>
                                <Link
                                    href={route('admin.homepage.index')}
                                    onClick={handleLinkClick}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${isItemActive(route('profile.edit'))
                                        ? 'bg-champagnegold text-white font-bold shadow-xs'
                                        : 'text-softcharcoal hover:bg-champagne hover:text-champagnegold'
                                        }`}
                                >
                                    <span>🎨</span>
                                    <span>Homepage Content</span>
                                </Link>
                                <Link
                                    href="/admin/settings"
                                    onClick={handleLinkClick}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${isItemActive('/admin/settings')
                                        ? 'bg-champagnegold text-white font-bold shadow-xs'
                                        : 'text-softcharcoal hover:bg-champagne hover:text-champagnegold'
                                        }`}
                                >
                                    <span>⚙️</span>
                                    <span>System Settings</span>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Logout Footer */}
            <div className="shrink-0 border-t border-champagne p-3 bg-white">
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700"
                >
                    <span className="text-sm">🚪</span>
                    <span>Sign Out</span>
                </Link>
            </div>
        </aside>
    );

    return (
        <>
            {/* ── Desktop Sidebar (lg+) ── */}
            <div className="hidden lg:flex h-screen w-64 shrink-0 z-30">
                {sidebarContent}
            </div>

            {/* ── Mobile Overlay Drawer (< lg) ── */}
            {isOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-softcharcoal/50 backdrop-blur-sm"
                        onClick={onClose}
                        aria-hidden="true"
                    />
                    {/* Drawer panel — slides in from left */}
                    <div className="absolute left-0 top-0 h-full w-64 shadow-2xl">
                        {sidebarContent}
                    </div>
                </div>
            )}
        </>
    );
}