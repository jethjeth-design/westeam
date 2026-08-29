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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_reference')->unique();
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
            $table->enum('booking_type', ['service', 'supplier_package', 'team_package', 'multi_supplier']);
            $table->foreignId('team_id')->nullable()->constrained('teams')->nullOnDelete();

            // Event Details
            $table->string('event_name');
            $table->date('event_date');
            $table->time('event_time')->nullable();
            $table->string('event_location');
            $table->integer('guest_count')->nullable();
            $table->text('special_requests')->nullable();
            $table->decimal('total_amount', 12, 2)->default(0);

            // Overall Status: pending, accepted, rejected, cancelled, completed
            $table->enum('overall_status', ['pending', 'accepted', 'rejected', 'cancelled', 'completed'])->default('pending');
            $table->timestamps();
        });

        Schema::create('booking_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->foreignId('supplier_id')->constrained('users')->onDelete('cascade');
            $table->enum('item_type', ['service', 'package', 'team_package']);
            $table->unsignedBigInteger('item_id')->nullable(); // Service ID or Package ID
            $table->string('item_name');
            $table->decimal('unit_price', 10, 2);

            // Item status
            $table->enum('status', ['pending', 'accepted', 'rejected', 'cancelled', 'completed'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->text('response_notes')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_items');
        Schema::dropIfExists('bookings');
    }
};
