import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from '@intapp/auth';
import { authServiceProviderFactory } from '@intapp/auth/mocks';
import { IUser } from '@intapp/auth/models';
import { I18nService } from '@intapp/i18n';
import { i18nServiceProviderFactory } from '@intapp/i18n/mocks';
import { DealsApiService } from '@intapp/termsheet/deal/services';
import { DealsStore } from '@intapp/termsheet/deal/stores';
import { DealCreateDialogComponent } from '@intapp/termsheet/features/deals/components';
import { dealsApiServiceProviderFactory, dealsStoreProviderFactory } from '@intapp/termsheet/mocks';
import type { ObjetoEspiaoJest } from '@intapp/util/models';

import { DealsListPageComponent } from './deals-list-page.component';

describe('deals-list-page.component.spec | DealsListPageComponent', () => {
  let component: DealsListPageComponent;
  let fixture: ComponentFixture<DealsListPageComponent>;
  let authMock: ObjetoEspiaoJest<AuthService>;
  let apiMock: ObjetoEspiaoJest<DealsApiService>;
  let storeMock: ObjetoEspiaoJest<InstanceType<typeof DealsStore>>;
  let i18nMock: ObjetoEspiaoJest<I18nService>;

  beforeEach(async () => {
    const user: IUser = { id: 'u1', username: 'demo', name: 'Demo', role: 'USER' };

    jest.useFakeTimers();

    const authProvider = authServiceProviderFactory(user);
    authMock = authProvider.useValue;

    const dealsApiProvider = dealsApiServiceProviderFactory();
    apiMock = dealsApiProvider.useValue;

    const dealsStoreProvider = dealsStoreProviderFactory();
    storeMock = dealsStoreProvider.useValue;

    const i18nProvider = i18nServiceProviderFactory();
    i18nMock = i18nProvider.useValue;

    await TestBed.configureTestingModule({
      imports: [DealsListPageComponent, NoopAnimationsModule],
      providers: [dealsApiProvider, dealsStoreProvider, authProvider, i18nProvider],
    }).compileComponents();

    fixture = TestBed.createComponent(DealsListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    jest.advanceTimersByTime(300);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('deve renderizar título e saudação com o nome do usuário', () => {
    // Given
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;

    // When
    const title = compiled.querySelector('h1')?.textContent;
    const greeting = compiled.querySelector('header p')?.textContent;

    // Then
    expect(title).toContain(i18nMock.t('dealsTitle'));
    expect(greeting).toContain('Demo');
  });

  it('deve chamar logout quando o botão sair é acionado', () => {
    // Given
    const compiled = fixture.nativeElement as HTMLElement;
    const logoutButton = Array.from(compiled.querySelectorAll('button')).find(btn =>
      btn.textContent?.includes(i18nMock.t('dealsLogout')),
    );

    // When
    logoutButton?.click();
    fixture.detectChanges();

    // Then
    expect(authMock.logout).toHaveBeenCalled();
  });

  it('deve expor estado inicial vazio da listagem de deals', () => {
    // Given
    // setup executado no beforeEach com store mockado

    // When
    const entities = storeMock.entities();
    const loading = storeMock.loading();

    // Then
    expect(entities).toEqual([]);
    expect(loading).toBe(false);
    expect(apiMock.load).not.toHaveBeenCalled();
  });

  it('deve abrir o dialog de cadastro ao clicar em novo deal', () => {
    // Given
    const compiled = fixture.nativeElement as HTMLElement;
    const createButton = Array.from(compiled.querySelectorAll('button')).find(btn =>
      btn.textContent?.includes(i18nMock.t('dealsCreateButton')),
    );

    // When
    createButton?.click();
    fixture.detectChanges();

    // Then
    const dealCreateDialog = fixture.debugElement.query(By.directive(DealCreateDialogComponent))
      .componentInstance as DealCreateDialogComponent;
    expect(dealCreateDialog.visible()).toBe(true);
  });
});
