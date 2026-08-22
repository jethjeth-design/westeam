import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ supplierProfile }) {
    return (
        <DashboardLayout>
            <Head title="Supplier Dashboard - Westeam" />

            <div className="min-h-screen bg-slate-50/60 p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                                💼 Supplier Portal
                            </span>
                            <span className="text-xs text-slate-400">• Overview & Teams</span>
                        </div>
                        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                            Supplier Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage your services, create team packages, and collaborate with other suppliers.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href={route('supplier.teams.index')}
                            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-2xs transition hover:bg-indigo-50 active:scale-95"
                        >
                            <span>👥 My Teams</span>
                        </Link>
                        <Link
                            href={route('supplier.packages.create')}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                        >
                            <span className="text-lg leading-none">+</span>
                            <span>Add Package</span>
                        </Link>
                    </div>
                </div>

                {/* Status Notice Banners */}
                {supplierProfile?.status === 'rejected' && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/80 p-5">
                        <div className="flex items-start gap-3.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-lg">
                                ❌
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-red-900">
                                    Profile Application Update Required
                                </h3>
                                <p className="mt-1 text-xs text-red-700">
                                    Your supplier application was not approved. Please update your business details and submit again.
                                </p>
                                {supplierProfile.rejection_reason && (
                                    <div className="mt-2.5 rounded-xl border border-red-200/60 bg-white p-3 text-xs text-slate-700">
                                        <span className="font-bold text-red-800">Reason:</span> {supplierProfile.rejection_reason}
                                    </div>
                                )}
                                <Link
                                    href={route('supplier.business-profile.edit')}
                                    className="mt-3 inline-flex rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                                >
                                    Update Business Profile
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {supplierProfile?.status === 'pending' && (
                    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
                        <div className="flex items-start gap-3.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg">
                                ⏳
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-amber-900">
                                    Account Pending Approval
                                </h3>
                                <p className="mt-1 text-xs text-amber-700">
                                    Your supplier account is currently being reviewed by administrators. You will be notified once verified!
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Statistics Cards */}
                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {/* My Services */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                My Services
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 text-lg font-bold">
                                🛠️
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">12</span>
                            <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                                10 active
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Available individual offerings</p>
                    </div>

                    {/* Packages */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Packages & Bundles
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 text-lg font-bold">
                                📦
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">8</span>
                            <span className="inline-flex items-center text-xs font-bold text-indigo-600">
                                3 Team Bundles
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Solo & team packages</p>
                    </div>

                    {/* Bookings */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Client Bookings
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-lg font-bold">
                                📅
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">24</span>
                            <span className="inline-flex items-center text-xs font-bold text-amber-600">
                                5 pending
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Scheduled event appointments</p>
                    </div>

                    {/* Revenue */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Total Revenue
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 text-lg font-bold">
                                💰
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">₱128K</span>
                            <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                                ↑ 14.2% this mo
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Total earned bookings</p>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Upcoming Bookings Schedule (8 Cols) */}
                    <div className="space-y-6 lg:col-span-8">
                        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                            <div className="flex items-center justify-between border-b border-slate-100 p-5">
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Upcoming Event Schedule
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Your next confirmed & pending event bookings
                                    </p>
                                </div>
                                <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                    Upcoming
                                </span>
                            </div>

                            <div className="divide-y divide-slate-100">
                                <div className="flex items-center justify-between p-4 transition hover:bg-slate-50/60">
                                    <div className="flex items-center gap-3.5">
                                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-700">
                                            <span className="text-[10px] uppercase font-bold text-indigo-500">AUG</span>
                                            <span className="text-base leading-none">20</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">John & Maria Wedding</p>
                                            <p className="text-xs text-slate-500">
                                                Full Wedding Photography • 📍 Cebu City
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
                                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-purple-50 font-bold text-purple-700">
                                            <span className="text-[10px] uppercase font-bold text-purple-500">AUG</span>
                                            <span className="text-base leading-none">24</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Sarah's 18th Birthday Debut</p>
                                            <p className="text-xs text-slate-500">
                                                Grand Debut Decoration Package • 📍 Lapu-Lapu City
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-extrabold text-slate-900">₱18,500.00</p>
                                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                                            Pending
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 transition hover:bg-slate-50/60">
                                    <div className="flex items-center gap-3.5">
                                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-emerald-50 font-bold text-emerald-700">
                                            <span className="text-[10px] uppercase font-bold text-emerald-500">AUG</span>
                                            <span className="text-base leading-none">29</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">ABC Company Annual Gala</p>
                                            <p className="text-xs text-slate-500">
                                                Corporate Event Coverage • 📍 Mandaue City
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

                    {/* Quick Tools & Team Collaboration (4 Cols) */}
                    <div className="space-y-6 lg:col-span-4">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <h2 className="text-base font-bold text-slate-900">
                                Quick Management
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Manage offerings & collaborations
                            </p>

                            <div className="mt-4 space-y-2.5">
                                <Link
                                    href={route('supplier.teams.index')}
                                    className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 transition hover:bg-indigo-50/80"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">
                                        👥
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-950">Team Collaboration</p>
                                        <p className="text-[11px] text-indigo-700">Build teams & create shared packages</p>
                                    </div>
                                </Link>

                                <Link
                                    href={route('supplier.services.index')}
                                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                                        🛠️
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">My Services</p>
                                        <p className="text-[11px] text-slate-500">Add or adjust service pricing</p>
                                    </div>
                                </Link>

                                <Link
                                    href={route('supplier.portfolio.index')}
                                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                                        📸
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Portfolio Showcase</p>
                                        <p className="text-[11px] text-slate-500">Upload past event galleries</p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Performance Metric Box */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-700">Profile Completion</span>
                                <span className="text-xs font-extrabold text-emerald-600">85%</span>
                            </div>
                            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                <div className="h-full rounded-full bg-emerald-500" style={{ width: '85%' }} />
                            </div>
                            <p className="mt-2 text-[11px] text-slate-400">
                                Add more portfolio projects to boost your ranking to 100%!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}