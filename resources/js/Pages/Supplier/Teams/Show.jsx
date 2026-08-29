import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

export default function Show({ team, isCoordinator, userMembership }) {
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    // Search state for Invite Suppliers modal
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Team edit form
    const editForm = useForm({
        name: team.name || '',
        description: team.description || '',
        status: team.status || 'active',
    });

    // Role update form
    const roleForm = useForm({
        role_title: '',
    });

    // Invite form
    const inviteForm = useForm({
        supplier_id: '',
        role_title: '',
    });

    // Fetch suppliers when searching in Invite modal
    useEffect(() => {
        if (!isInviteModalOpen) return;

        const delayDebounceFn = setTimeout(() => {
            setIsSearching(true);
            fetch(
                route('supplier.teams.search-suppliers', {
                    team: team.id,
                    query: searchQuery,
                })
            )
                .then((res) => res.json())
                .then((data) => {
                    setSearchResults(data);
                    setIsSearching(false);
                })
                .catch(() => setIsSearching(false));
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, isInviteModalOpen, team.id]);

    const handleSendInvite = (supplier, customRole) => {
        router.post(
            route('supplier.teams.invite', team.id),
            {
                supplier_id: supplier.id,
                role_title: customRole || supplier.supplier_profile?.categories?.[0]?.name || 'Member',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Update search results to remove the invited supplier
                    setSearchResults((prev) => prev.filter((s) => s.id !== supplier.id));
                },
            }
        );
    };


    const handleUpdateTeam = (e) => {
        e.preventDefault();
        editForm.put(route('supplier.teams.update', team.id), {
            preserveScroll: true,
            onSuccess: () => setIsEditModalOpen(false),
        });
    };

    const handleOpenRoleModal = (member) => {
        setSelectedMember(member);
        roleForm.setData('role_title', member.role_title || '');
        setIsRoleModalOpen(true);
    };

    const handleUpdateRole = (e) => {
        e.preventDefault();
        if (!selectedMember) return;
        roleForm.put(
            route('supplier.teams.members.role', {
                team: team.id,
                member: selectedMember.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => setIsRoleModalOpen(false),
            }
        );
    };

    const handleRemoveMember = (member) => {
        if (
            confirm(
                `Are you sure you want to remove ${
                    member.supplier?.supplier_profile?.business_name || member.supplier?.name
                } from this team?`
            )
        ) {
            router.delete(
                route('supplier.teams.members.destroy', {
                    team: team.id,
                    member: member.id,
                }),
                { preserveScroll: true }
            );
        }
    };

    return (
        <DashboardLayout>
            <Head title={`${team.name} - Team Management`} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Navigation Breadcrumb */}
                <nav className="flex items-center gap-2 text-xs text-gray-500">
                    <Link href={route('supplier.teams.index')} className="hover:text-indigo-600">
                        My Teams
                    </Link>
                    <span>›</span>
                    <span className="font-semibold text-gray-800">{team.name}</span>
                </nav>

                {/* Team Header Banner */}
                <div className="mt-4 flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-black text-white shadow-sm">
                            {team.name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-gray-900">{team.name}</h1>
                                <span
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                        team.status === 'active'
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}
                                >
                                    {team.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Coordinator:{' '}
                                <span className="font-bold text-gray-800">
                                    {team.coordinator?.supplier_profile?.business_name || team.coordinator?.name}
                                </span>{' '}
                                • Created {new Date(team.created_at).toLocaleDateString()}
                            </p>
                            {team.description && (
                                <p className="mt-2 text-xs text-gray-600">{team.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                        {isCoordinator && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    ⚙️ Edit Details
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsInviteModalOpen(true)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-95"
                                >
                                    <span>➕</span> Invite Suppliers
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Main Content Grid: Left Members (Step 5) & Right Team Packages (Step 6) */}
                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Left: Team Members Roster (7 Cols) */}
                    <div className="space-y-6 lg:col-span-7">
                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">
                                        Team Members ({team.members?.length || 0})
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        Manage your team members, roles, and collaboration status.
                                    </p>
                                </div>

                                {isCoordinator && (
                                    <button
                                        type="button"
                                        onClick={() => setIsInviteModalOpen(true)}
                                        className="text-xs font-bold text-indigo-600 hover:underline"
                                    >
                                        + Invite More
                                    </button>
                                )}
                            </div>

                            {/* Member Roster List */}
                            <div className="mt-4 divide-y divide-gray-100">
                                {team.members?.map((member) => {
                                    const supplier = member.supplier;
                                    const isLead = supplier.id === team.coordinator_id;
                                    const profile = supplier.supplier_profile;
                                    const primaryCategory = profile?.categories?.[0]?.name || 'Supplier';

                                    return (
                                        <div
                                            key={member.id}
                                            className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-700 shadow-2xs">
                                                    {profile?.profile_picture ? (
                                                        <img
                                                            src={profile.profile_picture}
                                                            alt=""
                                                            className="h-full w-full rounded-xl object-cover"
                                                        />
                                                    ) : (
                                                        <span>{supplier.name.charAt(0)}</span>
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-gray-900">
                                                            {profile?.business_name || supplier.name}
                                                        </span>
                                                        {isLead && (
                                                            <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                                                                Coordinator
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        {primaryCategory} • {supplier.services?.length || 0} active services
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Role & Status Badges + Coordinator Controls */}
                                            <div className="flex items-center gap-2.5">
                                                {/* Role Pill */}
                                                <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                                                    {member.role_title}
                                                </span>

                                                {/* Status Pill */}
                                                {member.status === 'accepted' && (
                                                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                                        Member
                                                    </span>
                                                )}
                                                {member.status === 'pending' && (
                                                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                                                        Pending
                                                    </span>
                                                )}
                                                {member.status === 'declined' && (
                                                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                                                        Declined
                                                    </span>
                                                )}

                                                {/* Actions */}
                                                {isCoordinator && !isLead && (
                                                    <div className="flex items-center gap-1">
                                                        {/* Chat with Collaborator */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                router.post(route('messages.direct', supplier.id));
                                                            }}
                                                            className="rounded-lg p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"
                                                            title="Chat with Member"
                                                        >
                                                            💬
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenRoleModal(member)}
                                                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                                            title="Change Role"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveMember(member)}
                                                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                                            title="Remove Member"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                )}
                                                {/* Collaborator: chat with coordinator */}
                                                {!isCoordinator && isLead && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            router.post(route('messages.direct', supplier.id));
                                                        }}
                                                        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                                                        title="Chat with Coordinator"
                                                    >
                                                        💬 Chat
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Team Packages (Step 6) (5 Cols) */}
                    <div className="space-y-6 lg:col-span-5">
                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                                        📦
                                    </div>
                                    <h2 className="text-base font-bold text-gray-900">
                                        Team Packages
                                    </h2>
                                </div>

                                {isCoordinator && (
                                    <Link
                                        href={route('supplier.packages.create')}
                                        className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700"
                                    >
                                        + New Package
                                    </Link>
                                )}
                            </div>

                            <p className="mt-3 text-xs text-gray-500">
                                Combine services from team members into one complete event package and present it to customers.
                            </p>

                            {/* Packages List */}
                            <div className="mt-4 space-y-3">
                                {(team.packages || []).length > 0 ? (
                                    team.packages.map((pkg) => (
                                        <div
                                            key={pkg.id}
                                            className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:bg-gray-50"
                                        >
                                            <div>
                                                <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                                                    {pkg.event_category?.name || 'Package'}
                                                </span>
                                                <h4 className="mt-1 text-sm font-bold text-gray-900">
                                                    {pkg.name}
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    {(pkg.services || []).length} services included
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <span className="block text-sm font-extrabold text-gray-900">
                                                    ₱{Number(pkg.price || 0).toLocaleString('en-PH', {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </span>
                                                {isCoordinator && (
                                                    <Link
                                                        href={route('supplier.packages.edit', pkg.id)}
                                                        className="mt-1 inline-block text-xs font-semibold text-indigo-600 hover:underline"
                                                    >
                                                        Edit
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center">
                                        <span className="text-2xl">🎁</span>
                                        <p className="mt-2 text-xs font-medium text-gray-600">
                                            No team packages created yet.
                                        </p>
                                        <p className="mt-1 text-[11px] text-gray-400">
                                            Create packages that feature services from all accepted team members.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Informational Callout matching step 6 */}
                        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 p-5">
                            <div className="flex items-start gap-3">
                                <span className="text-xl">💡</span>
                                <div>
                                    <h4 className="text-xs font-bold text-indigo-900">
                                        How Team Packages Work
                                    </h4>
                                    <p className="mt-1 text-xs leading-5 text-indigo-800/80">
                                        As the Team Coordinator, when you create or edit a package, you can select services belonging to your accepted team members to offer an all-in-one bundle to clients.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Invite Suppliers (Step 3) */}
            {isInviteModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
                    onClick={() => setIsInviteModalOpen(false)}
                >
                    <div
                        className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Add Team Members
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Search and invite registered suppliers to collaborate in {team.name}.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsInviteModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="mt-4">
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-400">
                                    🔍
                                </span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search suppliers by name, business, or category (e.g. Photography, Catering)..."
                                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-9 pr-3 text-sm shadow-xs outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>
                        </div>

                        {/* Search Results List */}
                        <div className="mt-4 max-h-72 overflow-y-auto space-y-2.5 pr-1">
                            {isSearching ? (
                                <p className="py-6 text-center text-xs text-gray-400">
                                    Searching suppliers...
                                </p>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((supplier) => {
                                    const profile = supplier.supplier_profile;
                                    const categoryName =
                                        profile?.categories?.[0]?.name || 'Supplier';

                                    return (
                                        <div
                                            key={supplier.id}
                                            className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition hover:bg-gray-100/70"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700">
                                                    {supplier.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-900">
                                                        {profile?.business_name || supplier.name}
                                                    </h4>
                                                    <p className="text-[11px] text-gray-500">
                                                        {categoryName} • {supplier.services?.length || 0} services
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleSendInvite(supplier, categoryName)}
                                                className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 active:scale-95"
                                            >
                                                Invite
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-8 text-center text-xs text-gray-400">
                                    {searchQuery
                                        ? 'No matching suppliers found.'
                                        : 'Type above to search verified suppliers to invite.'}
                                </div>
                            )}
                        </div>

                        {/* Close Footer */}
                        <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsInviteModalOpen(false)}
                                className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Edit Team Details */}
            {isEditModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
                    onClick={() => setIsEditModalOpen(false)}
                >
                    <div
                        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                Edit Team Details
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdateTeam} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700">
                                    Team Name
                                </label>
                                <input
                                    type="text"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-xs outline-none focus:border-indigo-600"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    rows="3"
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-xs outline-none focus:border-indigo-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700">
                                    Status
                                </label>
                                <select
                                    value={editForm.data.status}
                                    onChange={(e) => editForm.setData('status', e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-xs outline-none focus:border-indigo-600"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Change Member Role */}
            {isRoleModalOpen && selectedMember && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
                    onClick={() => setIsRoleModalOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-gray-900">
                            Assign Member Role
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                            Assign a designated service or team role for{' '}
                            <strong>{selectedMember.supplier?.name}</strong>.
                        </p>

                        <form onSubmit={handleUpdateRole} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700">
                                    Role / Service Title
                                </label>
                                <input
                                    type="text"
                                    value={roleForm.data.role_title}
                                    onChange={(e) => roleForm.setData('role_title', e.target.value)}
                                    placeholder="e.g. Lead Photographer, Head Catering, Decorator"
                                    className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-xs outline-none focus:border-indigo-600"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsRoleModalOpen(false)}
                                    className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={roleForm.processing}
                                    className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                                >
                                    Save Role
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
