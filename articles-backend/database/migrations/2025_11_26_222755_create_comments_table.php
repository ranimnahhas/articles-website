<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('email');
            $table->text('content');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
            
            // Indexes for better performance
            $table->index('article_id');
            $table->index('status');
            $table->index('email');
            $table->index(['article_id', 'status']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};