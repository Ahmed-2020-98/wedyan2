import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../core/api.service';

@Component({
  selector: 'app-brands',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="head">
      <h1>الماركات</h1>
      <button class="btn btn-primary" (click)="openForm()">+ ماركة جديدة</button>
    </div>

    <div class="card table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>#</th><th>الاسم</th><th>المعرف (slug)</th><th>عدد المنتجات</th><th>الحالة</th><th></th></tr>
        </thead>
        <tbody>
          @for (brand of brands(); track brand.id) {
            <tr>
              <td>{{ brand.id }}</td>
              <td>{{ brand.name_ar }}</td>
              <td dir="ltr">{{ brand.slug }}</td>
              <td>{{ brand.products_count ?? 0 }}</td>
              <td>
                <span class="pill" [class.pill-delivered]="brand.is_active" [class.pill-cancelled]="!brand.is_active">
                  {{ brand.is_active ? 'نشط' : 'مخفي' }}
                </span>
              </td>
              <td class="actions">
                <button class="edit-btn" (click)="openForm(brand)">تعديل</button>
                <button class="del-btn" (click)="remove(brand)">حذف</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if (formOpen()) {
      <div class="modal-backdrop" (click)="formOpen.set(false)">
        <div class="modal card" (click)="$event.stopPropagation()">
          <h2>{{ editingId() ? 'تعديل الماركة' : 'ماركة جديدة' }}</h2>
          <label>الاسم<input type="text" [(ngModel)]="name" /></label>
          <label class="check"><input type="checkbox" [(ngModel)]="isActive" /> نشطة</label>
          @if (error()) {
            <p class="error">{{ error() }}</p>
          }
          <div class="modal-actions">
            <button class="btn btn-primary" (click)="save()">حفظ</button>
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
        padding: 0.75rem;
        overflow-x: auto;
      }

      .pill {
        font-size: 0.78rem;
        font-weight: 700;
        padding: 0.15rem 0.65rem;
        border-radius: 999px;

        &.pill-delivered {
          background: #dcfce7;
          color: #15803d;
        }

        &.pill-cancelled {
          background: #fee2e2;
          color: #dc2626;
        }
      }

      .actions button {
        border: none;
        background: none;
        font-weight: 700;
        padding-inline: 0.4rem;

        &.edit-btn {
          color: #4f46e5;
        }

        &.del-btn {
          color: #dc2626;
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
        width: min(420px, 92vw);
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

          input {
            width: 100%;
          }
        }

        .check {
          flex-direction: row !important;
          align-items: center;
        }
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
export class BrandsPage implements OnInit {
  private api = inject(AdminApiService);

  brands = signal<{ id: number; name_ar: string; slug: string; is_active: boolean; products_count?: number }[]>([]);
  formOpen = signal(false);
  editingId = signal<number | null>(null);
  error = signal('');

  name = '';
  isActive = true;

  ngOnInit(): void {
    this.load();
  }

  openForm(brand?: { id: number; name_ar: string; is_active: boolean }): void {
    this.error.set('');
    this.editingId.set(brand?.id ?? null);
    this.name = brand?.name_ar ?? '';
    this.isActive = brand?.is_active ?? true;
    this.formOpen.set(true);
  }

  save(): void {
    if (!this.name.trim()) {
      this.error.set('الاسم مطلوب.');
      return;
    }

    const payload = { name_ar: this.name.trim(), is_active: this.isActive };
    const request = this.editingId()
      ? this.api.updateBrand(this.editingId()!, payload)
      : this.api.createBrand(payload);

    request.subscribe(() => {
      this.formOpen.set(false);
      this.load();
    });
  }

  remove(brand: { id: number; name_ar: string }): void {
    if (!confirm(`حذف الماركة «${brand.name_ar}»؟`)) {
      return;
    }

    this.api.deleteBrand(brand.id).subscribe(() => this.load());
  }

  private load(): void {
    this.api.brands().subscribe((brands) => this.brands.set(brands));
  }
}
