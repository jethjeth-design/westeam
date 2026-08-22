<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TeamController extends Controller
{
    /**
     * Display listing of teams (coordinated + member of).
     */
    public function index()
    {
        $userId = Auth::id();

        // Teams where current user is the Coordinator
        $coordinatedTeams = Team::with([
            'members.supplier.supplierProfile.categories',
            'packages.services',
        ])
            ->where('coordinator_id', $userId)
            ->latest()
            ->get();

        // Teams where current user is an invited/accepted member
        $myMemberships = TeamMember::with([
            'team.coordinator.supplierProfile.categories',
            'team.members.supplier.supplierProfile.categories',
            'team.packages',
        ])
            ->where('supplier_id', $userId)
            ->whereHas('team', function ($query) use ($userId) {
                $query->where('coordinator_id', '!=', $userId);
            })
            ->latest()
            ->get();

        return Inertia::render('Supplier/Teams/Index', [
            'coordinatedTeams' => $coordinatedTeams,
            'myMemberships' => $myMemberships,
        ]);
    }

    /**
     * Store a new team created by the coordinator.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $team = Team::create([
            'coordinator_id' => Auth::id(),
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => 'active',
        ]);

        // Add the creator as the first accepted Team Member with 'Coordinator' role
        TeamMember::create([
            'team_id' => $team->id,
            'supplier_id' => Auth::id(),
            'role_title' => 'Coordinator',
            'status' => 'accepted',
            'invited_at' => now(),
            'responded_at' => now(),
        ]);

        return redirect()->route('supplier.teams.show', $team->id)
            ->with('success', 'Team created successfully! You can now invite other registered suppliers.');
    }

    /**
     * Display a specific team and its roster / packages.
     */
    public function show(Team $team)
    {
        $userId = Auth::id();

        // Check if user is either the coordinator or an accepted/pending member
        $isCoordinator = $team->coordinator_id === $userId;
        $membership = TeamMember::where('team_id', $team->id)
            ->where('supplier_id', $userId)
            ->first();

        abort_if(! $isCoordinator && ! $membership, 403, 'You do not have permission to view this team.');

        $team->load([
            'coordinator.supplierProfile.categories',
            'members.supplier.supplierProfile.categories',
            'members.supplier.services' => function ($q) {
                $q->where('is_active', true);
            },
            'packages.services',
            'packages.eventCategory',
        ]);

        return Inertia::render('Supplier/Teams/Show', [
            'team' => $team,
            'isCoordinator' => $isCoordinator,
            'userMembership' => $membership,
        ]);
    }

    /**
     * Update team details (Coordinator only).
     */
    public function update(Request $request, Team $team)
    {
        abort_if($team->coordinator_id !== Auth::id(), 403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'status' => 'required|in:active,inactive',
        ]);

        $team->update($validated);

        return back()->with('success', 'Team details updated successfully.');
    }

    /**
     * Delete team (Coordinator only).
     */
    public function destroy(Team $team)
    {
        abort_if($team->coordinator_id !== Auth::id(), 403);

        $team->delete();

        return redirect()->route('supplier.teams.index')
            ->with('success', 'Team deleted successfully.');
    }

    /**
     * Search available approved suppliers to invite.
     */
    public function searchSuppliers(Request $request, Team $team)
    {
        abort_if($team->coordinator_id !== Auth::id(), 403);

        $query = $request->input('query', '');

        // Existing team member IDs to exclude
        $existingSupplierIds = $team->members()->pluck('supplier_id')->toArray();

        $suppliers = User::query()
            ->where('role', 'supplier')
            ->where('id', '!=', Auth::id())
            ->whereNotIn('id', $existingSupplierIds)
            ->whereHas('supplierProfile', function ($q) {
                $q->where('status', 'approved');
            })
            ->with(['supplierProfile.categories', 'services' => function ($q) {
                $q->where('is_active', true);
            }])
            ->when($query, function ($q) use ($query) {
                $q->where(function ($sub) use ($query) {
                    $sub->where('name', 'like', "%{$query}%")
                        ->orWhereHas('supplierProfile', function ($p) use ($query) {
                            $p->where('business_name', 'like', "%{$query}%")
                                ->orWhereHas('categories', function ($cat) use ($query) {
                                    $cat->where('name', 'like', "%{$query}%");
                                });
                        });
                });
            })
            ->limit(10)
            ->get();

        return response()->json($suppliers);
    }

    /**
     * Invite a supplier to the team (Coordinator only).
     */
    public function invite(Request $request, Team $team)
    {
        abort_if($team->coordinator_id !== Auth::id(), 403);

        $validated = $request->validate([
            'supplier_id' => 'required|exists:users,id',
            'role_title' => 'nullable|string|max:100',
        ]);

        // Check if supplier is already in the team
        $existing = TeamMember::where('team_id', $team->id)
            ->where('supplier_id', $validated['supplier_id'])
            ->first();

        if ($existing) {
            if ($existing->status === 'declined') {
                $existing->update([
                    'status' => 'pending',
                    'role_title' => $validated['role_title'] ?? 'Member',
                    'invited_at' => now(),
                    'responded_at' => null,
                ]);

                return back()->with('success', 'Invitation re-sent successfully!');
            }

            return back()->with('error', 'Supplier is already in this team.');
        }

        TeamMember::create([
            'team_id' => $team->id,
            'supplier_id' => $validated['supplier_id'],
            'role_title' => $validated['role_title'] ?? 'Member',
            'status' => 'pending',
            'invited_at' => now(),
        ]);

        return back()->with('success', 'Supplier invited successfully!');
    }

    /**
     * Update member's role title (Coordinator only).
     */
    public function updateMemberRole(Request $request, Team $team, TeamMember $member)
    {
        abort_if($team->coordinator_id !== Auth::id() || $member->team_id !== $team->id, 403);

        $validated = $request->validate([
            'role_title' => 'required|string|max:100',
        ]);

        $member->update([
            'role_title' => $validated['role_title'],
        ]);

        return back()->with('success', 'Member role updated successfully.');
    }

    /**
     * Remove a member from the team.
     */
    public function removeMember(Team $team, TeamMember $member)
    {
        // Coordinator can remove any member (except self); Member can remove self (leave team)
        $userId = Auth::id();
        $isCoordinator = $team->coordinator_id === $userId;
        $isSelf = $member->supplier_id === $userId;

        abort_if(! $isCoordinator && ! $isSelf, 403);
        abort_if($member->team_id !== $team->id, 404);

        if ($member->supplier_id === $team->coordinator_id) {
            return back()->with('error', 'Team Coordinator cannot leave or be removed. Transfer or delete the team instead.');
        }

        $member->delete();

        return back()->with('success', 'Team member removed.');
    }

    /**
     * Accept a team invitation.
     */
    public function acceptInvitation(TeamMember $member)
    {
        abort_if($member->supplier_id !== Auth::id(), 403);

        $member->update([
            'status' => 'accepted',
            'responded_at' => now(),
        ]);

        return back()->with('success', 'You have joined the team!');
    }

    /**
     * Decline a team invitation.
     */
    public function declineInvitation(TeamMember $member)
    {
        abort_if($member->supplier_id !== Auth::id(), 403);

        $member->update([
            'status' => 'declined',
            'responded_at' => now(),
        ]);

        return back()->with('success', 'Invitation declined.');
    }
}
