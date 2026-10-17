import { Link } from '@inertiajs/react';

export default function GuestLayout({ children, maxWidth = 'max-w-lg' }) {
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#FAF7F2] lg:flex-row font-sans">
            {/* Left Hero Panel (Mockup Design Side) */}
            <div className="relative hidden min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F3EDE2] lg:flex lg:w-1/2 xl:w-[48%]">
                <img
                    src="/images/auth-wedding-hero.png"
                    alt="Event & Wedding Supplier Management System"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                <Link
                    href="/"
                    className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs font-medium text-[#24221E] shadow-sm backdrop-blur-md transition-all hover:bg-white hover:shadow"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Home</span>
                </Link>
            </div>

            {/* Right Form Panel */}
            <div className="relative flex min-h-screen w-full flex-1 flex-col items-center justify-center overflow-hidden p-4 sm:p-8 lg:p-12">
                {/* Decorative golden wave lines in top-right */}
                <svg
                    className="pointer-events-none absolute -top-12 -right-12 h-64 w-64 text-[#D8B984]/35"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M30 190 C 80 120, 140 160, 190 70"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                    <path
                        d="M10 160 C 90 90, 120 180, 200 110"
                        stroke="currentColor"
                        strokeWidth="1"
                    />
                </svg>

                {/* Decorative golden wave lines in bottom-right */}
                <svg
                    className="pointer-events-none absolute -bottom-16 -right-16 h-72 w-72 text-[#D8B984]/25"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M20 20 C 100 80, 120 30, 190 150"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                </svg>

                {/* Mobile Branding Header */}
                <div className="mb-6 flex flex-col items-center text-center lg:hidden">
                    <Link href="/" className="group flex flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E9DBB5] bg-white shadow-sm">
                            <span className="text-xl text-[#C58B38]">♡</span>
                        </div>
                        <h1 className="mt-2 font-serif text-xl font-bold tracking-tight text-[#24221E]">
                            Event &amp; Wedding
                        </h1>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#77736C]">
                            Supplier Management System
                        </p>
                    </Link>
                </div>

                {/* Floating Auth Card */}
                <div className={`relative w-full ${maxWidth} rounded-3xl border border-[#EFE7D8]/80 bg-white/95 p-6 shadow-[0_20px_60px_-15px_rgba(197,139,56,0.12)] backdrop-blur-sm transition-all sm:p-10`}>
                    {children}
                </div>
            </div>
        </div>
    );
}
