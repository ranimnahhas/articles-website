<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class ArticleService
{
    public function __construct()
    {
        // 🔥 إزالة dependency injection للموديل
    }

    /**
     * الحصول على جميع المقالات مع التصفية
     */
public function getAllArticles(array $filters = []): LengthAwarePaginator
{
    $query = Article::with(['category', 'admin']);

    if (isset($filters['status']) && $filters['status'] !== '') {
        $query->where('status', $filters['status']);
    }

    if (isset($filters['category_id']) && $filters['category_id'] !== '') {
        $query->where('category_id', $filters['category_id']);
    }

    if (isset($filters['search']) && $filters['search'] !== '') {
        $query->where(function ($q) use ($filters) {
            $q->where('title', 'like', '%' . $filters['search'] . '%')
              ->orWhere('content', 'like', '%' . $filters['search'] . '%')
              ->orWhereHas('category', function ($categoryQuery) use ($filters) {
                  $categoryQuery->where('name', 'like', '%' . $filters['search'] . '%');
              });
        });
    }

    return $query->latest()->paginate(10);
}

    /**
     * الحصول على مقال محدد
     */
    public function getArticleById(int $id): ?Article
    {
        return Article::with(['category', 'admin'])->find($id);
    }

    /**
     * إنشاء مقال جديد
     */
    public function createArticle(array $data, ?UploadedFile $image = null, ?int $adminId = null): Article
    {
        try {
            $imageUrl = null;
            if ($image) {
                $imageUrl = $this->uploadImage($image);
            }

            $adminId = $adminId ?? auth()->id();
            
            if (!$adminId) {
                throw new \Exception('لم يتم توفير معرّف الأدمن');
            }

            // 🔥 إضافة timestamp لمنع تكرار الـ slug
            $slug = \Illuminate\Support\Str::slug($data['title']) . '-' . time();

            $articleData = [
                'title' => $data['title'],
                'category_id' => $data['category_id'],
                'slug' => $slug,
                'excerpt' => $data['excerpt'] ?? null,
                'content' => $data['content'],
                'image_url' => $imageUrl,
                'status' => $data['status'],
                'admin_id' => $adminId,
                'published_at' => $data['status'] === 'published' ? ($data['published_at'] ?? now()) : null
            ];

            return Article::create($articleData);

        } catch (\Exception $e) {
            \Log::error('Create article error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * تحديث مقال
     */
    public function updateArticle(Article $article, array $data, ?UploadedFile $image = null): bool
    {
        if ($image) {
            if ($article->image_url) {
                $this->deleteImage($article->image_url);
            }
            $data['image_url'] = $this->uploadImage($image);
        }

        if (isset($data['status']) && $data['status'] === 'published' && !$article->published_at) {
            $data['published_at'] = $data['published_at'] ?? now();
        }

        return $article->update($data);
    }

    /**
     * حذف مقال
     */
    public function deleteArticle(Article $article): bool
    {
        if ($article->image_url) {
            $this->deleteImage($article->image_url);
        }

        return $article->delete();
    }

    /**
     * نشر مقال
     */
    public function publishArticle(Article $article): bool
    {
        return $article->update([
            'status' => 'published',
            'published_at' => now()
        ]);
    }

    /**
     * إلغاء نشر مقال
     */
    public function unpublishArticle(Article $article): bool
    {
        return $article->update([
            'status' => 'draft',
            'published_at' => null
        ]);
    }

    /**
     * زيادة عدد المشاهدات
     */
    public function incrementViews(Article $article): bool
    {
        return $article->increment('views_count');
    }

    /**
     * رفع صورة
     */
    private function uploadImage(UploadedFile $image): string
    {
        $path = $image->store('articles', 'public');
        return '/storage/' . $path;
    }

    /**
     * حذف صورة
     */
    private function deleteImage(string $imageUrl): void
    {
        $path = str_replace('/storage/', '', $imageUrl);
        Storage::disk('public')->delete($path);
    }

    /**
     * الحصول على إحصائيات المقالات
     */
    public function getArticlesStats(): array
    {
        return [
            'total' => Article::count(),
            'published' => Article::where('status', 'published')->count(),
            'draft' => Article::where('status', 'draft')->count(),
            'archived' => Article::where('status', 'archived')->count(),
            'total_views' => Article::sum('views_count'),
        ];
    }

    /**
     * الحصول على المقالات المنشورة للعامة
     */
    public function getPublishedArticles(array $filters = []): LengthAwarePaginator
    {
        $query = Article::with(['category'])
            ->published()
            ->latest('published_at');

        if (isset($filters['category_id']) && $filters['category_id'] !== '') {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['search']) && $filters['search'] !== '') {
            $query->where('title', 'like', '%' . $filters['search'] . '%');
        }

        return $query->paginate(12);
    }
}