import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthService } from '@intapp/auth';
import { I18nService } from '@intapp/i18n';
import { ButtonModule } from 'primeng/button';

/**
 * Página de listagem de deals.
 *
 * Estado atual: placeholder mínimo que valida end-to-end o fluxo de autenticação
 * (mostra usuário logado + botão Sair). Será substituído pela listagem real
 * com filtros e ações em uma próxima etapa.
 *
 * Arquitetura: esta é a camada de UI (`features/`). Quando a listagem real
 * for implementada, ela vai consumir uma facade de `modules/deal/services/`
 * que por sua vez delega para um adapter HTTP via port — espelhando o
 * padrão usado em `@intapp/auth` (AUTH_API).
 *
 * Padrão de consumo do i18n: zero chamada de método custom no template. Os
 * textos são expostos via signals `labels()` e `greeting()` — `i18n.t(...)`
 * fica sempre encapsulado em `computed`.
 */
@Component({
  selector: 'tsh-deals-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule],
  templateUrl: './deals-list-page.component.html',
  styleUrl: './deals-list-page.component.scss',
})
export class DealsListPageComponent {
  private i18n = inject(I18nService);
  protected auth = inject(AuthService);

  /** Labels estáticos do componente; reage automaticamente a troca de locale. */
  protected readonly labels = computed(() => ({
    title: this.i18n.t('dealsTitle'),
    logout: this.i18n.t('dealsLogout'),
    placeholder: this.i18n.t('dealsPlaceholderMessage'),
  }));

  /** Saudação personalizada com o nome do usuário; depende de auth.user + locale. */
  protected readonly greeting = computed(() => {
    const user = this.auth.user();
    return user ? this.i18n.t('dealsGreeting', user.name) : '';
  });

  protected logout(): void {
    this.auth.logout().subscribe();
  }
}
