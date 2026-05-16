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

---

## Revue QA — Refactoring CQRS/MessageBus

### Résumé

Le refactoring remplace `CommandDispatcher`/`QueryDispatcher`/`EventLogSubscriber` par des vrais middlewares NestJS injectables (`CommandLogMiddleware`, `EventLogMiddleware`) enregistrés dans `MessageBusModule.registerMiddlewares()`. L'architecture est désormais cohérente.

### ✅ Critères d'acceptation — inchangés (story 1.4)

Tous les critères restent satisfaits ; le refactoring ne touche pas le comportement fonctionnel.

### ✅ Points positifs

- `MessageBusModule` accepte désormais `Type<MiddlewareInterface>[]` + `imports` — les middlewares DI-dépendants sont possibles
- `AuthController` injecte directement `CommandBus`/`QueryBus` — suppression de la couche dispatcher intermédiaire
- **Correction de bug silencieux** : l'ancien `EventLogSubscriber` était branché sur une instance `EventBus` différente de celle de `AuthModule` → les événements n'étaient jamais loggés. Ce bug est corrigé.
- `AppModule` épuré : plus de `MessageBusModule.registerMiddlewares({})` orphelin, plus de `TypeOrmModule.forFeature([EventLogOrmEntity])` orphelin

### ⚠️ Point d'architecture

`CommandLogMiddleware` ne logue qu'en statut `PENDING`. Le suivi SUCCESS/FAILURE de l'ancien `CommandDispatcher` est perdu, car les middlewares s'exécutent avant le handler et ne peuvent pas observer son résultat. Les valeurs `SUCCESS` et `FAILURE` du `CommandLogStatus` enum sont pour l'instant inutilisées. Accepté par conception : ajouter des post-hooks au `MessageBus` est un futur chantier distinct.

### Tests écrits

- `CommandLogMiddleware.spec.ts` — 5 cas : statut PENDING, userId null, sanitisation password/newPassword/currentPassword, suppression des champs internes message-bus
- `EventLogMiddleware.spec.ts` — 4 cas : nom de l'événement, commandLogId null, payload sauvegardé, appel unique
