<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ArticlesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // الحصول على أول أدمن وأول تصنيف
        $adminId = DB::table('admins')->value('id');
        $categoryId = DB::table('categories')->value('id');

        if (!$adminId || !$categoryId) {
            $this->command->error('Please run Admins and Categories seeders first!');
            return;
        }

        $articles = [
            [
                'title' => 'Introduction to Web Development',
                'slug' => 'introduction-to-web-development-' . time(),
                'excerpt' => 'A comprehensive guide to getting started with web development, covering HTML, CSS, and JavaScript basics.',
                'content' => 'Web development is the process of building and maintaining websites. It includes aspects such as web design, web publishing, web programming, and database management.

In this article, we will cover:
- HTML fundamentals
- CSS styling techniques
- JavaScript basics
- Modern development tools

Web development can be divided into three main layers:
1. Front-end (client-side)
2. Back-end (server-side)
3. Full-stack (both front-end and back-end)

Getting started with web development requires patience and practice. Start with the basics and gradually move to more complex topics.',
                'category_id' => $categoryId,
                'admin_id' => $adminId,
                'image_url' => '/storage/articles/web-development.jpg',
                'status' => 'published',
                'views_count' => 150,
                'published_at' => Carbon::now()->subDays(10),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Mastering Laravel Framework',
                'slug' => 'mastering-laravel-framework-' . time(),
                'excerpt' => 'Learn advanced Laravel techniques and best practices for building robust web applications.',
                'content' => 'Laravel is a PHP framework that provides an elegant syntax and powerful tools for web application development.

Key Features:
- Eloquent ORM
- Blade templating engine
- Artisan command-line interface
- Robust security features
- Comprehensive testing support

Advanced Topics:
- Service containers and dependency injection
- Queue management
- Event broadcasting
- API development
- Performance optimization

Laravel follows the MVC (Model-View-Controller) architectural pattern, which helps in organizing code and separating concerns.',
                'category_id' => $categoryId,
                'admin_id' => $adminId,
                'image_url' => '/storage/articles/laravel.jpg',
                'status' => 'published',
                'views_count' => 89,
                'published_at' => Carbon::now()->subDays(5),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'React vs Vue: Which Framework to Choose?',
                'slug' => 'react-vs-vue-which-framework-to-choose-' . time(),
                'excerpt' => 'A detailed comparison between React and Vue.js to help you choose the right framework for your project.',
                'content' => 'Both React and Vue are popular JavaScript frameworks for building user interfaces. Here is a comprehensive comparison:

React:
- Developed by Facebook
- Larger ecosystem and community
- JSX syntax
- Steeper learning curve
- More job opportunities

Vue:
- Developed by Evan You
- Gentler learning curve
- Template-based syntax
- Excellent documentation
- Growing community

Performance:
Both frameworks offer excellent performance. The choice often comes down to:
- Team experience
- Project requirements
- Personal preference
- Long-term maintenance

Consider starting with Vue for smaller projects and React for larger, more complex applications.',
                'category_id' => $categoryId,
                'admin_id' => $adminId,
                'image_url' => '/storage/articles/react-vue.jpg',
                'status' => 'published',
                'views_count' => 120,
                'published_at' => Carbon::now()->subDays(3),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Database Design Best Practices',
                'slug' => 'database-design-best-practices-' . time(),
                'excerpt' => 'Essential principles and patterns for designing efficient and scalable databases.',
                'content' => 'Proper database design is crucial for application performance and scalability. Here are key best practices:

Normalization:
- First Normal Form (1NF)
- Second Normal Form (2NF)
- Third Normal Form (3NF)

Indexing Strategies:
- Primary keys
- Foreign keys
- Composite indexes
- Unique constraints

Performance Considerations:
- Query optimization
- Connection pooling
- Caching strategies
- Partitioning large tables

Security:
- SQL injection prevention
- Proper user permissions
- Data encryption
- Regular backups

Always test your database design with realistic data volumes and query patterns.',
                'category_id' => $categoryId,
                'admin_id' => $adminId,
                'image_url' => '/storage/articles/database-design.jpg',
                'status' => 'draft',
                'views_count' => 45,
                'published_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Mobile App Development Trends 2024',
                'slug' => 'mobile-app-development-trends-2024-' . time(),
                'excerpt' => 'Explore the latest trends and technologies shaping mobile app development this year.',
                'content' => 'Mobile app development continues to evolve rapidly. Here are the key trends for 2024:

1. AI and Machine Learning Integration
   - Personalized user experiences
   - Smart recommendations
   - Voice assistants

2. Cross-Platform Development
   - Flutter and React Native
   - Single codebase for multiple platforms
   - Reduced development time

3. Internet of Things (IoT)
   - Smart home integration
   - Wearable technology
   - Connected devices

4. 5G Technology
   - Faster data transfer
   - Enhanced streaming quality
   - Real-time applications

5. Enhanced Security
   - Biometric authentication
   - Blockchain integration
   - Advanced encryption

Staying updated with these trends is essential for building competitive mobile applications.',
                'category_id' => $categoryId,
                'admin_id' => $adminId,
                'image_url' => '/storage/articles/mobile-trends.jpg',
                'status' => 'published',
                'views_count' => 200,
                'published_at' => Carbon::now()->subDays(1),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Cloud Computing for Beginners',
                'slug' => 'cloud-computing-for-beginners-' . time(),
                'excerpt' => 'A beginner-friendly introduction to cloud computing concepts and services.',
                'content' => 'Cloud computing has revolutionized how businesses and individuals use technology. This guide covers the basics:

What is Cloud Computing?
- On-demand computing services
- Pay-as-you-go pricing
- Remote server access

Service Models:
- Infrastructure as a Service (IaaS)
- Platform as a Service (PaaS)
- Software as a Service (SaaS)

Deployment Models:
- Public cloud
- Private cloud
- Hybrid cloud

Major Providers:
- Amazon Web Services (AWS)
- Microsoft Azure
- Google Cloud Platform (GCP)

Benefits:
- Cost efficiency
- Scalability
- Reliability
- Security

Getting started with cloud computing is easier than ever with free tiers and comprehensive documentation.',
                'category_id' => $categoryId,
                'admin_id' => $adminId,
                'image_url' => '/storage/articles/cloud-computing.jpg',
                'status' => 'archived',
                'views_count' => 75,
                'published_at' => Carbon::now()->subMonths(2),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // إدخال البيانات
        DB::table('articles')->insert($articles);

        $this->command->info('Articles seeded successfully!');
        $this->command->info('Total articles created: ' . count($articles));
    }
}