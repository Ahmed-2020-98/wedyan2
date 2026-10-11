import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../core/api.service';
import { Order, STATUS_LABELS } from '../../core/models';

@Component({
  selector: 'app-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, FormsModule],
  template: `
    <h1>الطلبات</h1>

    <div class="toolbar">
      <label>
        تصفية حسب الحالة:
        <select [ngModel]="statusFilter()" (ngModelChange)="onFilter($event)">
          <option value="">الكل</option>
          @for (entry of statusEntries; track entry[0]) {
            <option [value]="entry[0]">{{ entry[1] }}</option>
          }
        </select>
      </label>
    </div>

    <div class="card table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th><th>العميل</th><th>المدينة</th><th>الدفع</th>
            <th>الإجمالي</th><th>الحالة</th><th>التاريخ</th><th></th>
          </tr>
        </thead>
        <tbody>
          @for (order of orders(); track order.id) {
            <tr>
              <td>{{ order.id }}</td>
              <td>{{ order.customer_name }}<br /><small dir="ltr">{{ order.customer_phone }}</small></td>
              <td>{{ order.city }}</td>
              <td>{{ order.payment_method === 'stripe' ? '💳 بطاقة' : '💵 عند الاستلام' }}</td>
              <td>{{ order.total | number: '1.0-2' }} ر.س</td>
              <td>
                <span class="pill" [class]="'pill pill-' + order.status">{{ STATUS_LABELS[order.status] }}</span>
              </td>
              <td>{{ order.created_at | date: 'yyyy/MM/dd' }}</td>
              <td><button class="edit-btn" (click)="openOrder(order)">تفاصيل</button></td>
            </tr>
          } @empty {
            <tr><td colspan="8" class="empty-row">لا توجد طلبات.</td></tr>
          }
        </tbody>
      </table>
    </div>

    @if (selected(); as order) {
      <div class="modal-backdrop" (click)="selected.set(null)">
        <div class="modal card" (click)="$event.stopPropagation()">
          <h2>طلب #{{ order.id }} — {{ STATUS_LABELS[order.status] }}</h2>

          <p><strong>العميل:</strong> {{ order.customer_name }} ({{ order.customer_phone }})</p>
          <p><strong>العنوان:</strong> {{ order.city }} — {{ order.address }}</p>
          <p><strong>طريقة الدفع:</strong> {{ order.payment_method === 'stripe' ? 'بطاقة (Stripe)' : 'الدفع عند الاستلام' }}</p>
          @if (order.coupon_code) {
            <p><strong>كوبون الخصم:</strong> {{ order.coupon_code }} (−{{ order.discount | number: '1.0-2' }} ر.س)</p>
          }

          <table class="data-table">
            <thead><tr><th>المنتج</th><th>السعر</th><th>الكمية</th><th>المجموع</th></tr></thead>
            <tbody>
              @for (item of order.items; track item.id) {
                <tr>
                  <td>{{ item.product_name_ar }}</td>
                  <td>{{ item.price | number: '1.0-2' }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ item.price * item.quantity | number: '1.0-2' }} ر.س</td>
                </tr>
              }
            </tbody>
          </table>

          <p class="total"><strong>الإجمالي: {{ order.total | number: '1.0-2' }} ر.س</strong></p>

          <label>
            تغيير الحالة:
            <select [ngModel]="order.status" (ngModelChange)="changeStatus(order, $event)">
              @for (entry of statusEntries; track entry[0]) {
                <option [value]="entry[0]">{{ entry[1] }}</option>
              }
            </select>
          </label>

          <div class="modal-actions">
            <button class="btn btn-outline" (click)="selected.set(null)">إغلاق</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      h1,
      .total {
        margin-block: 0.5rem;
      }

      .toolbar {
        margin-bottom: 1rem;

        label {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 600;
        }

        select {
          width: auto;
        }
      }

      .table-wrap {
        padding: 0.75rem;
        overflow-x: auto;
      }

      small {
        color: #7c869c;
      }

      .pill {
        font-size: 0.78rem;
        font-weight: 700;
        padding: 0.15rem 0.65rem;
        border-radius: 999px;
        white-space: nowrap;

        &.pill-pending {
          background: #fef3c7;
          color: #b45309;
        }

        &.pill-paid {
          background: #dbeafe;
          color: #1d4ed8;
        }

        &.pill-processing {
          background: #e0e7ff;
          color: #4338ca;
        }

        &.pill-shipped {
          background: #ede9fe;
          color: #6d28d9;
        }

        &.pill-delivered {
          background: #dcfce7;
          color: #15803d;
        }

        &.pill-cancelled {
          background: #fee2e2;
          color: #dc2626;
        }
      }

      .edit-btn {
        border: none;
        background: none;
        color: #4f46e5;
        font-weight: 700;
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
        width: min(680px, 94vw);
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
          margin-top: 0.85rem;

          select {
            width: auto;
          }
        }
      }

      .modal-actions {
        display: flex;
        justify-content: flex-start;
        gap: 0.6rem;
        margin-top: 1rem;
      }
    `,
  ],
})
export class OrdersPage implements OnInit {
  private api = inject(AdminApiService);

  orders = signal<Order[]>([]);
  selected = signal<Order | null>(null);
  statusFilter = signal('');

  readonly STATUS_LABELS = STATUS_LABELS;
  readonly statusEntries = Object.entries(STATUS_LABELS);

  ngOnInit(): void {
    this.load();
  }

  onFilter(status: string): void {
    this.statusFilter.set(status);
    this.load();
  }

  openOrder(order: Order): void {
    this.api.order(order.id).subscribe((full) => this.selected.set(full));
  }

  changeStatus(order: Order, status: string): void {
    this.api
      .updateOrderStatus(order.id, status as Order['status'])
      .subscribe(() => this.load());
  }

  private load(): void {
    this.api.orders(this.statusFilter() || undefined).subscribe((res) => this.orders.set(res.data));
  }
}
