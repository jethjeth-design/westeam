<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierCalendarAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'supplier_id',
        'google_id',
        'google_email',
        'access_token',
        'refresh_token',
        'expires_at',
        'calendar_id',
        'is_connected',
        'last_synced_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'access_token' => 'encrypted',
            'refresh_token' => 'encrypted',
            'expires_at' => 'datetime',
            'is_connected' => 'boolean',
            'last_synced_at' => 'datetime',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supplier_id');
    }

    /**
     * Determine if access token is expired or expires within 60 seconds.
     */
    public function isExpired(): bool
    {
        if (! $this->expires_at) {
            return true;
        }

        return $this->expires_at->isPast() || $this->expires_at->diffInSeconds(now()) < 60;
    }
}
