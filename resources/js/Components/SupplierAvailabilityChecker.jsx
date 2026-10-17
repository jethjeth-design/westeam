import { useState, useEffect } from 'react';
import axios from 'axios';

export default function SupplierAvailabilityChecker({
    supplierId,
    supplierName = 'Supplier',
    onSelectDate = null,
}) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [calendarData, setCalendarData] = useState({
        loading: true,
        unavailabilities: [],
        bookedDates: [],
    });
    const [dateStatus, setDateStatus] = useState(null);

    // Fetch supplier calendar data (unavailabilities and booked dates)
    useEffect(() => {
        if (!supplierId) return;

        setCalendarData((prev) => ({ ...prev, loading: true }));
        axios
            .get(route('api.suppliers.availability', supplierId))
            .then((res) => {
                setCalendarData({
                    loading: false,
                    unavailabilities: res.data.unavailabilities || [],
                    bookedDates: (res.data.booked_dates || []).map((b) => b.date),
                });
            })
            .catch(() => {
                setCalendarData({
                    loading: false,
                    unavailabilities: [],
                    bookedDates: [],
                });
            });
    }, [supplierId]);

    // Check status whenever selectedDate or calendarData changes
    useEffect(() => {
        if (!selectedDate || calendarData.loading) return;

        // 1. Check if booked
        const isBooked = calendarData.bookedDates.includes(selectedDate);
        if (isBooked) {
            setDateStatus({
                status: 'booked',
                isAvailable: false,
                label: 'Booked',
                message: `${supplierName} already has a confirmed event on this date.`,
            });
            return;
        }

        // 2. Check if marked unavailable
        const unavail = calendarData.unavailabilities.find(
            (u) => selectedDate >= u.start_date && selectedDate <= u.end_date
        );
        if (unavail) {
            setDateStatus({
                status: 'unavailable',
                isAvailable: false,
                label: 'Unavailable',
                message: `${supplierName} is marked unavailable on this date (${unavail.reason}).`,
            });
            return;
        }

        // 3. Otherwise available
        setDateStatus({
            status: 'available',
            isAvailable: true,
            label: 'Available',
            message: `${supplierName} is available for bookings on this date!`,
        });
    }, [selectedDate, calendarData, supplierName]);

    return (
        <div className="rounded-3xl border border-warmbeige/90 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-champagne pb-3">
                <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-champagne text-darkgold font-bold text-xs">
                        🗓️
                    </span>
                    <h3 className="text-sm font-extrabold text-softcharcoal">
                        Check Supplier Availability
                    </h3>
                </div>
                {dateStatus && (
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            dateStatus.status === 'available'
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                                : dateStatus.status === 'booked'
                                ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                                : 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20'
                        }`}
                    >
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${
                                dateStatus.status === 'available'
                                    ? 'bg-emerald-600'
                                    : dateStatus.status === 'booked'
                                    ? 'bg-amber-600'
                                    : 'bg-rose-600'
                            }`}
                        />
                        {dateStatus.label}
                    </span>
                )}
            </div>

            <div className="mt-3.5 space-y-3">
                <div>
                    <label className="block text-[11px] font-bold text-warmgray">
                        Select an Event Date:
                    </label>
                    <input
                        type="date"
                        min={todayStr}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-warmbeige px-3 py-2 text-xs font-semibold text-softcharcoal shadow-2xs focus:border-champagnegold focus:ring-1 focus:ring-champagne"
                    />
                </div>

                {/* Status Message Display */}
                {calendarData.loading ? (
                    <p className="text-[11px] text-warmgray animate-pulse">Loading availability calendar...</p>
                ) : (
                    dateStatus && (
                        <div
                            className={`rounded-2xl p-3 text-xs ${
                                dateStatus.status === 'available'
                                    ? 'bg-emerald-50/70 border border-emerald-200 text-emerald-900'
                                    : dateStatus.status === 'booked'
                                    ? 'bg-amber-50/70 border border-amber-200 text-amber-900'
                                    : 'bg-rose-50/70 border border-rose-200 text-rose-900'
                            }`}
                        >
                            <p className="font-bold flex items-center gap-1.5">
                                <span>{dateStatus.isAvailable ? '✓' : '⚠️'}</span>
                                <span>{dateStatus.message}</span>
                            </p>
                        </div>
                    )
                )}

                {/* Legend badges */}
                <div className="flex items-center justify-between border-t border-champagne/60 pt-2.5 text-[10px] font-bold text-warmgray">
                    <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Available
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        Booked
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                        Unavailable
                    </span>
                </div>
            </div>
        </div>
    );
}
