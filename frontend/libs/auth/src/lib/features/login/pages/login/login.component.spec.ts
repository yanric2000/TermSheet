import { signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { AuthService } from '@intapp/auth/services';
import { I18nService } from '@intapp/i18n';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authMock: {
    login: jest.Mock;
    loading: ReturnType<typeof signal<boolean>>;
  };

  beforeEach(async () => {
    authMock = {
      login: jest.fn().mockReturnValue(of(void 0)),
      loading: signal<boolean>(false),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: { navigate: jest.fn() } },
        I18nService,
      ],
    }).compileComponents();

    localStorage.clear();
    Object.defineProperty(navigator, 'language', { value: 'pt-BR', configurable: true });
    const i18n = TestBed.inject(I18nService);
    await i18n.setLocale('pt-BR');

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render an empty form', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('input[id="username"]')).toBeTruthy();
    expect(compiled.querySelector('p-password')).toBeTruthy();
    expect(compiled.querySelector('p-button')).toBeTruthy();
    expect(compiled.querySelector('p-message')).toBeNull();
  });

  it('should not call login when the form is invalid', () => {
    component['submit']();
    expect(authMock.login).not.toHaveBeenCalled();
  });

  it('should call auth.login with the correct payload when the form is valid', () => {
    component['form'].setValue({ username: 'demo', password: 'demo1234' });
    component['submit']();
    expect(authMock.login).toHaveBeenCalledWith({ username: 'demo', password: 'demo1234' });
  });

  it('should render <p-message> with catalog message after invalid submit', fakeAsync(() => {
    component['submit']();
    tick();
    fixture.detectChanges();

    const messages = Array.from(fixture.nativeElement.querySelectorAll('p-message')) as HTMLElement[];
    expect(messages.length).toBeGreaterThanOrEqual(2);
    expect(messages[0].getAttribute('ng-reflect-text')).toBe('Campo obrigatório');
  }));
});
