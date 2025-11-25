<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\CreateCategoryRequest;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function __construct(
        private CategoryService $categoryService
    ) {}

    /**
     * عرض قائمة التصنيفات
     */
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
                'message' => 'تم جلب التصنيفات بنجاح'
            ]);

        } catch (\Exception $e) {
            \Log::error('Category index error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب التصنيفات'
            ], 500);
        }
    }

    /**
     * إنشاء تصنيف جديد
     */
    public function store(CreateCategoryRequest $request): JsonResponse
    {
        try {
            $category = $this->categoryService->createCategory($request->validated());

            return response()->json([
                'success' => true,
                'data' => $category,
                'message' => 'تم إنشاء التصنيف بنجاح'
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Category store error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء إنشاء التصنيف'
            ], 500);
        }
    }

    /**
     * تعطيل التصنيف
     */
    public function deactivate(int $id): JsonResponse
    {
        try {
            $result = $this->categoryService->deactivateCategory($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'التصنيف غير موجود'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'تم تعطيل التصنيف بنجاح',
                'is_active' => false
            ]);

        } catch (\Exception $e) {
            \Log::error('Category deactivate error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تعطيل التصنيف'
            ], 500);
        }
    }
}