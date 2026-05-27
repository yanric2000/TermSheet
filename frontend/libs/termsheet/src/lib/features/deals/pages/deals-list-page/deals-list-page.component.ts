import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthService } from '@intapp/auth';
import { I18nService } from '@intapp/i18n';
import { DealsStore } from '@intapp/termsheet/deal/stores';
import { DealsFiltersComponent, DealsTableComponent } from '@intapp/termsheet/features/deals/components';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'tsh-deals-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, DealsFiltersComponent, DealsTableComponent],
  templateUrl: './deals-list-page.component.html',
})
export class DealsListPageComponent {
  private readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  protected readonly store = inject(DealsStore);

  protected readonly labels = computed(() => ({
    title: this.i18n.t('dealsTitle'),
    logout: this.i18n.t('dealsLogout'),
  }));

  protected readonly greeting = computed(() => {
    const user = this.auth.user();
    return user ? this.i18n.t('dealsGreeting', user.name) : '';
  });

  protected logout(): void {
    this.auth.logout().subscribe();
  }
}
