<?php

namespace Database\Seeders;

use App\Models\SupplierProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = [
            [
                'name' => 'John Santos',
                'email' => 'elegantmoments@gmail.com',
                'business_name' => 'Elegant Moments Photography',
                'contact_number' => '09171234567',
                'address' => 'Cebu City, Cebu',
                'description' => 'Professional wedding and event photography and videography services.',
            ],

            [
                'name' => 'Maria Cruz',
                'email' => 'royalfeast@gmail.com',
                'business_name' => 'Royal Feast Catering',
                'contact_number' => '09181234567',
                'address' => 'Mandaue City, Cebu',
                'description' => 'Professional catering services for weddings, birthdays, debuts and other events.',
            ],

            [
                'name' => 'David Garcia',
                'email' => 'dreamdecor@gmail.com',
                'business_name' => 'Dream Decor Events',
                'contact_number' => '09191234567',
                'address' => 'Lapu-Lapu City, Cebu',
                'description' => 'Professional event styling, decoration and coordination services.',
            ],

            [
                'name' => 'Anna Reyes',
                'email' => 'glamstudio@gmail.com',
                'business_name' => 'Glam Studio Cebu',
                'contact_number' => '09201234567',
                'address' => 'Cebu City, Cebu',
                'description' => 'Professional hair and makeup services for weddings and special events.',
            ],
        ];

        foreach ($suppliers as $supplier) {

            $user = User::updateOrCreate(
                [
                    'email' => $supplier['email'],
                ],
                [
                    'name' => $supplier['name'],
                    'password' => Hash::make('password'),
                    'role' => 'supplier',
                    'email_verified_at' => now(),
                ]
            );

            SupplierProfile::updateOrCreate(
                [
                    'user_id' => $user->id,
                ],
                [
                    'business_name' => $supplier['business_name'],
                    'contact_number' => $supplier['contact_number'],
                    'address' => $supplier['address'],
                    'description' => $supplier['description'],

                    // Automatically approved
                    'status' => 'approved',
                ]
            );
        }
    }
}
