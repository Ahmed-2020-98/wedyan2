<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->with(['items', 'user:id,name,email'])
            ->when($request->input('status'), fn ($q, $v) => $q->where('status', $v))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($orders);
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json($order->load(['items', 'user:id,name,email']));
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:' . implode(',', Order::STATUSES)],
        ]);

        $order->update($data);

        return response()->json($order);
    }

    public function customers(Request $request): JsonResponse
    {
        $customers = User::query()
            ->where('role', 'customer')
            ->withCount('orders')
            ->when($request->input('search'), fn ($q, $v) => $q->where(fn ($w) => $w
                ->where('name', 'like', "%{$v}%")
                ->orWhere('email', 'like', "%{$v}%")))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($customers);
    }
}
