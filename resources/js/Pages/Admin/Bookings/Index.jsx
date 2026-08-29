import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const statusColors = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    accepted: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    rejected: 'bg-red-50 text-red-700 ring-red-600/20',
    cancelled: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    completed: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
};

const typeLabel = {
    service: '🛠️ Service',
    supplier_package: '📦 Package',
    multi_supplier: '🤖 AI Multi',
    team_package: '👥 Team',
};

export default function Index({ bookings, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [type, setType] = useState(filters.type || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.bookings.index'), { search, status, type }, { preserveState: true, replace: true });
    };

    const bookingList = bookings?.data || [];

    return (
        <DashboardLayout>
            <Head title="Bookings - Admin" />
            <div className="min-h-screen bg-slate-50/60 p-6 lg:p-8">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">📅 Admin</span>
                    <h1 className="mt-1 text-2xl font-extrabold text-slate-900">All Bookings</h1>
                    <p className="mt-0.5 text-sm text-slate-500">Monitor every booking across the platform.</p>
                </div>

                <form onSubmit={handleSearch} className="mt-6 flex flex-wrap items-center gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search ref, event, customer..."
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-64"
                    />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-xs outline-none focus:border-indigo-500 w-36"
                    >
                        <option value="">All Statuses</option>
                        {['pending', 'accepted', 'rejected', 'cancelled', 'completed'].map((s) => (
                            <option key={s} value={s} className="capitalize">{s}</option>
                        ))}
                    </select>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-xs outline-none focus:border-indigo-500 w-40"
                    >
                        <option value="">All Types</option>
                        <option value="service">Service</option>
                        <option value="supplier_package">Package</option>
                        <option value="multi_supplier">AI Multi</option>
                        <option value="team_package">Team Package</option>
                    </select>
                    <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                        Filter
                    </button>
                </form>

                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                    {bookingList.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-100 bg-slate-50">
                                    <tr>
                                        {['Reference', 'Event', 'Customer', 'Type', 'Event Date', 'Amount', 'Status', 'Items'].map((h) => (
                                            <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {bookingList.map((b) => (
                                        <tr key={b.id} className="hover:bg-slate-50/60 transition">
                                            <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">{b.booking_reference}</td>
                                            <td className="px-4 py-3">
                                                <p className="max-w-[150px] truncate text-xs font-semibold text-slate-800">{b.event_name}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-xs text-slate-700">{b.customer?.name}</p>
                                                <p className="text-[10px] text-slate-400">{b.customer?.email}</p>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600">{typeLabel[b.booking_type] ?? b.booking_type}</td>
                                            <td className="px-4 py-3 text-xs text-slate-600">{b.event_date ?? '—'}</td>
                                            <td className="px-4 py-3 text-xs font-semibold text-slate-800">
                                                ₱{Number(b.total_amount).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-inset capitalize ${statusColors[b.overall_status] ?? ''}`}>
                                                    {b.overall_status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-500">{b.items?.length ?? 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-10 text-center">
                            <span className="text-3xl">📭</span>
                            <p className="mt-2 text-sm text-slate-500">No bookings found.</p>
                        </div>
                    )}
                </div>

                {bookings?.links && (
                    <div className="mt-4 flex flex-wrap gap-1">
                        {bookings.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${link.active ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-40'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
