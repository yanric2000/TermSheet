import { PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { I18nFieldErrorDirective, I18nService } from '@intapp/i18n';
import type { IDealCreateAPI } from '@intapp/termsheet/deal/models/deal-api.model';
import { DealsStore } from '@intapp/termsheet/deal/stores';
import { calcCapRate } from '@intapp/termsheet/deal/utils/cap-rate.util';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { map, startWith } from 'rxjs';

@Component({
  selector: 'tsh-deal-create-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    ButtonModule,
    I18nFieldErrorDirective,
    PercentPipe,
  ],
  templateUrl: './deal-create-dialog.component.html',
})
export class DealCreateDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18nService);
  private readonly store = inject(DealsStore);

  readonly visible = input(false);
  readonly visibleChange = output<boolean>();
  readonly created = output<void>();

  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    purchasePrice: [null as number | null, [Validators.required, Validators.min(0.01)]],
    address: ['', [Validators.required, Validators.maxLength(500)]],
    noi: [null as number | null, [Validators.required, Validators.min(0)]],
    description: ['', Validators.maxLength(2000)],
  });

  protected readonly capRatePreview = toSignal(
    this.form.valueChanges.pipe(
      startWith(this.form.getRawValue()),
      map(values => calcCapRate(values.noi ?? 0, values.purchasePrice ?? 0)),
    ),
    { initialValue: 0 },
  );

  protected readonly labels = computed(() => ({
    title: this.i18n.t('dealsCreateDialogTitle'),
    name: this.i18n.t('dealsColumnName'),
    purchasePrice: this.i18n.t('dealsColumnPurchasePrice'),
    address: this.i18n.t('dealsColumnAddress'),
    noi: this.i18n.t('dealsColumnNoi'),
    capRate: this.i18n.t('dealsColumnCapRate'),
    description: this.i18n.t('dealsFieldDescription'),
    submit: this.i18n.t('dealsCreateSubmit'),
    cancel: this.i18n.t('dealsCreateCancel'),
  }));

  protected onVisibleChange(visible: boolean): void {
    if (!visible) {
      this.resetForm();
    }
    this.visibleChange.emit(visible);
  }

  protected cancel(): void {
    this.onVisibleChange(false);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: IDealCreateAPI = {
      name: raw.name.trim(),
      purchasePrice: raw.purchasePrice!,
      address: raw.address.trim(),
      noi: raw.noi!,
      description: raw.description.trim(),
    };

    this.saving.set(true);
    this.store.createDeal(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.resetForm();
        this.visibleChange.emit(false);
        this.created.emit();
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  private resetForm(): void {
    this.form.reset({
      name: '',
      purchasePrice: null,
      address: '',
      noi: null,
      description: '',
    });
  }
}
