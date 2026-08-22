import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useMemo, useRef } from 'react';

export default function Edit({
    package: pkg,
    services = [],
    teams = [],
    categories = [],
}) {
    const [imagePreview, setImagePreview] = useState(pkg.image_path || null);
    const [serviceTab, setServiceTab] = useState(pkg.team_id ? 'team_services' : 'my_services');
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        name: pkg.name || '',
        team_id: pkg.team_id ? String(pkg.team_id) : '',
        event_category_id: pkg.event_category_id ? String(pkg.event_category_id) : '',
        price: pkg.price ? String(pkg.price) : '',
        description: pkg.description || '',
        inclusions: pkg.inclusions || '',
        image: null,
        service_ids: pkg.services ? pkg.services.map((s) => s.id) : [],
        is_active: Boolean(pkg.is_active),
        _method: 'PUT',
    });

    // Currently selected team object
    const selectedTeam = useMemo(() => {
        if (!data.team_id) return null;
        return teams.find((t) => String(t.id) === String(data.team_id)) || null;
    }, [teams, data.team_id]);

    // Gather all team services from accepted members
    const teamServicesList = useMemo(() => {
        if (!selectedTeam || !selectedTeam.accepted_members) return [];
        const result = [];
        selectedTeam.accepted_members.forEach((member) => {
            const supplier = member.supplier;
            if (supplier && supplier.services) {
                supplier.services.forEach((s) => {
                    result.push({
                        ...s,
                        supplierName:
                            supplier.supplier_profile?.business_name || supplier.name,
                        supplierRole: member.role_title,
                        isTeamMemberService: true,
                    });
                });
            }
        });
        return result;
    }, [selectedTeam]);

    // All available selectable services combined
    const allAvailableServices = useMemo(() => {
        const myMapped = services.map((s) => ({
            ...s,
            supplierName: 'Me',
            supplierRole: 'Coordinator',
            isTeamMemberService: false,
        }));
        return [...myMapped, ...teamServicesList];
    }, [services, teamServicesList]);

    const toggleService = (serviceId) => {
        const current = [...data.service_ids];
        const index = current.indexOf(serviceId);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(serviceId);
        }
        setData('service_ids', current);
    };

    const selectedServicesList = useMemo(() => {
        return allAvailableServices.filter((s) => data.service_ids.includes(s.id));
    }, [allAvailableServices, data.service_ids]);

    const totalIndividualServicesValue = useMemo(() => {
        return selectedServicesList.reduce((acc, s) => acc + Number(s.price || 0), 0);
    }, [selectedServicesList]);

    const packagePriceNum = Number(data.price || 0);

    const customerSavings = useMemo(() => {
        if (totalIndividualServicesValue <= 0 || packagePriceNum <= 0) return 0;
        const diff = totalIndividualServicesValue - packagePriceNum;
        return diff > 0 ? diff : 0;
    }, [totalIndividualServicesValue, packagePriceNum]);

    const selectedCategoryName = useMemo(() => {
        const cat = categories.find((c) => String(c.id) === String(data.event_category_id));
        return cat ? cat.name : 'Event';
    }, [categories, data.event_category_id]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/supplier/packages/${pkg.id}`);
    };

    const getCategoryIcon = (categoryName) => {
        const cat = (categoryName || '').toLowerCase();
        if (cat.includes('photo')) return '📷';
        if (cat.includes('video')) return '🎥';
        if (cat.includes('makeup') || cat.includes('hair')) return '💄';
        if (cat.includes('cater') || cat.includes('food')) return '🍽️';
        if (cat.includes('decor') || cat.includes('flor')) return '💐';
        if (cat.includes('music') || cat.includes('dj')) return '🎵';
        if (cat.includes('drone')) return '🚁';
        return '💜';
    };

    return (
        <DashboardLayout>
            <Head title={`Edit ${pkg.name} - Supplier Portal`} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header & Breadcrumbs */}
                <div>
                    <nav className="flex items-center gap-2 text-xs text-gray-500">
                        <Link href={route('supplier.packages.index')} className="hover:text-indigo-600">
                            Packages
                        </Link>
                        <span>›</span>
                        <span className="font-semibold text-gray-800">Edit Package</span>
                    </nav>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                        Edit Package
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="mt-8">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                        {/* Left Column: Form Controls (7 Cols) */}
                        <div className="space-y-6 lg:col-span-7">
                            {/* Card 1: Package Information & Team */}
                            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
                                <div className="flex items-center gap-2.5 border-b border-gray-100 pb-4">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        ✏️
                                    </div>
                                    <h2 className="text-base font-bold text-gray-900">
                                        Package Information
                                    </h2>
                                </div>

                                <div className="mt-5 space-y-4">
                                    {/* Team Selection Dropdown */}
                                    {teams.length > 0 && (
                                        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                                            <label className="block text-xs font-bold text-indigo-950">
                                                👥 Team Association (Optional)
                                            </label>
                                            <p className="mt-0.5 text-[11px] text-indigo-700">
                                                Assign this package to one of your teams to bundle services from accepted team members.
                                            </p>
                                            <select
                                                value={data.team_id}
                                                onChange={(e) => {
                                                    setData('team_id', e.target.value);
                                                    if (e.target.value) setServiceTab('team_services');
                                                }}
                                                className="mt-2 w-full rounded-xl border border-indigo-200 bg-white px-3.5 py-2.5 text-sm shadow-xs outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                            >
                                                <option value="">No Team (Individual Package)</option>
                                                {teams.map((t) => (
                                                    <option key={t.id} value={t.id}>
                                                        Team: {t.name} ({t.accepted_members?.length || 0} members)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {/* Package Name */}
                                        <div className="sm:col-span-1">
                                            <label className="block text-xs font-semibold text-gray-700">
                                                Package Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="e.g. Premium Wedding Package"
                                                className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-xs outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                                            )}
                                        </div>

                                        {/* Event Category */}
                                        <div className="sm:col-span-1">
                                            <label className="block text-xs font-semibold text-gray-700">
                                                Event Category <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={data.event_category_id}
                                                onChange={(e) => setData('event_category_id', e.target.value)}
                                                className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-xs outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                            >
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.event_category_id && (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {errors.event_category_id}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700">
                                            Description
                                        </label>
                                        <textarea
                                            rows="3"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Complete photography and videography coverage for your special day. Capture every moment beautifully."
                                            className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-xs outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-xs text-red-500">{errors.description}</p>
                                        )}
                                    </div>

                                    {/* Inclusions */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700">
                                            Special Inclusions / Deliverables
                                        </label>
                                        <textarea
                                            rows="2"
                                            value={data.inclusions}
                                            onChange={(e) => setData('inclusions', e.target.value)}
                                            placeholder="e.g. 2 Photographers, 1 Videographer, 1 Drone Pilot, 4K Raw files, USB Flash Drive included"
                                            className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-xs outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                        />
                                        {errors.inclusions && (
                                            <p className="mt-1 text-xs text-red-500">{errors.inclusions}</p>
                                        )}
                                    </div>

                                    {/* Package Cover Image */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700">
                                            Package Showcase Image
                                        </label>
                                        <div
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className="mt-1.5 flex cursor-pointer items-center justify-between rounded-xl border-2 border-dashed border-gray-300 p-3.5 transition hover:border-indigo-400 hover:bg-indigo-50/30"
                                        >
                                            <div className="flex items-center gap-3">
                                                {imagePreview ? (
                                                    <img
                                                        src={imagePreview}
                                                        alt="Package preview"
                                                        className="h-12 w-16 rounded-lg object-cover ring-1 ring-gray-200"
                                                    />
                                                ) : (
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-xl text-indigo-600">
                                                        🖼️
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-xs font-medium text-gray-800">
                                                        {imagePreview ? 'Change showcase photo' : 'Upload package photo'}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400">PNG, JPG up to 5MB</p>
                                                </div>
                                            </div>
                                            <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                                                Browse
                                            </span>
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </div>

                                    {/* Status Toggle */}
                                    <div className="flex items-center justify-between pt-2">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-700">Package Status</p>
                                            <p className="text-[11px] text-gray-400">
                                                Active packages are shown publicly on your profile.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={data.is_active}
                                            onClick={() => setData('is_active', !data.is_active)}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                data.is_active ? 'bg-indigo-600' : 'bg-gray-200'
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                                    data.is_active ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Select Services (My Services vs Team Services) */}
                            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                                            📋
                                        </div>
                                        <div>
                                            <h2 className="text-base font-bold text-gray-900">
                                                Add Services
                                            </h2>
                                            <p className="text-xs text-gray-500">
                                                Choose individual and team services to bundle into this package.
                                            </p>
                                        </div>
                                    </div>

                                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                                        {data.service_ids.length} selected
                                    </span>
                                </div>

                                {data.team_id && (
                                    <div className="mt-4 flex border-b border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => setServiceTab('my_services')}
                                            className={`border-b-2 px-4 py-2 text-xs font-semibold transition ${
                                                serviceTab === 'my_services'
                                                    ? 'border-indigo-600 text-indigo-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            My Services ({services.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setServiceTab('team_services')}
                                            className={`border-b-2 px-4 py-2 text-xs font-semibold transition ${
                                                serviceTab === 'team_services'
                                                    ? 'border-indigo-600 text-indigo-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            Team Services ({teamServicesList.length})
                                        </button>
                                    </div>
                                )}

                                <div className="mt-4 space-y-2.5">
                                    {serviceTab === 'my_services' ? (
                                        services.length === 0 ? (
                                            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                                                <p className="text-xs text-gray-500">
                                                    No active services found.
                                                </p>
                                            </div>
                                        ) : (
                                            services.map((service) => {
                                                const isSelected = data.service_ids.includes(service.id);
                                                return (
                                                    <div
                                                        key={service.id}
                                                        onClick={() => toggleService(service.id)}
                                                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all ${
                                                            isSelected
                                                                ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3.5">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => {}}
                                                                className="h-4 w-4 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg shadow-xs">
                                                                {service.image_path ? (
                                                                    <img
                                                                        src={service.image_path}
                                                                        alt=""
                                                                        className="h-full w-full rounded-xl object-cover"
                                                                    />
                                                                ) : (
                                                                    getCategoryIcon(service.category)
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">
                                                                    {service.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {service.category || 'My Service'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <span className="text-sm font-bold text-gray-900">
                                                            ₱{Number(service.price || 0).toLocaleString('en-PH', {
                                                                minimumFractionDigits: 2,
                                                            })}
                                                        </span>
                                                    </div>
                                                );
                                            })
                                        )
                                    ) : (
                                        teamServicesList.length === 0 ? (
                                            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                                                <p className="text-xs text-gray-500">
                                                    No services found from accepted team members.
                                                </p>
                                            </div>
                                        ) : (
                                            teamServicesList.map((service) => {
                                                const isSelected = data.service_ids.includes(service.id);
                                                return (
                                                    <div
                                                        key={`team-svc-${service.id}`}
                                                        onClick={() => toggleService(service.id)}
                                                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all ${
                                                            isSelected
                                                                ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3.5">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => {}}
                                                                className="h-4 w-4 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-lg shadow-xs">
                                                                {getCategoryIcon(service.category)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">
                                                                    {service.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    from <span className="font-semibold text-indigo-600">{service.supplierName}</span> ({service.supplierRole || 'Member'})
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <span className="text-sm font-bold text-gray-900">
                                                            ₱{Number(service.price || 0).toLocaleString('en-PH', {
                                                                minimumFractionDigits: 2,
                                                            })}
                                                        </span>
                                                    </div>
                                                );
                                            })
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Live Package Preview Card (5 Cols) */}
                        <div className="space-y-6 lg:col-span-5">
                            <div className="sticky top-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
                                <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-gray-50 to-indigo-50/30 px-5 py-3.5">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs text-white">
                                            👁️
                                        </span>
                                        <h3 className="text-sm font-bold text-gray-900">
                                            Live Package Preview
                                        </h3>
                                    </div>
                                    {data.team_id ? (
                                        <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
                                            👥 Team Package
                                        </span>
                                    ) : (
                                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                            Solo Package
                                        </span>
                                    )}
                                </div>

                                <div className="p-5">
                                    {/* Preview Banner */}
                                    <div className="relative h-44 overflow-hidden rounded-xl bg-gray-900">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Package preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : selectedServicesList.length > 0 && selectedServicesList[0].image_path ? (
                                            <img
                                                src={selectedServicesList[0].image_path}
                                                alt="Package preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white">
                                                <span className="text-3xl">✨ 📸 💍</span>
                                                <p className="mt-2 text-xs text-white/70">
                                                    Package Showcase
                                                </p>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                        <div className="absolute bottom-3 left-3 right-3">
                                            <span className="rounded-md bg-indigo-600/90 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-xs">
                                                {selectedCategoryName}
                                            </span>
                                            <h4 className="mt-1 truncate text-base font-bold text-white">
                                                {data.name || 'Your Package Title'}
                                            </h4>
                                        </div>
                                    </div>

                                    {/* Included Services List */}
                                    <div className="mt-5">
                                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                            <p className="text-xs font-bold text-gray-700">
                                                Included Services ({selectedServicesList.length})
                                            </p>
                                        </div>

                                        {selectedServicesList.length === 0 ? (
                                            <p className="py-4 text-center text-xs text-gray-400">
                                                No services selected yet. Check items on the left to include them.
                                            </p>
                                        ) : (
                                            <div className="mt-2 max-h-48 space-y-1.5 overflow-y-auto pr-1">
                                                {selectedServicesList.map((service) => (
                                                    <div
                                                        key={`selected-${service.id}`}
                                                        className="flex items-center justify-between rounded-lg bg-gray-50/80 px-2.5 py-1.5 text-xs"
                                                    >
                                                        <div className="flex items-center gap-2 truncate">
                                                            <span>{getCategoryIcon(service.category)}</span>
                                                            <span className="truncate font-medium text-gray-800">
                                                                {service.name}{' '}
                                                                <span className="text-[11px] text-gray-400">
                                                                    ({service.supplierName})
                                                                </span>
                                                            </span>
                                                        </div>
                                                        <span className="shrink-0 font-semibold text-gray-600">
                                                            ₱{Number(service.price || 0).toLocaleString('en-PH', {
                                                                minimumFractionDigits: 2,
                                                            })}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Pricing & Savings */}
                                    <div className="mt-5 space-y-2.5 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                                        <div className="flex items-center justify-between text-xs text-gray-600">
                                            <span>Total of Individual Services:</span>
                                            <span className="font-bold text-gray-800">
                                                ₱{totalIndividualServicesValue.toLocaleString('en-PH', {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-gray-200/80 pt-2.5 text-sm">
                                            <span className="font-bold text-indigo-900">
                                                Package Bundle Price: <span className="text-red-500">*</span>
                                            </span>
                                            <div className="relative w-36">
                                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs font-bold text-gray-500">
                                                    ₱
                                                </span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.price}
                                                    onChange={(e) => setData('price', e.target.value)}
                                                    placeholder="55,000.00"
                                                    className="w-full rounded-lg border border-indigo-300 bg-white py-1.5 pl-6 pr-2.5 text-right text-sm font-bold text-indigo-700 shadow-xs outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                                />
                                            </div>
                                        </div>
                                        {errors.price && (
                                            <p className="text-right text-xs text-red-500">{errors.price}</p>
                                        )}

                                        {customerSavings > 0 && (
                                            <div className="mt-2 rounded-lg bg-emerald-100/90 p-2.5 text-center text-xs font-bold text-emerald-800 ring-1 ring-emerald-300">
                                                🎉 You Save Customers: ₱
                                                {customerSavings.toLocaleString('en-PH', {
                                                    minimumFractionDigits: 2,
                                                })}{' '}
                                                ({Math.round((customerSavings / totalIndividualServicesValue) * 100)}% OFF)
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="mt-8 flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
                        <Link
                            href={route('supplier.packages.index')}
                            className="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-95"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                        >
                            {processing ? 'Saving Changes...' : 'Update Package'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
