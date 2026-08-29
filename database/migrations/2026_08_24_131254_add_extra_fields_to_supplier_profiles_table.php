<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('supplier_profiles', function (Blueprint $table) {
            $table->string('cover_photo')->nullable()->after('profile_picture');
            $table->unsignedTinyInteger('years_of_experience')->nullable()->after('address');
            $table->string('facebook_page')->nullable()->after('years_of_experience');
        });
    }

    public function down(): void
    {
        Schema::table('supplier_profiles', function (Blueprint $table) {
            $table->dropColumn(['cover_photo', 'years_of_experience', 'facebook_page']);
        });
    }
};
