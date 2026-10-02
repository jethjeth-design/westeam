import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const statusColors = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    accepted: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    rejected: 'bg-red-50 text-red-700 ring-red-600/20',
    cancelled: 'bg-champagne text-softcharcoal ring-warmgray/20',
    completed: 'bg-champagne text-darkgold ring-champagnegold/20',
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
            <div className="min-h-screen bg-ivory/60 p-4 sm:p-6 lg:p-8">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-warmgray">📅 Admin</span>
                    <h1 className="mt-1 text-2xl font-extrabold text-softcharcoal">All Bookings</h1>
                    <p className="mt-0.5 text-sm text-warmgray">Monitor every booking across the platform.</p>
                </div>

                <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search ref, event, customer..."
                        className="w-full rounded-xl border border-warmbeige px-3 py-2 text-sm shadow-xs outline-none focus:border-champagnegold focus:ring-2 focus:ring-champagne sm:w-64"
                    />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full rounded-xl border border-warmbeige px-3 py-2 text-sm shadow-xs outline-none focus:border-champagnegold sm:w-36"
                    >
                        <option value="">All Statuses</option>
                        {['pending', 'accepted', 'rejected', 'cancelled', 'completed'].map((s) => (
                            <option key={s} value={s} className="capitalize">{s}</option>
                        ))}
                    </select>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full rounded-xl border border-warmbeige px-3 py-2 text-sm shadow-xs outline-none focus:border-champagnegold sm:w-40"
                    >
                        <option value="">All Types</option>
                        <option value="service">Service</option>
                        <option value="supplier_package">Package</option>
                        <option value="multi_supplier">AI Multi</option>
                        <option value="team_package">Team Package</option>
                    </select>
                    <button type="submit" className="w-full rounded-xl bg-champagnegold px-4 py-2 text-sm font-semibold text-white hover:bg-darkgold sm:w-auto">
                        Filter
                    </button>
                </form>

                <div className="mt-6 overflow-hidden rounded-2xl border border-warmbeige bg-white shadow-xs">
                    {bookingList.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] text-left text-sm">
                                <thead className="border-b border-champagne bg-ivory">
                                    <tr>
                                        {['Reference', 'Event', 'Customer', 'Type', 'Event Date', 'Amount', 'Status', 'Items'].map((h) => (
                                            <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-warmgray">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-champagne">
                                    {bookingList.map((b) => (
                                        <tr key={b.id} className="hover:bg-ivory/60 transition">
                                            <td className="px-4 py-3 font-mono text-xs font-bold text-softcharcoal">{b.booking_reference}</td>
                                            <td className="px-4 py-3">
                                                <p className="max-w-[150px] truncate text-xs font-semibold text-softcharcoal">{b.event_name}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-xs text-softcharcoal">{b.customer?.name}</p>
                                                <p className="text-[10px] text-warmgray">{b.customer?.email}</p>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-softcharcoal">{typeLabel[b.booking_type] ?? b.booking_type}</td>
                                            <td className="px-4 py-3 text-xs text-softcharcoal">{b.event_date ?? '—'}</td>
                                            <td className="px-4 py-3 text-xs font-semibold text-softcharcoal">
                                                ₱{Number(b.total_amount).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-inset capitalize ${statusColors[b.overall_status] ?? ''}`}>
                                                    {b.overall_status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-warmgray">{b.items?.length ?? 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-10 text-center">
                            <span className="text-3xl">📭</span>
                            <p className="mt-2 text-sm text-warmgray">No bookings found.</p>
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
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${link.active ? 'bg-champagnegold text-white' : 'bg-white text-softcharcoal border border-warmbeige hover:bg-ivory disabled:opacity-40'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
