import Modal from '@/Components/Modal';
import NotificationBell from '@/Components/NotificationBell';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function AdminScheduleIndex({
    bookings = [],
    unavailabilities = [],
    suppliersList = [],
    customersList = [],
    filters = {},
    metrics = {},
}) {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(filters.year || today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState((filters.month ? filters.month - 1 : today.getMonth()));

    const [selectedItem, setSelectedItem] = useState(null); // booking or unavailability object
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'agenda'

    // Filter states
    const [supplierFilter, setSupplierFilter] = useState(filters.supplier_id || '');
    const [customerFilter, setCustomerFilter] = useState(filters.customer_id || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const prevMonth = () => {
        let newMonth = currentMonth - 1;
        let newYear = currentYear;
        if (newMonth < 0) {
            newMonth = 11;
            newYear -= 1;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
        updateQueryParams({ month: newMonth + 1, year: newYear });
    };

    const nextMonth = () => {
        let newMonth = currentMonth + 1;
        let newYear = currentYear;
        if (newMonth > 11) {
            newMonth = 0;
            newYear += 1;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
        updateQueryParams({ month: newMonth + 1, year: newYear });
    };

    const goToToday = () => {
        const now = new Date();
        setCurrentMonth(now.getMonth());
        setCurrentYear(now.getFullYear());
        updateQueryParams({ month: now.getMonth() + 1, year: now.getFullYear() });
    };

    const updateQueryParams = (extra = {}) => {
        router.get(
            route('admin.schedules.index'),
            {
                supplier_id: supplierFilter || undefined,
                customer_id: customerFilter || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                search: searchQuery || undefined,
                month: extra.month ?? currentMonth + 1,
                year: extra.year ?? currentYear,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleFilterChange = (key, value) => {
        if (key === 'supplier') setSupplierFilter(value);
        if (key === 'customer') setCustomerFilter(value);
        if (key === 'status') setStatusFilter(value);

        router.get(
            route('admin.schedules.index'),
            {
                supplier_id: key === 'supplier' ? (value || undefined) : (supplierFilter || undefined),
                customer_id: key === 'customer' ? (value || undefined) : (customerFilter || undefined),
                status: key === 'status' ? (value !== 'all' ? value : undefined) : (statusFilter !== 'all' ? statusFilter : undefined),
                search: searchQuery || undefined,
                month: currentMonth + 1,
                year: currentYear,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        updateQueryParams();
    };

    const clearFilters = () => {
        setSupplierFilter('');
        setCustomerFilter('');
        setStatusFilter('all');
        setSearchQuery('');
        router.get(route('admin.schedules.index'), {
            month: currentMonth + 1,
            year: currentYear,
        });
    };

    // Calendar generation
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const formatDate = (year, month, day) => {
        const m = String(month + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${m}-${d}`;
    };

    const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

    // Map bookings by date
    const bookingsByDate = {};
    bookings.forEach((b) => {
        if (b.event_date) {
            if (!bookingsByDate[b.event_date]) {
                bookingsByDate[b.event_date] = [];
            }
            bookingsByDate[b.event_date].push(b);
        }
    });

    // Check unavailabilities by date
    const getUnavailabilitiesForDate = (dateStr) => {
        return unavailabilities.filter((u) => {
            return dateStr >= u.start_date && dateStr <= u.end_date;
        });
    };

    return (
        <DashboardLayout>
            <Head title="Admin Schedules & Availability Monitoring - Westeam" />

            <div className="min-h-screen bg-ivory/60 p-4 sm:p-6 lg:p-10">
                {/* ── Top Header ── */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-champagne px-2.5 py-1 text-xs font-bold text-darkgold ring-1 ring-inset ring-indigo-700/10">
                                🛡️ Admin Central
                            </span>
                            <span className="text-xs text-warmgray">• Read-Only Monitoring</span>
                        </div>
                        <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-softcharcoal">
                            Master Schedules &amp; Supplier Availability
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-warmgray">
                            Monitor all event bookings, confirmed schedules, and supplier availability blocks across the platform in real time.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <NotificationBell className="bg-white border border-warmbeige/70 rounded-xl shadow-2xs" />
                    </div>
                </div>

                {/* ── Metrics Summary ── */}
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-2xl border border-warmbeige/80 bg-white p-4 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-warmgray">
                            Total Bookings
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-softcharcoal">
                                {metrics.totalBookings || 0}
                            </span>
                            <span className="text-[11px] font-semibold text-warmgray">All records</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-warmbeige/80 bg-white p-4 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-warmgray">
                            Confirmed Events
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-emerald-600">
                                {metrics.confirmedBookings || 0}
                            </span>
                            <span className="text-[11px] font-semibold text-emerald-700">Scheduled</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-warmbeige/80 bg-white p-4 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-warmgray">
                            Pending Requests
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-amber-600">
                                {metrics.pendingBookings || 0}
                            </span>
                            <span className="text-[11px] font-semibold text-amber-700">In review</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-warmbeige/80 bg-white p-4 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-warmgray">
                            Unavailable Blocks
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-rose-600">
                                {metrics.unavailableBlocks || 0}
                            </span>
                            <span className="text-[11px] font-semibold text-rose-700">Supplier leaves</span>
                        </div>
                    </div>
                </div>

                {/* ── Filter & Search Toolbar ── */}
                <div className="mt-6 rounded-3xl border border-warmbeige/80 bg-white p-5 shadow-xs">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Search & Select Filters */}
                        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                            {/* Search */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-warmgray">
                                    Search Events / Ref
                                </label>
                                <form onSubmit={handleSearchSubmit} className="mt-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Event, Ref, Client..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full rounded-xl border border-warmbeige py-1.5 px-3 text-xs text-softcharcoal shadow-2xs focus:border-champagnegold focus:ring-1 focus:ring-champagne"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1.5 text-xs text-warmgray hover:text-softcharcoal"
                                    >
                                        🔍
                                    </button>
                                </form>
                            </div>

                            {/* Supplier Filter */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-warmgray">
                                    Filter by Supplier
                                </label>
                                <select
                                    value={supplierFilter}
                                    onChange={(e) => handleFilterChange('supplier', e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-warmbeige py-1.5 px-3 text-xs text-softcharcoal shadow-2xs focus:border-champagnegold focus:ring-1 focus:ring-champagne"
                                >
                                    <option value="">All Suppliers</option>
                                    {suppliersList.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Customer Filter */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-warmgray">
                                    Filter by Customer
                                </label>
                                <select
                                    value={customerFilter}
                                    onChange={(e) => handleFilterChange('customer', e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-warmbeige py-1.5 px-3 text-xs text-softcharcoal shadow-2xs focus:border-champagnegold focus:ring-1 focus:ring-champagne"
                                >
                                    <option value="">All Customers</option>
                                    {customersList.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Booking Status Filter */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-warmgray">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-warmbeige py-1.5 px-3 text-xs text-softcharcoal shadow-2xs focus:border-champagnegold focus:ring-1 focus:ring-champagne"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="accepted">Accepted (Unpaid)</option>
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="unavailable">Supplier Unavailable Only</option>
                                </select>
                            </div>
                        </div>

                        {/* Right: View Toggles & Clear */}
                        <div className="flex items-center gap-2 self-end lg:self-center">
                            {(supplierFilter || customerFilter || statusFilter !== 'all' || searchQuery) && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="rounded-xl border border-warmbeige bg-white px-3 py-1.5 text-xs font-bold text-warmgray hover:bg-champagne/40 hover:text-softcharcoal transition"
                                >
                                    Reset Filters
                                </button>
                            )}

                            <div className="flex items-center rounded-xl border border-warmbeige bg-ivory p-0.5">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('grid')}
                                    className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                                        viewMode === 'grid'
                                            ? 'bg-champagnegold text-white shadow-2xs'
                                            : 'text-warmgray hover:text-softcharcoal'
                                    }`}
                                >
                                    📅 Calendar Grid
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('agenda')}
                                    className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                                        viewMode === 'agenda'
                                            ? 'bg-champagnegold text-white shadow-2xs'
                                            : 'text-warmgray hover:text-softcharcoal'
                                    }`}
                                >
                                    📋 Agenda List
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── VIEW 1: CALENDAR GRID ── */}
                {viewMode === 'grid' && (
                    <div className="mt-6 rounded-3xl border border-warmbeige/80 bg-white p-5 sm:p-6 shadow-xs">
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between border-b border-champagne pb-4">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-black text-softcharcoal">
                                    {monthNames[currentMonth]} {currentYear}
                                </h2>
                                <button
                                    type="button"
                                    onClick={goToToday}
                                    className="rounded-xl border border-warmbeige bg-ivory px-3 py-1 text-xs font-bold text-darkgold hover:bg-champagne active:scale-95 transition cursor-pointer"
                                >
                                    Today
                                </button>
                            </div>

                            {/* Legend */}
                            <div className="hidden md:flex items-center gap-3 text-[11px] font-bold text-softcharcoal">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                                    <span>Confirmed</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-indigo-600" />
                                    <span>Accepted</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                                    <span>Pending</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                                    <span>Unavailable</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={prevMonth}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-warmbeige bg-white text-softcharcoal hover:bg-champagne transition active:scale-95 cursor-pointer"
                                >
                                    ◀
                                </button>
                                <button
                                    type="button"
                                    onClick={nextMonth}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-warmbeige bg-white text-softcharcoal hover:bg-champagne transition active:scale-95 cursor-pointer"
                                >
                                    ▶
                                </button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="mt-4 grid grid-cols-7 gap-px overflow-hidden rounded-2xl border border-warmbeige bg-warmbeige text-center">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                                <div key={d} className="bg-ivory py-2 text-[11px] font-black uppercase tracking-wider text-warmgray">
                                    {d}
                                </div>
                            ))}

                            {/* Leading days from previous month */}
                            {Array.from({ length: firstDayIndex }).map((_, i) => (
                                <div key={`prev-${i}`} className="min-h-[100px] sm:min-h-[120px] bg-slate-50/60 p-2 text-left opacity-35">
                                    <span className="text-[11px] font-bold text-slate-400">
                                        {prevMonthDays - firstDayIndex + i + 1}
                                    </span>
                                </div>
                            ))}

                            {/* Days of current month */}
                            {Array.from({ length: totalDaysInMonth }).map((_, i) => {
                                const dayNum = i + 1;
                                const dateStr = formatDate(currentYear, currentMonth, dayNum);
                                const isCurrentDay = dateStr === todayStr;
                                const dayBookings = bookingsByDate[dateStr] || [];
                                const dayUnavailabilities = getUnavailabilitiesForDate(dateStr);

                                return (
                                    <div
                                        key={dateStr}
                                        className={`group relative min-h-[100px] sm:min-h-[125px] p-2 text-left transition ${
                                            isCurrentDay
                                                ? 'bg-amber-50/50 ring-2 ring-champagnegold/70 z-10'
                                                : dayBookings.length > 0 || dayUnavailabilities.length > 0
                                                ? 'bg-white hover:bg-ivory/80'
                                                : 'bg-white hover:bg-ivory/50'
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

                                            {(dayBookings.length > 0 || dayUnavailabilities.length > 0) && (
                                                <span className="text-[10px] font-bold text-warmgray">
                                                    {dayBookings.length + dayUnavailabilities.length}
                                                </span>
                                            )}
                                        </div>

                                        {/* Day item chips */}
                                        <div className="mt-1 space-y-1 overflow-y-auto max-h-[85px] scrollbar-none">
                                            {/* Unavailable blocks */}
                                            {dayUnavailabilities.map((u) => (
                                                <div
                                                    key={`unavail-${u.id}`}
                                                    onClick={() => setSelectedItem(u)}
                                                    className="truncate rounded-md bg-rose-100/90 px-1.5 py-0.5 text-[10px] font-bold text-rose-800 transition hover:bg-rose-200 cursor-pointer"
                                                    title={`Unavailable: ${u.supplier_name} - ${u.reason}`}
                                                >
                                                    ⛔ {u.supplier_name}
                                                </div>
                                            ))}

                                            {/* Bookings */}
                                            {dayBookings.map((b) => (
                                                <div
                                                    key={`bk-${b.id}`}
                                                    onClick={() => setSelectedItem(b)}
                                                    className={`truncate rounded-md px-1.5 py-0.5 text-[10px] font-extrabold shadow-2xs transition hover:scale-[1.02] cursor-pointer ${
                                                        b.overall_status === 'confirmed'
                                                            ? 'bg-emerald-600 text-white'
                                                            : b.overall_status === 'accepted'
                                                            ? 'bg-indigo-600 text-white'
                                                            : b.overall_status === 'completed'
                                                            ? 'bg-blue-600 text-white'
                                                            : b.overall_status === 'cancelled'
                                                            ? 'bg-slate-400 text-white'
                                                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                                                    }`}
                                                    title={`${b.event_name} • Ref: ${b.booking_reference} • Client: ${b.customer?.name}`}
                                                >
                                                    {b.overall_status === 'confirmed' && '✓ '}
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

                {/* ── VIEW 2: AGENDA LIST ── */}
                {viewMode === 'agenda' && (
                    <div className="mt-6 rounded-3xl border border-warmbeige/80 bg-white p-5 sm:p-6 shadow-xs">
                        <h2 className="text-base font-black text-softcharcoal mb-4">
                            All Events &amp; Blocked Schedules ({bookings.length + unavailabilities.length})
                        </h2>

                        {bookings.length === 0 && unavailabilities.length === 0 ? (
                            <div className="py-12 text-center text-xs text-warmgray">
                                No events or blocked schedules match your current filters.
                            </div>
                        ) : (
                            <div className="divide-y divide-champagne overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-champagne text-[11px] font-bold uppercase tracking-wider text-warmgray">
                                            <th className="py-3 px-3">Date</th>
                                            <th className="py-3 px-3">Type &amp; Status</th>
                                            <th className="py-3 px-3">Event / Reason</th>
                                            <th className="py-3 px-3">Customer / Supplier</th>
                                            <th className="py-3 px-3">Location / Price</th>
                                            <th className="py-3 px-3 text-right">Inspection</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-champagne/60">
                                        {/* Bookings */}
                                        {bookings.map((b) => (
                                            <tr key={`agenda-b-${b.id}`} className="hover:bg-ivory/50 transition">
                                                <td className="py-3 px-3 font-bold text-softcharcoal whitespace-nowrap">
                                                    📅 {b.event_date} {b.event_time ? `• ${b.event_time}` : ''}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                                        b.overall_status === 'confirmed'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : b.overall_status === 'accepted'
                                                            ? 'bg-indigo-100 text-indigo-800'
                                                            : b.overall_status === 'completed'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : b.overall_status === 'cancelled'
                                                            ? 'bg-slate-100 text-slate-700'
                                                            : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {b.overall_status?.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <p className="font-bold text-softcharcoal">{b.event_name}</p>
                                                    <p className="text-[10px] text-warmgray">Ref: {b.booking_reference}</p>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <p className="font-semibold text-softcharcoal">Client: {b.customer?.name}</p>
                                                    <p className="text-[10px] text-warmgray">
                                                        {b.suppliers?.length || 0} Supplier(s) involved
                                                    </p>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <p className="text-warmgray">📍 {b.event_location}</p>
                                                    <p className="font-bold text-champagnegold">
                                                        ₱{Number(b.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </td>
                                                <td className="py-3 px-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedItem(b)}
                                                        className="rounded-lg border border-warmbeige bg-white px-2.5 py-1 text-[11px] font-bold text-softcharcoal hover:bg-champagne/40 transition cursor-pointer"
                                                    >
                                                        Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {/* Unavailabilities */}
                                        {unavailabilities.map((u) => (
                                            <tr key={`agenda-u-${u.id}`} className="hover:bg-rose-50/30 transition">
                                                <td className="py-3 px-3 font-bold text-rose-800 whitespace-nowrap">
                                                    🚫 {u.start_date === u.end_date ? u.start_date : `${u.start_date} ~ ${u.end_date}`}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                                                        UNAVAILABLE
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 font-medium text-softcharcoal">
                                                    {u.reason}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <p className="font-bold text-softcharcoal">{u.supplier_name}</p>
                                                    {u.business_name && (
                                                        <p className="text-[10px] text-warmgray">{u.business_name}</p>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3 text-warmgray">
                                                    Blocked dates
                                                </td>
                                                <td className="py-3 px-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedItem(u)}
                                                        className="rounded-lg border border-warmbeige bg-white px-2.5 py-1 text-[11px] font-bold text-softcharcoal hover:bg-champagne/40 transition cursor-pointer"
                                                    >
                                                        Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── READ-ONLY DETAILS MODAL ── */}
            <Modal
                show={Boolean(selectedItem)}
                onClose={() => setSelectedItem(null)}
                maxWidth="lg"
            >
                {selectedItem && selectedItem.type === 'booking' && (
                    <div className="p-6">
                        <div className="flex items-center justify-between border-b border-champagne pb-4">
                            <div>
                                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                    selectedItem.overall_status === 'confirmed'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : selectedItem.overall_status === 'accepted'
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'bg-amber-50 text-amber-700'
                                }`}>
                                    BOOKING • {selectedItem.overall_status?.toUpperCase()}
                                </span>
                                <h3 className="mt-1.5 text-lg font-black text-softcharcoal">
                                    {selectedItem.event_name}
                                </h3>
                                <p className="text-xs text-warmgray">
                                    Booking Reference: <strong className="text-softcharcoal">{selectedItem.booking_reference}</strong>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedItem(null)}
                                className="flex h-8 w-8 items-center justify-center rounded-xl bg-champagne text-warmgray hover:bg-warmbeige transition cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-5 space-y-4 text-xs">
                            {/* Summary Details */}
                            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-champagne bg-ivory/50 p-3.5">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-warmgray">
                                        Date &amp; Time
                                    </span>
                                    <p className="mt-0.5 font-bold text-softcharcoal">
                                        📅 {selectedItem.event_date} {selectedItem.event_time ? `• ${selectedItem.event_time}` : ''}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-warmgray">
                                        Total Booking Price
                                    </span>
                                    <p className="mt-0.5 font-black text-champagnegold text-base">
                                        ₱{Number(selectedItem.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-warmgray">
                                        Customer
                                    </span>
                                    <p className="mt-0.5 font-bold text-softcharcoal">
                                        👤 {selectedItem.customer?.name}
                                    </p>
                                    <p className="text-[11px] text-warmgray">{selectedItem.customer?.email}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-warmgray">
                                        Venue Location
                                    </span>
                                    <p className="mt-0.5 font-bold text-softcharcoal">
                                        📍 {selectedItem.event_location}
                                    </p>
                                </div>
                            </div>

                            {/* Participating Suppliers & Services List */}
                            <div>
                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-warmgray mb-2">
                                    Participating Suppliers &amp; Google Calendar Status
                                </h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {selectedItem.suppliers?.map((s, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between rounded-xl border border-warmbeige bg-white p-3 shadow-2xs"
                                        >
                                            <div>
                                                <p className="font-bold text-softcharcoal">
                                                    {s.name} {s.business_name ? `(${s.business_name})` : ''}
                                                </p>
                                                <p className="text-[11px] text-warmgray">
                                                    {s.item_name} • ₱{Number(s.unit_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-block rounded-md px-2 py-0.5 text-[9px] font-bold ${
                                                    s.status === 'confirmed'
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-amber-50 text-amber-700'
                                                }`}>
                                                    {s.status}
                                                </span>
                                                <div className="mt-1 flex items-center gap-1 justify-end text-[10px]">
                                                    {s.google_calendar_synced ? (
                                                        <span className="text-blue-600 font-semibold">✓ Calendar Synced</span>
                                                    ) : (
                                                        <span className="text-warmgray">Not on Google</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedItem.special_requests && (
                                <div>
                                    <span className="font-bold text-softcharcoal">Client Requests / Notes:</span>
                                    <p className="text-warmgray mt-0.5 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                                        "{selectedItem.special_requests}"
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex items-center justify-end border-t border-champagne pt-4">
                            <button
                                type="button"
                                onClick={() => setSelectedItem(null)}
                                className="rounded-xl border border-warmbeige bg-white px-5 py-2 text-xs font-bold text-softcharcoal hover:bg-champagne/40 transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {selectedItem && selectedItem.type === 'unavailability' && (
                    <div className="p-6">
                        <div className="flex items-center justify-between border-b border-champagne pb-4">
                            <div>
                                <span className="inline-block rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                                    SUPPLIER UNAVAILABLE BLOCK
                                </span>
                                <h3 className="mt-1.5 text-lg font-black text-softcharcoal">
                                    {selectedItem.supplier_name}
                                </h3>
                                {selectedItem.business_name && (
                                    <p className="text-xs text-warmgray">{selectedItem.business_name}</p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedItem(null)}
                                className="flex h-8 w-8 items-center justify-center rounded-xl bg-champagne text-warmgray hover:bg-warmbeige transition cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-5 space-y-4 text-xs">
                            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-900">
                                    Blocked Period
                                </span>
                                <p className="mt-1 text-sm font-extrabold text-softcharcoal">
                                    📅 {selectedItem.start_date === selectedItem.end_date
                                        ? selectedItem.start_date
                                        : `${selectedItem.start_date} to ${selectedItem.end_date}`}
                                </p>
                            </div>

                            <div>
                                <span className="font-bold text-softcharcoal">Reason / Notes:</span>
                                <p className="mt-1 text-warmgray bg-white p-3 rounded-xl border border-warmbeige/70">
                                    {selectedItem.reason}
                                </p>
                            </div>

                            <div className="text-[11px] text-warmgray">
                                Marked on: {selectedItem.created_at}
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end border-t border-champagne pt-4">
                            <button
                                type="button"
                                onClick={() => setSelectedItem(null)}
                                className="rounded-xl border border-warmbeige bg-white px-5 py-2 text-xs font-bold text-softcharcoal hover:bg-champagne/40 transition cursor-pointer"
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
