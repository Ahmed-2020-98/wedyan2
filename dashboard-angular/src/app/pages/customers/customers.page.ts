import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../core/api.service';

interface Customer {
  id: number;
  name: string;
  email: string;
  orders_count: number;
  created_at: string;
}

@Component({
  selector: 'app-customers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, FormsModule],
  template: `
    <h1>العملاء</h1>

    <input
      class="search"
      type="search"
      placeholder="ابحث بالاسم أو البريد..."
      [ngModel]="search()"
      (ngModelChange)="onSearch($event)"
    />

    <div class="card table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>#</th><th>الاسم</th><th>البريد الإلكتروني</th><th>عدد الطلبات</th><th>تاريخ التسجيل</th></tr>
        </thead>
        <tbody>
          @for (customer of customers(); track customer.id) {
            <tr>
              <td>{{ customer.id }}</td>
              <td>{{ customer.name }}</td>
              <td dir="ltr">{{ customer.email }}</td>
              <td>{{ customer.orders_count }}</td>
              <td>{{ customer.created_at | date: 'yyyy/MM/dd' }}</td>
            </tr>
          } @empty {
            <tr><td colspan="5" class="empty-row">لا يوجد عملاء.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      h1 {
        margin-block: 0.25rem 1rem;
      }

      .search {
        width: 300px;
        margin-bottom: 1rem;
      }

      .table-wrap {
        padding: 0.75rem;
        overflow-x: auto;
      }

      .empty-row {
        text-align: center;
        color: #9aa3b5;
      }
    `,
  ],
})
export class CustomersPage implements OnInit {
  private api = inject(AdminApiService);

  customers = signal<Customer[]>([]);
  search = signal('');

  ngOnInit(): void {
    this.load();
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.load();
  }

  private load(): void {
    this.api.customers(this.search() || undefined).subscribe((res) => this.customers.set(res.data));
  }
}
