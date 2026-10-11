<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Api;
use App\Http\Controllers\StripeWebhookController;
use Illuminate\Support\Facades\Route;

// Public catalog
Route::get('/products', [Api\ProductController::class, 'index']);
Route::get('/products/{slug}', [Api\ProductController::class, 'show']);
Route::get('/categories', [Api\CategoryController::class, 'index']);
Route::get('/brands', [Api\BrandController::class, 'index']);
Route::get('/config', [Api\CheckoutController::class, 'config']);
Route::post('/checkout/coupon', [Api\CheckoutController::class, 'coupon']);

// Auth
Route::post('/auth/register', [Api\AuthController::class, 'register']);
Route::post('/auth/login', [Api\AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [Api\AuthController::class, 'logout']);
    Route::get('/auth/me', [Api\AuthController::class, 'me']);
    Route::post('/checkout/order', [Api\CheckoutController::class, 'placeOrder']);
    Route::get('/orders', [Api\OrderController::class, 'index']);
    Route::get('/orders/{id}', [Api\OrderController::class, 'show']);
});

// Stripe webhook
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);

// Admin dashboard
Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/stats', [Admin\StatsController::class, 'index']);

    Route::apiResource('categories', Admin\AdminCategoryController::class)->names('admin.categories');
    Route::apiResource('brands', Admin\AdminBrandController::class)->names('admin.brands');
    Route::apiResource('coupons', Admin\AdminCouponController::class)->names('admin.coupons');

    Route::get('/orders', [Admin\AdminOrderController::class, 'index'])->name('admin.orders.index');
    Route::get('/orders/{order}', [Admin\AdminOrderController::class, 'show'])->name('admin.orders.show');
    Route::patch('/orders/{order}/status', [Admin\AdminOrderController::class, 'updateStatus'])->name('admin.orders.status');
    Route::get('/customers', [Admin\AdminOrderController::class, 'customers'])->name('admin.customers');

    Route::post('/upload-image', [Admin\AdminProductController::class, 'uploadImage'])->name('admin.upload');
    Route::apiResource('products', Admin\AdminProductController::class)->names('admin.products');
});
