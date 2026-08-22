import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Sidebar() {
    const { auth } = usePage().props;

    const user = auth?.user;

    /*
    |--------------------------------------------------------------------------
    | Supplier Status
    |--------------------------------------------------------------------------
    */

    const supplierStatus =
        user?.role === 'supplier'
            ? user?.supplier_profile?.status
            : null;

    const supplierApproved = supplierStatus === 'approved';
    const supplierPending = supplierStatus === 'pending';
    const supplierRejected = supplierStatus === 'rejected';


    /*
    |--------------------------------------------------------------------------
    | Settings Dropdown
    |--------------------------------------------------------------------------
    */

    const [settingsOpen, setSettingsOpen] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | Admin Menu
    |--------------------------------------------------------------------------
    */

    const adminMenu = [
        {
            name: 'Dashboard',
            href: '/admin/dashboard',
            icon: '📊',
        },
        {
            name: 'Users',
            href: '/admin/users',
            icon: '👥',
        },
        {
            name: 'Suppliers',
            href: route('admin.suppliers.index'),
            icon: '🏢',
        },
        {
            name: 'Customers',
            href: '/admin/customers',
            icon: '👤',
        },
        {
            name: 'Packages',
            href: '/admin/packages',
            icon: '📦',
        },
        {
            name: 'Bookings',
            href: '/admin/bookings',
            icon: '📅',
        },
        {
            name: 'Schedules',
            href: '/admin/schedules',
            icon: '📆',
        },
        {
            name: 'AI Assistant',
            href: '/admin/ai-assistant',
            icon: '🤖',
        },
        {
            name: 'Reviews & Ratings',
            href: '/admin/reviews',
            icon: '⭐',
        },
        {
            name: 'Reports',
            href: '/admin/reports',
            icon: '📈',
        },
    ];


    /*
    |--------------------------------------------------------------------------
    | Supplier Menu
    |--------------------------------------------------------------------------
    */

    const supplierMenu = [
        {
            name: 'Dashboard',
            href: '/supplier/dashboard',
            icon: '📊',
        },

        ...(supplierApproved
            ? [
                {
                    name: 'My Services',
                    href: route('supplier.services.index'),
                    icon: '🛠️',
                },
                {
                    name: 'Packages',
                    href: route('supplier.packages.index'),
                    icon: '📦',
                },
                {
                    name: 'My Teams',
                    href: route('supplier.teams.index'),
                    icon: '👥',
                },
                {
                    name: 'Bookings',
                    href: '/supplier/bookings',
                    icon: '📅',
                },

                {
                    name: 'Availability',
                    href: '/supplier/availability',
                    icon: '🗓️',
                },
                {
                    name: 'Portfolio',
                    href: route('supplier.portfolio.index'),
                    icon: '📸',
                },
                {
                    name: 'Payments',
                    href: '/supplier/payments',
                    icon: '💰',
                },
                {
                    name: 'Messages',
                    href: '/supplier/messages',
                    icon: '💬',
                },
                {
                    name: 'Notifications',
                    href: '/supplier/notifications',
                    icon: '🔔',
                },
                {
                    name: 'Reviews',
                    href: '/supplier/reviews',
                    icon: '⭐',
                },
            ]
            : []),

        {
            name: 'Settings',
            href: route('supplier.settings'),
            icon: '⚙️',
        },
    ];


    /*
    |--------------------------------------------------------------------------
    | Customer Menu
    |--------------------------------------------------------------------------
    */

    const customerMenu = [
        {
            name: 'Dashboard',
            href: '/customer/dashboard',
            icon: '📊',
        },
        {
            name: 'AI Assistant Chat',
            href: '/customer/ai-assistant',
            icon: '🤖',
        },
        {
            name: 'Recommendations',
            href: '/customer/recommendations',
            icon: '💡',
        },
        {
            name: 'Find Suppliers',
            href: route('customer.suppliers.index'),
            icon: '🔍',
        },
        {
            name: 'My Events',
            href: '/customer/events',
            icon: '🎉',
        },
        {
            name: 'My Bookings',
            href: '/customer/bookings',
            icon: '📅',
        },
        {
            name: 'Payments',
            href: '/customer/payments',
            icon: '💳',
        },
        {
            name: 'Reviews',
            href: '/customer/reviews',
            icon: '⭐',
        },
        {
            name: 'Messages',
            href: '/customer/messages',
            icon: '💬',
        },
        {
            name: 'Profile',
            href: route('profile.edit'),
            icon: '👤',
        },
        {
            name: 'Settings',
            href: '/customer/settings',
            icon: '⚙️',
        },
    ];


    /*
    |--------------------------------------------------------------------------
    | Select Menu Based On Role
    |--------------------------------------------------------------------------
    */

    let menu = [];

    if (user?.role === 'admin') {
        menu = adminMenu;
    } else if (user?.role === 'supplier') {
        menu = supplierMenu;
    } else if (user?.role === 'customer') {
        menu = customerMenu;
    }


    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <aside
            className="
                flex
                h-screen
                w-64
                flex-col
                border-r
                border-gray-200
                bg-white
                overflow-hidden
            "
        >

            {/* =========================================================
                LOGO
            ========================================================= */}

            <div className="flex h-16 shrink-0 items-center border-b px-6">
                <h1 className="text-xl font-bold">
                    Event System
                </h1>
            </div>


            {/* =========================================================
                USER INFORMATION
            ========================================================= */}

            <div className="shrink-0 border-b p-4">

                <p className="font-semibold">
                    {user?.name}
                </p>

                <p className="text-sm capitalize text-gray-500">
                    {user?.role}
                </p>

                {/* Supplier Status */}

                {user?.role === 'supplier' && (
                    <div className="mt-2">

                        {supplierPending && (
                            <span className="inline-flex rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700">
                                Pending Approval
                            </span>
                        )}

                        {supplierApproved && (
                            <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                                Approved
                            </span>
                        )}

                        {supplierRejected && (
                            <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                                Rejected
                            </span>
                        )}

                    </div>
                )}

            </div>


            {/* =========================================================
                SCROLLABLE CONTENT
            ========================================================= */}

            <div className="flex-1 overflow-y-auto">

                <nav className="space-y-1 p-4">

                    {/* Main Menu */}

                    {menu.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="
                                flex
                                items-center
                                gap-3
                                rounded-lg
                                px-4
                                py-3
                                text-gray-700
                                transition
                                hover:bg-gray-100
                            "
                        >
                            <span>{item.icon}</span>

                            <span>{item.name}</span>
                        </Link>
                    ))}


                    {/* =================================================
                        ADMIN SETTINGS DROPDOWN
                    ================================================= */}

                    {user?.role === 'admin' && (
                        <div className="pt-1">

                            {/* Settings Button */}

                            <button
                                type="button"
                                onClick={() =>
                                    setSettingsOpen(!settingsOpen)
                                }
                                className="
                                    flex
                                    w-full
                                    items-center
                                    justify-between
                                    rounded-lg
                                    px-4
                                    py-3
                                    text-gray-700
                                    transition
                                    hover:bg-gray-100
                                "
                            >

                                <div className="flex items-center gap-3">

                                    <span>
                                        ⚙️
                                    </span>

                                    <span>
                                        Settings
                                    </span>

                                </div>

                                <span
                                    className={`text-xs transition-transform duration-200 ${settingsOpen
                                        ? 'rotate-180'
                                        : ''
                                        }`}
                                >
                                    ▼
                                </span>

                            </button>


                            {/* Settings Dropdown */}

                            {settingsOpen && (
                                <div className="mt-1 ml-4 space-y-1 border-l border-gray-200 pl-3">

                                    <Link
                                        href={route(
                                            'admin.event-categories.index'
                                        )}
                                        className="
                                            flex
                                            items-center
                                            gap-3
                                            rounded-lg
                                            px-4
                                            py-2.5
                                            text-sm
                                            text-gray-600
                                            transition
                                            hover:bg-indigo-50
                                            hover:text-indigo-600
                                        "
                                    >
                                        <span>🎉</span>

                                        <span>
                                            Event Categories
                                        </span>
                                    </Link>


                                    <Link
                                        href={route(
                                            'admin.supplier-categories.index'
                                        )}
                                        className="
                                            flex
                                            items-center
                                            gap-3
                                            rounded-lg
                                            px-4
                                            py-2.5
                                            text-sm
                                            text-gray-600
                                            transition
                                            hover:bg-indigo-50
                                            hover:text-indigo-600
                                        "
                                    >
                                        <span>🏷️</span>

                                        <span>
                                            Supplier Categories
                                        </span>
                                    </Link>


                                    <Link
                                        href="/admin/settings"
                                        className="
                                            flex
                                            items-center
                                            gap-3
                                            rounded-lg
                                            px-4
                                            py-2.5
                                            text-sm
                                            text-gray-600
                                            transition
                                            hover:bg-indigo-50
                                            hover:text-indigo-600
                                        "
                                    >
                                        <span>⚙️</span>

                                        <span>
                                            System Settings
                                        </span>
                                    </Link>

                                </div>
                            )}

                        </div>
                    )}

                </nav>


                {/* =====================================================
                    PENDING SUPPLIER MESSAGE
                ===================================================== */}

                {user?.role === 'supplier' &&
                    supplierPending && (
                        <div className="mx-4 mb-4 rounded-xl border border-yellow-200 bg-yellow-50 p-3">

                            <p className="text-xs font-semibold text-yellow-800">
                                Account Pending
                            </p>

                            <p className="mt-1 text-xs leading-5 text-yellow-700">
                                Your supplier account is waiting
                                for Admin approval.
                            </p>

                        </div>
                    )}


                {/* =====================================================
                    REJECTED SUPPLIER MESSAGE
                ===================================================== */}

                {user?.role === 'supplier' &&
                    supplierRejected && (
                        <div className="mx-4 mb-4 rounded-xl border border-red-200 bg-red-50 p-3">

                            <p className="text-xs font-semibold text-red-800">
                                Application Rejected
                            </p>

                            <p className="mt-1 text-xs leading-5 text-red-700">
                                Please check your dashboard for
                                the rejection reason.
                            </p>

                        </div>
                    )}

            </div>


            {/* =========================================================
                LOGOUT
            ========================================================= */}

            <div className="shrink-0 border-t bg-white p-4">

                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="
                        w-full
                        rounded-lg
                        px-4
                        py-3
                        text-left
                        text-red-600
                        transition
                        hover:bg-red-50
                    "
                >
                    🚪 Logout
                </Link>

            </div>

        </aside>
    );
}