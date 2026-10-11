<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'brand_id',
        'name_ar',
        'slug',
        'description_ar',
        'price',
        'discount_price',
        'stock',
        'sku',
        'is_active',
    ];

    protected $casts = ['is_active' => 'boolean', 'price' => 'float', 'discount_price' => 'float'];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function effectivePrice(): float
    {
        return (float) ($this->discount_price ?? $this->price);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeFilter(Builder $query, array $filters): Builder
    {
        $query->when($filters['category'] ?? null, fn ($q, $v) => $q->whereHas('category', fn ($c) => $c->where('slug', $v)))
            ->when($filters['brand'] ?? null, fn ($q, $v) => $q->whereHas('brand', fn ($b) => $b->where('slug', $v)))
            ->when($filters['search'] ?? null, fn ($q, $v) => $q->where(fn ($w) => $w
                ->where('name_ar', 'like', "%{$v}%")
                ->orWhere('description_ar', 'like', "%{$v}%")))
            ->when($filters['min_price'] ?? null, fn ($q, $v) => $q->whereRaw('COALESCE(discount_price, price) >= ?', [$v]))
            ->when($filters['max_price'] ?? null, fn ($q, $v) => $q->whereRaw('COALESCE(discount_price, price) <= ?', [$v]));

        match ($filters['sort'] ?? null) {
            'price_asc' => $query->orderByRaw('COALESCE(discount_price, price) asc'),
            'price_desc' => $query->orderByRaw('COALESCE(discount_price, price) desc'),
            'newest' => $query->latest(),
            default => $query->latest(),
        };

        return $query;
    }
}
