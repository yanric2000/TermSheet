import { Observable } from 'rxjs';

export interface IApiCollectionResponse<T> {
  hasNext?: boolean;
  items: Array<T>;
}

export type GetAllRequiredParamsType = {
  page: number;
  pageSize: number;
};

export type GetAllGenericParamsType = {
  [key: string]: string | number | boolean | string[] | number[] | boolean[];
};

export type GetAllParamsType = GetAllRequiredParamsType & GetAllGenericParamsType;

export type HttpGetAllRequestType<T> = (params: GetAllParamsType) => Observable<IApiCollectionResponse<T>>;
