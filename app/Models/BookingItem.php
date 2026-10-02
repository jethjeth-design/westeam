<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    protected $appends = [
        'verified_amount',
        'remaining_balance',
        'payment_status',
    ];

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

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'booking_item_id');
    }

    public function verifiedPayments(): HasMany
    {
        return $this->hasMany(Payment::class, 'booking_item_id')->where('status', 'verified');
    }

    public function getVerifiedAmountAttribute(): float
    {
        if ($this->relationLoaded('payments')) {
            return (float) $this->payments->where('status', 'verified')->sum('amount');
        }

        return (float) $this->payments()->where('status', 'verified')->sum('amount');
    }

    public function getRemainingBalanceAttribute(): float
    {
        return max(0.0, round((float) $this->unit_price - $this->verified_amount, 2));
    }

    public function getPaymentStatusAttribute(): string
    {
        $verified = $this->verified_amount;
        $total = (float) $this->unit_price;

        if ($total > 0 && $verified >= $total) {
            return 'Fully Paid';
        }

        if ($verified > 0) {
            return 'Partially Paid';
        }

        $hasPending = $this->relationLoaded('payments')
            ? $this->payments->contains('status', 'pending')
            : $this->payments()->where('status', 'pending')->exists();

        if ($hasPending) {
            return 'Pending Verification';
        }

        $hasRejected = $this->relationLoaded('payments')
            ? $this->payments->contains('status', 'rejected')
            : $this->payments()->where('status', 'rejected')->exists();

        if ($hasRejected) {
            return 'Payment Rejected';
        }

        return 'Unpaid';
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
