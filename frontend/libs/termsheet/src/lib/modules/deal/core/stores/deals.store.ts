import { DealsApiService } from '@intapp/termsheet/deal/services';
import { withPagedEntities } from '@intapp/util';
import { signalStore, withHooks } from '@ngrx/signals';

export const DealsStore = signalStore(
  withPagedEntities(DealsApiService),
  withHooks({
    onInit(store) {
      store.reload();
    },
  }),
);
