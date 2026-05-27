import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from '@intapp/auth';
import { I18nService } from '@intapp/i18n';
import { provideDeals } from '@intapp/termsheet/deal/providers';
import { DealsApiService } from '@intapp/termsheet/deal/services';
import { EMPTY, of } from 'rxjs';

import { DealsListPageComponent } from './deals-list-page.component';

describe('DealsListPageComponent', () => {
  let fixture: ComponentFixture<DealsListPageComponent>;
  let authMock: { user: ReturnType<typeof signal<unknown>>; logout: jest.Mock };
  let apiMock: { load: jest.Mock };

  beforeEach(async () => {
    jest.useFakeTimers();
    authMock = {
      user: signal({ id: 'u1', username: 'demo', name: 'Demo', role: 'USER' }),
      logout: jest.fn().mockReturnValue(EMPTY),
    };
    apiMock = {
      load: jest.fn().mockReturnValue(of({ items: [], totalElements: 0, totalPages: 0, page: 1, size: 10 })),
    };

    await TestBed.configureTestingModule({
      imports: [DealsListPageComponent, NoopAnimationsModule],
      providers: [
        provideDeals(),
        { provide: AuthService, useValue: authMock },
        { provide: DealsApiService, useValue: apiMock },
        I18nService,
      ],
    }).compileComponents();

    await TestBed.inject(I18nService).setLocale('pt-BR');

    fixture = TestBed.createComponent(DealsListPageComponent);
    fixture.detectChanges();
    jest.advanceTimersByTime(300);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renderiza título Deals e saudação com nome do usuário', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const i18n = TestBed.inject(I18nService);
    expect(compiled.querySelector('h1')?.textContent).toContain(i18n.t('dealsTitle'));
    expect(compiled.querySelector('header p')?.textContent).toContain('Demo');
  });

  it('chama auth.logout quando o botão Sair é acionado', () => {
    fixture.componentInstance['logout']();
    expect(authMock.logout).toHaveBeenCalled();
  });

  it('carrega deals na inicialização via DealsStore', () => {
    expect(apiMock.load).toHaveBeenCalled();
  });
});
