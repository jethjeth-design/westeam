import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

import BusinessProfileForm
    from '@/Pages/Supplier/BusinessProfile/BusinessProfileForm';

import UpdateProfileInformationForm
    from '@/Pages/Profile/Partials/UpdateProfileInformationForm';

import UpdatePasswordForm
    from '@/Pages/Profile/Partials/UpdatePasswordForm';

import DeleteUserForm
    from '@/Pages/Profile/Partials/DeleteUserForm';

export default function Index({
    profile,
    categories = [],
    mustVerifyEmail,
    status,
}) {

    const [activeTab, setActiveTab] = useState('business');

    return (
        <DashboardLayout>

            <Head title="Settings" />

            <div className="min-h-screen bg-gray-50 p-6">

                <div className="mx-auto max-w-5xl">

                    {/* HEADER */}
                    <div className="mb-6">

                        <h1 className="text-2xl font-bold text-gray-900">
                            Settings
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage your business and account settings.
                        </p>

                    </div>


                    {/* SETTINGS TABS */}
                    <div className="mb-6 flex gap-2 border-b border-gray-200">

                        <button
                            type="button"
                            onClick={() => setActiveTab('business')}
                            className={`px-5 py-3 text-sm font-semibold transition ${
                                activeTab === 'business'
                                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Business Profile
                        </button>


                        <button
                            type="button"
                            onClick={() => setActiveTab('account')}
                            className={`px-5 py-3 text-sm font-semibold transition ${
                                activeTab === 'account'
                                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Account Settings
                        </button>

                    </div>


                    {/* CONTENT */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">


                        {/* BUSINESS PROFILE */}
                        {activeTab === 'business' && (

                            <div>

                                <div className="mb-6">

                                    <h2 className="text-xl font-bold text-gray-900">
                                        Business Profile
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Manage your supplier business information.
                                    </p>

                                </div>


                                <BusinessProfileForm
                                    profile={profile}
                                    categories={categories}
                                />

                            </div>

                        )}


                        {/* ACCOUNT PROFILE */}
                        {activeTab === 'account' && (

                            <div className="space-y-10">

                                <div>

                                    <h2 className="text-xl font-bold text-gray-900">
                                        Account Profile
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Manage your personal account information.
                                    </p>

                                </div>


                                {/* BREEZE PROFILE */}
                                <div>

                                    <UpdateProfileInformationForm
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                    />

                                </div>


                                {/* PASSWORD */}
                                <div className="border-t border-gray-200 pt-8">

                                    <UpdatePasswordForm />

                                </div>


                                {/* DELETE ACCOUNT */}
                                <div className="border-t border-gray-200 pt-8">

                                    <DeleteUserForm />

                                </div>

                            </div>

                        )}

                    </div>

                </div>

            </div>

        </DashboardLayout>
    );
}