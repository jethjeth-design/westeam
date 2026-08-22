<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SupplierApproved
{
    /**
     * Handle an incoming request.
     */
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        $user = $request->user();

        // User must be logged in
        if (! $user) {
            abort(403);
        }

        // User must be a supplier
        if ($user->role !== 'supplier') {
            abort(403);
        }

        // Get supplier profile
        $profile = $user->supplierProfile;

        // Supplier profile does not exist
        if (! $profile) {
            return redirect()->route(
                'supplier.business-profile.edit'
            );
        }

        // Supplier must be approved
        if ($profile->status !== 'approved') {
            return redirect()
                ->route('supplier.dashboard')
                ->with(
                    'error',
                    'Your supplier account must be approved before accessing this feature.'
                );
        }

        return $next($request);
    }
}
