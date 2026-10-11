<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminBrandController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Brand::query()->withCount('products')->orderBy('name_ar')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name_ar' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:brands,slug'],
            'logo' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $data['slug'] ??= Str::slug($data['name_ar']) ?: Str::random(8);

        return response()->json(Brand::create($data), 201);
    }

    public function update(Request $request, Brand $brand): JsonResponse
    {
        $data = $request->validate([
            'name_ar' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'unique:brands,slug,' . $brand->id],
            'logo' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $brand->update($data);

        return response()->json($brand);
    }

    public function destroy(Brand $brand): JsonResponse
    {
        $brand->delete();

        return response()->json(['message' => 'تم حذف الماركة بنجاح.']);
    }
}
