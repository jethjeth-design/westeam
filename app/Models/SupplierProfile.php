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
        'cover_photo',
        'years_of_experience',
        'facebook_page',
        'status',
        'rejection_reason',
    ];

    protected $appends = [
        'facebook_url',
        'cover_photo_url',
        'profile_picture_url',
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

    public function getFacebookUrlAttribute(): ?string
    {
        return $this->facebook_page;
    }

    public function getCoverPhotoUrlAttribute(): ?string
    {
        if (! $this->cover_photo) {
            return null;
        }

        if (str_starts_with($this->cover_photo, 'http://') || str_starts_with($this->cover_photo, 'https://') || str_starts_with($this->cover_photo, '/')) {
            return $this->cover_photo;
        }

        return '/storage/'.$this->cover_photo;
    }

    public function getProfilePictureUrlAttribute(): ?string
    {
        if (! $this->profile_picture) {
            return null;
        }

        if (str_starts_with($this->profile_picture, 'http://') || str_starts_with($this->profile_picture, 'https://') || str_starts_with($this->profile_picture, '/')) {
            return $this->profile_picture;
        }

        return '/storage/'.$this->profile_picture;
    }
}
