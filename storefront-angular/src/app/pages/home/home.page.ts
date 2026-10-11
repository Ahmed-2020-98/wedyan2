import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, imageUrl } from '../../core/api.service';
import { Category, Product } from '../../core/models';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProductCardComponent],
  template: `
    <section class="hero card">
      <div class="container hero-inner">
        <div>
          <h1>تسوّق بكل سهولة وأمان</h1>
          <p>تشكيلة واسعة من الإلكترونيات والأزياء ومستلزمات المنزل بأفضل الأسعار</p>
          <a routerLink="/products" class="btn btn-primary">تصفح المنتجات الآن</a>
        </div>
        <div class="hero-icon">🛒</div>
      </div>
    </section>

    <section class="container section">
      <h2 class="section-title">التصنيفات</h2>
      <div class="cats-grid">
        @for (category of categories(); track category.id) {
          <a
            [routerLink]="['/products']"
            [queryParams]="{ category: category.slug }"
            class="card cat-card"
          >
            <span class="cat-name">{{ category.name_ar }}</span>
            <span class="cat-count">{{ category.products_count || 0 }} منتج</span>
          </a>
        }
      </div>
    </section>

    <section class="container section">
      <div class="section-head">
        <h2 class="section-title">أحدث المنتجات</h2>
        <a routerLink="/products" class="see-all">عرض الكل ←</a>
      </div>
      <div class="products-grid">
        @for (product of latest(); track product.id) {
          <app-product-card [product]="product" />
        } @empty {
          <p>لا توجد منتجات حالياً.</p>
        }
      </div>
    </section>

    <section class="container section">
      <h2 class="section-title">عروض وخصومات 🔥</h2>
      <div class="products-grid">
        @for (product of discounted(); track product.id) {
          <app-product-card [product]="product" />
        }
      </div>
    </section>
  `,
  styles: [
    `
      .hero {
        background: linear-gradient(120deg, #2563eb, #1e40af);
        color: #fff;
        margin-bottom: 2rem;
        overflow: hidden;
      }

      .hero-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-block: 3rem;

        h1 {
          font-size: 2rem;
          margin: 0 0 0.5rem;
        }

        p {
          opacity: 0.9;
          margin: 0 0 1.25rem;
        }

        .btn {
          background: #fff;
          color: #1e40af;
        }
      }

      .hero-icon {
        font-size: 6rem;
      }

      .section {
        margin-bottom: 2.5rem;
      }

      .section-title {
        font-size: 1.35rem;
        margin: 0 0 1rem;
      }

      .section-head {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .see-all {
          color: #2563eb;
          font-weight: 600;
        }
      }

      .cats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1rem;
      }

      .cat-card {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        transition: transform 0.15s;

        &:hover {
          transform: translateY(-3px);
        }
      }

      .cat-name {
        font-weight: 800;
        font-size: 1.1rem;
      }

      .cat-count {
        color: #7c869c;
        font-size: 0.85rem;
      }

      .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
        gap: 1rem;
      }
    `,
  ],
})
export class HomePage implements OnInit {
  private api = inject(ApiService);

  categories = signal<Category[]>([]);
  latest = signal<Product[]>([]);
  discounted = signal<Product[]>([]);

  ngOnInit(): void {
    this.api.categories().subscribe((categories) => this.categories.set(categories));
    this.api.products({ per_page: 8 }).subscribe((res) => this.latest.set(res.data));

    this.api.products({ sort: 'newest', per_page: 30 }).subscribe((res) => {
      const discountedProducts = res.data.filter((p) => p.discount_price !== null).slice(0, 4);

      if (discountedProducts.length === 0) {
        discountedProducts.push(...res.data.slice(0, 4));
      }

      this.discounted.set(discountedProducts);
    });
  }

  img(product: Product): string {
    return imageUrl(product);
  }
}
