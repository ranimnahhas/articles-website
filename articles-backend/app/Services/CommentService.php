<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\Article;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class CommentService
{
    /**
     * إنشاء تعليق جديد
     */
    public function createComment(array $data): Comment
    {
        return Comment::create($data);
    }

    /**
     * الحصول على تعليق بواسطة ID
     */
    public function getCommentById(int $id): ?Comment
    {
        return Comment::with('article')->find($id);
    }

    /**
     * الحصول على التعليقات مع التصفية والترتيب
     */
    public function getComments(
        array $filters = [],
        string $sortBy = 'created_at',
        string $sortDirection = 'desc',
        int $perPage = 15
    ): LengthAwarePaginator {
        $query = Comment::with('article');

        // التصفية حسب المقالة
        if (isset($filters['article_id'])) {
            $query->where('article_id', $filters['article_id']);
        }

        // التصفية حسب الحالة
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // التصفية حسب البريد الإلكتروني
        if (isset($filters['email'])) {
            $query->where('email', 'like', '%' . $filters['email'] . '%');
        }

        // التصفية حسب الاسم
        if (isset($filters['name'])) {
            $query->where('name', 'like', '%' . $filters['name'] . '%');
        }

        // الترتيب
        $query->orderBy($sortBy, $sortDirection);

        return $query->paginate($perPage);
    }

    /**
     * الحصول على التعليقات المعتمدة لمقال معين
     */
    public function getApprovedCommentsForArticle(int $articleId, int $perPage = 10): LengthAwarePaginator
    {
        return Comment::where('article_id', $articleId)
            ->approved()
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * تحديث حالة التعليق
     */
    public function updateCommentStatus(int $commentId, string $status): bool
    {
        $comment = Comment::find($commentId);
        
        if (!$comment) {
            return false;
        }

        $comment->update(['status' => $status]);
        return true;
    }

    /**
     * حذف تعليق
     */
    public function deleteComment(int $commentId): bool
    {
        $comment = Comment::find($commentId);
        
        if (!$comment) {
            return false;
        }

        return $comment->delete();
    }

    /**
     * عدد التعليقات المعلقة
     */
    public function getPendingCommentsCount(): int
    {
        return Comment::pending()->count();
    }

    /**
     * التحقق من إمكانية إضافة تعليق (لمنع السبام)
     */
    public function canAddComment(string $email, int $articleId, int $timeLimit = 300): bool
    {
        $recentComment = Comment::where('email', $email)
            ->where('article_id', $articleId)
            ->where('created_at', '>=', now()->subSeconds($timeLimit))
            ->exists();

        return !$recentComment;
    }

    /**
     * تفعيل التعليقات لمقالة
     */
    public function enableArticleComments(int $articleId): bool
    {
        Log::info('=== بدء تفعيل التعليقات ===');
        Log::info('معرف المقالة: ' . $articleId);
        
        try {
            $article = Article::find($articleId);
            
            if (!$article) {
                Log::error('المقالة غير موجودة: ' . $articleId);
                return false;
            }

            Log::info('قبل التحديث:', [
                'id' => $article->id,
                'title' => $article->title,
                'status' => $article->status,
                'comments_enabled' => $article->comments_enabled,
                'published_at' => $article->published_at
            ]);

            // محاولة 1: استخدام الدالة
            $article->enableComments();
            $article->refresh();

            Log::info('بعد enableComments:', [
                'comments_enabled' => $article->comments_enabled
            ]);

            // محاولة 2: تحديث مباشر
            $result = Article::where('id', $articleId)->update([
                'comments_enabled' => true,
                'status' => 'published', // تأكد من النشر أيضاً
                'published_at' => $article->published_at ?: now() // إذا كان null
            ]);

            Log::info('نتيجة التحديث المباشر: ' . ($result ? 'نجح' : 'فشل'));

            // تحقق النهائي
            $article->refresh();
            Log::info('الحالة النهائية:', [
                'comments_enabled' => $article->comments_enabled,
                'status' => $article->status,
                'isCommentsEnabled' => $article->isCommentsEnabled()
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('خطأ في تفعيل التعليقات: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * التحقق إذا كانت التعليقات مفعلة للمقالة
     */
    public function areCommentsEnabledForArticle(int $articleId): bool
    {
        Log::info('التحقق من تفعيل التعليقات للمقالة: ' . $articleId);
        
        $article = Article::find($articleId);
        
        if (!$article) {
            Log::warning('المقالة غير موجودة: ' . $articleId);
            return false;
        }
        
        $isEnabled = $article->isCommentsEnabled();
        Log::info('نتيجة isCommentsEnabled: ' . ($isEnabled ? 'نعم' : 'لا'));
        Log::info('تفاصيل المقالة:', [
            'id' => $article->id,
            'status' => $article->status,
            'comments_enabled' => $article->comments_enabled,
            'published_at' => $article->published_at,
        ]);
        
        return $isEnabled;
    }

    /**
     * تعطيل التعليقات لمقالة
     */
    public function disableArticleComments(int $articleId): bool
    {
        $article = Article::find($articleId);
        
        if (!$article) {
            return false;
        }

        $article->disableComments();
        return true;
    }

   
}