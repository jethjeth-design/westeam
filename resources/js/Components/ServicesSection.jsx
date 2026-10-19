import { Link } from '@inertiajs/react';
import { useState } from 'react';

export default function ServicesSection({
    services = [],
    isActive = true,
    title = 'Curated Event Services',
    subtitle = 'Explore individual services tailored by our verified suppliers to make every moment extraordinary.',
}) {
    const [selectedService, setSelectedService] = useState(null);

    if (isActive === false || !services || services.length === 0) {
        return null;
    }

    const formatPrice = (price) => {
        if (price === null || price === undefined || price === '') {
            return 'Price upon request';
        }
        return `₱${Number(price).toLocaleString('en-PH', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <section
            id="services-section"
            className="py-16 sm:py-24 bg-gradient-to-b from-[#F8F5EF] via-white to-[#F8F5EF] relative overflow-hidden border-t border-[#EFE7D8]/80"
        >
            {/* Ambient luxury glows */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#C99632]/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 -right-20 w-80 h-80 rounded-full bg-[#A87520]/5 blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE7D8]/90 border border-[#DCC9A8]/70 text-[#A87520] text-[10px] font-bold tracking-widest uppercase mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C99632]" />
                            Bespoke Offerings
                        </div>
                        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24221E] leading-tight">
                            {title}
                        </h2>
                        <p className="text-[#77736C] text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
                            {subtitle}
                        </p>
                    </div>

                    {/* View Services Button (Top CTA) */}
                    <Link
                        href={route('customer.services.index')}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-[#DCC9A8] hover:border-[#C99632] hover:bg-[#EFE7D8] text-[#24221E] hover:text-[#A87520] text-xs font-bold uppercase tracking-wider shadow-xs hover:shadow-md transition-all duration-200 self-start sm:self-auto group"
                    >
                        <span>View Services</span>
                        <svg
                            className="w-4 h-4 text-[#C99632] group-hover:translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {services.map((service, index) => {
                        const hasPrice = service.price !== null && service.price !== undefined && service.price !== '';

                        return (
                            <div
                                key={service.id || index}
                                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[#EFE7D8] bg-white shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#DCC9A8]"
                            >
                                <div>
                                    {/* Image with Category Badge */}
                                    <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#EFE7D8]">
                                        <img
                                            src={service.image_path}
                                            alt={service.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src =
                                                    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#24221E]/60 via-transparent to-transparent" />

                                        {/* Category Badge */}
                                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-white/60 text-[#A87520] text-[10px] font-bold tracking-wider uppercase shadow-xs">
                                            {service.category || 'Service'}
                                        </div>

                                        {/* Price floating tag */}
                                        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-[#24221E]/85 backdrop-blur-md border border-white/10 text-white">
                                            <p className="text-[9px] text-[#DFDAD4] uppercase font-semibold leading-none">Starting</p>
                                            <p className="text-sm font-black text-[#EFE7D8] leading-tight">
                                                {formatPrice(service.price)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-5 sm:p-6">
                                        {/* Supplier row */}
                                        <div className="flex items-center gap-2.5 mb-3">
                                            <div className="w-7 h-7 rounded-full bg-[#EFE7D8] border border-[#DCC9A8] overflow-hidden flex items-center justify-center shrink-0 text-[#A87520] font-bold text-[10px]">
                                                {service.supplier_avatar ? (
                                                    <img
                                                        src={service.supplier_avatar}
                                                        alt={service.supplier_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    (service.supplier_name || 'S').charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1 flex items-center gap-1.5">
                                                <span className="text-xs font-bold text-[#77736C] truncate group-hover:text-[#24221E] transition-colors">
                                                    {service.supplier_name || 'Verified Supplier'}
                                                </span>
                                                <span className="text-[10px] text-emerald-600 font-bold shrink-0" title="Verified Supplier">
                                                    ✓
                                                </span>
                                            </div>
                                        </div>

                                        {/* Service Title */}
                                        <h3 className="font-serif font-bold text-lg text-[#24221E] group-hover:text-[#A87520] transition-colors line-clamp-1 leading-snug">
                                            {service.name}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-xs text-[#77736C] mt-2 line-clamp-2 leading-relaxed">
                                            {service.description || 'Professional event service tailored to your personal requirements and event style.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Card Footer Actions: View Service & Book Now */}
                                <div className="px-5 sm:px-6 pb-6 pt-2 flex items-center justify-between gap-3 border-t border-[#EFE7D8]/80 mt-auto">
                                    {/* View Service button (opens details) */}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedService(service)}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-[#DCC9A8] hover:border-[#C99632] hover:bg-[#EFE7D8] text-[#24221E] font-bold text-xs tracking-wider uppercase transition text-center cursor-pointer"
                                    >
                                        View Service
                                    </button>

                                    {/* Book Now button (opens booking form with service preselected) */}
                                    <Link
                                        href={route('customer.bookings.create', { service_id: service.id })}
                                        className="flex-1 inline-flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C99632] to-[#A87520] hover:from-[#A87520] hover:to-[#8E6319] text-white font-bold text-xs tracking-wider uppercase shadow-xs hover:shadow-md transition active:scale-95 text-center"
                                    >
                                        <span>Book Now</span>
                                        <span aria-hidden="true">→</span>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA to View All Services */}
                <div className="mt-12 text-center">
                    <Link
                        href={route('customer.services.index')}
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-[#DCC9A8] hover:border-[#C99632] text-[#24221E] hover:text-[#A87520] font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 shadow-xs hover:shadow-md bg-white"
                    >
                        <span>Explore All Services</span>
                        <svg className="w-4 h-4 text-[#C99632]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* Service Details Interactive Modal */}
            {selectedService && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24221E]/60 backdrop-blur-xs transition-opacity"
                    onClick={() => setSelectedService(null)}
                >
                    <div
                        className="relative w-full max-w-lg rounded-3xl bg-white border border-[#DCC9A8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header Image */}
                        <div className="relative h-56 w-full bg-[#EFE7D8] overflow-hidden shrink-0">
                            <img
                                src={selectedService.image_path}
                                alt={selectedService.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#24221E]/70 via-transparent to-transparent" />

                            {/* Close Button */}
                            <button
                                type="button"
                                onClick={() => setSelectedService(null)}
                                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#24221E]/60 hover:bg-[#24221E] text-white flex items-center justify-center transition shadow-md cursor-pointer"
                                aria-label="Close details"
                            >
                                ✕
                            </button>

                            {/* Badge */}
                            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#A87520] text-[10px] font-bold uppercase tracking-wider">
                                {selectedService.category || 'Service Details'}
                            </div>

                            {/* Title overlay in header */}
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <h3 className="font-serif font-bold text-xl sm:text-2xl leading-tight">
                                    {selectedService.name}
                                </h3>
                                <p className="text-xs text-[#EFE7D8] mt-1 font-medium">
                                    by {selectedService.supplier_name}
                                </p>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-4">
                            {/* Price & Location row */}
                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F5EF] border border-[#EFE7D8]">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-[#77736C] tracking-wider">Starting Price</p>
                                    <p className="text-xl font-black text-[#A87520]">
                                        {formatPrice(selectedService.price)}
                                    </p>
                                </div>

                                {selectedService.supplier_address && (
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-bold text-[#77736C] tracking-wider">Location</p>
                                        <p className="text-xs font-semibold text-[#24221E] max-w-[180px] truncate">
                                            📍 {selectedService.supplier_address}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <h4 className="font-serif font-bold text-sm text-[#24221E] mb-2">Service Details</h4>
                                <p className="text-xs text-[#77736C] leading-relaxed whitespace-pre-line">
                                    {selectedService.description || 'No detailed description available. Contact supplier or proceed to booking to inquire.'}
                                </p>
                            </div>

                            {/* Supplier info cardlet */}
                            <div className="p-3.5 rounded-2xl border border-[#EFE7D8] bg-white flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-[#EFE7D8] border border-[#DCC9A8] overflow-hidden flex items-center justify-center font-bold text-xs text-[#A87520] shrink-0">
                                        {selectedService.supplier_avatar ? (
                                            <img
                                                src={selectedService.supplier_avatar}
                                                alt={selectedService.supplier_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            (selectedService.supplier_name || 'S').charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-[#24221E] truncate">
                                            {selectedService.supplier_name}
                                        </p>
                                        <p className="text-[10px] text-emerald-600 font-semibold">
                                            Verified Supplier
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href={route('customer.suppliers.portfolio', selectedService.supplier_id)}
                                    className="shrink-0 text-[11px] font-bold text-[#C99632] hover:text-[#A87520] transition"
                                >
                                    View Portfolio →
                                </Link>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-5 border-t border-[#EFE7D8] bg-[#F8F5EF] flex items-center justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => setSelectedService(null)}
                                className="px-4 py-2.5 rounded-xl border border-[#DCC9A8] bg-white text-xs font-bold text-[#24221E] hover:bg-[#EFE7D8] transition"
                            >
                                Close
                            </button>

                            <Link
                                href={route('customer.bookings.create', { service_id: selectedService.id })}
                                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C99632] to-[#A87520] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition active:scale-95"
                            >
                                <span>Book Now</span>
                                <span>→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
