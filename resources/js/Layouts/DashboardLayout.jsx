import Sidebar from '@/Components/Sidebar';
import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function DashboardLayout({ children }) {
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
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
            {/* Standalone Fixed Sidebar with its own scrollable viewport */}
            <Sidebar />

            {/* Main Content Area: Independent scrollable viewport */}
            <main className="flex-1 h-screen overflow-y-auto bg-slate-50/60 relative">
                {/* Global Toast Notification */}
                {visibleFlash && (
                    <div className="fixed top-5 right-5 z-50 max-w-md animate-bounce-in">
                        {visibleFlash.success && (
                            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white/95 px-5 py-4 text-emerald-900 shadow-xl shadow-emerald-500/10 backdrop-blur-md">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-xs">
                                    ✓
                                </span>
                                <div className="flex-1 pr-2">
                                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Success</p>
                                    <p className="text-xs font-semibold text-slate-800">{visibleFlash.success}</p>
                                </div>
                                <button
                                    onClick={() => setVisibleFlash(null)}
                                    className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {visibleFlash.error && (
                            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-white/95 px-5 py-4 text-red-900 shadow-xl shadow-red-500/10 backdrop-blur-md">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-white font-bold text-sm shadow-xs">
                                    ✕
                                </span>
                                <div className="flex-1 pr-2">
                                    <p className="text-xs font-bold uppercase tracking-wider text-red-600">Notice</p>
                                    <p className="text-xs font-semibold text-slate-800">{visibleFlash.error}</p>
                                </div>
                                <button
                                    onClick={() => setVisibleFlash(null)}
                                    className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
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
    );
}