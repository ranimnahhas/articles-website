<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'article_id' => 'required|exists:articles,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'content' => 'required|string|min:10|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'article_id.required' => 'معرف المقالة مطلوب.',
            'article_id.exists' => 'المقالة المحددة غير موجودة.',
            'name.required' => 'الاسم مطلوب.',
            'name.max' => 'الاسم يجب ألا يتجاوز 255 حرف.',
            'email.required' => 'البريد الإلكتروني مطلوب.',
            'email.email' => 'البريد الإلكتروني غير صالح.',
            'email.max' => 'البريد الإلكتروني يجب ألا يتجاوز 255 حرف.',
            'content.required' => 'محتوى التعليق مطلوب.',
            'content.min' => 'محتوى التعليق يجب أن يكون على الأقل 10 أحرف.',
            'content.max' => 'محتوى التعليق يجب ألا يتجاوز 1000 حرف.',
        ];
    }
}