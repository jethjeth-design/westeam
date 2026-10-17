<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Supplier\CalendarController;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirect the user to Google OAuth consent screen.
     */
    public function redirect(Request $request): RedirectResponse
    {
        $role = $request->query('role');

        if (is_string($role) && in_array($role, ['customer', 'supplier'], true)) {
            $request->session()->put('oauth_intended_role', $role);
        } else {
            $request->session()->forget('oauth_intended_role');
        }

        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle the Google OAuth callback.
     */
    public function callback(Request $request): RedirectResponse
    {
        if ($request->session()->has('google_calendar_connect')) {
            return app(CalendarController::class)->callback($request);
        }

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Throwable $e) {
            Log::error('Google OAuth callback failed: '.$e->getMessage(), [
                'exception' => $e,
            ]);

            $intendedRole = $request->session()->get('oauth_intended_role');
            $redirectRoute = match ($intendedRole) {
                'supplier' => 'supplier.register',
                'customer' => 'register',
                default => 'login',
            };

            return redirect()->route($redirectRoute)->withErrors([
                'email' => 'Unable to authenticate with Google. Please try again.',
            ]);
        }

        $googleId = (string) $googleUser->getId();
        $googleEmail = (string) $googleUser->getEmail();

        if (empty($googleId) || empty($googleEmail)) {
            return redirect()->route('login')->withErrors([
                'email' => 'Your Google account did not return a valid identifier or email address.',
            ]);
        }

        // Validate Google email verification flag if present
        $rawUser = is_array($googleUser->user) ? $googleUser->user : [];
        $isVerified = null;
        if (array_key_exists('email_verified', $rawUser)) {
            $isVerified = filter_var($rawUser['email_verified'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        } elseif (array_key_exists('verified_email', $rawUser)) {
            $isVerified = filter_var($rawUser['verified_email'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }

        if ($isVerified === false) {
            return redirect()->route('login')->withErrors([
                'email' => 'Your Google email address has not been verified by Google. Please verify it before continuing.',
            ]);
        }

        // Retrieve and consume registration intent
        $intendedRole = $request->session()->pull('oauth_intended_role');
        if (! in_array($intendedRole, ['customer', 'supplier'], true)) {
            $intendedRole = null;
        }

        // 1. Check if user already exists by Google ID or by email
        $user = User::where('google_id', $googleId)->first();

        if (! $user) {
            $user = User::where('email', $googleEmail)->first();
        }

        if ($user) {
            // Prevent changing existing role when registering with a conflicting intent
            if ($intendedRole !== null && $user->role !== $intendedRole) {
                $roleName = ucfirst($user->role);

                return redirect()->route('login')->withErrors([
                    'email' => "An account with this email already exists as a {$roleName} account. Please sign in with your credentials or existing login.",
                ]);
            }

            // Link Google account and backfill avatar or verification without duplicates
            $updates = [];
            if (empty($user->google_id)) {
                $updates['google_id'] = $googleId;
            }
            if (empty($user->avatar) && $googleUser->getAvatar()) {
                $updates['avatar'] = $googleUser->getAvatar();
            }
            if (empty($user->email_verified_at)) {
                $updates['email_verified_at'] = now();
            }
            if (! empty($updates)) {
                $user->update($updates);
            }

            // Ensure existing suppliers have a supplier profile
            if ($user->role === 'supplier' && ! $user->supplierProfile()->exists()) {
                $user->supplierProfile()->create([
                    'status' => 'pending',
                    'rejection_reason' => null,
                ]);
            }

            Auth::login($user, remember: true);
            $request->session()->regenerate();

            return match ($user->role) {
                'admin' => redirect()->intended(route('admin.dashboard', absolute: false)),
                'supplier' => redirect()->intended(route('supplier.dashboard', absolute: false)),
                'customer' => redirect()->intended(route('customer.dashboard', absolute: false)),
                default => redirect()->intended(route('dashboard', absolute: false)),
            };
        }

        // 2. New user registration: Supplier
        if ($intendedRole === 'supplier') {
            $user = User::create([
                'name' => $googleUser->getName() ?: explode('@', $googleEmail)[0],
                'email' => $googleEmail,
                'role' => 'supplier',
                'google_id' => $googleId,
                'avatar' => $googleUser->getAvatar(),
                'email_verified_at' => now(),
                'password' => Hash::make(Str::random(32)),
            ]);

            $user->supplierProfile()->create([
                'status' => 'pending',
                'rejection_reason' => null,
            ]);

            event(new Registered($user));

            NotificationService::notifyAdminNewSupplier($user);

            Auth::login($user, remember: true);
            $request->session()->regenerate();

            return redirect()->route('supplier.dashboard');
        }

        // 3. New user registration: Customer (default, never allow admin registration)
        $user = User::create([
            'name' => $googleUser->getName() ?: explode('@', $googleEmail)[0],
            'email' => $googleEmail,
            'role' => 'customer',
            'google_id' => $googleId,
            'avatar' => $googleUser->getAvatar(),
            'email_verified_at' => now(),
            'password' => Hash::make(Str::random(32)),
        ]);

        event(new Registered($user));

        NotificationService::notifyAdminNewCustomer($user);

        Auth::login($user, remember: true);
        $request->session()->regenerate();

        return redirect()->route('customer.dashboard');
    }
}
