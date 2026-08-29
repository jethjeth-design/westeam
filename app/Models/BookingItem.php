<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'supplier_id',
        'item_type',
        'item_id',
        'item_name',
        'unit_price',
        'status',
        'rejection_reason',
        'response_notes',
        'responded_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'responded_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supplier_id');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'item_id');
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class, 'item_id');
    }

    public function review()
    {
        return $this->hasOne(Review::class, 'booking_item_id');
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed' || $this->booking?->overall_status === 'completed';
    }

    public function canBeReviewed(): bool
    {
        return $this->isCompleted() && ! $this->review()->exists();
    }
}
