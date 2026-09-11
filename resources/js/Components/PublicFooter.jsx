import { Link } from '@inertiajs/react';

export default function PublicFooter() {
    return (
        <footer className="bg-[#24221E] text-white border-t border-[#DCC9A8]/20 pt-16 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
                    {/* Brand Column */}
                    <div className="space-y-4 md:col-span-1">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-2 border-[#C99632] flex items-center justify-center bg-[#24221E] shadow-sm">
                                <svg
                                    className="w-5 h-5 text-[#C99632]"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="8" cy="12" r="5" />
                                    <circle cx="16" cy="12" r="5" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-serif text-lg font-bold text-[#EFE7D8] leading-tight">
                                    Event & Wedding
                                </span>
                                <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#C99632]">
                                    SUPPLIER MANAGEMENT
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-[#DFDAD4] leading-relaxed">
                            Connecting premier wedding and event suppliers with clients seeking extraordinary, stress-free celebrations.
                        </p>
                        <div className="pt-2">
                            <p className="text-xs italic text-[#DCC9A8]">
                                "Your Special Moments, Our Priority"
                            </p>
                        </div>
                    </div>

                    {/* Quick Navigation */}
                    <div>
                        <h4 className="font-serif text-sm font-bold text-[#EFE7D8] uppercase tracking-wider mb-4">
                            Explore
                        </h4>
                        <ul className="space-y-2.5 text-xs text-[#DFDAD4]">
                            <li>
                                <Link href="/" className="hover:text-[#C99632] transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/suppliers" className="hover:text-[#C99632] transition-colors">
                                    Our Trusted Suppliers
                                </Link>
                            </li>
                            <li>
                                <Link href="/events" className="hover:text-[#C99632] transition-colors">
                                    Event Categories
                                </Link>
                            </li>
                            <li>
                                <Link href="/packages" className="hover:text-[#C99632] transition-colors">
                                    Packages & Services
                                </Link>
                            </li>
                            <li>
                                <Link href="/gallery" className="hover:text-[#C99632] transition-colors">
                                    Inspiration Gallery
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="font-serif text-sm font-bold text-[#EFE7D8] uppercase tracking-wider mb-4">
                            Event Categories
                        </h4>
                        <ul className="space-y-2.5 text-xs text-[#DFDAD4]">
                            <li>
                                <Link href="/suppliers?category=Wedding" className="hover:text-[#C99632] transition-colors">
                                    Weddings
                                </Link>
                            </li>
                            <li>
                                <Link href="/suppliers?category=Birthday" className="hover:text-[#C99632] transition-colors">
                                    Birthdays & Milestones
                                </Link>
                            </li>
                            <li>
                                <Link href="/suppliers?category=Debut" className="hover:text-[#C99632] transition-colors">
                                    Debuts
                                </Link>
                            </li>
                            <li>
                                <Link href="/suppliers?category=Corporate" className="hover:text-[#C99632] transition-colors">
                                    Corporate Events & Galas
                                </Link>
                            </li>
                            <li>
                                <Link href="/suppliers?category=Anniversary" className="hover:text-[#C99632] transition-colors">
                                    Anniversaries
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact & Supplier Partnership */}
                    <div>
                        <h4 className="font-serif text-sm font-bold text-[#EFE7D8] uppercase tracking-wider mb-4">
                            For Suppliers
                        </h4>
                        <p className="text-xs text-[#DFDAD4] leading-relaxed mb-4">
                            Are you a passionate event professional, caterer, or photographer? Join our curated supplier network.
                        </p>
                        <Link
                            href={route('register')}
                            className="inline-block px-5 py-2.5 rounded-full border border-[#C99632] text-[#C99632] hover:bg-[#C99632] hover:text-white text-xs font-bold tracking-wider uppercase transition-all duration-200"
                        >
                            Become a Partner
                        </Link>
                    </div>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#77736C]">
                    <p>© {new Date().getFullYear()} Event & Wedding Supplier Management. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="hover:text-[#DCC9A8] transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-[#DCC9A8] transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-[#DCC9A8] transition-colors">Support</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
