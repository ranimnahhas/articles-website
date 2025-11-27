<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'article_id',
        'name',
        'email',
        'content',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * العلاقة مع جدول المقالات
     */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    /**
     * نطاق للتعليقات المعلقة
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * نطاق للتعليقات المعتمدة
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * نطاق للتعليقات المرفوضة
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * التحقق مما إذا كان التعليق معتمد
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * التحقق مما إذا كان التعليق معلق
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * اعتماد التعليق
     */
    public function approve(): void
    {
        $this->update(['status' => 'approved']);
    }

    /**
     * رفض التعليق
     */
    public function reject(): void
    {
        $this->update(['status' => 'rejected']);
    }
}