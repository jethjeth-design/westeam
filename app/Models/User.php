<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'role',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function packages(): HasMany
    {
        return $this->hasMany(Package::class, 'supplier_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'customer_id');
    }

    public function bookingItems(): HasMany
    {
        return $this->hasMany(BookingItem::class, 'supplier_id');
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'supplier_id');
    }

    public function supplierProfile()
    {
        return $this->hasOne(SupplierProfile::class);
    }

    public function portfolios(): HasMany
    {
        return $this->hasMany(SupplierPortfolio::class, 'supplier_id');
    }

    public function coordinatedTeams(): HasMany
    {
        return $this->hasMany(Team::class, 'coordinator_id');
    }

    public function teamMemberships(): HasMany
    {
        return $this->hasMany(TeamMember::class, 'supplier_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'supplier_id');
    }

    public function reviewsReceived(): HasMany
    {
        return $this->hasMany(Review::class, 'supplier_id');
    }

    public function reviewsGiven(): HasMany
    {
        return $this->hasMany(Review::class, 'customer_id');
    }

    /**
     * Get rating statistics for this supplier.
     *
     * @return array{average: float, count: int, distribution: array<int, int>}
     */
    public function getRatingStats(): array
    {
        $reviews = $this->reviewsReceived()->approved()->get();
        $count = $reviews->count();
        $avg = $count > 0 ? round($reviews->avg('rating'), 1) : 0.0;

        $distribution = [
            5 => $reviews->where('rating', 5)->count(),
            4 => $reviews->where('rating', 4)->count(),
            3 => $reviews->where('rating', 3)->count(),
            2 => $reviews->where('rating', 2)->count(),
            1 => $reviews->where('rating', 1)->count(),
        ];

        return [
            'average' => (float) $avg,
            'count' => $count,
            'distribution' => $distribution,
        ];
    }
}
