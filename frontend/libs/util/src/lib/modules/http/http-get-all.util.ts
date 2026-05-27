import { HttpParams } from '@angular/common/http';
import { map, Observable, of, take, tap } from 'rxjs';

export class HttpGetAllRequest<T extends { id: string }, Filtros extends GetAllRequiredParamsType = GetAllParamsType> {
  public conjuntoItens = new Map<string, T>();
  public urlGetAll!: string;
  public items: T[] = [];
  public filtros = { ...paginacaoPadrao } as Filtros;

  public page = 1;
  public pageSize = 10;
  public hasNext = false;

  private getAll$: HttpGetAllRequestType<T>;

  constructor(getAll$: HttpGetAllRequestType<T>) {
    this.getAll$ = getAll$;
  }

  getAll(): Observable<T[]> {
    const params = this.filtros;
    return this.getAll$(params).pipe(
      map(result => {
        this.hasNext = result.hasNext ?? false;
        return result.items;
      }),
      take(1),
    );
  }

  reset(): Observable<T[]> {
    this.page = 1;
    return this.getAll().pipe(tap((itens: T[]) => this.definirItens(itens)));
  }

  more(onlyMoreResults = false): Observable<T[]> {
    if (this.hasNext) {
      this.page += 1;
      return this.getAll().pipe(
        map((itens: T[]) => {
          this.concatenarItens(itens);
          return onlyMoreResults ? itens : this.items;
        }),
      );
    } else {
      return of([] as T[]);
    }
  }

  /**
   * Método responsável por refazer a busca atual
   * @return Retorno assíncrono dos registros encontrados
   */
  refazerBuscaAtual() {
    const paginaAtual = this.page + 0;
    const tamanhoPaginaAtual = this.pageSize + 0;
    this.page = 1;
    this.pageSize = paginaAtual * tamanhoPaginaAtual;

    return this.getAll().pipe(
      map(retorno => {
        this.definirItens(retorno);
        this.page = paginaAtual;
        this.pageSize = tamanhoPaginaAtual;
        return retorno;
      }),
    );
  }

  private definirItens(itens: T[]): void {
    this.conjuntoItens.clear();
    itens.forEach(item => this.conjuntoItens.set(item.id, item));
    this.atualizarListaItens();
  }

  private concatenarItens(itens: T[]): void {
    itens.forEach(item => this.conjuntoItens.set(item.id, item));
    this.atualizarListaItens();
  }

  private atualizarListaItens() {
    const novosItens: T[] = [...this.conjuntoItens.values()];
    this.items = novosItens;
  }
}

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

export const paginacaoPadrao: GetAllRequiredParamsType = {
  page: 1,
  pageSize: 10,
} as const;

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
