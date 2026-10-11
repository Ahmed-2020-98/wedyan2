<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->with('items')
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::query()
            ->where('user_id', $request->user()->id)
            ->with('items')
            ->findOrFail($id);

        return response()->json($order);
    }
}
