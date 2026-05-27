import type { IPagedResult } from '@intapp/util';

import type { IDeal } from './deal.model';

export interface IApiDeal {
  id: string;
  name: string;
  purchasePrice: number;
  address: string;
  noi: number;
  description: string;
  capRate?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Envelope paginado do Spring Data (campos relevantes apenas). */
export interface IApiDealsPage {
  content: IApiDeal[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export type IDealsPage = IPagedResult<IDeal>;
