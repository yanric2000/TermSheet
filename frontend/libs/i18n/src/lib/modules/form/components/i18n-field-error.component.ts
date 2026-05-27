import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MessageModule } from 'primeng/message';

/**
 * Wrapper standalone para o `<p-message>` do PrimeNG 17.
 *
 * Existe por dois motivos:
 *  - O `UIMessage` da v17 não é standalone (a flag `standalone` do
 *    `ɵcmp` é `false`); para instanciá-lo via `ViewContainerRef.createComponent`
 *    a partir de uma diretiva, encapsulamos aqui em um standalone próprio
 *    que importa `MessageModule`.
 *  - Esconde a API da PrimeNG da diretiva. Se um dia subir para a v18
 *    (com `variant="simple" size="small"`) ou trocar o componente visual,
 *    a diretiva continua igual — só este template muda.
 *
 * O `<p-message>` da v17 só aceita `severity | text | escape | style | styleClass`
 * (não há slot de conteúdo projetado). Por isso passamos a mensagem via
 * `[text]` em vez de transcluir filhos.
 */
@Component({
  selector: 'lib-field-error',
  standalone: true,
  imports: [MessageModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (message()) {
    <p-message severity="error" [text]="message()!" />
  }`,
})
export class I18nFieldErrorComponent {
  readonly message = input<string | null>(null);
}
