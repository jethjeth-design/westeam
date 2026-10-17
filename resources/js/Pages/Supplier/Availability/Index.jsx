import Modal from '@/Components/Modal';
import NotificationBell from '@/Components/NotificationBell';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function AvailabilityIndex({
    bookingItems = [],
    unavailabilities = [],
    calendarAccount = null,
    isGoogleConfigured = false,
    metrics = {},
}) {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed (0 = Jan)

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isUnavailableModalOpen, setIsUnavailableModalOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'unavailable_list'

    // Form for marking unavailable
    const { data, setData, post, processing, errors, reset } = useForm({
        start_date: '',
        end_date: '',
        reason: '',
    });

    // Helper: Navigation for months
    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const goToToday = () => {
        setCurrentYear(today.getFullYear());
        setCurrentMonth(today.getMonth());
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    // Calendar generation logic
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    // Group bookings by date string YYYY-MM-DD
    const bookingsByDate = {};
    bookingItems.forEach((item) => {
        if (item.event_date) {
            if (!bookingsByDate[item.event_date]) {
                bookingsByDate[item.event_date] = [];
            }
            bookingsByDate[item.event_date].push(item);
        }
    });

    // Check if a date string YYYY-MM-DD is marked as unavailable
    const getUnavailabilityForDate = (dateStr) => {
        return unavailabilities.find((u) => {
            return dateStr >= u.start_date && dateStr <= u.end_date;
        });
    };

    const handleCreateUnavailable = (e) => {
        e.preventDefault();
        post(route('supplier.availability.unavailability.store'), {
            onSuccess: () => {
                reset();
                setIsUnavailableModalOpen(false);
            },
        });
    };

    const handleDeleteUnavailable = (id) => {
        if (confirm('Are you sure you want to remove this unavailable date entry?')) {
            router.delete(route('supplier.availability.unavailability.destroy', id));
        }
    };

    const handleSyncGoogleCalendar = () => {
        setIsSyncing(true);
        router.post(route('supplier.calendar.sync'), {}, {
            onFinish: () => setIsSyncing(false),
        });
    };

    const handleDisconnectGoogle = () => {
        if (confirm('Disconnect Google Calendar? Future bookings will no longer sync until reconnected.')) {
            router.post(route('supplier.calendar.disconnect'));
        }
    };

    // Format date string helper
    const formatDate = (year, month, day) => {
        const m = String(month + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${m}-${d}`;
    };

    const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

    return (
        <DashboardLayout>
            <Head title="Supplier Availability & Calendar - Westeam" />

            <div className="min-h-screen bg-ivory/60 p-4 sm:p-6 lg:p-10">
                {/* ── Top Header ── */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-champagne px-2.5 py-1 text-xs font-bold text-darkgold ring-1 ring-inset ring-indigo-700/10">
                                🗓️ Schedule &amp; Availability
                            </span>
                            <span className="text-xs text-warmgray">• Google Calendar Integrated</span>
                        </div>
                        <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-softcharcoal">
                            Availability &amp; Calendar Management
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-warmgray">
                            Manage your open booking dates, block unavailable schedules, and sync confirmed events with Google Calendar.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <NotificationBell className="bg-white border border-warmbeige/70 rounded-xl shadow-2xs" />

                        <button
                            type="button"
                            onClick={() => {
                                reset();
                                setIsUnavailableModalOpen(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 active:scale-95 cursor-pointer"
                        >
                            <span>🚫 Mark as Unavailable</span>
                        </button>
                    </div>
                </div>

                {/* ── Google Calendar Integration Card ── */}
                <div className="mt-6 overflow-hidden rounded-3xl border border-warmbeige/90 bg-white p-5 sm:p-6 shadow-xs">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-100 shadow-2xs">
                                <svg className="h-6 w-6" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                </svg>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-extrabold text-softcharcoal">
                                        Google Calendar Synchronization
                                    </h3>
                                    {calendarAccount?.is_connected ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                            Connected &amp; Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-warmgray">
                                            Not Connected
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-xs text-warmgray">
                                    {calendarAccount?.is_connected ? (
                                        <>
                                            Connected to <strong className="text-softcharcoal">{calendarAccount.google_email}</strong>. Confirmed customer bookings automatically appear on your Google Calendar.
                                            {calendarAccount.last_synced_at && (
                                                <span className="block mt-0.5 text-[11px] text-warmgray">
                                                    Last synced: {calendarAccount.last_synced_at}
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            Link your Google account so confirmed bookings are automatically added to your personal schedule with customer details and venue locations.
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Integration Action Buttons */}
                        <div className="flex items-center gap-2.5 sm:self-center">
                            {calendarAccount?.is_connected ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleSyncGoogleCalendar}
                                        disabled={isSyncing}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-warmbeige bg-white px-3.5 py-2 text-xs font-bold text-softcharcoal shadow-2xs hover:bg-champagne/40 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                                    >
                                        <span className={isSyncing ? 'animate-spin' : ''}>🔄</span>
                                        <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDisconnectGoogle}
                                        className="inline-flex items-center rounded-xl border border-red-200 bg-red-50/60 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100/80 active:scale-95 transition cursor-pointer"
                                    >
                                        Disconnect
                                    </button>
                                </>
                            ) : (
                                <a
                                    href={route('supplier.calendar.connect')}
                                    className="inline-flex items-center gap-2 rounded-xl bg-softcharcoal px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-black active:scale-95 transition"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                    </svg>
                                    <span>Connect Google Calendar</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Metric Summary Tiles ── */}
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-2xl border border-warmbeige/80 bg-white p-4 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-warmgray">
                            Confirmed Events
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-emerald-700">
                                {metrics.confirmedCount || 0}
                            </span>
                            <span className="text-[11px] font-semibold text-emerald-600">On Calendar</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-warmbeige/80 bg-white p-4 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-warmgray">
                            Pending Requests
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-amber-600">
                                {metrics.pendingCount || 0}
                            </span>
                            <span className="text-[11px] font-semibold text-amber-700">Awaiting action</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-warmbeige/80 bg-white p-4 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-warmgray">
                            Accepted Orders
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-indigo-700">
                                {metrics.acceptedCount || 0}
                            </span>
                            <span className="text-[11px] font-semibold text-indigo-600">Pending payment</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-warmbeige/80 bg-white p-4 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-warmgray">
                            Blocked Periods
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-rose-600">
                                {metrics.unavailableBlocksCount || 0}
                            </span>
                            <span className="text-[11px] font-semibold text-rose-700">Unavailable blocks</span>
                        </div>
                    </div>
                </div>

                {/* ── Tab Switcher: Calendar vs Unavailable List ── */}
                <div className="mt-6 flex items-center justify-between border-b border-champagne pb-2">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('calendar')}
                            className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                                activeTab === 'calendar'
                                    ? 'bg-champagnegold text-white shadow-xs'
                                    : 'text-warmgray hover:bg-champagne/60 hover:text-softcharcoal'
                            }`}
                        >
                            📅 Monthly Calendar View
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('unavailable_list')}
                            className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                                activeTab === 'unavailable_list'
                                    ? 'bg-champagnegold text-white shadow-xs'
                                    : 'text-warmgray hover:bg-champagne/60 hover:text-softcharcoal'
                            }`}
                        >
                            🚫 Blocked Unavailable Dates ({unavailabilities.length})
                        </button>
                    </div>

                    {/* Legend */}
                    <div className="hidden lg:flex items-center gap-4 text-[11px] font-bold text-softcharcoal">
                        <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                            <span>Confirmed Booking</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                            <span>Pending Request</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                            <span>Unavailable / Blocked</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                            <span>Open / Available</span>
                        </div>
                    </div>
                </div>

                {/* ── TAB 1: CALENDAR VIEW ── */}
                {activeTab === 'calendar' && (
                    <div className="mt-6 rounded-3xl border border-warmbeige/80 bg-white p-5 sm:p-6 shadow-xs">
                        {/* Month Switcher Toolbar */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-champagne pb-4">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-black text-softcharcoal">
                                    {monthNames[currentMonth]} {currentYear}
                                </h2>
                                <button
                                    type="button"
                                    onClick={goToToday}
                                    className="rounded-xl border border-warmbeige bg-ivory px-3 py-1 text-xs font-bold text-darkgold hover:bg-champagne active:scale-95 transition"
                                >
                                    Today
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={prevMonth}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-warmbeige bg-white text-softcharcoal hover:bg-champagne transition active:scale-95"
                                    title="Previous Month"
                                >
                                    ◀
                                </button>
                                <button
                                    type="button"
                                    onClick={nextMonth}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-warmbeige bg-white text-softcharcoal hover:bg-champagne transition active:scale-95"
                                    title="Next Month"
                                >
                                    ▶
                                </button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="mt-4 grid grid-cols-7 gap-px overflow-hidden rounded-2xl border border-warmbeige bg-warmbeige text-center">
                            {/* Days of week header */}
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                                <div key={d} className="bg-ivory py-2 text-[11px] font-black uppercase tracking-wider text-warmgray">
                                    {d}
                                </div>
                            ))}

                            {/* Leading empty days from previous month */}
                            {Array.from({ length: firstDayIndex }).map((_, i) => {
                                const dayNum = prevMonthDays - firstDayIndex + i + 1;
                                return (
                                    <div key={`prev-${i}`} className="min-h-[90px] sm:min-h-[110px] bg-slate-50/60 p-1.5 sm:p-2 text-left opacity-40">
                                        <span className="text-[11px] font-bold text-slate-400">{dayNum}</span>
                                    </div>
                                );
                            })}

                            {/* Days of the current month */}
                            {Array.from({ length: totalDaysInMonth }).map((_, i) => {
                                const dayNum = i + 1;
                                const dateStr = formatDate(currentYear, currentMonth, dayNum);
                                const isCurrentDay = dateStr === todayStr;
                                const dayBookings = bookingsByDate[dateStr] || [];
                                const unavailability = getUnavailabilityForDate(dateStr);
                                const isUnavailable = Boolean(unavailability);

                                return (
                                    <div
                                        key={dateStr}
                                        onClick={() => setSelectedDate(dateStr)}
                                        className={`group relative min-h-[95px] sm:min-h-[115px] p-1.5 sm:p-2 text-left transition cursor-pointer ${
                                            isCurrentDay
                                                ? 'bg-amber-50/50 ring-2 ring-champagnegold/60 z-10'
                                                : isUnavailable
                                                ? 'bg-rose-50/40 hover:bg-rose-50/70'
                                                : dayBookings.length > 0
                                                ? 'bg-emerald-50/30 hover:bg-emerald-50/60'
                                                : 'bg-white hover:bg-ivory/60'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                                                    isCurrentDay
                                                        ? 'bg-champagnegold text-white shadow-xs'
                                                        : 'text-softcharcoal'
                                                }`}
                                            >
                                                {dayNum}
                                            </span>

                                            {/* Status indicator badge */}
                                            {isUnavailable && (
                                                <span className="rounded-md bg-rose-100 px-1.5 py-0.2 text-[9px] font-bold text-rose-700">
                                                    Blocked
                                                </span>
                                            )}
                                        </div>

                                        {/* Events / items list inside cell */}
                                        <div className="mt-1 space-y-1 overflow-y-auto max-h-[65px] scrollbar-none">
                                            {isUnavailable && (
                                                <div
                                                    title={`Unavailable: ${unavailability.reason}`}
                                                    className="truncate rounded-md bg-rose-100/90 px-1.5 py-0.5 text-[10px] font-bold text-rose-800"
                                                >
                                                    ⛔ {unavailability.reason}
                                                </div>
                                            )}

                                            {dayBookings.map((b) => (
                                                <div
                                                    key={b.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedBooking(b);
                                                    }}
                                                    className={`truncate rounded-md px-1.5 py-0.5 text-[10px] font-extrabold shadow-2xs transition hover:scale-[1.02] ${
                                                        b.status === 'confirmed'
                                                            ? 'bg-emerald-600 text-white'
                                                            : b.status === 'accepted'
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                                                    }`}
                                                    title={`${b.event_name} (${b.item_name}) - ${b.customer_name}`}
                                                >
                                                    {b.status === 'confirmed' ? '✓ ' : '⏳ '}
                                                    {b.event_name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── TAB 2: MANAGE UNAVAILABLE DATES ── */}
                {activeTab === 'unavailable_list' && (
                    <div className="mt-6 rounded-3xl border border-warmbeige/80 bg-white p-5 sm:p-6 shadow-xs">
                        <div className="flex items-center justify-between border-b border-champagne pb-4">
                            <div>
                                <h2 className="text-base font-black text-softcharcoal">
                                    Configured Unavailable Dates
                                </h2>
                                <p className="text-xs text-warmgray">
                                    Customers are prevented from booking your services during these blocked intervals.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    reset();
                                    setIsUnavailableModalOpen(true);
                                }}
                                className="rounded-xl bg-champagnegold px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-darkgold active:scale-95 transition cursor-pointer"
                            >
                                + Add Unavailable Range
                            </button>
                        </div>

                        {unavailabilities.length === 0 ? (
                            <div className="py-12 text-center">
                                <span className="text-3xl">🗓️</span>
                                <h3 className="mt-2 text-sm font-bold text-softcharcoal">
                                    No Unavailable Dates Configured
                                </h3>
                                <p className="mt-1 text-xs text-warmgray max-w-sm mx-auto">
                                    You are currently open for all booking dates! Use the "Mark as Unavailable" button anytime you need time off.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-4 divide-y divide-champagne overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-champagne text-[11px] font-bold uppercase tracking-wider text-warmgray">
                                            <th className="py-3 px-3">Date Range</th>
                                            <th className="py-3 px-3">Reason / Description</th>
                                            <th className="py-3 px-3">Status</th>
                                            <th className="py-3 px-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-champagne/60">
                                        {unavailabilities.map((u) => {
                                            const isPast = u.end_date < todayStr;
                                            return (
                                                <tr key={u.id} className="hover:bg-ivory/50 transition">
                                                    <td className="py-3 px-3 font-bold text-softcharcoal">
                                                        <div className="flex items-center gap-2">
                                                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 font-bold text-xs">
                                                                📅
                                                            </span>
                                                            <span>
                                                                {u.start_date === u.end_date
                                                                    ? u.start_date
                                                                    : `${u.start_date} to ${u.end_date}`}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3 text-warmgray font-medium">
                                                        {u.reason}
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        {isPast ? (
                                                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-warmgray">
                                                                Past
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                                                                Active Block
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-3 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteUnavailable(u.id)}
                                                            className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100 transition active:scale-95 cursor-pointer"
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── MODAL: MARK AS UNAVAILABLE ── */}
            <Modal
                show={isUnavailableModalOpen}
                onClose={() => setIsUnavailableModalOpen(false)}
                maxWidth="md"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between border-b border-champagne pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 font-bold text-lg">
                                🚫
                            </div>
                            <div>
                                <h3 className="text-base font-black text-softcharcoal">
                                    Mark Dates as Unavailable
                                </h3>
                                <p className="text-xs text-warmgray">
                                    Block dates when you are on leave or fully booked externally.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsUnavailableModalOpen(false)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-champagne text-warmgray hover:bg-warmbeige transition"
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleCreateUnavailable} className="mt-5 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-bold text-softcharcoal">
                                    Start Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    min={todayStr}
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className="mt-1.5 w-full rounded-xl border border-warmbeige px-3 py-2 text-xs text-softcharcoal shadow-2xs focus:border-champagnegold focus:ring-1 focus:ring-champagne"
                                    required
                                />
                                {errors.start_date && (
                                    <p className="mt-1 text-xs text-red-500">{errors.start_date}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-softcharcoal">
                                    End Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    min={data.start_date || todayStr}
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    className="mt-1.5 w-full rounded-xl border border-warmbeige px-3 py-2 text-xs text-softcharcoal shadow-2xs focus:border-champagnegold focus:ring-1 focus:ring-champagne"
                                    required
                                />
                                {errors.end_date && (
                                    <p className="mt-1 text-xs text-red-500">{errors.end_date}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-softcharcoal">
                                Reason (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Vacation, Equipment Maintenance, Fully Booked Off-Platform"
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                className="mt-1.5 w-full rounded-xl border border-warmbeige px-3.5 py-2 text-xs text-softcharcoal shadow-2xs focus:border-champagnegold focus:ring-1 focus:ring-champagne"
                                maxLength={255}
                            />
                            {errors.reason && (
                                <p className="mt-1 text-xs text-red-500">{errors.reason}</p>
                            )}
                        </div>

                        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
                            <strong>Note:</strong> You cannot block dates that already have confirmed client bookings. Existing bookings must be rescheduled or fulfilled.
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-champagne">
                            <button
                                type="button"
                                onClick={() => setIsUnavailableModalOpen(false)}
                                className="rounded-xl border border-warmbeige bg-white px-4 py-2 text-xs font-bold text-softcharcoal hover:bg-champagne/40 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                            >
                                {processing ? 'Saving...' : 'Confirm Block Dates'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* ── MODAL: BOOKING ITEM DETAILS ── */}
            <Modal
                show={Boolean(selectedBooking)}
                onClose={() => setSelectedBooking(null)}
                maxWidth="md"
            >
                {selectedBooking && (
                    <div className="p-6">
                        <div className="flex items-center justify-between border-b border-champagne pb-4">
                            <div>
                                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                    selectedBooking.status === 'confirmed'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : selectedBooking.status === 'accepted'
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'bg-amber-50 text-amber-700'
                                }`}>
                                    {selectedBooking.status?.toUpperCase()}
                                </span>
                                <h3 className="mt-1.5 text-lg font-black text-softcharcoal">
                                    {selectedBooking.event_name}
                                </h3>
                                <p className="text-xs text-warmgray">
                                    Ref: <strong className="text-softcharcoal">{selectedBooking.booking_reference}</strong>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedBooking(null)}
                                className="flex h-8 w-8 items-center justify-center rounded-xl bg-champagne text-warmgray hover:bg-warmbeige transition"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-5 space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-champagne bg-ivory/50 p-3.5">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-warmgray">
                                        Event Date &amp; Time
                                    </span>
                                    <p className="mt-0.5 font-bold text-softcharcoal">
                                        📅 {selectedBooking.event_date} {selectedBooking.event_time ? `• ⏰ ${selectedBooking.event_time}` : ''}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-warmgray">
                                        Item / Package
                                    </span>
                                    <p className="mt-0.5 font-bold text-softcharcoal">
                                        {selectedBooking.item_name}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-warmgray">
                                        Customer
                                    </span>
                                    <p className="mt-0.5 font-bold text-softcharcoal">
                                        👤 {selectedBooking.customer_name}
                                    </p>
                                    <p className="text-[11px] text-warmgray">{selectedBooking.customer_email}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-warmgray">
                                        Unit Price
                                    </span>
                                    <p className="mt-0.5 font-black text-champagnegold text-sm">
                                        ₱{Number(selectedBooking.unit_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <span className="font-bold text-softcharcoal">Venue / Location:</span>
                                <p className="text-warmgray mt-0.5">📍 {selectedBooking.event_location}</p>
                            </div>

                            {selectedBooking.special_requests && (
                                <div>
                                    <span className="font-bold text-softcharcoal">Client Notes &amp; Special Requests:</span>
                                    <p className="text-warmgray mt-0.5 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                                        "{selectedBooking.special_requests}"
                                    </p>
                                </div>
                            )}

                            {/* Google Calendar Sync Tag */}
                            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span>🗓️</span>
                                    <span className="font-bold text-blue-900">Google Calendar:</span>
                                    <span className="text-blue-700">
                                        {selectedBooking.google_calendar_event_id
                                            ? 'Event is synchronized with Google Calendar'
                                            : 'Not synchronized to Google Calendar'}
                                    </span>
                                </div>
                                {selectedBooking.calendar_synced_at && (
                                    <span className="text-[10px] text-blue-600">
                                        {selectedBooking.calendar_synced_at}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-champagne pt-4">
                            <Link
                                href={route('supplier.bookings.index')}
                                className="text-xs font-bold text-champagnegold hover:underline"
                            >
                                Open Booking in Orders →
                            </Link>

                            <button
                                type="button"
                                onClick={() => setSelectedBooking(null)}
                                className="rounded-xl border border-warmbeige bg-white px-4 py-2 text-xs font-bold text-softcharcoal hover:bg-champagne/40 transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}
