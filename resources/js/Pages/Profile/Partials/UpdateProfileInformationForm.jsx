import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-lg">
                    👤
                </div>
                <div>
                    <h2 className="text-lg font-black text-slate-900">
                        Profile Information
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                        Update your account's display name and primary email address.
                    </p>
                </div>
            </header>

            <form onSubmit={submit} className="mt-6 max-w-xl space-y-5">
                <div>
                    <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Full Name <span className="text-red-500">*</span>
                    </label>

                    <input
                        id="name"
                        type="text"
                        className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-xs transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                    />

                    <InputError className="mt-1.5" message={errors.name} />
                </div>

                <div>
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Email Address <span className="text-red-500">*</span>
                    </label>

                    <input
                        id="email"
                        type="email"
                        className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-xs transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-1.5" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
                        <p className="font-medium">
                            ⚠️ Your email address is unverified.
                        </p>
                        <Link
                            href={route('verification.send')}
                            method="post"
                            as="button"
                            className="mt-2 inline-flex items-center rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-amber-700 transition"
                        >
                            Resend Verification Email
                        </Link>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 font-bold text-emerald-700">
                                ✓ A new verification link has been sent to your email.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                    >
                        {processing ? 'Saving...' : 'Save Profile'}
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
                            ✓ Saved successfully
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
