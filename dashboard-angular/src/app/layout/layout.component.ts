import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">⚙️ لوحة وديان</div>
        <nav>
          <a routerLink="/dashboard" routerLinkActive="active">📊 لوحة المعلومات</a>
          <a routerLink="/products" routerLinkActive="active">📦 المنتجات</a>
          <a routerLink="/categories" routerLinkActive="active">🗂️ التصنيفات</a>
          <a routerLink="/brands" routerLinkActive="active">🏷️ الماركات</a>
          <a routerLink="/orders" routerLinkActive="active">🧾 الطلبات</a>
          <a routerLink="/coupons" routerLinkActive="active">🎟️ الكوبونات</a>
          <a routerLink="/customers" routerLinkActive="active">👥 العملاء</a>
        </nav>
        <button class="btn btn-outline logout" (click)="logout()">تسجيل الخروج ⏻</button>
      </aside>
      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .shell {
        display: flex;
        min-height: 100vh;
      }

      .sidebar {
        width: 240px;
        background: #1e1b4b;
        color: #c7d2fe;
        display: flex;
        flex-direction: column;
        padding: 1.25rem;
        position: sticky;
        top: 0;
        height: 100vh;
      }

      .brand {
        font-weight: 900;
        font-size: 1.15rem;
        color: #fff;
        margin-bottom: 1.75rem;
      }

      nav {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        flex: 1;

        a {
          padding: 0.6rem 0.9rem;
          border-radius: 8px;
          font-weight: 600;
          transition: background 0.15s;

          &:hover {
            background: rgba(255, 255, 255, 0.08);
          }

          &.active {
            background: #4f46e5;
            color: #fff;
          }
        }
      }

      .logout {
        border-color: rgba(255, 255, 255, 0.3);
        color: #fff;

        &:hover {
          filter: none;
          background: rgba(255, 255, 255, 0.1);
        }
      }

      .content {
        flex: 1;
        padding: 1.5rem 2rem;
        min-width: 0;
      }
    `,
  ],
})
export class LayoutComponent {
  private auth = inject(AuthService);

  logout(): void {
    this.auth.logout();
    location.href = '/login';
  }
}
