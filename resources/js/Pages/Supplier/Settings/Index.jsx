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
    portfolios = [],
    mustVerifyEmail,
    status,
}) {

    const [activeTab, setActiveTab] = useState('business');

    return (
        <DashboardLayout>

            <Head title="Settings" />

            <div className="min-h-screen bg-ivory p-6">

                <div className="mx-auto max-w-5xl">

                    {/* HEADER */}
                    <div className="mb-6">

                        <h1 className="text-2xl font-bold text-softcharcoal">
                            Settings
                        </h1>

                        <p className="mt-1 text-sm text-warmgray">
                            Manage your business and account settings.
                        </p>

                    </div>


                    {/* SETTINGS TABS */}
                    <div className="mb-6 flex gap-2 border-b border-warmbeige">

                        <button
                            type="button"
                            onClick={() => setActiveTab('business')}
                            className={`px-5 py-3 text-sm font-semibold transition ${activeTab === 'business'
                                ? 'border-b-2 border-champagnegold text-champagnegold'
                                : 'text-warmgray hover:text-softcharcoal'
                                }`}
                        >
                            Business Profile
                        </button>


                        <button
                            type="button"
                            onClick={() => setActiveTab('account')}
                            className={`px-5 py-3 text-sm font-semibold transition ${activeTab === 'account'
                                ? 'border-b-2 border-champagnegold text-champagnegold'
                                : 'text-warmgray hover:text-softcharcoal'
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

                                    <h2 className="text-xl font-bold text-softcharcoal">
                                        Business Profile
                                    </h2>

                                    <p className="mt-1 text-sm text-warmgray">
                                        Manage your business information and categories.
                                    </p>

                                </div>


                                <BusinessProfileForm
                                    profile={profile}
                                    categories={categories}
                                    portfolios={portfolios}
                                />

                            </div>

                        )}


                        {/* ACCOUNT PROFILE */}
                        {activeTab === 'account' && (

                            <div className="space-y-10">

                                <div>

                                    <h2 className="text-xl font-bold text-softcharcoal">
                                        Account Profile
                                    </h2>

                                    <p className="mt-1 text-sm text-warmgray">
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
                                <div className="border-t border-warmbeige pt-8">

                                    <UpdatePasswordForm />

                                </div>


                                {/* DELETE ACCOUNT */}
                                <div className="border-t border-warmbeige pt-8">

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