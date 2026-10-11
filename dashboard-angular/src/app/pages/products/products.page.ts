import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService, imageUrl } from '../../core/api.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule],
  template: `
    <div class="head">
      <h1>المنتجات</h1>
      <button class="btn btn-primary" (click)="openForm()">+ منتج جديد</button>
    </div>

    <div class="card table-wrap">
      <input
        class="search"
        type="search"
        placeholder="ابحث..."
        [ngModel]="search()"
        (ngModelChange)="onSearch($event)"
      />
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>المنتج</th>
            <th>التصنيف</th>
            <th>الماركة</th>
            <th>السعر</th>
            <th>المخزون</th>
            <th>الحالة</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (product of products(); track product.id) {
            <tr>
              <td>{{ product.id }}</td>
              <td class="name-cell">
                @if (product.images.length) {
                  <img [src]="imageUrl(product.images[0].path)" alt="" />
                }
                {{ product.name_ar }}
              </td>
              <td>{{ product.category?.name_ar }}</td>
              <td>{{ product.brand?.name_ar || '—' }}</td>
              <td>{{ effectivePrice(product) | number: '1.0-2' }} ر.س</td>
              <td>{{ product.stock }}</td>
              <td>
                <span [class]="'pill ' + (product.is_active ? 'pill-delivered' : 'pill-cancelled')">
                  {{ product.is_active ? 'نشط' : 'مخفي' }}
                </span>
              </td>
              <td class="actions">
                <button class="edit-btn" (click)="openForm(product)">تعديل</button>
                <button class="del-btn" (click)="deleteProduct(product)">حذف</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="8" class="empty-row">لا توجد منتجات.</td></tr>
          }
        </tbody>
      </table>

      @if (lastPage() > 1) {
        <div class="pagination">
          @for (page of pages(); track page) {
            <button class="page-btn" [class.active]="page === currentPage()" (click)="goToPage(page)">
              {{ page }}
            </button>
          }
        </div>
      }
    </div>

    @if (formOpen()) {
      <div class="modal-backdrop" (click)="formOpen.set(false)">
        <div class="modal card" (click)="$event.stopPropagation()">
          <h2>{{ editingId() ? 'تعديل منتج' : 'منتج جديد' }}</h2>

          <label>اسم المنتج<input type="text" [(ngModel)]="form.name_ar" /></label>
          <div class="row2">
            <label>التصنيف
              <select [(ngModel)]="form.category_id">
                @for (category of categories(); track category.id) {
                  <option [value]="category.id">{{ category.name_ar }}</option>
                }
              </select>
            </label>
            <label>الماركة
              <select [(ngModel)]="form.brand_id">
                <option [value]="null">— بدون —</option>
                @for (brand of brands(); track brand.id) {
                  <option [value]="brand.id">{{ brand.name_ar }}</option>
                }
              </select>
            </label>
          </div>
          <label>الوصف<textarea rows="3" [(ngModel)]="form.description_ar"></textarea></label>
          <div class="row2">
            <label>السعر<input type="number" min="0" step="0.01" [(ngModel)]="form.price" /></label>
            <label>سعر الخصم (اختياري)<input type="number" min="0" step="0.01" [(ngModel)]="form.discount_price" /></label>
          </div>
          <div class="row2">
            <label>المخزون<input type="number" min="0" [(ngModel)]="form.stock" /></label>
            <label>رمز SKU<input type="text" [(ngModel)]="form.sku" /></label>
          </div>
          <label class="check">
            <input type="checkbox" [(ngModel)]="form.is_active" /> نشط ومرئي في المتجر
          </label>

          <label class="imgs-label">صور المنتج</label>
          <div class="images">
            @for (img of formImages(); track img.path) {
              <div class="img-box">
                <img [src]="imageUrl(img.path)" alt="" />
                <button type="button" class="img-del" (click)="removeImage(img.path)">✕</button>
              </div>
            }
            <label class="upload-btn">
              + إضافة صورة
              <input type="file" accept="image/*" hidden (change)="onFileSelected($event)" />
            </label>
          </div>

          @if (error()) {
            <p class="error">{{ error() }}</p>
          }

          <div class="modal-actions">
            <button class="btn btn-primary" [disabled]="saving()" (click)="save()">
              {{ saving() ? 'جارٍ الحفظ...' : 'حفظ' }}
            </button>
            <button class="btn btn-outline" (click)="formOpen.set(false)">إلغاء</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;

        h1 {
          margin: 0;
        }
      }

      .table-wrap {
        padding: 1.25rem;
        overflow-x: auto;
      }

      .search {
        margin-bottom: 1rem;
        width: 280px;
      }

      .name-cell {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-weight: 600;

        img {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          object-fit: cover;
          background: #eef1f6;
        }
      }

      .pill {
        font-size: 0.78rem;
        font-weight: 700;
        padding: 0.15rem 0.65rem;
        border-radius: 999px;
        white-space: nowrap;
      }

      .pill-pending,
      .pill-paid,
      .pill-processing,
      .pill-shipped {
        background: #dbeafe;
        color: #1d4ed8;
      }

      .pill-delivered {
        background: #dcfce7;
        color: #15803d;
      }

      .pill-cancelled {
        background: #fee2e2;
        color: #dc2626;
      }

      .actions {
        white-space: nowrap;

        button {
          border: none;
          background: none;
          font-weight: 700;
          padding-inline: 0.4rem;
        }

        .edit-btn {
          color: #4f46e5;
        }

        .del-btn {
          color: #dc2626;
        }
      }

      .empty-row {
        text-align: center;
        color: #9aa3b5;
      }

      .pagination {
        display: flex;
        gap: 0.35rem;
        margin-top: 1rem;
      }

      .page-btn {
        min-width: 34px;
        height: 34px;
        border: 1px solid #d7dbe4;
        background: #fff;
        border-radius: 8px;
        font-weight: 700;

        &.active {
          background: #4f46e5;
          color: #fff;
          border-color: #4f46e5;
        }
      }

      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.45);
        display: grid;
        place-items: center;
        z-index: 100;
      }

      .modal {
        width: min(640px, 92vw);
        max-height: 90vh;
        overflow-y: auto;
        padding: 1.75rem;

        h2 {
          margin: 0 0 1rem;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          font-size: 0.88rem;
          font-weight: 600;
          margin-bottom: 0.85rem;

          input,
          select,
          textarea {
            width: 100%;
          }
        }

        .row2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }

        .check {
          flex-direction: row !important;
          align-items: center;
          gap: 0.5rem !important;
        }
      }

      .imgs-label {
        font-size: 0.88rem;
        font-weight: 600;
      }

      .images {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
        margin-block: 0.6rem 1rem;
      }

      .img-box {
        position: relative;

        img {
          width: 72px;
          height: 72px;
          object-fit: cover;
          border-radius: 10px;
        }

        .img-del {
          position: absolute;
          top: -7px;
          inset-inline-start: -7px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: none;
          background: #dc2626;
          color: #fff;
          font-size: 0.7rem;
        }
      }

      .upload-btn {
        width: 72px;
        height: 72px;
        border: 2px dashed #c7cbe0;
        border-radius: 10px;
        display: grid;
        place-items: center;
        color: #7c869c;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        text-align: center;
      }

      .modal-actions {
        display: flex;
        gap: 0.6rem;
      }

      .error {
        color: #dc2626;
        font-weight: 700;
      }
    `,
  ],
})
export class ProductsPage implements OnInit {
  private api = inject(AdminApiService);

