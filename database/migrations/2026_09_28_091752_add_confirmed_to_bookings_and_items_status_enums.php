<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE bookings MODIFY COLUMN overall_status ENUM('pending', 'accepted', 'confirmed', 'rejected', 'cancelled', 'completed') NOT NULL DEFAULT 'pending'");
            DB::statement("ALTER TABLE booking_items MODIFY COLUMN status ENUM('pending', 'accepted', 'confirmed', 'rejected', 'cancelled', 'completed') NOT NULL DEFAULT 'pending'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE booking_items MODIFY COLUMN status ENUM('pending', 'accepted', 'rejected', 'cancelled', 'completed') NOT NULL DEFAULT 'pending'");
            DB::statement("ALTER TABLE bookings MODIFY COLUMN overall_status ENUM('pending', 'accepted', 'rejected', 'cancelled', 'completed') NOT NULL DEFAULT 'pending'");
        }
    }
};
