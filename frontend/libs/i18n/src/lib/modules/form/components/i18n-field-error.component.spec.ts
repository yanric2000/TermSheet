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

  it('should not render <p-message> when message is null (initial state)', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p-message')).toBeNull();
  });

  it('should render <p-message> with severity=error and passed text', () => {
    fixture.componentRef.setInput('message', 'Campo obrigatório');
    fixture.detectChanges();

    const message = fixture.nativeElement.querySelector('p-message');
    expect(message).not.toBeNull();
    expect(message.getAttribute('ng-reflect-severity')).toBe('error');
    expect(message.getAttribute('ng-reflect-text')).toBe('Campo obrigatório');
  });

  it('should remove <p-message> when message becomes null', () => {
    fixture.componentRef.setInput('message', 'error');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p-message')).not.toBeNull();

    fixture.componentRef.setInput('message', null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p-message')).toBeNull();
  });
});
