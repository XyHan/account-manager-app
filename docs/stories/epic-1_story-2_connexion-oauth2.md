# Story 1.2 — Connexion OAuth2 (Authorization Code + PKCE)

**Epic :** Authentification & gestion du compte utilisateur
**Statut :** À faire

## Description
En tant qu'utilisateur, je veux me connecter avec mon email et mot de passe via un flow OAuth2 sécurisé afin de recevoir un token d'accès et accéder aux fonctionnalités de l'application.

## Critères d'acceptation
- [ ] GET `/auth/authorize` avec les paramètres PKCE obligatoires sert la page de login
- [ ] Les paramètres `response_type=code`, `client_id`, `code_challenge`, `code_challenge_method=S256`, `redirect_uri`, `state` sont validés — paramètre manquant ou invalide → 400
- [ ] POST `/auth/authorize` valide les credentials et redirige vers `redirect_uri?code=xxx&state=xxx`
- [ ] Un email ou mot de passe incorrect retourne la page de login avec un message d'erreur
- [ ] L'authorization code est à usage unique, expire en 5 minutes
- [ ] POST `/auth/token` avec `grant_type=authorization_code` échange le code contre les tokens après validation PKCE
- [ ] La validation PKCE échoue si `SHA-256(code_verifier) != code_challenge` → 401
- [ ] En cas de succès, l'access token est posé dans le cookie `X-Access-Token` (httpOnly, secure, sameSite=strict, 15min)
- [ ] Le refresh token est posé dans le cookie `X-Refresh-Token` (httpOnly, secure, 30 jours)
- [ ] Les deux endpoints de login sont protégés par un rate limiter (max 10 tentatives/minute par IP)
- [ ] L'événement `UserLoggedIn` est dispatché et persisté après échange de code réussi
- [ ] Après connexion réussie, l'utilisateur est redirigé vers `/dashboard`
- [ ] Les routes privées Angular redirigent vers `/login` si l'utilisateur n'est pas connecté

## Tâches techniques

### Backend
- [ ] Installer et configurer `@node-oauth/oauth2-server`
- [ ] Créer `OAuthClientOrmEntity` avec migration (clientId, clientSecret, grants, redirectUris, scope)
- [ ] Créer `OAuthTokenOrmEntity` avec migration (accessToken, refreshToken, expiresAt, scope, userId, clientId)
- [ ] Créer `OAuthAuthorizationCodeOrmEntity` avec migration (code, codeChallenge, codeChallengeMethod, redirectUri, expiresAt, userId, clientId)
- [ ] Créer le seed du client OAuth2 interne (`app`, scope `app`, grant `authorization_code`)
- [ ] Implémenter `OAuthService` (modèle oauth2-server : `getClient`, `getUser`, `saveAuthorizationCode`, `getAuthorizationCode`, `revokeAuthorizationCode`, `saveToken`)
- [ ] Implémenter la validation PKCE dans `OAuthService` : `SHA-256(code_verifier)` encodé en base64url doit correspondre au `code_challenge` stocké
- [ ] Créer `AuthController.authorize()` → GET `/auth/authorize` (sert la page de login HTML avec les paramètres PKCE en hidden inputs)
- [ ] Créer `AuthController.submitAuthorize()` → POST `/auth/authorize` (valide credentials, génère code, redirige)
- [ ] Créer `AuthController.token()` → POST `/auth/token` (échange code contre cookies)
- [ ] Configurer le rate limiter sur POST `/auth/authorize` via `@nestjs/throttler`
- [ ] Créer l'event `UserLoggedIn` (userId, ip, timestamp)
- [ ] Créer `OAuthGuard` (lit le cookie `X-Access-Token`, valide via oauth2-server)
- [ ] Créer `ScopesGuard` avec décorateur `@Scopes()`
- [ ] Créer `RolesGuard` avec décorateur `@Roles()`

### Frontend
- [ ] Créer un helper PKCE `PkceService` :
  - `generateCodeVerifier()` : 64 octets aléatoires encodés en base64url
  - `generateCodeChallenge(verifier)` : SHA-256 du verifier encodé en base64url
  - `generateState()` : valeur aléatoire anti-CSRF
  - Stocker `code_verifier` et `state` en mémoire (pas localStorage)
- [ ] Créer `AuthService.login()` : génère PKCE + state, redirige vers `GET /auth/authorize`
- [ ] Créer la page `/auth/callback` avec `AuthCallbackComponent` :
  - Lit `code` et `state` depuis les query params
  - Vérifie que `state` correspond à celui stocké en mémoire (protection CSRF)
  - Appelle POST `/auth/token` avec `grant_type=authorization_code`, `code`, `code_verifier`, `client_id`, `redirect_uri`
  - Redirige vers `/dashboard` en cas de succès
- [ ] Créer `AuthService.isAuthenticated()` : tente GET `/auth/me` pour vérifier si un cookie valide existe
- [ ] Créer `AuthGuard` Angular — redirige vers `/login` si non authentifié
- [ ] Créer `HttpInterceptor` — ajoute `withCredentials: true` à tous les appels HTTP
- [ ] Configurer le routing avec les routes protégées (`canActivate: [AuthGuard]`)

## Notes techniques
- Dépendance : story 1.1 (User doit exister)
- Le `code_verifier` ne doit jamais quitter la mémoire Angular — ne pas le stocker en `localStorage` ou `sessionStorage`
- La page de login HTML servie par le backend peut être minimaliste (juste email/password + hidden inputs PKCE) puisque l'UX principale est gérée par Angular
- Ajouter `GET /auth/me` (scope `app`) pour permettre à `AuthGuard` de vérifier l'état de session sans exposer le token
