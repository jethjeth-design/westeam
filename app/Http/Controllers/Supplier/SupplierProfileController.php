<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\SupplierCategory;
use App\Models\SupplierPortfolio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SupplierProfileController extends Controller
{
    /**
     * Show supplier business profile.
     */
    public function edit()
    {
        $profile = Auth::user()
            ->supplierProfile()
            ->with('categories')
            ->first();

        return Inertia::render('Supplier/BusinessProfile/Edit', [
            'profile' => $profile,

            'categories' => SupplierCategory::where('is_active', true)
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),

            'portfolios' => SupplierPortfolio::where('supplier_id', Auth::id())
                ->with('images')
                ->latest()
                ->take(4)
                ->get(),
        ]);
    }

    /**
     * Update supplier business profile.
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'business_name' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'contact_number' => [
                'nullable',
                'string',
                'max:30',
            ],

            'address' => [
                'nullable',
                'string',
                'max:500',
            ],

            'profile_picture' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],

            'supplier_category_ids' => [
                'nullable',
                'array',
            ],

            'supplier_category_ids.*' => [
                'integer',
                'exists:supplier_categories,id',
            ],

            'cover_photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:3072',
            ],

            'years_of_experience' => [
                'nullable',
                'integer',
                'min:0',
                'max:100',
            ],

            'facebook_page' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Get existing profile or create it
        |--------------------------------------------------------------------------
        */

        $profile = $user->supplierProfile()->firstOrCreate(
            [
                'user_id' => $user->id,
            ],
            [
                'status' => 'pending',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Profile Picture
        |--------------------------------------------------------------------------
        */

        $profilePicture = $profile->profile_picture;

        if ($request->hasFile('profile_picture')) {

            if ($profilePicture) {
                Storage::disk('public')->delete($profilePicture);
            }

            $profilePicture = $request
                ->file('profile_picture')
                ->store('supplier-profiles', 'public');
        }

        /*
        |--------------------------------------------------------------------------
        | Cover Photo
        |--------------------------------------------------------------------------
        */

        $coverPhoto = $profile->cover_photo;

        if ($request->hasFile('cover_photo')) {

            if ($coverPhoto) {
                Storage::disk('public')->delete($coverPhoto);
            }

            $coverPhoto = $request
                ->file('cover_photo')
                ->store('supplier-covers', 'public');
        }

        /*
        |--------------------------------------------------------------------------
        | Update Profile
        |--------------------------------------------------------------------------
        */

        $profile->update([
            'business_name' => $validated['business_name'],
            'description' => $validated['description'] ?? null,
            'contact_number' => $validated['contact_number'] ?? null,
            'address' => $validated['address'] ?? null,
            'profile_picture' => $profilePicture,
            'cover_photo' => $coverPhoto,
            'years_of_experience' => $validated['years_of_experience'] ?? null,
            'facebook_page' => $validated['facebook_page'] ?? null,

            // Important:
            // Updating the profile sends it back to admin review.
            'status' => 'pending',

            // Remove the previous rejection reason.
            'rejection_reason' => null,
        ]);

        /*
        |--------------------------------------------------------------------------
        | Update Categories
        |--------------------------------------------------------------------------
        */

        $profile->categories()->sync(
            $validated['supplier_category_ids'] ?? []
        );

        return redirect()
            ->route('supplier.settings')
            ->with(
                'success',
                'Your profile has been submitted for review.'
            );
    }
}
