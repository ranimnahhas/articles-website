<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Http\Requests\AdminCommentRequest;
use App\Services\CommentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CommentController extends Controller
{
    public function __construct(
        private CommentService $commentService
    ) {}

    /**
     * عرض قائمة التعليقات (للالادمن)
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['article_id', 'status', 'email', 'name']);
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $perPage = $request->get('per_page', 15);

        $comments = $this->commentService->getComments(
            $filters,
            $sortBy,
            $sortDirection,
            $perPage
        );

        return response()->json([
            'success' => true,
            'data' => $comments,
            'pending_count' => $this->commentService->getPendingCommentsCount(),
        ]);
    }

    /**
     * عرض التعليقات المعتمدة لمقال معين (للعامة)
     */
    public function getArticleComments($articleId, Request $request): JsonResponse
    {
        // تحويل إلى int
        $articleId = (int) $articleId;
        
        // التحقق إذا كانت التعليقات مفعلة للمقالة
        if (!$this->commentService->areCommentsEnabledForArticle($articleId)) {
            return response()->json([
                'success' => false,
                'message' => 'التعليقات معطلة لهذه المقالة.',
            ], 403);
        }

        $perPage = $request->get('per_page', 10);
        
        $comments = $this->commentService->getApprovedCommentsForArticle($articleId, $perPage);

        return response()->json([
            'success' => true,
            'data' => $comments,
        ]);
    }

    /**
     * إنشاء تعليق جديد (للعامة)
     */
    public function store(StoreCommentRequest $request): JsonResponse
    {
        Log::info('=== بدء إضافة تعليق جديد ===');
        Log::info('بيانات الطلب:', $request->all());
        
        // التحقق إذا كانت التعليقات مفعلة للمقالة
        $areCommentsEnabled = $this->commentService->areCommentsEnabledForArticle($request->article_id);
        Log::info('areCommentsEnabledForArticle النتيجة: ' . ($areCommentsEnabled ? 'نعم' : 'لا'));
        
        if (!$areCommentsEnabled) {
            Log::warning('تم رفض التعليق - التعليقات معطلة للمقالة: ' . $request->article_id);
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن إضافة تعليق، التعليقات معطلة لهذه المقالة.',
            ], 403);
        }

        // التحقق من إمكانية إضافة تعليق (لمنع السبام)
        if (!$this->commentService->canAddComment(
            $request->email,
            $request->article_id
        )) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكنك إضافة تعليق جديد في هذا الوقت. يرجى الانتظار قليلاً.',
            ], 429);
        }

        $comment = $this->commentService->createComment($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة التعليق بنجاح وسيتم مراجعته قريباً.',
            'data' => $comment,
        ], 201);
    }

    /**
     * عرض تعليق معين (للالادمن)
     */
    public function show($id): JsonResponse
    {
        // تحويل إلى int
        $commentId = (int) $id;
        
        $comment = $this->commentService->getCommentById($commentId);

        if (!$comment) {
            return response()->json([
                'success' => false,
                'message' => 'التعليق غير موجود.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $comment,
        ]);
    }

    /**
     * تحديث حالة التعليق (للالادمن)
     */
    public function updateStatus($id, AdminCommentRequest $request): JsonResponse
    {
        // تحويل إلى int
        $commentId = (int) $id;
        
        $success = $this->commentService->updateCommentStatus($commentId, $request->status);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'التعليق غير موجود.',
            ], 404);
        }

        $statusMessages = [
            'approved' => 'تم اعتماد التعليق بنجاح.',
            'rejected' => 'تم رفض التعليق بنجاح.',
        ];

        return response()->json([
            'success' => true,
            'message' => $statusMessages[$request->status],
        ]);
    }

    /**
     * حذف تعليق (للالادمن)
     */
    public function destroy($id, AdminCommentRequest $request): JsonResponse
    {
        // تحويل إلى int
        $commentId = (int) $id;
        
        $success = $this->commentService->deleteComment($commentId);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'التعليق غير موجود.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم حذف التعليق بنجاح.',
        ]);
    }

 

    /**
     * تفعيل التعليقات لمقالة (للالادمن)
     */
    public function enableArticleComments($articleId): JsonResponse
    {
        // تحويل إلى int
        $articleId = (int) $articleId;
        
        $success = $this->commentService->enableArticleComments($articleId);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'المقالة غير موجودة.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تفعيل التعليقات للمقالة بنجاح.',
        ]);
    }

    /**
     * تعطيل التعليقات لمقالة (للالادمن)
     */
    public function disableArticleComments($articleId): JsonResponse
    {
        // تحويل إلى int
        $articleId = (int) $articleId;
        
        $success = $this->commentService->disableArticleComments($articleId);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'المقالة غير موجودة.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تعطيل التعليقات للمقالة بنجاح.',
        ]);
    }

    /**
     * الحصول على التعليقات المعلقة فقط (للالادمن)
     */
    public function pendingComments(Request $request): JsonResponse
    {
        $filters = array_merge($request->only(['article_id', 'email', 'name']), ['status' => 'pending']);
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $perPage = $request->get('per_page', 15);

        $comments = $this->commentService->getComments(
            $filters,
            $sortBy,
            $sortDirection,
            $perPage
        );

        return response()->json([
            'success' => true,
            'data' => $comments,
            'pending_count' => $this->commentService->getPendingCommentsCount(),
        ]);
    }
}