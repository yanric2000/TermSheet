import type { IDeal } from '@intapp/termsheet/deal/models/deal.model';
import { DealsApiService } from '@intapp/termsheet/deal/services';
import type { IPagedResult } from '@intapp/util';
import { createJestSpyObject } from '@intapp/util/jest';
import { of } from 'rxjs';

const pagedResultFactory = (overrides?: Partial<IPagedResult<IDeal>>) => ({
  items: [],
  totalElements: 0,
  totalPages: 0,
  page: 1,
  size: 10,
  ...overrides,
});

export const dealsApiServiceMockFactory = () => {
  const mock = createJestSpyObject<DealsApiService>(['load']);
  mock.load.mockImplementation(() => of(pagedResultFactory()));
  return mock;
};

export const dealsApiServiceProviderFactory = () => ({
  provide: DealsApiService,
  useValue: dealsApiServiceMockFactory(),
});
