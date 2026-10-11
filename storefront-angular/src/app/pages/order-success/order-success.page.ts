import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { STATUS_LABELS, Order } from '../../core/models';

@Component({
  selector: 'app-order-success',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  template: `
    <div class="container narrow">
      <div class="card success">
        <div class="icon">✅</div>
        <h1>تم استلام طلبك بنجاح!</h1>
        @if (order(); as o) {
          <p>رقم الطلب: <strong>#{{ o.id }}</strong></p>
          <p>الحالة: <strong>{{ statusLabel() }}</strong></p>
          <p>الإجمالي: <strong>{{ o.total | number: '1.0-2' }} ر.س</strong></p>
        }
        <p class="note">سيتم التواصل معك قريباً لتأكيد التوصيل.</p>
      </div>
    </div>
  `,
  styles: [
    `
      .narrow {
        max-width: 560px;
      }

      .success {
        text-align: center;
        padding: 3rem 2rem;

        .icon {
          font-size: 4rem;
        }

        h1 {
          font-size: 1.4rem;
        }

        .note {
          color: #7c869c;
        }
      }
    `,
  ],
})
export class OrderSuccessPage implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  order = signal<Order | null>(null);

  statusLabel(): string {
    const order = this.order();

    return order ? (STATUS_LABELS[order.status] ?? order.status) : '';
  }

  ngOnInit(): void {
    const orderId = this.route.snapshot.queryParamMap.get('order');

    if (orderId) {
      // Order details require auth; guests see the confirmation screen only.
      this.api.myOrders().subscribe({
        next: (res) => {
          const found = res.data.find((o) => o.id === Number(orderId));

          if (found) {
            this.order.set(found);
          }
        },
        error: () => undefined,
      });
    }
  }
}
