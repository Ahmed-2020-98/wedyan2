<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Stripe\StripeClient;

class CheckoutController extends Controller
{
    public function config(): JsonResponse
    {
        return response()->json([
            'stripe_enabled' => (bool) config('services.stripe.secret'),
            'currency' => 'SAR',
        ]);
    }

    public function coupon(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
            'subtotal' => ['required', 'numeric', 'min:0'],
        ]);

        $coupon = Coupon::where('code', strtoupper($request->string('code')))->first();

        if (! $coupon || ! $coupon->isValidFor((float) $request->input('subtotal'))) {
            return response()->json(['message' => 'كود الخصم غير صالح أو منتهي الصلاحية.'], 422);
        }

        return response()->json([
            'code' => $coupon->code,
            'type' => $coupon->type,
            'discount' => $coupon->discountFor((float) $request->input('subtotal')),
        ]);
    }

    public function placeOrder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', Rule::exists('products', 'id')],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:20'],
            'customer_email' => ['nullable', 'email'],
            'city' => ['required', 'string', 'max:100'],
            'address' => ['required', 'string', 'max:500'],
            'payment_method' => ['required', 'in:stripe,cod'],
            'coupon_code' => ['nullable', 'string'],
        ]);

        foreach ($data['items'] as $item) {
            $product = Product::findOrFail($item['product_id']);

            if (! $product->is_active || $product->stock < $item['quantity']) {
                return response()->json([
                    'message' => "المنتج «{$product->name_ar}» غير متوفر بالكمية المطلوبة.",
                ], 422);
            }
        }

        [$order, $stripeUrl] = DB::transaction(function () use ($data, $request) {
            $subtotal = 0;
            foreach ($data['items'] as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);
                $subtotal += $product->effectivePrice() * $item['quantity'];
            }

            $discount = 0;
            if (! empty($data['coupon_code'])) {
                $coupon = Coupon::where('code', strtoupper($data['coupon_code']))->first();
                if ($coupon && $coupon->isValidFor($subtotal)) {
                    $discount = $coupon->discountFor($subtotal);
                    $coupon->increment('used_count');
                }
            }

            $total = round($subtotal - $discount, 2);

            /** @var Order $order */
            $order = Order::create([
                'user_id' => $request->user()?->id,
                'status' => 'pending',
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
                'coupon_code' => $discount > 0 ? ($coupon->code ?? null) : null,
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'customer_email' => $data['customer_email'] ?? null,
                'city' => $data['city'],
                'address' => $data['address'],
                'payment_method' => $data['payment_method'],
            ]);

            foreach ($data['items'] as $item) {
                $product = Product::find($item['product_id']);

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name_ar' => $product->name_ar,
                    'price' => $product->effectivePrice(),
                    'quantity' => $item['quantity'],
                ]);

                $product->decrement('stock', $item['quantity']);
            }

            $stripeUrl = null;

            if ($order->payment_method === 'stripe') {
                $stripeUrl = $this->createStripeSession($order);

                if ($stripeUrl === null) {
                    throw new \RuntimeException('بوابة الدفع غير مهيأة حالياً.');
                }
            }

            return [$order, $stripeUrl];
        });

        return response()->json([
            'order_id' => $order->id,
            'checkout_url' => $stripeUrl,
        ], 201);
    }

    private function createStripeSession(Order $order): ?string
    {
        $secret = config('services.stripe.secret');

        if (! $secret) {
            return null;
        }

        $stripe = new StripeClient($secret);

        $session = $stripe->checkout->sessions->create([
            'mode' => 'payment',
            'success_url' => rtrim(config('app.frontend_url'), '/') . '/order-success?order=' . $order->id,
            'cancel_url' => rtrim(config('app.frontend_url'), '/') . '/checkout?cancelled=1',
            'client_reference_id' => (string) $order->id,
            'line_items' => [[
                'quantity' => 1,
                'price_data' => [
                    'currency' => 'sar',
                    'unit_amount' => (int) round($order->total * 100),
                    'product_data' => [
                        'name' => 'طلب رقم #' . $order->id . ' — ' . config('app.name'),
                    ],
                ],
            ]],
        ]);

        $order->update(['stripe_session_id' => $session->id]);

        return $session->url;
    }
}
