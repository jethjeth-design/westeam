import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600 text-lg">
                    ⚠️
                </div>
                <div>
                    <h2 className="text-lg font-black text-red-950">
                        Delete Account
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                        Permanently delete your account, services, and associated bookings data.
                    </p>
                </div>
            </header>

            <div className="rounded-2xl border border-red-200/80 bg-red-50/40 p-4 text-xs text-red-800">
                <p>
                    <strong>Caution:</strong> Once your account is deleted, all profile details, listings, portfolio items, and conversation history will be permanently wiped. This action cannot be reversed.
                </p>
            </div>

            <div>
                <button
                    type="button"
                    onClick={confirmUserDeletion}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-red-200 bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-red-700 active:scale-95"
                >
                    <span>🗑️</span>
                    <span>Delete My Account</span>
                </button>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 sm:p-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 text-2xl">
                            ⚠️
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900">
                                Confirm Account Deletion
                            </h2>
                            <p className="text-xs text-slate-500">
                                This will permanently erase your profile and records.
                            </p>
                        </div>
                    </div>

                    <p className="mt-4 text-xs text-slate-600 leading-relaxed">
                        To verify this action, please enter your current account password below:
                    </p>

                    <div className="mt-4">
                        <label
                            htmlFor="delete_password"
                            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                        >
                            Account Password
                        </label>

                        <input
                            id="delete_password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="mt-1.5 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-xs transition focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
                            placeholder="Enter password to confirm"
                            autoFocus
                        />

                        <InputError
                            message={errors.password}
                            className="mt-1.5"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition disabled:opacity-50"
                        >
                            {processing ? 'Deleting...' : 'Confirm Permanent Deletion'}
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
