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
        Schema::create('supplier_portfolios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignId('event_category_id')
                ->nullable()
                ->constrained('event_categories')
                ->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('event_date')->nullable();
            $table->string('client_name')->nullable();
            $table->string('location')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplier_portfolios');
    }
};
