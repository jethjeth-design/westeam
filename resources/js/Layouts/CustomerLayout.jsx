import CustomerTopNavbar from '@/Components/CustomerTopNavbar';
import PublicFooter from '@/Components/PublicFooter';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function CustomerLayout({ children, footer = <PublicFooter /> }) {
    const { flash } = usePage().props;
    const [visibleFlash, setVisibleFlash] = useState(null);

    useEffect(() => {
        if (flash?.success || flash?.error || flash?.message) {
            setVisibleFlash(flash);
            const timer = setTimeout(() => {
                setVisibleFlash(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    return (
        <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#24221E] font-sans selection:bg-[#C99632]/20 selection:text-[#24221E]">
            {/* Responsive Top Navigation Bar */}
            <CustomerTopNavbar />

            {/* Global Flash Alerts / Toasts */}
            {visibleFlash && (
                <div className="fixed top-24 right-4 sm:right-6 z-50 max-w-xs sm:max-w-md w-[calc(100vw-2rem)] sm:w-auto animate-bounce-in">
                    {visibleFlash.success && (
                        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white/95 px-4 py-3 sm:px-5 sm:py-4 text-emerald-900 shadow-xl shadow-emerald-500/10 backdrop-blur-md">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-xs">
                                ✓
                            </span>
                            <div className="flex-1 pr-2 min-w-0">
                                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Success</p>
                                <p className="text-xs font-semibold text-[#24221E] truncate">{visibleFlash.success}</p>
                            </div>
                            <button
                                onClick={() => setVisibleFlash(null)}
                                className="text-[#77736C] hover:text-[#24221E] text-xs font-bold p-1 shrink-0 cursor-pointer"
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
                                <p className="text-xs font-semibold text-[#24221E] truncate">{visibleFlash.error}</p>
                            </div>
                            <button
                                onClick={() => setVisibleFlash(null)}
                                className="text-[#77736C] hover:text-[#24221E] text-xs font-bold p-1 shrink-0 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 w-full flex-grow">
                {children}
            </main>

            {/* Consistent Customer Footer */}
            {footer}
        </div>
    );
}
