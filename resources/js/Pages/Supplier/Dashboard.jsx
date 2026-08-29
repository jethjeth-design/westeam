import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import RatingStars from '@/Components/RatingStars';

export default function Dashboard({
    supplierProfile,
    stats,
    upcomingBookings = [],
    recentReviews = [],
}) {
    const totalServices = stats?.totalServices || 0;
    const activeServices = stats?.activeServices || 0;
    const totalPackages = stats?.totalPackages || 0;
    const totalBookings = stats?.totalBookings || 0;
    const pendingBookings = stats?.pendingBookings || 0;
    const confirmedBookings = stats?.confirmedBookings || 0;
    const totalRevenue = stats?.totalRevenue || 0;
    const averageRating = Number(stats?.averageRating || 0).toFixed(1);
    const totalReviews = stats?.totalReviews || 0;
    const starDistribution = stats?.starDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    return (
        <DashboardLayout>
            <Head title="Supplier Dashboard - Westeam" />

            <div className="min-h-screen bg-slate-50/60 p-6 lg:p-10">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                                💼 Supplier Portal
                            </span>
                            <span className="text-xs text-slate-400">• Overview & Teams</span>
                        </div>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                            Supplier Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage your services, accept bookings, and collaborate with teams.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href={route('supplier.teams.index')}
                            className="inline-flex items-center gap-2 rounded-2xl border border-indigo-200 bg-white px-4 py-2.5 text-xs font-bold text-indigo-700 shadow-2xs transition hover:bg-indigo-50 active:scale-95"
                        >
                            <span>👥 My Teams</span>
                        </Link>
                        <Link
                            href={route('supplier.services.index')}
                            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                        >
                            <span className="text-base leading-none">+</span>
                            <span>Add Service</span>
                        </Link>
                    </div>
                </div>

                {/* Status Notice Banners */}
                {supplierProfile?.status === 'rejected' && (
                    <div className="mt-6 rounded-3xl border border-red-200 bg-red-50/80 p-5">
                        <div className="flex items-start gap-3.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-lg">
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
                    <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50/80 p-5">
                        <div className="flex items-start gap-3.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-lg">
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
                    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                My Services
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-lg font-bold">
                                🛠️
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">{totalServices}</span>
                            <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                                {activeServices} active
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Available individual offerings</p>
                    </div>

                    {/* Packages */}
                    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Packages
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 text-lg font-bold">
                                📦
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">{totalPackages}</span>
                            <span className="inline-flex items-center text-xs font-bold text-indigo-600">
                                Published
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Bundled service options</p>
                    </div>

                    {/* Bookings */}
                    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Client Bookings
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 text-lg font-bold">
                                📅
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">{totalBookings}</span>
                            <span className="inline-flex items-center text-xs font-bold text-amber-600">
                                {pendingBookings} pending
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">{confirmedBookings} confirmed bookings</p>
                    </div>

                    {/* Revenue */}
                    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Total Revenue
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 text-lg font-bold">
                                💰
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900">
                                ₱{Number(totalRevenue).toLocaleString('en-PH', { minimumFractionDigits: 0 })}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Total earned bookings</p>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Upcoming Bookings Schedule (8 Cols) */}
                    <div className="space-y-6 lg:col-span-8">
                        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
                            <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
                                <div>
                                    <h2 className="text-base font-black text-slate-900">
                                        Upcoming Event Schedule
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Your next confirmed & pending client bookings
                                    </p>
                                </div>
                                <Link
                                    href={route('supplier.bookings.index')}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                                >
                                    Manage Requests →
                                </Link>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {upcomingBookings.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-slate-400">
                                        No upcoming event bookings scheduled yet.
                                    </div>
                                ) : (
                                    upcomingBookings.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-4 sm:p-5 transition hover:bg-slate-50/60"
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-2xl bg-indigo-50 font-bold text-indigo-700">
                                                    <span className="text-[10px] uppercase font-bold text-indigo-500">
                                                        {item.booking?.event_date
                                                            ? new Date(item.booking.event_date).toLocaleString('default', { month: 'short' })
                                                            : 'EVT'}
                                                    </span>
                                                    <span className="text-base leading-none">
                                                        {item.booking?.event_date
                                                            ? new Date(item.booking.event_date).getDate()
                                                            : '—'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900">{item.booking?.event_name}</p>
                                                    <p className="text-[11px] text-slate-500">
                                                        {item.item_name} • 📍 {item.booking?.event_location}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-slate-900">
                                                    ₱{Number(item.unit_price).toLocaleString('en-PH', {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </p>
                                                <span
                                                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                        item.status === 'accepted'
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : item.status === 'rejected'
                                                            ? 'bg-red-50 text-red-700'
                                                            : 'bg-amber-50 text-amber-700'
                                                    }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Tools & Team Collaboration (4 Cols) */}
                    <div className="space-y-6 lg:col-span-4">
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
                            <h2 className="text-base font-black text-slate-900">
                                Quick Management
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Manage offerings & collaborations
                            </p>

                            <div className="mt-4 space-y-3">
                                <Link
                                    href={route('supplier.bookings.index')}
                                    className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-3.5 transition hover:bg-indigo-50/80"
                                >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm">
                                        📅
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-950">Booking Requests</p>
                                        <p className="text-[11px] text-indigo-700">Accept or decline client orders</p>
                                    </div>
                                </Link>

                                <Link
                                    href={route('supplier.teams.index')}
                                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                                >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold text-sm">
                                        👥
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Team Collaboration</p>
                                        <p className="text-[11px] text-slate-500">Build teams & shared packages</p>
                                    </div>
                                </Link>

                                <Link
                                    href={route('supplier.services.index')}
                                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                                >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-sm">
                                        🛠️
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">My Services</p>
                                        <p className="text-[11px] text-slate-500">Add or adjust service modal</p>
                                    </div>
                                </Link>

                                <Link
                                    href={route('supplier.portfolio.index')}
                                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                                >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-700 font-bold text-sm">
                                        📸
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Portfolio Showcase</p>
                                        <p className="text-[11px] text-slate-500">Upload past event galleries</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ratings, Star Distribution & Recent Feedback Section */}
                <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                    ⭐ Reputation & Feedback
                                </span>
                                <span className="text-xs text-slate-400">• Verified Client Reviews</span>
                            </div>
                            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                                Customer Ratings & Reviews
                            </h2>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-start">
                        {/* Rating Score Card (4 Cols) */}
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/80 to-orange-50/40 p-6 text-center lg:col-span-4">
                            <span className="text-5xl font-black tracking-tight text-slate-900">
                                {averageRating}
                            </span>
                            <div className="mt-2">
                                <RatingStars rating={averageRating} size="lg" />
                            </div>
                            <p className="mt-2 text-xs font-bold text-slate-700">
                                {totalReviews} {totalReviews === 1 ? 'Customer Review' : 'Customer Reviews'}
                            </p>

                            {/* Star Breakdown Bars */}
                            <div className="mt-6 w-full space-y-2 border-t border-amber-200/60 pt-4">
                                {[5, 4, 3, 2, 1].map((stars) => {
                                    const count = starDistribution[stars] || 0;
                                    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

                                    return (
                                        <div key={stars} className="flex items-center gap-2 text-xs">
                                            <span className="w-8 font-bold text-slate-700">{stars} ★</span>
                                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200/70">
                                                <div
                                                    className="h-full rounded-full bg-amber-400"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="w-8 text-right font-semibold text-slate-500">
                                                {count}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent Reviews Feed (8 Cols) */}
                        <div className="space-y-4 lg:col-span-8">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Recent Feedback ({recentReviews.length})
                            </h3>

                            {recentReviews.length > 0 ? (
                                <div className="space-y-3">
                                    {recentReviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 transition hover:bg-white hover:shadow-xs"
                                        >
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs">
                                                        {review.customer?.name ? review.customer.name.charAt(0).toUpperCase() : 'C'}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-slate-900">
                                                            {review.customer?.name || 'Verified Client'}
                                                        </h4>
                                                        <p className="text-[10px] text-slate-400">
                                                            Booked: <strong className="text-slate-700">{review.item_name}</strong>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <RatingStars rating={review.rating} size="xs" />
                                                    <span className="text-[10px] text-slate-400">
                                                        {new Date(review.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="mt-2.5 text-xs text-slate-600 leading-relaxed italic whitespace-pre-line">
                                                "{review.comment}"
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
                                    <span className="text-3xl">⭐</span>
                                    <h4 className="mt-2 text-xs font-bold text-slate-900">No Reviews Yet</h4>
                                    <p className="mt-1 text-[11px] text-slate-400 max-w-sm">
                                        Once your clients complete booked events, their ratings and reviews will appear here.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}