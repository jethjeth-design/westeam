import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Sidebar() {
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
        { name: 'Users', href: '/admin/users', icon: '👥' },
        { name: 'Suppliers', href: route('admin.suppliers.index'), icon: '🏢' },
        { name: 'Customers', href: '/admin/customers', icon: '👤' },
        { name: 'Packages', href: '/admin/packages', icon: '📦' },
        { name: 'Bookings', href: '/admin/bookings', icon: '📅' },
        { name: 'Schedules', href: '/admin/schedules', icon: '📆' },
        { name: 'Messages', href: route('messages.index'), icon: '💬', badge: unreadMessagesCount },
        { name: 'AI Assistant', href: '/admin/ai-assistant', icon: '🤖' },
        { name: 'Reviews & Ratings', href: '/admin/reviews', icon: '⭐' },
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
                { name: 'Notifications', href: '/supplier/notifications', icon: '🔔' },
                { name: 'Reviews', href: route('supplier.reviews.index'), icon: '⭐' },
            ]
            : []),

        { name: 'Settings', href: route('supplier.settings'), icon: '⚙️' },
    ];

    /*
    |--------------------------------------------------------------------------
    | Customer Menu
    |--------------------------------------------------------------------------
    */
    const customerMenu = [
        { name: 'Dashboard', href: '/customer/dashboard', icon: '📊' },
        { name: 'AI Assistant Chat', href: '/customer/ai-assistant', icon: '🤖' },
        { name: 'Find Suppliers', href: route('customer.suppliers.index'), icon: '🔍' },
        { name: 'My Events', href: '/customer/events', icon: '🎉' },
        { name: 'My Bookings', href: route('customer.bookings.index'), icon: '📅' },
        { name: 'Messages', href: route('messages.index'), icon: '💬', badge: unreadMessagesCount },
        { name: 'Payments', href: '/customer/payments', icon: '💳' },
        { name: 'Reviews', href: '/customer/reviews', icon: '⭐' },
        { name: 'Profile', href: route('profile.edit'), icon: '👤' },
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

    return (
        <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white shadow-xs z-30 select-none">
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center border-b border-slate-100 px-6">
                <Link href="/" className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-base shadow-sm shadow-indigo-500/20">
                        W
                    </span>
                    <div>
                        <h1 className="text-base font-extrabold tracking-tight text-slate-900 leading-none">
                            WESTEAM
                        </h1>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            Events & Weddings
                        </span>
                    </div>
                </Link>
            </div>

            {/* User Details */}
            <div className="shrink-0 border-b border-slate-100 p-4 bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold text-sm shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-slate-900">{user?.name}</p>
                        <p className="text-[11px] capitalize font-medium text-slate-500">{user?.role} Portal</p>
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

            {/* Standalone Scrollable Nav List */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Navigation
                </p>

                {menu.map((item) => {
                    const active = isItemActive(item.href);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
                                active
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-bold ring-1 ring-indigo-500'
                                    : 'text-slate-600 hover:bg-indigo-50/60 hover:text-indigo-700'
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
                                    className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold shadow-xs transition-all ${
                                        active
                                            ? 'bg-white text-indigo-700'
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
                            className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-base leading-none">⚙️</span>
                                <span>Settings</span>
                            </div>
                            <span className={`text-[10px] text-slate-400 transition-transform ${settingsOpen ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </button>

                        {settingsOpen && (
                            <div className="mt-1 ml-4 space-y-1 border-l-2 border-slate-200 pl-2">
                                <Link
                                    href={route('admin.event-categories.index')}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                                        isItemActive(route('admin.event-categories.index'))
                                            ? 'bg-indigo-600 text-white font-bold shadow-xs'
                                            : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                                    }`}
                                >
                                    <span>🎉</span>
                                    <span>Event Categories</span>
                                </Link>
                                <Link
                                    href={route('admin.supplier-categories.index')}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                                        isItemActive(route('admin.supplier-categories.index'))
                                            ? 'bg-indigo-600 text-white font-bold shadow-xs'
                                            : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                                    }`}
                                >
                                    <span>🏷️</span>
                                    <span>Supplier Categories</span>
                                </Link>
                                <Link
                                    href="/admin/settings"
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                                        isItemActive('/admin/settings')
                                            ? 'bg-indigo-600 text-white font-bold shadow-xs'
                                            : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
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
            <div className="shrink-0 border-t border-slate-100 p-3 bg-white">
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
}