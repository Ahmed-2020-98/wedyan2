<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    public const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

    protected $fillable = [
        'user_id',
        'status',
        'subtotal',
        'discount',
        'total',
        'coupon_code',
        'customer_name',
        'customer_phone',
        'customer_email',
        'city',
        'address',
        'payment_method',
        'stripe_session_id',
        'paid_at',
    ];

    protected $casts = ['paid_at' => 'datetime', 'subtotal' => 'float', 'discount' => 'float', 'total' => 'float'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
