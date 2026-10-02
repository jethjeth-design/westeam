import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function GCashPaymentModal({
    isOpen,
    onClose,
    booking,
    selectedItem = null,
    supplier = null,
    paymentSetting = null,
    existingPayment = null,
}) {
    if (!isOpen) return null;

    // Determine target supplier
    const targetSupplier =
        supplier ||
        selectedItem?.supplier ||
        (booking?.booking_type === 'team_package' ? booking?.team?.coordinator : booking?.items?.[0]?.supplier);

    // Determine payment settings (GCash details)
    const settings =
        paymentSetting ||
        targetSupplier?.payment_setting ||
        targetSupplier?.paymentSetting ||
        null;

    // Financial calculations
    const totalPrice = Number(
        selectedItem ? selectedItem.unit_price : booking?.total_amount || 0
    );
    const downpaymentPercentage = Number(settings?.downpayment_percentage || 20);
    const requiredDownpayment = Math.round((totalPrice * (downpaymentPercentage / 100)) * 100) / 100;
    
    // Amount paid so far for this item or booking
    const amountPaid = Number(
        selectedItem ? (selectedItem.verified_amount || 0) : (booking?.verified_amount || 0)
    );
    const remainingBalance = Math.max(0, Math.round((totalPrice - amountPaid) * 100) / 100);

    // Package or Service name
    const itemName =
        selectedItem?.item_name ||
        booking?.event_name ||
        'Event Reservation';

    // Supplier display name
    const supplierBusinessName =
        targetSupplier?.supplier_profile?.business_name ||
        targetSupplier?.supplierProfile?.business_name ||
        targetSupplier?.name ||
        'Event Supplier';

    // Form state using Inertia useForm
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        booking_id: booking?.id || '',
        booking_item_id: selectedItem?.id || '',
        supplier_id: targetSupplier?.id || '',
        payment_type: 'downpayment',
        amount: requiredDownpayment,
        reference_number: '',
        receipt: null,
        customer_notes: '',
    });

    const [receiptPreview, setReceiptPreview] = useState(null);
    const [copiedNumber, setCopiedNumber] = useState(false);
    const [qrZoomed, setQrZoomed] = useState(false);

    useEffect(() => {
        setData((prev) => ({
            ...prev,
            booking_id: booking?.id || '',
            booking_item_id: selectedItem?.id || '',
            supplier_id: targetSupplier?.id || '',
            amount: requiredDownpayment,
        }));
    }, [booking, selectedItem, targetSupplier, requiredDownpayment]);

    const handleReceiptChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('receipt', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveReceipt = () => {
        setData('receipt', null);
        setReceiptPreview(null);
    };

    const handleCopyNumber = () => {
        if (!settings?.gcash_number) return;
        navigator.clipboard.writeText(settings.gcash_number);
        setCopiedNumber(true);
        setTimeout(() => setCopiedNumber(false), 2500);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('customer.payments.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setReceiptPreview(null);
                onClose();
            },
        });
    };

    const handleClose = () => {
        reset();
        clearErrors();
        setReceiptPreview(null);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-softcharcoal/70 p-4 backdrop-blur-sm sm:p-6"
            onClick={handleClose}
        >
            <div
                className="relative my-8 w-full max-w-2xl rounded-3xl bg-white shadow-2xl transition-all overflow-hidden border border-warmbeige/70"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-6 py-5 text-white sm:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md text-2xl shadow-inner">
                                💳
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-100">
                                        GCash Secure Payment
                                    </span>
                                    {booking?.booking_type === 'team_package' && (
                                        <span className="rounded-md bg-amber-400/30 px-2 py-0.5 text-[10px] font-extrabold text-amber-200">
                                            👥 Team Coordinator QR
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-xl font-black text-white sm:text-2xl mt-0.5">
                                    Pay Downpayment
                                </h2>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-full bg-white/10 p-2 text-white/80 transition hover:bg-white/20 hover:text-white"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <p className="mt-2 text-xs text-blue-100/90">
                        Scan the supplier's GCash QR code, transfer the downpayment, and submit your reference number & receipt for verification.
                    </p>
                </div>

                <div className="max-h-[82vh] overflow-y-auto p-6 sm:p-8 space-y-6">
                    {/* Previous Rejection Alert */}
                    {existingPayment?.status === 'rejected' && (
                        <div className="rounded-2xl border border-red-200 bg-red-50/90 p-4 text-xs text-red-900 shadow-sm animate-pulse">
                            <div className="flex items-start gap-3">
                                <span className="text-xl">⚠️</span>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-red-800">
                                        Previous Payment Declined by Supplier
                                    </h4>
                                    <p className="text-red-700">
                                        <strong>Reason:</strong> "{existingPayment.rejection_reason || 'Invalid transaction reference or receipt unreadable.'}"
                                    </p>
                                    <p className="text-[11px] text-red-600 font-medium">
                                        Please submit a corrected payment below. Ensure the GCash reference number and receipt image match your transaction.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order & Payment Summary Cards */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Service & Supplier Details */}
                        <div className="rounded-2xl border border-warmbeige/70 bg-ivory/50 p-4 space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-warmgray">
                                Supplier & Service
                            </span>
                            <div>
                                <h3 className="text-sm font-black text-softcharcoal">
                                    {supplierBusinessName}
                                </h3>
                                <p className="text-xs text-warmgray mt-0.5 font-medium">
                                    {itemName}
                                </p>
                            </div>
                            <div className="text-[11px] text-warmgray pt-1 border-t border-warmbeige/50">
                                <span>Ref: </span>
                                <span className="font-mono font-bold text-softcharcoal">{booking?.booking_reference}</span>
                            </div>
                        </div>

                        {/* Financial Amounts Breakdown */}
                        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                                Payment Breakdown
                            </span>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between text-warmgray">
                                    <span>Total Price:</span>
                                    <span className="font-bold text-softcharcoal">
                                        ₱{totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-blue-900 font-bold">
                                    <span>Required Downpayment ({downpaymentPercentage}%):</span>
                                    <span className="text-sm text-blue-700 font-black">
                                        ₱{requiredDownpayment.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-[11px] text-warmgray pt-1 border-t border-blue-200/60">
                                    <span>Remaining Balance:</span>
                                    <span className="font-semibold text-softcharcoal">
                                        ₱{remainingBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GCash Payment Details & QR Code */}
                    <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-gradient-to-b from-blue-50/30 to-white p-5 space-y-5">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-blue-100 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-xs">
                                    G
                                </div>
                                <span className="text-sm font-extrabold text-blue-950">
                                    {booking?.booking_type === 'team_package'
                                        ? "Coordinator's GCash Account"
                                        : "Supplier's GCash Account"}
                                </span>
                            </div>
                            <span className="text-xs text-warmgray">
                                Direct Payee: <strong className="text-softcharcoal">{targetSupplier?.name}</strong>
                            </span>
                        </div>

                        {settings && settings.is_active ? (
                            <div className="grid gap-6 sm:grid-cols-2 items-center">
                                {/* QR Code Frame */}
                                <div className="flex flex-col items-center justify-center text-center space-y-2">
                                    {settings.gcash_qr_url ? (
                                        <div className="relative group">
                                            <div className="overflow-hidden rounded-2xl border-4 border-white bg-white p-2 shadow-md ring-1 ring-blue-200 transition group-hover:shadow-lg">
                                                <img
                                                    src={settings.gcash_qr_url}
                                                    alt={`${supplierBusinessName} GCash QR`}
                                                    className="h-48 w-48 object-contain cursor-pointer transition transform group-hover:scale-105"
                                                    onClick={() => setQrZoomed(true)}
                                                />
                                            </div>
                                            <p className="mt-1.5 text-[10px] font-semibold text-blue-700 flex items-center justify-center gap-1">
                                                <span>🔍 Click image to enlarge</span>
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex h-44 w-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-warmbeige bg-ivory/60 p-4 text-center">
                                            <span className="text-3xl text-warmgray">📱</span>
                                            <p className="mt-2 text-xs font-bold text-softcharcoal">
                                                No QR Code Uploaded
                                            </p>
                                            <p className="text-[10px] text-warmgray mt-0.5">
                                                Please send payment via GCash Number
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Account Information & Copy */}
                                <div className="space-y-3.5 text-xs">
                                    <div>
                                        <span className="text-[11px] font-semibold text-warmgray">
                                            GCash Account Name
                                        </span>
                                        <p className="text-sm font-black text-softcharcoal">
                                            {settings.gcash_name || supplierBusinessName}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-[11px] font-semibold text-warmgray">
                                            GCash Mobile Number
                                        </span>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="font-mono text-base font-black text-blue-700 bg-blue-100/70 px-3 py-1 rounded-xl">
                                                {settings.gcash_number || 'N/A'}
                                            </span>
                                            {settings.gcash_number && (
                                                <button
                                                    type="button"
                                                    onClick={handleCopyNumber}
                                                    className="inline-flex items-center gap-1 rounded-xl border border-blue-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-blue-700 shadow-xs hover:bg-blue-50 transition active:scale-95"
                                                >
                                                    {copiedNumber ? '✓ Copied!' : '📋 Copy'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Supplier Custom Instructions */}
                                    {settings.instructions && (
                                        <div className="rounded-xl bg-blue-50/70 p-3 text-[11px] text-blue-900 border border-blue-200/50">
                                            <p className="font-bold text-blue-950">Supplier Payment Note:</p>
                                            <p className="mt-0.5 italic">{settings.instructions}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                                <p className="font-bold">Notice regarding supplier GCash settings</p>
                                <p className="mt-1">
                                    This supplier has not fully published their GCash QR settings yet. You may message the supplier via Chat or coordinate directly with them.
                                </p>
                            </div>
                        )}

                        {/* Step-by-step GCash Payment Instructions */}
                        <div className="rounded-xl bg-ivory/80 p-3.5 border border-warmbeige/70 text-[11px] text-softcharcoal space-y-1.5">
                            <p className="font-bold text-darkgold uppercase tracking-wider text-[10px]">
                                💡 How to Pay via GCash:
                            </p>
                            <ol className="list-decimal pl-4 space-y-1 text-warmgray">
                                <li>Open your GCash app and tap <strong className="text-softcharcoal">QR</strong> to scan the code above, or use <strong className="text-softcharcoal">Express Send</strong> to the mobile number.</li>
                                <li>Enter the required downpayment amount: <strong className="text-blue-700">₱{requiredDownpayment.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>.</li>
                                <li>Complete the transaction and <strong className="text-softcharcoal">take a screenshot</strong> of the confirmation receipt showing the 13-digit Reference Number.</li>
                                <li>Input the Reference Number below and upload your receipt screenshot to submit for verification.</li>
                            </ol>
                        </div>
                    </div>

                    {/* Payment Proof Submission Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-warmbeige/70">
                        <h4 className="text-xs font-black uppercase tracking-wider text-softcharcoal">
                            Submit Payment Details & Receipt Proof
                        </h4>

                        {/* Reference Number Field */}
                        <div>
                            <label className="block text-xs font-bold text-softcharcoal">
                                GCash Reference Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. 1002 9384 1928"
                                value={data.reference_number}
                                onChange={(e) => setData('reference_number', e.target.value)}
                                className={`mt-1.5 w-full rounded-xl border ${
                                    errors.reference_number ? 'border-red-500 ring-1 ring-red-500' : 'border-warmbeige'
                                } bg-white px-4 py-2.5 text-xs text-softcharcoal focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                            />
                            {errors.reference_number && (
                                <p className="mt-1 text-xs text-red-600">{errors.reference_number}</p>
                            )}
                            <p className="mt-1 text-[10px] text-warmgray">
                                Found at the top of your GCash receipt SMS or confirmation screenshot.
                            </p>
                        </div>

                        {/* Receipt Upload Field */}
                        <div>
                            <label className="block text-xs font-bold text-softcharcoal">
                                Upload Receipt Screenshot <span className="text-red-500">*</span>
                            </label>

                            {receiptPreview ? (
                                <div className="mt-1.5 flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3">
                                    <img
                                        src={receiptPreview}
                                        alt="Receipt Preview"
                                        className="h-16 w-16 rounded-xl object-cover ring-1 ring-emerald-300"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-emerald-900 truncate">
                                            {data.receipt?.name || 'receipt_screenshot.png'}
                                        </p>
                                        <p className="text-[10px] text-emerald-700">
                                            {data.receipt?.size ? `${Math.round(data.receipt.size / 1024)} KB` : 'Image ready for submission'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveReceipt}
                                        className="rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-1.5 flex justify-center rounded-2xl border-2 border-dashed border-warmbeige bg-ivory/40 px-6 py-6 transition hover:border-blue-300">
                                    <div className="text-center space-y-1">
                                        <span className="text-3xl text-warmgray">🧾</span>
                                        <div className="flex text-xs text-warmgray justify-center">
                                            <label className="relative cursor-pointer rounded-md font-bold text-blue-600 hover:text-blue-700">
                                                <span>Click to upload receipt</span>
                                                <input
                                                    type="file"
                                                    required
                                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                                    onChange={handleReceiptChange}
                                                    className="sr-only"
                                                />
                                            </label>
                                            <span className="pl-1">or drag and drop</span>
                                        </div>
                                        <p className="text-[10px] text-warmgray">
                                            PNG, JPG, or WEBP up to 5MB
                                        </p>
                                    </div>
                                </div>
                            )}

                            {errors.receipt && (
                                <p className="mt-1 text-xs text-red-600">{errors.receipt}</p>
                            )}
                        </div>

                        {/* Customer Notes */}
                        <div>
                            <label className="block text-xs font-semibold text-softcharcoal">
                                Message or Payment Note to Supplier (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Sent via my personal GCash account ending in 4567"
                                value={data.customer_notes}
                                onChange={(e) => setData('customer_notes', e.target.value)}
                                className="mt-1.5 w-full rounded-xl border border-warmbeige bg-white px-4 py-2 text-xs text-softcharcoal focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-warmbeige/70">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={processing}
                                className="w-full sm:w-auto rounded-xl border border-warmbeige bg-white px-5 py-2.5 text-xs font-bold text-softcharcoal hover:bg-ivory transition"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={processing || !data.reference_number || !data.receipt}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Submitting Payment...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Submit Payment for Verification</span>
                                        <span>→</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* QR Zoom Modal */}
            {qrZoomed && settings?.gcash_qr_url && (
                <div
                    className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setQrZoomed(false)}
                >
                    <div className="relative max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
                        <h3 className="text-sm font-bold text-softcharcoal mb-3">
                            {supplierBusinessName} GCash QR
                        </h3>
                        <img
                            src={settings.gcash_qr_url}
                            alt="GCash QR Zoomed"
                            className="mx-auto h-72 w-72 object-contain rounded-xl"
                        />
                        <button
                            type="button"
                            onClick={() => setQrZoomed(false)}
                            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                        >
                            Close QR Preview
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
