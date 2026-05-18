# Story 6.1 — Interfaces ICommandBus / IQueryBus dans `_shared/domain/`

**Epic :** Clean Architecture — Correction des violations de dépendance
**Statut :** Terminé

## Description

En tant que développeur, je veux que les controllers n'importent aucune classe concrète d'infrastructure pour accéder au bus de commandes et de requêtes, afin que la règle de dépendance de la Clean Architecture soit respectée dans tous les modules.

## Critères d'acceptation

- [x] `_shared/domain/bus/ICommandBus.ts` existe et exporte `ICommandBus` + `COMMAND_BUS`
- [x] `_shared/domain/bus/IQueryBus.ts` existe et exporte `IQueryBus` + `QUERY_BUS`
- [x] `_shared/domain/bus/ICommand.ts` et `IQuery.ts` existent (interfaces markers)
- [x] `CommandInterface` (infra) étend `ICommand` — `QueryInterface` étend `IQuery`
- [x] `CommandBus` déclare `implements ICommandBus`, `QueryBus` déclare `implements IQueryBus`
- [x] `MessageBusModule` fournit et exporte les tokens `COMMAND_BUS` et `QUERY_BUS`
- [x] `AuthController`, `BankAccountController`, `ImportController` n'importent plus aucune classe depuis `_shared/infrastructure/message-bus`
- [x] `depcruise` et `eslint-plugin-boundaries` passent sans violation
- [x] Les tests unitaires et E2E existants passent

## Tâches techniques

### Backend

- [x] Créer `_shared/domain/bus/ICommand.ts` — interface marker vide
- [x] Créer `_shared/domain/bus/IQuery.ts` — interface marker vide
- [x] Créer `_shared/domain/bus/ICommandBus.ts` — interface `execute(command: ICommand): Observable<unknown>` + `export const COMMAND_BUS = Symbol('COMMAND_BUS')`
- [x] Créer `_shared/domain/bus/IQueryBus.ts` — interface `execute(query: IQuery): Observable<unknown>` + `export const QUERY_BUS = Symbol('QUERY_BUS')`
- [x] `_shared/infrastructure/message-bus/command/command.interface.ts` : `CommandInterface extends ICommand`
- [x] `_shared/infrastructure/message-bus/query/query.interface.ts` : `QueryInterface extends IQuery`
- [x] `_shared/infrastructure/message-bus/bridge/bus/command.bus.ts` : `CommandBus implements ICommandBus`
- [x] `_shared/infrastructure/message-bus/bridge/bus/query.bus.ts` : `QueryBus implements IQueryBus`
- [x] `_shared/infrastructure/message-bus/bridge/message-bus.module.ts` : ajouter `{ provide: COMMAND_BUS, useExisting: CommandBus }` et `{ provide: QUERY_BUS, useExisting: QueryBus }` dans `providers` et `exports`
- [x] `auth/presentation/controllers/AuthController.ts` : remplacer les imports et injections par `@Inject(COMMAND_BUS) commandBus: ICommandBus` et `@Inject(QUERY_BUS) queryBus: IQueryBus`
- [x] `bank-account/presentation/controllers/BankAccountController.ts` : idem
- [x] `import/presentation/controllers/ImportController.ts` : idem

## Notes techniques

- `rxjs` est déjà une dépendance transitive du domaine via les handlers existants — son usage dans `ICommandBus`/`IQueryBus` est acceptable.
- `useExisting` (et non `useClass`) dans le module : `CommandBus` est déjà fourni comme provider ; on ajoute seulement un alias sur le token symbolique.
- Les classes `CommandBus`/`QueryBus` restent des providers NestJS normaux — seul leur token d'injection change du côté de la présentation.
- Ne pas supprimer l'export des classes concrètes `CommandBus`/`QueryBus` du module tant que d'autres providers internes (middlewares) les injectent directement — vérifier avant de retirer.
