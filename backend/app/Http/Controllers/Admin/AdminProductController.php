<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $products = Product::query()
            ->with(['category:id,name_ar', 'brand:id,name_ar', 'images'])
            ->when($request->input('search'), fn ($q, $v) => $q->where('name_ar', 'like', "%{$v}%"))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($products);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        $data['slug'] = Str::slug($data['name_ar']) ?: Str::random(8);
        $data['slug'] .= '-' . Str::lower(Str::random(5));

        $product = Product::create($data);

        if (! empty($data['_images'])) {
            foreach ($data['_images'] as $i => $path) {
                $product->images()->create(['path' => $path, 'is_primary' => $i === 0]);
            }
        }

        return response()->json($product->load('images'), 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json($product->load(['category:id,name_ar', 'brand:id,name_ar', 'images']));
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $this->validated($request, $product->id);

        if (isset($data['name_ar']) && trim($data['name_ar']) !== $product->name_ar) {
            unset($data['slug']);
        }

        $product->update($data);

        if (isset($data['_images'])) {
            $product->images()->delete();
            foreach ($data['_images'] as $i => $path) {
                $product->images()->create(['path' => $path, 'is_primary' => $i === 0]);
            }
        }

        return response()->json($product->load('images'));
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(['message' => 'تم حذف المنتج بنجاح.']);
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate(['image' => ['required', 'image', 'max:4096']]);

        $path = $request->file('image')->store('products', 'public');

        return response()->json(['path' => $path, 'url' => asset('storage/' . $path)], 201);
    }

    private function validated(Request $request, ?int $id = null): array
    {
        return $request->validate([
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')],
            'brand_id' => ['nullable', 'integer', Rule::exists('brands', 'id')],
            'name_ar' => ['required', 'string', 'max:255'],
            'description_ar' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'discount_price' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'sku' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
            '_images' => ['nullable', 'array'],
            '_images.*' => ['string'],
        ]);
    }
}
