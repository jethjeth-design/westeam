import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ packages, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.packages.index'), { search, type }, { preserveState: true, replace: true });
    };

    const packageList = packages?.data || [];

    return (
        <DashboardLayout>
            <Head title="Packages - Admin" />
            <div className="min-h-screen bg-slate-50/60 p-6 lg:p-8">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">📦 Admin</span>
                    <h1 className="mt-1 text-2xl font-extrabold text-slate-900">All Packages</h1>
                    <p className="mt-0.5 text-sm text-slate-500">Browse all supplier and team packages on the platform.</p>
                </div>

                <form onSubmit={handleSearch} className="mt-6 flex flex-wrap items-center gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search package or supplier..."
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-64"
                    />
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-xs outline-none focus:border-indigo-500 w-36"
                    >
                        <option value="">All Types</option>
                        <option value="solo">Solo / Individual</option>
                        <option value="team">Team Package</option>
                    </select>
                    <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                        Filter
                    </button>
                </form>

                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                    {packageList.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-100 bg-slate-50">
                                    <tr>
                                        {['Package Name', 'Supplier', 'Category', 'Price', 'Type', 'Team', 'Status'].map((h) => (
                                            <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {packageList.map((pkg) => (
                                        <tr key={pkg.id} className="hover:bg-slate-50/60 transition">
                                            <td className="px-4 py-3 font-semibold text-slate-800 text-sm">{pkg.name}</td>
                                            <td className="px-4 py-3 text-xs text-slate-600">{pkg.supplier?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-xs text-slate-600">{pkg.event_category?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-xs font-semibold text-slate-800">₱{Number(pkg.price).toLocaleString()}</td>
                                            <td className="px-4 py-3">
                                                {pkg.team_id ? (
                                                    <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 ring-1 ring-inset ring-purple-600/20">
                                                        👥 Team
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 ring-1 ring-inset ring-blue-600/20">
                                                        🧑 Solo
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600">{pkg.team?.name ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-inset ${pkg.is_active ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-slate-100 text-slate-500 ring-slate-500/20'}`}>
                                                    {pkg.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-10 text-center">
                            <span className="text-3xl">📦</span>
                            <p className="mt-2 text-sm text-slate-500">No packages found.</p>
                        </div>
                    )}
                </div>

                {packages?.links && (
                    <div className="mt-4 flex flex-wrap gap-1">
                        {packages.links.map((link, i) => (
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
