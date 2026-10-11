import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="container narrow">
      <form class="card form" (ngSubmit)="submit()">
        <h1>حساب جديد</h1>

        <label>الاسم<input type="text" [(ngModel)]="name" name="name" required /></label>
        <label>البريد الإلكتروني<input type="email" [(ngModel)]="email" name="email" required /></label>
        <label>كلمة المرور<input type="password" [(ngModel)]="password" name="password" required minlength="6" /></label>
        <label>تأكيد كلمة المرور<input type="password" [(ngModel)]="passwordConfirmation" name="password_confirmation" required /></label>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        <button class="btn btn-primary block" [disabled]="loading()">
          {{ loading() ? 'جارٍ الإنشاء...' : 'إنشاء الحساب' }}
        </button>

        <p class="switch">
          لديك حساب بالفعل؟
          <a routerLink="/login">سجّل الدخول</a>
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
export class RegisterPage {
  private auth = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  passwordConfirmation = '';
  error = signal('');
  loading = signal(false);

  submit(): void {
    if (this.password !== this.passwordConfirmation) {
      this.error.set('كلمتا المرور غير متطابقتين.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.auth
      .register({
        name: this.name,
        email: this.email,
        password: this.password,
        password_confirmation: this.passwordConfirmation,
      })
      .subscribe({
        next: () => void this.router.navigate(['/']),
        error: (err) => {
          const messages = err.error?.errors
            ? Object.values(err.error.errors).flat().join('، ')
            : 'تعذر إنشاء الحساب.';
          this.error.set(String(messages));
          this.loading.set(false);
        },
      });
  }
}
