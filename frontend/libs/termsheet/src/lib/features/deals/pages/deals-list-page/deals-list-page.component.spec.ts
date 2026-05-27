import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from '@intapp/auth';
import { I18nService } from '@intapp/i18n';
import { EMPTY } from 'rxjs';

import { DealsListPageComponent } from './deals-list-page.component';

describe('DealsListPageComponent', () => {
  let fixture: ComponentFixture<DealsListPageComponent>;
  let component: DealsListPageComponent;
  let authMock: { user: ReturnType<typeof signal<unknown>>; logout: jest.Mock };

  beforeEach(async () => {
    authMock = {
      user: signal({ id: 'u1', username: 'demo', name: 'Demo', role: 'USER' }),
      logout: jest.fn().mockReturnValue(EMPTY),
    };

    await TestBed.configureTestingModule({
      imports: [DealsListPageComponent, NoopAnimationsModule],
      providers: [{ provide: AuthService, useValue: authMock }, I18nService],
    }).compileComponents();

    // Fixa o locale para pt-BR e aguarda o load assíncrono para que o teste
    // seja determinístico independentemente do `navigator.language` do ambiente.
    await TestBed.inject(I18nService).setLocale('pt-BR');

    fixture = TestBed.createComponent(DealsListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renderiza título Deals e saudação com nome do usuário', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const i18n = TestBed.inject(I18nService);
    expect(compiled.querySelector('h1')?.textContent).toContain(i18n.t('dealsTitle'));
    expect(compiled.querySelector('.welcome')?.textContent).toContain('Demo');
  });

  it('chama auth.logout quando o botão Sair é acionado', () => {
    component['logout']();
    expect(authMock.logout).toHaveBeenCalled();
  });
});
