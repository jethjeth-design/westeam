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

            // ==========================================
            // ELEGANT MOMENTS PHOTOGRAPHY
            // ==========================================

            [
                'supplier_email' => 'elegantmoments@gmail.com',
                'categories' => [
                    'Photographer',
                    'Videographer',
                ],
            ],

            // ==========================================
            // ROYAL FEAST CATERING
            // ==========================================

            [
                'supplier_email' => 'royalfeast@gmail.com',
                'categories' => [
                    'Catering',
                ],
            ],

            // ==========================================
            // DREAM DECOR EVENTS
            // ==========================================

            [
                'supplier_email' => 'dreamdecor@gmail.com',
                'categories' => [
                    'Event Decorator',
                    'Event Coordinator',
                ],
            ],

            // ==========================================
            // GLAM STUDIO CEBU
            // ==========================================

            [
                'supplier_email' => 'glamstudio@gmail.com',
                'categories' => [
                    'Hair and Makeup Artist',
                ],
            ],
        ];

        foreach ($supplierCategories as $item) {

            // Find supplier profile through user email
            $supplierProfile = SupplierProfile::whereHas('user', function ($query) use ($item) {
                $query->where('email', $item['supplier_email']);
            })->first();

            if (! $supplierProfile) {
                $this->command->warn(
                    "Supplier profile not found: {$item['supplier_email']}"
                );

                continue;
            }

            foreach ($item['categories'] as $categoryName) {

                $category = SupplierCategory::where(
                    'name',
                    $categoryName
                )->first();

                if (! $category) {
                    $this->command->warn(
                        "Supplier category not found: {$categoryName}"
                    );

                    continue;
                }

                $supplierProfile->categories()->syncWithoutDetaching([
                    $category->id,
                ]);
            }
        }
    }
}
