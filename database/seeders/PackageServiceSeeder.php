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

            // =====================================
            // ELEGANT MOMENTS
            // =====================================

            'Basic Wedding Photography Package' => [
                'Wedding Photography',
            ],

            'Premium Wedding Photo & Video' => [
                'Wedding Photography',
                'Wedding Videography',
                'Prenup Photography',
            ],

            // =====================================
            // ROYAL FEAST
            // =====================================

            'Classic Wedding Catering Package' => [
                'Wedding Catering',
            ],

            'Premium Debut Catering Package' => [
                'Debut Catering',
            ],

            // =====================================
            // DREAM DECOR
            // =====================================

            'Basic Wedding Decoration' => [
                'Basic Wedding Decoration',
            ],

            'Luxury Wedding Decoration' => [
                'Premium Wedding Decoration',
            ],

            // =====================================
            // GLAM STUDIO
            // =====================================

            'Bridal Beauty Package' => [
                'Bridal Hair and Makeup',
            ],

            'Debut Beauty Package' => [
                'Debut Hair and Makeup',
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
