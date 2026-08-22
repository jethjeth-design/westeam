<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Customer registration page.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Customer registration.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',

            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                'unique:'.User::class,
            ],

            'password' => [
                'required',
                'confirmed',
                Rules\Password::defaults(),
            ],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),

            // Default registration = customer
            'role' => 'customer',
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('dashboard');
    }

    /*
    |--------------------------------------------------------------------------
    | SUPPLIER REGISTRATION
    |--------------------------------------------------------------------------
    */

    /**
     * Supplier registration page.
     */
    public function supplierCreate(): Response
    {
        return Inertia::render('Auth/SupplierRegister');
    }

    /**
     * Supplier registration.
     *
     * @throws ValidationException
     */
    public function supplierStore(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',

            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                'unique:'.User::class,
            ],

            'password' => [
                'required',
                'confirmed',
                Rules\Password::defaults(),
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Create Supplier Account
        |--------------------------------------------------------------------------
        */

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'supplier',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Create Supplier Profile
        |--------------------------------------------------------------------------
        |
        | Create the profile ONLY ONCE.
        |
        */

        $user->supplierProfile()->create([
            'status' => 'pending',
            'rejection_reason' => null,
        ]);

        /*
        |--------------------------------------------------------------------------
        | Registered Event
        |--------------------------------------------------------------------------
        */

        event(new Registered($user));

        /*
        |--------------------------------------------------------------------------
        | Login Supplier
        |--------------------------------------------------------------------------
        */

        Auth::login($user);

        /*
        |--------------------------------------------------------------------------
        | Redirect to Supplier Dashboard
        |--------------------------------------------------------------------------
        */

        return redirect()->route('supplier.dashboard');
    }
}
