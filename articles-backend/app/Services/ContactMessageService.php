<?php

namespace App\Services;

use App\Models\ContactMessage;
use Illuminate\Support\Collection;

class ContactMessageService
{
    /**
     * جلب جميع الرسائل
     */
    public function getAllMessages(): Collection
    {
        return ContactMessage::orderBy('created_at', 'desc')->get();
    }

    /**
     * إنشاء رسالة جديدة
     */
    public function createMessage(array $data): ContactMessage
    {
        return ContactMessage::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'subject' => $data['subject'],
            'message' => $data['message'],
            'status' => 'new'
        ]);
    }

    /**
     * تحديث حالة الرسالة
     */
    public function markAsReviewed(int $id): bool
    {
        $message = ContactMessage::find($id);
        
        if (!$message) {
            return false;
        }

        return $message->update(['status' => 'reviewed']);
    }

    /**
     * التحقق من وجود الرسالة
     */
    public function messageExists(int $id): bool
    {
        return ContactMessage::where('id', $id)->exists();
    }
}