<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'coordinator_id',
        'name',
        'description',
        'status',
    ];

    /**
     * Coordinator of the team.
     */
    public function coordinator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'coordinator_id');
    }

    /**
     * All team member entries.
     */
    public function members(): HasMany
    {
        return $this->hasMany(TeamMember::class);
    }

    /**
     * Accepted team members only.
     */
    public function acceptedMembers(): HasMany
    {
        return $this->hasMany(TeamMember::class)->where('status', 'accepted');
    }

    /**
     * Packages created for this team.
     */
    public function packages(): HasMany
    {
        return $this->hasMany(Package::class, 'team_id');
    }
}
