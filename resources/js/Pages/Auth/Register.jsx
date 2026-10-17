import GoogleButton from '@/Components/GoogleButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Register() {
    const { errors: pageErrors } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const emailError = errors.email || pageErrors?.email;
    const generalError = pageErrors?.error;

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout maxWidth="max-w-md">
            <Head title="Customer Registration - Event & Wedding" />

            {/* Role Switcher Tabs */}
            <div className="mb-6 flex rounded-2xl bg-[#F4EDDA]/50 p-1 border border-[#E9DBB5]/60">
                <span className="flex-1 rounded-xl bg-white py-2 text-center text-xs font-semibold text-[#24221E] shadow-sm">
                    Customer Account
                </span>
                <Link
                    href={route('supplier.register')}
                    className="flex-1 rounded-xl py-2 text-center text-xs font-medium text-[#77736C] transition-colors hover:text-[#24221E]"
                >
                    Supplier Account
                </Link>
            </div>

            {/* Header */}
            <div className="text-center">
                <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#24221E] sm:text-4xl">
                    Create an Account
                </h1>
                <p className="mt-2 text-sm text-[#77736C]">
                    Join to plan and book your dream wedding
                </p>
            </div>

            {(generalError || (pageErrors?.email && !errors.email)) && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
                    {generalError || pageErrors?.email}
                </div>
            )}

            {/* Google Authentication */}
            <div className="mt-8">
                <GoogleButton
                    href={route('auth.google', { role: 'customer' })}
                    text="Continue with Google"
                />

                <div className="relative my-7 flex items-center justify-center">
                    <div className="w-full border-t border-[#E5DFD5]" />
                    <span className="absolute bg-white px-3 text-xs font-light lowercase tracking-widest text-[#9E978D]">
                        or
                    </span>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="Full Name" className="text-xs font-semibold uppercase tracking-wider text-[#77736C]" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1.5 block w-full rounded-xl border-[#DFDAD4] bg-[#FCFAF7] px-4 py-2.5 text-sm text-[#24221E] shadow-sm transition-all focus:border-[#C58B38] focus:bg-white focus:ring-[#C58B38]"
                        autoComplete="name"
                        placeholder="John & Jane Doe"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

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
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={emailError} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-xs font-semibold uppercase tracking-wider text-[#77736C]" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1.5 block w-full rounded-xl border-[#DFDAD4] bg-[#FCFAF7] px-4 py-2.5 text-sm text-[#24221E] shadow-sm transition-all focus:border-[#C58B38] focus:bg-white focus:ring-[#C58B38]"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                        className="text-xs font-semibold uppercase tracking-wider text-[#77736C]"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1.5 block w-full rounded-xl border-[#DFDAD4] bg-[#FCFAF7] px-4 py-2.5 text-sm text-[#24221E] shadow-sm transition-all focus:border-[#C58B38] focus:bg-white focus:ring-[#C58B38]"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-xl bg-[#24221E] px-4 py-3 text-sm font-semibold tracking-wide text-white shadow-md transition-all duration-200 hover:bg-[#3F3D39] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#C58B38] focus:ring-offset-2 active:scale-[0.99] disabled:opacity-50"
                    >
                        {processing ? 'Creating account...' : 'Create Customer Account'}
                    </button>
                </div>
            </form>

            {/* Footer */}
            <div className="mt-8 border-t border-[#EFECE9] pt-6 text-center text-xs text-[#77736C]">
                <span>Already have an account? </span>
                <Link
                    href={route('login')}
                    className="font-medium text-[#C58B38] transition-colors hover:text-[#A87520] hover:underline"
                >
                    Sign in here
                </Link>
            </div>

            {/* Terms and Privacy Footer Note */}
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
