import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';

export default function Index({
    suppliers = {},
    categories = [],
    filters = {},
}) {
    const [search, setSearch] = useState(
        filters.search || ''
    );

    const [selectedCategory, setSelectedCategory] =
        useState(filters.category || 'all');

    /*
    |--------------------------------------------------------------------------
    | Debounced Search
    |--------------------------------------------------------------------------
    */

    const [searchTimeout, setSearchTimeout] =
        useState(null);

    const handleSearch = useCallback(
        (value) => {
            setSearch(value);

            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }

            const timeout = setTimeout(() => {
                router.get(
                    route('customer.suppliers.index'),
                    {
                        search: value,
                        category: selectedCategory,
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    }
                );
            }, 400);

            setSearchTimeout(timeout);
        },
        [selectedCategory, searchTimeout]
    );

    /*
    |--------------------------------------------------------------------------
    | Category Filter
    |--------------------------------------------------------------------------
    */

    const handleCategory = (value) => {
        setSelectedCategory(value);

        router.get(
            route('customer.suppliers.index'),
            {
                search,
                category: value,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Profile Picture Helper
    |--------------------------------------------------------------------------
    */

    const getProfilePicture = (profile) => {
        const picture = profile?.profile_picture;

        if (!picture) {
            return null;
        }

        if (
            picture.startsWith('http://') ||
            picture.startsWith('https://') ||
            picture.startsWith('/')
        ) {
            return picture;
        }

        return `/storage/${picture}`;
    };

    /*
    |--------------------------------------------------------------------------
    | Portfolio Preview Images
    |--------------------------------------------------------------------------
    */

    const getPortfolioPreviewImages = (profile) => {
        const portfolios =
            profile?.user?.portfolios || [];

        const images = [];

        for (const portfolio of portfolios) {
            if (images.length >= 3) {
                break;
            }

            const coverUrl =
                portfolio.cover_image_url;

            if (coverUrl) {
                images.push(coverUrl);
            }
        }

        return images;
    };

    /*
    |--------------------------------------------------------------------------
    | Business Name Initial
    |--------------------------------------------------------------------------
    */

    const getInitial = (name) => {
        if (!name) {
            return '?';
        }

        return name.charAt(0).toUpperCase();
    };

    /*
    |--------------------------------------------------------------------------
    | Clear Filters
    |--------------------------------------------------------------------------
    */

    const clearFilters = () => {
        setSearch('');
        setSelectedCategory('all');

        router.get(
            route('customer.suppliers.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Pagination Data
    |--------------------------------------------------------------------------
    */

    const supplierList = suppliers?.data || [];
    const paginationLinks = suppliers?.links || [];

    return (
        <DashboardLayout>
            <Head title="Find Suppliers" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

                {/* =========================================================
                    HERO
                ========================================================== */}

                <section className="relative overflow-hidden border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">

                    {/* Background Gradient */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-100 via-purple-50 to-transparent opacity-60 blur-3xl dark:from-indigo-950/40 dark:via-purple-950/20" />
                        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-gradient-to-tr from-violet-100 via-pink-50 to-transparent opacity-40 blur-3xl dark:from-violet-950/30 dark:via-pink-950/10" />
                    </div>

                    <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8">

                        <div className="max-w-3xl">

                            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                                </span>
                                Verified Suppliers
                            </span>

                            <h1 className="mt-5 text-4xl font-black tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                                Find your perfect
                                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                                    {' '}event supplier
                                </span>
                            </h1>

                            <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base">
                                Browse our curated directory of verified event and wedding suppliers. 
                                Each supplier has been reviewed and approved to ensure quality service.
                            </p>

                        </div>

                    </div>

                </section>


                {/* =========================================================
                    CONTENT
                ========================================================== */}

                <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

                    {/* =====================================================
                        SEARCH & FILTER BAR
                    ====================================================== */}

                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">

                        <div className="flex flex-col gap-4 lg:flex-row">

                            {/* Search */}
                            <div className="relative flex-1">

                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                    </svg>
                                </span>

                                <input
                                    id="supplier-search"
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        handleSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search suppliers by name, service, or location..."
                                    className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />

                            </div>


                            {/* Category Select */}
                            <select
                                id="supplier-category-filter"
                                value={selectedCategory}
                                onChange={(e) =>
                                    handleCategory(
                                        e.target.value
                                    )
                                }
                                className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white lg:w-64"
                            >

                                <option value="all">
                                    All Categories
                                </option>

                                {categories.map(
                                    (category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>

                    </div>


                    {/* =====================================================
                        CATEGORY PILLS
                    ====================================================== */}

                    {categories.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-2">

                            <button
                                onClick={() =>
                                    handleCategory('all')
                                }
                                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                                    selectedCategory === 'all'
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                            >
                                All Suppliers
                            </button>

                            {categories.map(
                                (category) => (
                                    <button
                                        key={category.id}
                                        onClick={() =>
                                            handleCategory(
                                                String(
                                                    category.id
                                                )
                                            )
                                        }
                                        className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                                            selectedCategory ===
                                            String(
                                                category.id
                                            )
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                                : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                )
                            )}

                        </div>
                    )}


                    {/* =====================================================
                        RESULTS HEADER
                    ====================================================== */}

                    <div className="mb-6 mt-8 flex items-end justify-between">

                        <div>

                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {selectedCategory === 'all'
                                    ? 'All Suppliers'
                                    : categories.find(
                                          (c) =>
                                              String(
                                                  c.id
                                              ) ===
                                              selectedCategory
                                      )?.name ||
                                      'Suppliers'}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {suppliers?.total || 0}{' '}
                                {(suppliers?.total || 0) === 1
                                    ? 'supplier'
                                    : 'suppliers'}{' '}
                                found
                            </p>

                        </div>

                    </div>


                    {/* =====================================================
                        SUPPLIER GRID
                    ====================================================== */}

                    {supplierList.length > 0 ? (

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                            {supplierList.map(
                                (profile) => {

                                    const picture =
                                        getProfilePicture(
                                            profile
                                        );

                                    const previewImages =
                                        getPortfolioPreviewImages(
                                            profile
                                        );

                                    const businessName =
                                        profile.business_name ||
                                        profile.user
                                            ?.name ||
                                        'Event Supplier';

                                    const supplierCategories =
                                        profile.categories ||
                                        [];

                                    return (
                                        <Link
                                            key={
                                                profile.id
                                            }
                                            href={route(
                                                'customer.suppliers.show',
                                                profile.user_id
                                            )}
                                            className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
                                        >

                                            {/* ===============================================
                                                PORTFOLIO PREVIEW
                                            ================================================ */}

                                            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-indigo-100 via-violet-50 to-purple-100 dark:from-indigo-950/50 dark:via-violet-950/30 dark:to-purple-950/50">

                                                {previewImages.length > 0 ? (

                                                    <div className="flex h-full">
                                                        {previewImages.slice(0, 3).map(
                                                            (
                                                                imgUrl,
                                                                idx
                                                            ) => (
                                                                <div
                                                                    key={idx}
                                                                    className="relative h-full flex-1 overflow-hidden"
                                                                    style={{
                                                                        marginLeft:
                                                                            idx >
                                                                            0
                                                                                ? '2px'
                                                                                : '0',
                                                                    }}
                                                                >
                                                                    <img
                                                                        src={imgUrl}
                                                                        alt={`Portfolio ${idx + 1}`}
                                                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                                    />
                                                                </div>
                                                            )
                                                        )}
                                                    </div>

                                                ) : (

                                                    <div className="flex h-full items-center justify-center">
                                                        <div className="text-center">
                                                            <div className="text-4xl opacity-50">
                                                                🏢
                                                            </div>
                                                            <p className="mt-1 text-xs font-medium text-gray-400 dark:text-gray-500">
                                                                No portfolio yet
                                                            </p>
                                                        </div>
                                                    </div>

                                                )}

                                                {/* Overlay gradient */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                            </div>


                                            {/* ===============================================
                                                SUPPLIER INFO
                                            ================================================ */}

                                            <div className="relative p-5">

                                                {/* Avatar */}
                                                <div className="absolute -top-7 left-5">
                                                    <div className="h-14 w-14 overflow-hidden rounded-xl border-4 border-white bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 shadow-lg dark:border-gray-900">
                                                        {picture ? (
                                                            <img
                                                                src={picture}
                                                                alt={businessName}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
                                                                {getInitial(
                                                                    businessName
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="pt-8">

                                                    {/* Business Name */}
                                                    <h3 className="line-clamp-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                                                        {businessName}
                                                    </h3>

                                                    {/* Categories */}
                                                    {supplierCategories.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                                            {supplierCategories
                                                                .slice(
                                                                    0,
                                                                    3
                                                                )
                                                                .map(
                                                                    (
                                                                        cat
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                cat.id
                                                                            }
                                                                            className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                                                                        >
                                                                            {
                                                                                cat.name
                                                                            }
                                                                        </span>
                                                                    )
                                                                )}

                                                            {supplierCategories.length >
                                                                3 && (
                                                                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                                                    +{supplierCategories.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Description */}
                                                    {profile.description && (
                                                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                                                            {
                                                                profile.description
                                                            }
                                                        </p>
                                                    )}

                                                    {/* Footer */}
                                                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">

                                                        {/* Location */}
                                                        {profile.address ? (
                                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z" />
                                                                </svg>
                                                                <span className="line-clamp-1 max-w-[140px]">
                                                                    {
                                                                        profile.address
                                                                    }
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div />
                                                        )}

                                                        {/* CTA */}
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition-colors group-hover:text-indigo-700 dark:text-indigo-400 dark:group-hover:text-indigo-300">
                                                            View Profile
                                                            <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                                            </svg>
                                                        </span>

                                                    </div>

                                                </div>

                                            </div>

                                        </Link>
                                    );
                                }
                            )}

                        </div>

                    ) : (

                        /* =====================================================
                            EMPTY STATE
                        ====================================================== */

                        <div className="rounded-3xl border-2 border-dashed border-gray-300 bg-white px-6 py-20 text-center dark:border-gray-800 dark:bg-gray-900">

                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-4xl dark:bg-indigo-950">
                                🔍
                            </div>

                            <h3 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">
                                No suppliers found
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
                                There are no approved suppliers
                                matching your search criteria.
                                Try adjusting your filters.
                            </p>

                            {(search ||
                                selectedCategory !==
                                    'all') && (

                                <button
                                    onClick={
                                        clearFilters
                                    }
                                    className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700"
                                >
                                    Clear Filters
                                </button>

                            )}

                        </div>

                    )}


                    {/* =====================================================
                        PAGINATION
                    ====================================================== */}

                    {paginationLinks.length > 3 && (
                        <div className="mt-8 flex items-center justify-center gap-1">
                            {paginationLinks.map(
                                (link, index) => {
                                    if (
                                        link.url === null
                                    ) {
                                        return (
                                            <span
                                                key={index}
                                                className="rounded-lg px-3.5 py-2 text-sm text-gray-400 dark:text-gray-600"
                                                dangerouslySetInnerHTML={{
                                                    __html:
                                                        link.label,
                                                }}
                                            />
                                        );
                                    }

                                    return (
                                        <Link
                                            key={index}
                                            href={
                                                link.url
                                            }
                                            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                                            }`}
                                            preserveState
                                            preserveScroll
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    link.label,
                                            }}
                                        />
                                    );
                                }
                            )}
                        </div>
                    )}

                </main>

            </div>
        </DashboardLayout>
    );
}