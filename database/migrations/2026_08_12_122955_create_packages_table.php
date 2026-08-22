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
        Schema::create('packages', function (Blueprint $table) {
            $table->id();

            // Supplier who owns the package
            $table->foreignId('supplier_id')
                ->constrained('users')
                ->cascadeOnDelete();
            // Category of the event (e.g., Wedding, Birthday, etc.)
            $table->foreignId('event_category_id')
                ->constrained('event_categories')
                ->cascadeOnDelete();

            $table->string('name');
            $table->text('description')->nullable();

            $table->decimal('price', 12, 2);

            // What is included in the package
            $table->text('inclusions')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
