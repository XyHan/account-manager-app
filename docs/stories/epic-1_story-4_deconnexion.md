# Story 1.4 — Déconnexion

**Epic :** Authentification & gestion du compte utilisateur
**Statut :** À faire

## Description
En tant qu'utilisateur, je veux me déconnecter afin de sécuriser mon accès depuis un appareil partagé.

## Critères d'acceptation
- [ ] L'endpoint POST `/auth/logout` révoque le token actif en base
- [ ] Les cookies `X-Access-Token` et `X-Refresh-Token` sont effacés (Set-Cookie avec expiration passée)
- [ ] L'endpoint retourne 204
- [ ] Après déconnexion, toute tentative d'accès à une route protégée redirige vers `/login`
- [ ] Un bouton "Déconnexion" est présent dans la navigation de l'application

## Tâches techniques

### Backend
- [ ] Implémenter `OAuthService.revokeToken()` — marque le token comme révoqué en base
- [ ] Créer `AuthController.logout()` → POST `/auth/logout` (scope `app`, rôle USER)
- [ ] Effacer les cookies dans la réponse (maxAge: 0 ou expires dans le passé)

### Frontend
- [ ] Ajouter le bouton "Déconnexion" dans le composant de navigation
- [ ] Appeler POST `/auth/logout` puis rediriger vers `/login`
- [ ] Nettoyer tout état local lié à l'utilisateur (store, service state)

## Notes techniques
- Dépendance : story 1.2 (OAuth2 configuré)
- La révocation côté serveur est essentielle — effacer le cookie côté client sans révoquer le token ne suffit pas si le token a été volé
