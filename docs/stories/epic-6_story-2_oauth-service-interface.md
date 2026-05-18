# Story 6.2 — Interface IOAuthService dans `auth/domain/`

**Epic :** Clean Architecture — Correction des violations de dépendance
**Statut :** Terminé

## Description

En tant que développeur, je veux que `AuthController` et `OAuthGuard` n'importent aucune classe concrète d'infrastructure OAuth, afin que la couche présentation du module `auth` soit indépendante de son infrastructure.

## Critères d'acceptation

- [x] `auth/domain/models/OAuthModels.ts` existe et exporte `ClientData`, `TokenData`, `TokenResult`
- [x] `auth/domain/services/IOAuthService.ts` existe et exporte `IOAuthService` + `OAUTH_SERVICE`
- [x] `OAuthService` déclare `implements IOAuthService`
- [x] `validateCredentials` retourne `Promise<{ id: string; role: RoleEnum } | null>` (plus de `UserOrmEntity` dans le type de retour)
- [x] `auth.module.ts` fournit `{ provide: OAUTH_SERVICE, useExisting: OAuthService }` et ne contient plus `OAuthService` dans `exports`
- [x] `AuthController` et `OAuthGuard` n'importent plus aucune classe depuis `auth/infrastructure/`
- [x] `depcruise` et `eslint-plugin-boundaries` passent sans violation
- [x] Les tests unitaires et E2E existants passent

## Tâches techniques

### Backend

- [x] Créer `auth/domain/models/OAuthModels.ts` — interfaces `ClientData`, `TokenData`, `TokenResult` (reprises depuis `OAuthService.ts`, en adaptant `validateCredentials` pour retourner `{ id: string; role: RoleEnum }`)
- [x] Créer `auth/domain/services/IOAuthService.ts` — interface complète + `export const OAUTH_SERVICE = Symbol('OAUTH_SERVICE')`
- [x] `auth/infrastructure/oauth/OAuthService.ts` :
  - Importer `IOAuthService` et `OAuthModels` depuis le domaine
  - Déclarer `implements IOAuthService, ITokenRevoker`
  - `validateCredentials` : adapter le return en `{ id: user.id, role: user.role }` au lieu de `UserOrmEntity`
  - Retirer les exports d'interfaces `ClientData`, `TokenData`, `TokenResult` (elles vivent désormais dans le domaine)
- [x] `auth/auth.module.ts` :
  - Ajouter `{ provide: OAUTH_SERVICE, useExisting: OAuthService }` dans `providers` (single-instance via alias)
  - `TOKEN_REVOKER` migré en `useExisting` également (cohérence)
  - Retirer `OAuthService` de `exports` (seuls `OAuthGuard`, `ScopesGuard`, `RolesGuard` restent exportés)
- [x] `auth/presentation/controllers/AuthController.ts` :
  - Remplacer l'import de `OAuthService` par `IOAuthService` + `OAUTH_SERVICE`
  - Injecter `@Inject(OAUTH_SERVICE) private readonly oauthService: IOAuthService`
- [x] `auth/presentation/guards/OAuthGuard.ts` :
  - Remplacer l'import de `OAuthService` par `IOAuthService` + `OAUTH_SERVICE`
  - Injecter `@Inject(OAUTH_SERVICE) private readonly oauthService: IOAuthService`

## Notes techniques

- `validateCredentials` dans `OAuthService` utilise `UserOrmEntity` en interne — seul le type de retour change. La requête TypeORM reste identique, on mappe juste `{ id: user.id, role: user.role }` avant de retourner.
- `ITokenRevoker` coexiste avec `IOAuthService` : `OAuthService implements IOAuthService` et la déclaration `{ provide: TOKEN_REVOKER, useClass: OAuthService }` reste inchangée.
- Dépendance de la story 6.1 : aucune — les deux stories sont indépendantes et peuvent être implémentées en parallèle.
- Vérifier `OAuthGuard.spec.ts` : le mock de `OAuthService` devra être remplacé par un mock de `IOAuthService`.
