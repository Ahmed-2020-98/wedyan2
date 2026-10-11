<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'value',
        'min_total',
        'starts_at',
        'ends_at',
        'usage_limit',
        'used_count',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'value' => 'float',
        'min_total' => 'float',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function isValidFor(float $total): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->starts_at && now()->lt($this->starts_at)) {
            return false;
        }

        if ($this->ends_at && now()->gt($this->ends_at)) {
            return false;
        }

        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return false;
        }

        return $total >= (float) $this->min_total;
    }

    public function discountFor(float $subtotal): float
    {
        $discount = $this->type === 'percent'
            ? $subtotal * ((float) $this->value / 100)
            : min((float) $this->value, $subtotal);

        return round($discount, 2);
    }
}
