import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';

export default function PaymentSettings({ settings }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        gcash_name: settings?.gcash_name || '',
        gcash_number: settings?.gcash_number || '',
        downpayment_percentage: settings?.downpayment_percentage || 20,
        is_active: settings?.is_active ?? true,
        instructions: settings?.instructions || '',
        gcash_qr: null,
    });

    const [previewUrl, setPreviewUrl] = useState(settings?.gcash_qr_url || null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('gcash_qr', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('supplier.payment-settings.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <DashboardLayout>
            <Head title="GCash Payment Settings - Supplier Portal" />

            <div className="min-h-screen bg-ivory/60 p-4 sm:p-6 lg:p-10">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-champagne px-2.5 py-1 text-xs font-bold text-darkgold">
                                💳 Payment Methods
                            </span>
                            <span className="text-xs text-warmgray">• GCash QR &amp; Downpayment</span>
                        </div>
                        <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-softcharcoal">
                            GCash Payment Settings
                        </h1>
                        <p className="mt-1 text-sm text-warmgray">
                            Configure your direct GCash payment account, QR code, and required booking downpayment percentage.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('supplier.payments.index')}
                            className="inline-flex items-center gap-2 rounded-2xl border border-warmbeige bg-white px-4 py-2.5 text-xs font-bold text-softcharcoal shadow-xs hover:bg-champagne/40 transition active:scale-95"
                        >
                            <span>💰 Payments Management</span>
                        </Link>
                    </div>
                </div>

                {/* Form & Live Preview Grid */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Settings Form Column */}
                    <div className="lg:col-span-7 space-y-6">
                        <form onSubmit={handleSubmit} className="rounded-3xl border border-warmbeige bg-white p-6 sm:p-8 shadow-xs space-y-6">
                            <div className="border-b border-champagne pb-4">
                                <h2 className="text-lg font-extrabold text-softcharcoal">
                                    Supplier GCash Account Information
                                </h2>
                                <p className="text-xs text-warmgray mt-0.5">
                                    Customers will see this information and scan your QR code when submitting booking payments.
                                </p>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center justify-between p-4 rounded-2xl border border-warmbeige bg-ivory/40">
                                <div>
                                    <span className="text-sm font-bold text-softcharcoal block">
                                        Accept GCash Payments
                                    </span>
                                    <span className="text-xs text-warmgray">
                                        Enable or temporarily pause customer payments via your GCash QR code.
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setData('is_active', !data.is_active)}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${data.is_active ? 'bg-emerald-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${data.is_active ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* GCash Account Name */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-softcharcoal mb-1.5">
                                    GCash Registered Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.gcash_name}
                                    onChange={(e) => setData('gcash_name', e.target.value)}
                                    placeholder="e.g. MARIA C. SANTOS"
                                    className="w-full rounded-xl border border-warmbeige px-4 py-2.5 text-sm text-softcharcoal focus:border-champagnegold focus:ring-1 focus:ring-champagnegold transition uppercase"
                                    required
                                />
                                {errors.gcash_name && (
                                    <p className="mt-1 text-xs text-red-600 font-semibold">{errors.gcash_name}</p>
                                )}
                            </div>

                            {/* GCash Number */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-softcharcoal mb-1.5">
                                    GCash Mobile Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.gcash_number}
                                    onChange={(e) => setData('gcash_number', e.target.value)}
                                    placeholder="e.g. 0917-123-4567 or 09171234567"
                                    className="w-full rounded-xl border border-warmbeige px-4 py-2.5 text-sm text-softcharcoal focus:border-champagnegold focus:ring-1 focus:ring-champagnegold transition"
                                    required
                                />
                                {errors.gcash_number && (
                                    <p className="mt-1 text-xs text-red-600 font-semibold">{errors.gcash_number}</p>
                                )}
                            </div>

                            {/* Downpayment Percentage */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-softcharcoal">
                                        Required Downpayment Percentage <span className="text-red-500">*</span>
                                    </label>
                                    <span className="text-xs font-extrabold text-champagnegold bg-champagne px-2 py-0.5 rounded-md">
                                        {data.downpayment_percentage}%
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        step="5"
                                        value={data.downpayment_percentage}
                                        onChange={(e) => setData('downpayment_percentage', parseInt(e.target.value, 10))}
                                        className="w-full accent-champagnegold cursor-pointer"
                                    />
                                    <div className="flex gap-2">
                                        {[20, 30, 50].map((pct) => (
                                            <button
                                                key={pct}
                                                type="button"
                                                onClick={() => setData('downpayment_percentage', pct)}
                                                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${data.downpayment_percentage === pct
                                                        ? 'bg-champagnegold text-white shadow-xs'
                                                        : 'bg-warmbeige/50 text-softcharcoal hover:bg-warmbeige'
                                                    }`}
                                            >
                                                {pct}%
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <p className="mt-1 text-[11px] text-warmgray">
                                    Determines the minimum downpayment required from customers when booking your service or package.
                                </p>
                                {errors.downpayment_percentage && (
                                    <p className="mt-1 text-xs text-red-600 font-semibold">{errors.downpayment_percentage}</p>
                                )}
                            </div>

                            {/* GCash QR Code Upload */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-softcharcoal mb-1.5">
                                    GCash QR Code Image
                                </label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-warmbeige hover:border-champagnegold rounded-2xl p-6 text-center cursor-pointer transition bg-ivory/30 group"
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/png,image/jpeg,image/webp,image/jpg"
                                        className="hidden"
                                    />
                                    <div className="flex flex-col items-center">
                                        <div className="h-12 w-12 rounded-2xl bg-champagne text-darkgold flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition">
                                            📱
                                        </div>
                                        <p className="text-xs font-bold text-softcharcoal">
                                            Click to upload or replace your GCash QR code
                                        </p>
                                        <p className="text-[11px] text-warmgray mt-1">
                                            PNG, JPG, or WEBP up to 5MB. Make sure the QR code is sharp and easily scannable.
                                        </p>
                                    </div>
                                </div>
                                {errors.gcash_qr && (
                                    <p className="mt-1 text-xs text-red-600 font-semibold">{errors.gcash_qr}</p>
                                )}
                            </div>

                            {/* Additional Instructions / Note */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-softcharcoal mb-1.5">
                                    Special Payment Instructions (Optional)
                                </label>
                                <textarea
                                    rows="3"
                                    value={data.instructions}
                                    onChange={(e) => setData('instructions', e.target.value)}
                                    placeholder="e.g. Please enter your Booking ID in the GCash message notes if possible. Once sent, upload the receipt screenshot."
                                    className="w-full rounded-xl border border-warmbeige px-4 py-2.5 text-xs text-softcharcoal focus:border-champagnegold focus:ring-1 focus:ring-champagnegold transition"
                                />
                                {errors.instructions && (
                                    <p className="mt-1 text-xs text-red-600 font-semibold">{errors.instructions}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center justify-between pt-4 border-t border-champagne">
                                <span className="text-xs text-warmgray">
                                    {recentlySuccessful && (
                                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                                            ✓ Saved successfully!
                                        </span>
                                    )}
                                </span>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-2xl bg-champagnegold px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-darkgold active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save Payment Settings'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Live Customer Preview Column */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="rounded-3xl border border-warmbeige bg-white p-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-champagne pb-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-base">👁️</span>
                                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-softcharcoal">
                                        Customer Live Preview
                                    </h3>
                                </div>
                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${data.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                                    }`}>
                                    {data.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {/* The GCash Card mockup */}
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#005CE6] via-[#0066FF] to-[#0047B3] p-5 text-white shadow-lg">
                                {/* GCash Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-full bg-white flex items-center justify-center font-black text-[#005CE6] text-xs shadow-xs">
                                            G
                                        </div>
                                        <span className="font-extrabold text-sm tracking-wide">GCash</span>
                                    </div>
                                    <span className="text-[10px] bg-white/20 backdrop-blur-xs font-bold px-2 py-0.5 rounded-full">
                                        Official Supplier QR
                                    </span>
                                </div>

                                {/* QR Code Display */}
                                <div className="mt-4 flex flex-col items-center">
                                    <div className="h-44 w-44 rounded-xl bg-white p-2.5 shadow-md flex items-center justify-center border border-white/40">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="GCash QR Preview"
                                                className="h-full w-full object-contain rounded-lg"
                                            />
                                        ) : (
                                            <div className="text-center text-gray-400 p-2">
                                                <div className="text-3xl mb-1">📷</div>
                                                <p className="text-[10px] font-semibold text-gray-500">
                                                    No QR uploaded yet
                                                </p>
                                                <p className="text-[9px] text-gray-400">
                                                    Upload your QR code to display here
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Account Details Box */}
                                    <div className="mt-4 w-full bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/20 text-center">
                                        <p className="text-[10px] uppercase font-bold text-blue-100 tracking-wider">
                                            Account Name
                                        </p>
                                        <p className="text-sm font-black tracking-wide text-white uppercase">
                                            {data.gcash_name || 'YOUR ACCOUNT NAME'}
                                        </p>
                                        <p className="text-[10px] uppercase font-bold text-blue-100 tracking-wider mt-1.5">
                                            GCash Number
                                        </p>
                                        <p className="text-base font-extrabold tracking-wider font-mono text-white">
                                            {data.gcash_number || '09XX-XXX-XXXX'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3 text-center">
                                    <p className="text-[10px] text-blue-100">
                                        Scan QR or send directly to the account details above
                                    </p>
                                </div>
                            </div>

                            {/* Downpayment badge preview */}
                            <div className="mt-4 rounded-xl border border-warmbeige bg-ivory/50 p-3 flex items-center justify-between text-xs">
                                <span className="text-warmgray font-medium">Standard Downpayment:</span>
                                <span className="font-extrabold text-softcharcoal">
                                    {data.downpayment_percentage}% of booking total
                                </span>
                            </div>

                            {data.instructions && (
                                <div className="mt-3 rounded-xl border border-warmbeige bg-white p-3">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-warmgray block mb-1">
                                        Supplier Note to Customer:
                                    </span>
                                    <p className="text-xs text-softcharcoal italic">
                                        "{data.instructions}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
