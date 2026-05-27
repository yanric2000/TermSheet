import type { GetAllRequiredParamsType } from '@intapp/util';

export interface IDealsFilters extends GetAllRequiredParamsType {
  name?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
}

/** Critérios de busca exibidos/editados na UI (sem paginação). */
export type DealsFilterValues = Omit<IDealsFilters, keyof GetAllRequiredParamsType>;

/**
 * Operador escolhido pelo usuário no dropdown da UI.
 * Mapeia para `minPrice` (gte) ou `maxPrice` (lte) em `IDealsFilters`.
 */
export type PriceOperator = 'gte' | 'lte';
