import {
  type ComponentRef,
  DestroyRef,
  Directive,
  ElementRef,
  Renderer2,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { type AbstractControl, NgControl } from '@angular/forms';
import { I18nFieldErrorComponent } from '@intapp/i18n/form/components';
import { resolveFieldErrorMessage } from '@intapp/i18n/form/utils';
import { I18nService } from '@intapp/i18n/services';
import { Subject, merge, startWith } from 'rxjs';

/**
 * Diretiva auto-aplicada que renderiza mensagens de erro de validação
 * imediatamente após cada campo com `formControlName` ou `[formControl]`.
 *
 * Como ela age:
 *  - Cria, via `ViewContainerRef.createComponent`, uma instância do
 *    `I18nFieldErrorComponent` (wrapper do `<p-message>`). Angular ancora
 *    o componente como irmão imediato do host element — mesmo
 *    posicionamento de uma renderização condicional via `@if`.
 *  - Inscreve em `statusChanges`, `valueChanges` e um `Subject` próprio que
 *    emite quando `markAsTouched` é chamado ou o usuário sai do campo
 *    (`blur` capture).
 *  - Resolve o texto via `resolveFieldErrorMessage(...)` (camadas: built-in
 *    i18n → string crua → `.message` → fallback).
 *  - Atualiza `aria-invalid` no host element para acessibilidade.
 *
 * Por que patch em `markAsTouched`:
 *  - Angular 17.3 ainda não tem `form.events`. `touched` não emite em
 *    `statusChanges`/`valueChanges`. Sem este patch, `markAllAsTouched()`
 *    em `submit()` não dispararia atualização da UI de erro.
 *  - Patch é restaurado no destroy para não deixar lixo no `AbstractControl`
 *    se ele sobreviver à diretiva (controles criados via `FormGroup` em
 *    classe podem ser reaproveitados).
 *
 * Por que o seletor é amplo:
 *  - `[formControlName], [formControl]` casa qualquer campo do app que
 *    usa Reactive Forms. Sem `errors`, a função resolver devolve `null`
 *    e a diretiva fica em no-op — custo: 1 instância de diretiva + 1
 *    componente filho vazio por campo. Aceitável em troca de zero
 *    boilerplate no template.
 */
@Directive({
  // O lint @angular-eslint/directive-selector exige prefixo `lib*`, mas esta
  // diretiva é deliberadamente auto-aplicada via os seletores nativos do
  // Reactive Forms para eliminar boilerplate no template — qualquer prefixo
  // custom obrigaria o consumer a tag-ar manualmente cada campo.
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[formControlName], [formControl]',
  standalone: true,
})
export class I18nFieldErrorDirective {
  private readonly ngControl = inject(NgControl, { self: true });
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject(I18nService);

  /**
   * Emite quando `markAsTouched` é chamado no controle ou o host element
   * dispara `blur`. Combinado com `statusChanges`/`valueChanges` cobre
   * todas as transições que afetam a mensagem.
   */
  private readonly touched$ = new Subject<void>();

  /**
   * Função `markAsTouched` original do controle, guardada para restauração
   * no destroy. `null` enquanto o patch não foi aplicado (controle ainda
   * não populado pelo `FormControlName`).
   */
  private originalMarkAsTouched: AbstractControl['markAsTouched'] | null = null;

  /**
   * Instância do componente filho. Criada preguiçosamente no `setup()` —
   * só existe se o controle apareceu (caso patológico: diretiva aplicada
   * em elemento sem `FormControlName` real).
   */
  private componentRef: ComponentRef<I18nFieldErrorComponent> | null = null;

  /**
   * Função de limpeza do listener `blur` retornada pelo `renderer.listen(...)`.
   * Mantida para ser invocada no destroy.
   */
  private blurUnlisten: (() => void) | null = null;

  constructor() {
    // `NgControl.control` é populado durante o `ngOnInit` do
    // `FormControlName`/`FormControlDirective`. Esperamos um microtask
    // para garantir que o setup veio depois — mesmo padrão usado pelo
    // `MatFormFieldControl` interno do Angular Material.
    queueMicrotask(() => this.setup());

    this.destroyRef.onDestroy(() => this.teardown());
  }

  private setup(): void {
    const control = this.ngControl.control;
    if (!control) return;

    this.componentRef = this.viewContainerRef.createComponent(I18nFieldErrorComponent);

    this.patchMarkAsTouched(control);

    // Capture phase no `blur`: o host pode ser `<p-password>` (envolve
    // um `<input>` interno) e nesse caso o `blur` no `<input>` não
    // borbulha até o host sem `capture: true`.
    this.blurUnlisten = this.renderer.listen(this.elementRef.nativeElement, 'blur', () => this.touched$.next());

    merge(control.statusChanges, control.valueChanges, this.touched$)
      .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.update(control));
  }

  private patchMarkAsTouched(control: AbstractControl): void {
    // Guardamos a referência original (já bound no controle) para poder
    // restaurar exatamente o método de antes no destroy — isso preserva
    // o comportamento default caso o controle sobreviva à diretiva.
    const original = control.markAsTouched.bind(control);
    this.originalMarkAsTouched = original;

    const touched$ = this.touched$;
    control.markAsTouched = function patched(opts?: { onlySelf?: boolean }) {
      original(opts);
      touched$.next();
    };
  }

  private update(control: AbstractControl): void {
    if (!this.componentRef) return;

    const message = resolveFieldErrorMessage(control, this.i18n);
    this.componentRef.setInput('message', message);

    if (message) {
      this.renderer.setAttribute(this.elementRef.nativeElement, 'aria-invalid', 'true');
    } else {
      this.renderer.removeAttribute(this.elementRef.nativeElement, 'aria-invalid');
    }
  }

  private teardown(): void {
    this.blurUnlisten?.();
    this.blurUnlisten = null;

    const control = this.ngControl.control;
    if (control && this.originalMarkAsTouched) {
      control.markAsTouched = this.originalMarkAsTouched;
    }
    this.originalMarkAsTouched = null;

    this.componentRef?.destroy();
    this.componentRef = null;
  }
}
