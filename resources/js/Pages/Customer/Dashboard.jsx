import FeaturedSuppliersSection from '@/Components/FeaturedSuppliersSection';
import HeroBanner from '@/Components/HeroBanner';
import TopPackagesSection from '@/Components/TopPackagesSection';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard({
    stats = {},
    upcomingBooking = null,
    recentBookings = [],
    banners = [],
    sections = {},
    settings = {},
    featuredSuppliers = [],
    topPackages = [],
    eventCategories = [],
    highlights = [],
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const totalBookings = stats?.totalBookings || 0;
    const confirmedBookings = stats?.confirmedBookings || 0;
    const totalSpent = stats?.totalSpent || 0;

    // Upcoming Event Countdown Calculation
    const getDaysRemaining = (dateString) => {
        if (!dateString) return 0;
        const eventDate = new Date(dateString);
        const today = new Date();
        const diffTime = eventDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const daysRemaining = upcomingBooking ? getDaysRemaining(upcomingBooking.event_date) : 0;

    // Highlight icons mapping matching Welcome page
    const getHighlightIcon = (iconName) => {
        switch (iconName) {
            case 'shield-check':
                return (
                    <svg className="w-6 h-6 text-[#A87520]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                );
            case 'sparkles':
                return (
                    <svg className="w-6 h-6 text-[#A87520]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                );
            case 'calendar-check':
                return (
                    <svg className="w-6 h-6 text-[#A87520]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                );
            case 'gift':
            default:
                return (
                    <svg className="w-6 h-6 text-[#A87520]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                );
        }
    };

    return (
        <DashboardLayout>
            <Head title="Customer Dashboard - Event & Wedding Supplier Management" />

            <div className="w-full bg-[#F8F5EF] min-h-screen text-[#24221E] pb-24">
                {/* ========================================================================= */}
                {/* 1. HERO BANNER SLIDER (Identical to Welcome page & Shared Component)       */}
                {/* ========================================================================= */}
                <HeroBanner
                    banners={banners}
                    isActive={sections.hero_slider?.is_active !== false}
                    isCustomer={true}
                />

                {/* ========================================================================= */}
                {/* 2. HIGHLIGHTS FEATURE BAR                                                 */}
                {/* ========================================================================= */}
                {sections.feature_highlights?.is_active !== false && (
                    <section className="relative z-20 -mt-8 sm:-mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {(highlights && highlights.length > 0 ? highlights : [
                                { icon: 'shield-check', title: 'Trusted Suppliers', subtitle: 'Verified & Professional' },
                                { icon: 'sparkles', title: 'Quality Services', subtitle: 'Premium Experience' },
                                { icon: 'calendar-check', title: 'Easy Booking', subtitle: 'Simple & Secure' },
                                { icon: 'gift', title: 'Best Packages', subtitle: 'For Every Occasion' },
                            ]).map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#EFE7D8] shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[#EFE7D8]/80 border border-[#DCC9A8]/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                        {getHighlightIcon(item.icon)}
                                    </div>
                                    <div>
                                        <h3 className="font-serif font-bold text-sm text-[#24221E] leading-tight">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-[#77736C] mt-0.5 font-medium">
                                            {item.subtitle}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ========================================================================= */}
                {/* 3. CUSTOMER DASHBOARD HUB & BOOKING SUMMARIES                             */}
                {/* ========================================================================= */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
                    {/* Welcome Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EFE7D8]">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE7D8]/80 border border-[#DCC9A8]/60 text-[#A87520] text-[10px] font-bold tracking-wider uppercase mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#C99632] animate-pulse" />
                                Customer Planning Center
                            </div>
                            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24221E]">
                                Welcome back, {user?.name || 'Customer'}! 👋
                            </h1>
                            <p className="text-xs sm:text-sm text-[#77736C] mt-1 max-w-2xl leading-relaxed">
                                Track upcoming events, view booking progress, connect with verified wedding and milestone suppliers, and manage payments with ease.
                            </p>
                        </div>

                        {/* Fast Action Shortcuts */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <Link
                                href={route('customer.suppliers.index')}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C99632] hover:bg-[#A87520] text-white text-xs font-bold tracking-wider uppercase shadow-xs hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                                <span>🔍 Find Suppliers</span>
                            </Link>
                            <Link
                                href={route('customer.bookings.index')}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#DCC9A8] hover:border-[#C99632] hover:bg-[#EFE7D8] text-[#24221E] text-xs font-bold tracking-wider uppercase transition-all duration-200 shadow-2xs"
                            >
                                <span>📅 My Bookings</span>
                            </Link>
                            <Link
                                href={route('customer.payments.index')}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#DCC9A8] hover:border-[#C99632] hover:bg-[#EFE7D8] text-[#24221E] text-xs font-bold tracking-wider uppercase transition-all duration-200 shadow-2xs"
                            >
                                <span>💳 Payments</span>
                            </Link>
                        </div>
                    </div>

                    {/* Customer Real-Time Statistics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
                        {/* Total Bookings */}
                        <div className="rounded-3xl border border-[#EFE7D8] bg-white p-6 shadow-xs hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#77736C]">
                                    Total Bookings
                                </span>
                                <div className="w-10 h-10 rounded-2xl bg-[#EFE7D8] text-[#C99632] flex items-center justify-center text-lg">
                                    📅
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-black text-[#24221E]">{totalBookings}</span>
                                <span className="text-xs font-bold text-[#A87520]">
                                    {confirmedBookings} confirmed
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-[#77736C]">Requested and accepted reservations</p>
                        </div>

                        {/* Confirmed Events */}
                        <div className="rounded-3xl border border-[#EFE7D8] bg-white p-6 shadow-xs hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#77736C]">
                                    Confirmed Events
                                </span>
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">
                                    ✓
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-black text-[#24221E]">{confirmedBookings}</span>
                                <span className="text-xs font-bold text-emerald-600">
                                    Ready to celebrate
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-[#77736C]">Accepted vendor bookings</p>
                        </div>

                        {/* Total Spent / Budget */}
                        <div className="rounded-3xl border border-[#EFE7D8] bg-white p-6 shadow-xs hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#77736C]">
                                    Total Spent
                                </span>
                                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
                                    💰
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-black text-[#24221E]">
                                    ₱{Number(totalSpent).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-[#77736C]">Total confirmed booking value</p>
                        </div>

                        {/* Find Suppliers Quick Browse */}
                        <div className="rounded-3xl border border-[#EFE7D8] bg-white p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#77736C]">
                                    Supplier Directory
                                </span>
                                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
                                    🔍
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className="text-sm font-black text-purple-800">Verified Vendors</span>
                                <p className="text-xs text-[#77736C] mt-0.5">Explore curated portfolios & services</p>
                            </div>
                            <Link
                                href={route('customer.suppliers.index')}
                                className="mt-3 text-xs font-bold text-[#C99632] hover:text-[#A87520] flex items-center gap-1 group"
                            >
                                <span>Browse Directory</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                        </div>
                    </div>

                    {/* Customer Main Grid: Upcoming Event & Recent Bookings */}
                    <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* 8 Cols: Upcoming Event Details & Recent Bookings */}
                        <div className="space-y-8 lg:col-span-8">
                            {/* Upcoming Event Details */}
                            {upcomingBooking ? (
                                <div className="rounded-3xl border border-[#EFE7D8] bg-white shadow-sm overflow-hidden">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EFE7D8] p-5 sm:p-6 gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <h2 className="font-serif text-lg font-bold text-[#24221E]">
                                                    Upcoming Event Details
                                                </h2>
                                            </div>
                                            <p className="text-xs text-[#77736C] mt-0.5">
                                                Real-time overview of your next scheduled celebration
                                            </p>
                                        </div>
                                        <span className={`inline-flex items-center self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold ${
                                            upcomingBooking.overall_status === 'accepted'
                                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                                                : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                                        }`}>
                                            {upcomingBooking.overall_status === 'accepted' ? '✓ Confirmed Event' : '⏳ Pending Confirmation'}
                                        </span>
                                    </div>

                                    <div className="p-6 sm:p-8">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#EFE7D8] font-bold text-[#A87520] border border-[#DCC9A8]/40 shadow-2xs">
                                                    <span className="text-[11px] uppercase font-bold text-[#C99632]">
                                                        {new Date(upcomingBooking.event_date).toLocaleString('default', { month: 'short' })}
                                                    </span>
                                                    <span className="text-2xl leading-none font-serif text-[#24221E]">
                                                        {new Date(upcomingBooking.event_date).getDate()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-serif text-xl font-bold text-[#24221E] leading-tight">
                                                        {upcomingBooking.event_name}
                                                    </h3>
                                                    <p className="mt-1 text-xs text-[#77736C] flex items-center gap-2 flex-wrap">
                                                        <span>📍 {upcomingBooking.event_location || 'Venue Scheduled'}</span>
                                                        <span>•</span>
                                                        <span className="font-mono font-bold text-[#A87520]">
                                                            {upcomingBooking.booking_reference}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-[#F8F5EF] text-xs font-bold text-[#24221E] border border-[#EFE7D8]">
                                                ⏳ {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'} Remaining
                                            </span>
                                        </div>

                                        {/* Booked Vendors in this event */}
                                        <div className="mt-6 border-t border-[#EFE7D8] pt-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-xs font-bold uppercase tracking-wider text-[#77736C]">
                                                    Event Suppliers ({upcomingBooking.items?.length || 0})
                                                </p>
                                                <Link
                                                    href={route('customer.bookings.show', upcomingBooking.id)}
                                                    className="text-xs font-bold text-[#C99632] hover:text-[#A87520] flex items-center gap-1 group"
                                                >
                                                    <span>View Complete Breakdown</span>
                                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                                </Link>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {upcomingBooking.items?.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center justify-between rounded-2xl bg-[#F8F5EF] p-3.5 border border-[#EFE7D8]"
                                                    >
                                                        <div>
                                                            <p className="text-xs font-bold text-[#24221E]">{item.item_name}</p>
                                                            <p className="text-[11px] text-[#77736C]">
                                                                {item.supplier?.supplier_profile?.business_name || item.supplier?.name || 'Verified Supplier'}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                                item.status === 'accepted'
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : item.status === 'rejected'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-amber-100 text-amber-800'
                                                            }`}
                                                        >
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Total Investment Pill */}
                                        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#F8F5EF] to-white p-4 border border-[#EFE7D8]">
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#77736C]">Total Event Investment</p>
                                                <p className="text-xl font-black text-[#24221E]">
                                                    ₱{Number(upcomingBooking.total_amount).toLocaleString('en-PH', {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route('customer.bookings.show', upcomingBooking.id)}
                                                    className="px-5 py-2.5 rounded-full bg-[#C99632] text-xs font-bold text-white shadow-xs hover:bg-[#A87520] transition-colors"
                                                >
                                                    Manage Event Bookings
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-3xl border border-dashed border-[#DCC9A8] bg-white p-10 text-center shadow-xs">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFE7D8] text-2xl text-[#C99632] mb-3">
                                        🎉
                                    </div>
                                    <h3 className="font-serif text-lg font-bold text-[#24221E]">
                                        No upcoming events scheduled
                                    </h3>
                                    <p className="mt-1 text-xs sm:text-sm text-[#77736C] max-w-md mx-auto">
                                        Start planning your wedding or special milestone by booking verified suppliers or team packages.
                                    </p>
                                    <Link
                                        href={route('customer.suppliers.index')}
                                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#C99632] px-6 py-2.5 text-xs font-bold text-white uppercase tracking-wider transition hover:bg-[#A87520] shadow-xs"
                                    >
                                        <span>Browse Supplier Directory</span>
                                        <span>→</span>
                                    </Link>
                                </div>
                            )}

                            {/* Recent Bookings Roster */}
                            <div className="rounded-3xl border border-[#EFE7D8] bg-white shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between border-b border-[#EFE7D8] p-5">
                                    <div>
                                        <h2 className="font-serif text-base font-bold text-[#24221E]">
                                            Recent Bookings Tracker
                                        </h2>
                                        <p className="text-xs text-[#77736C]">
                                            Your latest vendor reservations and status
                                        </p>
                                    </div>
                                    <Link
                                        href={route('customer.bookings.index')}
                                        className="text-xs font-bold text-[#C99632] hover:text-[#A87520] flex items-center gap-1 group"
                                    >
                                        <span>View All ({totalBookings})</span>
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </Link>
                                </div>

                                <div className="divide-y divide-[#EFE7D8]/60">
                                    {recentBookings.length === 0 ? (
                                        <div className="p-8 text-center text-xs text-[#77736C]">
                                            No recent bookings to display. Start by booking a supplier or package below!
                                        </div>
                                    ) : (
                                        recentBookings.map((b) => (
                                            <div
                                                key={b.id}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3 transition hover:bg-[#F8F5EF]/60"
                                            >
                                                <div className="flex items-center gap-3.5">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EFE7D8] text-[#C99632] text-lg">
                                                        📅
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-[#24221E]">
                                                            {b.event_name}
                                                        </p>
                                                        <p className="text-[11px] text-[#77736C] mt-0.5">
                                                            {new Date(b.event_date).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            })}{' '}
                                                            • Ref:{' '}
                                                            <span className="font-mono font-bold text-[#A87520]">
                                                                {b.booking_reference}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-4">
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-xs font-black text-[#24221E]">
                                                            ₱{Number(b.total_amount).toLocaleString('en-PH', {
                                                                minimumFractionDigits: 2,
                                                            })}
                                                        </p>
                                                        <span
                                                            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                                b.overall_status === 'accepted'
                                                                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                                                                    : b.overall_status === 'rejected'
                                                                    ? 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
                                                                    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                                                            }`}
                                                        >
                                                            {b.overall_status}
                                                        </span>
                                                    </div>

                                                    <Link
                                                        href={route('customer.bookings.show', b.id)}
                                                        className="px-3.5 py-1.5 rounded-full bg-[#EFE7D8] hover:bg-[#DCC9A8] text-xs font-bold text-[#24221E] transition-colors"
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 4 Cols: Quick Tools & Assistance */}
                        <div className="space-y-6 lg:col-span-4">
                            {/* Customer Portal Tools */}
                            <div className="rounded-3xl border border-[#EFE7D8] bg-white p-6 shadow-sm">
                                <h2 className="font-serif text-base font-bold text-[#24221E]">
                                    Customer Management
                                </h2>
                                <p className="mt-0.5 text-xs text-[#77736C]">
                                    Quick tools to coordinate your celebration
                                </p>

                                <div className="mt-4 space-y-2.5">
                                    <Link
                                        href={route('customer.suppliers.index')}
                                        className="flex items-center gap-3.5 rounded-2xl border border-[#EFE7D8] bg-[#F8F5EF] p-3 transition hover:bg-[#EFE7D8]/60 hover:border-[#DCC9A8] group"
                                    >
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C99632] text-white font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
                                            🔍
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-[#24221E] group-hover:text-[#A87520] transition-colors">
                                                Find Supplier
                                            </p>
                                            <p className="text-[11px] text-[#77736C] truncate">
                                                Browse suppliers, portfolios & packages
                                            </p>
                                        </div>
                                    </Link>

                                    <Link
                                        href={route('customer.events.index')}
                                        className="flex items-center gap-3.5 rounded-2xl border border-[#EFE7D8] bg-[#F8F5EF] p-3 transition hover:bg-[#EFE7D8]/60 hover:border-[#DCC9A8] group"
                                    >
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#A87520] text-white font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
                                            🎉
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-[#24221E] group-hover:text-[#A87520] transition-colors">
                                                My Event
                                            </p>
                                            <p className="text-[11px] text-[#77736C] truncate">
                                                Manage your event details & milestones
                                            </p>
                                        </div>
                                    </Link>

                                    <Link
                                        href={route('customer.bookings.index')}
                                        className="flex items-center gap-3.5 rounded-2xl border border-[#EFE7D8] bg-[#F8F5EF] p-3 transition hover:bg-[#EFE7D8]/60 hover:border-[#DCC9A8] group"
                                    >
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
                                            📅
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-[#24221E] group-hover:text-[#A87520] transition-colors">
                                                My Bookings
                                            </p>
                                            <p className="text-[11px] text-[#77736C] truncate">
                                                Track statuses, confirmations & feedback
                                            </p>
                                        </div>
                                    </Link>

                                    <Link
                                        href={route('messages.index')}
                                        className="flex items-center gap-3.5 rounded-2xl border border-[#EFE7D8] bg-[#F8F5EF] p-3 transition hover:bg-[#EFE7D8]/60 hover:border-[#DCC9A8] group"
                                    >
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
                                            💬
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-[#24221E] group-hover:text-[#A87520] transition-colors">
                                                Messages
                                            </p>
                                            <p className="text-[11px] text-[#77736C] truncate">
                                                Communicate with suppliers & teams
                                            </p>
                                        </div>
                                    </Link>

                                    <Link
                                        href={route('customer.payments.index')}
                                        className="flex items-center gap-3.5 rounded-2xl border border-[#EFE7D8] bg-[#F8F5EF] p-3 transition hover:bg-[#EFE7D8]/60 hover:border-[#DCC9A8] group"
                                    >
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
                                            💳
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-[#24221E] group-hover:text-[#A87520] transition-colors">
                                                Payments
                                            </p>
                                            <p className="text-[11px] text-[#77736C] truncate">
                                                View payment receipts & balance logs
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                            </div>

                            {/* Promotional Assistance Card */}
                            <div className="rounded-3xl border border-[#DCC9A8] bg-gradient-to-br from-[#EFE7D8]/60 via-[#F8F5EF] to-white p-6 shadow-xs">
                                <div className="flex items-start gap-3.5">
                                    <span className="text-3xl">✨</span>
                                    <div>
                                        <h3 className="font-serif text-sm font-bold text-[#24221E]">
                                            Planning a New Celebration?
                                        </h3>
                                        <p className="mt-1 text-xs leading-relaxed text-[#77736C]">
                                            Explore curated packages, check supplier calendar availability in real time, and lock in your reservation with ease.
                                        </p>
                                        <Link
                                            href={route('customer.suppliers.index')}
                                            className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-[#C99632] px-4 py-2 text-xs font-bold text-white uppercase tracking-wider shadow-xs transition hover:bg-[#A87520]"
                                        >
                                            <span>Explore Suppliers</span>
                                            <span>→</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* 4. FEATURED SUPPLIERS SECTION (Single Source of Truth)                     */}
                {/* ========================================================================= */}
                <FeaturedSuppliersSection
                    featuredSuppliers={featuredSuppliers}
                    eventCategories={eventCategories}
                    isActive={sections.featured_suppliers?.is_active !== false}
                    title={sections.featured_suppliers?.title || 'Featured Suppliers'}
                    subtitle={sections.featured_suppliers?.subtitle || 'Verified premier suppliers with exemplary ratings and proven event execution.'}
                    isCustomer={true}
                />

                {/* ========================================================================= */}
                {/* 5. TOP PACKAGES SECTION (Single Source of Truth)                           */}
                {/* ========================================================================= */}
                <TopPackagesSection
                    topPackages={topPackages}
                    isActive={true}
                    isCustomer={true}
                />
            </div>
        </DashboardLayout>
    );
}