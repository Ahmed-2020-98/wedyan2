<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $secret = config('services.stripe.webhook_secret');
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        try {
            $event = $secret
                ? Webhook::constructEvent($payload, $sigHeader, $secret)
                : json_decode($payload, false);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Invalid webhook payload.'], 400);
        }

        if (($event->type ?? null) === 'checkout.session.completed') {
            $session = $event->data->object;
            $orderId = $session->client_reference_id ?? null;

            if ($orderId && ($session->payment_status ?? null) === 'paid') {
                Order::where('id', $orderId)
                    ->whereNull('paid_at')
                    ->update(['status' => 'paid', 'paid_at' => now()]);
            }
        }

        return response()->json(['received' => true]);
    }
}
