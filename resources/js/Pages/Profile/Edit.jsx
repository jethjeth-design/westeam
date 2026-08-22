import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';

import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <DashboardLayout>
            <Head title="Profile" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-5xl space-y-6">

                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Profile
                        </h1>

                        <p className="mt-1 text-gray-600">
                            Manage your account information, password, and
                            account settings.
                        </p>
                    </div>

                    {/* Profile Information */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    {/* Password */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    {/* Delete Account */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <DeleteUserForm className="max-w-xl" />
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}