# RULES — Account Manager

Ces règles s'appliquent à tous les agents BMAD et à tout changement de code.

## Règles générales

1. **TypeScript strict** — Pas de `any`, pas de `as unknown`, types explicites partout
2. **Pas de secrets dans le code** — Variables d'environnement uniquement (`.env`, jamais committé)
3. **Un module = une responsabilité** — Pas de modules fourre-tout
4. **Pas de code mort** — Supprimer le code inutilisé, pas de commentaires TODO sans ticket

## Backend (NestJS)

5. **Validation obligatoire** — Tout DTO entrant doit utiliser `class-validator`
6. **Guards sur toutes les routes** — Aucune route authentifiée sans `@UseGuards(JwtAuthGuard)`
7. **Exceptions NestJS** — Utiliser `NotFoundException`, `UnauthorizedException`, etc. — pas de `throw new Error()`
8. **Migrations TypeORM** — Toute modification de schéma passe par une migration, jamais `synchronize: true` en production
9. **Pas de logique dans les controllers** — Les controllers ne font qu'appeler les services

## Frontend (Angular)

10. **Reactive Forms** — Pas de template-driven forms pour les formulaires avec validation
11. **Typed HttpClient** — Pas de `HttpClient.get<any>()`, toujours typer la réponse
12. **Gestion d'erreur systématique** — Tout appel HTTP doit avoir un `catchError`
13. **Pas de logique dans les templates** — Déporter dans le composant

## Qualité

14. **Tests obligatoires** — Tout service (back et front) doit avoir au minimum un test unitaire
15. **Pas de merge sans critères d'acceptation cochés** — La story doit être à jour

## Sécurité

16. **Pas de mots de passe en clair** — Toujours bcrypt
17. **CORS configuré explicitement** — Pas de `origin: '*'` en production
18. **Rate limiting** — Les endpoints d'auth doivent avoir un rate limiter