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

            // =====================================
            // ELEGANT MOMENTS PHOTOGRAPHY
            // =====================================

            [
                'supplier_email' => 'elegantmoments@gmail.com',
                'name' => 'Wedding Photography',
                'category' => 'Wedding',
                'description' => 'Professional wedding photography coverage.',
                'price' => 25000,
            ],

            [
                'supplier_email' => 'elegantmoments@gmail.com',
                'name' => 'Wedding Videography',
                'category' => 'Wedding',
                'description' => 'Cinematic wedding video coverage.',
                'price' => 30000,
            ],

            [
                'supplier_email' => 'elegantmoments@gmail.com',
                'name' => 'Prenup Photography',
                'category' => 'Wedding',
                'description' => 'Professional pre-wedding photo session.',
                'price' => 12000,
            ],

            [
                'supplier_email' => 'elegantmoments@gmail.com',
                'name' => 'Same-Day Edit',
                'category' => 'Wedding',
                'description' => 'Same-day wedding video editing and presentation.',
                'price' => 15000,
            ],

            // =====================================
            // ROYAL FEAST CATERING
            // =====================================

            [
                'supplier_email' => 'royalfeast@gmail.com',
                'name' => 'Wedding Catering',
                'category' => 'Wedding',
                'description' => 'Buffet catering for wedding celebrations.',
                'price' => 40000,
            ],

            [
                'supplier_email' => 'royalfeast@gmail.com',
                'name' => 'Birthday Catering',
                'category' => 'Birthday',
                'description' => 'Catering service for birthday celebrations.',
                'price' => 25000,
            ],

            [
                'supplier_email' => 'royalfeast@gmail.com',
                'name' => 'Debut Catering',
                'category' => 'Debut',
                'description' => 'Catering package for debut celebrations.',
                'price' => 35000,
            ],

            // =====================================
            // DREAM DECOR EVENTS
            // =====================================

            [
                'supplier_email' => 'dreamdecor@gmail.com',
                'name' => 'Basic Wedding Decoration',
                'category' => 'Wedding',
                'description' => 'Simple and elegant wedding decoration.',
                'price' => 20000,
            ],

            [
                'supplier_email' => 'dreamdecor@gmail.com',
                'name' => 'Premium Wedding Decoration',
                'category' => 'Wedding',
                'description' => 'Premium wedding venue styling and decoration.',
                'price' => 45000,
            ],

            [
                'supplier_email' => 'dreamdecor@gmail.com',
                'name' => 'Birthday Decoration',
                'category' => 'Birthday',
                'description' => 'Themed birthday decoration and styling.',
                'price' => 15000,
            ],

            // =====================================
            // GLAM STUDIO
            // =====================================

            [
                'supplier_email' => 'glamstudio@gmail.com',
                'name' => 'Bridal Hair and Makeup',
                'category' => 'Wedding',
                'description' => 'Professional bridal hair and makeup.',
                'price' => 12000,
            ],

            [
                'supplier_email' => 'glamstudio@gmail.com',
                'name' => 'Debut Hair and Makeup',
                'category' => 'Debut',
                'description' => 'Professional hair and makeup for debutants.',
                'price' => 8000,
            ],
        ];

        foreach ($services as $service) {

            $supplier = User::where(
                'email',
                $service['supplier_email']
            )->first();

            if (! $supplier) {
                continue;
            }

            Service::updateOrCreate(
                [
                    'supplier_id' => $supplier->id,
                    'name' => $service['name'],
                ],
                [
                    'category' => $service['category'],
                    'description' => $service['description'],
                    'price' => $service['price'],
                    'is_active' => true,
                ]
            );
        }
    }
}
