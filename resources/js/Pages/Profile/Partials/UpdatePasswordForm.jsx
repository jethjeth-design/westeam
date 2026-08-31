import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errs) => {
                if (errs.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errs.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-lg">
                    🔒
                </div>
                <div>
                    <h2 className="text-lg font-black text-slate-900">
                        Update Password
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                        Ensure your account is protected with a strong, secure password.
                    </p>
                </div>
            </header>

            <form onSubmit={updatePassword} className="mt-6 max-w-xl space-y-5">
                {/* Current Password */}
                <div>
                    <label
                        htmlFor="current_password"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                    >
                        Current Password <span className="text-red-500">*</span>
                    </label>

                    <div className="relative mt-1.5">
                        <input
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
                            }
                            type={showCurrent ? 'text' : 'password'}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 pr-11 text-sm text-slate-900 shadow-xs transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs text-slate-400 hover:text-slate-600"
                            title={showCurrent ? 'Hide password' : 'Show password'}
                        >
                            {showCurrent ? '🙈' : '👁️'}
                        </button>
                    </div>

                    <InputError
                        message={errors.current_password}
                        className="mt-1.5"
                    />
                </div>

                {/* New Password */}
                <div>
                    <label
                        htmlFor="password"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                    >
                        New Password <span className="text-red-500">*</span>
                    </label>

                    <div className="relative mt-1.5">
                        <input
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type={showNew ? 'text' : 'password'}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 pr-11 text-sm text-slate-900 shadow-xs transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs text-slate-400 hover:text-slate-600"
                            title={showNew ? 'Hide password' : 'Show password'}
                        >
                            {showNew ? '🙈' : '👁️'}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                {/* Confirm Password */}
                <div>
                    <label
                        htmlFor="password_confirmation"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                    >
                        Confirm New Password <span className="text-red-500">*</span>
                    </label>

                    <div className="relative mt-1.5">
                        <input
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            type={showConfirm ? 'text' : 'password'}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 pr-11 text-sm text-slate-900 shadow-xs transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs text-slate-400 hover:text-slate-600"
                            title={showConfirm ? 'Hide password' : 'Show password'}
                        >
                            {showConfirm ? '🙈' : '👁️'}
                        </button>
                    </div>

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1.5"
                    />
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                    >
                        {processing ? 'Updating...' : 'Update Password'}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 translate-x-2"
                        enterTo="opacity-100 translate-x-0"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0"
                    >
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                            ✓ Password updated
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
