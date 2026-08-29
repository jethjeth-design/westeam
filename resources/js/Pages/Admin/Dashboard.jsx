import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';

const statusColors = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    accepted: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    rejected: 'bg-red-50 text-red-700 ring-red-600/20',
    cancelled: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    completed: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
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
        { label: 'Total Customers', value: stats.totalCustomers ?? 0, icon: '👥', color: 'text-indigo-600', bg: 'bg-indigo-50', href: route('admin.customers.index') },
        { label: 'Total Suppliers', value: stats.totalSuppliers ?? 0, icon: '🏢', color: 'text-violet-600', bg: 'bg-violet-50', href: route('admin.suppliers.index') },
        { label: 'Total Bookings', value: stats.totalBookings ?? 0, icon: '📅', color: 'text-blue-600', bg: 'bg-blue-50', href: route('admin.bookings.index') },
        { label: 'Total Revenue', value: fmt(stats.totalRevenue ?? 0), icon: '💰', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    return (
        <DashboardLayout>
            <Head title="Admin Dashboard - Westeam" />

            <div className="min-h-screen bg-slate-50/60 p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                                🛡️ Admin Portal
                            </span>
                            <span className="text-xs text-slate-400">• System Overview</span>
                        </div>
                        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                            System Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Monitor bookings, suppliers, customers and platform metrics in real-time.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
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
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
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
                            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    {card.label}
                                </span>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${card.bg} ${card.color}`}>
                                    {card.icon}
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="text-2xl font-black text-slate-900">{card.value}</span>
                            </div>
                            {card.href && (
                                <Link href={card.href} className="mt-2 text-xs font-semibold text-indigo-600 hover:underline">
                                    View all →
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                {/* Booking Status Summary */}
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {['pending', 'accepted', 'rejected', 'cancelled', 'completed'].map((st) => (
                        <div key={st} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                            <p className="text-xs font-semibold capitalize text-slate-500">{st}</p>
                            <p className="mt-1 text-2xl font-black text-slate-900">{bookingsByStatus[st] ?? 0}</p>
                            <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${statusColors[st] ?? ''}`}>
                                {st}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Recent Bookings Monitoring */}
                <div className="mt-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-slate-900">📋 Recent Bookings</h2>
                        <Link href={route('admin.bookings.index')} className="text-xs font-semibold text-indigo-600 hover:underline">
                            View All →
                        </Link>
                    </div>
                    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                        {recentBookings.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-slate-100 bg-slate-50">
                                        <tr>
                                            {['Reference', 'Event', 'Customer', 'Type', 'Date', 'Amount', 'Status'].map((h) => (
                                                <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {recentBookings.map((b) => (
                                            <tr key={b.id} className="transition hover:bg-slate-50/60">
                                                <td className="px-4 py-3">
                                                    <span className="font-mono text-xs font-bold text-slate-700">
                                                        {b.booking_reference}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="max-w-[160px] truncate text-xs font-semibold text-slate-800">
                                                        {b.event_name}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-xs text-slate-600">{b.customer?.name}</p>
                                                    <p className="text-[10px] text-slate-400">{b.customer?.email}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-slate-600">
                                                        {bookingTypeLabel[b.booking_type] ?? b.booking_type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-600">
                                                    {b.event_date ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 text-xs font-semibold text-slate-800">
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
                                <p className="mt-2 text-sm text-slate-500">No bookings yet.</p>
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
                            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-indigo-300 hover:shadow-md"
                        >
                            <span className="text-2xl">{link.icon}</span>
                            <span className="text-sm font-bold text-slate-800">{link.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}