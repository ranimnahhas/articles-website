<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ArticleController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public routes
    Route::post('/admin/login', [AdminController::class, 'login']);
    
  
    
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
        Route::get('/active', [CategoryController::class, 'getActiveCategories']); 
          // 🔥 استخدم {category} لتفعيل Route Model Binding
    Route::put('/{id}', [CategoryController::class, 'update']);
    Route::post('/{id}/activate', [CategoryController::class, 'activate']);
    Route::post('/{id}/deactivate', [CategoryController::class, 'deactivate']);
});
     Route::apiResource('articles', ArticleController::class);
    Route::post('/articles/{article}/publish', [ArticleController::class, 'publish']);
    Route::post('/articles/{article}/unpublish', [ArticleController::class, 'unpublish']);
    Route::post('/articles/{article}/increment-views', [ArticleController::class, 'incrementViews']);
   
    
    });
    
// 🔓 روابط عامة للمقالات
Route::get('/public/articles', [ArticleController::class, 'publicIndex']);
Route::get('/public/articles/{article}', [ArticleController::class, 'publicShow']);
});