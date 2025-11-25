<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\CreateCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function __construct(
        private CategoryService $categoryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['search', 'is_active']);
            $categories = $this->categoryService->getAllCategories($filters);
            $stats = $this->categoryService->getCategoriesStats();

            return response()->json([
                'success' => true,
                'data' => [
                    'categories' => $categories,
                    'stats' => $stats
                ],
                'message' => 'Categories fetched successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Category index error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching categories'
            ], 500);
        }
    }

    public function getActiveCategories(): JsonResponse
    {
        try {
            $categories = $this->categoryService->getActiveCategories();

            return response()->json([
                'success' => true,
                'data' => $categories,
                'message' => 'Active categories fetched successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Active categories error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching active categories'
            ], 500);
        }
    }

    public function store(CreateCategoryRequest $request): JsonResponse
    {
        try {
            $category = $this->categoryService->createCategory($request->validated());

            return response()->json([
                'success' => true,
                'data' => $category,
                'message' => 'Category created successfully'
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Category store error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error creating category'
            ], 500);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        try {
            $category = Category::find($id);
            
            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found'
                ], 404);
            }

            $request->validate([
                'name' => 'required|string|max:255',
                'is_active' => 'sometimes|boolean'
            ]);

            $existingCategory = Category::where('name', $request->name)
                ->where('id', '!=', $id)
                ->first();

            if ($existingCategory) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category name already exists'
                ], 422);
            }

            $data = [
                'name' => $request->name,
                'is_active' => $request->is_active ?? $category->is_active
            ];

            if ($request->name !== $category->name) {
                $data['slug'] = \Illuminate\Support\Str::slug($request->name);
            }

            $category->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Category updated successfully',
                'data' => $category->fresh()
            ]);

        } catch (\Exception $e) {
            \Log::error('Category update error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error updating category'
            ], 500);
        }
    }

    public function activate($id): JsonResponse
    {
        try {
            $category = Category::find($id);
            
            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found'
                ], 404);
            }

            $category->update(['is_active' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Category activated successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Category activate error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error activating category'
            ], 500);
        }
    }

    public function deactivate($id): JsonResponse
    {
        try {
            $category = Category::find($id);
            
            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found'
                ], 404);
            }

            $category->update(['is_active' => false]);

            return response()->json([
                'success' => true,
                'message' => 'Category deactivated successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Category deactivate error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error deactivating category'
            ], 500);
        }
    }
}