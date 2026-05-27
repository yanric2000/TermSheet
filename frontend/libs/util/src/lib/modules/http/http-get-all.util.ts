import { HttpParams } from '@angular/common/http';
import { GetAllRequiredParamsType } from '@intapp/util/models';

export const paginacaoPadrao: GetAllRequiredParamsType = {
  page: 1,
  pageSize: 10,
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function converterObjetoParaParametrosHttp(params: { [key: string]: any } | null): HttpParams {
  let httpParams = new HttpParams();

  if (!params) {
    return httpParams;
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      httpParams = httpParams.append(key, value.toString());
    }
  });
  return httpParams;
}
