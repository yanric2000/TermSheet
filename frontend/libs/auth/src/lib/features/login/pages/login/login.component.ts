import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@intapp/auth/services';
import { I18nFieldErrorDirective, I18nService } from '@intapp/i18n';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

/**
 * Tela de login da aplicação.
 *
 * - Standalone, ChangeDetection OnPush.
 * - ReactiveForms com validações espelhando `LoginRequest.java` (min 4, max 100).
 * - PrimeNG: `p-card` centralizado, `p-inputText`, `p-password`, `p-button`.
 * - Mensagens de erro renderizadas automaticamente pela
 *   `I18nFieldErrorDirective` (auto-aplicada via seletor `[formControlName]`).
 *   Defaults built-in cobrem `required`/`minlength`/`maxlength` — não precisa
 *   prover resolvers custom para este form.
 * - Toast de falha de autenticação é responsabilidade do
 *   `apiErrorToastInterceptor` (global), não do componente.
 * - Submit via Enter (default do `<form>`), `autofocus` no primeiro campo.
 *
 * `labels` é um objeto plain readonly: as traduções não mudam em runtime na
 * UI atual (não há seletor de idioma), então não compensa pagar o custo de
 * um `computed`. Se um dia surgir um toggle de locale em tempo real, esse
 * objeto pode voltar a ser `computed(() => ...)` sem mexer no template.
 */
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
    // O subscribe é necessário: `login()` devolve um cold observable. Erros
    // são tratados globalmente pelo `apiErrorToastInterceptor`, então só
    // precisamos engolir o `error` para que o RxJS não logue "unhandled".
    this.auth.login(this.form.getRawValue()).subscribe({ error: () => void 0 });
  }
}
