import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import {
  DEFAULT_LOCALE,
  ITranslations,
  LOCALE_STORAGE_KEY,
  Locale,
  SUPPORTED_LOCALES,
  TranslationKey,
} from '@intapp/i18n/models';
import { formatTemplate } from '@intapp/i18n/utils';
import { BrowserStorageService } from '@intapp/util';
import { PrimeNGConfig } from 'primeng/api';

import { LOCALE_LOADERS, PRIMENG_LOADERS } from '../locales/catalog';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private document = inject(DOCUMENT);
  private primeng = inject(PrimeNGConfig);
  private storage = inject(BrowserStorageService);

  private _locale = signal<Locale>(this.detectInitialLocale());
  private _catalog = signal<ITranslations | null>(null);

  readonly locale = this._locale.asReadonly();
  readonly catalog = this._catalog.asReadonly();

  async bootstrap(): Promise<void> {
    const initial = this._locale();
    await this.loadAndApply(initial);
    this.syncDocumentLang(initial);
  }

  t<K extends TranslationKey>(key: K, ...args: (string | number)[]): string {
    const catalog = this._catalog();
    if (!catalog) return '';
    return formatTemplate(catalog[key], args);
  }

  pageTitle<K extends TranslationKey>(key: K, ...args: string[]): string {
    const section = (this.t as (k: K, ...a: unknown[]) => string)(key, ...(args as unknown[]));
    return `${this.t('productName')} · ${section}`;
  }

  async setLocale(locale: Locale): Promise<void> {
    if (!SUPPORTED_LOCALES.includes(locale)) return;
    await this.loadAndApply(locale);
    this.persist(locale);
    this.syncDocumentLang(locale);
  }

  private detectInitialLocale(): Locale {
    const stored = this.readPersisted();
    if (stored) return stored;

    const navigator = window.navigator;
    const browserLanguage = navigator.language ?? '';
    const prefix = browserLanguage.toLowerCase().slice(0, 2);
    const matched = SUPPORTED_LOCALES.find(locale => locale.toLowerCase().startsWith(prefix));

    return matched ?? DEFAULT_LOCALE;
  }

  private async loadAndApply(locale: Locale): Promise<void> {
    const [catalog, primeng] = await Promise.all([LOCALE_LOADERS[locale](), PRIMENG_LOADERS[locale]()]);
    this._catalog.set(catalog);
    this._locale.set(locale);
    this.primeng.setTranslation(primeng);
  }

  private readPersisted(): Locale | null {
    const raw = this.storage.get<Locale>(LOCALE_STORAGE_KEY);
    return raw && SUPPORTED_LOCALES.includes(raw) ? raw : null;
  }

  private persist(locale: Locale): void {
    this.storage.set<Locale>(LOCALE_STORAGE_KEY, locale);
  }

  private syncDocumentLang(locale: Locale): void {
    const html = this.document.documentElement;
    if (html) {
      html.lang = locale;
    }
  }
}
