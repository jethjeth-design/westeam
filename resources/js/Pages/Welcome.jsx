import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    const events = [
        {
            icon: '💍',
            name: 'Weddings',
            description: 'Make your special day unforgettable.',
        },
        {
            icon: '🎂',
            name: 'Birthdays',
            description: 'Celebrate another wonderful year.',
        },
        {
            icon: '🎓',
            name: 'Debuts',
            description: 'Create a celebration worth remembering.',
        },
        {
            icon: '🏢',
            name: 'Corporate',
            description: 'Professional events made simple.',
        },
        {
            icon: '💐',
            name: 'Anniversaries',
            description: 'Celebrate milestones together.',
        },
        {
            icon: '🎉',
            name: 'Other Events',
            description: 'Whatever the occasion, we can help.',
        },
    ];

    const features = [
        {
            icon: '🔍',
            title: 'Find Suppliers',
            description:
                'Discover trusted photographers, caterers, decorators, venues, entertainers, and other event professionals.',
            bg: 'bg-indigo-100',
        },
        {
            icon: '🤖',
            title: 'AI Recommendations',
            description:
                'Tell our assistant your event type and budget and get supplier recommendations that fit your needs.',
            bg: 'bg-purple-100',
        },
        {
            icon: '📦',
            title: 'Compare Packages',
            description:
                'Explore supplier packages, inclusions, prices, and services before making your decision.',
            bg: 'bg-green-100',
        },
        {
            icon: '📅',
            title: 'Manage Bookings',
            description:
                'Keep your event bookings, suppliers, schedules, and event details organized in one place.',
            bg: 'bg-orange-100',
        },
    ];

    const packages = [
        {
            icon: '🌿',
            name: 'Basic Package',
            description: 'Perfect for simple and intimate celebrations.',
            price: '₱25,000',
            features: [
                'Event coordination',
                'Basic decoration',
                'Photography',
                'Basic sound system',
            ],
        },
        {
            icon: '💎',
            name: 'Premium Package',
            description: 'A complete package for a memorable celebration.',
            price: '₱75,000',
            popular: true,
            features: [
                'Full event coordination',
                'Premium decoration',
                'Professional photography',
                'Catering',
                'Entertainment',
            ],
        },
        {
            icon: '👑',
            name: 'Luxury Package',
            description: 'Everything you need for an extraordinary event.',
            price: '₱150,000+',
            features: [
                'Full event planning',
                'Luxury venue decoration',
                'Premium catering',
                'Photo & video coverage',
                'Live entertainment',
            ],
        },
    ];

    return (
        <>
            <Head title="Evently | Event & Wedding Supplier Management" />

            <div className="min-h-screen bg-white text-gray-900">

                {/* =========================================================
                    NAVIGATION
                ========================================================= */}
                <header className="absolute left-0 right-0 top-0 z-50">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-xl text-white shadow-lg shadow-indigo-200">
                                🎉
                            </div>

                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-gray-900">
                                    Evently
                                </h1>

                                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                                    Event Management
                                </p>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden items-center gap-8 md:flex">

                            <a
                                href="#suppliers"
                                className="text-sm font-medium text-gray-600 transition hover:text-indigo-600"
                            >
                                Suppliers
                            </a>

                            <a
                                href="#events"
                                className="text-sm font-medium text-gray-600 transition hover:text-indigo-600"
                            >
                                Events
                            </a>

                            <a
                                href="#packages"
                                className="text-sm font-medium text-gray-600 transition hover:text-indigo-600"
                            >
                                Packages
                            </a>

                            <a
                                href="#gallery"
                                className="text-sm font-medium text-gray-600 transition hover:text-indigo-600"
                            >
                                Gallery
                            </a>

                        </nav>

                        {/* Authentication */}
                        <div className="flex items-center gap-2 sm:gap-3">

                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 sm:block"
                                    >
                                        Log in
                                    </Link>

                                    <Link
                                        href={route('register')}
                                        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}

                        </div>
                    </div>
                </header>


                {/* =========================================================
                    HERO SECTION
                ========================================================= */}
                <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-36">

                    {/* Background decorations */}
                    <div className="absolute -left-40 top-40 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />

                    <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl" />

                    <div className="relative mx-auto max-w-7xl px-6 pb-24 lg:px-8 lg:pb-32">

                        <div className="grid items-center gap-16 lg:grid-cols-2">

                            {/* Hero Content */}
                            <div>

                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 shadow-sm">

                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-sm">
                                        ✨
                                    </span>

                                    <span className="text-sm font-semibold text-indigo-700">
                                        Everything for your perfect event
                                    </span>

                                </div>

                                <h1 className="max-w-3xl text-5xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">

                                    Plan your

                                    <span className="text-indigo-600">
                                        {' '}perfect event
                                    </span>

                                    {' '}with ease.

                                </h1>

                                <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
                                    Discover trusted event and wedding suppliers,
                                    compare packages, manage your budget, and
                                    organize everything you need in one place.
                                </p>

                                {/* CTA Buttons */}
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                                    <Link
                                        href={route('register')}
                                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
                                    >
                                        Start Planning
                                        <span className="ml-2">→</span>
                                    </Link>

                                    <a
                                        href="#how-it-works"
                                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
                                    >
                                        How It Works
                                    </a>

                                </div>

                                {/* Trust indicators */}
                                <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-500">

                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-green-500">
                                            ✓
                                        </span>
                                        Trusted Suppliers
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-green-500">
                                            ✓
                                        </span>
                                        Budget Friendly
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-green-500">
                                            ✓
                                        </span>
                                        Easy Booking
                                    </div>

                                </div>

                            </div>


                            {/* Hero Visual */}
                            <div className="relative">

                                <div className="relative mx-auto max-w-lg">

                                    {/* Main Card */}
                                    <div className="rounded-3xl border border-white bg-white p-4 shadow-2xl shadow-indigo-100">

                                        <div className="relative flex h-[390px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400">

                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-black/10" />

                                            {/* Main content */}
                                            <div className="relative text-center text-white">

                                                <div className="text-7xl">
                                                    💍
                                                </div>

                                                <h3 className="mt-5 text-2xl font-bold">
                                                    Your Dream Wedding
                                                </h3>

                                                <p className="mt-2 text-sm text-white/80">
                                                    Everything you need in one place
                                                </p>

                                            </div>


                                            {/* Photography floating card */}
                                            <div className="absolute left-5 top-6 rounded-2xl bg-white/95 p-3 shadow-xl">

                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100">
                                                        📸
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900">
                                                            Photography
                                                        </p>

                                                        <p className="text-[10px] text-gray-500">
                                                            4.9 ⭐
                                                        </p>
                                                    </div>

                                                </div>

                                            </div>


                                            {/* Budget floating card */}
                                            <div className="absolute bottom-6 right-5 rounded-2xl bg-white/95 p-3 shadow-xl">

                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100">
                                                        💰
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900">
                                                            Event Budget
                                                        </p>

                                                        <p className="text-[10px] font-semibold text-green-600">
                                                            ₱100,000
                                                        </p>
                                                    </div>

                                                </div>

                                            </div>

                                        </div>


                                        {/* Card bottom */}
                                        <div className="flex items-center justify-between px-2 pt-4">

                                            <div>
                                                <p className="text-sm font-bold text-gray-900">
                                                    Wedding Planning
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    7 suppliers selected
                                                </p>
                                            </div>

                                            <div className="flex -space-x-2">

                                                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-pink-200 text-xs">
                                                    📸
                                                </div>

                                                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-200 text-xs">
                                                    🎵
                                                </div>

                                                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-yellow-200 text-xs">
                                                    🍰
                                                </div>

                                                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-indigo-200 text-xs font-bold">
                                                    +4
                                                </div>

                                            </div>

                                        </div>

                                    </div>


                                    {/* AI Floating Card */}
                                    <div className="absolute -bottom-8 -left-8 hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-xl sm:block">

                                        <div className="flex items-center gap-3">

                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-xl">
                                                🤖
                                            </div>

                                            <div>
                                                <p className="text-xs font-bold text-gray-900">
                                                    AI Assistant
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    Finding suppliers for you...
                                                </p>
                                            </div>

                                            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>
                    </div>
                </section>


                {/* =========================================================
                    FEATURES
                ========================================================= */}
                <section
                    id="suppliers"
                    className="bg-white py-24"
                >
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">

                        <div className="mx-auto max-w-2xl text-center">

                            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                                Find the right people
                            </p>

                            <h2 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
                                Everything you need to plan
                            </h2>

                            <p className="mt-4 text-gray-500">
                                Connect with event professionals and manage
                                your entire celebration from one platform.
                            </p>

                        </div>


                        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="group rounded-2xl border border-gray-100 bg-gray-50 p-6 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl"
                                >

                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${feature.bg} transition duration-300 group-hover:scale-110`}
                                    >
                                        {feature.icon}
                                    </div>

                                    <h3 className="mt-5 font-bold text-gray-900">
                                        {feature.title}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-gray-500">
                                        {feature.description}
                                    </p>

                                </div>
                            ))}

                        </div>
                    </div>
                </section>


                {/* =========================================================
                    EVENTS
                ========================================================= */}
                <section
                    id="events"
                    className="bg-gray-50 py-24"
                >
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">

                        <div className="text-center">

                            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                                Any Celebration
                            </p>

                            <h2 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
                                One platform for every event
                            </h2>

                            <p className="mx-auto mt-4 max-w-2xl text-gray-500">
                                Whether you're planning a wedding, birthday,
                                debut, corporate event, or anniversary,
                                Evently helps you find what you need.
                            </p>

                        </div>


                        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">

                            {events.map((event) => (
                                <div
                                    key={event.name}
                                    className="group rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                                >

                                    <div className="text-4xl transition duration-300 group-hover:scale-110">
                                        {event.icon}
                                    </div>

                                    <h3 className="mt-4 text-sm font-bold text-gray-900">
                                        {event.name}
                                    </h3>

                                    <p className="mt-2 text-xs leading-5 text-gray-500">
                                        {event.description}
                                    </p>

                                </div>
                            ))}

                        </div>

                    </div>
                </section>


                {/* =========================================================
                    HOW IT WORKS
                ========================================================= */}
                <section
                    id="how-it-works"
                    className="bg-white py-24"
                >
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">

                        <div className="grid items-center gap-16 lg:grid-cols-2">

                            {/* Left */}
                            <div>

                                <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                                    Simple Process
                                </p>

                                <h2 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
                                    Plan your event in three simple steps.
                                </h2>

                                <p className="mt-5 max-w-xl leading-7 text-gray-500">
                                    From choosing your event type to booking
                                    suppliers, Evently keeps your planning
                                    simple and organized.
                                </p>

                                <Link
                                    href={route('register')}
                                    className="mt-8 inline-flex rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                                >
                                    Start Planning →
                                </Link>

                            </div>


                            {/* Right */}
                            <div className="space-y-5">

                                {/* Step 1 */}
                                <div className="flex gap-5 rounded-2xl border border-gray-100 bg-gray-50 p-6 transition hover:bg-white hover:shadow-lg">

                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
                                        01
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-gray-900">
                                            Tell us about your event
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-gray-500">
                                            Choose your event type, date,
                                            location, and budget.
                                        </p>
                                    </div>

                                </div>


                                {/* Step 2 */}
                                <div className="flex gap-5 rounded-2xl border border-gray-100 bg-gray-50 p-6 transition hover:bg-white hover:shadow-lg">

                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-600 font-bold text-white">
                                        02
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-gray-900">
                                            Discover suppliers
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-gray-500">
                                            Browse suppliers or ask the AI
                                            assistant for recommendations
                                            based on your budget.
                                        </p>
                                    </div>

                                </div>


                                {/* Step 3 */}
                                <div className="flex gap-5 rounded-2xl border border-gray-100 bg-gray-50 p-6 transition hover:bg-white hover:shadow-lg">

                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-600 font-bold text-white">
                                        03
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-gray-900">
                                            Book and manage
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-gray-500">
                                            Select packages, book suppliers,
                                            and manage your event from one
                                            convenient dashboard.
                                        </p>
                                    </div>

                                </div>

                            </div>

                        </div>
                    </div>
                </section>


                {/* =========================================================
                    PACKAGES
                ========================================================= */}
                <section
                    id="packages"
                    className="bg-gray-50 py-24"
                >
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">

                        <div className="mx-auto max-w-2xl text-center">

                            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                                Event Packages
                            </p>

                            <h2 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
                                Packages for every celebration
                            </h2>

                            <p className="mt-4 text-gray-500">
                                Explore packages that match your event,
                                preferences, and budget.
                            </p>

                        </div>


                        <div className="mt-12 grid gap-6 lg:grid-cols-3">

                            {packages.map((pkg) => (
                                <div
                                    key={pkg.name}
                                    className={`relative rounded-2xl bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${pkg.popular
                                        ? 'border-2 border-indigo-600'
                                        : 'border border-gray-200'
                                        }`}
                                >

                                    {pkg.popular && (
                                        <div className="absolute right-5 top-5 rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white">
                                            POPULAR
                                        </div>
                                    )}

                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
                                        {pkg.icon}
                                    </div>

                                    <h3 className="mt-5 text-xl font-bold text-gray-900">
                                        {pkg.name}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-gray-500">
                                        {pkg.description}
                                    </p>

                                    <div className="mt-6">
                                        <span className="text-3xl font-extrabold text-gray-900">
                                            {pkg.price}
                                        </span>
                                    </div>

                                    <div className="my-6 h-px bg-gray-100" />

                                    <ul className="space-y-3">
                                        {pkg.features.map((item) => (
                                            <li
                                                key={item}
                                                className="flex items-center gap-2 text-sm text-gray-600"
                                            >
                                                <span className="font-bold text-green-500">
                                                    ✓
                                                </span>

                                                {item}
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        href={route('register')}
                                        className={`mt-7 block rounded-xl px-4 py-3 text-center text-sm font-semibold transition ${pkg.popular
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                            }`}
                                    >
                                        Explore Package
                                    </Link>

                                </div>
                            ))}

                        </div>

                        <p className="mt-8 text-center text-sm text-gray-500">
                            Actual supplier packages and prices may vary.
                        </p>

                    </div>
                </section>


                {/* =========================================================
                    GALLERY
                ========================================================= */}
                <section
                    id="gallery"
                    className="bg-white py-24"
                >
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">

                        <div className="mx-auto max-w-2xl text-center">

                            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                                Event Gallery
                            </p>

                            <h2 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
                                Inspiration for your next event
                            </h2>

                            <p className="mt-4 text-gray-500">
                                Get inspired by beautiful celebrations and
                                imagine what your own event could look like.
                            </p>

                        </div>


                        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">

                            {/* Wedding */}
                            <div className="group relative h-72 overflow-hidden rounded-2xl bg-gradient-to-br from-pink-300 via-purple-400 to-indigo-500 md:row-span-2 md:h-full">

                                <div className="flex h-full items-center justify-center text-8xl transition duration-500 group-hover:scale-110">
                                    💍
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 text-white backdrop-blur-sm">
                                    <p className="font-bold">
                                        Wedding
                                    </p>

                                    <p className="mt-1 text-xs text-white/80">
                                        Elegant celebrations
                                    </p>
                                </div>

                            </div>


                            {/* Birthday */}
                            <div className="group relative h-52 overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-200 to-orange-400">

                                <div className="flex h-full items-center justify-center text-7xl transition duration-500 group-hover:scale-110">
                                    🎂
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-3 text-sm font-bold text-white">
                                    Birthday
                                </div>

                            </div>


                            {/* Debut */}
                            <div className="group relative h-52 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-300 to-indigo-500">

                                <div className="flex h-full items-center justify-center text-7xl transition duration-500 group-hover:scale-110">
                                    🎓
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-3 text-sm font-bold text-white">
                                    Debut
                                </div>

                            </div>


                            {/* Corporate */}
                            <div className="group relative h-52 overflow-hidden rounded-2xl bg-gradient-to-br from-green-300 to-teal-500">

                                <div className="flex h-full items-center justify-center text-7xl transition duration-500 group-hover:scale-110">
                                    🏢
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-3 text-sm font-bold text-white">
                                    Corporate
                                </div>

                            </div>


                            {/* Anniversary */}
                            <div className="group relative h-52 overflow-hidden rounded-2xl bg-gradient-to-br from-rose-300 to-pink-500">

                                <div className="flex h-full items-center justify-center text-7xl transition duration-500 group-hover:scale-110">
                                    💐
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-3 text-sm font-bold text-white">
                                    Anniversary
                                </div>

                            </div>

                        </div>

                    </div>
                </section>


                {/* =========================================================
                    AI SECTION
                ========================================================= */}
                <section className="bg-gray-50 py-24">

                    <div className="mx-auto max-w-7xl px-6 lg:px-8">

                        <div className="overflow-hidden rounded-3xl bg-indigo-600">

                            <div className="grid items-center gap-10 px-8 py-12 md:px-12 lg:grid-cols-2 lg:px-16">

                                {/* Text */}
                                <div>

                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl">
                                        🤖
                                    </div>

                                    <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
                                        Let AI help you find the right suppliers.
                                    </h2>

                                    <p className="mt-4 max-w-xl leading-7 text-indigo-100">
                                        Tell us your event type and budget.
                                        Our recommendation system can help
                                        you discover suppliers and packages
                                        that fit your requirements.
                                    </p>

                                    <Link
                                        href={route('register')}
                                        className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-indigo-600 transition hover:bg-indigo-50"
                                    >
                                        Try AI Recommendations →
                                    </Link>

                                </div>


                                {/* AI Preview */}
                                <div className="rounded-2xl bg-white p-5 shadow-2xl">

                                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                                            🤖
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold text-gray-900">
                                                Evently Assistant
                                            </p>

                                            <p className="text-xs text-green-500">
                                                ● Online
                                            </p>
                                        </div>

                                    </div>


                                    <div className="space-y-4 py-5">

                                        <div className="max-w-xs rounded-2xl rounded-tl-sm bg-gray-100 p-3 text-sm text-gray-600">
                                            What's your event and budget?
                                        </div>

                                        <div className="ml-auto max-w-xs rounded-2xl rounded-tr-sm bg-indigo-600 p-3 text-sm text-white">
                                            Wedding with a ₱100,000 budget.
                                        </div>

                                        <div className="max-w-xs rounded-2xl rounded-tl-sm bg-gray-100 p-3 text-sm text-gray-600">
                                            Great! Here are suppliers and
                                            packages that may fit your budget. ✨
                                        </div>

                                    </div>


                                    <div className="grid grid-cols-3 gap-2">

                                        <div className="rounded-xl bg-pink-50 p-3 text-center">
                                            <div className="text-2xl">
                                                📸
                                            </div>

                                            <p className="mt-1 text-[10px] font-semibold text-gray-700">
                                                Photography
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-purple-50 p-3 text-center">
                                            <div className="text-2xl">
                                                🍰
                                            </div>

                                            <p className="mt-1 text-[10px] font-semibold text-gray-700">
                                                Catering
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-blue-50 p-3 text-center">
                                            <div className="text-2xl">
                                                🎵
                                            </div>

                                            <p className="mt-1 text-[10px] font-semibold text-gray-700">
                                                Entertainment
                                            </p>
                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>
                </section>


                {/* =========================================================
                    SUPPLIER CTA
                ========================================================= */}
                <section className="bg-white py-24">

                    <div className="mx-auto max-w-7xl px-6 lg:px-8">

                        <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-gray-50 to-indigo-50 p-8 md:p-12">

                            <div className="flex flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">

                                <div>

                                    <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                                        For Event Suppliers
                                    </p>

                                    <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
                                        Grow your event business with Evently.
                                    </h2>

                                    <p className="mt-4 max-w-2xl text-gray-500">
                                        Showcase your services, create packages,
                                        manage bookings, and connect with customers
                                        looking for event suppliers.
                                    </p>

                                </div>

                                <Link
                                    href={route('register')}
                                    className="shrink-0 rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
                                >
                                    Become a Supplier →
                                </Link>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =========================================================
                    FINAL CTA
                ========================================================= */}
                <section className="bg-indigo-600 px-6 py-24 text-center">

                    <div className="mx-auto max-w-3xl">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl">
                            🎉
                        </div>

                        <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-white">
                            Your perfect event starts here.
                        </h2>

                        <p className="mx-auto mt-4 max-w-xl text-indigo-100">
                            Find the right suppliers, discover packages,
                            stay within your budget, and make your event memorable.
                        </p>

                        <div className="mt-8">

                            <Link
                                href={route('register')}
                                className="inline-flex rounded-xl bg-white px-8 py-4 text-sm font-bold text-indigo-600 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
                            >
                                Start Planning Today →
                            </Link>

                        </div>

                    </div>

                </section>


                {/* =========================================================
                    FOOTER
                ========================================================= */}
                <footer className="border-t border-gray-100 bg-gray-50">

                    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

                        <div className="grid gap-10 md:grid-cols-4">

                            {/* Brand */}
                            <div className="md:col-span-2">

                                <Link
                                    href="/"
                                    className="flex items-center gap-3"
                                >

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg text-white">
                                        🎉
                                    </div>

                                    <div>
                                        <p className="font-bold text-gray-900">
                                            Evently
                                        </p>

                                        <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">
                                            Event Management
                                        </p>
                                    </div>

                                </Link>

                                <p className="mt-4 max-w-md text-sm leading-6 text-gray-500">
                                    An event and wedding supplier management
                                    platform designed to make planning,
                                    discovering suppliers, and booking services
                                    easier.
                                </p>

                            </div>


                            {/* Platform */}
                            <div>

                                <h3 className="text-sm font-bold text-gray-900">
                                    Platform
                                </h3>

                                <ul className="mt-4 space-y-3 text-sm text-gray-500">

                                    <li>
                                        <a
                                            href="#suppliers"
                                            className="transition hover:text-indigo-600"
                                        >
                                            Suppliers
                                        </a>
                                    </li>

                                    <li>
                                        <a
                                            href="#events"
                                            className="transition hover:text-indigo-600"
                                        >
                                            Events
                                        </a>
                                    </li>

                                    <li>
                                        <a
                                            href="#packages"
                                            className="transition hover:text-indigo-600"
                                        >
                                            Packages
                                        </a>
                                    </li>

                                    <li>
                                        <a
                                            href="#gallery"
                                            className="transition hover:text-indigo-600"
                                        >
                                            Gallery
                                        </a>
                                    </li>

                                </ul>

                            </div>


                            {/* Account */}
                            <div>

                                <h3 className="text-sm font-bold text-gray-900">
                                    Account
                                </h3>

                                <ul className="mt-4 space-y-3 text-sm text-gray-500">

                                    <li>
                                        <Link
                                            href={route('login')}
                                            className="transition hover:text-indigo-600"
                                        >
                                            Log in
                                        </Link>
                                    </li>

                                    <li>
                                        <Link
                                            href={route('register')}
                                            className="transition hover:text-indigo-600"
                                        >
                                            Create Account
                                        </Link>
                                    </li>

                                    <li>
                                        <Link
                                            href={route('supplier.register')}
                                            className="transition hover:text-indigo-600"
                                        >
                                            Become a Supplier
                                        </Link>
                                    </li>

                                </ul>

                            </div>

                        </div>


                        <div className="mt-10 flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">

                            <p className="text-xs text-gray-500">
                                © {new Date().getFullYear()} Evently.
                                All rights reserved.
                            </p>

                            <p className="text-xs text-gray-400">
                                Event & Wedding Supplier Management System
                            </p>

                        </div>

                    </div>

                </footer>

            </div>
        </>
    );
}