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

export interface IDealPaginationAPI {
  content: IDealGetAPI[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
