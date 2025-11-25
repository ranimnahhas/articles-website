<?php

namespace App\Http\Requests\Category;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
{
    // ✅ الحل البديل الآمن تماماً
    $categoryId = $this->id ?: last($this->segments());

    return [
        'name' => [
            'required',
            'string',
            'max:255',
            Rule::unique('categories')->ignore($categoryId)
        ],
        'is_active' => 'sometimes|boolean'
    ];
}

    public function messages(): array
    {
        return [
            'name.required' => 'اسم التصنيف مطلوب',
            'name.unique' => 'هذا التصنيف موجود مسبقاً',
            'name.max' => 'اسم التصنيف يجب ألا يتجاوز 255 حرف'
        ];
    }
}