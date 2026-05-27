import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { I18nService } from '@intapp/i18n';
import type { IDeal } from '@intapp/termsheet/deal/models/deal.model';
import type { DealsFilterValues } from '@intapp/termsheet/deal/models/deals-filters.model';
import { calcCapRate } from '@intapp/termsheet/deal/utils/cap-rate.util';
import type { GetAllRequiredParamsType } from '@intapp/util';
import { TableModule } from 'primeng/table';

import { HighlightMatchPipe } from '../../pipes';

@Component({
  selector: 'tsh-deals-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TableModule, HighlightMatchPipe],
  templateUrl: './deals-table.component.html',
})
export class DealsTableComponent {
  private readonly i18n = inject(I18nService);

  readonly deals = input.required<IDeal[]>();
  readonly filters = input.required<DealsFilterValues>();
  readonly pagination = input.required<GetAllRequiredParamsType>();
  readonly loading = input<boolean>(false);
  readonly totalRecords = input<number>(0);
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  protected readonly calcCapRate = calcCapRate;

  protected readonly labels = computed(() => ({
    name: this.i18n.t('dealsColumnName'),
    purchasePrice: this.i18n.t('dealsColumnPurchasePrice'),
    address: this.i18n.t('dealsColumnAddress'),
    noi: this.i18n.t('dealsColumnNoi'),
    capRate: this.i18n.t('dealsColumnCapRate'),
    empty: this.i18n.t('dealsEmpty'),
  }));

  protected onLazyLoad(event: { first?: number | null; rows?: number | null } | undefined): void {
    const rows = event?.rows ?? this.pagination().pageSize;
    const first = event?.first ?? 0;
    const page = Math.floor(first / rows) + 1;

    if (rows !== this.pagination().pageSize) {
      this.pageSizeChange.emit(rows);
      return;
    }

    if (page !== this.pagination().page) {
      this.pageChange.emit(page);
    }
  }
}
