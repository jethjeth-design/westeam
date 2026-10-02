import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ customers, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.customers.index'), { search }, { preserveState: true, replace: true });
    };

    const customerList = customers?.data || [];

    return (
        <DashboardLayout>
            <Head title="Customers - Admin" />
            <div className="min-h-screen bg-ivory/60 p-4 sm:p-6 lg:p-8">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-warmgray">👤 Admin</span>
                    <h1 className="mt-1 text-2xl font-extrabold text-softcharcoal">Customers</h1>
                    <p className="mt-0.5 text-sm text-warmgray">All registered customer accounts and their booking activity.</p>
                </div>

                <form onSubmit={handleSearch} className="mt-6 flex items-center gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="rounded-xl border border-warmbeige px-3 py-2 text-sm shadow-xs outline-none focus:border-champagnegold focus:ring-2 focus:ring-champagne w-64"
                    />
                    <button type="submit" className="rounded-xl bg-champagnegold px-4 py-2 text-sm font-semibold text-white hover:bg-darkgold">
                        Search
                    </button>
                </form>

                <div className="mt-6 overflow-hidden rounded-2xl border border-warmbeige bg-white shadow-xs">
                    {customerList.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-champagne bg-ivory">
                                    <tr>
                                        {['Customer', 'Email', 'Total Bookings', 'Joined'].map((h) => (
                                            <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-warmgray">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-champagne">
                                    {customerList.map((c) => (
                                        <tr key={c.id} className="hover:bg-ivory/60 transition">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700">
                                                        {c.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-softcharcoal">{c.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-softcharcoal">{c.email}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center rounded-full bg-champagne px-2.5 py-0.5 text-xs font-bold text-darkgold ring-1 ring-inset ring-champagnegold/20">
                                                    {c.bookings_count} bookings
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-warmgray">
                                                {new Date(c.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-10 text-center">
                            <span className="text-3xl">👤</span>
                            <p className="mt-2 text-sm text-warmgray">No customers found.</p>
                        </div>
                    )}
                </div>

                {customers?.links && (
                    <div className="mt-4 flex gap-1">
                        {customers.links.map((link, i) => (
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
