import { TestBed } from '@angular/core/testing';
import { LOCALE_STORAGE_KEY } from '@intapp/i18n/models';

import { enUS } from '../locales/en-US';
import { esES } from '../locales/es-ES';
import { ptBR } from '../locales/pt-BR';

import { I18nService } from './i18n.service';

describe('I18nService', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(navigator, 'language', { value: 'pt-BR', configurable: true });
  });

  function create(): I18nService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [I18nService] });
    return TestBed.inject(I18nService);
  }

  async function createAndBootstrap(): Promise<I18nService> {
    const service = create();
    await service.bootstrap();
    return service;
  }

  describe('initial locale', () => {
    it('should prefer locale persisted in localStorage over browser language', async () => {
      localStorage.setItem(LOCALE_STORAGE_KEY, JSON.stringify('es-ES'));
      Object.defineProperty(navigator, 'language', { value: 'en-US', configurable: true });

      const service = await createAndBootstrap();

      expect(service.locale()).toBe('es-ES');
      expect(service.catalog()).toBe(esES);
    });

    it('should use browser language when nothing is persisted', async () => {
      Object.defineProperty(navigator, 'language', { value: 'en-US', configurable: true });

      const service = await createAndBootstrap();

      expect(service.locale()).toBe('en-US');
      expect(service.catalog()).toBe(enUS);
    });

    it('should prefix-match unsupported regional variants (e.g. pt-PT → pt-BR)', async () => {
      Object.defineProperty(navigator, 'language', { value: 'pt-PT', configurable: true });

      const service = await createAndBootstrap();

      expect(service.locale()).toBe('pt-BR');
    });

    it('should fall back to DEFAULT_LOCALE when browser reports unknown language', async () => {
      Object.defineProperty(navigator, 'language', { value: 'ja-JP', configurable: true });

      const service = await createAndBootstrap();

      expect(service.locale()).toBe('pt-BR');
      expect(service.catalog()).toBe(ptBR);
    });

    it('should ignore invalid localStorage value and use browser language', async () => {
      localStorage.setItem(LOCALE_STORAGE_KEY, JSON.stringify('klingon'));
      Object.defineProperty(navigator, 'language', { value: 'en-US', configurable: true });

      const service = await createAndBootstrap();

      expect(service.locale()).toBe('en-US');
    });

    it('should have catalog() null before bootstrap() resolves', () => {
      const service = create();
      expect(service.catalog()).toBeNull();
    });
  });

  describe('setLocale', () => {
    it('should update locale, catalog() and persist to localStorage', async () => {
      const service = await createAndBootstrap();

      await service.setLocale('en-US');

      expect(service.locale()).toBe('en-US');
      expect(service.catalog()).toBe(enUS);

      expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe(JSON.stringify('en-US'));
    });

    it('should keep current locale when given unsupported value', async () => {
      const service = await createAndBootstrap();
      const initial = service.locale();

      await service.setLocale('invalid' as never);

      expect(service.locale()).toBe(initial);
      expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBeNull();
    });

    it('should reflect locale change in t(key)', async () => {
      const service = await createAndBootstrap();
      expect(service.t('loginSubmit')).toBe(ptBR['loginSubmit']);

      await service.setLocale('es-ES');

      expect(service.t('loginSubmit')).toBe(esES['loginSubmit']);
    });

    it('should update html lang attribute to match active locale', async () => {
      const service = await createAndBootstrap();

      await service.setLocale('en-US');

      expect(document.documentElement.lang).toBe('en-US');
    });
  });

  describe('t() placeholders', () => {
    it('should replace {0} with numeric argument', async () => {
      const service = await createAndBootstrap();

      const message = service.t('minLength', 8);

      expect(message).toBe('Mínimo de 8 caracteres');
      expect(message).toContain('8');
    });

    it('should replace {0} with string argument', async () => {
      const service = await createAndBootstrap();

      const message = service.t('dealsGreeting', 'Yan');

      expect(message).toBe('Olá, Yan');
    });

    it('should interpolate consistently across all locales', async () => {
      const service = await createAndBootstrap();

      await service.setLocale('en-US');
      expect(service.t('dealsGreeting', 'Yan')).toBe('Hello, Yan');

      await service.setLocale('es-ES');
      expect(service.t('dealsGreeting', 'Yan')).toBe('Hola, Yan');
    });

    it('should resolve static string without arguments', async () => {
      const service = await createAndBootstrap();
      expect(service.t('loginSubtitle')).toBe(ptBR['loginSubtitle']);
    });

    it('should return empty string before catalog loads', () => {
      const service = create();
      expect(service.t('loginSubmit')).toBe('');
    });
  });

  describe('pageTitle()', () => {
    it('should compose productName + section correctly', async () => {
      const service = await createAndBootstrap();

      expect(service.pageTitle('pageTitleLogin')).toBe('TermSheet · Login');
    });

    it('should compose using active locale branding', async () => {
      const service = await createAndBootstrap();

      await service.setLocale('en-US');
      expect(service.pageTitle('pageTitleLogin')).toBe('TermSheet · Sign in');

      await service.setLocale('es-ES');
      expect(service.pageTitle('pageTitleLogin')).toBe('TermSheet · Iniciar sesión');
    });
  });
});
