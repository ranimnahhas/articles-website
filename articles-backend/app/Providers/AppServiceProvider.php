<?php

namespace App\Providers;

use App\Services\ArticleService;
use App\Services\CategoryService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // 🔥 تصحيح الـ Service Binding
        $this->app->bind(ArticleService::class, function ($app) {
            return new ArticleService();
        });

        $this->app->bind(CategoryService::class, function ($app) {
            return new CategoryService();
        });
    }

    public function boot(): void
    {
        //
    }
}