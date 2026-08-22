<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SupplierProfile extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'business_name',
        'contact_number',
        'address',
        'description',
        'profile_picture',
        'status',
        'rejection_reason',
    ];

    /**
     * Supplier account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Supplier category.
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(
            SupplierCategory::class,
            'supplier_profile_category',
            'supplier_profile_id',
            'supplier_category_id'
        );
    }
}
