import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    // `<p-toast>` (global no `AppComponent`) depende de animações e do
    // `MessageService`. `NoopAnimationsModule` substitui o engine real e o
    // provider explícito do `MessageService` evita erros de DI em ambiente
    // de teste, onde a resolução de `providedIn: 'root'` do PrimeNG não é
    // garantida quando múltiplas cópias do módulo são resolvidas pelo Jest.
    await TestBed.configureTestingModule({
      imports: [AppComponent, NoopAnimationsModule],
      providers: [provideRouter([]), MessageService],
    }).compileComponents();
  });

  it('cria a aplicação raiz', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renderiza um <router-outlet>', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
