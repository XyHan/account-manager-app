# Story 1.3 — Refresh du token

**Epic :** Authentification & gestion du compte utilisateur
**Statut :** Terminé

## Description
En tant qu'utilisateur, je veux que mon access token soit renouvelé automatiquement afin de ne pas être déconnecté de façon inopinée lors de l'utilisation de l'application.

## Critères d'acceptation
- [x] POST `/auth/token` avec `grant_type=refresh_token` renouvelle les tokens (le refresh token est lu depuis le cookie `X-Refresh-Token`)
- [x] En cas de succès, de nouveaux cookies `X-Access-Token` et `X-Refresh-Token` sont posés (rotation du refresh token)
- [x] L'ancien refresh token est invalidé immédiatement après rotation
- [x] Un refresh token invalide, expiré ou déjà utilisé retourne 401
- [x] Côté Angular, une requête qui retourne 401 déclenche automatiquement une tentative de refresh silencieux
- [x] Si le refresh échoue, l'utilisateur est redirigé vers `/login` (qui relance le flow Authorization Code + PKCE)
- [x] Si le refresh réussit, la requête originale est rejouée automatiquement

## Tâches techniques

### Backend
- [x] Implémenter `OAuthService.refreshAccessToken()` : validation, détection de vol, rotation, dispatch `UserLoggedIn`
- [x] `POST /auth/token` gère `grant_type=refresh_token` : lit le cookie `X-Refresh-Token`, appelle `refreshAccessToken`, pose les nouveaux cookies
- [x] `TokenDto` : champs `code`, `code_verifier`, `client_id`, `redirect_uri` rendus optionnels (optionnels pour le grant refresh_token)

### Frontend
- [x] `AuthService.refresh()` : POST `/auth/token` avec `grant_type=refresh_token`, gestion concurrence via `BehaviorSubject` + flag `isRefreshing`
- [x] Créer `errorInterceptor` : intercepte les 401, appelle `authService.refresh()`, rejoue la requête originale
- [x] Boucle infinie évitée : les 401 sur `/auth/token` ne sont pas interceptés
- [x] Redirect vers `/login` si le refresh échoue

## Notes techniques
- Dépendance : story 1.2 (OAuth2 + cookies configurés)
- La rotation du refresh token est obligatoire (RFC 6749 + bonne pratique OAuth 2.1) — un refresh token utilisé une fois ne peut pas être réutilisé
- Détection de vol : si un refresh token révoqué est réutilisé, **tous** les tokens actifs de l'utilisateur sont révoqués (`UPDATE ... WHERE userId = ? AND revoked = false`)
