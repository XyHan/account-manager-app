# Story 1.3 — Refresh du token

**Epic :** Authentification & gestion du compte utilisateur
**Statut :** À faire

## Description
En tant qu'utilisateur, je veux que mon access token soit renouvelé automatiquement afin de ne pas être déconnecté de façon inopinée lors de l'utilisation de l'application.

## Critères d'acceptation
- [ ] POST `/auth/token` avec `grant_type=refresh_token` renouvelle les tokens (le refresh token est lu depuis le cookie `X-Refresh-Token`)
- [ ] En cas de succès, de nouveaux cookies `X-Access-Token` et `X-Refresh-Token` sont posés (rotation du refresh token)
- [ ] L'ancien refresh token est invalidé immédiatement après rotation
- [ ] Un refresh token invalide, expiré ou déjà utilisé retourne 401
- [ ] Côté Angular, une requête qui retourne 401 déclenche automatiquement une tentative de refresh silencieux
- [ ] Si le refresh échoue, l'utilisateur est redirigé vers `/login` (qui relance le flow Authorization Code + PKCE)
- [ ] Si le refresh réussit, la requête originale est rejouée automatiquement

## Tâches techniques

### Backend
- [ ] Implémenter `OAuthService.getRefreshToken()` et `OAuthService.revokeToken()` (requis par oauth2-server)
- [ ] Implémenter la rotation dans `OAuthService.saveToken()` : invalider l'ancien refresh token avant d'émettre le nouveau
- [ ] Le POST `/auth/token` existant gère déjà `grant_type=refresh_token` via `@node-oauth/oauth2-server`

### Frontend
- [ ] Modifier `ErrorInterceptor` pour intercepter les 401
- [ ] Sur 401, appeler POST `/auth/token` avec `{ grant_type: 'refresh_token' }` (withCredentials: true — le cookie est envoyé automatiquement)
- [ ] Si refresh réussi : rejouer la requête originale via `request.clone()`
- [ ] Si refresh échoué (401 sur le refresh lui-même) : rediriger vers `/login` pour relancer le flow PKCE
- [ ] Éviter les boucles infinies : ne pas intercepter les 401 de l'endpoint `/auth/token` lui-même
- [ ] Gérer la concurrence : si plusieurs requêtes échouent simultanément avec 401, ne lancer qu'un seul refresh (utiliser un `BehaviorSubject` avec flag `isRefreshing`)

## Notes techniques
- Dépendance : story 1.2 (OAuth2 + cookies configurés)
- La rotation du refresh token est obligatoire (RFC 6749 + bonne pratique OAuth 2.1) — un refresh token utilisé une fois ne peut pas être réutilisé
- Si un refresh token volé est utilisé après rotation, l'original devient invalide → détecter une tentative de réutilisation doit révoquer tous les tokens de la session (détection de vol)
