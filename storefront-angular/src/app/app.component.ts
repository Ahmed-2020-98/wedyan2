import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { CartService } from './core/cart.service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="header">
      <div class="container header-inner">
        <a routerLink="/" class="logo">🛍️ متجر وديان</a>
        <nav class="nav">
          <a routerLink="/products">المنتجات</a>
          @if (auth.isLoggedIn()) {
            <a routerLink="/my-orders">طلباتي</a>
            <button class="btn btn-outline btn-sm" (click)="auth.logout()">
              خروج ({{ auth.user()?.name }})
            </button>
          } @else {
            <a routerLink="/login">تسجيل الدخول</a>
            <a routerLink="/register" class="btn btn-primary btn-sm">حساب جديد</a>
          }
        </nav>
        <a routerLink="/cart" class="cart-btn" aria-label="سلة التسوق">
          🛒
          @if (cart.count() > 0) {
            <span class="cart-badge">{{ cart.count() }}</span>
          }
        </a>
      </div>
    </header>

    <main>
      <router-outlet />
    </main>

    <footer class="footer">
      <div class="container">© 2026 متجر وديان — جميع الحقوق محفوظة</div>
    </footer>
  `,
  styles: [
    `
      .header {
        background: #fff;
        box-shadow: 0 1px 8px rgba(31, 36, 48, 0.08);
        position: sticky;
        top: 0;
        z-index: 50;
      }

      .header-inner {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        height: 64px;
      }

      .logo {
        font-weight: 900;
        font-size: 1.25rem;
        color: #2563eb;
      }

      .nav {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        margin-inline-start: auto;

        a {
          font-weight: 600;

          &:hover {
            color: #2563eb;
          }
        }
      }

      .btn-sm {
        padding: 0.4rem 0.9rem;
        font-size: 0.85rem;
      }

      .cart-btn {
        position: relative;
        font-size: 1.4rem;
      }

      .cart-badge {
        position: absolute;
        top: -6px;
        left: -10px;
        background: #dc2626;
        color: #fff;
        font-size: 0.7rem;
        font-weight: 700;
        min-width: 18px;
        height: 18px;
        border-radius: 999px;
        display: grid;
        place-items: center;
        padding-inline: 4px;
      }

      main {
        min-height: calc(100vh - 130px);
        padding-block: 1.5rem 3rem;
      }

      .footer {
        background: #1f2430;
        color: #cbd2e0;
        text-align: center;
        padding-block: 1.25rem;
        font-size: 0.9rem;
      }
    `,
  ],
})
export class AppComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
}
