<?php

use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\EventCategoryController;
use App\Http\Controllers\Admin\FeaturedSupplierController;
use App\Http\Controllers\Admin\HomepageController as AdminHomepageController;
use App\Http\Controllers\Admin\PackageController as AdminPackageController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\SupplierCategoryController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Admin\TopPackageController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Customer\BookingController as CustomerBookingController;
use App\Http\Controllers\Customer\EventController as CustomerEventController;
use App\Http\Controllers\Customer\PaymentController as CustomerPaymentController;
use App\Http\Controllers\Customer\PortfolioController as CustomerPortfolioController;
use App\Http\Controllers\Customer\ReviewController as CustomerReviewController;
use App\Http\Controllers\Customer\SupplierDirectoryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Public\EventController as PublicEventController;
use App\Http\Controllers\Public\GalleryController as PublicGalleryController;
use App\Http\Controllers\Public\HomeController as PublicHomeController;
use App\Http\Controllers\Public\PackageController as PublicPackageController;
use App\Http\Controllers\Public\SupplierController as PublicSupplierController;
use App\Http\Controllers\Supplier\BookingController as SupplierBookingController;
use App\Http\Controllers\Supplier\DashboardController;
use App\Http\Controllers\Supplier\PackageController;
use App\Http\Controllers\Supplier\PaymentController as SupplierPaymentController;
use App\Http\Controllers\Supplier\PaymentSettingsController as SupplierPaymentSettingsController;
use App\Http\Controllers\Supplier\PortfolioController as SupplierPortfolioController;
use App\Http\Controllers\Supplier\ReviewController as SupplierReviewController;
use App\Http\Controllers\Supplier\ServiceController;
use App\Http\Controllers\Supplier\SettingsController;
use App\Http\Controllers\Supplier\SupplierProfileController;
use App\Http\Controllers\Supplier\TeamController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', [PublicHomeController::class, 'index'])->name('home');
Route::get('/suppliers', [PublicSupplierController::class, 'index'])->name('suppliers.index');
Route::get('/suppliers/{supplier}', [PublicSupplierController::class, 'show'])->name('suppliers.show');
Route::get('/events', [PublicEventController::class, 'index'])->name('events.index');
Route::get('/packages', [PublicPackageController::class, 'index'])->name('packages.index');
Route::get('/packages/{package}', [PublicPackageController::class, 'show'])->name('packages.show');
Route::get('/gallery', [PublicGalleryController::class, 'index'])->name('gallery.index');

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

    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/admin/users', [AdminUserController::class, 'index'])->name('admin.users.index');
    Route::delete('/admin/users/{user}', [AdminUserController::class, 'destroy'])->name('admin.users.destroy');
    Route::get('/admin/customers', [AdminCustomerController::class, 'index'])->name('admin.customers.index');
    Route::get('/admin/bookings', [AdminBookingController::class, 'index'])->name('admin.bookings.index');
    Route::get('/admin/packages', [AdminPackageController::class, 'index'])->name('admin.packages.index');

    // Admin Review Moderation
    Route::get('/admin/reviews', [AdminReviewController::class, 'index'])->name('admin.reviews.index');
    Route::post('/admin/reviews/{review}/approve', [AdminReviewController::class, 'approve'])->name('admin.reviews.approve');
    Route::post('/admin/reviews/{review}/reject', [AdminReviewController::class, 'reject'])->name('admin.reviews.reject');
    Route::delete('/admin/reviews/{review}', [AdminReviewController::class, 'destroy'])->name('admin.reviews.destroy');

    // Admin Featured Supplier Management
    Route::get('/admin/featured-suppliers', [FeaturedSupplierController::class, 'index'])->name('admin.featured-suppliers.index');
    Route::post('/admin/featured-suppliers/{supplier}/feature', [FeaturedSupplierController::class, 'feature'])->name('admin.featured-suppliers.feature');
    Route::post('/admin/featured-suppliers/{supplier}/unfeature', [FeaturedSupplierController::class, 'unfeature'])->name('admin.featured-suppliers.unfeature');
    Route::post('/admin/featured-suppliers/{supplier}/toggle', [FeaturedSupplierController::class, 'toggle'])->name('admin.featured-suppliers.toggle');
    Route::post('/admin/featured-suppliers/{supplier}/restore-auto', [FeaturedSupplierController::class, 'restoreAuto'])->name('admin.featured-suppliers.restore-auto');
    Route::post('/admin/featured-suppliers/recalculate', [FeaturedSupplierController::class, 'recalculate'])->name('admin.featured-suppliers.recalculate');

    // Admin Top Packages Management
    Route::get('/admin/top-packages', [TopPackageController::class, 'index'])->name('admin.top-packages.index');
    Route::post('/admin/top-packages/{package}/feature', [TopPackageController::class, 'feature'])->name('admin.top-packages.feature');
    Route::post('/admin/top-packages/{package}/unfeature', [TopPackageController::class, 'unfeature'])->name('admin.top-packages.unfeature');
    Route::post('/admin/top-packages/{package}/toggle', [TopPackageController::class, 'toggle'])->name('admin.top-packages.toggle');
    Route::post('/admin/top-packages/{package}/restore-auto', [TopPackageController::class, 'restoreAuto'])->name('admin.top-packages.restore-auto');
    Route::post('/admin/top-packages/{package}/toggle-active', [TopPackageController::class, 'toggleActive'])->name('admin.top-packages.toggle-active');
    Route::post('/admin/top-packages/recalculate', [TopPackageController::class, 'recalculate'])->name('admin.top-packages.recalculate');

    // Admin Homepage Management
    Route::get('/admin/homepage', [AdminHomepageController::class, 'index'])->name('admin.homepage.index');
    Route::post('/admin/homepage/banners', [AdminHomepageController::class, 'storeBanner'])->name('admin.homepage.banners.store');
    Route::match(['put', 'post'], '/admin/homepage/banners/{banner}', [AdminHomepageController::class, 'updateBanner'])->name('admin.homepage.banners.update');
    Route::delete('/admin/homepage/banners/{banner}', [AdminHomepageController::class, 'destroyBanner'])->name('admin.homepage.banners.destroy');
    Route::post('/admin/homepage/banners/{banner}/toggle', [AdminHomepageController::class, 'toggleBanner'])->name('admin.homepage.banners.toggle');
    Route::post('/admin/homepage/banners/reorder', [AdminHomepageController::class, 'reorderBanners'])->name('admin.homepage.banners.reorder');
    Route::put('/admin/homepage/sections/{section}', [AdminHomepageController::class, 'updateSection'])->name('admin.homepage.sections.update');
    Route::post('/admin/homepage/sections/{section}/toggle', [AdminHomepageController::class, 'toggleSection'])->name('admin.homepage.sections.toggle');
    Route::post('/admin/homepage/settings', [AdminHomepageController::class, 'updateSettings'])->name('admin.homepage.settings.update');
});

