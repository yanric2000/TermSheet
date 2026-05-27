import { inject, type ProviderToken } from '@angular/core';
import { patchState, signalStoreFeature, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import * as deepEqual from 'fast-deep-equal';
import { debounceTime, distinctUntilChanged, pipe, switchMap, tap } from 'rxjs';

import { paginacaoPadrao } from '../http/http-get-all.util';
import type { GetAllRequiredParamsType } from '../models/http-get-all.models';

import type { IPagedEntitiesLoader } from './paged-entities.model';

type LoaderEntity<L> = L extends IPagedEntitiesLoader<infer E, Record<string, unknown>> ? E : never;
type LoaderFilters<L> = L extends IPagedEntitiesLoader<unknown, infer F extends Record<string, unknown>> ? F : never;

interface PagedEntitiesState<TEntity, TFilters> {
  entities: TEntity[];
  loading: boolean;
  filters: TFilters;
  pagination: GetAllRequiredParamsType;
  totalElements: number;
  totalPages: number;
}

export function withPagedEntities<L extends IPagedEntitiesLoader<unknown, Record<string, unknown>>>(
  loaderToken: ProviderToken<L>,
) {
  type TEntity = LoaderEntity<L>;
  type TFilters = LoaderFilters<L>;

  return signalStoreFeature(
    withState<PagedEntitiesState<TEntity, TFilters>>({
      entities: [] as TEntity[],
      loading: false,
      filters: {} as TFilters,
      pagination: { ...paginacaoPadrao },
      totalElements: 0,
      totalPages: 0,
    }),
    withMethods(store => {
      const loader = inject(loaderToken);

      const fetch = rxMethod<{ pagination: GetAllRequiredParamsType; filters: TFilters }>(
        pipe(
          distinctUntilChanged((a, b) => deepEqual(a, b)),
          tap(() => patchState(store, { loading: true })),
          debounceTime(300),
          switchMap(({ pagination, filters }) =>
            loader.load(pagination, filters).pipe(
              tap({
                next: page =>
                  patchState(store, {
                    entities: page.items as TEntity[],
                    totalElements: page.totalElements,
                    totalPages: page.totalPages,
                    loading: false,
                  }),
                error: err => {
                  console.error('Falha ao carregar entidades paginadas', err);
                  patchState(store, { loading: false });
                },
              }),
            ),
          ),
        ),
      );

      const reload = (): void => {
        fetch({ pagination: store.pagination(), filters: store.filters() });
      };

      return {
        reload,
        applyFilters(partial: Partial<TFilters> | null): void {
          const nextFilters = (partial === null ? {} : { ...store.filters(), ...partial }) as TFilters;
          patchState(store, {
            filters: nextFilters,
            pagination: { ...store.pagination(), page: 1 },
          });
          reload();
        },
        setPage(page: number): void {
          const totalPages = store.totalPages();
          if (page < 1 || (totalPages > 0 && page > totalPages)) {
            return;
          }
          patchState(store, { pagination: { ...store.pagination(), page } });
          reload();
        },
        setPageSize(pageSize: number): void {
          if (pageSize < 1) {
            return;
          }
          patchState(store, { pagination: { page: 1, pageSize } });
          reload();
        },
      };
    }),
  );
}
