# Story 1.4 — Déconnexion

**Epic :** Authentification & gestion du compte utilisateur
**Statut :** Terminé

## Description
En tant qu'utilisateur, je veux me déconnecter afin de sécuriser mon accès depuis un appareil partagé.

## Critères d'acceptation
- [x] L'endpoint POST `/auth/logout` révoque le token actif en base
- [x] Les cookies `X-Access-Token` et `X-Refresh-Token` sont effacés (Set-Cookie avec expiration passée)
- [x] L'endpoint retourne 204
- [x] Après déconnexion, toute tentative d'accès à une route protégée redirige vers `/login`
- [x] Un bouton "Déconnexion" est présent dans la navigation de l'application

## Tâches techniques

### Backend
- [x] Implémenter `OAuthService.revokeToken()` — marque le token comme révoqué en base
- [x] Créer `AuthController.logout()` → POST `/auth/logout` (scope `app`, rôle USER)
- [x] Effacer les cookies dans la réponse (maxAge: 0 ou expires dans le passé)

### Frontend
- [x] Ajouter le bouton "Déconnexion" dans le composant de navigation
- [x] Appeler POST `/auth/logout` puis rediriger vers `/login`
- [x] Nettoyer tout état local lié à l'utilisateur (store, service state)

## Notes techniques
- Dépendance : story 1.2 (OAuth2 configuré)
- La révocation côté serveur est essentielle — effacer le cookie côté client sans révoquer le token ne suffit pas si le token a été volé
