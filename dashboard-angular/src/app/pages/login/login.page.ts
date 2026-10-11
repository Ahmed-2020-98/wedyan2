import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="wrap">
      <form class="card box" (ngSubmit)="submit()">
        <h1>⚙️ لوحة تحكم وديان</h1>
        <p class="sub">سجّل الدخول بحساب المدير</p>

        <label>البريد الإلكتروني<input type="email" [(ngModel)]="email" name="email" required /></label>
        <label>كلمة المرور<input type="password" [(ngModel)]="password" name="password" required /></label>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        <button class="btn btn-primary block" [disabled]="loading()">
          {{ loading() ? 'جارٍ الدخول...' : 'دخول' }}
        </button>
      </form>
    </div>
  `,
  styles: [
    `
      .wrap {
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #1e1b4b, #312e81);
      }

      .box {
        width: 380px;
        padding: 2rem;

        h1 {
          margin: 0 0 0.25rem;
          font-size: 1.2rem;
          text-align: center;
        }

        .sub {
          text-align: center;
          color: #7c869c;
          margin: 0 0 1.5rem;
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
      next: () => void this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error.set(
          err.error?.message === 'بيانات الدخول غير صحيحة.'
            ? err.error.message
            : 'تعذر تسجيل الدخول. تأكد أن الحساب حساب مدير.'
        );
        this.loading.set(false);
      },
    });
  }
}
