import Checkbox from '@/Components/Checkbox';
import GoogleButton from '@/Components/GoogleButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { errors: pageErrors } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const emailError = errors.email || pageErrors?.email;

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout maxWidth="max-w-md">
            <Head title="Log In - Event & Wedding" />

            {/* Header */}
            <div className="text-center">
                <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#24221E] sm:text-4xl">
                    Welcome Back
                </h1>
                <p className="mt-2 text-sm text-[#77736C]">
                    Sign in to your account to continue
                </p>
            </div>

            {status && (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-center text-sm font-medium text-green-700">
                    {status}
                </div>
            )}

            {(pageErrors?.error || (pageErrors?.email && !errors.email)) && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
                    {pageErrors.error || pageErrors.email}
                </div>
            )}

            {/* Google Authentication */}
            <div className="mt-8">
                <GoogleButton href={route('auth.google')} text="Continue with Google" />

                <div className="relative my-7 flex items-center justify-center">
                    <div className="w-full border-t border-[#E5DFD5]" />
                    <span className="absolute bg-white px-3 text-xs font-light lowercase tracking-widest text-[#9E978D]">
                        or
                    </span>
                </div>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Email Address" className="text-xs font-semibold uppercase tracking-wider text-[#77736C]" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1.5 block w-full rounded-xl border-[#DFDAD4] bg-[#FCFAF7] px-4 py-2.5 text-sm text-[#24221E] shadow-sm transition-all focus:border-[#C58B38] focus:bg-white focus:ring-[#C58B38]"
                        autoComplete="username"
                        placeholder="you@example.com"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={emailError} className="mt-2" />
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="Password" className="text-xs font-semibold uppercase tracking-wider text-[#77736C]" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-medium text-[#C58B38] transition-colors hover:text-[#A87520] hover:underline"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1.5 block w-full rounded-xl border-[#DFDAD4] bg-[#FCFAF7] px-4 py-2.5 text-sm text-[#24221E] shadow-sm transition-all focus:border-[#C58B38] focus:bg-white focus:ring-[#C58B38]"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center">
                    <label className="flex cursor-pointer items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-[#DFDAD4] text-[#C58B38] focus:ring-[#C58B38]"
                        />
                        <span className="ms-2 text-sm text-[#77736C]">Remember me</span>
                    </label>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-xl bg-[#24221E] px-4 py-3 text-sm font-semibold tracking-wide text-white shadow-md transition-all duration-200 hover:bg-[#3F3D39] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#C58B38] focus:ring-offset-2 active:scale-[0.99] disabled:opacity-50"
                    >
                        {processing ? 'Signing in...' : 'Sign In'}
                    </button>
                </div>
            </form>

            {/* Registration Switcher */}
            <div className="mt-8 border-t border-[#EFECE9] pt-6 text-center text-xs text-[#77736C]">
                <span>Don't have an account? </span>
                <div className="mt-2 flex items-center justify-center gap-2">
                    <Link
                        href={route('register')}
                        className="font-medium text-[#C58B38] transition-colors hover:text-[#A87520] hover:underline"
                    >
                        Register as Customer
                    </Link>
                    <span className="text-[#DFDAD4]">•</span>
                    <Link
                        href={route('supplier.register')}
                        className="font-medium text-[#C58B38] transition-colors hover:text-[#A87520] hover:underline"
                    >
                        Register as Supplier
                    </Link>
                </div>
            </div>

            {/* Terms and Privacy Footer Note (matching Design Mockup) */}
            <div className="mt-6 text-center text-[11px] text-[#9E978D]">
                By continuing, you agree to our{' '}
                <a href="#" className="font-medium text-[#C58B38] hover:underline">
                    Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium text-[#C58B38] hover:underline">
                    Privacy Policy
                </a>
            </div>
        </GuestLayout>
    );
}
