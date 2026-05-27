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
    it('respeita locale persistido em localStorage acima do idioma do navegador', async () => {
      // O service grava via JSON.stringify; o setup direto precisa imitar a
      // serialização para o read não cair no caminho "valor corrompido".
      localStorage.setItem(LOCALE_STORAGE_KEY, JSON.stringify('es-ES'));
      Object.defineProperty(navigator, 'language', { value: 'en-US', configurable: true });

      const service = await createAndBootstrap();

      expect(service.locale()).toBe('es-ES');
      expect(service.catalog()).toBe(esES);
    });

    it('usa idioma do navegador quando não há valor persistido', async () => {
      Object.defineProperty(navigator, 'language', { value: 'en-US', configurable: true });

      const service = await createAndBootstrap();

      expect(service.locale()).toBe('en-US');
      expect(service.catalog()).toBe(enUS);
    });

    it('faz prefix-match para variantes regionais não suportadas (ex.: pt-PT → pt-BR)', async () => {
      Object.defineProperty(navigator, 'language', { value: 'pt-PT', configurable: true });

      const service = await createAndBootstrap();

      expect(service.locale()).toBe('pt-BR');
    });

    it('cai no DEFAULT_LOCALE quando navegador reporta idioma desconhecido', async () => {
      Object.defineProperty(navigator, 'language', { value: 'ja-JP', configurable: true });

      const service = await createAndBootstrap();

      expect(service.locale()).toBe('pt-BR');
      expect(service.catalog()).toBe(ptBR);
    });

    it('ignora valor inválido no localStorage e usa idioma do navegador', async () => {
      localStorage.setItem(LOCALE_STORAGE_KEY, JSON.stringify('klingon'));
      Object.defineProperty(navigator, 'language', { value: 'en-US', configurable: true });

      const service = await createAndBootstrap();

      expect(service.locale()).toBe('en-US');
    });

    it('catalog() é null antes de bootstrap() resolver', () => {
      const service = create();
      expect(service.catalog()).toBeNull();
    });
  });

  describe('setLocale', () => {
    it('atualiza locale, catalog() e persiste em localStorage', async () => {
      const service = await createAndBootstrap();

      await service.setLocale('en-US');

      expect(service.locale()).toBe('en-US');
      expect(service.catalog()).toBe(enUS);
      // O service serializa via JSON.stringify para passar pelo BrowserStorageService.
      expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe(JSON.stringify('en-US'));
    });

    it('mantém locale atual quando recebe valor não suportado', async () => {
      const service = await createAndBootstrap();
      const initial = service.locale();

      // Cast explícito porque o tipo público proíbe valores inválidos; o teste
      // simula um cenário em que o valor chega por uma rota imprevista (URL,
      // payload de API antiga, etc.) e o service precisa ignorar com segurança.
      await service.setLocale('invalid' as never);

      expect(service.locale()).toBe(initial);
      expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBeNull();
    });

    it('reflete a troca de locale em t(chave)', async () => {
      const service = await createAndBootstrap();
      expect(service.t('loginSubmit')).toBe(ptBR['loginSubmit']);

      await service.setLocale('es-ES');

      expect(service.t('loginSubmit')).toBe(esES['loginSubmit']);
    });

    it('atualiza o atributo lang do <html> para refletir o locale ativo', async () => {
      const service = await createAndBootstrap();

      await service.setLocale('en-US');

      expect(document.documentElement.lang).toBe('en-US');
    });
  });

  describe('t() — placeholders', () => {
    it('substitui {0} pelo argumento numérico', async () => {
      const service = await createAndBootstrap();

      const message = service.t('minLength', 8);

      expect(message).toBe('Mínimo de 8 caracteres');
      expect(message).toContain('8');
    });

    it('substitui {0} pelo argumento textual', async () => {
      const service = await createAndBootstrap();

      const message = service.t('dealsGreeting', 'Yan');

      expect(message).toBe('Olá, Yan');
    });

    it('interpolação funciona consistentemente em todos os locales', async () => {
      const service = await createAndBootstrap();

      await service.setLocale('en-US');
      expect(service.t('dealsGreeting', 'Yan')).toBe('Hello, Yan');

      await service.setLocale('es-ES');
      expect(service.t('dealsGreeting', 'Yan')).toBe('Hola, Yan');
    });

    it('resolve string estática sem argumentos', async () => {
      const service = await createAndBootstrap();
      expect(service.t('loginSubtitle')).toBe(ptBR['loginSubtitle']);
    });

    it('retorna string vazia antes do catálogo carregar', () => {
      // Defensivo: cenário não acontece em runtime real (APP_INITIALIZER
      // aguarda bootstrap), mas testamos para garantir que não dispara
      // exception se alguém criar o service manualmente.
      const service = create();
      expect(service.t('loginSubmit')).toBe('');
    });
  });

  describe('pageTitle()', () => {
    it('compõe productName + section corretamente', async () => {
      const service = await createAndBootstrap();

      expect(service.pageTitle('pageTitleLogin')).toBe('TermSheet · Login');
    });

    it('compõe usando o branding do locale ativo', async () => {
      const service = await createAndBootstrap();

      await service.setLocale('en-US');
      expect(service.pageTitle('pageTitleLogin')).toBe('TermSheet · Sign in');

      await service.setLocale('es-ES');
      expect(service.pageTitle('pageTitleLogin')).toBe('TermSheet · Iniciar sesión');
    });
  });
});
