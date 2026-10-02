<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_reference',
        'customer_id',
        'booking_type',
        'team_id',
        'event_name',
        'event_date',
        'event_time',
        'event_location',
        'guest_count',
        'special_requests',
        'total_amount',
        'overall_status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'total_amount' => 'decimal:2',
            'guest_count' => 'integer',
        ];
    }

    protected $appends = [
        'verified_amount',
        'remaining_balance',
        'payment_status',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'team_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(BookingItem::class, 'booking_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'booking_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'booking_id');
    }

    public function verifiedPayments(): HasMany
    {
        return $this->hasMany(Payment::class, 'booking_id')->where('status', 'verified');
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
        return max(0.0, round((float) $this->total_amount - $this->verified_amount, 2));
    }

    public function getPaymentStatusAttribute(): string
    {
        $verified = $this->verified_amount;
        $total = (float) $this->total_amount;

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

    /**
     * Recalculate overall status based on items.
     */
    public function recalculateStatus(): void
    {
        $items = $this->items()->get();

        if ($items->isEmpty()) {
            return;
        }

        $allCancelled = $items->every(fn ($i) => $i->status === 'cancelled');
        if ($allCancelled) {
            $this->update(['overall_status' => 'cancelled']);

            return;
        }

        $allRejected = $items->every(fn ($i) => $i->status === 'rejected');
        if ($allRejected) {
            $this->update(['overall_status' => 'rejected']);

            return;
        }

        $allCompleted = $items->every(fn ($i) => $i->status === 'completed');
        if ($allCompleted) {
            $this->update(['overall_status' => 'completed']);

            return;
        }

        $allAcceptedOrConfirmed = $items->every(fn ($i) => in_array($i->status, ['accepted', 'confirmed', 'completed']));
        if ($allAcceptedOrConfirmed) {
            $hasConfirmed = $items->contains(fn ($i) => in_array($i->status, ['confirmed', 'completed']));
            $hasVerifiedPayment = $this->relationLoaded('payments')
                ? $this->payments->contains('status', 'verified')
                : $this->payments()->where('status', 'verified')->exists();

            if ($hasConfirmed || $hasVerifiedPayment) {
                $this->update(['overall_status' => 'confirmed']);

                return;
            }

            $this->update(['overall_status' => 'accepted']);

            return;
        }

        // If any rejected or still pending
        if ($items->contains(fn ($i) => $i->status === 'rejected')) {
            // partially rejected / pending
            $this->update(['overall_status' => 'pending']);

            return;
        }

        $this->update(['overall_status' => 'pending']);
    }
}
