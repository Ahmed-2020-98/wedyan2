import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/cart.service';
import { imageUrl } from '../../core/api.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink],
  template: `
    <a [routerLink]="['/product', product().slug]" class="card product-card">
      <div class="thumb">
        @if (image(); as src) {
          <img [src]="src" [alt]="product().name_ar" loading="lazy" />
        } @else {
          <span class="placeholder">لا توجد صورة</span>
        }
        @if (product().discount_price; as discounted) {
          <span class="discount-badge">
            خصم {{ discountPercent() }}%
          </span>
        }
      </div>
      <div class="body">
        <h3>{{ product().name_ar }}</h3>
        <p class="brand">{{ product().brand?.name_ar || '' }}</p>
        <div class="price-row">
          <span class="price">{{ effectivePrice() | number: '1.0-2' }} ر.س</span>
          @if (product().discount_price; as discounted) {
            <span class="old-price">{{ product().price | number: '1.0-2' }}</span>
          }
        </div>
      </div>
    </a>
    <button class="btn btn-primary add-btn" (click)="addToCart()">أضف إلى السلة</button>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
      }

      .product-card {
        display: block;
        overflow: hidden;
        transition: transform 0.15s;

        &:hover {
          transform: translateY(-3px);
        }
      }

      .thumb {
        position: relative;
        aspect-ratio: 1;
        background: #eef1f6;
        display: grid;
        place-items: center;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .placeholder {
        color: #9aa3b5;
        font-size: 0.85rem;
      }

      .discount-badge {
        position: absolute;
        top: 10px;
        inset-inline-start: 10px;
        background: #dc2626;
        color: #fff;
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.2rem 0.55rem;
        border-radius: 999px;
      }

      .body {
        padding: 0.85rem;

        h3 {
          margin: 0 0 0.25rem;
          font-size: 0.95rem;
          line-height: 1.4;
          height: 2.7em;
          overflow: hidden;
        }
      }

      .brand {
        margin: 0 0 0.4rem;
        color: #7c869c;
        font-size: 0.8rem;
        min-height: 1em;
      }

      .price-row {
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
      }

      .price {
        font-weight: 800;
        color: #2563eb;
      }

      .old-price {
        color: #9aa3b5;
        text-decoration: line-through;
        font-size: 0.85rem;
      }

      .add-btn {
        margin-top: 0.5rem;
        width: 100%;
      }
    `,
  ],
})
export class ProductCardComponent {
  product = input.required<Product>();
  added = output<void>();

  cart = inject(CartService);

  image(): string {
    return imageUrl(this.product());
  }

  effectivePrice(): number {
    return this.product().discount_price ?? this.product().price;
  }

  discountPercent(): number {
    const p = this.product();

    if (!p.discount_price) {
      return 0;
    }

    return Math.round((1 - p.discount_price / p.price) * 100);
  }

  addToCart(): void {
    this.cart.add({
      product_id: this.product().id,
      name_ar: this.product().name_ar,
      slug: this.product().slug,
      price: this.effectivePrice(),
      quantity: 1,
      image: this.image(),
    });
    this.added.emit();
  }
}
