<?php

namespace App\Http\Requests\Category;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // تجاهل التحقق من التكامل مؤقتاً
        return [
            'name' => 'required|string|max:255',
            'is_active' => 'sometimes|boolean'
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'اسم التصنيف مطلوب',
            'name.max' => 'اسم التصنيف يجب ألا يتجاوز 255 حرف'
        ];
    }
}