<?php

namespace App\Http\Requests\Article;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required|in:draft,published,archived',
            'published_at' => 'nullable|date'
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'عنوان المقال مطلوب',
            'title.max' => 'العنوان يجب ألا يتجاوز 255 حرف',
            'category_id.required' => 'التصنيف مطلوب',
            'category_id.exists' => 'التصنيف المحدد غير موجود',
            'content.required' => 'محتوى المقال مطلوب',
            'image.image' => 'الملف يجب أن يكون صورة',
            'image.mimes' => 'الصورة يجب أن تكون من نوع: jpeg, png, jpg, gif',
            'image.max' => 'حجم الصورة يجب ألا يتجاوز 2MB',
            'status.required' => 'حالة المقال مطلوبة',
            'status.in' => 'الحالة يجب أن تكون: draft, published, archived'
        ];
    }
}