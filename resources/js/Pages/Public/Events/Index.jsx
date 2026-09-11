import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';

export default function EventsIndex({ categories = [] }) {
    // Default categories if database has specific set
    const displayCategories = categories.length > 0 ? categories : [
        { id: 1, name: 'Wedding', description: 'Celebrate your love', tagline: 'Celebrate your love', image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80' },
        { id: 2, name: 'Birthday', description: 'Make it memorable', tagline: 'Make it memorable', image_url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80' },
        { id: 3, name: 'Debut', description: 'A milestone to remember', tagline: 'A milestone to remember', image_url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80' },
        { id: 4, name: 'Funeral', description: 'Honoring their legacy', tagline: 'Honoring their legacy', image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80' },
        { id: 5, name: 'Corporate Event', description: 'Build stronger connections', tagline: 'Build stronger connections', image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80' },
        { id: 6, name: 'Anniversary', description: 'Cherish the moments', tagline: 'Cherish the moments', image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80' },
        { id: 7, name: 'Other Events', description: 'Any special occasion', tagline: 'Any special occasion', image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80' },
    ];

    return (
        <PublicLayout title="Event Categories">
            <Head>
                <meta name="description" content="Choose from a variety of events and find the perfect suppliers, packages, and services for your special occasion." />
            </Head>

            {/* Header Title Section */}
            <div className="bg-[#F8F5EF] pt-12 pb-8 border-b border-[#EFE7D8]/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#24221E] tracking-tight">
                        Event Categories
                    </h1>
                    <p className="mt-3 text-sm sm:text-base text-[#77736C] max-w-2xl mx-auto">
                        Choose from a variety of events and find the perfect suppliers, packages, and services for your special occasion.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Event Categories Grid (Row 1: 4 cards, Row 2: 3 cards matching design image) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayCategories.slice(0, 4).map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/packages?category=${encodeURIComponent(cat.name)}`}
                            className="bg-white rounded-2xl overflow-hidden border border-[#EFE7D8] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group transform hover:-translate-y-1"
                        >
                            <div className="relative h-48 w-full overflow-hidden bg-[#EFE7D8]">
                                <img
                                    src={cat.image_url}
                                    alt={cat.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-serif font-bold text-lg text-[#24221E] group-hover:text-[#A87520] transition-colors">
                                        {cat.name}
                                    </h3>
                                    <p className="text-xs text-[#77736C] mt-1">
                                        {cat.description || cat.tagline}
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-[#EFE7D8] flex items-center justify-between text-xs font-bold text-[#C99632]">
                                    <span>Browse Services</span>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Second Row (3 cards matching design image) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
                    {displayCategories.slice(4, 7).map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/packages?category=${encodeURIComponent(cat.name)}`}
                            className="bg-white rounded-2xl overflow-hidden border border-[#EFE7D8] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group transform hover:-translate-y-1"
                        >
                            <div className="relative h-48 w-full overflow-hidden bg-[#EFE7D8]">
                                <img
                                    src={cat.image_url}
                                    alt={cat.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-serif font-bold text-lg text-[#24221E] group-hover:text-[#A87520] transition-colors">
                                        {cat.name}
                                    </h3>
                                    <p className="text-xs text-[#77736C] mt-1">
                                        {cat.description || cat.tagline}
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-[#EFE7D8] flex items-center justify-between text-xs font-bold text-[#C99632]">
                                    <span>Browse Services</span>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Promotional Callout Banner (Matches Design Mockup 3) */}
                <div className="mt-14 relative rounded-3xl overflow-hidden shadow-xl border border-[#DCC9A8]/40">
                    <img
                        src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80"
                        alt="Event celebration"
                        className="w-full h-72 sm:h-80 object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#24221E]/95 via-[#24221E]/70 to-transparent" />

                    <div className="absolute inset-0 flex items-center px-6 sm:px-12 lg:px-16">
                        <div className="max-w-lg text-white">
                            <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight mb-3">
                                Every Event Deserves Special Attention
                            </h2>
                            <p className="text-xs sm:text-sm text-[#DFDAD4] leading-relaxed mb-6">
                                We help you create meaningful and memorable moments with the right suppliers and services.
                            </p>
                            <Link
                                href="/packages"
                                className="inline-block px-8 py-3.5 rounded-full bg-[#C99632] hover:bg-[#A87520] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                Explore Packages
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
