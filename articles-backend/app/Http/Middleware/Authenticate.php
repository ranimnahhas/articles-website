<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // ✅ للحل السريع - لا توجيه لـ API
        if ($request->is('api/*')) {
            return null;
        }
        
        // إذا كان طلب ويب عادي، وجه لـ login
        return route('login');
    }
}