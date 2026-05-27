import { ComponentFixture, TestBed } from '@angular/core/testing';

import { I18nFieldErrorComponent } from './i18n-field-error.component';

describe('I18nFieldErrorComponent', () => {
  let fixture: ComponentFixture<I18nFieldErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [I18nFieldErrorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(I18nFieldErrorComponent);
  });

  it('não renderiza <p-message> quando `message` é null (estado inicial)', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p-message')).toBeNull();
  });

  it('renderiza <p-message> com severity=error e o texto passado', () => {
    fixture.componentRef.setInput('message', 'Campo obrigatório');
    fixture.detectChanges();

    const message = fixture.nativeElement.querySelector('p-message');
    expect(message).not.toBeNull();
    expect(message.getAttribute('ng-reflect-severity')).toBe('error');
    expect(message.getAttribute('ng-reflect-text')).toBe('Campo obrigatório');
  });

  it('remove o <p-message> quando `message` volta para null', () => {
    fixture.componentRef.setInput('message', 'erro');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p-message')).not.toBeNull();

    fixture.componentRef.setInput('message', null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p-message')).toBeNull();
  });
});
