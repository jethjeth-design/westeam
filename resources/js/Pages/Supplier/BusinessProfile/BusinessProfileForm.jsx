import { useEffect, useRef, useState } from 'react';
import { useForm, Link } from '@inertiajs/react';

export default function BusinessProfileForm({
    profile,
    categories = [],
    portfolios = [],
}) {
    const coverInputRef = useRef(null);
    const logoInputRef = useRef(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [selectedCatToAdd, setSelectedCatToAdd] = useState('');

    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        business_name: '',
        supplier_category_ids: [],
        contact_number: '',
        address: '',
        description: '',
        profile_picture: null,
        cover_photo: null,
        years_of_experience: '',
        facebook_page: '',
    });

    /*
    |--------------------------------------------------------------------------
    | Load existing business profile
    |--------------------------------------------------------------------------
    */
    useEffect(() => {
        if (!profile) {
            return;
        }

        setData({
            business_name: profile.business_name ?? '',
            supplier_category_ids:
                Array.isArray(profile.categories)
                    ? profile.categories.map((cat) => Number(cat.id))
                    : [],
            contact_number: profile.contact_number ?? '',
            address: profile.address ?? '',
            description: profile.description ?? '',
            years_of_experience: profile.years_of_experience ?? '',
            facebook_page: profile.facebook_page ?? '',
            profile_picture: null,
            cover_photo: null,
        });
    }, [profile]);

    /*
    |--------------------------------------------------------------------------
    | File handlers
    |--------------------------------------------------------------------------
    */
    const handleCoverChange = (e) => {
        const file = e.target.files?.[0] ?? null;
        setData('cover_photo', file);
        if (file) {
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0] ?? null;
        setData('profile_picture', file);
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Category handlers
    |--------------------------------------------------------------------------
    */
    const removeCategory = (categoryId) => {
        const id = Number(categoryId);
        setData(
            'supplier_category_ids',
            data.supplier_category_ids.filter((existing) => existing !== id)
        );
    };

    const handleAddSelectedCategory = () => {
        if (!selectedCatToAdd) return;
        const id = Number(selectedCatToAdd);
        if (!data.supplier_category_ids.includes(id)) {
            setData('supplier_category_ids', [...data.supplier_category_ids, id]);
        }
        setSelectedCatToAdd('');
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */
    const submit = (e) => {
        e.preventDefault();

        post(route('supplier.business-profile.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const logoSrc = logoPreview || (profile?.profile_picture ? `/storage/${profile.profile_picture}` : null);
    const coverSrc = coverPreview || (profile?.cover_photo ? `/storage/${profile.cover_photo}` : null);
    const initials = (profile?.business_name || data.business_name || 'B').charAt(0).toUpperCase();

    // Available categories not yet chosen
    const availableCategories = categories.filter(
        (cat) => !data.supplier_category_ids.includes(Number(cat.id))
    );

    // Flatten portfolio images for preview grid
    const portfolioImages = [];
    if (Array.isArray(portfolios)) {
        for (const p of portfolios) {
            if (p.cover_image) {
                portfolioImages.push(p.cover_image.startsWith('/') || p.cover_image.startsWith('http') ? p.cover_image : `/storage/${p.cover_image}`);
            } else if (p.images && p.images.length > 0) {
                const imgPath = p.images[0].image_path;
                portfolioImages.push(imgPath.startsWith('/') || imgPath.startsWith('http') ? imgPath : `/storage/${imgPath}`);
            }
            if (portfolioImages.length >= 4) break;
        }
    }

    return (
        <div className="space-y-6">
            {/* Top Bar Header with Preview Profile */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {profile?.user_id && (
                    <Link
                        href={route('suppliers.portfolio.show', profile.user_id)}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-xs font-bold text-indigo-600 shadow-xs transition hover:bg-indigo-50 hover:text-indigo-700 active:scale-95"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview Profile
                    </Link>
                )}
            </div>

            <form onSubmit={submit} encType="multipart/form-data">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

                    {/* ═══════════════════════════════════════════════════════════════
                        LEFT COLUMN: STEP 1 - Business Profile (Direct Edit)
                    ═══════════════════════════════════════════════════════════════ */}
                    <div className="space-y-6 lg:col-span-7">

                        {/* Step 1 Card */}
                        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
                            {/* Card Header */}
                            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-black text-white shadow-sm shadow-indigo-600/30">
                                    1
                                </span>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">
                                        Business Profile (Direct Edit)
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Update your business information directly.
                                    </p>
                                </div>
                            </div>

                            {/* Cover Photo Header */}
                            <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                                {coverSrc ? (
                                    <img
                                        src={coverSrc}
                                        alt="Business Cover"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-slate-800 via-indigo-950 to-slate-900 text-white/50">
                                        <div className="text-center">
                                            <span className="text-3xl">🖼️</span>
                                            <p className="mt-1 text-xs font-semibold text-slate-300">No cover photo set</p>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => coverInputRef.current?.click()}
                                    className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-md backdrop-blur-sm transition hover:bg-white active:scale-95"
                                >
                                    <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Change Cover Photo
                                </button>
                                <input
                                    ref={coverInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleCoverChange}
                                />
                                {errors.cover_photo && (
                                    <p className="absolute bottom-2 left-4 rounded-lg bg-red-600/90 px-2.5 py-1 text-xs font-semibold text-white shadow">
                                        {errors.cover_photo}
                                    </p>
                                )}
                            </div>

                            {/* Centered Circular Avatar / Logo Section */}
                            <div className="relative px-6 pb-6 pt-0">
                                <div className="-mt-14 mb-5 flex flex-col items-center">
                                    <div className="relative group">
                                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-900 shadow-lg ring-1 ring-slate-100">
                                            {logoSrc ? (
                                                <img
                                                    src={logoSrc}
                                                    alt="Business Logo"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-indigo-700 to-violet-600 text-2xl font-black text-white">
                                                    {initials}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => logoInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white shadow-md transition hover:bg-indigo-700 active:scale-95"
                                            title="Upload logo"
                                        >
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            </svg>
                                        </button>
                                        <input
                                            ref={logoInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            onChange={handleLogoChange}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => logoInputRef.current?.click()}
                                        className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                                    >
                                        Upload Logo
                                    </button>
                                    <p className="text-[11px] text-slate-400">
                                        JPG, PNG up to 2MB
                                    </p>

                                    {errors.profile_picture && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.profile_picture}
                                        </p>
                                    )}
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-4">
                                    {/* Business Name */}
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-slate-700">
                                            Business Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.business_name}
                                            onChange={(e) => setData('business_name', e.target.value)}
                                            placeholder="e.g. ABC Events & Weddings"
                                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 shadow-xs outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                            required
                                        />
                                        {errors.business_name && (
                                            <p className="mt-1 text-xs text-red-500">{errors.business_name}</p>
                                        )}
                                    </div>

                                    {/* Contact Number & Location */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1 block text-xs font-bold text-slate-700">
                                                Contact Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.contact_number}
                                                onChange={(e) => setData('contact_number', e.target.value)}
                                                placeholder="0917 123 4567"
                                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 shadow-xs outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                                required
                                            />
                                            {errors.contact_number && (
                                                <p className="mt-1 text-xs text-red-500">{errors.contact_number}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-bold text-slate-700">
                                                Location / Address <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                placeholder="Cebu City, Cebu, Philippines"
                                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 shadow-xs outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                                required
                                            />
                                            {errors.address && (
                                                <p className="mt-1 text-xs text-red-500">{errors.address}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Business Description */}
                                    <div>
                                        <div className="mb-1 flex items-center justify-between">
                                            <label className="block text-xs font-bold text-slate-700">
                                                Business Description <span className="text-red-500">*</span>
                                            </label>
                                            <span className="text-[11px] font-medium text-slate-400">
                                                {data.description.length}/500
                                            </span>
                                        </div>
                                        <textarea
                                            rows="4"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="We create unforgettable experiences through beautifully planned and flawlessly executed events..."
                                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 shadow-xs outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                            maxLength={500}
                                            required
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-xs text-red-500">{errors.description}</p>
                                        )}
                                    </div>

                                    {/* Years of Experience & Facebook Page */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1 block text-xs font-bold text-slate-700">
                                                Years of Experience
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={data.years_of_experience}
                                                onChange={(e) => setData('years_of_experience', e.target.value)}
                                                placeholder="e.g. 5"
                                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 shadow-xs outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                            />
                                            {errors.years_of_experience && (
                                                <p className="mt-1 text-xs text-red-500">{errors.years_of_experience}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-bold text-slate-700">
                                                Facebook Page <span className="text-slate-400 font-normal">(Optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.facebook_page}
                                                onChange={(e) => setData('facebook_page', e.target.value)}
                                                placeholder="facebook.com/abcevents"
                                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 shadow-xs outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                            />
                                            {errors.facebook_page && (
                                                <p className="mt-1 text-xs text-red-500">{errors.facebook_page}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Save Changes Button */}
                                    <div className="flex justify-center pt-3">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-2.5 text-xs font-bold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {processing ? (
                                                <>
                                                    <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                    </svg>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                                    </svg>
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Portfolio Preview Card */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
                            <h3 className="text-sm font-bold text-slate-900">
                                Portfolio Preview
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Recent photos displayed on your public supplier profile.
                            </p>

                            {/* 4 Image Thumbnails Grid */}
                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {portfolioImages.length > 0 ? (
                                    portfolioImages.map((src, i) => (
                                        <div key={i} className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-slate-100 shadow-xs">
                                            <img
                                                src={src}
                                                alt={`Portfolio preview ${i + 1}`}
                                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                    ))
                                ) : (
                                    [1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-400"
                                        >
                                            <span className="text-xl opacity-60">📷</span>
                                            <span className="mt-1 text-[10px] font-medium">Photo {i}</span>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Manage Portfolio Action Banner */}
                            <Link
                                href={route('supplier.portfolio.index')}
                                className="mt-4 flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 transition hover:bg-indigo-100/60 active:scale-[0.99]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-950">Manage Portfolio</p>
                                        <p className="text-[11px] text-slate-500">Add, edit or remove your portfolio photos</p>
                                    </div>
                                </div>
                                <span className="text-base font-bold text-indigo-600">›</span>
                            </Link>
                        </div>

                    </div>

                    {/* ═══════════════════════════════════════════════════════════════
                        RIGHT COLUMN: STEP 2 - Supplier Categories
                    ═══════════════════════════════════════════════════════════════ */}
                    <div className="space-y-6 lg:col-span-5">

                        {/* Categories Card */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
                            {/* Card Header */}
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-black text-white shadow-sm shadow-indigo-600/30">
                                    2
                                </span>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">
                                        Supplier Categories
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Manage the categories that best describe your business.
                                    </p>
                                </div>
                            </div>

                            {/* Your Categories List */}
                            <div className="mt-5">
                                <p className="text-xs font-bold text-slate-800">Your Categories</p>
                                <p className="mt-0.5 text-[11px] text-slate-500">
                                    These are the categories displayed on your profile.
                                </p>

                                <div className="mt-3 space-y-2">
                                    {data.supplier_category_ids.length > 0 ? (
                                        categories
                                            .filter((cat) => data.supplier_category_ids.includes(Number(cat.id)))
                                            .map((cat) => (
                                                <div
                                                    key={cat.id}
                                                    className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-2.5 transition"
                                                >
                                                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
                                                        <span className="text-indigo-600">🏷️</span>
                                                        <span>{cat.name}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCategory(cat.id)}
                                                        className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                                        title="Remove category"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center">
                                            <p className="text-xs text-slate-400">No categories selected yet.</p>
                                        </div>
                                    )}
                                </div>
                                {errors.supplier_category_ids && (
                                    <p className="mt-2 text-xs text-red-500">{errors.supplier_category_ids}</p>
                                )}
                            </div>

                            {/* Add Category Section */}
                            <div className="mt-6 border-t border-slate-100 pt-5">
                                <p className="text-xs font-bold text-slate-800">Add Category</p>
                                <p className="mt-0.5 text-[11px] text-slate-500">
                                    Select from available categories to add to your profile.
                                </p>

                                <div className="mt-3 space-y-2.5">
                                    <select
                                        value={selectedCatToAdd}
                                        onChange={(e) => setSelectedCatToAdd(e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 shadow-xs outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                    >
                                        <option value="">Select a category</option>
                                        {availableCategories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        type="button"
                                        disabled={!selectedCatToAdd}
                                        onClick={handleAddSelectedCategory}
                                        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/50 py-2.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <span>+</span> Add Category
                                    </button>
                                </div>
                            </div>

                            {/* Tips Box */}
                            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                                <div className="flex items-start gap-2.5">
                                    <span className="text-lg leading-none">💡</span>
                                    <div>
                                        <p className="text-xs font-bold text-amber-900">Tips</p>
                                        <p className="mt-0.5 text-[11px] leading-relaxed text-amber-800">
                                            Choose the categories that best represent the services your business provides.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Save Categories Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                        Save Categories
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Admin Approval Notice */}
                        <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                            <span className="text-base text-slate-400">🔒</span>
                            <p className="text-[11px] leading-relaxed text-slate-500">
                                Changes will be saved and reflected on your public profile after approval by the admin.
                            </p>
                        </div>

                    </div>

                </div>
            </form>
        </div>
    );
}