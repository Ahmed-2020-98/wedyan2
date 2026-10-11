import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Order, STATUS_LABELS } from '../../core/models';

const STATUS_CLASSES: Record<string, string> = {
  pending: 'pending',
  paid: 'paid',
  processing: 'paid',
  shipped: 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

@Component({
  selector: 'app-my-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, RouterLink],
  template: `
    <div class="container narrow">
      <h1>طلباتي</h1>

      @if (!auth.isLoggedIn()) {
        <div class="card empty">
          <p>يجب تسجيل الدخول لعرض طلباتك.</p>
          <a routerLink="/login" class="btn btn-primary">تسجيل الدخول</a>
        </div>
      } @else if (orders().length === 0) {
        <div class="card empty">
          <p>لا توجد طلبات بعد.</p>
          <a routerLink="/products" class="btn btn-primary">ابدأ التسوق</a>
        </div>
      } @else {
        @for (order of orders(); track order.id) {
          <div class="card order">
            <div class="head">
              <span>طلب #{{ order.id }}</span>
              <span [class]="'status ' + statusClass(order.status)">{{ STATUS_LABELS[order.status] }}</span>
              <span class="date">{{ order.created_at | date: 'yyyy/MM/dd' }}</span>
              <strong>{{ order.total | number: '1.0-2' }} ر.س</strong>
            </div>
            <ul>
              @for (item of order.items; track item.id) {
                <li>{{ item.product_name_ar }} × {{ item.quantity }}</li>
              }
            </ul>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .narrow {
        max-width: 720px;
      }

      h1 {
        margin: 0 0 1rem;
      }

      .order {
        padding: 1.25rem;
        margin-bottom: 1rem;

        .head {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 0.6rem;
        }

        ul {
          margin: 0;
          padding-inline-start: 1.25rem;
          color: #4b5563;

          li {
            margin-bottom: 0.2rem;
          }
        }
      }

      .date {
        color: #7c869c;
        font-size: 0.85rem;
      }

      .head strong:last-child {
        margin-inline-start: auto;
        color: #2563eb;
      }

      .status {
        font-size: 0.8rem;
        font-weight: 700;
        padding: 0.2rem 0.7rem;
        border-radius: 999px;

        &.pending {
          background: #fef3c7;
          color: #b45309;
        }

        &.paid {
          background: #dbeafe;
          color: #1d4ed8;
        }

        &.shipped {
          background: #e0e7ff;
          color: #4338ca;
        }

        &.delivered {
          background: #dcfce7;
          color: #15803d;
        }

        &.cancelled {
          background: #fee2e2;
          color: #dc2626;
        }
      }

      .empty {
        text-align: center;
        padding: 3rem;
      }
    `,
  ],
})
export class MyOrdersPage implements OnInit {
  private api = inject(ApiService);

  auth = inject(AuthService);
  orders = signal<Order[]>([]);
  readonly STATUS_LABELS = STATUS_LABELS;

  constructor() {
    inject(Router);
  }

  statusClass(status: string): string {
    return STATUS_CLASSES[status] ?? 'pending';
  }

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.api.myOrders().subscribe((res) => this.orders.set(res.data));
    }
  }
}
