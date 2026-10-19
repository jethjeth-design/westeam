import NotificationBell from '@/Components/NotificationBell';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function CustomerTopNavbar() {
    const { auth, url: pageUrl, unreadMessagesCount = 0, unreadNotificationsCount = 0 } = usePage().props;
    const user = auth?.user;
    const currentUrl = typeof window !== 'undefined' ? window.location.pathname : (pageUrl || '');

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef(null);

    // Track scroll for sticky backdrop elevation
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Main navigation visible links: Dashboard, Gallery, Services, Packages, Message, Payment
    const mainNavLinks = [
        {
            name: 'Dashboard',
            href: route('customer.dashboard'),
            active: currentUrl === '/customer/dashboard' || currentUrl === '/dashboard',
        },
        {
            name: 'Event Partner',
            href: route('customer.suppliers.index'),
            active: currentUrl === '/customer/suppliers' || currentUrl.startsWith('/customer/suppliers/') || currentUrl.startsWith('/customer/portfolios'),
        },
        {
            name: 'Services',
            href: route('customer.services.index'),
            active: currentUrl.startsWith('/customer/services'),
        },
        {
            name: 'Packages',
            href: route('customer.packages.index'),
            active: currentUrl.startsWith('/customer/packages'),
        },
        {
            name: 'Message',
            href: route('messages.index'),
            badge: unreadMessagesCount,
            active: currentUrl.startsWith('/messages'),
        },
        {
            name: 'Payment',
            href: route('customer.payments.index'),
            active: currentUrl.startsWith('/customer/payments'),
        },
    ];

    // Links inside the Profile dropdown menu
    const profileDropdownLinks = [
        {
            name: 'Book an Event',
            href: route('customer.bookings.create'),
            description: 'Custom reservation with verified suppliers',
            active: currentUrl === '/customer/bookings/create',
        },
        {
            name: 'My Bookings',
            href: route('customer.bookings.index'),
            description: 'Track vendor reservations & statuses',
            active: currentUrl === '/customer/bookings' || (currentUrl.startsWith('/customer/bookings') && currentUrl !== '/customer/bookings/create'),
        },
        {
            name: 'My Event',
            href: route('customer.events.index'),
            description: 'Manage event details & milestones',
            active: currentUrl.startsWith('/customer/events'),
        },
        {
            name: 'Customer Profile',
            href: route('profile.edit'),
            description: 'Account settings & credentials',
            active: currentUrl.startsWith('/profile'),
        },
        {
            name: 'Notifications',
            href: route('notifications.index'),
            badge: unreadNotificationsCount,
            description: 'Updates, reminders & alerts',
            active: currentUrl.startsWith('/notifications'),
        },
    ];

    // Checks if any profile dropdown item is currently active
    const isProfileSectionActive = profileDropdownLinks.some((link) => link.active);

    const handleConfirmLogout = () => {
        setLoggingOut(true);
        router.post(route('logout'), {}, {
            onFinish: () => {
                setLoggingOut(false);
                setShowLogoutModal(false);
            },
        });
    };

    return (
        <>
            <header
                className={`sticky top-0 z-40 w-full transition-all duration-300 ${scrolled
                    ? 'bg-[#F8F5EF]/95 backdrop-blur-md shadow-md border-b border-[#EFE7D8]'
                    : 'bg-[#F8F5EF] border-b border-[#EFE7D8]/80'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Brand Logo */}
                        <Link href={route('customer.dashboard')} className="flex items-center gap-3 group shrink-0">
                            <div className="w-10 h-10 rounded-full border-2 border-[#C99632] flex items-center justify-center bg-[#EFE7D8]/70 group-hover:scale-105 transition-transform duration-300 shadow-xs">
                                <span className="font-serif font-black text-lg text-[#A87520]">W</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#24221E] leading-tight group-hover:text-[#A87520] transition-colors">
                                    Event & Wedding
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#A87520]">
                                        CUSTOMER PORTAL
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Desktop Main Navigation Links */}
                        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
                            {mainNavLinks.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`relative px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${item.active
                                        ? 'text-[#A87520] font-bold bg-[#EFE7D8]/80 shadow-2xs'
                                        : 'text-[#24221E] hover:text-[#C99632] hover:bg-[#EFE7D8]/40'
                                        }`}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.name}</span>
                                    {item.badge > 0 && (
                                        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-[#C99632] rounded-full">
                                            {item.badge > 99 ? '99+' : item.badge}
                                        </span>
                                    )}
                                    {item.active && (
                                        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#C99632] rounded-full" />
                                    )}
                                </Link>
                            ))}
                        </nav>

                        {/* Desktop Right Side: Book Now CTA, Notifications Bell & Profile Dropdown */}
                        <div className="hidden lg:flex items-center gap-3">
                            <Link
                                href={route('customer.bookings.create')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#C99632] to-[#A87520] text-white text-xs font-bold hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all shadow-xs"
                            >
                                <span>Book Now</span>
                            </Link>

                            <NotificationBell className="bg-white border border-[#EFE7D8] rounded-xl shadow-2xs hover:border-[#C99632]/50 transition-colors" />

                            <div className="h-6 w-px bg-[#EFE7D8]" />

                            {/* Customer Profile / Logout Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl transition-all border cursor-pointer ${profileDropdownOpen || isProfileSectionActive
                                        ? 'bg-[#EFE7D8]/70 border-[#DCC9A8] shadow-2xs'
                                        : 'hover:bg-[#EFE7D8]/50 border-transparent hover:border-[#EFE7D8]'
                                        }`}
                                    aria-label="Customer Profile Menu"
                                >
                                    <div className="relative">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#C99632] to-[#A87520] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                            {user?.name?.charAt(0)?.toUpperCase() || 'C'}
                                        </div>
                                        {unreadNotificationsCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#C99632] border-2 border-white rounded-full animate-pulse" />
                                        )}
                                    </div>

                                    <div className="text-left hidden xl:block max-w-[120px]">
                                        <p className="text-xs font-bold text-[#24221E] truncate leading-tight">
                                            {user?.name}
                                        </p>
                                        <p className="text-[10px] text-[#77736C] font-medium leading-tight">
                                            Customer
                                        </p>
                                    </div>

                                    <svg
                                        className={`w-4 h-4 text-[#77736C] transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180 text-[#A87520]' : ''
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Responsive Dropdown Menu */}
                                {profileDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-white shadow-2xl border border-[#EFE7D8] py-2 z-50 animate-fade-in divide-y divide-[#EFE7D8]/60">
                                        {/* User identity header */}
                                        <div className="px-5 py-3.5 bg-gradient-to-br from-[#F8F5EF] to-white rounded-t-3xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C99632] to-[#A87520] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                                                    {user?.name?.charAt(0)?.toUpperCase() || 'C'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-[#24221E] truncate">{user?.name}</p>
                                                    <p className="text-[11px] text-[#77736C] truncate">{user?.email}</p>
                                                </div>
                                            </div>
                                            <div className="mt-2.5 flex items-center gap-2">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EFE7D8] text-[#A87520]">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#C99632]" />
                                                    Customer Account
                                                </span>
                                            </div>
                                        </div>

                                        {/* Dropdown Items: Book Event, Profile, My Event, My Bookings, Notifications */}
                                        <div className="py-2 px-1.5 space-y-0.5">
                                            {profileDropdownLinks.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all group ${item.active
                                                        ? 'bg-[#EFE7D8] text-[#A87520] font-bold shadow-2xs'
                                                        : 'text-[#24221E] hover:bg-[#F8F5EF] hover:text-[#A87520]'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <span className="text-base shrink-0 group-hover:scale-110 transition-transform">{item.icon}</span>
                                                        <div className="min-w-0">
                                                            <p className="truncate leading-tight">{item.name}</p>
                                                            {item.description && (
                                                                <p className="text-[10px] text-[#77736C] font-normal truncate mt-0.5">
                                                                    {item.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {item.badge > 0 && (
                                                        <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-[10px] font-black text-white bg-[#C99632] rounded-full shrink-0">
                                                            {item.badge > 99 ? '99+' : item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>

                                        {/* Logout section with confirmation modal trigger */}
                                        <div className="p-1.5">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setProfileDropdownOpen(false);
                                                    setShowLogoutModal(true);
                                                }}
                                                className="w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors group cursor-pointer"
                                            >
                                                <span className="text-base group-hover:scale-110 transition-transform">🚪</span>
                                                <span>Log Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Hamburger & Actions (< lg) */}
                        <div className="flex lg:hidden items-center gap-2">
                            <NotificationBell className="bg-white border border-[#EFE7D8] rounded-xl shadow-2xs" />

                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2.5 rounded-xl text-[#24221E] hover:text-[#A87520] hover:bg-[#EFE7D8]/60 transition-colors border border-[#EFE7D8] cursor-pointer"
                                aria-label="Toggle Navigation Menu"
                            >
                                {mobileMenuOpen ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-[#EFE7D8] bg-[#F8F5EF] px-4 pt-3 pb-6 shadow-xl space-y-3 animate-fade-in">
                        {/* Customer Profile Banner in mobile menu */}
                        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-[#EFE7D8]">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C99632] to-[#A87520] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                                {user?.name?.charAt(0)?.toUpperCase() || 'C'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-[#24221E] truncate">{user?.name}</p>
                                <p className="text-[11px] text-[#77736C] truncate">{user?.email}</p>
                            </div>
                            <Link
                                href={route('customer.bookings.create')}
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-3 py-1.5 rounded-xl bg-[#C99632] text-white text-[11px] font-bold shadow-2xs"
                            >
                                Book Now
                            </Link>
                        </div>

                        {/* Main Nav Links: Dashboard, Gallery, Services, Packages, Message, Payment */}
                        <div>
                            <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#77736C]">
                                Browsing & Planning
                            </p>
                            <div className="space-y-1">
                                {mainNavLinks.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${item.active
                                            ? 'bg-[#C99632] text-white font-bold shadow-xs'
                                            : 'text-[#24221E] hover:bg-[#EFE7D8] hover:text-[#A87520]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-base">{item.icon}</span>
                                            <span>{item.name}</span>
                                        </div>
                                        {item.badge > 0 && (
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${item.active
                                                    ? 'bg-white text-[#C99632]'
                                                    : 'bg-[#C99632] text-white'
                                                    }`}
                                            >
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Account & Planning Section: Book Event, Profile, My Event, My Bookings, Notifications */}
                        <div className="pt-2 border-t border-[#EFE7D8]">
                            <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#77736C]">
                                Account & Reservations
                            </p>
                            <div className="space-y-1">
                                {profileDropdownLinks.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${item.active
                                            ? 'bg-[#C99632] text-white font-bold shadow-xs'
                                            : 'text-[#24221E] hover:bg-[#EFE7D8] hover:text-[#A87520]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-base">{item.icon}</span>
                                            <span>{item.name}</span>
                                        </div>
                                        {item.badge > 0 && (
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${item.active
                                                    ? 'bg-white text-[#C99632]'
                                                    : 'bg-[#C99632] text-white'
                                                    }`}
                                            >
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Logout Button triggering confirmation modal */}
                        <div className="pt-2 border-t border-[#EFE7D8]">
                            <button
                                type="button"
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    setShowLogoutModal(true);
                                }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                            >
                                <span>🚪</span>
                                <span>Log Out</span>
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Confirmation Logout Modal */}
            {showLogoutModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24221E]/60 backdrop-blur-xs animate-fade-in"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="logout-modal-title"
                >
                    <div
                        className="relative w-full max-w-sm sm:max-w-md rounded-3xl bg-white border border-[#EFE7D8] shadow-2xl p-6 sm:p-8 text-center animate-scale-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Icon Badge */}
                        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 border border-[#EFE7D8] flex items-center justify-center text-3xl shadow-xs mb-4">
                            <span>🚪</span>
                        </div>

                        <h3
                            id="logout-modal-title"
                            className="font-serif text-xl sm:text-2xl font-bold text-[#24221E]"
                        >
                            Confirm Sign Out
                        </h3>

                        <p className="text-xs sm:text-sm text-[#77736C] mt-2 leading-relaxed">
                            Are you sure you want to log out of your customer account? You can sign back in anytime to manage your wedding reservations and bookings.
                        </p>

                        {/* Action buttons */}
                        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(false)}
                                disabled={loggingOut}
                                className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-[#DCC9A8] bg-white text-[#24221E] hover:bg-[#F8F5EF] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmLogout}
                                disabled={loggingOut}
                                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                            >
                                {loggingOut ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Signing out...</span>
                                    </>
                                ) : (
                                    <span>Yes, Sign Out</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
