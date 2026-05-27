import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Provider } from '@angular/core';
import type { ObjetoEspiaoJest } from '@intapp/util/models';
import { of } from 'rxjs';

import { criarObjetoEspiaoJest } from './jest.util';

/**
 * Mocks reutilizáveis e agnósticos de domínio devem ser centralizados aqui.
 */

export const changeDetectorRefFactory = (): ObjetoEspiaoJest<ChangeDetectorRef> =>
  criarObjetoEspiaoJest<ChangeDetectorRef>(['checkNoChanges', 'detach', 'detectChanges', 'markForCheck', 'reattach']);

export const changeDetectorRefProviderFactory = () =>
  ({
    provide: ChangeDetectorRef,
    useValue: changeDetectorRefFactory(),
  }) satisfies Provider;

export const httpClientFactory = (): ObjetoEspiaoJest<HttpClient> => {
  const spy = criarObjetoEspiaoJest<HttpClient>(['get', 'post', 'put', 'delete', 'patch']);
  spy.post.mockReturnValue(of(null));
  return spy;
};

export const httpClientProviderFactory = () =>
  ({
    provide: HttpClient,
    useValue: httpClientFactory(),
  }) satisfies Provider;
