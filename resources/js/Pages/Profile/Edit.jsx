import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const [activeTab, setActiveTab] = useState('profile');

    const roleBadge = {
        admin: { label: 'Administrator', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: '👑' },
        supplier: { label: 'Verified Supplier', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '🏢' },
        customer: { label: 'Event Organizer', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '🎉' },
    }[user?.role] || { label: 'Member', bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: '👤' };

    return (
        <DashboardLayout>
            <Head title="Account Profile & Settings" />

            <div className="min-h-screen bg-slate-50/60 p-6 lg:p-10">
                <div className="mx-auto max-w-5xl space-y-8">
                    {/* User Profile Hero Header Banner */}
                    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-md">
                        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
                        <div className="absolute left-1/3 bottom-0 -mb-10 h-40 w-40 rounded-full bg-purple-500/10 blur-2xl" />

                        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-18 w-18 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 font-black text-2xl sm:text-3xl text-white shadow-xl ring-4 ring-white/10">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                                            {user?.name}
                                        </h1>
                                        <span className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-0.5 text-xs font-bold ${roleBadge.bg}`}>
                                            <span>{roleBadge.icon}</span>
                                            <span>{roleBadge.label}</span>
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs sm:text-sm text-slate-300">
                                        {user?.email}
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-400">
                                        Account member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Filter Tabs */}
                    <div className="flex rounded-2xl bg-slate-200/80 p-1 max-w-md">
                        <button
                            type="button"
                            onClick={() => setActiveTab('profile')}
                            className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                                activeTab === 'profile'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            👤 Profile Info
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('security')}
                            className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                                activeTab === 'security'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            🔒 Security
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('danger')}
                            className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                                activeTab === 'danger'
                                    ? 'bg-white text-red-600 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            ⚠️ Danger Zone
                        </button>
                    </div>

                    {/* Tab 1: Profile Information */}
                    {(activeTab === 'profile' || activeTab === 'all') && (
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                            />
                        </div>
                    )}

                    {/* Tab 2: Security & Password */}
                    {(activeTab === 'security' || activeTab === 'all') && (
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
                            <UpdatePasswordForm />
                        </div>
                    )}

                    {/* Tab 3: Danger Zone */}
                    {(activeTab === 'danger' || activeTab === 'all') && (
                        <div className="rounded-3xl border border-red-100 bg-white p-6 sm:p-8 shadow-xs">
                            <DeleteUserForm />
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}