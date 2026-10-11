<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['category', 'brand', 'search', 'min_price', 'max_price', 'sort']);

        $products = Product::query()
            ->active()
            ->with(['category:id,name_ar,slug', 'brand:id,name_ar,slug', 'images'])
            ->filter($filters)
            ->paginate($request->integer('per_page', 12));

        return response()->json($products);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::query()
            ->active()
            ->with(['category:id,name_ar,slug', 'brand:id,name_ar,slug', 'images'])
            ->where('slug', $slug)
            ->firstOrFail();

        $related = Product::query()
            ->active()
            ->with(['category:id,name_ar,slug', 'images'])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->limit(4)
            ->get();

        return response()->json([
            'product' => $product,
            'related' => $related,
        ]);
    }
}
