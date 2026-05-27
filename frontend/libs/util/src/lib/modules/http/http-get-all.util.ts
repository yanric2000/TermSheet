import { HttpParams } from '@angular/common/http';
import { GetAllParamsType, GetAllRequiredParamsType, HttpGetAllRequestType } from '@intapp/util/models';
import { map, Observable, of, take, tap } from 'rxjs';

export const paginacaoPadrao: GetAllRequiredParamsType = {
  page: 1,
  pageSize: 10,
} as const;

export class HttpGetAllRequest<T extends { id: string }, Filtros extends GetAllRequiredParamsType = GetAllParamsType> {
  public conjuntoItens = new Map<string, T>();
  public urlGetAll!: string;
  public items: T[] = [];
  public filtros = { ...paginacaoPadrao } as Filtros;

  public hasNext = false;

  private getAll$: HttpGetAllRequestType<T>;

  constructor(getAll$: HttpGetAllRequestType<T>) {
    this.getAll$ = getAll$;
  }

  getAll(filtros: Filtros): Observable<T[]> {
    this.filtros = filtros;
    return this.getAll$(filtros).pipe(
      map(result => {
        this.hasNext = result.hasNext ?? false;
        return result.items;
      }),
      take(1),
    );
  }

  reset(filtros: Omit<Filtros, 'page'> = {} as Omit<Filtros, 'page'>): Observable<T[]> {
    const params = { ...this.filtros, ...filtros, page: 1 };
    return this.getAll(params).pipe(tap((itens: T[]) => this.definirItens(itens)));
  }

  more(onlyMoreResults = false): Observable<T[]> {
    if (this.hasNext) {
      const params = { ...this.filtros, page: this.filtros.page + 1 };
      return this.getAll(params).pipe(
        map((itens: T[]) => {
          this.concatenarItens(itens);
          return onlyMoreResults ? itens : this.items;
        }),
      );
    } else {
      return of([] as T[]);
    }
  }

  refazerBuscaAtual() {
    const paginaAtual = this.filtros.page + 0;
    const tamanhoPaginaAtual = this.filtros.pageSize + 0;
    const newPage = 1;
    const newPageSize = paginaAtual * tamanhoPaginaAtual;
    const params: Filtros = { ...this.filtros, page: newPage, pageSize: newPageSize };

    return this.getAll(params).pipe(
      map(retorno => {
        this.definirItens(retorno);
        this.filtros = { ...this.filtros, page: paginaAtual, pageSize: tamanhoPaginaAtual };
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
