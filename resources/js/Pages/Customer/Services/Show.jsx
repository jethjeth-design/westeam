import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Show({ service, otherServices = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const supplier = service?.supplier;
    const profile = supplier?.supplier_profile || supplier?.supplierProfile;
    const businessName = profile?.business_name || supplier?.name || 'Verified Supplier';

    const getImageUrl = (path) => {
        if (!path) return 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80';
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
            return path;
        }
        return `/storage/${path}`;
    };

    const getProfilePicture = (p) => {
        if (!p?.profile_picture) return null;
        if (p.profile_picture.startsWith('http')) return p.profile_picture;
        return `/storage/${p.profile_picture}`;
    };

    const profilePic = getProfilePicture(profile);

    return (
        <DashboardLayout>
            <Head title={`${service.name} - Service Details`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumbs */}
                <nav className="mb-6 flex items-center gap-2 text-xs text-[#77736C]">
                    <Link
                        href={user ? route('customer.dashboard') : route('home')}
                        className="hover:text-[#A87520] transition"
                    >
                        {user ? 'Dashboard' : 'Home'}
                    </Link>
                    <span>/</span>
                    <Link href={route('customer.services.index')} className="hover:text-[#A87520] transition">
                        Services
                    </Link>
                    <span>/</span>
                    <span className="font-semibold text-[#24221E] truncate max-w-xs">{service.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content (2 Cols) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Service Hero / Media */}
                        <div className="overflow-hidden rounded-3xl border border-[#EFE7D8] bg-white shadow-xs">
                            <div className="relative h-72 sm:h-96 w-full bg-[#EFE7D8] overflow-hidden">
                                <img
                                    src={getImageUrl(service.image_path)}
                                    alt={service.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#24221E]/60 via-transparent to-transparent" />

                                <div className="absolute top-4 left-4">
                                    <span className="inline-flex items-center rounded-full bg-[#24221E]/80 backdrop-blur-md px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white border border-white/20">
                                        {service.category || 'Event Service'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 sm:p-8">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#24221E]">
                                            {service.name}
                                        </h1>
                                        <p className="mt-1 text-sm text-[#77736C]">
                                            Provided by <span className="font-semibold text-[#24221E]">{businessName}</span>
                                        </p>
                                    </div>

                                    {service.price !== null && (
                                        <div className="text-right">
                                            <p className="text-[11px] uppercase tracking-wider text-[#77736C] font-semibold">Price</p>
                                            <p className="text-2xl sm:text-3xl font-black text-[#A87520]">
                                                ₱{Number(service.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-6 border-t border-[#EFE7D8]">
                                    <h2 className="font-serif font-bold text-lg text-[#24221E] mb-3">Service Description</h2>
                                    <div className="text-sm text-[#77736C] leading-relaxed whitespace-pre-line">
                                        {service.description || 'No detailed description provided for this service.'}
                                    </div>
                                </div>

                                {service.event_type && (
                                    <div className="mt-6 pt-6 border-t border-[#EFE7D8] flex items-center gap-3">
                                        <span className="text-xs font-bold text-[#24221E]">Suitable For:</span>
                                        <span className="inline-block px-3 py-1 rounded-full bg-[#EFE7D8] text-xs font-semibold text-[#A87520]">
                                            {service.event_type}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Packages Including This Service */}
                        {service.packages && service.packages.length > 0 && (
                            <div className="rounded-3xl border border-[#EFE7D8] bg-white p-6 sm:p-8 shadow-xs">
                                <h2 className="font-serif font-bold text-lg text-[#24221E] mb-4">
                                    Available in Curated Packages
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {service.packages.map((pkg) => (
                                        <div
                                            key={pkg.id}
                                            className="p-4 rounded-2xl border border-[#EFE7D8] bg-[#F8F5EF] flex flex-col justify-between"
                                        >
                                            <div>
                                                <h3 className="font-bold text-sm text-[#24221E]">{pkg.name}</h3>
                                                {pkg.description && (
                                                    <p className="text-xs text-[#77736C] mt-1 line-clamp-2">{pkg.description}</p>
                                                )}
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-[#EFE7D8] flex items-center justify-between">
                                                <span className="font-bold text-sm text-[#A87520]">
                                                    ₱{Number(pkg.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </span>
                                                <Link
                                                    href={route('customer.bookings.create', { package_id: pkg.id })}
                                                    className="text-xs font-bold text-[#C99632] hover:text-[#A87520]"
                                                >
                                                    Book Package →
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar (1 Col) */}
                    <div className="space-y-6">
                        {/* Booking Action Card */}
                        <div className="rounded-3xl border border-[#DCC9A8] bg-gradient-to-b from-white to-[#F8F5EF] p-6 shadow-sm">
                            <h3 className="font-serif font-bold text-lg text-[#24221E]">Ready to Book?</h3>
                            <p className="text-xs text-[#77736C] mt-1.5 leading-relaxed">
                                Reserve this service now for your event date. You can customize dates, locations, and special instructions.
                            </p>

                            <div className="mt-6 space-y-3">
                                <Link
                                    href={route('customer.bookings.create', { service_id: service.id })}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#C99632] to-[#A87520] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition active:scale-95"
                                >
                                    <span>Book Now</span>
                                    <span>→</span>
                                </Link>

                                <Link
                                    href={route('customer.services.index')}
                                    className="w-full inline-flex items-center justify-center rounded-2xl border border-[#DCC9A8] bg-white px-5 py-3 text-xs font-bold text-[#24221E] hover:bg-[#EFE7D8] transition"
                                >
                                    Back to All Services
                                </Link>
                            </div>
                        </div>

                        {/* Supplier Card */}
                        <div className="rounded-3xl border border-[#EFE7D8] bg-white p-6 shadow-xs">
                            <h3 className="font-serif font-bold text-base text-[#24221E] mb-4">About the Supplier</h3>

                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-[#DCC9A8] bg-[#EFE7D8] flex items-center justify-center font-bold text-sm text-[#A87520]">
                                    {profilePic ? (
                                        <img src={profilePic} alt={businessName} className="h-full w-full object-cover" />
                                    ) : (
                                        businessName.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <h4 className="font-bold text-sm text-[#24221E] truncate">{businessName}</h4>
                                        <span className="text-xs text-emerald-600 font-bold">✓</span>
                                    </div>
                                    <p className="text-xs text-[#77736C] truncate">{profile?.address || 'Verified Supplier'}</p>
                                </div>
                            </div>

                            {profile?.description && (
                                <p className="mt-4 text-xs text-[#77736C] line-clamp-3 leading-relaxed">
                                    {profile.description}
                                </p>
                            )}

                            <div className="mt-5 pt-4 border-t border-[#EFE7D8]">
                                <Link
                                    href={route('customer.suppliers.portfolio', service.supplier_id)}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C99632] hover:text-[#A87520] transition"
                                >
                                    <span>View Supplier Portfolio</span>
                                    <span>→</span>
                                </Link>
                            </div>
                        </div>

                        {/* Other Services from this Supplier */}
                        {otherServices.length > 0 && (
                            <div className="rounded-3xl border border-[#EFE7D8] bg-white p-6 shadow-xs">
                                <h3 className="font-serif font-bold text-sm text-[#24221E] mb-3">
                                    More from {businessName}
                                </h3>
                                <div className="space-y-3">
                                    {otherServices.map((other) => (
                                        <Link
                                            key={other.id}
                                            href={route('customer.services.show', other.id)}
                                            className="block p-3 rounded-2xl bg-[#F8F5EF] hover:bg-[#EFE7D8] transition border border-[#EFE7D8]"
                                        >
                                            <p className="font-bold text-xs text-[#24221E] truncate">{other.name}</p>
                                            <p className="text-[11px] font-semibold text-[#A87520] mt-0.5">
                                                ₱{Number(other.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
