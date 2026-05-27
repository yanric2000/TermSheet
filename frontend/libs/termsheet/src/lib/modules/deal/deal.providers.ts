import type { Provider } from '@angular/core';
import { DealsApiService } from '@intapp/termsheet/deal/services';
import { DealsStore } from '@intapp/termsheet/deal/stores';

export function provideDeals(): Provider[] {
  return [DealsApiService, DealsStore];
}
