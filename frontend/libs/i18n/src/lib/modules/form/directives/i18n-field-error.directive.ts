import {
  AfterViewInit,
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

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[formControlName], [formControl]',
  standalone: true,
})
export class I18nFieldErrorDirective implements AfterViewInit {
  private readonly ngControl = inject(NgControl, { self: true });
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject(I18nService);

  private readonly touched$ = new Subject<void>();
  private originalMarkAsTouched: AbstractControl['markAsTouched'] | null = null;
  private componentRef: ComponentRef<I18nFieldErrorComponent> | null = null;
  private blurUnlisten: (() => void) | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.teardown());
  }

  ngAfterViewInit(): void {
    this.setup();
  }

  private setup(): void {
    const control = this.ngControl.control;
    if (!control) return;

    this.componentRef = this.viewContainerRef.createComponent(I18nFieldErrorComponent);
    this.patchMarkAsTouched(control);
    this.blurUnlisten = this.renderer.listen(this.elementRef.nativeElement, 'blur', () => this.touched$.next());

    merge(control.statusChanges, control.valueChanges, this.touched$)
      .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.update(control));
  }

  private patchMarkAsTouched(control: AbstractControl): void {
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
