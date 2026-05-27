import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { I18nService } from '@intapp/i18n';
import { DealsStore } from '@intapp/termsheet/deal/stores';
import { of, throwError } from 'rxjs';

import { DealCreateDialogComponent } from './deal-create-dialog.component';

describe('DealCreateDialogComponent', () => {
  let fixture: ComponentFixture<DealCreateDialogComponent>;
  let storeMock: { createDeal: jest.Mock };

  beforeEach(async () => {
    storeMock = {
      createDeal: jest.fn().mockReturnValue(
        of({
          id: 'deal-1',
          name: 'New Deal',
          purchasePrice: 500_000,
          address: '1st Ave',
          noi: 25_000,
          description: '',
        }),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [DealCreateDialogComponent, NoopAnimationsModule],
      providers: [{ provide: DealsStore, useValue: storeMock }, I18nService],
    }).compileComponents();

    await TestBed.inject(I18nService).setLocale('pt-BR');

    fixture = TestBed.createComponent(DealCreateDialogComponent);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
  });

  it('should not call createDeal when the form is invalid', () => {
    fixture.componentInstance['submit']();
    expect(storeMock.createDeal).not.toHaveBeenCalled();
  });

  it('should call createDeal and emit created when the form is valid', () => {
    const createdSpy = jest.fn();
    fixture.componentInstance.created.subscribe(createdSpy);

    fixture.componentInstance['form'].patchValue({
      name: 'New Deal',
      purchasePrice: 500_000,
      address: '1st Ave',
      noi: 25_000,
    });

    fixture.componentInstance['submit']();

    expect(storeMock.createDeal).toHaveBeenCalledWith({
      name: 'New Deal',
      purchasePrice: 500_000,
      address: '1st Ave',
      noi: 25_000,
      description: '',
    });
    expect(createdSpy).toHaveBeenCalled();
  });

  it('should keep the dialog open when createDeal fails', () => {
    storeMock.createDeal.mockReturnValue(throwError(() => new Error('fail')));

    fixture.componentInstance['form'].patchValue({
      name: 'New Deal',
      purchasePrice: 500_000,
      address: '1st Ave',
      noi: 25_000,
    });

    const visibleSpy = jest.fn();
    fixture.componentInstance.visibleChange.subscribe(visibleSpy);

    fixture.componentInstance['submit']();

    expect(visibleSpy).not.toHaveBeenCalledWith(false);
  });
});
