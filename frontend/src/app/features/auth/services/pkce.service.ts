import { Injectable } from '@angular/core';

// sessionStorage est utilisé ici intentionnellement (et non localStorage) :
// le flow OAuth2 PKCE nécessite un redirect complet qui détruit l'app Angular.
// La spec dit "pas localStorage" car il est persistant cross-session.
// sessionStorage est volatile (vidé à la fermeture de l'onglet) et inAccessible cross-origin.
// Le verifier est supprimé immédiatement après lecture (consumeSession).
const VERIFIER_KEY = '__pkce_v__';
const STATE_KEY = '__pkce_s__';

@Injectable({ providedIn: 'root' })
export class PkceService {
  generateCodeVerifier(): string {
    const bytes = new Uint8Array(64);
    crypto.getRandomValues(bytes);
    return this.base64url(bytes);
  }

  async generateCodeChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return this.base64url(new Uint8Array(digest));
  }

  generateState(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return this.base64url(bytes);
  }

  storeSession(verifier: string, state: string): void {
    sessionStorage.setItem(VERIFIER_KEY, verifier);
    sessionStorage.setItem(STATE_KEY, state);
  }

  consumeSession(): { verifier: string; state: string } | null {
    const verifier = sessionStorage.getItem(VERIFIER_KEY);
    const state = sessionStorage.getItem(STATE_KEY);
    sessionStorage.removeItem(VERIFIER_KEY);
    sessionStorage.removeItem(STATE_KEY);
    if (!verifier || !state) return null;
    return { verifier, state };
  }

  private base64url(bytes: Uint8Array): string {
    const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }
}
