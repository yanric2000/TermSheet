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

/**
 * Service central de internacionalização (com loading assíncrono dos locales).
 *
 * Decisões de design:
 *  - Os dicionários (nosso e o do PrimeNG) NÃO entram no bundle inicial:
 *    `LOCALE_LOADERS`/`PRIMENG_LOADERS` usam `import()` dinâmico, então cada
 *    idioma vira um chunk lazy. Apenas o locale ativo é baixado no boot.
 *  - `bootstrap()` (chamado pelo `APP_INITIALIZER`) bloqueia o boot até o
 *    primeiro locale ter carregado. Isso garante que nenhum template renderiza
 *    chave/string vazia.
 *  - `setLocale()` é assíncrono. Idiomas suportados podem ser pré-carregados
 *    em background quando um seletor de idioma existir (fora de escopo aqui).
 *  - State em `signal`s nativos para reatividade idiomática Angular 17+.
 *  - `t(key, ...args)` retorna `string`. Em estado transitório (catálogo
 *    ainda carregando, ex.: criação manual fora do APP_INITIALIZER) retorna
 *    `''` para evitar exception — não deve acontecer em runtime real.
 *  - Persistência delegada ao `BrowserStorageService` da `@intapp/util` —
 *    encapsula `JSON.parse`/`stringify` e `window.localStorage` num único
 *    ponto, mantendo este service focado em domínio (load lazy + signals).
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private document = inject(DOCUMENT);
  private primeng = inject(PrimeNGConfig);
  private storage = inject(BrowserStorageService);

  private _locale = signal<Locale>(this.detectInitialLocale());
  private _catalog = signal<ITranslations | null>(null);

  /** Locale corrente. Mutação só via `setLocale()`. */
  readonly locale = this._locale.asReadonly();

  /**
   * Catálogo atual. `null` apenas durante o boot, antes do `APP_INITIALIZER`
   * resolver — em runtime normal sempre está populado.
   *
   * Componentes em geral consomem via `t(key)`, não diretamente daqui.
   */
  readonly catalog = this._catalog.asReadonly();

  /**
   * Carrega o catálogo do locale inicial e sincroniza o PrimeNG.
   *
   * Chamado pelo `APP_INITIALIZER` em `provideI18n()` — o boot do Angular
   * aguarda essa Promise antes de renderizar qualquer template, então o
   * dicionário nunca é `null` em UI.
   */
  async bootstrap(): Promise<void> {
    const initial = this._locale();
    await this.loadAndApply(initial);
    this.syncDocumentLang(initial);
  }

  t<K extends TranslationKey>(key: K, ...args: string[]): string {
    const catalog = this._catalog();
    if (!catalog) return '';
    return formatTemplate(catalog[key], args as readonly unknown[]);
  }

  pageTitle<K extends TranslationKey>(key: K, ...args: string[]): string {
    const section = (this.t as (k: K, ...a: unknown[]) => string)(key, ...(args as unknown[]));
    return `${this.t('productName')} · ${section}`;
  }

  /**
   * Troca o idioma ativo (assíncrono).
   *
   * Faz o load do chunk lazy, atualiza signals + persistência + `<html lang>`
   * + tradução do PrimeNG. Locales não suportados são ignorados silenciosamente
   * — é melhor manter o usuário no idioma atual do que jogar erro pela UI.
   *
   * Por ser async, o caller pode `await` para garantir que o dicionário esteja
   * pronto antes de qualquer ação dependente (ex.: re-renderizar um título
   * via `Router.navigate`).
   */
  async setLocale(locale: Locale): Promise<void> {
    if (!SUPPORTED_LOCALES.includes(locale)) return;
    await this.loadAndApply(locale);
    this.persist(locale);
    this.syncDocumentLang(locale);
  }

  /**
   * Resolve o locale inicial sem tocar I/O assíncrono:
   *  1. valor previamente persistido em `localStorage`
   *  2. idioma reportado pelo navegador (`navigator.language`)
   *  3. `DEFAULT_LOCALE`
   *
   * O matching com `navigator.language` é prefixo-aware (ex.: `pt-PT` → `pt-BR`)
   * para evitar exigir match exato em variantes regionais não declaradas.
   *
   * Pequena diferença com o anterior: aqui ainda NÃO há catálogo. O método
   * apenas decide o ID; o load efetivo acontece em `bootstrap()` / `setLocale()`.
   */
  private detectInitialLocale(): Locale {
    const stored = this.readPersisted();
    if (stored) return stored;

    const navigator = window.navigator;
    const browserLanguage = navigator.language ?? '';
    const prefix = browserLanguage.toLowerCase().slice(0, 2);
    const matched = SUPPORTED_LOCALES.find(locale => locale.toLowerCase().startsWith(prefix));

    return matched ?? DEFAULT_LOCALE;
  }

  /**
   * Carrega catálogo + PrimeNG em paralelo e aplica nos signals/serviço.
   *
   * `Promise.all` paraleliza os dois imports — economiza ~1 ida-e-volta de
   * latência de rede comparado a chamar sequencialmente.
   *
   * O `_locale` só é atualizado DEPOIS dos catálogos terem chegado, para
   * evitar uma janela em que o template lê uma chave que ainda não existe
   * no novo dicionário (cenário improvável mas defensivo).
   */
  private async loadAndApply(locale: Locale): Promise<void> {
    const [catalog, primeng] = await Promise.all([LOCALE_LOADERS[locale](), PRIMENG_LOADERS[locale]()]);
    this._catalog.set(catalog);
    this._locale.set(locale);
    this.primeng.setTranslation(primeng);
  }

  /**
   * Lê o locale persistido via `BrowserStorageService` e revalida contra
   * `SUPPORTED_LOCALES`.
   *
   * A revalidação é necessária mesmo com o generic `<Locale>`: o storage
   * pode conter qualquer string (escrita por uma versão anterior do app,
   * por outra aba, por um teste antigo). Tratamos `Locale` ali como
   * "expectativa do caller", não como prova runtime.
   */
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
