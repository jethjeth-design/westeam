<?php

use App\Http\Controllers\Admin\EventCategoryController;
use App\Http\Controllers\Admin\SupplierCategoryController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Customer\PortfolioController as CustomerPortfolioController;
use App\Http\Controllers\Customer\SupplierDirectoryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Supplier\DashboardController;
use App\Http\Controllers\Supplier\PackageController;
use App\Http\Controllers\Supplier\PortfolioController as SupplierPortfolioController;
use App\Http\Controllers\Supplier\ServiceController;
use App\Http\Controllers\Supplier\SettingsController;
use App\Http\Controllers\Supplier\SupplierProfileController;
use App\Http\Controllers\Supplier\TeamController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

Route::get('/dashboard', function () {

    return match (auth()->user()->role) {

        'admin' => redirect()->route('admin.dashboard'),

        'supplier' => redirect()->route('supplier.dashboard'),

        'customer' => redirect()->route('customer.dashboard'),

        default => abort(403),

    };

})->middleware('auth')->name('dashboard');

/*
|--------------------------------------------------------------------------
| Admin
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:admin'])->group(function () {

    Route::get('/admin/dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('admin.dashboard');

});

/*
|--------------------------------------------------------------------------
| Supplier
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:supplier'])->group(function () {

    Route::get('/supplier/dashboard', function () {
        return Inertia::render('Supplier/Dashboard');
    })->name('supplier.dashboard');

});

/*
|--------------------------------------------------------------------------
| Customer
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:customer'])->group(function () {

    Route::get('/customer/dashboard', function () {
        return Inertia::render('Customer/Dashboard');
    })->name('customer.dashboard');

    // Supplier Directory
    Route::get('/customer/suppliers', [SupplierDirectoryController::class, 'index'])
        ->name('customer.suppliers.index');

    Route::get('/customer/suppliers/{supplier}', [SupplierDirectoryController::class, 'show'])
        ->name('customer.suppliers.show');

    // Portfolio (kept for backward compatibility)
    Route::get('/customer/suppliers/{supplier}/portfolio', [CustomerPortfolioController::class, 'supplierPortfolio'])
        ->name('customer.suppliers.portfolio');

    Route::get('/customer/portfolios/{portfolio}', [CustomerPortfolioController::class, 'show'])
        ->name('customer.portfolios.show');

});

// Public Supplier Portfolio Showcase
Route::get('/suppliers/{supplier}/portfolio', [CustomerPortfolioController::class, 'supplierPortfolio'])
    ->name('suppliers.portfolio.show');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Supplier Create Package
Route::middleware(['auth'])
    ->prefix('supplier')
    ->name('supplier.')
    ->group(function () {

        Route::resource('packages', PackageController::class)
            ->except(['show']);
    });

// Supplier Create Service
Route::middleware(['auth', 'role:supplier'])
    ->prefix('supplier')
    ->name('supplier.')
    ->group(function () {

        Route::resource('services', ServiceController::class)
            ->except(['show']);

    });
// Admin Create Event Category
Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        Route::resource('event-categories', EventCategoryController::class)
            ->except(['show']);

    });
// Admin Create Supplier Category
Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        Route::resource('supplier-categories', SupplierCategoryController::class)
            ->except(['show']);

    });

// Supplier Profile
Route::middleware(['auth'])
    ->prefix('supplier')
    ->name('supplier.')
    ->group(function () {

        // Supplier Settings
        Route::get('/settings', [SettingsController::class, 'index'])
            ->name('settings');

        // Supplier Business Profile
        Route::get('/business-profile', [SupplierProfileController::class, 'edit'])
            ->name('business-profile.edit');

        Route::post('/business-profile', [SupplierProfileController::class, 'update'])
            ->name('business-profile.update');

        // Accessible while pending
        Route::get('/dashboard', [
            DashboardController::class,
            'index',
        ])->name('dashboard');

        Route::get('/business-profile', [
            SupplierProfileController::class,
            'edit',
        ])->name('business-profile.edit');

        Route::post('/business-profile', [
            SupplierProfileController::class,
            'update',
        ])->name('business-profile.update');

        // Approval required
        Route::middleware('supplier.approved')->group(function () {

            Route::resource(
                'services',
                ServiceController::class
            );

            Route::resource(
                'packages',
                PackageController::class
            );

            Route::resource(
                'portfolio',
                SupplierPortfolioController::class
            );

            Route::delete(
                'portfolio/{portfolio}/images/{image}',
                [SupplierPortfolioController::class, 'deleteImage']
            )->name('portfolio.images.destroy');

            Route::post(
                'portfolio/{portfolio}/images/{image}/cover',
                [SupplierPortfolioController::class, 'setCoverImage']
            )->name('portfolio.images.cover');

            // Teams & Collaboration Routes
            Route::get('/teams', [TeamController::class, 'index'])
                ->name('teams.index');
            Route::post('/teams', [TeamController::class, 'store'])
                ->name('teams.store');
            Route::get('/teams/{team}', [TeamController::class, 'show'])
                ->name('teams.show');
            Route::put('/teams/{team}', [TeamController::class, 'update'])
                ->name('teams.update');
            Route::delete('/teams/{team}', [TeamController::class, 'destroy'])
                ->name('teams.destroy');

            Route::get('/teams/{team}/search-suppliers', [TeamController::class, 'searchSuppliers'])
                ->name('teams.search-suppliers');
            Route::post('/teams/{team}/invite', [TeamController::class, 'invite'])
                ->name('teams.invite');
            Route::put('/teams/{team}/members/{member}/role', [TeamController::class, 'updateMemberRole'])
                ->name('teams.members.role');
            Route::delete('/teams/{team}/members/{member}', [TeamController::class, 'removeMember'])
                ->name('teams.members.destroy');

            Route::post('/teams/invitations/{member}/accept', [TeamController::class, 'acceptInvitation'])
                ->name('teams.invitations.accept');
            Route::post('/teams/invitations/{member}/decline', [TeamController::class, 'declineInvitation'])
                ->name('teams.invitations.decline');

        });
    });

// Admin Supplier Management
Route::middleware(['auth'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        Route::get('/suppliers', [SupplierController::class, 'index'])
            ->name('suppliers.index');

        Route::get('/suppliers/{supplier}', [SupplierController::class, 'show'])
            ->name('suppliers.show');

        Route::post('/suppliers/{supplier}/approve', [
            SupplierController::class,
            'approve',
        ])->name('suppliers.approve');

        Route::post('/suppliers/{supplier}/reject', [
            SupplierController::class,
            'reject',
        ])->name('suppliers.reject');

    });

// Supplier Dashboard
Route::middleware(['auth'])
    ->prefix('supplier')
    ->name('supplier.')
    ->group(function () {

        Route::get('/dashboard', [
            DashboardController::class,
            'index',
        ])->name('dashboard');

        Route::get('/business-profile', [
            SupplierProfileController::class,
            'edit',
        ])->name('business-profile.edit');

        Route::post('/business-profile', [
            SupplierProfileController::class,
            'update',
        ])->name('business-profile.update');

    });

use App\Http\Controllers\MessageController;

// Universal Messaging Routes (Auth required)
Route::middleware(['auth'])->group(function () {
    Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');
    Route::post('/messages/{conversation}', [MessageController::class, 'store'])->name('messages.store');
    Route::post('/messages/direct/{supplier}', [MessageController::class, 'startDirect'])->name('messages.direct');
    Route::post('/messages/team/{team}/coordinator', [MessageController::class, 'startTeamCoordinatorChat'])->name('messages.team.coordinator');
    Route::get('/messages/team/{team}/internal', [MessageController::class, 'openTeamInternalChat'])->name('messages.team.internal');
});

require __DIR__.'/auth.php';
