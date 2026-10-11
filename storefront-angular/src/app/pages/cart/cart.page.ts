import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../core/cart.service';

@Component({
  selector: 'app-cart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink],
  template: `
    <div class="container">
      <h1>سلة التسوق 🛒</h1>

      @if (cart.items().length === 0) {
        <div class="card empty">
          <p>سلتك فارغة</p>
          <a routerLink="/products" class="btn btn-primary">تصفح المنتجات</a>
        </div>
      } @else {
        <div class="layout">
          <div class="items card">
            @for (item of cart.items(); track item.product_id) {
              <div class="item">
                @if (item.image) {
                  <img [src]="item.image" [alt]="item.name_ar" />
                }
                <div class="info">
                  <a [routerLink]="['/product', item.slug]">{{ item.name_ar }}</a>
                  <span class="unit">{{ item.price | number: '1.0-2' }} ر.س</span>
                </div>
                <div class="qty">
                  <button (click)="cart.update(item.product_id, item.quantity - 1)">−</button>
                  <span>{{ item.quantity }}</span>
                  <button (click)="cart.update(item.product_id, item.quantity + 1)">+</button>
                </div>
                <strong class="line-total">
                  {{ item.price * item.quantity | number: '1.0-2' }} ر.س
                </strong>
                <button class="remove" (click)="cart.remove(item.product_id)" aria-label="حذف">🗑️</button>
              </div>
            }

            <button class="btn btn-danger clear-all" (click)="cart.clear()">تفريغ السلة</button>
          </div>

          <aside class="summary card">
            <h3>ملخص الطلب</h3>
            <div class="row">
              <span>المجموع الفرعي</span>
              <strong>{{ cart.subtotal() | number: '1.0-2' }} ر.س</strong>
            </div>
            <div class="row">
              <span>الشحن</span>
              <strong>يُحسب عند الدفع</strong>
            </div>
            <hr />
            <div class="row total">
              <span>الإجمالي</span>
              <strong>{{ cart.subtotal() | number: '1.0-2' }} ر.س</strong>
            </div>
            <a routerLink="/checkout" class="btn btn-primary block">إتمام الشراء ←</a>
          </aside>
        </div>
      }
    </div>
  `,
  styles: [
    `
      h1 {
        margin: 0 0 1rem;
      }

      .layout {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;

        @media (max-width: 860px) {
          grid-template-columns: 1fr;
        }
      }

      .items {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .item {
        display: grid;
        grid-template-columns: 70px 1fr auto auto auto;
        align-items: center;
        gap: 1rem;
        border-bottom: 1px solid #eef1f6;
        padding-bottom: 1rem;

        img {
          width: 70px;
          height: 70px;
          object-fit: cover;
          border-radius: 10px;
          background: #eef1f6;
        }

        a {
          font-weight: 700;

          &:hover {
            color: #2563eb;
          }
        }

        .unit {
          display: block;
          color: #7c869c;
          font-size: 0.85rem;
        }

        &:last-of-type {
          border-bottom: none;
          padding-bottom: 0;
        }
      }

      .qty {
        display: flex;
        align-items: center;
        gap: 0.6rem;

        button {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          border: 1px solid #d7dbe4;
          background: #fff;
          font-size: 1.05rem;
          font-weight: 700;
        }
      }

      .remove {
        background: none;
        border: none;
        font-size: 1.1rem;
      }

      .clear-all {
        margin-top: 0.5rem;
        align-self: flex-start;
      }

      .summary {
        align-self: start;
        padding: 1.5rem;
        position: sticky;
        top: 80px;

        h3 {
          margin: 0 0 1rem;
        }

        .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.6rem;

          &.total {
            font-size: 1.15rem;

            strong {
              color: #2563eb;
            }
          }
        }

        hr {
          border: none;
          border-top: 1px dashed #d7dbe4;
          margin-block: 1rem;
        }

        .block {
          width: 100%;
        }
      }

      .empty {
        text-align: center;
        padding: 3rem;
      }
    `,
  ],
})
export class CartPage {
  cart = inject(CartService);
}
