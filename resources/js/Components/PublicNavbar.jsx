import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function PublicNavbar() {
    const { auth, url: pageUrl } = usePage().props;
    const currentUrl = typeof window !== 'undefined' ? window.location.pathname : (pageUrl || '/');
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'HOME', href: route('home'), active: currentUrl === '/' },
        { name: 'SUPPLIER', href: route('suppliers.index'), active: currentUrl.startsWith('/suppliers') },
        { name: 'EVENT', href: route('events.index'), active: currentUrl.startsWith('/events') },
        { name: 'PACKAGES', href: route('packages.index'), active: currentUrl.startsWith('/packages') },
        { name: 'GALLERY', href: route('gallery.index'), active: currentUrl.startsWith('/gallery') },
    ];

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/suppliers?search=${encodeURIComponent(searchQuery.trim())}`;
        }
    };

    return (
        <>
            <header
                className={`sticky top-0 z-40 w-full transition-all duration-300 ${
                    scrolled
                        ? 'bg-[#F8F5EF]/95 backdrop-blur-md shadow-sm border-b border-[#EFE7D8]'
                        : 'bg-[#F8F5EF] border-b border-[#EFE7D8]/80'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Brand Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-full border-2 border-[#C99632] flex items-center justify-center bg-[#EFE7D8]/60 group-hover:scale-105 transition-transform duration-300 shadow-xs">
                                <svg
                                    className="w-5 h-5 text-[#A87520]"
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
                                <span className="font-serif text-xl font-bold tracking-tight text-[#24221E] leading-tight group-hover:text-[#A87520] transition-colors">
                                    Event & Wedding
                                </span>
                                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#A87520]">
                                    SUPPLIER MANAGEMENT
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden md:flex items-center gap-8">
                            {navLinks.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`relative py-1 text-sm font-semibold tracking-wider transition-all duration-200 ${
                                        item.active
                                            ? 'text-[#A87520] font-bold'
                                            : 'text-[#24221E] hover:text-[#C99632]'
                                    }`}
                                >
                                    {item.name}
                                    {item.active && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C99632] rounded-full animate-fade-in" />
                                    )}
                                </Link>
                            ))}
                        </nav>

                        {/* Right Action Icons & Login */}
                        <div className="hidden sm:flex items-center gap-4">
                            {/* Quick Search Button */}
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="p-2 text-[#77736C] hover:text-[#24221E] hover:bg-[#EFE7D8]/60 rounded-full transition-colors"
                                title="Search Suppliers & Packages"
                                aria-label="Search"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>

                            {/* Auth Action */}
                            {auth?.user ? (
                                <div className="flex items-center gap-3">
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C99632] hover:bg-[#A87520] text-white text-xs font-bold tracking-wider uppercase shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                        <span>Dashboard</span>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2.5">
                                    <Link
                                        href={route('login')}
                                        className="px-4 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase text-[#24221E] hover:text-[#A87520] hover:bg-[#EFE7D8]/70 border border-[#DCC9A8]/70 transition-all duration-200"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-5 py-2.5 rounded-full bg-[#C99632] hover:bg-[#A87520] text-white text-xs font-bold tracking-wider uppercase shadow-xs hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex sm:hidden items-center gap-2">
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="p-2 text-[#77736C] hover:text-[#24221E]"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 text-[#24221E] hover:text-[#C99632]"
                                aria-label="Toggle Menu"
                            >
                                {mobileMenuOpen ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="sm:hidden border-t border-[#EFE7D8] bg-[#F8F5EF] px-4 pt-3 pb-6 space-y-2 shadow-lg">
                        {navLinks.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wider ${
                                    item.active
                                        ? 'bg-[#EFE7D8] text-[#A87520] font-bold'
                                        : 'text-[#24221E] hover:bg-[#EFE7D8]/60 hover:text-[#C99632]'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <div className="pt-3 border-t border-[#EFE7D8]">
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="block w-full text-center px-4 py-3 rounded-full bg-[#C99632] text-white font-bold text-xs uppercase tracking-wider shadow-xs"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <div className="grid grid-cols-2 gap-2.5">
                                    <Link
                                        href={route('login')}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block w-full text-center px-4 py-2.5 rounded-full border border-[#DCC9A8] text-[#24221E] font-bold text-xs uppercase tracking-wider hover:bg-[#EFE7D8]/60 transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block w-full text-center px-4 py-2.5 rounded-full bg-[#C99632] text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:bg-[#A87520] transition-colors"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Quick Search Modal Overlay */}
            {searchOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-xs">
                    <div className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl border border-[#EFE7D8] animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-4 border-b border-[#EFE7D8]">
                            <h3 className="font-serif font-bold text-lg text-[#24221E]">
                                Search Suppliers & Packages
                            </h3>
                            <button
                                onClick={() => setSearchOpen(false)}
                                className="text-[#77736C] hover:text-[#24221E] p-1 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSearchSubmit} className="mt-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search photographers, caterers, wedding packages..."
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#F8F5EF] border border-[#EFE7D8] text-[#24221E] placeholder-[#77736C] focus:ring-2 focus:ring-[#C99632] focus:border-transparent outline-none text-sm"
                                    autoFocus
                                />
                                <svg
                                    className="w-5 h-5 text-[#A87520] absolute left-4 top-1/2 -translate-y-1/2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <div className="flex items-center justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setSearchOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-[#77736C] hover:text-[#24221E]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-full bg-[#C99632] hover:bg-[#A87520] text-white text-xs font-bold tracking-wider uppercase shadow-sm"
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
