import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

export default function Create({
    initialItem = null,
    defaultBookingType = 'service',
    defaultTeamId = null,
    availableServices = [],
    availablePackages = [],
}) {
    // Initial items array
    const defaultItems = useMemo(() => {
        if (!initialItem) return [];
        return [
            {
                supplier_id: initialItem.supplier_id,
                item_type: initialItem.item_type || 'service',
                item_id: initialItem.item_id || null,
                item_name: initialItem.item_name || 'Selected Service',
                unit_price: Number(initialItem.unit_price || 0),
                supplier_name: initialItem.supplier_name || 'Supplier',
            },
        ];
    }, [initialItem]);

    const [selectedItems, setSelectedItems] = useState(defaultItems);
    const [addItemModalOpen, setAddItemModalOpen] = useState(false);
    const [addItemTab, setAddItemTab] = useState('services'); // 'services' | 'packages'

    // Form setup matching CustomerBookingController@store validation
    const { data, setData, post, processing, errors } = useForm({
        booking_type: defaultBookingType,
        team_id: defaultTeamId,
        event_name: '',
        event_date: '',
        event_time: '',
        event_location: '',
        guest_count: '',
        special_requests: '',
        items: defaultItems.map((it) => ({
            supplier_id: it.supplier_id,
            item_type: it.item_type,
            item_id: it.item_id,
            item_name: it.item_name,
            unit_price: it.unit_price,
        })),
    });

    // Keep form data.items and booking_type in sync when selectedItems change
    useEffect(() => {
        const mappedItems = selectedItems.map((it) => ({
            supplier_id: it.supplier_id,
            item_type: it.item_type,
            item_id: it.item_id,
            item_name: it.item_name,
            unit_price: it.unit_price,
        }));

        let determinedType = 'service';
        let foundTeamId = null;

        if (selectedItems.some((it) => it.item_type === 'team_package')) {
            determinedType = 'team_package';
            foundTeamId = defaultTeamId;
        } else if (selectedItems.some((it) => it.item_type === 'package')) {
            determinedType = 'supplier_package';
        } else if (new Set(selectedItems.map((it) => it.supplier_id)).size > 1) {
            determinedType = 'multi_supplier';
        }

        setData((prev) => ({
            ...prev,
            booking_type: determinedType,
            team_id: foundTeamId,
            items: mappedItems,
        }));
    }, [selectedItems, defaultTeamId]);

    // Availability state
    const [availabilityState, setAvailabilityState] = useState({
        loading: false,
        checked: false,
        allAvailable: true,
        suppliers: [],
        message: '',
    });

    // Check availability whenever event_date or supplier list changes
    useEffect(() => {
        if (!data.event_date) {
            setAvailabilityState({
                loading: false,
                checked: false,
                allAvailable: true,
                suppliers: [],
                message: '',
            });
            return;
        }

        const supplierIds = selectedItems.map((it) => it.supplier_id).filter(Boolean);
        if (supplierIds.length === 0) return;

        setAvailabilityState((prev) => ({ ...prev, loading: true }));

        const timer = setTimeout(() => {
            axios
                .post(route('api.suppliers.check-availability'), {
                    date: data.event_date,
                    supplier_ids: supplierIds,
                })
                .then((res) => {
                    const allOk = res.data.all_available;
                    setAvailabilityState({
                        loading: false,
                        checked: true,
                        allAvailable: allOk,
                        suppliers: res.data.suppliers || [],
                        message: allOk
                            ? 'All selected suppliers are available on this date!'
                            : 'One or more suppliers are unavailable or booked on this date.',
                    });
                })
                .catch(() => {
                    setAvailabilityState({
                        loading: false,
                        checked: false,
                        allAvailable: true,
                        suppliers: [],
                        message: '',
                    });
                });
        }, 300);

        return () => clearTimeout(timer);
    }, [data.event_date, selectedItems]);

    // Item management
    const removeItem = (index) => {
        setSelectedItems((prev) => prev.filter((_, idx) => idx !== index));
    };

    const addServiceItem = (service) => {
        const supplierUser = service.supplier;
        const profile = supplierUser?.supplier_profile || supplierUser?.supplierProfile;
        const supplierName = profile?.business_name || supplierUser?.name || 'Verified Supplier';

        const newItem = {
            supplier_id: service.supplier_id,
            item_type: 'service',
            item_id: service.id,
            item_name: service.name,
            unit_price: Number(service.price || 0),
            supplier_name: supplierName,
        };

        setSelectedItems((prev) => [...prev, newItem]);
        setAddItemModalOpen(false);
    };

    const addPackageItem = (pkg) => {
        const isTeam = Boolean(pkg.team_id && pkg.team);
        const supplierUser = pkg.supplier || pkg.team?.coordinator;
        const profile = supplierUser?.supplier_profile || supplierUser?.supplierProfile;
        const supplierName = isTeam
            ? `${pkg.team.name} (Team Package)`
            : profile?.business_name || supplierUser?.name || 'Verified Supplier';

        const newItem = {
            supplier_id: supplierUser?.id,
            item_type: isTeam ? 'team_package' : 'package',
            item_id: pkg.id,
            item_name: pkg.name,
            unit_price: Number(pkg.price || 0),
            supplier_name: supplierName,
        };

        setSelectedItems((prev) => [...prev, newItem]);
        setAddItemModalOpen(false);
    };

    const totalAmount = selectedItems.reduce((acc, curr) => acc + Number(curr.unit_price || 0), 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (availabilityState.checked && !availabilityState.allAvailable) {
            return;
        }
        post(route('customer.bookings.store'));
    };

    // Today's date string YYYY-MM-DD for min date
    const todayString = new Date().toISOString().split('T')[0];

    return (
        <DashboardLayout>
            <Head title="Book an Event - Westeam" />

            <div className="min-h-screen bg-[#F8F5EF] p-4 sm:p-6 lg:p-8 text-[#24221E] pb-24">
                {/* Header & Breadcrumb */}
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EFE7D8]">
                        <div>
                            <Link
                                href={route('customer.bookings.index')}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#77736C] hover:text-[#C99632] transition mb-2"
                            >
                                <span>←</span>
                                <span>Back to My Bookings</span>
                            </Link>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#24221E] font-serif">
                                Book Your Event
                            </h1>
                            <p className="text-xs sm:text-sm text-[#77736C] mt-1">
                                Complete your reservation request with verified suppliers. You will be redirected to your bookings center upon submission.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE7D8] text-[#A87520] text-xs font-bold">
                                <span>🔒</span>
                                <span>Protected Reservation</span>
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* LEFT COLUMN: Booking Form Fields (8 cols) */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Section 1: Selected Services & Packages */}
                            <div className="rounded-3xl border border-[#EFE7D8] bg-white p-6 shadow-xs">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-xl bg-[#EFE7D8] text-[#C99632] flex items-center justify-center font-bold text-sm">
                                            1
                                        </span>
                                        <h2 className="text-base font-bold text-[#24221E]">
                                            Selected Services & Packages
                                        </h2>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setAddItemModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCC9A8] bg-[#F8F5EF] text-[#A87520] hover:bg-[#EFE7D8] text-xs font-bold transition cursor-pointer"
                                    >
                                        <span>+ Add Item</span>
                                    </button>
                                </div>

                                {errors.items && (
                                    <p className="text-xs text-red-600 mb-3 font-semibold">{errors.items}</p>
                                )}

                                {selectedItems.length > 0 ? (
                                    <div className="divide-y divide-[#EFE7D8]">
                                        {selectedItems.map((item, index) => (
                                            <div
                                                key={index}
                                                className="py-3.5 flex items-center justify-between gap-4 group"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 rounded-md bg-[#EFE7D8] text-[#A87520] text-[10px] font-bold uppercase tracking-wider">
                                                            {item.item_type.replace('_', ' ')}
                                                        </span>
                                                        <h4 className="text-sm font-bold text-[#24221E] truncate">
                                                            {item.item_name}
                                                        </h4>
                                                    </div>
                                                    <p className="text-xs text-[#77736C] mt-0.5">
                                                        Vendor: <strong className="text-[#24221E]">{item.supplier_name}</strong>
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-black text-[#A87520]">
                                                        ₱{Number(item.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </span>

                                                    {selectedItems.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(index)}
                                                            className="text-xs text-red-500 hover:text-red-700 p-1 cursor-pointer font-bold"
                                                            title="Remove item"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center rounded-2xl bg-[#F8F5EF] border border-dashed border-[#DCC9A8]">
                                        <p className="text-xs text-[#77736C]">No items selected yet.</p>
                                        <button
                                            type="button"
                                            onClick={() => setAddItemModalOpen(true)}
                                            className="mt-2 text-xs font-bold text-[#A87520] hover:underline"
                                        >
                                            Browse & Add Services / Packages
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Section 2: Celebration Details */}
                            <div className="rounded-3xl border border-[#EFE7D8] bg-white p-6 shadow-xs space-y-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-8 h-8 rounded-xl bg-[#EFE7D8] text-[#C99632] flex items-center justify-center font-bold text-sm">
                                        2
                                    </span>
                                    <h2 className="text-base font-bold text-[#24221E]">
                                        Event & Venue Details
                                    </h2>
                                </div>

                                {/* Event Name */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#77736C] mb-1">
                                        Event Title / Couple Names <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.event_name}
                                        onChange={(e) => setData('event_name', e.target.value)}
                                        placeholder="e.g. Sophia & Liam's Wedding Ceremony"
                                        className="w-full rounded-xl border border-[#DCC9A8] bg-[#F8F5EF]/50 px-4 py-2.5 text-xs text-[#24221E] outline-none transition focus:border-[#C99632] focus:bg-white focus:ring-2 focus:ring-[#C99632]/20"
                                        required
                                    />
                                    {errors.event_name && (
                                        <p className="text-xs text-red-600 mt-1">{errors.event_name}</p>
                                    )}
                                </div>

                                {/* Event Date & Time */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-[#77736C] mb-1">
                                            Event Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            min={todayString}
                                            value={data.event_date}
                                            onChange={(e) => setData('event_date', e.target.value)}
                                            className="w-full rounded-xl border border-[#DCC9A8] bg-[#F8F5EF]/50 px-4 py-2.5 text-xs text-[#24221E] outline-none transition focus:border-[#C99632] focus:bg-white focus:ring-2 focus:ring-[#C99632]/20"
                                            required
                                        />
                                        {errors.event_date && (
                                            <p className="text-xs text-red-600 mt-1">{errors.event_date}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-[#77736C] mb-1">
                                            Event Time / Schedule (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.event_time}
                                            onChange={(e) => setData('event_time', e.target.value)}
                                            placeholder="e.g. 2:00 PM - 10:00 PM"
                                            className="w-full rounded-xl border border-[#DCC9A8] bg-[#F8F5EF]/50 px-4 py-2.5 text-xs text-[#24221E] outline-none transition focus:border-[#C99632] focus:bg-white focus:ring-2 focus:ring-[#C99632]/20"
                                        />
                                        {errors.event_time && (
                                            <p className="text-xs text-red-600 mt-1">{errors.event_time}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Real-time Availability Alert Banner */}
                                {availabilityState.loading && (
                                    <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 text-amber-800 text-xs border border-amber-200 animate-pulse">
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Checking supplier schedule availability for this date...</span>
                                    </div>
                                )}

                                {availabilityState.checked && !availabilityState.loading && (
                                    <div>
                                        {availabilityState.allAvailable ? (
                                            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200">
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                                                    ✓
                                                </span>
                                                <span className="font-semibold">{availabilityState.message}</span>
                                            </div>
                                        ) : (
                                            <div className="p-3.5 rounded-2xl bg-red-50 text-red-800 text-xs border border-red-200 space-y-1">
                                                <div className="flex items-center gap-2 font-bold">
                                                    <span>⚠️</span>
                                                    <span>Date Conflict Detected</span>
                                                </div>
                                                <p className="text-[11px] text-red-700">
                                                    {availabilityState.message} Overlapping reservations or supplier unavailability prevent booking on this day.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Location & Guest Count */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-[#77736C] mb-1">
                                            Event Location / Venue <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.event_location}
                                            onChange={(e) => setData('event_location', e.target.value)}
                                            placeholder="e.g. Bella Rosa Gardens, Silang, Cavite"
                                            className="w-full rounded-xl border border-[#DCC9A8] bg-[#F8F5EF]/50 px-4 py-2.5 text-xs text-[#24221E] outline-none transition focus:border-[#C99632] focus:bg-white focus:ring-2 focus:ring-[#C99632]/20"
                                            required
                                        />
                                        {errors.event_location && (
                                            <p className="text-xs text-red-600 mt-1">{errors.event_location}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-[#77736C] mb-1">
                                            Estimated Guests (Optional)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.guest_count}
                                            onChange={(e) => setData('guest_count', e.target.value)}
                                            placeholder="e.g. 150"
                                            className="w-full rounded-xl border border-[#DCC9A8] bg-[#F8F5EF]/50 px-4 py-2.5 text-xs text-[#24221E] outline-none transition focus:border-[#C99632] focus:bg-white focus:ring-2 focus:ring-[#C99632]/20"
                                        />
                                        {errors.guest_count && (
                                            <p className="text-xs text-red-600 mt-1">{errors.guest_count}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Special Requests */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#77736C] mb-1">
                                        Special Requests & Notes (Optional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={data.special_requests}
                                        onChange={(e) => setData('special_requests', e.target.value)}
                                        placeholder="Add any specific theme preferences, coordinator requests, or milestones to highlight..."
                                        className="w-full rounded-xl border border-[#DCC9A8] bg-[#F8F5EF]/50 px-4 py-2.5 text-xs text-[#24221E] outline-none transition focus:border-[#C99632] focus:bg-white focus:ring-2 focus:ring-[#C99632]/20 resize-none"
                                    />
                                    {errors.special_requests && (
                                        <p className="text-xs text-red-600 mt-1">{errors.special_requests}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Order Summary & Submission (4 cols) */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="sticky top-24 rounded-3xl border border-[#EFE7D8] bg-white p-6 shadow-xs space-y-5">
                                <h3 className="text-base font-bold text-[#24221E] font-serif border-b border-[#EFE7D8] pb-3">
                                    Reservation Summary
                                </h3>

                                <div className="space-y-3 text-xs">
                                    <div className="flex justify-between text-[#77736C]">
                                        <span>Total Items Selected:</span>
                                        <strong className="text-[#24221E]">{selectedItems.length}</strong>
                                    </div>
                                    <div className="flex justify-between text-[#77736C]">
                                        <span>Booking Type:</span>
                                        <span className="font-bold uppercase text-[#A87520]">
                                            {data.booking_type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[#77736C]">
                                        <span>Target Event Date:</span>
                                        <strong className="text-[#24221E]">
                                            {data.event_date ? new Date(data.event_date).toLocaleDateString() : 'Not set'}
                                        </strong>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-[#EFE7D8]">
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-[#77736C]">
                                            Estimated Total:
                                        </span>
                                        <span className="text-2xl font-black text-[#A87520]">
                                            ₱{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-[#77736C] mt-1 leading-relaxed">
                                        * No immediate payment is charged. Upon supplier acceptance, a verified GCash downpayment request will be generated.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        selectedItems.length === 0 ||
                                        (availabilityState.checked && !availabilityState.allAvailable)
                                    }
                                    className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#C99632] to-[#A87520] hover:from-[#A87520] hover:to-[#8C5D14] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                                >
                                    {processing ? (
                                        <span>Submitting Request...</span>
                                    ) : (
                                        <>
                                            <span>✨</span>
                                            <span>Submit Booking Request</span>
                                        </>
                                    )}
                                </button>

                                <div className="p-3 rounded-2xl bg-[#F8F5EF] border border-[#EFE7D8] text-[11px] text-[#77736C] space-y-1">
                                    <p className="font-bold text-[#24221E]">✓ Seamless Booking Workflow</p>
                                    <p>After submission, you will be redirected to your bookings list where you can monitor supplier confirmations and progress.</p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal: Add More Services / Packages */}
            {addItemModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24221E]/60 backdrop-blur-xs"
                    onClick={() => setAddItemModalOpen(false)}
                >
                    <div
                        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-white border border-[#EFE7D8] shadow-2xl p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-4 border-b border-[#EFE7D8]">
                            <h3 className="text-base font-bold text-[#24221E] font-serif">
                                Select Additional Item
                            </h3>
                            <button
                                type="button"
                                onClick={() => setAddItemModalOpen(false)}
                                className="text-xs text-[#77736C] hover:text-[#24221E] p-1 font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Switcher */}
                        <div className="flex gap-2 my-4">
                            <button
                                type="button"
                                onClick={() => setAddItemTab('services')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                                    addItemTab === 'services'
                                        ? 'bg-[#C99632] text-white shadow-xs'
                                        : 'bg-[#F8F5EF] text-[#24221E] hover:bg-[#EFE7D8]'
                                }`}
                            >
                                Available Services ({availableServices.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setAddItemTab('packages')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                                    addItemTab === 'packages'
                                        ? 'bg-[#C99632] text-white shadow-xs'
                                        : 'bg-[#F8F5EF] text-[#24221E] hover:bg-[#EFE7D8]'
                                }`}
                            >
                                Available Packages ({availablePackages.length})
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto divide-y divide-[#EFE7D8] pr-1 space-y-1">
                            {addItemTab === 'services' && (
                                availableServices.map((service) => {
                                    const supplierName = service.supplier?.supplier_profile?.business_name || service.supplier?.name || 'Verified Supplier';
                                    return (
                                        <div
                                            key={service.id}
                                            className="py-3 flex items-center justify-between gap-3 hover:bg-[#F8F5EF] px-2 rounded-xl transition"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-xs font-bold text-[#24221E] truncate">
                                                    {service.name}
                                                </h4>
                                                <p className="text-[10px] text-[#77736C]">
                                                    {service.category || 'General'} • By {supplierName}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-[#A87520]">
                                                    ₱{Number(service.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => addServiceItem(service)}
                                                    className="px-3 py-1.5 rounded-lg bg-[#C99632] hover:bg-[#A87520] text-white text-[11px] font-bold shadow-2xs cursor-pointer"
                                                >
                                                    Select
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                            {addItemTab === 'packages' && (
                                availablePackages.map((pkg) => {
                                    const isTeam = Boolean(pkg.team_id && pkg.team);
                                    const supplierName = isTeam
                                        ? pkg.team.name
                                        : pkg.supplier?.supplier_profile?.business_name || pkg.supplier?.name || 'Verified Supplier';
                                    return (
                                        <div
                                            key={pkg.id}
                                            className="py-3 flex items-center justify-between gap-3 hover:bg-[#F8F5EF] px-2 rounded-xl transition"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    {isTeam && (
                                                        <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[9px] font-bold">
                                                            Team
                                                        </span>
                                                    )}
                                                    <h4 className="text-xs font-bold text-[#24221E] truncate">
                                                        {pkg.name}
                                                    </h4>
                                                </div>
                                                <p className="text-[10px] text-[#77736C]">
                                                    {pkg.event_category?.name || 'All Events'} • By {supplierName}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-[#A87520]">
                                                    ₱{Number(pkg.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => addPackageItem(pkg)}
                                                    className="px-3 py-1.5 rounded-lg bg-[#C99632] hover:bg-[#A87520] text-white text-[11px] font-bold shadow-2xs cursor-pointer"
                                                >
                                                    Select
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
