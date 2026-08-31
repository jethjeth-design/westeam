<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class SupplierPortfolio extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'supplier_id',
        'event_category_id',
        'title',
        'description',
        'video_url',
        'event_date',
        'client_name',
        'location',
        'is_featured',
        'is_published',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'cover_image_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
        ];
    }

    /**
     * The supplier that owns this portfolio.
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supplier_id');
    }

    /**
     * The event category of the portfolio.
     */
    public function eventCategory(): BelongsTo
    {
        return $this->belongsTo(EventCategory::class, 'event_category_id');
    }

    /**
     * All images in this portfolio.
     */
    public function images(): HasMany
    {
        return $this->hasMany(PortfolioImage::class, 'supplier_portfolio_id')
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    /**
     * The cover image for this portfolio.
     */
    public function coverImage(): HasOne
    {
        return $this->hasOne(PortfolioImage::class, 'supplier_portfolio_id')
            ->where('is_cover', true);
    }

    /**
     * Accessor to get cover image URL (or first image URL fallback).
     */
    public function getCoverImageUrlAttribute(): ?string
    {
        if ($this->relationLoaded('coverImage') && $this->coverImage) {
            return $this->coverImage->image_url;
        }

        if ($this->relationLoaded('images') && $this->images->isNotEmpty()) {
            $cover = $this->images->firstWhere('is_cover', true) ?? $this->images->first();

            return $cover?->image_url;
        }

        $cover = $this->coverImage()->first() ?? $this->images()->first();

        return $cover?->image_url;
    }
}
