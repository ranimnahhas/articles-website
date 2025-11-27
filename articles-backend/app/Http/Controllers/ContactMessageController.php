<?php

namespace App\Http\Controllers;

use App\Services\ContactMessageService;
use App\Http\Requests\ContactMessageRequest;
use Illuminate\Http\JsonResponse;

class ContactMessageController extends Controller
{
    private $contactService;

    public function __construct(ContactMessageService $contactService)
    {
        $this->contactService = $contactService;
    }

    /**
     * عرض جميع الرسائل للمشرف
     */
    public function index(): JsonResponse
    {
        try {
            $messages = $this->contactService->getAllMessages();
            
            return response()->json([
                'success' => true,
                'data' => $messages,
                'message' => 'تم جلب الرسائل بنجاح'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب الرسائل: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * حفظ رسالة جديدة من الزائر
     */
    public function store(ContactMessageRequest $request): JsonResponse
    {
        try {
            // تحقق من البيانات المرسلة
            $validatedData = $request->validated();
            
            $message = $this->contactService->createMessage($validatedData);
            
            return response()->json([
                'success' => true,
                'message' => 'تم إرسال الرسالة بنجاح',
                'data' => $message
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء إرسال الرسالة: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تحديد الرسالة كمقروءة
     */
    public function markAsReviewed(int $id): JsonResponse
    {
        try {
            $result = $this->contactService->markAsReviewed($id);
            
            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'الرسالة غير موجودة'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'تم تحديد الرسالة كمقروءة'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تحديث حالة الرسالة: ' . $e->getMessage()
            ], 500);
        }
    }
}