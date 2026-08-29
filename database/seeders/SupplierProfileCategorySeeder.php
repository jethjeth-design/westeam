<?php

namespace Database\Seeders;

use App\Models\SupplierCategory;
use App\Models\SupplierProfile;
use Illuminate\Database\Seeder;

class SupplierProfileCategorySeeder extends Seeder
{
    public function run(): void
    {
        $supplierCategories = [
            'john@elegantmoments.com' => [
                'Photography',
                'Videography',
            ],

            'maria@royalfeast.com' => [
                'Catering',
            ],

            'david@dreamdecor.com' => [
                'Event Decoration',
                'Event Planning',
                'Event Coordination',
            ],

            'anna@glamstudio.com' => [
                'Hair and Makeup',
            ],

            'michael@grandvenue.com' => [
                'Venue',
            ],
        ];

        foreach ($supplierCategories as $email => $categories) {

            $profile = SupplierProfile::whereHas('user', function ($query) use ($email) {
                $query->where('email', $email);
            })->first();

            if (! $profile) {
                continue;
            }

            foreach ($categories as $categoryName) {

                $category = SupplierCategory::where(
                    'name',
                    $categoryName
                )->first();

                if (! $category) {
                    continue;
                }

                $profile->categories()->syncWithoutDetaching([
                    $category->id,
                ]);
            }
        }
    }
}
