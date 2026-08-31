import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ stats, upcomingBooking, recentBookings = [] }) {
    const totalBookings = stats?.totalBookings || 0;
    const confirmedBookings = stats?.confirmedBookings || 0;
    const totalSpent = stats?.totalSpent || 0;

    // Upcoming Event Calculation
    const getDaysRemaining = (dateString) => {
        if (!dateString) return 0;
        const eventDate = new Date(dateString);
        const today = new Date();
        const diffTime = eventDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const daysRemaining = upcomingBooking ? getDaysRemaining(upcomingBooking.event_date) : 0;

    return (
        <DashboardLayout>
            <Head title="Customer Dashboard - Westeam Events" />

            <div className="min-h-screen bg-slate-50/60 p-6 lg:p-10">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                                🎉 Customer Portal
                            </span>
                            <span className="text-xs text-slate-400">• Event Planning</span>
                        </div>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                            Welcome back! 👋
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Plan your dream events, browse verified suppliers, and manage multi-vendor bookings.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href={route('customer.suppliers.index')}
                            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                        >
                            <span>🔍 Find Suppliers & Packages</span>
                            <span>→</span>
                        </Link>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {/* My Bookings */}
                    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Total Bookings
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-lg font-bold">
                                📅
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">{totalBookings}</span>
                            <span className="inline-flex items-center text-xs font-bold text-indigo-600">
                                {confirmedBookings} accepted
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Total requested reservations</p>
                    </div>

                    {/* Confirmed Services */}
                    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Confirmed Events
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 text-lg font-bold">
                                ✓
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">{confirmedBookings}</span>
                            <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                                Ready to go
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Accepted vendor bookings</p>
                    </div>

                    {/* Total Spent */}
                    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Total Spent
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 text-lg font-bold">
                                💰
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900">
                                ₱{Number(totalSpent).toLocaleString('en-PH', { minimumFractionDigits: 0 })}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Confirmed booking value</p>
                    </div>

                    {/* Find Suppliers */}
                    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Suppliers
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 text-lg font-bold">
                                🔍
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="text-sm font-black text-purple-700">Verified Vendors</span>
                        </div>
                        <Link
                            href={route('customer.suppliers.index')}
                            className="mt-1 block text-xs font-bold text-indigo-600 hover:underline"
                        >
                            Browse Directory →
                        </Link>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Featured Upcoming Event Details Showcase (8 Cols) */}
                    <div className="space-y-6 lg:col-span-8">
                        {upcomingBooking ? (
                            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
                                <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
                                    <div>
                                        <h2 className="text-base font-black text-slate-900">
                                            Upcoming Event Details
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Real-time overview of your next scheduled celebration
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                                        {upcomingBooking.overall_status === 'accepted' ? 'Confirmed Event' : 'Pending Approvals'}
                                    </span>
                                </div>

                                <div className="p-6 sm:p-8">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-indigo-50 font-bold text-indigo-700">
                                                <span className="text-[11px] uppercase font-bold text-indigo-500">
                                                    {new Date(upcomingBooking.event_date).toLocaleString('default', {
                                                        month: 'short',
                                                    })}
                                                </span>
                                                <span className="text-2xl leading-none">
                                                    {new Date(upcomingBooking.event_date).getDate()}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900">
                                                    {upcomingBooking.event_name}
                                                </h3>
                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    📍 {upcomingBooking.event_location} •{' '}
                                                    <span className="font-mono font-bold text-indigo-600">
                                                        {upcomingBooking.booking_reference}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        <span className="rounded-2xl bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 border border-slate-200/60">
                                            ⏳ {daysRemaining} Days Remaining
                                        </span>
                                    </div>

                                    {/* Booked Vendors in this event */}
                                    <div className="mt-6 border-t border-slate-100 pt-5">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Event Suppliers ({upcomingBooking.items?.length || 0})
                                            </p>
                                            <Link
                                                href={route('customer.bookings.show', upcomingBooking.id)}
                                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                                            >
                                                View Complete Breakdown →
                                            </Link>
                                        </div>

                                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                            {upcomingBooking.items?.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 border border-slate-100"
                                                >
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900">{item.item_name}</p>
                                                        <p className="text-[11px] text-slate-500">
                                                            {item.supplier?.name || 'Supplier'}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                            item.status === 'accepted'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : item.status === 'rejected'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-amber-100 text-amber-800'
                                                        }`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Total Investment Pill */}
                                    <div className="mt-6 flex items-center justify-between rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-white p-4 border border-indigo-100">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase text-indigo-900">Total Event Cost</p>
                                            <p className="text-lg font-black text-indigo-950">
                                                ₱{Number(upcomingBooking.total_amount).toLocaleString('en-PH', {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </p>
                                        </div>

                                        <Link
                                            href={route('customer.bookings.show', upcomingBooking.id)}
                                            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
                                        >
                                            Manage Event Bookings
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                                    🎉
                                </div>
                                <h3 className="mt-4 text-base font-bold text-slate-900">
                                    No upcoming events scheduled
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Start planning your wedding or special milestone by booking suppliers or team packages.
                                </p>
                                <Link
                                    href={route('customer.suppliers.index')}
                                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
                                >
                                    Browse Supplier Directory
                                </Link>
                            </div>
                        )}

                        {/* Recent Bookings Roster */}
                        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
                            <div className="flex items-center justify-between border-b border-slate-100 p-5">
                                <div>
                                    <h2 className="text-base font-black text-slate-900">
                                        Recent Bookings
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Your latest vendor reservations and status
                                    </p>
                                </div>
                                <Link
                                    href={route('customer.bookings.index')}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                                >
                                    View All ({totalBookings}) →
                                </Link>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {recentBookings.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-slate-400">
                                        No recent bookings to display.
                                    </div>
                                ) : (
                                    recentBookings.map((b) => (
                                        <div
                                            key={b.id}
                                            className="flex items-center justify-between p-4 transition hover:bg-slate-50/60"
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-lg">
                                                    📅
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900">
                                                        {b.event_name}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500">
                                                        {new Date(b.event_date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}{' '}
                                                        • {b.booking_reference}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-slate-900">
                                                        ₱{Number(b.total_amount).toLocaleString('en-PH', {
                                                            minimumFractionDigits: 2,
                                                        })}
                                                    </p>
                                                    <span
                                                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                            b.overall_status === 'accepted'
                                                                ? 'bg-emerald-50 text-emerald-700'
                                                                : b.overall_status === 'rejected'
                                                                ? 'bg-red-50 text-red-700'
                                                                : 'bg-amber-50 text-amber-700'
                                                        }`}
                                                    >
                                                        {b.overall_status}
                                                    </span>
                                                </div>

                                                <Link
                                                    href={route('customer.bookings.show', b.id)}
                                                    className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                                                >
                                                    View
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Tools & Assistance (4 Cols) */}
                    <div className="space-y-6 lg:col-span-4">
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
                            <h2 className="text-base font-black text-slate-900">
                                Quick Management
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Quick actions to find services
                            </p>

                            <div className="mt-4 space-y-3">
                                <Link
                                    href={route('customer.suppliers.index')}
                                    className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-3.5 transition hover:bg-indigo-50/80"
                                >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm">
                                        🔍
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-950">Supplier Directory</p>
                                        <p className="text-[11px] text-indigo-700">Browse verified vendor portfolios</p>
                                    </div>
                                </Link>

                                <Link
                                    href={route('customer.bookings.index')}
                                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                                >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-sm">
                                        📅
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">My Bookings</p>
                                        <p className="text-[11px] text-slate-500">View statuses & response feedback</p>
                                    </div>
                                </Link>

                                <Link
                                    href={route('messages.index')}
                                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                                >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold text-sm">
                                        💬
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Direct Messages</p>
                                        <p className="text-[11px] text-slate-500">Chat with coordinators and vendors</p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Explore Suppliers Banner */}
                        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/90 via-purple-50/40 to-white p-6 shadow-xs">
                            <div className="flex items-start gap-3.5">
                                <span className="text-3xl">🎉</span>
                                <div>
                                    <h3 className="text-sm font-black text-indigo-950">
                                        Planning an upcoming celebration?
                                    </h3>
                                    <p className="mt-1 text-xs leading-relaxed text-indigo-900/70">
                                        Explore our verified photographers, caterers, venues, and full event packages to make your day unforgettable.
                                    </p>
                                    <Link
                                        href={route('customer.suppliers.index')}
                                        className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700"
                                    >
                                        <span>Find Suppliers</span>
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