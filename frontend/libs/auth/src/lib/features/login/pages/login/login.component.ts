import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@intapp/auth/services';
import { I18nFieldErrorDirective, I18nService } from '@intapp/i18n';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'lib-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CardModule, InputTextModule, PasswordModule, ButtonModule, I18nFieldErrorDirective],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(100)]],
    password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(100)]],
  });

  protected readonly labels = computed(() => ({
    productName: this.i18n.t('productName'),
    subtitle: this.i18n.t('loginSubtitle'),
    username: this.i18n.t('loginUsernameLabel'),
    password: this.i18n.t('loginPasswordLabel'),
    submit: this.i18n.t('loginSubmit'),
    footer: `${this.i18n.t('productName')} · ${this.i18n.t('productTagline')}`,
  }));

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.auth.login(this.form.getRawValue()).subscribe();
  }
}
