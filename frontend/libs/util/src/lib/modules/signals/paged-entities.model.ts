import type { Observable } from 'rxjs';

import type { GetAllRequiredParamsType } from '../models/http-get-all.models';

export interface IPagedResult<T> {
  items: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface IPagedEntitiesLoader<TEntity, TFilters extends Record<string, unknown> = Record<string, never>> {
  load(pagination: GetAllRequiredParamsType, filters?: TFilters): Observable<IPagedResult<TEntity>>;
}
