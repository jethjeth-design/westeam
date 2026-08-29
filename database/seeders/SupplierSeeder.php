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
                'email' => 'john@elegantmoments.com',
                'business_name' => 'Elegant Moments Photography',
                'contact_number' => '09171234567',
                'description' => 'Professional wedding photography, videography, and event coverage.',
            ],

            [
                'name' => 'Maria Cruz',
                'email' => 'maria@royalfeast.com',
                'business_name' => 'Royal Feast Catering',
                'contact_number' => '09181234567',
                'description' => 'Professional catering services for weddings, birthdays, debuts, and corporate events.',
            ],

            [
                'name' => 'David Garcia',
                'email' => 'david@dreamdecor.com',
                'business_name' => 'Dream Decor Events',
                'contact_number' => '09191234567',
                'description' => 'Professional event styling, decoration, and coordination services.',
            ],

            [
                'name' => 'Anna Reyes',
                'email' => 'anna@glamstudio.com',
                'business_name' => 'Glam Studio Cebu',
                'contact_number' => '09201234567',
                'description' => 'Professional hair and makeup services for weddings and special occasions.',
            ],

            [
                'name' => 'Michael Flores',
                'email' => 'michael@grandvenue.com',
                'business_name' => 'Grand Garden Events Venue',
                'contact_number' => '09211234567',
                'description' => 'Elegant event venue for weddings, birthdays, debuts, and corporate events.',
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
                    'description' => $supplier['description'],
                    'status' => 'approved',
                ]
            );
        }
    }
}
