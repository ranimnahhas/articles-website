<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ArticleController;
use App\Http\Controllers\ContactMessageController;
use Illuminate\Http\Request;
use App\Http\Controllers\CommentController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    
    // Public routes - للزوار
    Route::post('/admin/login', [AdminController::class, 'login']);
  
    // Public comments routes - تعليقات الزوار
    Route::prefix('comments')->group(function () {
        Route::get('/article/{articleId}', [CommentController::class, 'getArticleComments']);
        Route::post('/', [CommentController::class, 'store']);
    });
    Route::post('/contact', [ContactMessageController::class, 'store']);

    // Protected admin routes - routes المحمية بالإدمن
   Route::middleware('auth:sanctum')->group(function () {
        Route::get('/admin/profile', [AdminController::class, 'getProfile']);
        // 🔥 إضافة routes إدارة التعليقات هنا
        Route::prefix('admin/comments')->group(function () {
            // إدارة التعليقات
            Route::get('/', [CommentController::class, 'index']);
            Route::get('/pending', [CommentController::class, 'pendingComments']);
            Route::get('/{id}', [CommentController::class, 'show']);
            Route::put('/{id}/status', [CommentController::class, 'updateStatus'])->name('admin.comments.update-status');
            Route::delete('/{id}', [CommentController::class, 'destroy'])->name('admin.comments.destroy');
            
          
            // إدارة تعليقات المقالات
            Route::put('/article/{articleId}/enable', [CommentController::class, 'enableArticleComments'])->name('admin.comments.enable');
            Route::put('/article/{articleId}/disable', [CommentController::class, 'disableArticleComments'])->name('admin.comments.disable');
        });

        // Admin CRUD routes
        Route::get('/admins', [AdminController::class, 'index']);
        Route::post('/admins', [AdminController::class, 'store']);
        Route::get('/admins/{id}', [AdminController::class, 'show']);
        Route::put('/admins/{id}', [AdminController::class, 'update']);
        Route::delete('/admins/{id}', [AdminController::class, 'destroy']);
        
        // Auth routes
        Route::post('/admin/logout', [AdminController::class, 'logout']);

        // Categories routes
        Route::prefix('categories')->group(function () {
            Route::get('/', [CategoryController::class, 'index']);
            Route::post('/', [CategoryController::class, 'store']);
            Route::get('/active', [CategoryController::class, 'getActiveCategories']);
            Route::put('/{id}', [CategoryController::class, 'update']);
            Route::post('/{id}/activate', [CategoryController::class, 'activate']);
            Route::post('/{id}/deactivate', [CategoryController::class, 'deactivate']);
        });

        // Articles routes
        Route::apiResource('articles', ArticleController::class);
        Route::post('/articles/{article}/publish', [ArticleController::class, 'publish']);
        Route::post('/articles/{article}/unpublish', [ArticleController::class, 'unpublish']);
        Route::post('/articles/{article}/increment-views', [ArticleController::class, 'incrementViews']);
        Route::get('/admin/messages', [ContactMessageController::class, 'index']);
        Route::put('/admin/messages/{id}/reviewed', [ContactMessageController::class, 'markAsReviewed']);
    });
     
    // Public articles routes - مقالات للزوار
    Route::get('/public/articles', [ArticleController::class, 'publicIndex']);
    Route::get('/public/articles/{article}', [ArticleController::class, 'publicShow']);
});