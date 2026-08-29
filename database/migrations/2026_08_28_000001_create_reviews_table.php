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
        Schema::dropIfExists('reviews');

        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->foreignId('booking_item_id')->unique()->constrained('booking_items')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('supplier_id')->constrained('users')->cascadeOnDelete();
            $table->enum('item_type', ['service', 'package', 'team_package'])->default('service');
            $table->unsignedBigInteger('item_id')->nullable();
            $table->string('item_name');
            $table->unsignedTinyInteger('rating'); // 1 to 5 stars
            $table->text('comment');
            $table->enum('status', ['approved', 'pending', 'rejected'])->default('approved');
            $table->timestamps();

            $table->index(['supplier_id', 'status']);
            $table->index(['customer_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
