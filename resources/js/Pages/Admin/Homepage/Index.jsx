import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function HomepageIndex({ banners = [], sections = [], settings = {} }) {
    const [activeTab, setActiveTab] = useState('banners');
    const [bannerModalOpen, setBannerModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);

    // Form for Add/Edit Banner
    const bannerForm = useForm({
        title: '',
        subtitle: '',
        badge: 'Your Perfect Event Starts Here',
        image_url: '',
        button_text: 'Explore Suppliers',
        button_url: '/suppliers',
        secondary_button_text: 'View Packages',
        secondary_button_url: '/packages',
        sort_order: banners.length + 1,
        is_active: true,
    });

    // Form for Content & Settings
    const settingsForm = useForm({
        site_title: settings.site_title || 'Event & Wedding Supplier Management',
        site_tagline: settings.site_tagline || 'Your Special Moments, Our Priority',
        promo_heading: settings.promo_heading || 'Make Your Event More Special',
        promo_description: settings.promo_description || 'From weddings to birthdays, debuts, corporate events, and intimate milestones, our verified partners bring the expertise and passion to make every detail unforgettable.',
        promo_background_image: settings.promo_background_image || 'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=2000&q=80',
        promo_button_text: settings.promo_button_text || 'Browse Packages',
        promo_button_url: settings.promo_button_url || '/packages',
        hero_button_text: settings.hero_button_text || 'Explore Suppliers',
        hero_button_url: settings.hero_button_url || '/suppliers',
        hero_secondary_button_text: settings.hero_secondary_button_text || 'View Packages',
        hero_secondary_button_url: settings.hero_secondary_button_url || '/packages',
    });

    const openAddBannerModal = () => {
        setEditingBanner(null);
        bannerForm.setData({
            title: '',
            subtitle: '',
            badge: 'Your Perfect Event Starts Here',
            image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80',
            button_text: 'Explore Suppliers',
            button_url: '/suppliers',
            secondary_button_text: 'View Packages',
            secondary_button_url: '/packages',
            sort_order: banners.length + 1,
            is_active: true,
        });
        setBannerModalOpen(true);
    };

    const openEditBannerModal = (banner) => {
        setEditingBanner(banner);
        bannerForm.setData({
            title: banner.title || '',
            subtitle: banner.subtitle || '',
            badge: banner.badge || '',
            image_url: banner.image_url || '',
            button_text: banner.button_text || '',
            button_url: banner.button_url || '',
            secondary_button_text: banner.secondary_button_text || '',
            secondary_button_url: banner.secondary_button_url || '',
            sort_order: banner.sort_order || 1,
            is_active: Boolean(banner.is_active),
        });
        setBannerModalOpen(true);
    };

    const handleSaveBanner = (e) => {
        e.preventDefault();
        if (editingBanner) {
            bannerForm.put(route('admin.homepage.banners.update', editingBanner.id), {
                onSuccess: () => setBannerModalOpen(false),
            });
        } else {
            bannerForm.post(route('admin.homepage.banners.store'), {
                onSuccess: () => setBannerModalOpen(false),
            });
        }
    };

    const handleDeleteBanner = (banner) => {
        if (confirm(`Are you sure you want to delete banner "${banner.title}"?`)) {
            router.delete(route('admin.homepage.banners.destroy', banner.id));
        }
    };

    const handleToggleBanner = (banner) => {
        router.post(route('admin.homepage.banners.toggle', banner.id));
    };

    const handleSaveSettings = (e) => {
        e.preventDefault();
        settingsForm.post(route('admin.homepage.settings.update'));
    };

    const handleToggleSection = (section) => {
        router.post(route('admin.homepage.sections.toggle', section.id));
    };

    return (
        <DashboardLayout>
            <Head title="Homepage Management - Admin" />

            <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#24221E] font-serif">
                            Homepage Management
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Customize and manage banners, copy, sections, and call-to-action buttons displayed on the public home page.
                        </p>
                    </div>

                    {/* Preview Live Site Link */}
                    <a
                        href="/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white hover:bg-[#C99632] text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                    >
                        <span>Open Live Site</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>

                {/* Subnav Tabs (Matches Design Mockup 6: Banners | Sections | Content | Buttons/Links | Preview) */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
                    {[
                        { key: 'banners', label: `Banners (${banners.length})` },
                        { key: 'sections', label: 'Sections' },
                        { key: 'content', label: 'Content' },
                        { key: 'buttons', label: 'Buttons / Links' },
                        { key: 'preview', label: 'Preview' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                activeTab === tab.key
                                    ? 'bg-[#C99632] text-white shadow-xs'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ========================================================================= */}
                {/* TAB 1: BANNERS                                                            */}
                {/* ========================================================================= */}
                {activeTab === 'banners' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-serif text-lg font-bold text-[#24221E]">Banner Management</h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Manage the 6-photo banner slider images, titles, descriptions, and automatic rotation order.
                                </p>
                            </div>
                            <button
                                onClick={openAddBannerModal}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C99632] hover:bg-[#A87520] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors"
                            >
                                <span>+ Add Banner</span>
                            </button>
                        </div>

                        {/* Banners Table */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-[#F8F5EF] text-[#24221E] uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
                                        <tr>
                                            <th className="py-4 px-4 w-12 text-center">#</th>
                                            <th className="py-4 px-4 w-28">Image</th>
                                            <th className="py-4 px-4">Title & Details</th>
                                            <th className="py-4 px-4 w-28">Status</th>
                                            <th className="py-4 px-4 w-28 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {banners.map((banner, index) => (
                                            <tr key={banner.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-4 px-4 text-center font-bold text-slate-500">
                                                    {index + 1}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="w-24 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                                                        <img
                                                            src={banner.image_url}
                                                            alt={banner.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <p className="font-bold text-sm text-[#24221E] line-clamp-1">{banner.title}</p>
                                                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{banner.subtitle}</p>
                                                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                                                        <span>Badge: <strong className="text-slate-600">{banner.badge || 'Default'}</strong></span>
                                                        <span>•</span>
                                                        <span>CTA: <strong className="text-slate-600">{banner.button_text}</strong> ({banner.button_url})</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <button
                                                        onClick={() => handleToggleBanner(banner)}
                                                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                                                            banner.is_active
                                                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        {banner.is_active ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditBannerModal(banner)}
                                                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#C99632] hover:bg-slate-100 transition-colors"
                                                            title="Edit banner"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteBanner(banner)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                            title="Delete banner"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 2: SECTIONS                                                           */}
                {/* ========================================================================= */}
                {activeTab === 'sections' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="font-serif text-lg font-bold text-[#24221E]">Section Management</h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Enable or disable main sections displayed on the public home page.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sections.map((sec) => (
                                <div key={sec.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-sm text-[#24221E]">{sec.title}</h3>
                                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                                                {sec.section_key}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">{sec.subtitle}</p>
                                    </div>
                                    <button
                                        onClick={() => handleToggleSection(sec)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                                            sec.is_active
                                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                    >
                                        {sec.is_active ? 'Active' : 'Disabled'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 3: CONTENT                                                            */}
                {/* ========================================================================= */}
                {activeTab === 'content' && (
                    <form onSubmit={handleSaveSettings} className="space-y-8">
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                            <h3 className="font-serif text-base font-bold text-[#24221E] border-b border-slate-100 pb-3">
                                Promotional Section ("Make Your Event More Special")
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Heading</label>
                                        <input
                                            type="text"
                                            value={settingsForm.data.promo_heading}
                                            onChange={(e) => settingsForm.setData('promo_heading', e.target.value)}
                                            className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#C99632] outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                                        <textarea
                                            rows={4}
                                            value={settingsForm.data.promo_description}
                                            onChange={(e) => settingsForm.setData('promo_description', e.target.value)}
                                            className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#C99632] outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Background Image URL</label>
                                        <input
                                            type="text"
                                            value={settingsForm.data.promo_background_image}
                                            onChange={(e) => settingsForm.setData('promo_background_image', e.target.value)}
                                            className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#C99632] outline-none"
                                        />
                                    </div>
                                    <div className="rounded-xl overflow-hidden h-36 border border-slate-200 bg-slate-100">
                                        <img src={settingsForm.data.promo_background_image} alt="" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={settingsForm.processing}
                                    className="px-6 py-2.5 rounded-full bg-[#C99632] hover:bg-[#A87520] text-white font-bold text-xs uppercase tracking-wider shadow-xs"
                                >
                                    Save Content Settings
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* ========================================================================= */}
                {/* TAB 4: BUTTONS / LINKS                                                    */}
                {/* ========================================================================= */}
                {activeTab === 'buttons' && (
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                            <h3 className="font-serif text-base font-bold text-[#24221E] border-b border-slate-100 pb-3">
                                Button & Action Link Settings
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">Hero Banner Action 1</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Button Label</label>
                                            <input
                                                type="text"
                                                value={settingsForm.data.hero_button_text}
                                                onChange={(e) => settingsForm.setData('hero_button_text', e.target.value)}
                                                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#C99632] outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Target URL</label>
                                            <input
                                                type="text"
                                                value={settingsForm.data.hero_button_url}
                                                onChange={(e) => settingsForm.setData('hero_button_url', e.target.value)}
                                                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#C99632] outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">Hero Banner Action 2 (Outline)</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Button Label</label>
                                            <input
                                                type="text"
                                                value={settingsForm.data.hero_secondary_button_text}
                                                onChange={(e) => settingsForm.setData('hero_secondary_button_text', e.target.value)}
                                                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#C99632] outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Target URL</label>
                                            <input
                                                type="text"
                                                value={settingsForm.data.hero_secondary_button_url}
                                                onChange={(e) => settingsForm.setData('hero_secondary_button_url', e.target.value)}
                                                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#C99632] outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">Promo Section Button</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Button Label</label>
                                            <input
                                                type="text"
                                                value={settingsForm.data.promo_button_text}
                                                onChange={(e) => settingsForm.setData('promo_button_text', e.target.value)}
                                                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#C99632] outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Target URL</label>
                                            <input
                                                type="text"
                                                value={settingsForm.data.promo_button_url}
                                                onChange={(e) => settingsForm.setData('promo_button_url', e.target.value)}
                                                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#C99632] outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={settingsForm.processing}
                                    className="px-6 py-2.5 rounded-full bg-[#C99632] hover:bg-[#A87520] text-white font-bold text-xs uppercase tracking-wider shadow-xs"
                                >
                                    Save Buttons & Links
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* ========================================================================= */}
                {/* TAB 5: PREVIEW                                                            */}
                {/* ========================================================================= */}
                {activeTab === 'preview' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-serif text-base font-bold text-[#24221E]">Public Home Page Live Preview</h2>
                            <a
                                href="/"
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-[#C99632] hover:underline font-bold"
                            >
                                Open in new window ↗
                            </a>
                        </div>
                        <div className="rounded-3xl border-4 border-slate-800 overflow-hidden shadow-2xl bg-[#F8F5EF] h-[700px]">
                            <iframe
                                src="/"
                                title="Public Homepage Preview"
                                className="w-full h-full border-none"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* ADD / EDIT BANNER MODAL                                                   */}
            {/* ========================================================================= */}
            {bannerModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h3 className="font-serif font-bold text-lg text-[#24221E]">
                                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                            </h3>
                            <button
                                onClick={() => setBannerModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveBanner} className="mt-5 space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1 uppercase">Banner Title</label>
                                <input
                                    type="text"
                                    required
                                    value={bannerForm.data.title}
                                    onChange={(e) => bannerForm.setData('title', e.target.value)}
                                    placeholder="e.g. Find the Best Suppliers for Your Special Moments"
                                    className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#C99632] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1 uppercase">Badge / Eyebrow Text</label>
                                <input
                                    type="text"
                                    value={bannerForm.data.badge}
                                    onChange={(e) => bannerForm.setData('badge', e.target.value)}
                                    placeholder="e.g. Your Perfect Event Starts Here"
                                    className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#C99632] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1 uppercase">Subtitle / Description</label>
                                <textarea
                                    rows={3}
                                    value={bannerForm.data.subtitle}
                                    onChange={(e) => bannerForm.setData('subtitle', e.target.value)}
                                    placeholder="Brief description for the banner..."
                                    className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#C99632] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1 uppercase">Image URL</label>
                                <input
                                    type="url"
                                    required
                                    value={bannerForm.data.image_url}
                                    onChange={(e) => bannerForm.setData('image_url', e.target.value)}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#C99632] outline-none"
                                />
                                {bannerForm.data.image_url && (
                                    <div className="mt-2 h-28 rounded-xl overflow-hidden border border-slate-200">
                                        <img src={bannerForm.data.image_url} alt="" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 uppercase">Primary Button</label>
                                    <input
                                        type="text"
                                        value={bannerForm.data.button_text}
                                        onChange={(e) => bannerForm.setData('button_text', e.target.value)}
                                        className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#C99632] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 uppercase">Primary URL</label>
                                    <input
                                        type="text"
                                        value={bannerForm.data.button_url}
                                        onChange={(e) => bannerForm.setData('button_url', e.target.value)}
                                        className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#C99632] outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 uppercase">Secondary Button</label>
                                    <input
                                        type="text"
                                        value={bannerForm.data.secondary_button_text}
                                        onChange={(e) => bannerForm.setData('secondary_button_text', e.target.value)}
                                        className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#C99632] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1 uppercase">Secondary URL</label>
                                    <input
                                        type="text"
                                        value={bannerForm.data.secondary_button_url}
                                        onChange={(e) => bannerForm.setData('secondary_button_url', e.target.value)}
                                        className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#C99632] outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="banner_is_active"
                                    checked={bannerForm.data.is_active}
                                    onChange={(e) => bannerForm.setData('is_active', e.target.checked)}
                                    className="w-4 h-4 rounded text-[#C99632] focus:ring-[#C99632] border-slate-300"
                                />
                                <label htmlFor="banner_is_active" className="font-bold text-slate-700 cursor-pointer">
                                    Active (Visible in slider)
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setBannerModalOpen(false)}
                                    className="px-4 py-2 text-slate-500 hover:text-slate-800 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={bannerForm.processing}
                                    className="px-6 py-2.5 rounded-full bg-[#C99632] hover:bg-[#A87520] text-white font-bold uppercase tracking-wider shadow-xs"
                                >
                                    {editingBanner ? 'Save Changes' : 'Create Banner'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
