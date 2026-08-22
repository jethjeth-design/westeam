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
        $wedding = EventCategory::where('name', 'Wedding')->first();
        $birthday = EventCategory::where('name', 'Birthday')->first();
        $debut = EventCategory::where('name', 'Debut')->first();

        if (! $wedding || ! $birthday || ! $debut) {
            $this->command->error(
                'Wedding, Birthday and Debut event categories must exist first.'
            );

            return;
        }

        $packages = [

            // =====================================
            // ELEGANT MOMENTS
            // =====================================

            [
                'supplier_email' => 'elegantmoments@gmail.com',
                'event_category_id' => $wedding->id,
                'name' => 'Basic Wedding Photography Package',
                'description' => 'Perfect for simple and intimate wedding celebrations.',
                'price' => 25000,
                'inclusions' => "6 hours photography coverage\n300+ edited photos\nOnline photo gallery",
            ],

            [
                'supplier_email' => 'elegantmoments@gmail.com',
                'event_category_id' => $wedding->id,
                'name' => 'Premium Wedding Photo & Video',
                'description' => 'Complete photo and video coverage for your memorable wedding.',
                'price' => 55000,
                'inclusions' => "8 hours coverage\n300+ edited photos\nCinematic wedding video\nOnline gallery",
            ],

            // =====================================
            // ROYAL FEAST
            // =====================================

            [
                'supplier_email' => 'royalfeast@gmail.com',
                'event_category_id' => $wedding->id,
                'name' => 'Classic Wedding Catering Package',
                'description' => 'Complete catering package for an elegant wedding celebration.',
                'price' => 65000,
                'inclusions' => "Buffet setup\nMain courses\nDesserts\nDrinks\nBasic catering staff",
            ],

            [
                'supplier_email' => 'royalfeast@gmail.com',
                'event_category_id' => $debut->id,
                'name' => 'Premium Debut Catering Package',
                'description' => 'A complete catering package for a memorable debut.',
                'price' => 55000,
                'inclusions' => "Buffet catering\nMain courses\nDesserts\nDrinks\nCatering staff",
            ],

            // =====================================
            // DREAM DECOR
            // =====================================

            [
                'supplier_email' => 'dreamdecor@gmail.com',
                'event_category_id' => $wedding->id,
                'name' => 'Basic Wedding Decoration',
                'description' => 'Simple and elegant decoration for intimate weddings.',
                'price' => 25000,
                'inclusions' => "Ceremony backdrop\nReception backdrop\nTable centerpieces\nBasic styling",
            ],

            [
                'supplier_email' => 'dreamdecor@gmail.com',
                'event_category_id' => $wedding->id,
                'name' => 'Luxury Wedding Decoration',
                'description' => 'Luxury styling for extraordinary wedding celebrations.',
                'price' => 75000,
                'inclusions' => "Full venue styling\nLuxury backdrop\nPremium centerpieces\nEntrance styling\nReception styling",
            ],

            // =====================================
            // GLAM STUDIO
            // =====================================

            [
                'supplier_email' => 'glamstudio@gmail.com',
                'event_category_id' => $wedding->id,
                'name' => 'Bridal Beauty Package',
                'description' => 'Complete beauty package for the bride.',
                'price' => 12000,
                'inclusions' => "Bridal makeup\nBridal hairstyle\nMakeup retouch\nHair retouch",
            ],

            [
                'supplier_email' => 'glamstudio@gmail.com',
                'event_category_id' => $debut->id,
                'name' => 'Debut Beauty Package',
                'description' => 'Complete beauty package for the debutant.',
                'price' => 8000,
                'inclusions' => "Professional makeup\nHairstyling\nMakeup retouch",
            ],
        ];

        foreach ($packages as $package) {

            $supplier = User::where(
                'email',
                $package['supplier_email']
            )->first();

            if (! $supplier) {
                continue;
            }

            Package::updateOrCreate(
                [
                    'supplier_id' => $supplier->id,
                    'name' => $package['name'],
                ],
                [
                    'event_category_id' => $package['event_category_id'],
                    'description' => $package['description'],
                    'price' => $package['price'],
                    'inclusions' => $package['inclusions'],
                    'is_active' => true,
                ]
            );
        }
    }
}
