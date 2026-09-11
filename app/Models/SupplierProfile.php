<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'is_featured',
        'is_ranking_excluded',
        'featured_score',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'is_ranking_excluded' => 'boolean',
            'featured_score' => 'float',
            'years_of_experience' => 'integer',
        ];
    }

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

    /**
     * Booking items associated with this supplier.
     */
    public function bookingItems(): HasMany
    {
        return $this->hasMany(BookingItem::class, 'supplier_id', 'user_id');
    }

    /**
     * Reviews received by this supplier.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'supplier_id', 'user_id');
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
     * Calculate supplier performance metrics and score.
     */
    public function calculatePerformanceMetrics(): array
    {
        // 1. Completed bookings count (distinct completed bookings or items)
        $completedBookingsCount = $this->bookingItems()
            ->where(function ($q) {
                $q->where('status', 'completed')
                    ->orWhereHas('booking', function ($b) {
                        $b->where('overall_status', 'completed');
                    });
            })
            ->distinct('booking_id')
            ->count('booking_id');

        // 2. Approved reviews from completed bookings
        $reviewsQuery = $this->completedBookingReviewsQuery();
        $reviewsCount = $reviewsQuery->count();
        $averageRating = $reviewsCount > 0 ? round((float) $reviewsQuery->avg('rating'), 2) : 0.0;

        // 3. Qualification rule check:
        // - Approved supplier
        // - Active supplier profile (status === 'approved')
        // - At least 5 completed bookings
        // - At least 5 customer reviews
        // - Average rating of at least 4.5 stars
        $isApproved = $this->status === 'approved';
        $hasEnoughBookings = $completedBookingsCount >= 5;
        $hasEnoughReviews = $reviewsCount >= 5;
        $hasHighRating = $averageRating >= 4.5;
        $isQualified = $isApproved && $hasEnoughBookings && $hasEnoughReviews && $hasHighRating;

        // 4. Featured Score calculation:
        // Weighted composite score: rating * 20 + reviews * 2 + completed bookings * 3
        $featuredScore = round(($averageRating * 20) + ($reviewsCount * 2) + ($completedBookingsCount * 3), 2);

        return [
            'completed_bookings_count' => $completedBookingsCount,
            'reviews_count' => $reviewsCount,
            'average_rating' => $averageRating,
            'featured_score' => $featuredScore,
            'is_qualified' => $isQualified,
            'criteria' => [
                'is_approved' => $isApproved,
                'has_enough_bookings' => $hasEnoughBookings,
                'has_enough_reviews' => $hasEnoughReviews,
                'has_high_rating' => $hasHighRating,
            ],
        ];
    }
}
