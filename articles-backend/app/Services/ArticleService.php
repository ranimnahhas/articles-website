<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Exception;
use Illuminate\Support\Str;

class ArticleService
{
    public function getAllArticles(array $filters = [])
    {
        try {
            $query = Article::with(['category', 'admin'])
                        ->latest();

            // تطبيق الفلاتر
            if (!empty($filters['search'])) {
                $query->search($filters['search']);
            }

            if (!empty($filters['status'])) {
                $query->where('status', $filters['status']);
            }

            if (!empty($filters['category_id'])) {
                $query->category($filters['category_id']);
            }

            return $query->paginate(10);
            
        } catch (Exception $e) {
            \Log::error('Error fetching articles: ' . $e->getMessage());
            throw new Exception('Failed to retrieve articles');
        }
    }

    public function getArticleById(int $id)
    {
        try {
            return Article::with(['category', 'admin'])->find($id);
        } catch (Exception $e) {
            \Log::error('Error fetching article: ' . $e->getMessage());
            throw new Exception('Failed to retrieve article');
        }
    }

       public function createArticle(array $data, $image = null)
    {
        DB::beginTransaction();
        
        try {
            // إضافة admin_id تلقائياً من الأدمن المسجل
            $data['admin_id'] = Auth::id();
            
            // معالجة الصورة
            if ($image) {
                $data['image_url'] = $this->handleImageUpload($image);
                \Log::info('New image uploaded during creation: ' . $data['image_url']);
            }

            // إنشاء slug إذا لم يتم توفيره
            if (empty($data['slug'])) {
                $data['slug'] = Str::slug($data['title']);
            }

            // التأكد من أن slug فريد
            $data['slug'] = $this->makeSlugUnique($data['slug']);

            $article = Article::create($data);

            DB::commit();
            \Log::info('Article created successfully: ' . $article->id);
            return $article->load(['category', 'admin']);

        } catch (Exception $e) {
            DB::rollBack();
            \Log::error('Error creating article: ' . $e->getMessage());
            throw new Exception('Failed to create article');
        }
    }

    public function updateArticle(Article $article, array $data, $image = null)
    {
        DB::beginTransaction();
        
        try {
            // معالجة الصورة الجديدة
            if ($image) {
                // حذف الصورة القديمة إذا كانت موجودة
                if ($article->image_url) {
                    $oldImagePath = $article->getRawOriginal('image_url');
                    \Log::info('Deleting old image for article ' . $article->id . ': ' . $oldImagePath);
                    $this->deleteImage($oldImagePath);
                }
                $data['image_url'] = $this->handleImageUpload($image);
                \Log::info('New image uploaded for article ' . $article->id . ': ' . $data['image_url']);
            }

            // تحديث slug إذا تغير العنوان
            if (isset($data['title']) && $data['title'] !== $article->title) {
                $data['slug'] = $this->makeSlugUnique(Str::slug($data['title']), $article->id);
            }

            \Log::info('Updating article ' . $article->id . ' with data:', $data);
            $article->update($data);

            DB::commit();
            \Log::info('Article updated successfully: ' . $article->id);
            return $article->fresh(['category', 'admin']);

        } catch (Exception $e) {
            DB::rollBack();
            \Log::error('Error updating article ' . $article->id . ': ' . $e->getMessage());
            throw new Exception('Failed to update article');
        }
    }

    public function deleteArticle(Article $article)
    {
        DB::beginTransaction();
        
        try {
            // حذف الصورة إذا كانت موجودة
            if ($article->image_url) {
                $oldImagePath = $article->getRawOriginal('image_url');
                \Log::info('Deleting image for article ' . $article->id . ': ' . $oldImagePath);
                $this->deleteImage($oldImagePath);
            }

            $article->delete();

            DB::commit();
            \Log::info('Article deleted successfully: ' . $article->id);
            
        } catch (Exception $e) {
            DB::rollBack();
            \Log::error('Error deleting article ' . $article->id . ': ' . $e->getMessage());
            throw new Exception('Failed to delete article');
        }
    }

