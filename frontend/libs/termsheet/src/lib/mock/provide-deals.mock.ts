import type { Provider } from '@angular/core';

import { dealsApiServiceProviderFactory } from './deals-api-service.mock';
import { dealsStoreProviderFactory } from './deals-store.mock';

export const provideDealsMockProviders = (
  dealsApiProvider = dealsApiServiceProviderFactory(),
  dealsStoreProvider = dealsStoreProviderFactory(),
): Provider[] => [dealsApiProvider, dealsStoreProvider];
