<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            if (! Schema::hasColumn('services', 'category')) {
                $table->string('category')->nullable()->after('name');
            }
            if (! Schema::hasColumn('services', 'price')) {
                $table->decimal('price', 10, 2)->default(0)->after('event_type');
            }
            if (! Schema::hasColumn('services', 'image_path')) {
                $table->string('image_path')->nullable()->after('description');
            }
        });

        Schema::table('packages', function (Blueprint $table) {
            if (! Schema::hasColumn('packages', 'image_path')) {
                $table->string('image_path')->nullable()->after('inclusions');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            if (Schema::hasColumn('services', 'category')) {
                $table->dropColumn('category');
            }
            if (Schema::hasColumn('services', 'image_path')) {
                $table->dropColumn('image_path');
            }
        });

        Schema::table('packages', function (Blueprint $table) {
            if (Schema::hasColumn('packages', 'image_path')) {
                $table->dropColumn('image_path');
            }
        });
    }
};
