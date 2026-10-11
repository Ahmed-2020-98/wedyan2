<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Category::query()->withCount('products')->orderBy('name_ar')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name_ar' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:categories,slug'],
            'image' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $data['slug'] ??= Str::slug($data['name_ar']) ?: Str::random(8);

        return response()->json(Category::create($data), 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $data = $request->validate([
            'name_ar' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'unique:categories,slug,' . $category->id],
            'image' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $category->update($data);

        return response()->json($category);
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return response()->json(['message' => 'تم حذف التصنيف بنجاح.']);
    }
}
