import { TestBed } from '@angular/core/testing';
import { PkceService } from './pkce.service';

describe('PkceService', () => {
  let service: PkceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PkceService);
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('generateCodeVerifier', () => {
    it('generates a non-empty base64url string', () => {
      const verifier = service.generateCodeVerifier();
      expect(verifier.length).toBeGreaterThan(0);
      expect(verifier).toMatch(/^[A-Za-z0-9\-_]+$/);
    });

    it('generates unique values', () => {
      const v1 = service.generateCodeVerifier();
      const v2 = service.generateCodeVerifier();
      expect(v1).not.toBe(v2);
    });
  });

  describe('generateCodeChallenge', () => {
    it('returns a base64url string', async () => {
      const verifier = service.generateCodeVerifier();
      const challenge = await service.generateCodeChallenge(verifier);
      expect(challenge).toMatch(/^[A-Za-z0-9\-_]+$/);
      expect(challenge).not.toContain('=');
      expect(challenge).not.toContain('+');
      expect(challenge).not.toContain('/');
    });

    it('is deterministic for the same verifier', async () => {
      const verifier = service.generateCodeVerifier();
      const c1 = await service.generateCodeChallenge(verifier);
      const c2 = await service.generateCodeChallenge(verifier);
      expect(c1).toBe(c2);
    });

    it('produces different challenges for different verifiers', async () => {
      const c1 = await service.generateCodeChallenge('verifier-one-xxxxxxxxxxxxxxxxxxxxxxxx');
      const c2 = await service.generateCodeChallenge('verifier-two-xxxxxxxxxxxxxxxxxxxxxxxx');
      expect(c1).not.toBe(c2);
    });
  });

  describe('generateState', () => {
    it('generates a non-empty base64url string', () => {
      const state = service.generateState();
      expect(state.length).toBeGreaterThan(0);
      expect(state).toMatch(/^[A-Za-z0-9\-_]+$/);
    });

    it('generates unique values', () => {
      const s1 = service.generateState();
      const s2 = service.generateState();
      expect(s1).not.toBe(s2);
    });
  });

  describe('storeSession / consumeSession', () => {
    it('returns null when nothing is stored', () => {
      expect(service.consumeSession()).toBeNull();
    });

    it('returns stored verifier and state', () => {
      service.storeSession('my-verifier', 'my-state');
      const result = service.consumeSession();
      expect(result).toEqual({ verifier: 'my-verifier', state: 'my-state' });
    });

    it('deletes values from sessionStorage after consumption', () => {
      service.storeSession('my-verifier', 'my-state');
      service.consumeSession();
      expect(service.consumeSession()).toBeNull();
    });

    it('returns null if only verifier is present', () => {
      sessionStorage.setItem('__pkce_v__', 'verifier');
      expect(service.consumeSession()).toBeNull();
    });
  });
});
