import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../core/api.service';
import { Coupon } from '../../core/models';

@Component({
  selector: 'app-coupons',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, FormsModule],
  template: `
    <div class="head">
      <h1>الكوبونات</h1>
      <button class="btn btn-primary" (click)="openForm()">+ كوبون جديد</button>
    </div>

    <div class="card table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>الكود</th><th>النوع</th><th>القيمة</th><th>أدنى مبلغ</th>
          <th>الاستخدام</th><th>ينتهي في</th><th>الحالة</th><th></th></tr>
        </thead>
        <tbody>
          @for (coupon of coupons(); track coupon.id) {
            <tr>
              <td dir="ltr"><strong>{{ coupon.code }}</strong></td>
              <td>{{ coupon.type === 'percent' ? 'نسبة %' : 'مبلغ ثابت' }}</td>
              <td>
                {{ coupon.value | number: '1.0-2' }} @if (coupon.type === 'percent') {%} @else {ر.س}
              </td>
              <td>{{ coupon.min_total ?? 0 | number: '1.0-2' }} ر.س</td>
              <td>{{ coupon.used_count }}{{ coupon.usage_limit ? '/' + coupon.usage_limit : '' }}</td>
              <td>{{ coupon.ends_at ? (coupon.ends_at | date: 'yyyy/MM/dd') : '—' }}</td>
              <td>
                <span class="pill" [class.on]="coupon.is_active" [class.off]="!coupon.is_active">
                  {{ coupon.is_active ? 'نشط' : 'متوقف' }}
                </span>
              </td>
              <td class="actions">
                <button class="edit-btn" (click)="openForm(coupon)">تعديل</button>
                <button class="del-btn" (click)="remove(coupon)">حذف</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="8" class="empty-row">لا توجد كوبونات.</td></tr>
          }
        </tbody>
      </table>
    </div>

    @if (formOpen()) {
      <div class="modal-backdrop" (click)="formOpen.set(false)">
        <div class="modal card" (click)="$event.stopPropagation()">
          <h2>{{ editingId() ? 'تعديل الكوبون' : 'كوبون جديد' }}</h2>

          <div class="row2">
            <label>الكود<input type="text" [(ngModel)]="form.code" dir="ltr" /></label>
            <label>النوع
              <select [(ngModel)]="form.type">
                <option value="percent">نسبة مئوية %</option>
                <option value="fixed">مبلغ ثابت ر.س</option>
              </select>
            </label>
          </div>
          <div class="row2">
            <label>القيمة<input type="number" min="0" step="0.01" [(ngModel)]="form.value" /></label>
            <label>أدنى إجمالي للطلب<input type="number" min="0" [(ngModel)]="form.min_total" /></label>
          </div>
          <div class="row2">
            <label>تاريخ البداية<input type="date" [(ngModel)]="form.starts_at" /></label>
            <label>تاريخ الانتهاء<input type="date" [(ngModel)]="form.ends_at" /></label>
          </div>
          <div class="row2">
            <label>حد الاستخدام (اختياري)<input type="number" min="1" [(ngModel)]="form.usage_limit" /></label>
            <label class="check"><input type="checkbox" [(ngModel)]="form.is_active" /> نشط</label>
          </div>

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

        &.on {
          background: #dcfce7;
          color: #15803d;
        }

        &.off {
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

      .empty-row {
        text-align: center;
        color: #9aa3b5;
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
        width: min(560px, 92vw);
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
          select {
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
        }
      }

      .modal-actions {
        display: flex;
        gap: 0.6rem;
      }
    `,
  ],
})
export class CouponsPage implements OnInit {
  private api = inject(AdminApiService);

  coupons = signal<Coupon[]>([]);
  formOpen = signal(false);
  editingId = signal<number | null>(null);

  form = this.emptyForm();

  ngOnInit(): void {
    this.load();
  }

  openForm(coupon?: Coupon): void {
    this.editingId.set(coupon?.id ?? null);
    this.form = coupon
      ? {
          code: coupon.code,
          type: coupon.type,
          value: String(coupon.value),
          min_total: coupon.min_total !== null ? String(coupon.min_total) : '',
          starts_at: coupon.starts_at ? coupon.starts_at.slice(0, 10) : '',
          ends_at: coupon.ends_at ? coupon.ends_at.slice(0, 10) : '',
          usage_limit: coupon.usage_limit !== null ? String(coupon.usage_limit) : '',
          is_active: coupon.is_active,
        }
      : this.emptyForm();

    this.formOpen.set(true);
  }

  save(): void {
    if (!this.form.code.trim() || !this.form.value) {
      return;
    }

    const payload = {
      code: this.form.code.trim().toUpperCase(),
      type: this.form.type as 'percent' | 'fixed',
      value: Number(this.form.value),
      min_total: this.form.min_total ? Number(this.form.min_total) : null,
      starts_at: this.form.starts_at || null,
      ends_at: this.form.ends_at || null,
      usage_limit: this.form.usage_limit ? Number(this.form.usage_limit) : null,
      is_active: this.form.is_active,
    };

    const request = this.editingId()
      ? this.api.updateCoupon(this.editingId()!, payload)
      : this.api.createCoupon(payload);

    request.subscribe(() => {
      this.formOpen.set(false);
      this.load();
    });
  }

  remove(coupon: Coupon): void {
    if (!confirm(`حذف الكوبون «${coupon.code}»؟`)) {
      return;
    }

    this.api.deleteCoupon(coupon.id).subscribe(() => this.load());
  }

  private load(): void {
    this.api.coupons().subscribe((coupons) => this.coupons.set(coupons));
  }

  private emptyForm() {
    return {
      code: '',
      type: 'percent',
      value: '',
      min_total: '',
      starts_at: '',
      ends_at: '',
      usage_limit: '',
      is_active: true,
    };
  }
}
