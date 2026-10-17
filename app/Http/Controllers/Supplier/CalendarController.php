<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\SupplierCalendarAccount;
use App\Models\User;
use App\Services\GoogleCalendarService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class CalendarController extends Controller
{
    public function __construct(
        protected GoogleCalendarService $calendarService
    ) {}

    /**
     * Redirect supplier to Google OAuth consent screen to authorize Calendar access.
     */
    public function connect(Request $request): RedirectResponse
    {
        if (! GoogleCalendarService::isConfigured()) {
            return back()->with('error', 'Google OAuth credentials are not configured in system settings or environment.');
        }

        $request->session()->put('google_calendar_connect', true);
        $request->session()->put('google_calendar_supplier_id', $request->user()->id);

        $redirectUri = $this->resolveRedirectUri();

        try {
            return Socialite::driver('google')
                ->scopes([
                    'openid',
                    'profile',
                    'email',
                    'https://www.googleapis.com/auth/calendar.events',
                ])
                ->with([
                    'access_type' => 'offline',
                    'prompt' => 'consent select_account',
                ])
                ->redirectUrl($redirectUri)
                ->redirect();
        } catch (Throwable $e) {
            Log::error('Failed to initiate Google Calendar OAuth: '.$e->getMessage());

            return back()->with('error', 'Unable to initiate Google Calendar connection: '.$e->getMessage());
        }
    }

    /**
     * Handle the callback from Google OAuth.
     */
    public function callback(Request $request): RedirectResponse
    {
        $supplier = $request->user();

        // If user is not logged in in this session, recover from session if needed
        if (! $supplier && $request->session()->has('google_calendar_supplier_id')) {
            $supplierId = $request->session()->get('google_calendar_supplier_id');
            $supplier = User::find($supplierId);
            if ($supplier) {
                auth()->login($supplier);
            }
        }

        if (! $supplier || $supplier->role !== 'supplier') {
            return redirect()->route('login')->with('error', 'Authentication required to link Google Calendar.');
        }

        $redirectUri = $this->resolveRedirectUri();

        try {
            $googleUser = Socialite::driver('google')
                ->redirectUrl($redirectUri)
                ->user();
        } catch (Throwable $e) {
            Log::error('Google Calendar OAuth callback error: '.$e->getMessage());

            return redirect()->route('supplier.availability.index')->with('error', 'Google Calendar authorization was cancelled or failed.');
        }

        $token = $googleUser->token;
        $refreshToken = $googleUser->refreshToken;
        $expiresIn = $googleUser->expiresIn ?? 3600;

        $existingAccount = $supplier->calendarAccount;

        // If no new refresh token returned, preserve the existing one
        if (empty($refreshToken) && $existingAccount && ! empty($existingAccount->refresh_token)) {
            $refreshToken = $existingAccount->refresh_token;
        }

        SupplierCalendarAccount::updateOrCreate(
            ['supplier_id' => $supplier->id],
            [
                'google_id' => $googleUser->getId(),
                'google_email' => $googleUser->getEmail(),
                'access_token' => $token,
                'refresh_token' => $refreshToken,
                'expires_at' => now()->addSeconds($expiresIn),
                'calendar_id' => 'primary',
                'is_connected' => true,
                'last_synced_at' => now(),
            ]
        );

        $request->session()->forget(['google_calendar_connect', 'google_calendar_supplier_id']);

        // Immediately sync all existing confirmed bookings
        $syncResult = $this->calendarService->syncAllSupplierBookings($supplier);

        $syncedCount = $syncResult['synced'];
        $message = "Google Calendar connected successfully ({$googleUser->getEmail()})! {$syncedCount} confirmed booking(s) synced.";

        return redirect()->route('supplier.availability.index')->with('success', $message);
    }

    /**
     * Disconnect the supplier's Google Calendar.
     */
    public function disconnect(Request $request): RedirectResponse
    {
        $supplier = $request->user();
        $account = $supplier->calendarAccount;

        if ($account) {
            $account->update([
                'is_connected' => false,
                'access_token' => null,
                'refresh_token' => null,
                'expires_at' => null,
            ]);
        }

        return redirect()->route('supplier.availability.index')->with('success', 'Google Calendar disconnected.');
    }

    /**
     * Manually trigger re-synchronization of all supplier bookings with Google Calendar.
     */
    public function syncAll(Request $request): RedirectResponse
    {
        $supplier = $request->user();
        $account = $supplier->calendarAccount;

        if (! $account || ! $account->is_connected) {
            return back()->with('error', 'Google Calendar is not connected. Please connect your account first.');
        }

        $result = $this->calendarService->syncAllSupplierBookings($supplier);

        return back()->with('success', "Google Calendar synchronization completed: {$result['synced']} booking(s) up to date.");
    }

    /**
     * Resolve the Google OAuth redirect URI.
     */
    protected function resolveRedirectUri(): string
    {
        $uri = config('services.google.calendar_redirect') ?: '/supplier/calendar/callback';

        if (str_starts_with($uri, 'http://') || str_starts_with($uri, 'https://')) {
            return $uri;
        }

        return url($uri);
    }
}
