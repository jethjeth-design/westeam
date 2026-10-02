import NotificationBell from '@/Components/NotificationBell';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';

const statusColors = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    accepted: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    rejected: 'bg-red-50 text-red-700 ring-red-600/20',
    cancelled: 'bg-champagne text-softcharcoal ring-warmgray/20',
    completed: 'bg-champagne text-darkgold ring-champagnegold/20',
};

const bookingTypeLabel = {
    service: '🛠️ Service',
    supplier_package: '📦 Package',
    multi_supplier: '🤖 AI Multi',
    team_package: '👥 Team',
};

export default function Dashboard({ stats = {}, recentBookings = [], bookingsByStatus = {} }) {
    const fmt = (n) =>
        Number(n).toLocaleString('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });

    const statCards = [
        { label: 'Total Customers', value: stats.totalCustomers ?? 0, icon: '👥', color: 'text-champagnegold', bg: 'bg-champagne', href: route('admin.customers.index') },
        { label: 'Total Suppliers', value: stats.totalSuppliers ?? 0, icon: '🏢', color: 'text-darkgold', bg: 'bg-violet-50', href: route('admin.suppliers.index') },
        { label: 'Total Bookings', value: stats.totalBookings ?? 0, icon: '📅', color: 'text-blue-600', bg: 'bg-blue-50', href: route('admin.bookings.index') },
        { label: 'Total Revenue', value: fmt(stats.totalRevenue ?? 0), icon: '💰', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    return (
        <DashboardLayout>
            <Head title="Admin Dashboard - Westeam" />

            <div className="min-h-screen bg-ivory/60 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-champagne px-2.5 py-1 text-xs font-bold text-darkgold ring-1 ring-inset ring-indigo-700/10">
                                🛡️ Admin Portal
                            </span>
                            <span className="text-xs text-warmgray">• System Overview</span>
                        </div>
                        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-softcharcoal">
                            System Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-warmgray">
                            Monitor bookings, suppliers, customers and platform metrics in real-time.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <NotificationBell className="bg-white border border-warmbeige/70 rounded-xl shadow-2xs" />
                        {stats.pendingSuppliers > 0 && (
                            <Link
                                href={route('admin.suppliers.index')}
                                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 active:scale-95"
                            >
                                ⏳ {stats.pendingSuppliers} Pending Suppliers
                            </Link>
                        )}
                        <Link
                            href={route('admin.bookings.index')}
                            className="inline-flex items-center gap-2 rounded-xl bg-champagnegold px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-darkgold active:scale-95"
                        >
                            📅 All Bookings
                        </Link>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card) => (
                        <div
                            key={card.label}
                            className="overflow-hidden rounded-2xl border border-warmbeige/80 bg-white p-5 shadow-xs transition hover:shadow-md"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-warmgray">
                                    {card.label}
                                </span>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${card.bg} ${card.color}`}>
                                    {card.icon}
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="text-2xl font-black text-softcharcoal">{card.value}</span>
                            </div>
                            {card.href && (
                                <Link href={card.href} className="mt-2 text-xs font-semibold text-champagnegold hover:underline">
                                    View all →
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                {/* Booking Status Summary */}
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {['pending', 'accepted', 'rejected', 'cancelled', 'completed'].map((st) => (
                        <div key={st} className="rounded-2xl border border-warmbeige bg-white p-4 shadow-xs">
                            <p className="text-xs font-semibold capitalize text-warmgray">{st}</p>
                            <p className="mt-1 text-2xl font-black text-softcharcoal">{bookingsByStatus[st] ?? 0}</p>
                            <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${statusColors[st] ?? ''}`}>
                                {st}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Recent Bookings Monitoring */}
                <div className="mt-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-softcharcoal">📋 Recent Bookings</h2>
                        <Link href={route('admin.bookings.index')} className="text-xs font-semibold text-champagnegold hover:underline">
                            View All →
                        </Link>
                    </div>
                    <div className="mt-4 overflow-hidden rounded-2xl border border-warmbeige bg-white shadow-xs">
                        {recentBookings.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[640px] text-left text-sm">
                                    <thead className="border-b border-champagne bg-ivory">
                                        <tr>
                                            {['Reference', 'Event', 'Customer', 'Type', 'Date', 'Amount', 'Status'].map((h) => (
                                                <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-warmgray">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-champagne">
                                        {recentBookings.map((b) => (
                                            <tr key={b.id} className="transition hover:bg-ivory/60">
                                                <td className="px-4 py-3">
                                                    <span className="font-mono text-xs font-bold text-softcharcoal">
                                                        {b.booking_reference}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="max-w-[160px] truncate text-xs font-semibold text-softcharcoal">
                                                        {b.event_name}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-xs text-softcharcoal">{b.customer?.name}</p>
                                                    <p className="text-[10px] text-warmgray">{b.customer?.email}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-softcharcoal">
                                                        {bookingTypeLabel[b.booking_type] ?? b.booking_type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-softcharcoal">
                                                    {b.event_date ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 text-xs font-semibold text-softcharcoal">
                                                    ₱{Number(b.total_amount).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-inset ${statusColors[b.overall_status] ?? ''}`}
                                                    >
                                                        {b.overall_status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-10 text-center">
                                <span className="text-3xl">📭</span>
                                <p className="mt-2 text-sm text-warmgray">No bookings yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Nav Links */}
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: 'Manage Users', href: route('admin.users.index'), icon: '👥' },
                        { label: 'Manage Customers', href: route('admin.customers.index'), icon: '👤' },
                        { label: 'Manage Packages', href: route('admin.packages.index'), icon: '📦' },
                        { label: 'Review Suppliers', href: route('admin.suppliers.index'), icon: '🏢' },
                    ].map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="flex items-center gap-3 rounded-2xl border border-warmbeige bg-white p-5 shadow-xs transition hover:border-indigo-300 hover:shadow-md"
                        >
                            <span className="text-2xl">{link.icon}</span>
                            <span className="text-sm font-bold text-softcharcoal">{link.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}