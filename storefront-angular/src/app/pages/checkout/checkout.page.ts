import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { CartService } from '../../core/cart.service';

@Component({
  selector: 'app-checkout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule],
  template: `
    <div class="container narrow">
      <h1>إتمام الشراء</h1>

      @if (cart.items().length === 0) {
        <div class="card empty">سلتك فارغة — أضف منتجات أولاً.</div>
      } @else {
        <form class="card form" (ngSubmit)="submit()">
          <h3>بيانات التوصيل</h3>
          <label>الاسم الكامل<input type="text" [(ngModel)]="customerName" name="name" required /></label>
          <label>رقم الجوال<input type="tel" [(ngModel)]="phone" name="phone" required /></label>
          <label>البريد الإلكتروني (اختياري)<input type="email" [(ngModel)]="email" name="email" /></label>
          <label>المدينة<input type="text" [(ngModel)]="city" name="city" required /></label>
          <label>العنوان بالتفصيل<textarea rows="2" [(ngModel)]="address" name="address" required></textarea></label>

          <h3>طريقة الدفع</h3>
          <div class="pay-methods">
            @if (stripeEnabled()) {
              <label class="radio">
                <input type="radio" name="payment" value="stripe" [(ngModel)]="paymentMethod" />
                💳 بطاقة بنكية (Stripe)
              </label>
            }
            <label class="radio">
              <input type="radio" name="payment" value="cod" [(ngModel)]="paymentMethod" />
              💵 الدفع عند الاستلام
            </label>
          </div>

          <h3>كود الخصم</h3>
          <div class="coupon">
            <input
              type="text"
              placeholder="مثال: WELCOME10"
              [(ngModel)]="couponCode"
              name="coupon"
              [disabled]="discount() > 0"
            />
            @if (discount() > 0) {
              <span class="applied">✅ خصم {{ discount() | number: '1.0-2' }} ر.س</span>
            } @else {
              <button type="button" class="btn btn-outline" (click)="applyCoupon()">تطبيق</button>
            }
          </div>

          <hr />

          <div class="totals">
            <div><span>المجموع الفرعي:</span> {{ cart.subtotal() | number: '1.0-2' }} ر.س</div>
            @if (discount() > 0) {
              <div class="green"><span>الخصم:</span> −{{ discount() | number: '1.0-2' }} ر.س</div>
            }
            <div class="grand"><span>الإجمالي:</span> {{ total() | number: '1.0-2' }} ر.س</div>
          </div>

          @if (error()) {
            <p class="error">{{ error() }}</p>
          }

          <button class="btn btn-primary block" [disabled]="submitting()">
            @if (submitting()) {
              جارٍ المعالجة...
            } @else if (paymentMethod === 'stripe') {
              الدفع الآن 💳
            } @else {
              تأكيد الطلب ✅
            }
          </button>
        </form>
      }
    </div>
  `,
  styles: [
    `
      .narrow {
        max-width: 640px;
      }

      h1,
      h3 {
        margin-block: 0.5rem;
      }

      .form {
        padding: 1.5rem;

        label:not(.radio) {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 0.9rem;
        }

        input,
        textarea {
          width: 100%;
        }
      }

      .pay-methods {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .radio {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
      }

      .coupon {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 1rem;

        input {
          flex: 1;
        }
      }

      .applied {
        color: #16a34a;
        font-weight: 700;
      }

      .totals {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        font-weight: 600;

        span {
          color: #7c869c;
        }

        .green {
          color: #16a34a;
        }

        .grand {
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
        margin-top: 1rem;
      }

      .error {
        color: #dc2626;
        font-weight: 700;
        background: #fee2e2;
        padding: 0.6rem 1rem;
        border-radius: 8px;
      }

      .empty {
        text-align: center;
        padding: 3rem;
      }
    `,
  ],
})
export class CheckoutPage implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  cart = inject(CartService);

  stripeEnabled = signal(false);
  submitting = signal(false);
  error = signal('');
  discount = signal(0);
  appliedCoupon = signal('');

  customerName = '';
  phone = '';
  email = '';
  city = '';
  address = '';
  couponCode = '';
  paymentMethod = 'cod';

  total(): number {
    return Math.max(0, this.cart.subtotal() - this.discount());
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) {
      return;
    }

    this.api.validateCoupon(this.couponCode.trim(), this.cart.subtotal()).subscribe({
      next: (res) => {
        this.discount.set(res.discount);
        this.appliedCoupon.set(res.code);
        this.error.set('');
      },
      error: () => this.error.set('كود الخصم غير صالح.'),
    });
  }

  submit(): void {
    if (!this.customerName || !this.phone || !this.city || !this.address) {
      this.error.set('يرجى إكمال جميع بيانات التوصيل.');
      return;
    }

    this.submitting.set(true);
    this.error.set('');

    const payload = {
      items: this.cart.items().map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      customer_name: this.customerName,
      customer_phone: this.phone,
      customer_email: this.email || undefined,
      city: this.city,
      address: this.address,
      payment_method: this.paymentMethod,
      coupon_code: this.appliedCoupon() || undefined,
    };

    this.api.placeOrder(payload).subscribe({
      next: (res) => {
        this.cart.clear();

        if (res.checkout_url) {
          window.location.href = res.checkout_url;
        } else {
          void this.router.navigate(['/order-success'], { queryParams: { order: res.order_id } });
        }
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'حدث خطأ غير متوقع، حاول مرة أخرى.');
        this.submitting.set(false);
      },
    });
  }

  ngOnInit(): void {
    this.api.config().subscribe((config) => {
      this.stripeEnabled.set(config.stripe_enabled);

      if (config.stripe_enabled) {
        this.paymentMethod = 'stripe';
      }
    });

    const user = this.auth.user();

    if (user) {
      this.customerName = user.name;
      this.email = user.email;
    }
  }
}
