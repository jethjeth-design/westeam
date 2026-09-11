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
        Schema::table('supplier_profiles', function (Blueprint $table) {
            if (! Schema::hasColumn('supplier_profiles', 'is_featured')) {
                $table->boolean('is_featured')->default(false);
            }
            if (! Schema::hasColumn('supplier_profiles', 'is_ranking_excluded')) {
                $table->boolean('is_ranking_excluded')->default(false);
            }
            if (! Schema::hasColumn('supplier_profiles', 'featured_score')) {
                $table->decimal('featured_score', 8, 2)->default(0);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('supplier_profiles', function (Blueprint $table) {
            $cols = [];
            if (Schema::hasColumn('supplier_profiles', 'featured_score')) {
                $cols[] = 'featured_score';
            }
            if (Schema::hasColumn('supplier_profiles', 'is_ranking_excluded')) {
                $cols[] = 'is_ranking_excluded';
            }
            if (Schema::hasColumn('supplier_profiles', 'is_featured')) {
                $cols[] = 'is_featured';
            }
            if (! empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};
