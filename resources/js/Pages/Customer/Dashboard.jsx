import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <DashboardLayout>
            <Head title="Customer Dashboard - Westeam Events" />

            <div className="min-h-screen bg-slate-50/60 p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                                🎉 Customer Portal
                            </span>
                            <span className="text-xs text-slate-400">• Event Planning</span>
                        </div>
                        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                            Welcome back! 👋
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Plan your dream events, browse verified suppliers, and discover multi-vendor packages.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href={route('customer.suppliers.index')}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                        >
                            <span>🔍 Find Suppliers & Packages</span>
                            <span>→</span>
                        </Link>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {/* My Events */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                My Events
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 text-lg font-bold">
                                🎉
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">3</span>
                            <span className="inline-flex items-center text-xs font-bold text-indigo-600">
                                1 upcoming
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Scheduled celebrations</p>
                    </div>

                    {/* Bookings */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                My Bookings
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-lg font-bold">
                                📅
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">7</span>
                            <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                                5 confirmed
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Vendor services reserved</p>
                    </div>

                    {/* Saved Suppliers */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Saved Suppliers
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600 text-lg font-bold">
                                ❤️
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">12</span>
                            <span className="inline-flex items-center text-xs font-bold text-pink-600">
                                Shortlisted
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Favorite vendors & packages</p>
                    </div>

                    {/* Budget */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Event Budget
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 text-lg font-bold">
                                💰
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">₱100K</span>
                            <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                                ₱32K left
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Estimated spending limit</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Featured Upcoming Event Showcase (8 Cols) */}
                    <div className="space-y-6 lg:col-span-8">
                        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                            <div className="flex items-center justify-between border-b border-slate-100 p-5">
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Upcoming Event Details
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Track your event preparations and vendor milestones
                                    </p>
                                </div>
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                    Planning Phase
                                </span>
                            </div>

                            <div className="p-6">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-indigo-50 font-bold text-indigo-700">
                                            <span className="text-[10px] uppercase font-bold text-indigo-500">SEP</span>
                                            <span className="text-lg leading-none">15</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-extrabold text-slate-900">
                                                John & Maria Grand Wedding
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Wedding Celebration • 📍 Grand Ballroom, Cebu City
                                            </p>
                                        </div>
                                    </div>
                                    <span className="rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200/60">
                                        32 Days Remaining
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-6">
                                    <div className="mb-2 flex justify-between text-xs">
                                        <span className="font-bold text-slate-700">Vendor Planning Progress</span>
                                        <span className="font-extrabold text-indigo-600">68% Complete</span>
                                    </div>
                                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                        <div className="h-full rounded-full bg-indigo-600" style={{ width: '68%' }} />
                                    </div>
                                </div>

                                {/* Quick Metric Pills */}
                                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                                        <p className="text-xs text-slate-500">Booked Vendors</p>
                                        <p className="mt-1 text-base font-extrabold text-slate-900">5 / 7</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                                        <p className="text-xs text-slate-500">Budget Spent</p>
                                        <p className="mt-1 text-base font-extrabold text-slate-900">₱68,000</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                                        <p className="text-xs text-slate-500">Remaining Budget</p>
                                        <p className="mt-1 text-base font-extrabold text-emerald-600">₱32,000</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Bookings Roster */}
                        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                            <div className="border-b border-slate-100 p-5">
                                <h2 className="text-base font-bold text-slate-900">
                                    Recent Bookings
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Your vendor reservations and status
                                </p>
                            </div>

                            <div className="divide-y divide-slate-100">
                                <div className="flex items-center justify-between p-4 transition hover:bg-slate-50/60">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600 text-lg">
                                            📸
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Bright Moments Photography</p>
                                            <p className="text-xs text-slate-500">Full Wedding Photography • Sep 15, 2026</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-extrabold text-slate-900">₱25,000.00</p>
                                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                                            Confirmed
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 transition hover:bg-slate-50/60">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 text-lg">
                                            🎂
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Elegant Events PH</p>
                                            <p className="text-xs text-slate-500">Birthday Decoration Package • Oct 03, 2026</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-extrabold text-slate-900">₱18,500.00</p>
                                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                                            Pending
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Exploration & Assistant (4 Cols) */}
                    <div className="space-y-6 lg:col-span-4">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                            <h2 className="text-base font-bold text-slate-900">
                                Explore & Plan
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Quick actions to find services
                            </p>

                            <div className="mt-4 space-y-2.5">
                                <Link
                                    href={route('customer.suppliers.index')}
                                    className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 transition hover:bg-indigo-50/80"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white text-base">
                                        🔍
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-950">Supplier Directory</p>
                                        <p className="text-[11px] text-indigo-700">Browse verified vendor portfolios</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/customer/events"
                                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700 text-base">
                                        🎉
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">My Events</p>
                                        <p className="text-[11px] text-slate-500">Create & manage events</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/customer/bookings"
                                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-base">
                                        📅
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Booking Management</p>
                                        <p className="text-[11px] text-slate-500">View contracts & payment status</p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* AI Assistant Help Banner */}
                        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-white p-5 shadow-xs">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🤖</span>
                                <div>
                                    <h3 className="text-xs font-bold text-indigo-950">
                                        Need help planning your event?
                                    </h3>
                                    <p className="mt-1 text-xs leading-relaxed text-indigo-900/70">
                                        Tell our AI assistant your budget and preferences to get matched with suppliers and multi-vendor packages.
                                    </p>
                                    <Link
                                        href="/customer/ai-assistant"
                                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
                                    >
                                        <span>Chat with AI Assistant</span>
                                        <span>→</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}