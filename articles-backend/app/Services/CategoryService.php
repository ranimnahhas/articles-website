<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class CategoryService
{
    // ❌ إزالة الـ constructor أو جعله optional
    public function __construct()
    {
        // لا حاجة لـ Category model هنا
    }

    public function getAllCategories(array $filters = []): LengthAwarePaginator
    {
        $query = Category::query();

        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $query->where('is_active', $filters['is_active']);
        }

        if (isset($filters['search']) && $filters['search'] !== '') {
            $query->where('name', 'like', '%' . $filters['search'] . '%');
        }

        return $query->latest()->paginate(10);
    }

    public function getActiveCategories(): Collection
    {
        return Category::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);
    }

    public function createCategory(array $data): Category
    {
        return Category::create([
            'name' => $data['name'],
            'slug' => \Illuminate\Support\Str::slug($data['name']),
            'is_active' => true
        ]);
    }

    public function updateCategory(int $categoryId, array $data): bool
    {
        $category = Category::find($categoryId);
        
        if (!$category) {
            return false;
        }

        if (isset($data['name']) && $data['name'] !== $category->name) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        }

        return $category->update($data);
    }

    public function activateCategory(int $categoryId): bool
    {
        $category = Category::find($categoryId);
        return $category ? $category->update(['is_active' => true]) : false;
    }

    public function deactivateCategory(int $categoryId): bool
    {
        $category = Category::find($categoryId);
        return $category ? $category->update(['is_active' => false]) : false;
    }

    public function getCategoriesStats(): array
    {
        return [
            'total' => Category::count(),
            'active' => Category::where('is_active', true)->count(),
            'inactive' => Category::where('is_active', false)->count(),
        ];
    }
}