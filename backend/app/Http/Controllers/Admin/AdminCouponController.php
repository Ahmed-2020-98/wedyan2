<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCouponController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Coupon::query()->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        return response()->json(Coupon::create($data), 201);
    }

    public function update(Request $request, Coupon $coupon): JsonResponse
    {
        $data = $this->validated($request, $coupon->id);

        $coupon->update($data);

        return response()->json($coupon);
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        $coupon->delete();

        return response()->json(['message' => 'تم حذف الكوبون بنجاح.']);
    }

    private function validated(Request $request, ?int $id = null): array
    {
        return $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:coupons,code' . ($id ? ',' . $id : '')],
            'type' => ['required', 'in:percent,fixed'],
            'value' => ['required', 'numeric', 'min:0'],
            'min_total' => ['nullable', 'numeric', 'min:0'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['boolean'],
        ]);
    }
}
