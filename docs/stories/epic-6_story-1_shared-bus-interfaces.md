# Story 6.1 — Interfaces ICommandBus / IQueryBus dans `_shared/domain/`

**Epic :** Clean Architecture — Correction des violations de dépendance
**Statut :** À faire

## Description

En tant que développeur, je veux que les controllers n'importent aucune classe concrète d'infrastructure pour accéder au bus de commandes et de requêtes, afin que la règle de dépendance de la Clean Architecture soit respectée dans tous les modules.

## Critères d'acceptation

- [ ] `_shared/domain/bus/ICommandBus.ts` existe et exporte `ICommandBus` + `COMMAND_BUS`
- [ ] `_shared/domain/bus/IQueryBus.ts` existe et exporte `IQueryBus` + `QUERY_BUS`
- [ ] `_shared/domain/bus/ICommand.ts` et `IQuery.ts` existent (interfaces markers)
- [ ] `CommandInterface` (infra) étend `ICommand` — `QueryInterface` étend `IQuery`
- [ ] `CommandBus` déclare `implements ICommandBus`, `QueryBus` déclare `implements IQueryBus`
- [ ] `MessageBusModule` fournit et exporte les tokens `COMMAND_BUS` et `QUERY_BUS`
- [ ] `AuthController`, `BankAccountController`, `ImportController` n'importent plus aucune classe depuis `_shared/infrastructure/message-bus`
- [ ] `depcruise` et `eslint-plugin-boundaries` passent sans violation
- [ ] Les tests unitaires et E2E existants passent

## Tâches techniques

### Backend

- [ ] Créer `_shared/domain/bus/ICommand.ts` — interface marker vide
- [ ] Créer `_shared/domain/bus/IQuery.ts` — interface marker vide
- [ ] Créer `_shared/domain/bus/ICommandBus.ts` — interface `execute(command: ICommand): Observable<unknown>` + `export const COMMAND_BUS = Symbol('COMMAND_BUS')`
- [ ] Créer `_shared/domain/bus/IQueryBus.ts` — interface `execute(query: IQuery): Observable<unknown>` + `export const QUERY_BUS = Symbol('QUERY_BUS')`
- [ ] `_shared/infrastructure/message-bus/command/command.interface.ts` : `CommandInterface extends ICommand`
- [ ] `_shared/infrastructure/message-bus/query/query.interface.ts` : `QueryInterface extends IQuery`
- [ ] `_shared/infrastructure/message-bus/bridge/bus/command.bus.ts` : `CommandBus implements ICommandBus`
- [ ] `_shared/infrastructure/message-bus/bridge/bus/query.bus.ts` : `QueryBus implements IQueryBus`
- [ ] `_shared/infrastructure/message-bus/bridge/message-bus.module.ts` : ajouter `{ provide: COMMAND_BUS, useExisting: CommandBus }` et `{ provide: QUERY_BUS, useExisting: QueryBus }` dans `providers` et `exports`
- [ ] `auth/presentation/controllers/AuthController.ts` : remplacer les imports et injections par `@Inject(COMMAND_BUS) commandBus: ICommandBus` et `@Inject(QUERY_BUS) queryBus: IQueryBus`
- [ ] `bank-account/presentation/controllers/BankAccountController.ts` : idem
- [ ] `import/presentation/controllers/ImportController.ts` : idem

## Notes techniques

- `rxjs` est déjà une dépendance transitive du domaine via les handlers existants — son usage dans `ICommandBus`/`IQueryBus` est acceptable.
- `useExisting` (et non `useClass`) dans le module : `CommandBus` est déjà fourni comme provider ; on ajoute seulement un alias sur le token symbolique.
- Les classes `CommandBus`/`QueryBus` restent des providers NestJS normaux — seul leur token d'injection change du côté de la présentation.
- Ne pas supprimer l'export des classes concrètes `CommandBus`/`QueryBus` du module tant que d'autres providers internes (middlewares) les injectent directement — vérifier avant de retirer.
