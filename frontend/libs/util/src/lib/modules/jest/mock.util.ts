import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Provider } from '@angular/core';
import type { JestSpyObject } from '@intapp/util/models';
import { of } from 'rxjs';

import { createJestSpyObject } from './jest.util';

export const changeDetectorRefFactory = (): JestSpyObject<ChangeDetectorRef> =>
  createJestSpyObject<ChangeDetectorRef>(['checkNoChanges', 'detach', 'detectChanges', 'markForCheck', 'reattach']);

export const changeDetectorRefProviderFactory = () =>
  ({
    provide: ChangeDetectorRef,
    useValue: changeDetectorRefFactory(),
  }) satisfies Provider;

export const httpClientFactory = (): JestSpyObject<HttpClient> => {
  const spy = createJestSpyObject<HttpClient>(['get', 'post', 'put', 'delete', 'patch']);
  spy.post.mockReturnValue(of(null));
  return spy;
};

export const httpClientProviderFactory = () =>
  ({
    provide: HttpClient,
    useValue: httpClientFactory(),
  }) satisfies Provider;
