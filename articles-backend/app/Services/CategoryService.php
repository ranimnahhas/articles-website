<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Pagination\LengthAwarePaginator;

class CategoryService
{
    public function __construct(
        private Category $category
    ) {}

    public function getAllCategories(array $filters = []): LengthAwarePaginator
    {
        $query = $this->category->newQuery();

        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $query->where('is_active', $filters['is_active']);
        }

        if (isset($filters['search']) && $filters['search'] !== '') {
            $query->where('name', 'like', '%' . $filters['search'] . '%');
        }

        return $query->latest()->paginate(10);
    }

    public function createCategory(array $data): Category
    {
        return $this->category->create([
            'name' => $data['name'],
            'slug' => \Illuminate\Support\Str::slug($data['name']),
            'is_active' => true
        ]);
    }

    public function deactivateCategory(int $categoryId): bool
    {
        $category = $this->category->find($categoryId);
        return $category ? $category->update(['is_active' => false]) : false;
    }

    public function getCategoriesStats(): array
    {
        return [
            'total' => $this->category->count(),
            'active' => $this->category->where('is_active', true)->count(),
            'inactive' => $this->category->where('is_active', false)->count(),
        ];
    }
}