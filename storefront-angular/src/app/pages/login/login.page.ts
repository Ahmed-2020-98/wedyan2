import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="container narrow">
      <form class="card form" (ngSubmit)="submit()">
        <h1>تسجيل الدخول</h1>

        <label>البريد الإلكتروني<input type="email" [(ngModel)]="email" name="email" required /></label>
        <label>كلمة المرور<input type="password" [(ngModel)]="password" name="password" required /></label>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        <button class="btn btn-primary block" [disabled]="loading()">
          {{ loading() ? 'جارٍ الدخول...' : 'دخول' }}
        </button>

        <p class="switch">
          ليس لديك حساب؟
          <a routerLink="/register">أنشئ حساباً جديداً</a>
        </p>
      </form>
    </div>
  `,
  styles: [
    `
      .narrow {
        max-width: 440px;
      }

      .form {
        padding: 2rem;

        h1 {
          margin: 0 0 1.25rem;
          font-size: 1.3rem;
          text-align: center;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }
      }

      .block {
        width: 100%;
      }

      .error {
        color: #dc2626;
        font-weight: 700;
        background: #fee2e2;
        padding: 0.6rem 1rem;
        border-radius: 8px;
      }

      .switch {
        text-align: center;

        a {
          color: #2563eb;
          font-weight: 700;
        }
      }
    `,
  ],
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = signal('');
  loading = signal(false);

  submit(): void {
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.email, this.password).subscribe({
      next: () => void this.router.navigate(['/']),
      error: () => {
        this.error.set('بيانات الدخول غير صحيحة.');
        this.loading.set(false);
      },
    });
  }
}
