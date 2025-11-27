<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // استخدم auth:sanctum بدلاً من auth:admin
        return auth('sanctum')->check();
    }

    public function rules(): array
    {
        $currentRoute = $this->route()->getName();
        
        if (str_contains($currentRoute, 'update-status')) {
            return [
                'status' => 'required|in:approved,rejected',
            ];
        }

        // للـ enable/disable لا نحتاج rules
        return [];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'حالة التعليق مطلوبة.',
            'status.in' => 'الحالة يجب أن تكون approved أو rejected.',
        ];
    }
}