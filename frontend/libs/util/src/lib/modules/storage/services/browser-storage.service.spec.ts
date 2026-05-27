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
    it('should preserve objects via JSON.parse/stringify', () => {
      const value = { id: 1, name: 'Demo', nested: { active: true } };

      service.set('user', value);

      expect(service.get<typeof value>('user')).toEqual(value);
    });

    it('should preserve strings', () => {
      service.set('locale', 'pt-BR');
      expect(service.get<string>('locale')).toBe('pt-BR');
    });

    it('should preserve numbers', () => {
      service.set('count', 42);
      expect(service.get<number>('count')).toBe(42);
    });

    it('should preserve booleans', () => {
      service.set('enabled', true);
      expect(service.get<boolean>('enabled')).toBe(true);
    });

    it('should preserve arrays', () => {
      service.set('items', [1, 2, 3]);
      expect(service.get<number[]>('items')).toEqual([1, 2, 3]);
    });

    it('should always serialize via JSON.stringify (string stored with quotes)', () => {
      service.set('locale', 'pt-BR');

      expect(localStorage.getItem('locale')).toBe(JSON.stringify('pt-BR'));
    });
  });

  describe('get missing key', () => {
    it('should return null when the key does not exist', () => {
      expect(service.get('missing')).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete the key from localStorage', () => {
      service.set('temp', 'value');
      service.remove('temp');
      expect(service.get('temp')).toBeNull();
    });

    it('should be a no-op when the key does not exist', () => {
      expect(() => service.remove('never-set')).not.toThrow();
    });
  });
});
