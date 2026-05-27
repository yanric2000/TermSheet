import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { DealAdapter } from '@intapp/termsheet/deal/adapters';
import { constants } from '@intapp/termsheet/deal/constants';
import type { IApiDealsPage } from '@intapp/termsheet/deal/models/deal-api.model';
import type { IDeal } from '@intapp/termsheet/deal/models/deal.model';
import type { DealsFilterValues, IDealsFilters } from '@intapp/termsheet/deal/models/deals-filters.model';
import {
  type GetAllRequiredParamsType,
  type IPagedEntitiesLoader,
  type IPagedResult,
  converterObjetoParaParametrosHttp,
} from '@intapp/util';
import { Observable, map } from 'rxjs';

@Injectable()
export class DealsApiService implements IPagedEntitiesLoader<IDeal, DealsFilterValues> {
  private readonly http = inject(HttpClient);
  private readonly adapter = inject(DealAdapter);

  load(pagination: GetAllRequiredParamsType, filters?: DealsFilterValues): Observable<IPagedResult<IDeal>> {
    return this.list({ ...pagination, ...filters });
  }

  list(filters: IDealsFilters): Observable<IPagedResult<IDeal>> {
    const params = converterObjetoParaParametrosHttp({
      name: filters.name,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      page: filters.page,
      size: filters.pageSize,
    });
    return this.http.get<IApiDealsPage>(`/api/${constants.deals}`, { params }).pipe(
      map(page => ({
        items: this.adapter.toDomainList(page.content),
        totalElements: page.totalElements,
        totalPages: page.totalPages,
        page: filters.page,
        size: filters.pageSize,
      })),
    );
  }
}
