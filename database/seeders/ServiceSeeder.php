<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [

            // ==========================================
            // ELEGANT MOMENTS PHOTOGRAPHY
            // ==========================================

            [
                'supplier_email' => 'john@elegantmoments.com',
                'name' => 'Wedding Photography',
                'description' => 'Professional full-day wedding photography coverage.',
                'price' => 25000,
                'category' => 'Wedding',
            ],

            [
                'supplier_email' => 'john@elegantmoments.com',
                'name' => 'Wedding Videography',
                'description' => 'Professional wedding video coverage with cinematic highlights.',
                'price' => 30000,
                'category' => 'Wedding',
            ],

            [
                'supplier_email' => 'john@elegantmoments.com',
                'name' => 'Prenup Photography',
                'description' => 'Professional pre-wedding photoshoot.',
                'price' => 12000,
                'category' => 'Wedding',
            ],

            [
                'supplier_email' => 'john@elegantmoments.com',
                'name' => 'Same-Day Edit',
                'description' => 'Same-day wedding video edit presented during the reception.',
                'price' => 15000,
                'category' => 'Wedding',
            ],

            // ==========================================
            // ROYAL FEAST CATERING
            // ==========================================

            [
                'supplier_email' => 'maria@royalfeast.com',
                'name' => 'Wedding Catering',
                'description' => 'Buffet catering service for wedding celebrations.',
                'price' => 40000,
                'category' => 'Wedding',
            ],

            [
                'supplier_email' => 'maria@royalfeast.com',
                'name' => 'Debut Catering',
                'description' => 'Catering service for debut celebrations.',
                'price' => 35000,
                'category' => 'Debut',
            ],

            [
                'supplier_email' => 'maria@royalfeast.com',
                'name' => 'Birthday Catering',
                'description' => 'Buffet catering for birthday celebrations.',
                'price' => 25000,
                'category' => 'Birthday',
            ],

            [
                'supplier_email' => 'maria@royalfeast.com',
                'name' => 'Dessert Station',
                'description' => 'Dessert buffet station for events.',
                'price' => 8000,
                'category' => 'Wedding',
            ],

            // ==========================================
            // DREAM DECOR EVENTS
            // ==========================================

            [
                'supplier_email' => 'david@dreamdecor.com',
                'name' => 'Basic Wedding Decoration',
                'description' => 'Simple and elegant wedding decoration.',
                'price' => 20000,
                'category' => 'Wedding',
            ],

            [
                'supplier_email' => 'david@dreamdecor.com',
                'name' => 'Premium Wedding Decoration',
                'description' => 'Premium wedding venue styling and decoration.',
                'price' => 40000,
                'category' => 'Wedding',
            ],

            [
                'supplier_email' => 'david@dreamdecor.com',
                'name' => 'Event Coordination',
                'description' => 'Professional event coordination service.',
                'price' => 15000,
                'category' => 'Wedding',
            ],

            [
                'supplier_email' => 'david@dreamdecor.com',
                'name' => 'Full Event Planning',
                'description' => 'Complete event planning and coordination.',
                'price' => 30000,
                'category' => 'Wedding',
            ],

            // ==========================================
            // GLAM STUDIO CEBU
            // ==========================================

            [
                'supplier_email' => 'anna@glamstudio.com',
                'name' => 'Bridal Hair and Makeup',
                'description' => 'Professional bridal hair and makeup service.',
                'price' => 12000,
                'category' => 'Wedding',
            ],

            [
                'supplier_email' => 'anna@glamstudio.com',
                'name' => 'Debut Hair and Makeup',
                'description' => 'Professional hair and makeup for debutants.',
                'price' => 8000,
                'category' => 'Debut',
            ],

            // ==========================================
            // GRAND GARDEN EVENTS VENUE
            // ==========================================

            [
                'supplier_email' => 'michael@grandvenue.com',
                'name' => 'Garden Wedding Venue',
                'description' => 'Beautiful garden venue for wedding ceremonies and receptions.',
                'price' => 50000,
                'category' => 'Wedding',
            ],

            [
                'supplier_email' => 'michael@grandvenue.com',
                'name' => 'Birthday Event Venue',
                'description' => 'Spacious venue for birthday celebrations.',
                'price' => 25000,
                'category' => 'Birthday',
            ],

            [
                'supplier_email' => 'michael@grandvenue.com',
                'name' => 'Corporate Event Venue',
                'description' => 'Professional venue for corporate events.',
                'price' => 35000,
                'category' => 'Corporate',
            ],
        ];

        foreach ($services as $serviceData) {

            $supplier = User::where(
                'email',
                $serviceData['supplier_email']
            )->first();

            if (! $supplier) {
                continue;
            }

            Service::updateOrCreate(
                [
                    'supplier_id' => $supplier->id,
                    'name' => $serviceData['name'],
                ],
                [
                    'description' => $serviceData['description'],
                    'price' => $serviceData['price'],
                    'category' => $serviceData['category'],
                    'is_active' => true,
                ]
            );
        }
    }
}
