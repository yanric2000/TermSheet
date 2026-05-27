import { Component, DebugElement, inject } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { type AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { I18nService } from '@intapp/i18n/services';

import { I18nFieldErrorDirective } from './i18n-field-error.directive';

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
  localStorage.clear();
  Object.defineProperty(navigator, 'language', { value: 'pt-BR', configurable: true });
  const i18n = TestBed.inject(I18nService);
  await i18n.bootstrap();
}

function buildFixture(): ComponentFixture<HostComponent> {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();

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
  if (!control) throw new Error('missing control `field`');
  return control;
}

describe('I18nFieldErrorDirective', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    await bootstrapI18n();
  });

  it('should not render <p-message> before the control is touched', fakeAsync(() => {
    const fixture = buildFixture();
    fixture.componentInstance.form.get('field')?.setValidators(Validators.required);
    fixture.componentInstance.form.get('field')?.updateValueAndValidity();
    tick();
    fixture.detectChanges();

    expect(getMessage(fixture)).toBeNull();
    expect(getInput(fixture).nativeElement.hasAttribute('aria-invalid')).toBe(false);
  }));

  it('should show i18n catalog message for `required` validator after touched', fakeAsync(() => {
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

  it('should format `minlength` validator args in catalog message', fakeAsync(() => {
    const fixture = buildFixture();
    const control = getControl(fixture);
    control.setValidators(Validators.minLength(4));
    control.setValue('ab');
    control.markAsTouched();
    tick();
    fixture.detectChanges();

    expect(getMessage(fixture)?.getAttribute('ng-reflect-text')).toBe('Mínimo de 4 caracteres');
  }));

  it('should use raw string when custom validator returns a literal', fakeAsync(() => {
    const fixture = buildFixture();
    const control = getControl(fixture);
    control.setValidators(() => ({ custom: 'validator literal message' }));
    control.updateValueAndValidity();
    control.markAsTouched();
    tick();
    fixture.detectChanges();

    expect(getMessage(fixture)?.getAttribute('ng-reflect-text')).toBe('validator literal message');
  }));

  it('should use `error.message` when custom validator returns object with `message`', fakeAsync(() => {
    const fixture = buildFixture();
    const control = getControl(fixture);
    control.setValidators(() => ({ custom: { message: 'via object', extra: 1 } }));
    control.updateValueAndValidity();
    control.markAsTouched();
    tick();
    fixture.detectChanges();

    expect(getMessage(fixture)?.getAttribute('ng-reflect-text')).toBe('via object');
  }));

  it('should use validator name as fallback when nothing matches', fakeAsync(() => {
    const fixture = buildFixture();
    const control = getControl(fixture);
    control.setValidators(() => ({ obscureNoTranslation: true }));
    control.updateValueAndValidity();
    control.markAsTouched();
    tick();
    fixture.detectChanges();

    expect(getMessage(fixture)?.getAttribute('ng-reflect-text')).toBe('obscureNoTranslation');
  }));

  it('should react to FormGroup markAllAsTouched() (patched control markAsTouched)', fakeAsync(() => {
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

  it('should remove message and aria-invalid when error clears', fakeAsync(() => {
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

  it('should restore original markAsTouched when directive is destroyed', fakeAsync(() => {
    const fixture = buildFixture();
    const control = getControl(fixture);
    tick();
    const patched = control.markAsTouched;

    fixture.destroy();

    expect(control.markAsTouched).not.toBe(patched);
  }));
});