    public function publishArticle(Article $article)
    {
        try {
            $article->update([
                'status' => 'published',
                'published_at' => now()
            ]);
            
            \Log::info('Article published successfully: ' . $article->id);
            return $article;
        } catch (Exception $e) {
            \Log::error('Error publishing article ' . $article->id . ': ' . $e->getMessage());
            throw new Exception('Failed to publish article');
        }
    }

    public function unpublishArticle(Article $article)
    {
        try {
            $article->update([
                'status' => 'draft'
            ]);
            
            \Log::info('Article unpublished successfully: ' . $article->id);
            return $article;
        } catch (Exception $e) {
            \Log::error('Error unpublishing article ' . $article->id . ': ' . $e->getMessage());
            throw new Exception('Failed to unpublish article');
        }
    }

    public function incrementViews(Article $article)
    {
        try {
            $article->increment('views_count');
            \Log::info('Views incremented for article: ' . $article->id . ' - New count: ' . ($article->views_count + 1));
            return $article->fresh();
        } catch (Exception $e) {
            \Log::error('Error incrementing views for article ' . $article->id . ': ' . $e->getMessage());
            throw new Exception('Failed to increment views');
        }
    }

    public function getArticlesStats()
    {
        try {
            $stats = [
                'total' => Article::count(),
                'published' => Article::where('status', 'published')->count(),
                'draft' => Article::where('status', 'draft')->count(),
                'total_views' => Article::sum('views_count'),
            ];
            
            \Log::info('Articles stats retrieved:', $stats);
            return $stats;
        } catch (Exception $e) {
            \Log::error('Error getting articles stats: ' . $e->getMessage());
            throw new Exception('Failed to get articles statistics');
        }
    }

    /**
     * معالجة رفع الصورة - معدلة لتخزين storage/articles/اسم_الصورة
     */
    private function handleImageUpload($image)
    {
        try {
            // رفع الصورة إلى المجلد المطلوب
            $path = $image->store('articles', 'public');
            
            // إرجاع المسار بالشكل المطلوب storage/articles/اسم_الصورة
            $storagePath = 'storage/' . $path;
            \Log::info('Image uploaded successfully to: ' . $storagePath);
            
            return $storagePath;
        } catch (Exception $e) {
            \Log::error('Error uploading image: ' . $e->getMessage());
            throw new Exception('Failed to upload image');
        }
    }

