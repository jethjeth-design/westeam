<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SupplierCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function supplierProfiles(): BelongsToMany
    {
        return $this->belongsToMany(
            SupplierProfile::class,
            'supplier_profile_category',
            'supplier_category_id',
            'supplier_profile_id'
        );
    }
}
