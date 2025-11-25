<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Admin\CategoryController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public routes
    Route::post('/admin/login', [AdminController::class, 'login']);
    
    // 🔥 التصنيفات بدون authentication (مؤقت)
    
    // Protected admin routes (بقية الـ routes محمية)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/admins', [AdminController::class, 'index']);
        Route::post('/admins', [AdminController::class, 'store']);
        Route::get('/admins/{id}', [AdminController::class, 'show']);
        Route::put('/admins/{id}', [AdminController::class, 'update']);
        Route::delete('/admins/{id}', [AdminController::class, 'destroy']);
        Route::post('/admin/logout', [AdminController::class, 'logout']);
     Route::prefix('categories')->group(function () {
        Route::get('/', [CategoryController::class, 'index']);
        Route::post('/', [CategoryController::class, 'store']);
        Route::post('/{id}/deactivate', [CategoryController::class, 'deactivate']);
    });
    
    });
});