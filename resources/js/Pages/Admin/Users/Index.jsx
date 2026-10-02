import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ users, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.users.index'), { search, role }, { preserveState: true, replace: true });
    };

    const handleDelete = (user) => {
        if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
        router.delete(route('admin.users.destroy', user.id), { preserveScroll: true });
    };

    const roleColors = {
        admin: 'bg-purple-50 text-purple-700 ring-purple-600/20',
        supplier: 'bg-blue-50 text-blue-700 ring-blue-600/20',
        customer: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    };

    const userList = users?.data || [];

    return (
        <DashboardLayout>
            <Head title="Users - Admin" />
            <div className="min-h-screen bg-ivory/60 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-warmgray">⚙️ Admin</span>
                        <h1 className="mt-1 text-2xl font-extrabold text-softcharcoal">All Users</h1>
                        <p className="mt-0.5 text-sm text-warmgray">Manage all platform accounts.</p>
                    </div>
                </div>

                {/* Filters */}
                <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name or email..."
                        className="w-full rounded-xl border border-warmbeige px-3 py-2 text-sm shadow-xs outline-none focus:border-champagnegold focus:ring-2 focus:ring-champagne sm:w-64"
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full rounded-xl border border-warmbeige px-3 py-2 text-sm shadow-xs outline-none focus:border-champagnegold sm:w-36"
                    >
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="supplier">Supplier</option>
                        <option value="customer">Customer</option>
                    </select>
                    <button
                        type="submit"
                        className="w-full rounded-xl bg-champagnegold px-4 py-2 text-sm font-semibold text-white hover:bg-darkgold sm:w-auto"
                    >
                        Search
                    </button>
                </form>

                <div className="mt-6 overflow-hidden rounded-2xl border border-warmbeige bg-white shadow-xs">
                    {userList.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[550px] text-left text-sm">
                                <thead className="border-b border-champagne bg-ivory">
                                    <tr>
                                        {['Name', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                                            <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-warmgray">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-champagne">
                                    {userList.map((user) => (
                                        <tr key={user.id} className="hover:bg-ivory/60 transition">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-champagne text-xs font-bold text-darkgold">
                                                        {user.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-softcharcoal">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-softcharcoal">{user.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-inset capitalize ${roleColors[user.role] ?? 'bg-champagne text-softcharcoal ring-warmgray/20'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-warmgray">
                                                {new Date(user.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-3">
                                                {user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleDelete(user)}
                                                        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-10 text-center">
                            <span className="text-3xl">👥</span>
                            <p className="mt-2 text-sm text-warmgray">No users found.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {users?.links && (
                    <div className="mt-4 flex gap-1">
                        {users.links.map((link, i) => (
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
