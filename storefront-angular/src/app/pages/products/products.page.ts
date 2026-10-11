import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Brand, Category, Product } from '../../core/models';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ProductCardComponent],
  template: `
    <div class="container layout">
      <aside class="filters card">
        <h3>الفلاتر</h3>

        <label class="field">
          بحث
          <input
            type="search"
            placeholder="ابحث عن منتج..."
            [ngModel]="search()"
            (ngModelChange)="search.set($event); applyFilters()"
          />
        </label>

        <label class="field">
          التصنيف
          <select [ngModel]="category()" (ngModelChange)="category.set($event); applyFilters()">
            <option value="">الكل</option>
            @for (c of categories(); track c.id) {
              <option [value]="c.slug">{{ c.name_ar }}</option>
            }
          </select>
        </label>

        <label class="field">
          الماركة
          <select [ngModel]="brand()" (ngModelChange)="brand.set($event); applyFilters()">
            <option value="">الكل</option>
            @for (b of brands(); track b.id) {
              <option [value]="b.slug">{{ b.name_ar }}</option>
            }
          </select>
        </label>

        <div class="price-fields">
          <label>
            من (ر.س)
            <input type="number" min="0" [ngModel]="minPrice()" (ngModelChange)="minPrice.set($event)" />
          </label>
          <label>
            إلى (ر.س)
            <input type="number" min="0" [ngModel]="maxPrice()" (ngModelChange)="maxPrice.set($event)" />
          </label>
          <button class="btn btn-outline" (click)="applyFilters()">تطبيق</button>
        </div>

        <button class="clear-btn" (click)="clearFilters()">مسح الفلاتر ✕</button>
      </aside>

      <section>
        <div class="toolbar">
          <span>{{ total() }} منتج</span>
          <select [ngModel]="sort()" (ngModelChange)="sort.set($event); applyFilters()">
            <option value="newest">الأحدث</option>
            <option value="price_asc">الأقل سعراً</option>
            <option value="price_desc">الأعلى سعراً</option>
          </select>
        </div>

        <div class="grid">
          @for (product of products(); track product.id) {
            <app-product-card [product]="product" />
          } @empty {
            <p class="empty card">لا توجد منتجات مطابقة للبحث.</p>
          }
        </div>

        @if (lastPage() > 1) {
          <div class="pagination">
            @for (page of pages(); track page) {
              <button
                class="page-btn"
                [class.active]="page === currentPage()"
                (click)="goToPage(page)"
              >
                {{ page }}
              </button>
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: [
    `
      .layout {
        display: grid;
        grid-template-columns: 260px 1fr;
        gap: 1.5rem;

        @media (max-width: 860px) {
          grid-template-columns: 1fr;
        }
      }

      .filters {
        align-self: start;
        padding: 1.25rem;
        position: sticky;
        top: 80px;

        h3 {
          margin: 0 0 1rem;
        }
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-weight: 600;
        font-size: 0.9rem;
        margin-bottom: 1rem;

        input,
        select {
          width: 100%;
        }
      }

      .price-fields {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;

        label {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          font-size: 0.9rem;
          font-weight: 600;
        }
      }

      .clear-btn {
        background: none;
        border: none;
        color: #dc2626;
        font-weight: 600;
        padding: 0;
      }

      .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;

        select {
          width: auto;
        }
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1rem;
      }

      .empty {
        padding: 3rem;
        text-align: center;
        grid-column: 1 / -1;
      }

      .pagination {
        display: flex;
        justify-content: center;
        gap: 0.4rem;
        margin-top: 2rem;
      }

      .page-btn {
        min-width: 38px;
        height: 38px;
        border: 1px solid #d7dbe4;
        background: #fff;
        border-radius: 8px;
        font-weight: 700;

        &.active {
          background: #2563eb;
          color: #fff;
          border-color: #2563eb;
        }
      }
    `,
  ],
})
export class ProductsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);
  products = signal<Product[]>([]);

  search = signal('');
  category = signal('');
  brand = signal('');
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  sort = signal('newest');

  currentPage = signal(1);
  lastPage = signal(1);
  total = signal(0);

  pages = computed(() => Array.from({ length: this.lastPage() }, (_, i) => i + 1));

  ngOnInit(): void {
    this.api.categories().subscribe((categories) => this.categories.set(categories));
    this.api.brands().subscribe((brands) => this.brands.set(brands));

    this.route.queryParamMap.subscribe((params) => {
      this.category.set(params.get('category') ?? '');
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.load();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFilters(): void {
    this.search.set('');
    this.category.set('');
    this.brand.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.sort.set('newest');
    this.applyFilters();
  }

  private load(): void {
    this.api
      .products({
        search: this.search(),
        category: this.category(),
        brand: this.brand(),
        min_price: this.minPrice() ?? undefined,
        max_price: this.maxPrice() ?? undefined,
        sort: this.sort(),
        page: this.currentPage(),
      })
      .subscribe((res) => {
        this.products.set(res.data);
        this.lastPage.set(res.last_page);
        this.total.set(res.total);
      });
  }
}
