import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../core/api.service';

@Component({
  selector: 'app-categories',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="head">
      <h1>التصنيفات</h1>
      <button class="btn btn-primary" (click)="openForm()">+ تصنيف جديد</button>
    </div>

    <div class="card table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>#</th><th>الاسم</th><th>المعرف (slug)</th><th>عدد المنتجات</th><th>الحالة</th><th></th></tr>
        </thead>
        <tbody>
          @for (category of categories(); track category.id) {
            <tr>
              <td>{{ category.id }}</td>
              <td>{{ category.name_ar }}</td>
              <td dir="ltr">{{ category.slug }}</td>
              <td>{{ category.products_count ?? 0 }}</td>
              <td>
                <span [class]="'pill ' + (category.is_active ? 'pill-delivered' : 'pill-cancelled')">
                  {{ category.is_active ? 'نشط' : 'مخفي' }}
                </span>
              </td>
              <td class="actions">
                <button class="edit-btn" (click)="openForm(category)">تعديل</button>
                <button class="del-btn" (click)="remove(category)">حذف</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if (formOpen()) {
      <div class="modal-backdrop" (click)="formOpen.set(false)">
        <div class="modal card" (click)="$event.stopPropagation()">
          <h2>{{ editingId() ? 'تعديل التصنيف' : 'تصنيف جديد' }}</h2>
          <label>الاسم<input type="text" [(ngModel)]="name" /></label>
          <label class="check"><input type="checkbox" [(ngModel)]="isActive" /> نشط</label>
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

      .pill-delivered {
        background: #dcfce7;
        color: #15803d;
        font-size: 0.78rem;
        font-weight: 700;
        padding: 0.15rem 0.65rem;
        border-radius: 999px;
      }

      .pill-cancelled {
        background: #fee2e2;
        color: #dc2626;
        font-size: 0.78rem;
        font-weight: 700;
        padding: 0.15rem 0.65rem;
        border-radius: 999px;
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
export class CategoriesPage implements OnInit {
  private api = inject(AdminApiService);

  categories = signal<{ id: number; name_ar: string; slug: string; is_active: boolean; products_count?: number }[]>([]);
  formOpen = signal(false);
  editingId = signal<number | null>(null);
  error = signal('');

  name = '';
  isActive = true;

  ngOnInit(): void {
    this.load();
  }

  openForm(category?: { id: number; name_ar: string; is_active: boolean }): void {
    this.error.set('');
    this.editingId.set(category?.id ?? null);
    this.name = category?.name_ar ?? '';
    this.isActive = category?.is_active ?? true;
    this.formOpen.set(true);
  }

  save(): void {
    if (!this.name.trim()) {
      this.error.set('الاسم مطلوب.');
      return;
    }

    const payload = { name_ar: this.name.trim(), is_active: this.isActive };
    const request = this.editingId()
      ? this.api.updateCategory(this.editingId()!, payload)
      : this.api.createCategory(payload);

    request.subscribe(() => {
      this.formOpen.set(false);
      this.load();
    });
  }

  remove(category: { id: number; name_ar: string }): void {
    if (!confirm(`حذف التصنيف «${category.name_ar}»؟`)) {
      return;
    }

    this.api.deleteCategory(category.id).subscribe(() => this.load());
  }

  private load(): void {
    this.api.categories().subscribe((categories) => this.categories.set(categories));
  }
}
