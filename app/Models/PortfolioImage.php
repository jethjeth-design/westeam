<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PortfolioImage extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'supplier_portfolio_id',
        'image_path',
        'caption',
        'is_cover',
        'sort_order',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'image_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_cover' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * Get the portfolio that owns the image.
     */
    public function portfolio(): BelongsTo
    {
        return $this->belongsTo(SupplierPortfolio::class, 'supplier_portfolio_id');
    }

    /**
     * Accessor for full image URL.
     */
    public function getImageUrlAttribute(): string
    {
        if (empty($this->image_path)) {
            return '';
        }

        if (filter_var($this->image_path, FILTER_VALIDATE_URL)) {
            return $this->image_path;
        }

        return Storage::disk('public')->url($this->image_path);
    }
}
