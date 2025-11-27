<?php

namespace App\Providers;

use App\Services\ArticleService;
use App\Services\CategoryService;
use App\Services\ContactMessageService;
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
        
        $this->app->bind(ContactMessageService::class, function ($app) {
            return new ContactMessageService();
        }); 
    }

    public function boot(): void
    {
        //
    }
}