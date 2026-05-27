import { TestBed } from '@angular/core/testing';

import { BrowserStorageService } from './browser-storage.service';

describe('BrowserStorageService', () => {
  let service: BrowserStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [BrowserStorageService] });
    service = TestBed.inject(BrowserStorageService);
  });

  describe('get/set round-trip', () => {
    it('preserva objetos via JSON.parse/stringify', () => {
      const value = { id: 1, name: 'Demo', nested: { active: true } };

      service.set('user', value);

      expect(service.get<typeof value>('user')).toEqual(value);
    });

    it('preserva strings', () => {
      service.set('locale', 'pt-BR');
      expect(service.get<string>('locale')).toBe('pt-BR');
    });

    it('preserva números', () => {
      service.set('count', 42);
      expect(service.get<number>('count')).toBe(42);
    });

    it('preserva booleanos', () => {
      service.set('enabled', true);
      expect(service.get<boolean>('enabled')).toBe(true);
    });

    it('preserva arrays', () => {
      service.set('items', [1, 2, 3]);
      expect(service.get<number[]>('items')).toEqual([1, 2, 3]);
    });

    it('sempre serializa via JSON.stringify (string vai com aspas)', () => {
      service.set('locale', 'pt-BR');
      // Conferência defensiva: o teste documenta o contrato de serialização.
      // Quem ler direto do localStorage (sem passar pelo service) precisa
      // saber que vai receber a forma serializada.
      expect(localStorage.getItem('locale')).toBe(JSON.stringify('pt-BR'));
    });
  });

  describe('get em chave ausente', () => {
    it('retorna null quando a chave não existe', () => {
      expect(service.get('missing')).toBeNull();
    });
  });

  describe('remove', () => {
    it('apaga a chave de localStorage', () => {
      service.set('temp', 'value');
      service.remove('temp');
      expect(service.get('temp')).toBeNull();
    });

    it('é no-op quando a chave não existe', () => {
      expect(() => service.remove('never-set')).not.toThrow();
    });
  });
});