    /**
     * حذف الصورة - معدلة للتعامل مع مسارات storage/articles/
     */
    private function deleteImage($imagePath)
    {
        try {
            \Log::info('Starting image deletion process for: ' . $imagePath);
            
            // إذا كان المسار يبدأ بـ storage/، أزل storage/ للحصول على المسار النسبي
            if (strpos($imagePath, 'storage/') === 0) {
                $relativePath = str_replace('storage/', '', $imagePath);
                \Log::info('Extracted relative path: ' . $relativePath);
                
                if (Storage::disk('public')->exists($relativePath)) {
                    Storage::disk('public')->delete($relativePath);
                    \Log::info('Successfully deleted image: ' . $relativePath);
                    return true;
                }
            }
            
            // إذا كان المسار النسبي مباشرة (بدون storage/)
            if (Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
                \Log::info('Successfully deleted image: ' . $imagePath);
                return true;
            }
            
            // محاولة باستخدام اسم الملف فقط
            $fileName = basename($imagePath);
            $alternativePath = 'articles/' . $fileName;
            \Log::info('Trying alternative path: ' . $alternativePath);
            
            if (Storage::disk('public')->exists($alternativePath)) {
                Storage::disk('public')->delete($alternativePath);
                \Log::info('Successfully deleted image from alternative path: ' . $alternativePath);
                return true;
            }
            
            \Log::warning('Image file not found in any location: ' . $imagePath);
            return false;
            
        } catch (Exception $e) {
            \Log::error('Error deleting image: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * جعل slug فريداً
     */
    private function makeSlugUnique($slug, $ignoreId = null)
    {
        $originalSlug = $slug;
        $counter = 1;

        while (Article::where('slug', $slug)
            ->when($ignoreId, function ($query) use ($ignoreId) {
                return $query->where('id', '!=', $ignoreId);
            })
            ->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        \Log::info('Generated unique slug: ' . $slug . ' from original: ' . $originalSlug);
        return $slug;
    }

    /**
     * البحث في المقالات
     */
    public function searchArticles($searchTerm)
    {
        try {
            $articles = Article::with(['category', 'admin'])
                ->where('title', 'like', '%' . $searchTerm . '%')
                ->orWhere('content', 'like', '%' . $searchTerm . '%')
                ->orWhere('excerpt', 'like', '%' . $searchTerm . '%')
                ->latest()
                ->paginate(10);

            \Log::info('Search completed for term: ' . $searchTerm . ' - Found: ' . $articles->total() . ' results');
            return $articles;
        } catch (Exception $e) {
            \Log::error('Error searching articles: ' . $e->getMessage());
            throw new Exception('Failed to search articles');
        }
    }

    /**
     * الحصول على المقالات الأكثر مشاهدة
     */
    public function getMostViewedArticles($limit = 5)
    {
        try {
            $articles = Article::with(['category', 'admin'])
                ->published()
                ->orderBy('views_count', 'desc')
                ->limit($limit)
                ->get();

            \Log::info('Retrieved ' . $articles->count() . ' most viewed articles');
            return $articles;
        } catch (Exception $e) {
            \Log::error('Error getting most viewed articles: ' . $e->getMessage());
            throw new Exception('Failed to get most viewed articles');
        }
    }

    /**
     * الحصول على المقالات الحديثة
     */
    public function getRecentArticles($limit = 5)
    {
        try {
            $articles = Article::with(['category', 'admin'])
                ->published()
                ->latest()
                ->limit($limit)
                ->get();

            \Log::info('Retrieved ' . $articles->count() . ' recent articles');
            return $articles;
        } catch (Exception $e) {
            \Log::error('Error getting recent articles: ' . $e->getMessage());
            throw new Exception('Failed to get recent articles');
        }
    }

    /**
     * الحصول على المقالات حسب التصنيف
     */
    public function getArticlesByCategory($categoryId, $perPage = 10)
    {
        try {
            $articles = Article::with(['category', 'admin'])
                ->where('category_id', $categoryId)
                ->published()
                ->latest()
                ->paginate($perPage);

            \Log::info('Retrieved articles for category ' . $categoryId . ' - Count: ' . $articles->total());
            return $articles;
        } catch (Exception $e) {
            \Log::error('Error getting articles by category: ' . $e->getMessage());
            throw new Exception('Failed to get articles by category');
        }
    }

    /**
     * التحقق من وجود مقال بالعنوان
     */
    public function articleExistsWithTitle($title, $excludeId = null)
    {
        try {
            $query = Article::where('title', $title);
            
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }

            $exists = $query->exists();
            \Log::info('Article title check - Title: ' . $title . ', Exists: ' . ($exists ? 'Yes' : 'No'));
            return $exists;
        } catch (Exception $e) {
            \Log::error('Error checking article title: ' . $e->getMessage());
            throw new Exception('Failed to check article title');
        }
    }

    /**
     * الحصول على إحصائيات مفصلة للمقالات
     */
    public function getDetailedStats()
    {
        try {
            $stats = [
                'total_articles' => Article::count(),
                'published_articles' => Article::where('status', 'published')->count(),
                'draft_articles' => Article::where('status', 'draft')->count(),
                'archived_articles' => Article::where('status', 'archived')->count(),
                'total_views' => Article::sum('views_count'),
                'average_views' => Article::where('views_count', '>', 0)->avg('views_count') ?? 0,
                'most_viewed_article' => Article::with(['category', 'admin'])->orderBy('views_count', 'desc')->first(),
                'recent_articles_count' => Article::where('created_at', '>=', now()->subDays(7))->count(),
            ];

            \Log::info('Detailed articles stats retrieved');
            return $stats;
        } catch (Exception $e) {
            \Log::error('Error getting detailed articles stats: ' . $e->getMessage());
            throw new Exception('Failed to get detailed articles statistics');
        }
    }
}