<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Package extends Model
{
    protected $fillable = [
        'supplier_id',
        'team_id',
        'event_category_id',
        'name',
        'description',
        'price',
        'inclusions',
        'image_path',
        'is_featured',
        'is_active',
        'is_top_package',
        'is_ranking_excluded',
        'top_score',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'is_top_package' => 'boolean',
        'is_ranking_excluded' => 'boolean',
        'top_score' => 'decimal:2',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supplier_id');
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'team_id');
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(
            Service::class,
            'package_service'
        );
    }

    public function eventCategory()
    {
        return $this->belongsTo(EventCategory::class);
    }

    /**
     * Booking items associated with this package.
     */
    public function bookingItems(): HasMany
    {
        return $this->hasMany(BookingItem::class, 'item_id')
            ->where('item_type', 'package');
    }

    /**
     * Reviews received for this package.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'item_id')
            ->where('item_type', 'package');
    }

    /**
     * Query completed bookings/items for this package.
     */
    public function completedBookingsQuery()
    {
        return $this->bookingItems()
            ->where(function ($q) {
                $q->where('status', 'completed')
                    ->orWhereHas('booking', function ($b) {
                        $b->where('overall_status', 'completed');
                    });
            });
    }

    /**
     * Query approved reviews that originate strictly from completed bookings.
     */
    public function completedBookingReviewsQuery()
    {
        return $this->reviews()
            ->where('status', 'approved')
            ->whereHas('bookingItem', function ($q) {
                $q->where('status', 'completed')
                    ->orWhereHas('booking', function ($b) {
                        $b->where('overall_status', 'completed');
                    });
            });
    }

    /**
     * Calculate package performance metrics and ranking score.
     */
    public function calculatePerformanceMetrics(): array
    {
        // 1. Completed bookings count
        $completedBookingsCount = $this->completedBookingsQuery()->count();

        // 2. Recent completed bookings count (within last 60 days)
        $recentBookingsCount = $this->completedBookingsQuery()
            ->where('created_at', '>=', now()->subDays(60))
            ->count();

        // 3. Approved customer reviews strictly from completed bookings
        $reviewsQuery = $this->completedBookingReviewsQuery();
        $reviewsCount = $reviewsQuery->count();
        $averageRating = $reviewsCount > 0 ? round((float) $reviewsQuery->avg('rating'), 2) : 0.0;

        // 4. Supplier verification
        $supplier = $this->supplier;
        $supplierProfile = $supplier?->supplierProfile()->first() ?? $supplier?->supplierProfile;
        $supplierIsApproved = $supplierProfile && $supplierProfile->status === 'approved';

        // 5. Qualification rules check:
        // - Be active
        // - Belong to an approved supplier
        // - Have at least 5 completed bookings
        // - Have at least 5 customer reviews
        // - Have an average rating of at least 4.5 stars
        $isActive = (bool) $this->is_active;
        $hasEnoughBookings = $completedBookingsCount >= 5;
        $hasEnoughReviews = $reviewsCount >= 5;
        $hasHighRating = $averageRating >= 4.5;

        $isQualified = $isActive && $supplierIsApproved && $hasEnoughBookings && $hasEnoughReviews && $hasHighRating;

        // 6. Ranking / Performance Score:
        // Composite score factoring in:
        // Average rating (weight 20) + reviews count (weight 2) + completed bookings (weight 3) + recent booking performance (weight 2)
        $topScore = round(
            ($averageRating * 20) +
            ($reviewsCount * 2) +
            ($completedBookingsCount * 3) +
            ($recentBookingsCount * 2),
            2
        );

        return [
            'completed_bookings_count' => $completedBookingsCount,
            'recent_bookings_count' => $recentBookingsCount,
            'reviews_count' => $reviewsCount,
            'average_rating' => $averageRating,
            'top_score' => $topScore,
            'is_qualified' => $isQualified,
            'criteria' => [
                'is_active' => $isActive,
                'supplier_is_approved' => $supplierIsApproved,
                'has_enough_bookings' => $hasEnoughBookings,
                'has_enough_reviews' => $hasEnoughReviews,
                'has_high_rating' => $hasHighRating,
            ],
        ];
    }

    /**
     * Synchronize performance score and automatic Top Package status.
     */
    public function syncPerformanceAndTopStatus(): array
    {
        $metrics = $this->calculatePerformanceMetrics();

        // Update score
        $this->top_score = $metrics['top_score'];

        // Automatically mark as Top Package if not manually excluded by admin
        if (! $this->is_ranking_excluded) {
            $this->is_top_package = $metrics['is_qualified'];
            $this->is_featured = $metrics['is_qualified'];
        }

        $this->save();

        return $metrics;
    }
}
