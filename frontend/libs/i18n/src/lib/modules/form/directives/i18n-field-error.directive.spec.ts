import { Component, DebugElement, inject } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { type AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { I18nService } from '@intapp/i18n/services';

import { I18nFieldErrorDirective } from './i18n-field-error.directive';

/**
 * `[formControl]` direto exige uma instância de `AbstractControl` para o
 * input, então centralizamos a montagem do form em um único componente
 * host e os specs apenas configuram validators diferentes via `setupForm()`.
 *
 * Mantemos a marcação mínima — só o input com `formControlName` + a
 * diretiva auto-aplicada via seletor. O `<p-message>` filho é inserido
 * automaticamente como irmão do `<input>`.
 */
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, I18nFieldErrorDirective],
  template: `
    <form [formGroup]="form">
      <input id="field" formControlName="field" />
    </form>
  `,
})
class HostComponent {
  private readonly fb = inject(FormBuilder);
  form: FormGroup = this.fb.group({ field: [''] });
}

async function bootstrapI18n(): Promise<void> {
  // Força pt-BR para alinhar com as strings esperadas (`Campo obrigatório`,
  // `Mínimo de N caracteres`). Sem isso, o `I18nService` cai no
  // `navigator.language` do jsdom, que costuma reportar `en-US`.
  localStorage.clear();
  Object.defineProperty(navigator, 'language', { value: 'pt-BR', configurable: true });
  const i18n = TestBed.inject(I18nService);
  await i18n.bootstrap();
}

function buildFixture(): ComponentFixture<HostComponent> {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  // A diretiva agenda `setup()` em microtask para esperar o
  // `FormControlName` popular `NgControl.control`. Esvaziamos a fila
  // explicitamente para que o `<p-message>` esteja disponível imediatamente
  // após o `detectChanges()`.
  return fixture;
}

function getInput(fixture: ComponentFixture<HostComponent>): DebugElement {
  return fixture.debugElement.query(By.css('input'));
}

function getMessage(fixture: ComponentFixture<HostComponent>): HTMLElement | null {
  return fixture.nativeElement.querySelector('p-message');
}

function getControl(fixture: ComponentFixture<HostComponent>): AbstractControl {
  const control = fixture.componentInstance.form.get('field');
  if (!control) throw new Error('control `field` ausente');
  return control;
}

describe('I18nFieldErrorDirective', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    await bootstrapI18n();
  });

  it('não renderiza <p-message> antes do controle ser tocado', fakeAsync(() => {
    const fixture = buildFixture();
    fixture.componentInstance.form.get('field')?.setValidators(Validators.required);
    fixture.componentInstance.form.get('field')?.updateValueAndValidity();
    tick();
    fixture.detectChanges();

    expect(getMessage(fixture)).toBeNull();
    expect(getInput(fixture).nativeElement.hasAttribute('aria-invalid')).toBe(false);
  }));

  it('exibe mensagem do catálogo i18n para o validator `required` após touched', fakeAsync(() => {
    const fixture = buildFixture();
    const control = getControl(fixture);
    control.setValidators(Validators.required);
    control.updateValueAndValidity();
    control.markAsTouched();
    tick();
    fixture.detectChanges();

    const message = getMessage(fixture);
    expect(message).not.toBeNull();
    expect(message?.getAttribute('ng-reflect-text')).toBe('Campo obrigatório');
    expect(getInput(fixture).nativeElement.getAttribute('aria-invalid')).toBe('true');
  }));

  it('formata args do validator `minlength` na mensagem do catálogo', fakeAsync(() => {
    const fixture = buildFixture();
    const control = getControl(fixture);
    control.setValidators(Validators.minLength(4));
    control.setValue('ab');
    control.markAsTouched();
    tick();
    fixture.detectChanges();

    expect(getMessage(fixture)?.getAttribute('ng-reflect-text')).toBe('Mínimo de 4 caracteres');
  }));

  it('usa a string crua quando o validator custom devolve um literal', fakeAsync(() => {
    const fixture = buildFixture();
    const control = getControl(fixture);
    control.setValidators(() => ({ custom: 'mensagem direta do validator' }));
    control.updateValueAndValidity();
    control.markAsTouched();
    tick();
    fixture.detectChanges();

    expect(getMessage(fixture)?.getAttribute('ng-reflect-text')).toBe('mensagem direta do validator');
  }));

  it('usa `error.message` quando o validator custom devolve um objeto com `message`', fakeAsync(() => {
    const fixture = buildFixture();
    const control = getControl(fixture);
    control.setValidators(() => ({ custom: { message: 'via objeto', extra: 1 } }));
    control.updateValueAndValidity();
    control.markAsTouched();
    tick();
    fixture.detectChanges();

    expect(getMessage(fixture)?.getAttribute('ng-reflect-text')).toBe('via objeto');
  }));

  it('respeita o nome do validator como fallback quando nada combina', fakeAsync(() => {
    const fixture = buildFixture();
    const control = getControl(fixture);
    control.setValidators(() => ({ obscuroSemTraducao: true }));
    control.updateValueAndValidity();
    control.markAsTouched();
    tick();
    fixture.detectChanges();

    expect(getMessage(fixture)?.getAttribute('ng-reflect-text')).toBe('obscuroSemTraducao');
  }));

  it('reage a `markAllAsTouched()` no FormGroup (patch do markAsTouched do controle)', fakeAsync(() => {
    const fixture = buildFixture();
    const control = getControl(fixture);
    control.setValidators(Validators.required);
    control.updateValueAndValidity();
    tick();
    fixture.detectChanges();
    expect(getMessage(fixture)).toBeNull();

    fixture.componentInstance.form.markAllAsTouched();
    tick();
    fixture.detectChanges();

    expect(getMessage(fixture)?.getAttribute('ng-reflect-text')).toBe('Campo obrigatório');
  }));

  it('remove a mensagem e o aria-invalid quando o erro some', fakeAsync(() => {
    const fixture = buildFixture();
    const control = getControl(fixture);
    control.setValidators(Validators.required);
    control.updateValueAndValidity();
    control.markAsTouched();
    tick();
    fixture.detectChanges();
    expect(getMessage(fixture)).not.toBeNull();

    control.setValue('ok');
    tick();
    fixture.detectChanges();

    expect(getMessage(fixture)).toBeNull();
    expect(getInput(fixture).nativeElement.hasAttribute('aria-invalid')).toBe(false);
  }));

  it('restaura `markAsTouched` original quando a diretiva é destruída', fakeAsync(() => {
    const fixture = buildFixture();
    const control = getControl(fixture);
    tick();
    const patched = control.markAsTouched;

    fixture.destroy();

    expect(control.markAsTouched).not.toBe(patched);
  }));
});
