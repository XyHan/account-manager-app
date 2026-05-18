# Story 6.2 — Interface IOAuthService dans `auth/domain/`

**Epic :** Clean Architecture — Correction des violations de dépendance
**Statut :** À faire

## Description

En tant que développeur, je veux que `AuthController` et `OAuthGuard` n'importent aucune classe concrète d'infrastructure OAuth, afin que la couche présentation du module `auth` soit indépendante de son infrastructure.

## Critères d'acceptation

- [ ] `auth/domain/models/OAuthModels.ts` existe et exporte `ClientData`, `TokenData`, `TokenResult`
- [ ] `auth/domain/services/IOAuthService.ts` existe et exporte `IOAuthService` + `OAUTH_SERVICE`
- [ ] `OAuthService` déclare `implements IOAuthService`
- [ ] `validateCredentials` retourne `Promise<{ id: string; role: RoleEnum } | null>` (plus de `UserOrmEntity` dans le type de retour)
- [ ] `auth.module.ts` fournit `{ provide: OAUTH_SERVICE, useClass: OAuthService }` et ne contient plus `OAuthService` dans `exports`
- [ ] `AuthController` et `OAuthGuard` n'importent plus aucune classe depuis `auth/infrastructure/`
- [ ] `depcruise` et `eslint-plugin-boundaries` passent sans violation
- [ ] Les tests unitaires et E2E existants passent

## Tâches techniques

### Backend

- [ ] Créer `auth/domain/models/OAuthModels.ts` — interfaces `ClientData`, `TokenData`, `TokenResult` (reprises depuis `OAuthService.ts`, en adaptant `validateCredentials` pour retourner `{ id: string; role: RoleEnum }`)
- [ ] Créer `auth/domain/services/IOAuthService.ts` — interface complète + `export const OAUTH_SERVICE = Symbol('OAUTH_SERVICE')`
  ```typescript
  export interface IOAuthService {
    getClient(clientId: string): Promise<ClientData | null>;
    validateCredentials(email: string, password: string): Promise<{ id: string; role: RoleEnum } | null>;
    generateAuthorizationCode(userId: string, clientId: string, redirectUri: string, scope: string, codeChallenge: string, codeChallengeMethod: string): Promise<string>;
    exchangeCodeForToken(code: string, codeVerifier: string, clientId: string, redirectUri: string, ip: string): Promise<TokenResult>;
    refreshAccessToken(refreshToken: string, ip: string): Promise<TokenResult>;
    revokeToken(accessToken: string): Promise<void>;
    validateAccessToken(accessToken: string): Promise<TokenData | null>;
  }
  ```
- [ ] `auth/infrastructure/oauth/OAuthService.ts` :
  - Importer `IOAuthService` et `OAuthModels` depuis le domaine
  - Déclarer `implements IOAuthService`
  - `validateCredentials` : adapter le return en `{ id: user.id, role: user.role }` au lieu de `UserOrmEntity`
  - Retirer les exports d'interfaces `ClientData`, `TokenData`, `TokenResult` (elles vivent désormais dans le domaine)
- [ ] `auth/auth.module.ts` :
  - Ajouter `{ provide: OAUTH_SERVICE, useClass: OAuthService }` dans `providers`
  - Retirer `OAuthService` de `exports` (seuls `OAuthGuard`, `ScopesGuard`, `RolesGuard` restent exportés)
- [ ] `auth/presentation/controllers/AuthController.ts` :
  - Remplacer l'import de `OAuthService` par `IOAuthService` + `OAUTH_SERVICE`
  - Injecter `@Inject(OAUTH_SERVICE) private readonly oauthService: IOAuthService`
- [ ] `auth/presentation/guards/OAuthGuard.ts` :
  - Remplacer l'import de `OAuthService` par `IOAuthService` + `OAUTH_SERVICE`
  - Injecter `@Inject(OAUTH_SERVICE) private readonly oauthService: IOAuthService`

## Notes techniques

- `validateCredentials` dans `OAuthService` utilise `UserOrmEntity` en interne — seul le type de retour change. La requête TypeORM reste identique, on mappe juste `{ id: user.id, role: user.role }` avant de retourner.
- `ITokenRevoker` coexiste avec `IOAuthService` : `OAuthService implements IOAuthService` et la déclaration `{ provide: TOKEN_REVOKER, useClass: OAuthService }` reste inchangée.
- Dépendance de la story 6.1 : aucune — les deux stories sont indépendantes et peuvent être implémentées en parallèle.
- Vérifier `OAuthGuard.spec.ts` : le mock de `OAuthService` devra être remplacé par un mock de `IOAuthService`.
