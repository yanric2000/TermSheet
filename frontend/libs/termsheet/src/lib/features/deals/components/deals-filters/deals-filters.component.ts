import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  Signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { I18nService } from '@intapp/i18n';
import type { DealsFilterValues, PriceOperator } from '@intapp/termsheet/deal/models/deals-filters.model';
import * as deepEqual from 'fast-deep-equal';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { debounceTime, distinctUntilChanged, map, skip, startWith } from 'rxjs';

type FilterFormGroupType = FormGroup<{
  name: FormControl<string>;
  operator: FormControl<PriceOperator | null>;
  value: FormControl<number | null>;
}>;

type FilterFormRawValue = {
  name: string;
  operator: PriceOperator | null;
  value: number | null;
};

@Component({
  selector: 'tsh-deals-filters',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, InputTextModule, DropdownModule, InputNumberModule, ButtonModule],
  templateUrl: './deals-filters.component.html',
})
export class DealsFiltersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18nService);

  readonly filters = input.required<DealsFilterValues>();
  readonly filtersChange = output<DealsFilterValues>();
  readonly clear = output<void>();

  protected readonly form: FilterFormGroupType = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control<string>(''),
    operator: this.fb.control<PriceOperator | null>(null),
    value: this.fb.control<number | null>(null),
  });

  protected readonly labels = computed(() => ({
    searchPlaceholder: this.i18n.t('dealsFilterSearchPlaceholder'),
    operatorLabel: this.i18n.t('dealsFilterOperatorLabel'),
    operatorGte: this.i18n.t('dealsFilterOperatorGte'),
    operatorLte: this.i18n.t('dealsFilterOperatorLte'),
    pricePlaceholder: this.i18n.t('dealsFilterPricePlaceholder'),
    clear: this.i18n.t('dealsFilterClear'),
  }));

  protected readonly operatorOptions = computed(() => [
    { label: this.labels().operatorGte, value: 'gte' },
    { label: this.labels().operatorLte, value: 'lte' },
  ]);

  protected readonly hasActiveFilters = computed(() => {
    const f = this.filters();
    return Boolean(f.name?.trim() || f.minPrice != null || f.maxPrice != null);
  });

  private readonly formatedFiltersReceived: Signal<FilterFormRawValue> = computed(() =>
    this.formatFiltersToFormValue(this.filters()),
  );

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    toObservable(this.formatedFiltersReceived)
      .pipe(
        takeUntilDestroyed(),
        distinctUntilChanged((a, b) => deepEqual(a, b)),
      )
      .subscribe({
        next: filters =>
          this.form.patchValue(
            {
              name: filters.name,
              operator: filters.operator,
              value: filters.value,
            },
            { emitEvent: false },
          ),
      });
  }

  ngOnInit(): void {
    this.listenFormChangesThenEmitFilters();
  }

  protected onClear(): void {
    this.clear.emit();
  }

  private listenFormChangesThenEmitFilters() {
    this.form.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        startWith(null),
        map(() => this.formatFormValueToFilters(this.form.getRawValue())),
        distinctUntilChanged((a, b) => deepEqual(a, b)),
        debounceTime(300),
        skip(1),
      )
      .subscribe({ next: newFilters => this.emitFilters(newFilters) });
  }

  private emitFilters(filters: DealsFilterValues): void {
    this.filtersChange.emit(filters);
  }

  private formatFormValueToFilters(formValue: FilterFormRawValue): DealsFilterValues {
    return {
      name: formValue.name ?? '',
      minPrice: formValue.operator === 'gte' ? formValue.value : null,
      maxPrice: formValue.operator === 'lte' ? formValue.value : null,
    };
  }

  private formatFiltersToFormValue(filters: DealsFilterValues): FilterFormRawValue {
    return {
      name: filters.name ?? '',
      operator: filters.minPrice ? 'gte' : filters.maxPrice ? 'lte' : null,
      value: filters.minPrice ?? filters.maxPrice ?? null,
    };
  }
}
