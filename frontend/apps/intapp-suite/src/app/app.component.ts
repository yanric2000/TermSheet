import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';

/**
 * Root da aplicação.
 *
 * Mantém o `<p-toast>` global no topo da árvore para que qualquer feature
 * (e o `apiErrorToastInterceptor`) consiga renderizar notificações sem
 * precisar declarar `ToastModule` em cada componente. `MessageService` já é
 * `providedIn: 'root'` em `primeng/api` — basta o componente `<p-toast>`
 * estar montado uma vez.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, ToastModule],
  template: '<p-toast position="top-right" /><router-outlet />',
})
export class AppComponent {}
