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

        $allAccepted = $items->every(fn ($i) => in_array($i->status, ['accepted', 'completed']));
        if ($allAccepted) {
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
