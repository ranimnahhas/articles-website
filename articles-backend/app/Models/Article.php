<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'category_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'image_url',
        'status',
        'published_at',
        'views_count',
        'comments_enabled', 
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'comments_enabled' => 'boolean', 
    ];

    /**
     * العلاقة مع الأدمن
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Admin::class, 'admin_id'); // 🔥 تغيير من User إلى Admin
    }

    /**
     * العلاقة مع التصنيف
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * نطاق للمقالات المنشورة
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
                    ->where('published_at', '<=', now());
    }

    /**
     * نطاق للمقالات المسودة
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * زيادة عدد المشاهدات
     */
    public function incrementViews()
    {
        $this->increment('views_count');
    }

    /**
     * نشر المقال
     */
    public function publish()
    {
        $this->update([
            'status' => 'published',
            'published_at' => now(),
        ]);
    }

    /**
     * إنشاء slug تلقائي من العنوان
     */
    public static function boot()
    {
        parent::boot();

        static::creating(function ($article) {
            if (empty($article->slug)) {
                $article->slug = \Str::slug($article->title);
            }
            
            // إذا كان المقال ينشر لأول مرة وكان status = published
            if ($article->status === 'published' && empty($article->published_at)) {
                $article->published_at = now();
            }
        });

        static::updating(function ($article) {
            if ($article->isDirty('title') && empty($article->slug)) {
                $article->slug = \Str::slug($article->title);
            }
        });
    }
        /**
     * العلاقة مع جدول التعليقات
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * العلاقة مع التعليقات المعتمدة فقط
     */
    public function approvedComments(): HasMany
    {
        return $this->comments()->approved();
    }

    /**
     * عدد التعليقات المعتمدة
     */
    public function getApprovedCommentsCountAttribute(): int
    {
        return $this->approvedComments()->count();
    }

    /**
     * التحقق إذا كانت التعليقات مفعلة للمقالة
     */
    /**
 * التحقق إذا كانت التعليقات مفعلة للمقالة
 */
public function isCommentsEnabled(): bool
{
    \Log::info('فحص isCommentsEnabled:', [
        'comments_enabled' => $this->comments_enabled,
        'status' => $this->status,
        'published_at' => $this->published_at,
        'now' => now(),
        'is_published' => $this->status === 'published' && $this->published_at <= now()
    ]);
    
    // المقالة يجب أن تكون منشورة والتعليقات مفعلة
    $result = $this->comments_enabled && 
              $this->status === 'published' && 
              $this->published_at <= now();
    
    \Log::info('نتيجة isCommentsEnabled: ' . ($result ? 'نعم' : 'لا'));
    return $result;
}

    /**
     * تفعيل التعليقات للمقالة
     */
    public function enableComments(): void
    {
        $this->update(['comments_enabled' => true]);
    }

    /**
     * تعطيل التعليقات للمقالة
     */
    public function disableComments(): void
    {
        $this->update(['comments_enabled' => false]);
    }

}