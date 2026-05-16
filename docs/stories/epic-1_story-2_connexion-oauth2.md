# Story 1.2 — Connexion OAuth2 (Authorization Code + PKCE)

**Epic :** Authentification & gestion du compte utilisateur
**Statut :** Terminé

## Description
En tant qu'utilisateur, je veux me connecter avec mon email et mot de passe via un flow OAuth2 sécurisé afin de recevoir un token d'accès et accéder aux fonctionnalités de l'application.

## Critères d'acceptation
- [x] GET `/auth/authorize` avec les paramètres PKCE obligatoires sert la page de login
- [x] Les paramètres `response_type=code`, `client_id`, `code_challenge`, `code_challenge_method=S256`, `redirect_uri`, `state` sont validés — paramètre manquant ou invalide → 400
- [x] POST `/auth/authorize` valide les credentials et redirige vers `redirect_uri?code=xxx&state=xxx`
- [x] Un email ou mot de passe incorrect retourne la page de login avec un message d'erreur
- [x] L'authorization code est à usage unique, expire en 5 minutes
- [x] POST `/auth/token` avec `grant_type=authorization_code` échange le code contre les tokens après validation PKCE
- [x] La validation PKCE échoue si `SHA-256(code_verifier) != code_challenge` → 401
- [x] En cas de succès, l'access token est posé dans le cookie `X-Access-Token` (httpOnly, secure, sameSite=strict, 15min)
- [x] Le refresh token est posé dans le cookie `X-Refresh-Token` (httpOnly, secure, 30 jours)
- [x] Les deux endpoints de login sont protégés par un rate limiter (max 10 tentatives/minute par IP)
- [x] L'événement `UserLoggedIn` est dispatché et persisté après échange de code réussi
- [x] Après connexion réussie, l'utilisateur est redirigé vers `/dashboard` (front — story front)
- [x] Les routes privées Angular redirigent vers `/login` si l'utilisateur n'est pas connecté (front — story front)

## Tâches techniques

### Backend
- [x] PKCE implémenté nativement (crypto Node.js, timingSafeEqual) — `@node-oauth/oauth2-server` non utilisé (intégration NestJS cookies incompatible avec leur HTTP layer)
- [x] Créer `OAuthClientOrmEntity` avec migration (clientId, clientSecret, grants, redirectUris, scope)
- [x] Créer `OAuthTokenOrmEntity` avec migration (accessToken, refreshToken, expiresAt, scope, userId, clientId, userRole)
- [x] Créer `OAuthAuthorizationCodeOrmEntity` avec migration (code, codeChallenge, codeChallengeMethod, redirectUri, expiresAt, userId, clientId)
- [x] Créer le seed du client OAuth2 interne (`app`, scope `app`, grant `authorization_code`)
- [x] Implémenter `OAuthService` (getClient, validateCredentials, generateAuthorizationCode, exchangeCodeForToken, validateAccessToken)
- [x] Implémenter la validation PKCE dans `OAuthService` : `SHA-256(code_verifier)` encodé en base64url doit correspondre au `code_challenge` stocké
- [x] Créer `AuthController.authorize()` → GET `/auth/authorize` (sert la page de login HTML avec les paramètres PKCE en hidden inputs)
- [x] Créer `AuthController.submitAuthorize()` → POST `/auth/authorize` (valide credentials, génère code, redirige)
- [x] Créer `AuthController.token()` → POST `/auth/token` (échange code contre cookies)
- [x] Configurer le rate limiter sur POST `/auth/authorize` via `@nestjs/throttler`
- [x] Créer l'event `UserLoggedIn` (userId, ip, timestamp)
- [x] Créer `OAuthGuard` (lit le cookie `X-Access-Token`, valide en base)
- [x] Créer `ScopesGuard` avec décorateur `@Scopes()`
- [x] Créer `RolesGuard` avec décorateur `@Roles()`

### Frontend
- [x] Créer `PkceService` (generateCodeVerifier, generateCodeChallenge SHA-256, generateState, storeSession/consumeSession sessionStorage)
- [x] Créer `AuthService.login()` : génère PKCE + state, redirige vers `GET /auth/authorize`
- [x] Créer la page `/auth/callback` avec `AuthCallbackComponent` (vérification state CSRF, échange code, redirect /dashboard)
- [x] Créer `AuthService.isAuthenticated()` : tente GET `/auth/me` pour vérifier si un cookie valide existe
- [x] Créer `authGuard` Angular — redirige vers `/login` si non authentifié
- [x] Créer `credentialsInterceptor` — ajoute `withCredentials: true` aux appels vers l'API
- [x] Configurer le routing avec les routes protégées (`canActivate: [authGuard]`) + route `/auth/callback`

## Notes techniques
- Dépendance : story 1.1 (User doit exister)
- Le `code_verifier` ne doit jamais quitter la mémoire Angular — ne pas le stocker en `localStorage` ou `sessionStorage`
- La page de login HTML servie par le backend peut être minimaliste (juste email/password + hidden inputs PKCE) puisque l'UX principale est gérée par Angular
- Ajouter `GET /auth/me` (scope `app`) pour permettre à `AuthGuard` de vérifier l'état de session sans exposer le token
