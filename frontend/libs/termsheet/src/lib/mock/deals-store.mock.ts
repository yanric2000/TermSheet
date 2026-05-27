import { signal } from '@angular/core';
import type { IDeal } from '@intapp/termsheet/deal/models/deal.model';
import type { DealsFilterValues } from '@intapp/termsheet/deal/models/deals-filters.model';
import { DealsStore } from '@intapp/termsheet/deal/stores';
import { paginacaoPadrao } from '@intapp/util';
import { criarObjetoEspiaoJest } from '@intapp/util/jest';
import type { ObjetoEspiaoJest } from '@intapp/util/models';
import { of } from 'rxjs';

type DealsStoreInstance = InstanceType<typeof DealsStore>;

const dealFactory = (overrides?: Partial<IDeal>): IDeal => ({
  id: 'deal-1',
  name: 'Deal',
  purchasePrice: 100_000,
  address: 'Main St',
  noi: 10_000,
  description: '',
  ...overrides,
});

export const dealsStoreMockFactory = (): ObjetoEspiaoJest<DealsStoreInstance> => {
  const mock = criarObjetoEspiaoJest<DealsStoreInstance>(
    ['reload', 'applyFilters', 'setPage', 'setPageSize', 'createDeal'],
    {
      entities: signal<IDeal[]>([]),
      filters: signal<DealsFilterValues>({}),
      pagination: signal({ ...paginacaoPadrao }),
      loading: signal(false),
      totalElements: signal(0),
      totalPages: signal(0),
    } as never,
  );

  mock.createDeal.mockImplementation(() => of(dealFactory()));

  return mock;
};

export const dealsStoreProviderFactory = () => ({
  provide: DealsStore,
  useValue: dealsStoreMockFactory(),
});