  products = signal<Product[]>([]);
  categories = signal<{ id: number; name_ar: string }[]>([]);
  brands = signal<{ id: number; name_ar: string }[]>([]);

  search = signal('');
  currentPage = signal(1);
  lastPage = signal(1);
  pages = signal<number[]>([]);

  formOpen = signal(false);
  saving = signal(false);
  error = signal('');
  editingId = signal<number | null>(null);
  formImages = signal<{ path: string }[]>([]);

  form = this.emptyForm();

  imageUrl = imageUrl;
  effectivePrice(product: Product): number {
    return product.discount_price ?? product.price;
  }

  ngOnInit(): void {
    this.load();
    this.api.categories().subscribe((categories) => this.categories.set(categories));
    this.api.brands().subscribe((brands) => this.brands.set(brands));
  }

  openForm(product?: Product): void {
    this.error.set('');

    if (product) {
      this.editingId.set(product.id);
      this.form = {
        category_id: String(product.category_id),
        brand_id: product.brand_id ? String(product.brand_id) : '',
        name_ar: product.name_ar,
        description_ar: product.description_ar ?? '',
        price: String(product.price),
        discount_price: product.discount_price !== null ? String(product.discount_price) : '',
        stock: String(product.stock),
        sku: product.sku ?? '',
        is_active: product.is_active,
      };
      this.formImages.set(product.images.map((i) => ({ path: i.path })));
    } else {
      this.editingId.set(null);
      this.form = this.emptyForm();
      this.formImages.set([]);
    }

    this.formOpen.set(true);
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.currentPage.set(1);
    this.load();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.load();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.[0]) {
      return;
    }

    this.api.uploadImage(input.files[0]).subscribe({
      next: (res) => this.formImages.update((imgs) => [...imgs, { path: res.path }]),
      error: () => this.error.set('فشل رفع الصورة.'),
    });

    input.value = '';
  }

  removeImage(path: string): void {
    this.formImages.update((imgs) => imgs.filter((i) => i.path !== path));
  }

  save(): void {
    if (!this.form.name_ar || !this.form.price) {
      this.error.set('الاسم والسعر مطلوبان.');
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const payload = {
      category_id: Number(this.form.category_id),
      brand_id: this.form.brand_id ? Number(this.form.brand_id) : null,
      name_ar: this.form.name_ar,
      description_ar: this.form.description_ar || null,
      price: Number(this.form.price),
      discount_price: this.form.discount_price ? Number(this.form.discount_price) : null,
      stock: Number(this.form.stock),
      sku: this.form.sku || null,
      is_active: this.form.is_active,
      _images: this.formImages().map((i) => i.path),
    };

    const request = this.editingId()
      ? this.api.updateProduct(this.editingId()!, payload)
      : this.api.createProduct(payload);

    request.subscribe({
      next: () => {
        this.formOpen.set(false);
        this.saving.set(false);
        this.load();
      },
      error: (err) => {
        const messages = err.error?.errors ? Object.values(err.error.errors).flat().join('، ') : null;
        this.error.set(messages ? String(messages) : 'حدث خطأ أثناء الحفظ.');
        this.saving.set(false);
      },
    });
  }

  deleteProduct(product: Product): void {
    if (!confirm(`هل تريد حذف المنتج «${product.name_ar}»؟`)) {
      return;
    }

    this.api.deleteProduct(product.id).subscribe(() => this.load());
  }

  private load(): void {
    this.api
      .products({ search: this.search(), page: this.currentPage(), per_page: 10 })
      .subscribe((res) => {
        this.products.set(res.data);
        this.lastPage.set(res.last_page);
        this.pages.set(Array.from({ length: res.last_page }, (_, i) => i + 1));
      });
  }

  private emptyForm() {
    return {
      category_id: '',
      brand_id: '',
      name_ar: '',
      description_ar: '',
      price: '',
      discount_price: '',
      stock: '0',
      sku: '',
      is_active: true,
    };
  }
}
