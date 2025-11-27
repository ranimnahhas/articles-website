<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class ContactMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|min:2',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:500|min:5',
            'message' => 'required|string|min:10',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'حقل الاسم مطلوب',
            'name.min' => 'الاسم يجب أن يكون على الأقل حرفين',
            'email.required' => 'حقل البريد الإلكتروني مطلوب',
            'email.email' => 'صيغة البريد الإلكتروني غير صحيحة',
            'subject.required' => 'حقل الموضوع مطلوب',
            'subject.min' => 'الموضوع يجب أن يكون على الأقل 5 أحرف',
            'message.required' => 'حقل الرسالة مطلوب',
            'message.min' => 'الرسالة يجب أن تكون على الأقل 10 أحرف',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        $response = [
            'success' => false,
            'message' => 'فشل التحقق من البيانات',
            'errors' => $validator->errors()
        ];

        throw new HttpResponseException(
            response()->json($response, 422)
        );
    }
}