/*
|--------------------------------------------------------------------------
| Supplier
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Customer
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Customer\DashboardController as CustomerDashboardController;

Route::middleware(['auth', 'role:customer'])->group(function () {

    Route::get('/customer/dashboard', [CustomerDashboardController::class, 'index'])
        ->name('customer.dashboard');

    // Customer Bookings
    Route::get('/customer/bookings', [CustomerBookingController::class, 'index'])
        ->name('customer.bookings.index');
    Route::post('/customer/bookings', [CustomerBookingController::class, 'store'])
        ->name('customer.bookings.store');
    Route::get('/customer/bookings/{booking}', [CustomerBookingController::class, 'show'])
        ->name('customer.bookings.show');
    Route::post('/customer/bookings/{booking}/cancel', [CustomerBookingController::class, 'cancel'])
        ->name('customer.bookings.cancel');

    // Customer Reviews
    Route::post('/customer/reviews', [CustomerReviewController::class, 'store'])
        ->name('customer.reviews.store');

    // Customer Events
    Route::get('/customer/events', [CustomerEventController::class, 'index'])
        ->name('customer.events.index');

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

    // Customer Payment Routes
    Route::get('/customer/payments', [CustomerPaymentController::class, 'index'])
        ->name('customer.payments.index');
    Route::get('/customer/payments/create', [CustomerPaymentController::class, 'create'])
        ->name('customer.payments.create');
    Route::get('/customer/bookings/{booking}/pay', [CustomerPaymentController::class, 'create'])
        ->name('customer.bookings.pay');
    Route::post('/customer/payments', [CustomerPaymentController::class, 'store'])
        ->name('customer.payments.store');

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

        Route::match(['put', 'post'], 'event-categories/{event_category}', [EventCategoryController::class, 'update'])->name('event-categories.update-post');
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

            // Bookings Management
            Route::get('/bookings', [SupplierBookingController::class, 'index'])
                ->name('bookings.index');
            Route::post('/bookings/items/{item}/accept', [SupplierBookingController::class, 'accept'])
                ->name('bookings.items.accept');
            Route::post('/bookings/items/{item}/reject', [SupplierBookingController::class, 'reject'])
                ->name('bookings.items.reject');
            Route::post('/bookings/items/{item}/complete', [SupplierBookingController::class, 'complete'])
                ->name('bookings.items.complete');
            Route::post('/bookings/teams/{booking}/accept', [SupplierBookingController::class, 'acceptTeamBooking'])
                ->name('bookings.teams.accept');
            Route::post('/bookings/teams/{booking}/reject', [SupplierBookingController::class, 'rejectTeamBooking'])
                ->name('bookings.teams.reject');

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

            // Reviews Management
            Route::get('/reviews', [SupplierReviewController::class, 'index'])
                ->name('reviews.index');

            // Payments Management & Verification
            Route::get('/payments', [SupplierPaymentController::class, 'index'])
                ->name('payments.index');
            Route::post('/payments/{payment}/verify', [SupplierPaymentController::class, 'verify'])
                ->name('payments.verify');
            Route::post('/payments/{payment}/reject', [SupplierPaymentController::class, 'reject'])
                ->name('payments.reject');

            // Supplier GCash Payment Settings
            Route::get('/payment-settings', [SupplierPaymentSettingsController::class, 'index'])
                ->name('payment-settings');
            Route::post('/payment-settings', [SupplierPaymentSettingsController::class, 'update'])
                ->name('payment-settings.update');

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

use App\Http\Controllers\MessageController;

// Universal Messaging Routes (Auth required)
Route::middleware(['auth'])->group(function () {
    Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');
    Route::post('/messages/{conversation}', [MessageController::class, 'store'])->name('messages.store');
    Route::post('/messages/direct/{supplier}', [MessageController::class, 'startDirect'])->name('messages.direct');
    Route::post('/messages/team/{team}/coordinator', [MessageController::class, 'startTeamCoordinatorChat'])->name('messages.team.coordinator');
    Route::get('/messages/team/{team}/internal', [MessageController::class, 'openTeamInternalChat'])->name('messages.team.internal');
});

use App\Http\Controllers\EmailPreviewController;
use App\Http\Controllers\NotificationController;

// Universal Notification Routes (Auth required)
Route::middleware(['auth'])->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::post('/notifications/clear-read', [NotificationController::class, 'clearAllRead'])->name('notifications.clear-read');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-as-read');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::get('/notifications/{id}/go', [NotificationController::class, 'readAndRedirect'])->name('notifications.go');

    // Role-specific aliases redirecting to unified notifications center
    Route::get('/supplier/notifications', fn () => redirect()->route('notifications.index'))->name('supplier.notifications');
    Route::get('/admin/notifications', fn () => redirect()->route('notifications.index'))->name('admin.notifications');
    Route::get('/customer/notifications', fn () => redirect()->route('notifications.index'))->name('customer.notifications');
});

// Email Notification Visual Previews
Route::get('/email-previews/{template?}', [EmailPreviewController::class, 'show'])->name('email-previews.show');

require __DIR__.'/auth.php';
