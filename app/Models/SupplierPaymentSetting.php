<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierPaymentSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'supplier_id',
        'gcash_name',
        'gcash_number',
        'gcash_qr_path',
        'downpayment_percentage',
        'is_active',
        'instructions',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'downpayment_percentage' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    protected $appends = [
        'gcash_qr_url',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supplier_id');
    }

    public function getGcashQrUrlAttribute(): ?string
    {
        if (! $this->gcash_qr_path) {
            return null;
        }

        if (str_starts_with($this->gcash_qr_path, 'http://') || str_starts_with($this->gcash_qr_path, 'https://') || str_starts_with($this->gcash_qr_path, '/')) {
            return $this->gcash_qr_path;
        }

        return '/storage/'.$this->gcash_qr_path;
    }
}
