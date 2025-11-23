<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // إنشاء الأدمن الأساسي
        Admin::create([
            'name' => 'المدير العام',
            'email' => 'admin@admin.com',
            'password' => Hash::make('password123'),
        ]);

        // إنشاء أدمن إضافي (اختياري)
        Admin::create([
            'name' => 'مساعد المدير',
            'email' => 'assistant@admin.com',
            'password' => Hash::make('password123'),
        ]);

        // إنشاء عدة أدمنز باستخدام factory إذا بدك
        // Admin::factory(5)->create();

        $this->command->info('✅ تم إنشاء بيانات الأدمنز بنجاح!');
        $this->command->info('📧 البريد: admin@admin.com');
        $this->command->info('🔐 كلمة المرور: password123');
    }
}