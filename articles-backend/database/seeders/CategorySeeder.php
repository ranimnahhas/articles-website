<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'التقنية',
                'slug' => 'technology',
                'is_active' => true
            ],
            [
                'name' => 'البرمجة',
                'slug' => 'programming',
                'is_active' => true
            ],
            [
                'name' => 'التصميم',
                'slug' => 'design',
                'is_active' => true
            ],
            [
                'name' => 'الأعمال',
                'slug' => 'business',
                'is_active' => true
            ],
            [
                'name' => 'التسويق',
                'slug' => 'marketing',
                'is_active' => true
            ],
            [
                'name' => 'الذكاء الاصطناعي',
                'slug' => 'artificial-intelligence',
                'is_active' => true
            ],
            [
                'name' => 'تطوير الويب',
                'slug' => 'web-development',
                'is_active' => true
            ],
            [
                'name' => 'تطوير التطبيقات',
                'slug' => 'app-development',
                'is_active' => true
            ],
            [
                'name' => 'الأمن السيبراني',
                'slug' => 'cybersecurity',
                'is_active' => true
            ],
            [
                'name' => 'العلوم',
                'slug' => 'science',
                'is_active' => true
            ],
            [
                'name' => 'الصحة',
                'slug' => 'health',
                'is_active' => true
            ],
            [
                'name' => 'الرياضة',
                'slug' => 'sports',
                'is_active' => true
            ],
            [
                'name' => 'السفر',
                'slug' => 'travel',
                'is_active' => true
            ],
            [
                'name' => 'الطعام',
                'slug' => 'food',
                'is_active' => true
            ],
            [
                'name' => 'التعليم',
                'slug' => 'education',
                'is_active' => true
            ]
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }

        $this->command->info('تم إنشاء ' . count($categories) . ' تصنيف بنجاح!');
    }
}