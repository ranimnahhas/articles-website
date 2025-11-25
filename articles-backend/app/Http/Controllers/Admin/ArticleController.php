<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Article\CreateArticleRequest;
use App\Http\Requests\Article\UpdateArticleRequest;
use App\Models\Article;
use App\Models\Category;
use App\Services\ArticleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function __construct(
        private ArticleService $articleService
    ) {}

    /**
     * عرض قائمة المقالات
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['search', 'status', 'category_id']);
            $articles = $this->articleService->getAllArticles($filters);
            $stats = $this->articleService->getArticlesStats();
            $categories = Category::active()->get(['id', 'name']);

            return response()->json([
                'success' => true,
                'data' => [
                    'articles' => $articles,
                    'stats' => $stats,
                    'categories' => $categories
                ],
                'message' => 'تم جلب المقالات بنجاح'
            ]);

        } catch (\Exception $e) {
            \Log::error('Article index error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب المقالات'
            ], 500);
        }
    }

    /**
     * عرض مقال محدد
     */
    public function show(int $id): JsonResponse
    {
        try {
            $article = $this->articleService->getArticleById($id);

            if (!$article) {
                return response()->json([
                    'success' => false,
                    'message' => 'المقال غير موجود'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $article,
                'message' => 'تم جلب المقال بنجاح'
            ]);

        } catch (\Exception $e) {
            \Log::error('Article show error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب المقال'
            ], 500);
        }
    }

    /**
     * إنشاء مقال جديد
     */
    public function store(CreateArticleRequest $request): JsonResponse
    {
        try {
            $article = $this->articleService->createArticle(
                $request->validated(),
                $request->file('image')
            );

            return response()->json([
                'success' => true,
                'data' => $article,
                'message' => 'تم إنشاء المقال بنجاح'
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Article store error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء إنشاء المقال'
            ], 500);
        }
    }

    /**
     * تحديث مقال
     */
    public function update(UpdateArticleRequest $request, Article $article): JsonResponse
    {
        try {
            $this->articleService->updateArticle(
                $article,
                $request->validated(),
                $request->file('image')
            );

            return response()->json([
                'success' => true,
                'data' => $article->fresh(),
                'message' => 'تم تحديث المقال بنجاح'
            ]);

        } catch (\Exception $e) {
            \Log::error('Article update error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تحديث المقال'
            ], 500);
        }
    }

    /**
     * حذف مقال
     */
    public function destroy(Article $article): JsonResponse
    {
        try {
            $this->articleService->deleteArticle($article);

            return response()->json([
                'success' => true,
                'message' => 'تم حذف المقال بنجاح'
            ]);

        } catch (\Exception $e) {
            \Log::error('Article destroy error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء حذف المقال'
            ], 500);
        }
    }

    /**
     * نشر مقال
     */
    public function publish(Article $article): JsonResponse
    {
        try {
            $this->articleService->publishArticle($article);

            return response()->json([
                'success' => true,
                'message' => 'تم نشر المقال بنجاح'
            ]);

        } catch (\Exception $e) {
            \Log::error('Article publish error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء نشر المقال'
            ], 500);
        }
    }

    /**
     * إلغاء نشر مقال
     */
    public function unpublish(Article $article): JsonResponse
    {
        try {
            $this->articleService->unpublishArticle($article);

            return response()->json([
                'success' => true,
                'message' => 'تم إلغاء نشر المقال بنجاح'
            ]);

        } catch (\Exception $e) {
            \Log::error('Article unpublish error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء إلغاء نشر المقال'
            ], 500);
        }
    }

    /**
     * زيادة عدد المشاهدات
     */
    public function incrementViews(Article $article): JsonResponse
    {
        try {
            $this->articleService->incrementViews($article);

            return response()->json([
                'success' => true,
                'views_count' => $article->fresh()->views_count,
                'message' => 'تم زيادة عدد المشاهدات'
            ]);

        } catch (\Exception $e) {
            \Log::error('Article increment views error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء زيادة المشاهدات'
            ], 500);
        }
    }
}