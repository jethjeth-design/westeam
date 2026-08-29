<?php

namespace Database\Seeders;

use App\Models\SupplierCategory;
use Illuminate\Database\Seeder;

class SupplierCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Photography',
            'Videography',
            'Catering',
            'Event Decoration',
            'Event Planning',
            'Event Coordination',
            'Hair and Makeup',
            'Venue',
            'Entertainment',
            'Sound and Lighting',
            'Florist',
            'Wedding Gown',
            'Wedding Attire',
            'Transportation',
        ];

        foreach ($categories as $category) {
            SupplierCategory::firstOrCreate([
                'name' => $category,
            ]);
        }
    }
}
