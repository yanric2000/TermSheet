import { inject } from '@angular/core';
import type { IDealCreateAPI } from '@intapp/termsheet/deal/models/deal-api.model';
import type { IDeal } from '@intapp/termsheet/deal/models/deal.model';
import { DealsApiService } from '@intapp/termsheet/deal/services';
import { withPagedEntities } from '@intapp/util';
import { signalStore, withHooks, withMethods } from '@ngrx/signals';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs';

export const DealsStore = signalStore(
  withPagedEntities(DealsApiService),
  withMethods((store, api = inject(DealsApiService)) => ({
    createDeal(payload: IDealCreateAPI): Observable<IDeal> {
      return api.create(payload).pipe(tap(() => store.reload()));
    },
  })),
  withHooks({
    onInit(store) {
      store.reload();
    },
  }),
);
