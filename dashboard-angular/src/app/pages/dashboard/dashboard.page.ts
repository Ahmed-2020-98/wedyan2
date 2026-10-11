import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { AdminApiService } from '../../core/api.service';
import { Order, STATUS_LABELS, Stats } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, RouterLink, BaseChartDirective],
  template: `
    <h1>لوحة المعلومات</h1>

    <div class="cards">
      <div class="card stat">
        <span class="icon">💰</span>
        <div>
          <strong>{{ stats()?.sales_total ?? 0 | number: '1.0-2' }} ر.س</strong>
          <span>إجمالي المبيعات</span>
        </div>
      </div>
      <div class="card stat">
        <span class="icon">🧾</span>
        <div>
          <strong>{{ stats()?.orders_count ?? 0 }}</strong>
          <span>عدد الطلبات</span>
        </div>
      </div>
      <div class="card stat">
        <span class="icon">📦</span>
        <div>
          <strong>{{ stats()?.products_count ?? 0 }}</strong>
          <span>المنتجات</span>
        </div>
      </div>
      <div class="card stat">
        <span class="icon">👥</span>
        <div>
          <strong>{{ stats()?.customers_count ?? 0 }}</strong>
          <span>العملاء</span>
        </div>
      </div>
    </div>

    <div class="charts">
      <div class="card chart-card">
        <h3>المبيعات (آخر 14 يوماً)</h3>
        @if (lineChart(); as config) {
          <canvas baseChart [data]="config" [options]="lineOptions" type="line"></canvas>
        }
      </div>
      <div class="card chart-card">
        <h3>الطلبات حسب الحالة</h3>
        @if (pieChart(); as config) {
          <canvas baseChart [data]="config" [options]="pieOptions" type="doughnut"></canvas>
        }
      </div>
    </div>

    <div class="tables">
      <div class="card table-card">
        <h3>أفضل المنتجات مبيعاً</h3>
        <table class="data-table">
          <thead>
            <tr><th>المنتج</th><th>المبيعات</th><th>الإيراد</th></tr>
          </thead>
          <tbody>
            @for (item of stats()?.top_products ?? []; track item.name) {
              <tr>
                <td>{{ item.name }}</td>
                <td>{{ item.sold }}</td>
                <td>{{ item.revenue | number: '1.0-2' }} ر.س</td>
              </tr>
            } @empty {
              <tr><td colspan="3" class="empty-row">لا توجد مبيعات بعد.</td></tr>
            }
          </tbody>
        </table>
      </div>

      <div class="card table-card">
        <h3>أحدث الطلبات</h3>
        <table class="data-table">
          <thead>
            <tr><th>#</th><th>العميل</th><th>الحالة</th><th>الإجمالي</th><th>التاريخ</th><th></th></tr>
          </thead>
          <tbody>
            @for (order of recentOrders(); track order.id) {
              <tr>
                <td>{{ order.id }}</td>
                <td>{{ order.customer_name }}</td>
                <td><span [class]="'pill pill-' + order.status">{{ STATUS_LABELS[order.status] }}</span></td>
                <td>{{ order.total | number: '1.0-2' }} ر.س</td>
                <td>{{ order.created_at | date: 'MM/dd' }}</td>
                <td><a routerLink="/orders" class="view-link">عرض</a></td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="empty-row">لا توجد طلبات بعد.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      h1,
      h3 {
        margin-block: 0.25rem;
      }

      .cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .stat {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.15rem 1.35rem;

        .icon {
          font-size: 2rem;
        }

        strong {
          display: block;
          font-size: 1.3rem;
        }

        span:last-child {
          color: #7c869c;
          font-size: 0.85rem;
        }
      }

      .charts {
        display: grid;
        grid-template-columns: 3fr 2fr;
        gap: 1rem;
        margin-bottom: 1.5rem;

        @media (max-width: 1000px) {
          grid-template-columns: 1fr;
        }
      }

      .chart-card {
        padding: 1.25rem;

        canvas {
          max-height: 280px;
        }
      }

      .tables {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;

        @media (max-width: 1100px) {
          grid-template-columns: 1fr;
        }
      }

      .table-card {
        padding: 1.25rem;
        overflow-x: auto;
      }

      .empty-row {
        text-align: center;
        color: #9aa3b5;
      }

      .view-link {
        color: #4f46e5;
        font-weight: 700;
      }
    `,
  ],
})
export class DashboardPage implements OnInit {
  private api = inject(AdminApiService);

  stats = signal<Stats | null>(null);
  readonly STATUS_LABELS = STATUS_LABELS;

  lineOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { display: false } },
  };

  pieOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: { legend: { position: 'left', rtl: true } },
  };

  recentOrders = signal<Order[]>([]);

  lineChart(): ChartData<'line'> | null {
    const stats = this.stats();

    if (!stats || stats.sales_by_day.length === 0) {
      return null;
    }

    return {
      labels: stats.sales_by_day.map((d) => d.day.slice(5)),
      datasets: [
        {
          data: stats.sales_by_day.map((d) => Number(d.total)),
          label: 'المبيعات',
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79,70,229,0.12)',
          fill: true,
          tension: 0.35,
        },
      ],
    };
  }

  pieChart(): ChartData<'doughnut'> | null {
    const stats = this.stats();

    if (!stats || Object.keys(stats.orders_by_status).length === 0) {
      return null;
    }

    return {
      labels: Object.keys(stats.orders_by_status).map((s) => STATUS_LABELS[s as keyof typeof STATUS_LABELS] ?? s),
      datasets: [
        {
          data: Object.values(stats.orders_by_status),
          backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#6366f1', '#10b981', '#ef4444'],
        },
      ],
    };
  }

  ngOnInit(): void {
    this.api.stats().subscribe((stats) => {
      this.stats.set(stats);
      this.recentOrders.set(stats.recent_orders);
    });
  }
}
