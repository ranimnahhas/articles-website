<?php

use App\Http\Controllers\Api\AdminController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public routes
    Route::post('/admin/login', [AdminController::class, 'login'])->name('login');
    
    // Protected admin routes
    Route::middleware('auth:sanctum')->group(function () {
        // Admin CRUD routes (مفصولة)
        Route::get('/admins', [AdminController::class, 'index']);          // عرض الكل
        Route::post('/admins', [AdminController::class, 'store']);         // إنشاء جديد
        Route::get('/admins/{id}', [AdminController::class, 'show']);      // عرض واحد
        Route::put('/admins/{id}', [AdminController::class, 'update']);    // تحديث
        Route::delete('/admins/{id}', [AdminController::class, 'destroy']); // حذف
        
        // Auth routes
        Route::post('/admin/logout', [AdminController::class, 'logout']);
    });
});