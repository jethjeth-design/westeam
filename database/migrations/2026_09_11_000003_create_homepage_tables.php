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
        Schema::create('homepage_banners', function (Blueprint $table) {
            $table->id();
            $table->string('badge')->nullable()->default('Your Perfect Event Starts Here');
            $table->string('title');
            $table->text('subtitle')->nullable();
            $table->string('image_url');
            $table->string('button_text')->nullable()->default('Explore Suppliers');
            $table->string('button_url')->nullable()->default('/suppliers');
            $table->string('secondary_button_text')->nullable()->default('View Packages');
            $table->string('secondary_button_url')->nullable()->default('/packages');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('homepage_sections', function (Blueprint $table) {
            $table->id();
            $table->string('section_key')->unique();
            $table->string('title');
            $table->text('subtitle')->nullable();
            $table->json('content')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('homepage_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('text');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('homepage_settings');
        Schema::dropIfExists('homepage_sections');
        Schema::dropIfExists('homepage_banners');
    }
};
