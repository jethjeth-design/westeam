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
        if (! Schema::hasTable('supplier_profile_category')) {
            Schema::create('supplier_profile_category', function (Blueprint $table) {
                $table->id();
                $table->foreignId('supplier_profile_id')
                    ->constrained('supplier_profiles')
                    ->cascadeOnDelete();

                $table->foreignId('supplier_category_id')
                    ->constrained('supplier_categories')
                    ->cascadeOnDelete();

                $table->timestamps();

                $table->unique([
                    'supplier_profile_id',
                    'supplier_category_id',
                ]);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplier_profile_category');
    }
};
