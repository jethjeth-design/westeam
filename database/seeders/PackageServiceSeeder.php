<?php

namespace Database\Seeders;

use App\Models\Package;
use App\Models\Service;
use Illuminate\Database\Seeder;

class PackageServiceSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [

            // ==========================================
            // ELEGANT MOMENTS
            // ==========================================

            'Basic Wedding Photography' => [
                'Wedding Photography',
            ],

            'Premium Photo and Video Package' => [
                'Wedding Photography',
                'Wedding Videography',
                'Prenup Photography',
            ],

            'Luxury Wedding Photo Package' => [
                'Wedding Photography',
                'Wedding Videography',
                'Prenup Photography',
                'Same-Day Edit',
            ],

            // ==========================================
            // ROYAL FEAST
            // ==========================================

            'Basic Wedding Catering' => [
                'Wedding Catering',
            ],

            'Premium Wedding Catering' => [
                'Wedding Catering',
                'Dessert Station',
            ],

            // ==========================================
            // DREAM DECOR
            // ==========================================

            'Basic Wedding Package' => [
                'Basic Wedding Decoration',
                'Event Coordination',
            ],

            'Premium Wedding Package' => [
                'Premium Wedding Decoration',
                'Event Coordination',
            ],

            'Luxury Wedding Package' => [
                'Premium Wedding Decoration',
                'Full Event Planning',
                'Event Coordination',
            ],

            // ==========================================
            // GLAM STUDIO
            // ==========================================

            'Bridal Beauty Package' => [
                'Bridal Hair and Makeup',
            ],

            'Luxury Bridal Beauty Package' => [
                'Bridal Hair and Makeup',
            ],

            // ==========================================
            // GRAND GARDEN VENUE
            // ==========================================

            'Garden Wedding Package' => [
                'Garden Wedding Venue',
            ],

            'Premium Wedding Venue Package' => [
                'Garden Wedding Venue',
            ],
        ];

        foreach ($packages as $packageName => $serviceNames) {

            $package = Package::where(
                'name',
                $packageName
            )->first();

            if (! $package) {
                continue;
            }

            foreach ($serviceNames as $serviceName) {

                $service = Service::where(
                    'name',
                    $serviceName
                )
                    ->where(
                        'supplier_id',
                        $package->supplier_id
                    )
                    ->first();

                if (! $service) {
                    continue;
                }

                $package->services()->syncWithoutDetaching([
                    $service->id,
                ]);
            }
        }
    }
}
