import NotificationBell from '@/Components/NotificationBell';
import Sidebar from '@/Components/Sidebar';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function DashboardLayout({ children }) {
    const { flash, auth } = usePage().props;
    const user = auth?.user;
    const [visibleFlash, setVisibleFlash] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (flash?.success || flash?.error || flash?.message) {
            setVisibleFlash(flash);
            const timer = setTimeout(() => {
                setVisibleFlash(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Close sidebar when screen resizes to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-ivory">
            {/* Sidebar — handles both desktop fixed & mobile overlay internally */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col h-screen overflow-hidden min-w-0">
                {/* ── Mobile Top Bar (visible on < lg) ── */}
                <header className="flex lg:hidden h-14 shrink-0 items-center justify-between border-b border-warmbeige bg-white px-4 shadow-xs z-20">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-softcharcoal hover:bg-champagne hover:text-softcharcoal transition"
                            aria-label="Open menu"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Brand */}
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-champagnegold to-darkgold text-white font-black text-xs shadow-sm">
                                W
                            </span>
                            <span className="text-sm font-extrabold tracking-tight text-softcharcoal">WESTEAM</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <NotificationBell />
                    </div>
                </header>

                {/* ── Desktop Top Navigation Bar (visible on lg+) ── */}
                <header className="hidden lg:flex h-16 shrink-0 items-center justify-between border-b border-warmbeige/70 bg-white/85 px-8 shadow-xs backdrop-blur-md z-20">
                    {/* Left: Portal badge & user context */}
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-champagne/60 px-3 py-1 text-xs font-bold text-darkgold border border-warmbeige/50">
                            {user?.role === 'admin' && '🛡️ Admin Portal'}
                            {user?.role === 'supplier' && '💼 Supplier Portal'}
                            {user?.role === 'customer' && '🎉 Customer Portal'}
                        </span>
                        <span className="text-xs text-warmgray font-medium">
                            Welcome back, <strong className="text-softcharcoal font-bold">{user?.name}</strong>
                        </span>
                    </div>

                    {/* Right: Quick actions, Notification Bell & User Chip */}
                    <div className="flex items-center gap-3.5">
                        <NotificationBell />

                        <div className="h-4 w-px bg-warmbeige/60" />

                        <Link
                            href={route('profile.edit')}
                            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1 text-xs font-semibold text-softcharcoal hover:bg-champagne/40 transition"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-champagne to-warmbeige text-darkgold font-black text-xs shadow-2xs">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <span className="max-w-[130px] truncate">{user?.name}</span>
                        </Link>
                    </div>
                </header>

                {/* Page Content — scrollable */}
                <main className="flex-1 overflow-y-auto bg-ivory/60 relative">
                    {/* Global Toast Notification */}
                    {visibleFlash && (
                        <div className="fixed top-16 right-3 lg:top-5 lg:right-5 z-50 max-w-xs sm:max-w-md w-[calc(100vw-1.5rem)] sm:w-auto animate-bounce-in">
                            {visibleFlash.success && (
                                <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white/95 px-4 py-3 sm:px-5 sm:py-4 text-emerald-900 shadow-xl shadow-emerald-500/10 backdrop-blur-md">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-xs">
                                        ✓
                                    </span>
                                    <div className="flex-1 pr-2 min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Success</p>
                                        <p className="text-xs font-semibold text-softcharcoal truncate">{visibleFlash.success}</p>
                                    </div>
                                    <button
                                        onClick={() => setVisibleFlash(null)}
                                        className="text-warmgray hover:text-softcharcoal text-xs font-bold p-1 shrink-0"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}

                            {visibleFlash.error && (
                                <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-white/95 px-4 py-3 sm:px-5 sm:py-4 text-red-900 shadow-xl shadow-red-500/10 backdrop-blur-md">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white font-bold text-sm shadow-xs">
                                        ✕
                                    </span>
                                    <div className="flex-1 pr-2 min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-wider text-red-600">Notice</p>
                                        <p className="text-xs font-semibold text-softcharcoal truncate">{visibleFlash.error}</p>
                                    </div>
                                    <button
                                        onClick={() => setVisibleFlash(null)}
                                        className="text-warmgray hover:text-softcharcoal text-xs font-bold p-1 shrink-0"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </div>
    );
}