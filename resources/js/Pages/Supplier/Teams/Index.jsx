import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ coordinatedTeams = [], myMemberships = [] }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('coordinated'); // 'coordinated' | 'memberships'

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    const handleCreateTeam = (e) => {
        e.preventDefault();
        post(route('supplier.teams.store'), {
            onSuccess: () => {
                reset();
                setIsCreateModalOpen(false);
            },
        });
    };

    const handleAccept = (memberId) => {
        router.post(route('supplier.teams.invitations.accept', memberId), {}, {
            preserveScroll: true,
        });
    };

    const handleDecline = (memberId) => {
        router.post(route('supplier.teams.invitations.decline', memberId), {}, {
            preserveScroll: true,
        });
    };

    const pendingInvitations = myMemberships.filter((m) => m.status === 'pending');
    const acceptedMemberships = myMemberships.filter((m) => m.status === 'accepted');

    return (
        <DashboardLayout>
            <Head title="My Teams - Supplier Collaboration" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header with Title & Action */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-champagnegold">
                            <span>✨ Collaborate & Grow</span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-softcharcoal">
                            My Teams
                        </h1>
                        <p className="mt-1 text-sm text-warmgray">
                            Build your dream team by collaborating with other trusted suppliers and offer complete event packages.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-champagnegold px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-darkgold active:scale-95"
                    >
                        <span className="text-lg leading-none">+</span>
                        Create New Team
                    </button>
                </div>

                {/* Pending Invitations Alert Banner */}
                {pendingInvitations.length > 0 && (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-champagne bg-gradient-to-r from-champagnegold/10 via-purple-500/10 to-pink-500/10 p-5 shadow-xs">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-champagnegold text-lg text-white">
                                📩
                            </span>
                            <div>
                                <h3 className="text-sm font-bold text-softcharcoal">
                                    You have {pendingInvitations.length} Pending Team Invitation{pendingInvitations.length > 1 ? 's' : ''}!
                                </h3>
                                <p className="text-xs text-warmgray">
                                    Other suppliers invited you to join their team and collaborate on event packages.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                            {pendingInvitations.map((membership) => (
                                <div
                                    key={membership.id}
                                    className="flex items-center justify-between rounded-xl border border-champagne bg-white p-4 shadow-xs"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-champagne text-darkgold font-bold">
                                            {membership.team?.name?.charAt(0) || 'T'}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-softcharcoal">
                                                {membership.team?.name}
                                            </h4>
                                            <p className="text-xs text-warmgray">
                                                Coordinator:{' '}
                                                <span className="font-semibold text-softcharcoal">
                                                    {membership.team?.coordinator?.supplier_profile?.business_name ||
                                                        membership.team?.coordinator?.name}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleDecline(membership.id)}
                                            className="rounded-lg border border-warmbeige bg-white px-3 py-1.5 text-xs font-semibold text-softcharcoal hover:bg-ivory"
                                        >
                                            Decline
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleAccept(membership.id)}
                                            className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                                        >
                                            Accept Invitation
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tabs Navigation */}
                <div className="mt-8 flex border-b border-warmbeige">
                    <button
                        type="button"
                        onClick={() => setActiveTab('coordinated')}
                        className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
                            activeTab === 'coordinated'
                                ? 'border-champagnegold text-champagnegold'
                                : 'border-transparent text-warmgray hover:text-softcharcoal'
                        }`}
                    >
                        <span>👑 Teams I Coordinate</span>
                        <span className="rounded-full bg-champagne px-2 py-0.5 text-xs text-warmgray">
                            {coordinatedTeams.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('memberships')}
                        className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
                            activeTab === 'memberships'
                                ? 'border-champagnegold text-champagnegold'
                                : 'border-transparent text-warmgray hover:text-softcharcoal'
                        }`}
                    >
                        <span>🤝 Teams I Joined</span>
                        <span className="rounded-full bg-champagne px-2 py-0.5 text-xs text-warmgray">
                            {acceptedMemberships.length}
                        </span>
                    </button>
                </div>

                {/* Tab Content 1: Coordinated Teams */}
                {activeTab === 'coordinated' && (
                    <div className="mt-6">
                        {coordinatedTeams.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {coordinatedTeams.map((team) => {
                                    const acceptedCount = (team.members || []).filter(
                                        (m) => m.status === 'accepted'
                                    ).length;
                                    const pendingCount = (team.members || []).filter(
                                        (m) => m.status === 'pending'
                                    ).length;
                                    const packagesCount = (team.packages || []).length;

                                    return (
                                        <div
                                            key={team.id}
                                            className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-warmbeige bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-md"
                                        >
                                            <div className="p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-champagne text-xl font-black text-champagnegold">
                                                        {team.name.charAt(0)}
                                                    </div>
                                                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                        Active
                                                    </span>
                                                </div>

                                                <h3 className="mt-4 text-lg font-bold text-softcharcoal group-hover:text-champagnegold">
                                                    {team.name}
                                                </h3>
                                                <p className="mt-1 line-clamp-2 text-xs text-warmgray">
                                                    {team.description || 'No description provided.'}
                                                </p>

                                                {/* Stats */}
                                                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-champagne pt-4 text-center">
                                                    <div className="rounded-xl bg-ivory p-2">
                                                        <span className="block text-base font-extrabold text-softcharcoal">
                                                            {acceptedCount}
                                                        </span>
                                                        <span className="text-[10px] uppercase font-bold text-gray-400">
                                                            Members
                                                        </span>
                                                    </div>
                                                    <div className="rounded-xl bg-ivory p-2">
                                                        <span className="block text-base font-extrabold text-amber-600">
                                                            {pendingCount}
                                                        </span>
                                                        <span className="text-[10px] uppercase font-bold text-gray-400">
                                                            Pending
                                                        </span>
                                                    </div>
                                                    <div className="rounded-xl bg-ivory p-2">
                                                        <span className="block text-base font-extrabold text-champagnegold">
                                                            {packagesCount}
                                                        </span>
                                                        <span className="text-[10px] uppercase font-bold text-gray-400">
                                                            Packages
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Links */}
                                            <div className="border-t border-champagne bg-ivory/50 p-4 space-y-2">
                                                <Link
                                                    href={route('supplier.teams.show', team.id)}
                                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2 text-center text-xs font-semibold text-champagnegold border border-indigo-200 shadow-2xs transition hover:bg-champagnegold hover:text-white"
                                                >
                                                    Manage Team & Members →
                                                </Link>
                                                <Link
                                                    href={route('messages.team.internal', team.id)}
                                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2 text-center text-xs font-semibold text-emerald-700 border border-emerald-200 transition hover:bg-emerald-600 hover:text-white"
                                                >
                                                    💬 Team Chat
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Empty State Matching Graphic */
                            <div className="mt-6 rounded-2xl border-2 border-dashed border-warmbeige bg-white p-12 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-champagne text-3xl">
                                    🙌
                                </div>
                                <h3 className="mt-4 text-lg font-bold text-softcharcoal">
                                    You don't have any team yet.
                                </h3>
                                <p className="mx-auto mt-1 max-w-md text-sm text-warmgray">
                                    Build a team by collaborating with other registered suppliers. Combine photography, catering, styling, and more into unified packages.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-champagnegold px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-darkgold active:scale-95"
                                >
                                    + Create New Team
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Content 2: Joined Teams */}
                {activeTab === 'memberships' && (
                    <div className="mt-6">
                        {acceptedMemberships.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {acceptedMemberships.map((membership) => {
                                    const team = membership.team;
                                    return (
                                        <div
                                            key={membership.id}
                                            className="flex flex-col justify-between overflow-hidden rounded-2xl border border-warmbeige bg-white p-6 shadow-xs"
                                        >
                                            <div>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-xl font-bold text-purple-600">
                                                        {team?.name?.charAt(0)}
                                                    </div>
                                                    <span className="rounded-full bg-champagne px-2.5 py-1 text-xs font-semibold text-darkgold">
                                                        {membership.role_title}
                                                    </span>
                                                </div>

                                                <h3 className="mt-4 text-lg font-bold text-softcharcoal">
                                                    {team?.name}
                                                </h3>
                                                <p className="mt-1 text-xs text-warmgray">
                                                    Coordinator:{' '}
                                                    <span className="font-semibold text-softcharcoal">
                                                        {team?.coordinator?.supplier_profile?.business_name ||
                                                            team?.coordinator?.name}
                                                    </span>
                                                </p>
                                                <p className="mt-2 line-clamp-2 text-xs text-warmgray">
                                                    {team?.description || 'Collaborative team.'}
                                                </p>
                                            </div>

                                            <div className="mt-6 border-t border-champagne pt-4 space-y-2">
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={route('supplier.teams.show', team.id)}
                                                        className="flex flex-1 items-center justify-center rounded-xl bg-ivory py-2 text-xs font-semibold text-softcharcoal hover:bg-champagne"
                                                    >
                                                        View Team Details →
                                                    </Link>
                                                    {team?.coordinator?.id && (
                                                        <button
                                                            type="button"
                                                            onClick={() => router.post(route('messages.direct', team.coordinator.id))}
                                                            className="flex items-center gap-1 rounded-xl bg-champagne px-3 py-2 text-xs font-semibold text-darkgold hover:bg-champagne"
                                                            title="Chat with Coordinator"
                                                        >
                                                            💬 Coordinator
                                                        </button>
                                                    )}
                                                </div>
                                                <Link
                                                    href={route('messages.team.internal', team.id)}
                                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2 text-xs font-semibold text-emerald-700 border border-emerald-200 transition hover:bg-emerald-600 hover:text-white"
                                                >
                                                    💬 Team Chat
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="mt-6 rounded-2xl border border-dashed border-warmbeige bg-white p-10 text-center">
                                <span className="text-3xl">🤝</span>
                                <h3 className="mt-3 text-base font-bold text-softcharcoal">
                                    No team memberships yet
                                </h3>
                                <p className="mt-1 text-xs text-warmgray">
                                    When other coordinators invite you to their team and you accept, they will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Benefits Section Matching Graphic Footer */}
                <div className="mt-12 rounded-3xl border border-warmbeige bg-gradient-to-br from-indigo-900 via-purple-900 to-softcharcoal p-8 text-white">
                    <div className="text-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                            ✨ Unlock Greater Opportunities
                        </span>
                        <h2 className="mt-1 text-2xl font-black">
                            Benefits of Having a Team
                        </h2>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-xs">
                            <span className="text-2xl">🎁</span>
                            <h3 className="mt-2 text-sm font-bold text-white">Offer Complete Solutions</h3>
                            <p className="mt-1 text-xs text-white/70">
                                Provide all-in-one packages to your clients without handling every aspect yourself.
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-xs">
                            <span className="text-2xl">🛡️</span>
                            <h3 className="mt-2 text-sm font-bold text-white">Build Trust</h3>
                            <p className="mt-1 text-xs text-white/70">
                                Collaborate with trusted and verified suppliers on the platform.
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-xs">
                            <span className="text-2xl">📈</span>
                            <h3 className="mt-2 text-sm font-bold text-white">Grow Together</h3>
                            <p className="mt-1 text-xs text-white/70">
                                Create more opportunities and win more comprehensive event bookings.
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-xs">
                            <span className="text-2xl">🌟</span>
                            <h3 className="mt-2 text-sm font-bold text-white">Stronger Network</h3>
                            <p className="mt-1 text-xs text-white/70">
                                Build long-term partnerships and support each other across all events.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create New Team Modal (Matching Step 2) */}
            {isCreateModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
                    onClick={() => setIsCreateModalOpen(false)}
                >
                    <div
                        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-champagne pb-4">
                            <h3 className="text-lg font-bold text-softcharcoal">
                                Create New Team
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-gray-400 hover:text-warmgray"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateTeam} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-softcharcoal">
                                    Team Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Full Wedding Team"
                                    className="mt-1 w-full rounded-xl border border-warmbeige px-3.5 py-2.5 text-sm shadow-xs outline-none focus:border-champagnegold focus:ring-2 focus:ring-champagne"
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-softcharcoal">
                                    Description (optional)
                                </label>
                                <textarea
                                    rows="3"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="A trusted team of professional suppliers to deliver complete wedding events."
                                    className="mt-1 w-full rounded-xl border border-warmbeige px-3.5 py-2.5 text-sm shadow-xs outline-none focus:border-champagnegold focus:ring-2 focus:ring-champagne"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-xs text-red-500">{errors.description}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-champagne">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="rounded-xl border border-warmbeige px-4 py-2 text-xs font-semibold text-softcharcoal hover:bg-ivory"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-champagnegold px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-darkgold disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : 'Create Team'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
