<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        $salesTotal = (float) Order::query()->whereIn('status', ['paid', 'processing', 'shipped', 'delivered'])->sum('total');
        $ordersCount = Order::count();
        $productsCount = Product::count();
        $customersCount = User::where('role', 'customer')->count();

        $salesByDay = Order::query()
            ->whereIn('status', ['paid', 'processing', 'shipped', 'delivered'])
            ->whereBetween('created_at', [now()->subDays(13)->startOfDay(), now()->endOfDay()])
            ->selectRaw('DATE(created_at) as day, SUM(total) as total')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        $ordersByStatus = Order::query()
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $topProducts = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereIn('orders.status', ['paid', 'processing', 'shipped', 'delivered'])
            ->selectRaw('order_items.product_name_ar as name, SUM(order_items.quantity) as sold, SUM(order_items.price * order_items.quantity) as revenue')
            ->groupBy('order_items.product_name_ar')
            ->orderByDesc('sold')
            ->limit(5)
            ->get();

        $recentOrders = Order::query()->with('user:id,name')->latest()->limit(8)->get();

        return response()->json([
            'sales_total' => $salesTotal,
            'orders_count' => $ordersCount,
            'products_count' => $productsCount,
            'customers_count' => $customersCount,
            'sales_by_day' => $salesByDay,
            'orders_by_status' => $ordersByStatus,
            'top_products' => $topProducts,
            'recent_orders' => $recentOrders,
        ]);
    }
}
