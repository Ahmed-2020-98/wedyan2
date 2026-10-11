import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ApiService, imageUrl } from '../../core/api.service';
import { CartService } from '../../core/cart.service';
import { Product } from '../../core/models';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-product-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, ProductCardComponent],
  template: `
    <div class="container">
      @if (product(); as p) {
        <div class="detail card">
          <div class="gallery">
            @if (image(); as src) {
              <img [src]="src" [alt]="p.name_ar" />
            } @else {
              <div class="no-img">لا توجد صورة</div>
            }
          </div>
          <div class="info">
            <h1>{{ p.name_ar }}</h1>
            <p class="meta">
              @if (p.brand; as brand) {
                <span>الماركة: <strong>{{ brand.name_ar }}</strong></span>
              }
              @if (p.category; as category) {
                <span>التصنيف: <strong>{{ category.name_ar }}</strong></span>
              }
            </p>
            <div class="price-row">
              <span class="price">{{ effectivePrice() | number: '1.0-2' }} ر.س</span>
              @if (p.discount_price; as old) {
                <span class="old">{{ p.price | number: '1.0-2' }} ر.س</span>
                <span class="badge">وفّر {{ discountPercent() }}%</span>
              }
            </div>
            <p class="stock">
              @if (p.stock > 0) {
                ✅ متوفر ({{ p.stock }} قطعة)
              } @else {
                ❌ غير متوفر حالياً
              }
            </p>
            @if (p.description_ar) {
              <p class="desc">{{ p.description_ar }}</p>
            }
            <div class="actions">
              <label>
                الكمية:
                <input type="number" min="1" max="99" [value]="quantity()" (input)="onQty($event)" />
              </label>
              <button
                class="btn btn-primary"
                [disabled]="p.stock === 0"
                (click)="addToCart()"
              >
                أضف إلى السلة 🛒
              </button>
              <a routerLink="/cart" class="btn btn-dark">اذهب للسلة</a>
            </div>
          </div>
        </div>

        @if (related().length) {
          <h2 class="section-title">منتجات مشابهة</h2>
          <div class="grid">
            @for (rp of related(); track rp.id) {
              <app-product-card [product]="rp" />
            }
          </div>
        }
      } @else if (!loading()) {
        <p class="empty card">المنتج غير موجود.</p>
      }
    </div>
  `,
  styles: [
    `
      .detail {
        display: grid;
        grid-template-columns: minmax(280px, 420px) 1fr;
        gap: 2rem;
        padding: 1.5rem;

        @media (max-width: 760px) {
          grid-template-columns: 1fr;
        }
      }

      .gallery {
        aspect-ratio: 1;
        background: #eef1f6;
        border-radius: 12px;
        overflow: hidden;
        display: grid;
        place-items: center;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .no-img {
        color: #9aa3b5;
      }

      h1 {
        margin: 0 0 0.5rem;
        font-size: 1.5rem;
      }

      .meta {
        color: #7c869c;
        font-size: 0.9rem;
        display: flex;
        gap: 1.5rem;
        margin: 0 0 1rem;
      }

      .price-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
      }

      .price {
        font-size: 1.6rem;
        font-weight: 900;
        color: #2563eb;
      }

      .old {
        text-decoration: line-through;
        color: #9aa3b5;
      }

      .badge {
        background: #fee2e2;
        color: #dc2626;
        border-radius: 999px;
        padding: 0.2rem 0.7rem;
        font-weight: 700;
        font-size: 0.85rem;
      }

      .stock {
        font-weight: 600;
        margin: 0 0 0.75rem;
      }

      .desc {
        line-height: 1.8;
        color: #4b5563;
        margin-bottom: 1.25rem;
      }

      .actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;

        label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        input {
          width: 80px;
        }
      }

      .section-title {
        margin: 2rem 0 1rem;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1rem;
      }

      .empty {
        padding: 3rem;
        text-align: center;
      }
    `,
  ],
})
export class ProductDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private cart = inject(CartService);

  product = signal<Product | null>(null);
  related = signal<Product[]>([]);
  loading = signal(true);
  quantity = signal(1);

  effectivePrice(): number {
    const p = this.product();

    return p ? (p.discount_price ?? p.price) : 0;
  }

  discountPercent(): number {
    const p = this.product()!;

    return Math.round((1 - p.discount_price! / p.price) * 100);
  }

  image(): string {
    return this.product() ? imageUrl(this.product()!) : '';
  }

  onQty(event: Event): void {
    this.quantity.set(Math.min(99, Math.max(1, Number((event.target as HTMLInputElement).value))));
  }

  addToCart(): void {
    const p = this.product()!;

    this.cart.add({
      product_id: p.id,
      name_ar: p.name_ar,
      slug: p.slug,
      price: this.effectivePrice(),
      quantity: this.quantity(),
      image: this.image(),
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug')!;
      this.loading.set(true);
      this.quantity.set(1);

      this.api.product(slug).subscribe({
        next: (res) => {
          this.product.set(res.product);
          this.related.set(res.related);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    });
  }
}
