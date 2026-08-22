import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <DashboardLayout>
            <Head title="Admin Dashboard - Event Management" />

            <div className="min-h-screen bg-slate-50/60 p-6 lg:p-8">
                {/* Header with Welcome and Quick Action */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                                🛡️ Admin Portal
                            </span>
                            <span className="text-xs text-slate-400">• Overview & Analytics</span>
                        </div>
                        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                            System Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Monitor platform metrics, approve supplier registrations, and review event bookings.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.suppliers.index')}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                        >
                            <span>🏢 Review Suppliers</span>
                            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">New</span>
                        </Link>
                    </div>
                </div>

                {/* Key Statistics Grid */}
                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Customers */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Total Customers
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 text-lg font-bold">
                                👥
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">1,248</span>
                            <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                                ↑ 12.5%
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Registered client accounts</p>
                    </div>

                    {/* Total Suppliers */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Active Suppliers
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 text-lg font-bold">
                                🏢
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">86</span>
                            <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                                +8 this month
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Photographers, Caterers & Decor</p>
                    </div>

                    {/* Total Bookings */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Event Bookings
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-lg font-bold">
                                📅
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">324</span>
                            <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                                ↑ 18.2%
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Total reserved event services</p>
                    </div>

                    {/* Total Volume */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Total Platform Volume
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 text-lg font-bold">
                                💰
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">₱458K</span>
                            <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                                ↑ 15.8%
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Total processed booking value</p>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Recent Event Bookings (8 Cols) */}
                    <div className="space-y-6 lg:col-span-8">
                        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                            <div className="flex items-center justify-between border-b border-slate-100 p-5">
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Recent Event Bookings
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Latest customer reservations across suppliers
                                    </p>
                                </div>
                                <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-200/60">
                                    Real-time Activity
                                </span>
                            </div>

                            <div className="divide-y divide-slate-100">
                                <div className="flex items-center justify-between p-4 transition hover:bg-slate-50/60">
                                    <div className="flex items-center gap-3.5">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-700 text-sm">
                                            JD
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">John Dela Cruz</p>
                                            <p className="text-xs text-slate-500">
                                                Package: <span className="font-semibold text-slate-700">Grand Wedding Dream Bundle</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-extrabold text-slate-900">₱35,000.00</p>
                                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                                            Confirmed
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 transition hover:bg-slate-50/60">
                                    <div className="flex items-center gap-3.5">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 font-bold text-purple-700 text-sm">
                                            MS
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Maria Santos</p>
                                            <p className="text-xs text-slate-500">
                                                Service: <span className="font-semibold text-slate-700">Full Catering & Decor</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-extrabold text-slate-900">₱18,500.00</p>
                                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                                            Pending Review
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 transition hover:bg-slate-50/60">
                                    <div className="flex items-center gap-3.5">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 font-bold text-emerald-700 text-sm">
                                            RM
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Robert Mendoza</p>
                                            <p className="text-xs text-slate-500">
                                                Package: <span className="font-semibold text-slate-700">Corporate Conference Package</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-extrabold text-slate-900">₱42,000.00</p>
                                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                                            Confirmed
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Quick Management (4 Cols) */}
                    <div className="space-y-6 lg:col-span-4">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <h2 className="text-base font-bold text-slate-900">
                                Quick Management
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Common admin management shortcuts
                            </p>

                            <div className="mt-4 space-y-2.5">
                                <Link
                                    href={route('admin.suppliers.index')}
                                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                                        🏢
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Suppliers Roster</p>
                                        <p className="text-[11px] text-slate-500">Review & approve applications</p>
                                    </div>
                                </Link>

                                <Link
                                    href={route('admin.event-categories.index')}
                                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                                        🎉
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Event Categories</p>
                                        <p className="text-[11px] text-slate-500">Manage available event types</p>
                                    </div>
                                </Link>

                                <Link
                                    href={route('admin.supplier-categories.index')}
                                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                        🏷️
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Supplier Categories</p>
                                        <p className="text-[11px] text-slate-500">Photography, Catering, Styling</p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* System Status Callout */}
                        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-white p-5">
                            <div className="flex items-start gap-3">
                                <span className="text-xl">✨</span>
                                <div>
                                    <h4 className="text-xs font-bold text-indigo-900">
                                        Platform Health: Excellent
                                    </h4>
                                    <p className="mt-1 text-xs text-indigo-900/70 leading-relaxed">
                                        All services and supplier team collaboration engines are running smoothly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}