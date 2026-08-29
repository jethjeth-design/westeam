<?php

namespace Database\Seeders;

use App\Models\EventCategory;
use App\Models\Package;
use App\Models\User;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [

            // ==========================================
            // ELEGANT MOMENTS
            // ==========================================

            [
                'supplier_email' => 'john@elegantmoments.com',
                'name' => 'Basic Wedding Photography',
                'event_category' => 'Wedding',
                'description' => 'Perfect for simple and intimate wedding celebrations.',
                'price' => 25000,
                'inclusions' => [
                    '6 hours photography coverage',
                    '1 professional photographer',
                    'Edited digital photos',
                    'Online photo gallery',
                ],
            ],

            [
                'supplier_email' => 'john@elegantmoments.com',
                'name' => 'Premium Photo and Video Package',
                'event_category' => 'Wedding',
                'description' => 'Complete photography and videography coverage for your wedding.',
                'price' => 55000,
                'inclusions' => [
                    '8 hours coverage',
                    'Professional photographer',
                    'Professional videographer',
                    'Edited wedding photos',
                    'Cinematic wedding video',
                    'Online gallery',
                ],
            ],

            [
                'supplier_email' => 'john@elegantmoments.com',
                'name' => 'Luxury Wedding Photo Package',
                'event_category' => 'Wedding',
                'description' => 'Premium wedding photography and videography experience.',
                'price' => 85000,
                'inclusions' => [
                    'Full-day coverage',
                    '2 photographers',
                    '2 videographers',
                    'Prenup session',
                    'Same-day edit',
                    'Premium photo album',
                    'Drone coverage',
                ],
            ],

            // ==========================================
            // ROYAL FEAST
            // ==========================================

            [
                'supplier_email' => 'maria@royalfeast.com',
                'name' => 'Basic Wedding Catering',
                'event_category' => 'Wedding',
                'description' => 'Affordable catering package for intimate wedding celebrations.',
                'price' => 40000,
                'inclusions' => [
                    'Buffet catering',
                    'Up to 50 guests',
                    'Main dishes',
                    'Desserts',
                    'Drinks',
                ],
            ],

            [
                'supplier_email' => 'maria@royalfeast.com',
                'name' => 'Premium Wedding Catering',
                'event_category' => 'Wedding',
                'description' => 'Complete catering package for memorable wedding celebrations.',
                'price' => 75000,
                'inclusions' => [
                    'Buffet catering',
                    'Up to 100 guests',
                    'Premium menu',
                    'Dessert station',
                    'Drinks package',
                    'Buffet setup',
                ],
            ],

            // ==========================================
            // DREAM DECOR
            // ==========================================

            [
                'supplier_email' => 'david@dreamdecor.com',
                'name' => 'Basic Wedding Package',
                'event_category' => 'Wedding',
                'description' => 'Perfect for simple and intimate celebrations.',
                'price' => 25000,
                'inclusions' => [
                    'Event coordination',
                    'Basic decorations',
                    'Basic backdrop',
                    'Table styling',
                ],
            ],

            [
                'supplier_email' => 'david@dreamdecor.com',
                'name' => 'Premium Wedding Package',
                'event_category' => 'Wedding',
                'description' => 'A complete package for a memorable celebration.',
                'price' => 75000,
                'inclusions' => [
                    'Full event coordination',
                    'Premium decoration',
                    'Premium backdrop',
                    'Reception styling',
                    'Table centerpieces',
                ],
            ],

            [
                'supplier_email' => 'david@dreamdecor.com',
                'name' => 'Luxury Wedding Package',
                'event_category' => 'Wedding',
                'description' => 'Everything you need for an extraordinary event.',
                'price' => 150000,
                'inclusions' => [
                    'Full event planning',
                    'Luxury venue decoration',
                    'Premium styling',
                    'Luxury backdrop',
                    'Premium centerpieces',
                    'Full reception styling',
                ],
            ],

            // ==========================================
            // GLAM STUDIO
            // ==========================================

            [
                'supplier_email' => 'anna@glamstudio.com',
                'name' => 'Bridal Beauty Package',
                'event_category' => 'Wedding',
                'description' => 'Complete beauty package for the bride.',
                'price' => 12000,
                'inclusions' => [
                    'Bridal makeup',
                    'Bridal hairstyle',
                    'Makeup retouch',
                    'Hair retouch',
                ],
            ],

            [
                'supplier_email' => 'anna@glamstudio.com',
                'name' => 'Luxury Bridal Beauty Package',
                'event_category' => 'Wedding',
                'description' => 'Premium bridal beauty experience.',
                'price' => 20000,
                'inclusions' => [
                    'Premium bridal makeup',
                    'Premium hairstyle',
                    'Trial makeup',
                    'Trial hairstyle',
                    'Retouch service',
                    'Touch-up kit',
                ],
            ],

            // ==========================================
            // GRAND GARDEN VENUE
            // ==========================================

            [
                'supplier_email' => 'michael@grandvenue.com',
                'name' => 'Garden Wedding Package',
                'event_category' => 'Wedding',
                'description' => 'Beautiful garden venue for wedding celebrations.',
                'price' => 50000,
                'inclusions' => [
                    'Garden venue',
                    'Tables and chairs',
                    'Bridal room',
                    'Parking area',
                    'Basic lighting',
                ],
            ],

            [
                'supplier_email' => 'michael@grandvenue.com',
                'name' => 'Premium Wedding Venue Package',
                'event_category' => 'Wedding',
                'description' => 'Premium venue experience for elegant weddings.',
                'price' => 80000,
                'inclusions' => [
                    'Exclusive venue use',
                    'Bridal room',
                    'Tables and chairs',
                    'Premium lighting',
                    'Parking',
                    'Basic sound system',
                ],
            ],
        ];

        foreach ($packages as $packageData) {

            $supplier = User::where(
                'email',
                $packageData['supplier_email']
            )->first();

            $eventCategory = EventCategory::where(
                'name',
                $packageData['event_category']
            )->first();

            if (! $supplier || ! $eventCategory) {
                continue;
            }

            Package::updateOrCreate(
                [
                    'supplier_id' => $supplier->id,
                    'name' => $packageData['name'],
                ],
                [
                    'event_category_id' => $eventCategory->id,
                    'description' => $packageData['description'],
                    'price' => $packageData['price'],
                    'inclusions' => implode(
                        "\n",
                        $packageData['inclusions']
                    ),
                    'is_active' => true,
                ]
            );
        }
    }
}
