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
        Schema::table('packages', function (Blueprint $table) {
            if (! Schema::hasColumn('packages', 'is_top_package')) {
                $table->boolean('is_top_package')->default(false)->after('is_active');
            }
            if (! Schema::hasColumn('packages', 'is_featured')) {
                $table->boolean('is_featured')->default(false);
            }
            if (! Schema::hasColumn('packages', 'is_ranking_excluded')) {
                $table->boolean('is_ranking_excluded')->default(false)->after('is_top_package');
            }
            if (! Schema::hasColumn('packages', 'top_score')) {
                $table->decimal('top_score', 8, 2)->default(0)->after('is_ranking_excluded');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $cols = [];
            if (Schema::hasColumn('packages', 'top_score')) {
                $cols[] = 'top_score';
            }
            if (Schema::hasColumn('packages', 'is_ranking_excluded')) {
                $cols[] = 'is_ranking_excluded';
            }
            if (Schema::hasColumn('packages', 'is_top_package')) {
                $cols[] = 'is_top_package';
            }
            if (! empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};
