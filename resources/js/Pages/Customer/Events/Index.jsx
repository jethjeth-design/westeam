import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

const statusColors = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20', dot: 'bg-amber-500', label: '⏳ Pending' },
    accepted: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20', dot: 'bg-emerald-500', label: '✓ Confirmed' },
    completed: { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-600/20', dot: 'bg-indigo-500', label: '🎉 Completed' },
};

const itemStatusColors = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    accepted: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    rejected: 'bg-red-50 text-red-700 ring-red-600/20',
    completed: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
};

const bookingTypeIcons = {
    service: '🛠️',
    supplier_package: '📦',
    multi_supplier: '🤖',
    team_package: '👥',
};

function CountdownBadge({ days }) {
    if (days === null || days === undefined) return null;
    if (days < 0) return <span className="text-xs font-bold text-slate-400">Passed</span>;
    if (days === 0) return <span className="inline-flex items-center rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white animate-pulse">🎉 Today!</span>;
    if (days <= 7) return (
        <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700 ring-1 ring-inset ring-red-600/20">
            🔥 {days}d away
        </span>
    );
    if (days <= 30) return (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 ring-1 ring-inset ring-amber-600/20">
            ⚡ {days}d away
        </span>
    );
    return (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            📅 {days} days away
        </span>
    );
}

export default function Index({ events = [], stats = {} }) {
    const [filter, setFilter] = useState('all'); // 'all' | 'upcoming' | 'completed'
    const [expandedId, setExpandedId] = useState(null);

    const filtered = events.filter((e) => {
        if (filter === 'upcoming') return e.is_upcoming && e.overall_status !== 'completed';
        if (filter === 'completed') return e.overall_status === 'completed';
        return true;
    });

    return (
        <DashboardLayout>
            <Head title="My Events - Westeam" />

            <div className="min-h-screen bg-slate-50/60 p-6 lg:p-10">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                                🎉 My Events
                            </span>
                        </div>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                            Event Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Track your booked events, vendor statuses, and upcoming milestones.
                        </p>
                    </div>
                    <Link
                        href={route('customer.suppliers.index')}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                    >
                        + Book New Event
                    </Link>
                </div>

                {/* Stats */}
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                        { label: 'Upcoming Events', value: stats.upcoming ?? 0, icon: '🗓️', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { label: 'Total Events', value: stats.total ?? 0, icon: '📋', color: 'text-slate-700', bg: 'bg-slate-100' },
                        { label: 'Total Vendors Booked', value: stats.vendors ?? 0, icon: '🏢', color: 'text-violet-600', bg: 'bg-violet-50' },
                    ].map((s) => (
                        <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{s.label}</span>
                                <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${s.bg}`}>
                                    {s.icon}
                                </div>
                            </div>
                            <p className={`mt-2 text-3xl font-black ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div className="mt-8 flex gap-2">
                    {[
                        { key: 'all', label: `All (${events.length})` },
                        { key: 'upcoming', label: `Upcoming (${stats.upcoming ?? 0})` },
                        { key: 'completed', label: 'Completed' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                                filter === tab.key
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Event Cards */}
                <div className="mt-4 space-y-4">
                    {filtered.length > 0 ? (
                        filtered.map((event) => {
                            const st = statusColors[event.overall_status] ?? statusColors.pending;
                            const isExpanded = expandedId === event.id;

                            return (
                                <div
                                    key={event.id}
                                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md"
                                >
                                    {/* Card Header */}
                                    <div
                                        className="flex cursor-pointer items-start justify-between gap-4 p-5"
                                        onClick={() => setExpandedId(isExpanded ? null : event.id)}
                                    >
                                        <div className="flex items-start gap-4 min-w-0">
                                            {/* Type Icon */}
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                                                {bookingTypeIcons[event.booking_type] ?? '📋'}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="truncate text-base font-black text-slate-900">
                                                        {event.event_name}
                                                    </h3>
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-inset ${st.bg} ${st.text} ${st.ring}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                                                        {st.label}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 text-xs text-slate-500 font-mono">{event.booking_reference}</p>
                                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                                    {event.event_date && (
                                                        <span>📅 {new Date(event.event_date).toLocaleDateString('en-PH', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                    )}
                                                    {event.event_time && <span>🕐 {event.event_time}</span>}
                                                    {event.event_location && <span>📍 {event.event_location}</span>}
                                                    {event.guest_count && <span>👥 {event.guest_count} guests</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-2">
                                            <CountdownBadge days={event.days_until} />
                                            <p className="text-sm font-black text-slate-900">
                                                ₱{Number(event.total_amount).toLocaleString()}
                                            </p>
                                            <span className="text-xs text-slate-400">{event.items?.length ?? 0} vendor{event.items?.length !== 1 ? 's' : ''}</span>
                                            <span className="text-[10px] text-slate-400">{isExpanded ? '▲ Collapse' : '▼ Details'}</span>
                                        </div>
                                    </div>

                                    {/* Expanded Vendor Roster */}
                                    {isExpanded && (
                                        <div className="border-t border-slate-100 bg-slate-50/60 p-5">
                                            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Vendor Lineup
                                            </p>
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                {(event.items ?? []).map((item) => (
                                                    <div key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-black text-indigo-700">
                                                            {item.supplier?.business_name?.charAt(0) ?? item.supplier?.name?.charAt(0) ?? '?'}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-xs font-bold text-slate-800">
                                                                {item.supplier?.business_name ?? item.supplier?.name ?? 'Supplier'}
                                                            </p>
                                                            <p className="truncate text-[10px] text-slate-500">{item.item_name}</p>
                                                            <p className="text-[10px] font-semibold text-indigo-600">₱{Number(item.unit_price).toLocaleString()}</p>
                                                        </div>
                                                        <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold ring-1 ring-inset capitalize ${itemStatusColors[item.status] ?? ''}`}>
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Team info */}
                                            {event.team && (
                                                <div className="mt-4 flex items-center gap-2 rounded-xl border border-purple-100 bg-purple-50 p-3">
                                                    <span className="text-lg">👥</span>
                                                    <div>
                                                        <p className="text-xs font-bold text-purple-900">{event.team.name}</p>
                                                        <p className="text-[10px] text-purple-600">Coordinator: {event.team.coordinator}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-4 flex gap-2">
                                                <Link
                                                    href={route('customer.bookings.show', event.id)}
                                                    className="rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-50"
                                                >
                                                    View Full Booking →
                                                </Link>
                                                <Link
                                                    href={route('messages.index')}
                                                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                                >
                                                    💬 Message Vendors
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
                            <span className="text-4xl">🎊</span>
                            <h3 className="mt-3 text-base font-bold text-slate-900">No events yet</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Start planning your dream event by booking suppliers.
                            </p>
                            <Link
                                href={route('customer.suppliers.index')}
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
                            >
                                🔍 Find Suppliers
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
