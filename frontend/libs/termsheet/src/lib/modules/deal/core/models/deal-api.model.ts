export interface IDealCreateAPI {
  name: string;
  purchasePrice: number;
  address: string;
  noi: number;
  description?: string;
}

export interface IDealGetAPI {
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
export interface IDealPaginationAPI {
  content: IDealGetAPI[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
