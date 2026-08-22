<?php

namespace Database\Seeders;

use App\Models\SupplierCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SupplierCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Photographer',
                'description' => 'Professional photography services for weddings and events.',
            ],
            [
                'name' => 'Videographer',
                'description' => 'Professional video and cinematic coverage for events.',
            ],
            [
                'name' => 'Catering',
                'description' => 'Food, buffet, drinks, and catering services.',
            ],
            [
                'name' => 'Event Decorator',
                'description' => 'Event styling, decoration, backdrops, and venue setup.',
            ],
            [
                'name' => 'Event Coordinator',
                'description' => 'Event planning, coordination, and management services.',
            ],
            [
                'name' => 'Wedding Planner',
                'description' => 'Full wedding planning and coordination services.',
            ],
            [
                'name' => 'Hair and Makeup Artist',
                'description' => 'Professional hair styling and makeup services.',
            ],
            [
                'name' => 'Wedding Venue',
                'description' => 'Venues for weddings, receptions, and other celebrations.',
            ],
            [
                'name' => 'Entertainment',
                'description' => 'Live bands, singers, DJs, hosts, and other entertainment.',
            ],
            [
                'name' => 'Florist',
                'description' => 'Wedding bouquets, flower arrangements, and floral decorations.',
            ],
            [
                'name' => 'Wedding Dress and Attire',
                'description' => 'Wedding gowns, suits, dresses, and formal event attire.',
            ],
            [
                'name' => 'Invitation and Souvenir',
                'description' => 'Event invitations, souvenirs, giveaways, and personalized items.',
            ],
            [
                'name' => 'Lights and Sounds',
                'description' => 'Professional sound systems, lighting, and event equipment.',
            ],
            [
                'name' => 'Transportation',
                'description' => 'Wedding cars, event transportation, and shuttle services.',
            ],
            [
                'name' => 'Cake and Desserts',
                'description' => 'Wedding cakes, birthday cakes, desserts, and sweet tables.',
            ],
        ];

        foreach ($categories as $category) {
            SupplierCategory::updateOrCreate(
                [
                    'name' => $category['name'],
                ],
                [
                    'slug' => Str::slug($category['name']),
                    'description' => $category['description'],
                    'is_active' => true,
                ]
            );
        }
    }
}
