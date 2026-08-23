import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useCallback, useEffect } from 'react';

export default function Show({
    supplier,
    services = [],
    packages = [],
    portfolios = [],
}) {
    const profile = supplier?.supplier_profile || supplier?.supplierProfile || null;
    const businessName = profile?.business_name || supplier?.name || 'Event Supplier';
    const supplierCategories = profile?.categories || [];

    const getProfilePicture = () => {
        const picture = profile?.profile_picture;
        if (!picture) return null;
        if (picture.startsWith('http://') || picture.startsWith('https://') || picture.startsWith('/')) {
            return picture;
        }
        return `/storage/${picture}`;
    };

    const profilePicture = getProfilePicture();

    const tabs = [
        { id: 'services', label: 'Services', count: services.length, icon: '🛠️' },
        { id: 'packages', label: 'Packages', count: packages.length, icon: '📦' },
        { id: 'portfolio', label: 'Portfolio Works', count: portfolios.length, icon: '📸' },
    ];

    const [activeTab, setActiveTab] = useState('services');

    // Lightbox state
    const [lightboxProject, setLightboxProject] = useState(null);
    const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

    const openLightbox = useCallback((portfolio, imageIndex = 0) => {
        setLightboxProject(portfolio);
        setLightboxImageIndex(imageIndex);
    }, []);

    const closeLightbox = useCallback(() => {
        setLightboxProject(null);
        setLightboxImageIndex(0);
    }, []);

    const nextImage = useCallback(() => {
        if (!lightboxProject) return;
        const images = lightboxProject.images || [];
        setLightboxImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }, [lightboxProject]);

    const prevImage = useCallback(() => {
        if (!lightboxProject) return;
        const images = lightboxProject.images || [];
        setLightboxImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    }, [lightboxProject]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!lightboxProject) return;
            if (e.key === 'Escape') closeLightbox();
            else if (e.key === 'ArrowRight') nextImage();
            else if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxProject, closeLightbox, nextImage, prevImage]);

    const getImageUrl = (image) => {
        if (!image) return null;
        if (image.image_url) return image.image_url;
        if (image.url) return image.url;
        if (image.path) {
            return image.path.startsWith('http') || image.path.startsWith('/') ? image.path : `/storage/${image.path}`;
        }
        if (image.image) {
            return image.image.startsWith('http') || image.image.startsWith('/') ? image.image : `/storage/${image.image}`;
        }
        return null;
    };

    const formatPrice = (price) => {
        const num = parseFloat(price);
        if (isNaN(num)) return price;
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(num);
    };

    return (
        <DashboardLayout>
            <Head title={`${businessName} — Supplier Profile`} />

            <div className="min-h-screen bg-slate-50/60 p-6 lg:p-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        href={route('customer.suppliers.index')}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
                    >
                        <span>←</span>
                        <span>Back to Suppliers</span>
                    </Link>
                </div>

                {/* Profile Hero Card */}
                <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
                    <div className="h-32 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <div className="px-6 pb-6 sm:px-8">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                            {/* Avatar & Info */}
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                <div className="-mt-14 h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-indigo-600 font-bold text-white text-2xl flex items-center justify-center shadow-lg shrink-0">
                                    {profilePicture ? (
                                        <img src={profilePicture} alt={businessName} className="h-full w-full object-cover" />
                                    ) : (
                                        businessName.charAt(0).toUpperCase()
                                    )}
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-2xl font-black text-slate-900">{businessName}</h1>
                                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-700/10">
                                            ✓ Verified Pro
                                        </span>
                                    </div>

                                    {/* Categories */}
                                    {supplierCategories.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {supplierCategories.map((cat) => (
                                                <span
                                                    key={cat.id}
                                                    className="rounded-lg bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700"
                                                >
                                                    {cat.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions (Chat / Book) */}
                            <div className="flex flex-wrap items-center gap-3">
                                {supplier?.id && (
                                    <button
                                        type="button"
                                        onClick={() => router.post(route('messages.direct', supplier.id))}
                                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                                    >
                                        <span>💬</span>
                                        <span>Chat with Supplier</span>
                                    </button>
                                )}

                                <Link
                                    href={route('customer.suppliers.portfolio', supplier.id)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                                >
                                    <span>📸</span>
                                    <span>Full Gallery</span>
                                </Link>
                            </div>
                        </div>

                        {/* Metadata & Description */}
                        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                            {profile?.address && <span>📍 {profile.address}</span>}
                            {profile?.contact_number && <span>📞 {profile.contact_number}</span>}
                            {supplier?.email && <span>✉️ {supplier.email}</span>}
                        </div>

                        {profile?.description && (
                            <p className="mt-4 text-xs leading-relaxed text-slate-600 max-w-4xl">
                                {profile.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Tabs Header */}
                <div className="mt-8 flex gap-2 border-b border-slate-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition ${
                                activeTab === tab.id
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] ${activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                    {/* Services Tab */}
                    {activeTab === 'services' && (
                        <div>
                            {services.length > 0 ? (
                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                    {services.map((service) => (
                                        <div
                                            key={service.id}
                                            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md"
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold">
                                                🛠️
                                            </div>
                                            <h3 className="mt-3 text-sm font-extrabold text-slate-900">{service.name}</h3>
                                            {service.description && (
                                                <p className="mt-2 line-clamp-3 text-xs text-slate-600 leading-relaxed">
                                                    {service.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
                                    No services listed yet.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Packages Tab */}
                    {activeTab === 'packages' && (
                        <div>
                            {packages.length > 0 ? (
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {packages.map((pkg) => (
                                        <div
                                            key={pkg.id}
                                            className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition hover:shadow-md"
                                        >
                                            <div className="bg-indigo-600 p-5 text-white">
                                                {pkg.event_category && (
                                                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                                                        {pkg.event_category.name}
                                                    </span>
                                                )}
                                                <h3 className="mt-2 text-base font-black">{pkg.name}</h3>
                                                <p className="mt-2 text-2xl font-black">{formatPrice(pkg.price)}</p>
                                            </div>

                                            <div className="p-5 flex flex-col justify-between flex-1">
                                                {pkg.description && (
                                                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                                                        {pkg.description}
                                                    </p>
                                                )}

                                                <div className="border-t border-slate-100 pt-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => router.post(route('messages.direct', supplier.id), { initial_message: `Hi, I am interested in your package: ${pkg.name}` })}
                                                        className="w-full rounded-xl bg-slate-900 py-2.5 text-center text-xs font-bold text-white transition hover:bg-indigo-600"
                                                    >
                                                        Inquire About Package
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
                                    No packages listed yet.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Portfolio Tab */}
                    {activeTab === 'portfolio' && (
                        <div>
                            {portfolios.length > 0 ? (
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {portfolios.map((portfolio) => {
                                        const coverUrl = portfolio.cover_image_url;
                                        return (
                                            <div
                                                key={portfolio.id}
                                                onClick={() => openLightbox(portfolio)}
                                                className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition hover:shadow-md"
                                            >
                                                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                                                    {coverUrl ? (
                                                        <img
                                                            src={coverUrl}
                                                            alt={portfolio.title}
                                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-slate-400 bg-indigo-50">
                                                            📸
                                                        </div>
                                                    )}
                                                    <span className="absolute bottom-3 right-3 rounded-lg bg-black/65 px-2 py-1 text-[10px] font-bold text-white">
                                                        📸 {portfolio.images?.length || 0} photos
                                                    </span>
                                                </div>

                                                <div className="p-4">
                                                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600">
                                                        {portfolio.title}
                                                    </h4>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {portfolio.location || 'Event Showcase'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
                                    No portfolio projects uploaded yet.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Lightbox Modal */}
                {lightboxProject && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                        onClick={closeLightbox}
                    >
                        <button
                            onClick={closeLightbox}
                            className="absolute top-5 right-5 text-2xl font-bold text-white hover:text-slate-300"
                        >
                            ✕
                        </button>
                        <div
                            className="relative max-h-[85vh] max-w-5xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {lightboxProject.images?.[lightboxImageIndex] && (
                                <img
                                    src={getImageUrl(lightboxProject.images[lightboxImageIndex])}
                                    alt="Gallery preview"
                                    className="max-h-[80vh] rounded-2xl object-contain shadow-2xl"
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
