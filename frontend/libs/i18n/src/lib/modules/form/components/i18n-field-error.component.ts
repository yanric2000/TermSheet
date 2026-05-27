import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MessageModule } from 'primeng/message';

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
