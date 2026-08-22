import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function BusinessProfileForm({
    profile,
    categories = [],
}) {
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
                    ? profile.categories.map(
                          (category) => Number(category.id)
                      )
                    : [],

            contact_number: profile.contact_number ?? '',
            address: profile.address ?? '',
            description: profile.description ?? '',

            // Do NOT put the existing image path here.
            // This must remain null until the user selects a new image.
            profile_picture: null,
        });
    }, [profile]);

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

            onSuccess: () => {
                console.log('Business profile updated successfully.');
            },

            onError: (errors) => {
                console.log('Validation errors:', errors);
            },
        });
    };

    return (
        <form
            onSubmit={submit}
            encType="multipart/form-data"
            className="space-y-6"
        >

            {/* ---------------------------------------------------------
                Profile Picture
            --------------------------------------------------------- */}

            <div>
                <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Profile Picture
                </label>

                <div className="flex items-center gap-5">

                    <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-100 ring-2 ring-gray-200">

                        {profile?.profile_picture ? (
                            <img
                                src={`/storage/${profile.profile_picture}`}
                                alt="Supplier"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-3xl">
                                👤
                            </div>
                        )}

                    </div>

                    <div>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) =>
                                setData(
                                    'profile_picture',
                                    e.target.files?.[0] ?? null
                                )
                            }
                            className="block w-full text-sm text-gray-500"
                        />

                        <p className="mt-1 text-xs text-gray-400">
                            JPG, PNG or WEBP. Maximum 2MB.
                        </p>
                    </div>

                </div>

                {errors.profile_picture && (
                    <p className="mt-2 text-sm text-red-600">
                        {errors.profile_picture}
                    </p>
                )}
            </div>


            {/* ---------------------------------------------------------
                Business Name
            --------------------------------------------------------- */}

            <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Business Name
                </label>

                <input
                    type="text"
                    value={data.business_name}
                    onChange={(e) =>
                        setData('business_name', e.target.value)
                    }
                    placeholder="Enter your business name"
                    className="w-full rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />

                {errors.business_name && (
                    <p className="mt-2 text-sm text-red-600">
                        {errors.business_name}
                    </p>
                )}
            </div>


            {/* ---------------------------------------------------------
                Supplier Categories
            --------------------------------------------------------- */}

            <div>
                <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Supplier Categories
                </label>

                <p className="mb-3 text-sm text-gray-500">
                    Select one or more categories that describe your services.
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                    {categories.map((category) => {
                        const categoryId = Number(category.id);

                        const selected =
                            data.supplier_category_ids.includes(categoryId);

                        return (
                            <label
                                key={category.id}
                                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                                    selected
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-gray-200 bg-white hover:bg-gray-50'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    value={categoryId}
                                    checked={selected}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setData(
                                                'supplier_category_ids',
                                                [
                                                    ...data.supplier_category_ids,
                                                    categoryId,
                                                ]
                                            );
                                        } else {
                                            setData(
                                                'supplier_category_ids',
                                                data.supplier_category_ids.filter(
                                                    (id) =>
                                                        id !== categoryId
                                                )
                                            );
                                        }
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />

                                <div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {category.name}
                                    </span>

                                    {category.description && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            {category.description}
                                        </p>
                                    )}
                                </div>

                            </label>
                        );
                    })}

                </div>

                {errors.supplier_category_ids && (
                    <p className="mt-2 text-sm text-red-600">
                        {errors.supplier_category_ids}
                    </p>
                )}
            </div>


            {/* ---------------------------------------------------------
                Contact Number
            --------------------------------------------------------- */}

            <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Contact Number
                </label>

                <input
                    type="text"
                    value={data.contact_number}
                    onChange={(e) =>
                        setData('contact_number', e.target.value)
                    }
                    placeholder="09XXXXXXXXX"
                    className="w-full rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />

                {errors.contact_number && (
                    <p className="mt-2 text-sm text-red-600">
                        {errors.contact_number}
                    </p>
                )}
            </div>


            {/* ---------------------------------------------------------
                Address
            --------------------------------------------------------- */}

            <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Address
                </label>

                <textarea
                    value={data.address}
                    onChange={(e) =>
                        setData('address', e.target.value)
                    }
                    rows="3"
                    placeholder="Enter your business address"
                    className="w-full rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />

                {errors.address && (
                    <p className="mt-2 text-sm text-red-600">
                        {errors.address}
                    </p>
                )}
            </div>


            {/* ---------------------------------------------------------
                Description
            --------------------------------------------------------- */}

            <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Description
                </label>

                <textarea
                    value={data.description}
                    onChange={(e) =>
                        setData('description', e.target.value)
                    }
                    rows="4"
                    placeholder="Tell customers about your business..."
                    className="w-full rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />

                {errors.description && (
                    <p className="mt-2 text-sm text-red-600">
                        {errors.description}
                    </p>
                )}
            </div>


            {/* ---------------------------------------------------------
                Save
            --------------------------------------------------------- */}

            <div className="flex justify-end border-t border-gray-100 pt-6">

                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {processing
                        ? 'Saving...'
                        : 'Save Profile'}
                </button>

            </div>

        </form>
    );
}