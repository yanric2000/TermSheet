import type { GetAllRequiredParamsType } from '@intapp/util';

export interface IDealsFilters extends GetAllRequiredParamsType {
  name?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
}

export type DealsFilterValues = Omit<IDealsFilters, keyof GetAllRequiredParamsType>;

export type PriceOperator = 'gte' | 'lte';
