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
        Schema::create('supplier_payment_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->unique()->constrained('users')->onDelete('cascade');
            $table->string('gcash_name')->nullable();
            $table->string('gcash_number')->nullable();
            $table->string('gcash_qr_path')->nullable();
            $table->unsignedTinyInteger('downpayment_percentage')->default(20);
            $table->boolean('is_active')->default(true);
            $table->text('instructions')->nullable();
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->foreignId('booking_item_id')->nullable()->constrained('booking_items')->nullOnDelete();
            $table->foreignId('supplier_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
            $table->string('payment_method')->default('gcash');
            $table->enum('payment_type', ['downpayment', 'balance', 'full_payment'])->default('downpayment');
            $table->decimal('amount', 12, 2);
            $table->string('reference_number');
            $table->string('receipt_path');
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('rejection_reason')->nullable();
            $table->text('customer_notes')->nullable();
            $table->timestamps();

            $table->index(['supplier_id', 'status']);
            $table->index(['customer_id', 'status']);
            $table->index(['booking_id', 'status']);
            $table->index('reference_number');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('supplier_payment_settings');
    }
};
