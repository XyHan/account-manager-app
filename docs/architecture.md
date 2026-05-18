# Architecture — Account Manager

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────┐
│                   Frontend Angular                   │
│  AuthGuard · JWT Interceptor · Error Interceptor    │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (cookies httpOnly)
┌──────────────────────▼──────────────────────────────┐
│              Backend NestJS (REST API)               │
│                                                      │
│  Presentation  →  Application  →  Domain             │
│  (Controllers)    (CQRS Bus)      (Entities/VOs)    │
│                        │                             │
│                Infrastructure                        │
│          (TypeORM · OAuth2 · Crypto)                │
└──────────────────────┬──────────────────────────────┘
                       │
              ┌────────▼────────┐
              │   PostgreSQL    │
              └─────────────────┘
```

## Structure du projet

```
backend/src/
  _shared/
    domain/
      collection/
        Collection.ts               # Abstract Collection<T>
      criteria/
        Criterion.ts                # Interface
        Criteria.ts                 # Collection de Criterion
      value-objects/
        UserId.ts
        Email.ts
        Money.ts                    # Montant typé (amount + sign)
        HashedPassword.ts
    infrastructure/
      cqrs/
        middleware/
          CommandLogMiddleware.ts
          EventLogMiddleware.ts
        orm-entities/
          CommandLog.orm-entity.ts
          EventLog.orm-entity.ts

  auth/
    domain/
      entities/User.ts
      value-objects/Password.ts · Role.ts · AccessToken.ts
      events/UserRegistered.ts · UserLoggedIn.ts · PasswordChanged.ts
      repositories/IUserRepository.ts
      finders/IUserFinder.ts
      criteria/WithEmail.ts · WithRole.ts · WithUserId.ts
    application/
      commands/
        register-user/RegisterUserCommand.ts + Handler
        change-password/ChangePasswordCommand.ts + Handler
      queries/
        get-user-by-email/GetUserByEmailQuery.ts + Handler
      event-handlers/OnUserRegistered.ts
    infrastructure/
      persistence/
        orm-entities/UserOrmEntity.ts
        repositories/UserRepository.ts
        finders/UserFinder.ts
      oauth/
        OAuthService.ts
        OAuthTokenRepository.ts
        orm-entities/OAuthTokenOrmEntity.ts · OAuthClientOrmEntity.ts
    presentation/
      controllers/AuthController.ts
      dto/RegisterDto.ts · LoginDto.ts · ChangePasswordDto.ts · RefreshTokenDto.ts
      view/TokenView.ts · UserView.ts

  bank-account/
    domain/
      entities/BankAccount.ts
      value-objects/BankAccountId.ts · BankName.ts · AccountType.ts · Balance.ts
      events/BankAccountCreated.ts · BankAccountUpdated.ts · BankAccountDeleted.ts
      repositories/IBankAccountRepository.ts
      finders/IBankAccountFinder.ts
      criteria/WithBankAccountId.ts · WithUserId.ts · WithAccountType.ts
    application/
      commands/
        create-bank-account/CreateBankAccountCommand.ts + Handler
        update-bank-account/UpdateBankAccountCommand.ts + Handler
        delete-bank-account/DeleteBankAccountCommand.ts + Handler
      queries/
        list-bank-accounts/ListBankAccountsQuery.ts + Handler
        get-consolidated-balance/GetConsolidatedBalanceQuery.ts + Handler
    infrastructure/
      persistence/
        orm-entities/BankAccountOrmEntity.ts
        repositories/BankAccountRepository.ts
        finders/BankAccountFinder.ts
    presentation/
      controllers/BankAccountController.ts
      dto/CreateBankAccountDto.ts · UpdateBankAccountDto.ts
      view/BankAccountView.ts · BankAccountListView.ts · ConsolidatedBalanceView.ts

  transaction/
    domain/
      entities/Transaction.ts
      value-objects/TransactionId.ts · TransactionLabel.ts · TransactionHash.ts
      events/TransactionCreated.ts · TransactionCategoryUpdated.ts
      repositories/ITransactionRepository.ts
      finders/ITransactionFinder.ts
      criteria/
        WithTransactionId.ts · WithUserId.ts · WithBankAccountId.ts
        WithCategoryId.ts · WithDateRange.ts · WithAmountRange.ts
    application/
      commands/
        create-transaction/CreateTransactionCommand.ts + Handler
        update-transaction-category/UpdateTransactionCategoryCommand.ts + Handler
      queries/
        list-transactions/ListTransactionsQuery.ts + Handler
    infrastructure/
      persistence/
        orm-entities/TransactionOrmEntity.ts
        repositories/TransactionRepository.ts
        finders/TransactionFinder.ts
      crypto/TransactionCryptoService.ts  # AES-256-GCM
    presentation/
      controllers/TransactionController.ts
      dto/UpdateTransactionCategoryDto.ts · ListTransactionsDto.ts
      view/TransactionView.ts · TransactionListView.ts

  category/
    domain/
      entities/Category.ts
      value-objects/CategoryId.ts · CategoryName.ts · CategoryColor.ts
      entities/CategoryRule.ts
      value-objects/LabelPattern.ts
      events/CategoryCreated.ts · CategoryUpdated.ts · CategoryDeleted.ts
      events/CategoryRuleCreated.ts
      repositories/ICategoryRepository.ts · ICategoryRuleRepository.ts
      finders/ICategoryFinder.ts · ICategoryRuleFinder.ts
      criteria/WithCategoryId.ts · WithUserId.ts · WithLabelPattern.ts
    application/
      commands/
        create-category/CreateCategoryCommand.ts + Handler
        update-category/UpdateCategoryCommand.ts + Handler
        delete-category/DeleteCategoryCommand.ts + Handler
        create-category-rule/CreateCategoryRuleCommand.ts + Handler
      queries/
        list-categories/ListCategoriesQuery.ts + Handler
        find-category-by-label/FindCategoryByLabelQuery.ts + Handler
    infrastructure/
      persistence/
        orm-entities/CategoryOrmEntity.ts · CategoryRuleOrmEntity.ts
        repositories/CategoryRepository.ts · CategoryRuleRepository.ts
        finders/CategoryFinder.ts · CategoryRuleFinder.ts
    presentation/
      controllers/CategoryController.ts
      dto/CreateCategoryDto.ts · UpdateCategoryDto.ts
      view/CategoryView.ts · CategoryListView.ts

  import/
    domain/
      entities/ImportLog.ts
      value-objects/ImportLogId.ts · ImportFormat.ts · ImportSummary.ts
      events/ImportCompleted.ts
      repositories/IImportLogRepository.ts
      finders/IImportLogFinder.ts
      services/
        CsvParserService.ts         # Port (interface)
        OfxParserService.ts         # Port (interface)
        DuplicateDetectorService.ts
    application/
      commands/
        import-transactions/ImportTransactionsCommand.ts + Handler
    infrastructure/
      persistence/
        orm-entities/ImportLogOrmEntity.ts
        repositories/ImportLogRepository.ts
        finders/ImportLogFinder.ts
      parsers/
        PapaparseCSVParser.ts       # Adapter de CsvParserService
        OfxJsParser.ts              # Adapter de OfxParserService
    presentation/
      controllers/ImportController.ts
      dto/ImportTransactionsDto.ts
      view/ImportResultView.ts

  statistics/
    domain/
      finders/IStatisticsFinder.ts
      criteria/
        WithUserId.ts · WithDateRange.ts · WithBankAccountId.ts · WithCategoryId.ts
      value-objects/Period.ts · CategoryShare.ts · MonthlyAmount.ts
    application/
      queries/
        get-dashboard/GetDashboardQuery.ts + Handler
        get-spending-by-category/GetSpendingByCategoryQuery.ts + Handler
        get-monthly-evolution/GetMonthlyEvolutionQuery.ts + Handler
    infrastructure/
      persistence/
        finders/StatisticsFinder.ts
    presentation/
      controllers/StatisticsController.ts
      dto/StatisticsFiltersDto.ts
      view/DashboardView.ts · SpendingByCategoryView.ts · MonthlyEvolutionView.ts

test/
  e2e/
    auth.e2e-spec.ts
    bank-accounts.e2e-spec.ts
    transactions.e2e-spec.ts
    categories.e2e-spec.ts
    import.e2e-spec.ts
    statistics.e2e-spec.ts
```

## Shared Kernel

### Abstract Collection

```typescript
abstract class Collection<T extends { serialize(): object }> {
  protected constructor(protected readonly items: T[]) {}
  count(): number { return this.items.length; }
  isEmpty(): boolean { return this.items.length === 0; }
  serialize(): object[] { return this.items.map(i => i.serialize()); }
}
```

Chaque module dérive sa propre collection :
`TransactionCollection`, `BankAccountCollection`, `CategoryCollection`, etc.

### Criteria / Criterion

```typescript
interface Criterion {
  getValue(): string | number | boolean | Record<string, string>;
}

class Criteria {
  static empty(): Criteria
  static fromArray(criteria: Criterion[]): Criteria
  getCriterion<T extends Criterion>(cls: new (...args: unknown[]) => T): T | false
  addCriterion(criterion: Criterion): Criteria
  toArray(): Criterion[]
}
```

Usage dans un Finder :
```typescript
const transactions = await this.transactionFinder.findAll(
  Criteria.fromArray([
    WithUserId.from(userId),
    WithDateRange.from(startDate, endDate),
    WithCategoryId.from(categoryId),
  ])
);
```

### Value Objects (Self-Validated Objects)

```typescript
class Email {
  private constructor(private readonly value: string) {}
  static from(value: string): Email {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) throw new InvalidEmailException(value);
    return new Email(value);
  }
  toString(): string { return this.value; }
  equals(other: Email): boolean { return this.value === other.value; }
}
```

Règles :
- Constructeur privé, factory statique `from()` ou `fromXxx()`
- Lève une exception de domaine si invalide
- Pas de string vide — utiliser `null` (`const label: string | null = null`)
- Utilisés dans toutes les méthodes publiques de domaine (hors primitives CQRS)

## Entités TypeORM (ORM Entities)

### `_shared`
| ORM Entity | Champs principaux |
|------------|------------------|
| `CommandLog` | id, name, payload (jsonb), userId, executedAt, status (SUCCESS/FAILURE), errorMessage |
| `EventLog` | id, name, payload (jsonb), commandId (FK), occurredAt |
| `OAuthClient` | id, clientId, clientSecret, grants (array), redirectUris (array) |
| `OAuthToken` | id, accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt, scope, userId (FK), clientId (FK) |
| `OAuthAuthorizationCode` | id, code (unique), codeChallenge, codeChallengeMethod, redirectUri, scope, expiresAt, userId (FK), clientId (FK) |

### `auth`
| ORM Entity | Champs principaux |
|------------|------------------|
| `UserOrmEntity` | id (uuid), email (varchar, unique), passwordHash (varchar), role (enum: USER/ADMIN), createdAt, updatedAt |

### `bank-account`
| ORM Entity | Champs principaux |
|------------|------------------|
| `BankAccountOrmEntity` | id (uuid), userId (FK), name (varchar), bank (varchar), type (enum: CHECKING/SAVINGS/OTHER), balance (decimal), createdAt, updatedAt |

### `transaction`
| ORM Entity | Champs principaux |
|------------|------------------|
| `TransactionOrmEntity` | id (uuid), userId (FK), bankAccountId (FK), date (date), amount (decimal), labelEncrypted (text), labelIv (varchar), categoryId (FK nullable), hash (varchar, unique par compte), importLogId (FK nullable), createdAt |

### `category`
| ORM Entity | Champs principaux |
|------------|------------------|
| `CategoryOrmEntity` | id (uuid), userId (FK), name (varchar), color (varchar), isDefault (boolean), createdAt, updatedAt |
| `CategoryRuleOrmEntity` | id (uuid), userId (FK), labelPattern (varchar), categoryId (FK), createdAt |

### `import`
| ORM Entity | Champs principaux |
|------------|------------------|
| `ImportLogOrmEntity` | id (uuid), userId (FK), bankAccountId (FK), filename (varchar), format (enum: CSV/OFX), addedCount (int), skippedCount (int), createdAt |

## Endpoints REST

| Méthode | Route | Scope | Rôle | Description |
|---------|-------|-------|------|-------------|
| POST | `/auth/register` | — | — | Inscription |
| GET | `/auth/authorize` | — | — | Page de login (initiation du flow PKCE) |
| POST | `/auth/authorize` | — | — | Soumission credentials → redirect avec code |
| POST | `/auth/token` | — | — | Échange code → cookies (Authorization Code + PKCE) |
| POST | `/auth/token` | — | — | Refresh token → nouveaux cookies |
| POST | `/auth/logout` | `app` | USER | Révocation du token |
| PATCH | `/auth/change-password` | `app` | USER | Changement de mot de passe |
| GET | `/bank-accounts` | `app` | USER | Liste des comptes + solde consolidé |
| POST | `/bank-accounts` | `app` | USER | Créer un compte |
| PATCH | `/bank-accounts/:id` | `app` | USER | Modifier un compte |
| DELETE | `/bank-accounts/:id` | `app` | USER | Supprimer un compte |
| GET | `/transactions` | `app` | USER | Liste filtrée des transactions |
| PATCH | `/transactions/:id/category` | `app` | USER | Recatégoriser une transaction |
| POST | `/import` | `app` | USER | Import CSV ou OFX |
| GET | `/categories` | `app` | USER | Liste des catégories |
| POST | `/categories` | `app` | USER | Créer une catégorie |
| PATCH | `/categories/:id` | `app` | USER | Modifier une catégorie |
| DELETE | `/categories/:id` | `app` | USER | Supprimer une catégorie |
| GET | `/statistics/dashboard` | `app` | USER | Solde, revenus/dépenses du mois |
| GET | `/statistics/by-category` | `app` | USER | Répartition par catégorie |
| GET | `/statistics/monthly` | `app` | USER | Évolution mensuelle 12 mois |

## Authentification & Autorisation

### OAuth2 — Flow Authorization Code + PKCE

```
1. Angular génère code_verifier (aléatoire 64 octets) + code_challenge (SHA-256 base64url)
   Stocke code_verifier en mémoire (pas localStorage)
   Génère state aléatoire anti-CSRF

2. Angular redirige vers :
   GET /auth/authorize
     ?response_type=code
     &client_id=app
     &code_challenge=<challenge>
     &code_challenge_method=S256
     &redirect_uri=https://app.example.com/auth/callback
     &state=<random>

3. Backend sert la page de login (HTML rendu par NestJS)
   Utilisateur soumet email + mot de passe

4. Backend valide les credentials, génère un authorization code (UUID, TTL 5min)
   Persiste : (code, code_challenge, redirect_uri, client_id, userId, expiresAt)
   Redirige vers : <redirect_uri>?code=<auth_code>&state=<même_state>

5. Angular callback vérifie state, extrait le code, appelle :
   POST /auth/token
     { grant_type: authorization_code, code, code_verifier, client_id, redirect_uri }

6. Backend valide :
   - code existe et non expiré
   - SHA-256(code_verifier) == code_challenge stocké
   - redirect_uri identique
   Pose les cookies et retourne 200 :
   ← Set-Cookie: X-Access-Token (httpOnly, secure, sameSite=strict, 15min)
   ← Set-Cookie: X-Refresh-Token (httpOnly, secure, 30 jours)

Refresh :
   POST /auth/token { grant_type: refresh_token }
   (cookie X-Refresh-Token envoyé automatiquement)
   ← nouveaux cookies (rotation du refresh token)
```

### Guard stack (ordre d'application)

```
OAuthGuard        → vérifie X-Access-Token (cookie)
  └─ ScopesGuard  → vérifie scope 'app' sur le token
       └─ RolesGuard → vérifie role USER ou ADMIN
```

### Décorateurs

```typescript
@UseGuards(OAuthGuard, ScopesGuard, RolesGuard)
@Scopes('app')
@Roles(Role.USER)
@Controller('bank-accounts')
export class BankAccountController {}
```

## CQRS — Conventions et flux

### Primitives dans les CQRS objects

```typescript
// ✅ Command/Query/Event — primitives uniquement
class CreateBankAccountCommand {
  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly bank: string,
    public readonly type: string,
  ) {}
}

// ✅ Handler — convertit primitives → Value Objects
class CreateBankAccountCommandHandler {
  async execute(command: CreateBankAccountCommand): Promise<void> {
    const account = BankAccount.create(
      BankAccountId.generate(),
      UserId.from(command.userId),
      BankName.from(command.name),
      AccountType.from(command.type),
    );
    await this.repository.save(account);
  }
}
```

### Middleware de persistence

```
CommandBus
  ├─ CommandLogMiddleware  → INSERT CommandLog (status: PENDING)
  ├─ Handler execution
  ├─ [succès] UPDATE CommandLog (status: SUCCESS)
  │          + EventBus.publish(domainEvents)
  │            └─ EventLogMiddleware → INSERT EventLog
  └─ [échec]  UPDATE CommandLog (status: FAILURE, errorMessage)
```

## Patterns de code

### Entité vs ORM Entity

- **Domain Entity** (`domain/entities/`) : logique métier, méthodes, Value Objects, domain events — aucune décoration TypeORM
- **ORM Entity** (`infrastructure/persistence/orm-entities/`) : mapping base de données — aucune logique métier

### Repository (write) vs Finder (read)

```typescript
// Repository — write side
interface IBankAccountRepository {
  save(account: BankAccount): Promise<void>;
  findById(id: BankAccountId): Promise<BankAccount | null>;
  delete(id: BankAccountId): Promise<void>;
}

// Finder — read side, retourne des modèles de lecture
interface IBankAccountFinder {
  findAll(criteria: Criteria): Promise<BankAccountCollection>;
  findOne(criteria: Criteria): Promise<BankAccountView | null>;
  count(criteria: Criteria): Promise<number>;
}
```

### Vue Objects

```typescript
class BankAccountView {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly bank: string,
    public readonly type: string,
    public readonly balance: number,
  ) {}

  static fromOrmEntity(entity: BankAccountOrmEntity): BankAccountView {
    return new BankAccountView(entity.id, entity.name, entity.bank, entity.type, Number(entity.balance));
  }

  serialize(): object { return { id: this.id, name: this.name, bank: this.bank, type: this.type, balance: this.balance }; }
}
```

### Null vs string vide

```typescript
// ❌
const label: string = '';
// ✅
const label: string | null = null;
```

## Frontend Angular

```
frontend/src/app/
  core/
    guards/auth.guard.ts
    interceptors/
      jwt.interceptor.ts          # Envoie les cookies (withCredentials)
      error.interceptor.ts        # Gestion globale des erreurs HTTP
    services/auth.service.ts
    models/                       # Interfaces TypeScript miroir des View Objects
  features/
    auth/                         # Pages login, register, change-password
    dashboard/                    # Page dashboard
    bank-accounts/                # Page comptes
    transactions/                 # Page transactions + filtres
    categories/                   # Page catégories
    import/                       # Page import
  shared/
    components/                   # Composants réutilisables
    pipes/
```

- Composants **standalone** (Angular 17+), change detection **OnPush**
- **Angular Material** pour les composants UI
- `withCredentials: true` sur tous les appels HTTP (envoi automatique des cookies)
- L'interceptor `jwt.interceptor.ts` intercepte les 401 et tente un refresh silencieux avant de rediriger vers login

## Outils qualité

| Outil | Config | Rôle |
|-------|--------|------|
| `eslint` + `@typescript-eslint` | `.eslintrc.js` | Linting TypeScript strict |
| `eslint-plugin-boundaries` | `.eslintrc.js` | Enforcement des règles inter-couches |
| `dependency-cruiser` | `.dependency-cruiser.js` | Validation graphe de dépendances |
| `prettier` | `.prettierrc` | Formatage uniforme |
| `jest` | `jest.config.ts` | Tests unitaires (TDD) |
| `supertest` | `test/e2e/` | Tests E2E des entrypoints |
| `husky` + `lint-staged` | `.husky/` | Pre-commit : lint + tests unitaires |

### Règles dependency-cruiser (exemples)

```
domain      → ne peut PAS importer application, infrastructure, presentation
application → ne peut PAS importer infrastructure, presentation
presentation → ne peut PAS importer infrastructure directement
infrastructure → ne peut PAS importer presentation
```

## Design System

### Thèmes

L'application propose deux thèmes commutables via une classe CSS sur `<body>` (`.theme-dark` / `.theme-light`), persistés dans `localStorage`.

#### Thème sombre (Dark Navy)

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-bg` | `#1a1b2e` | Fond principal |
| `--color-surface` | `#252641` | Cartes, panneaux |
| `--color-sidebar` | `#12132a` | Sidebar |
| `--color-primary` | `#6c63ff` | Accent principal, boutons CTA |
| `--color-primary-hover` | `#5a52e0` | Hover bouton primaire |
| `--color-income` | `#4ade80` | Revenus |
| `--color-expense` | `#f87171` | Dépenses |
| `--color-text` | `#e2e8f0` | Texte principal |
| `--color-text-muted` | `#94a3b8` | Texte secondaire |
| `--color-border` | `#2e3054` | Bordures |

#### Thème clair (Cream/Beige)

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-bg` | `#faf6f0` | Fond principal |
| `--color-surface` | `#ffffff` | Cartes, panneaux |
| `--color-sidebar` | `#f0ebe2` | Sidebar |
| `--color-primary` | `#7c5c3e` | Accent principal |
| `--color-primary-hover` | `#6b4e35` | Hover bouton primaire |
| `--color-income` | `#2d7a47` | Revenus |
| `--color-expense` | `#c0392b` | Dépenses |
| `--color-text` | `#3d3428` | Texte principal |
| `--color-text-muted` | `#8b7355` | Texte secondaire |
| `--color-border` | `#ddd5c8` | Bordures |

### Layout (AdminLTE moderne)

```
┌──────────────────────────────────────────────────────┐
│  Topbar  [☰ Logo]              [🔔] [👤 User] [🌙]  │
├────────────┬─────────────────────────────────────────┤
│            │                                          │
│  Sidebar   │           Main Content                   │
│  (240px)   │   ┌──────┐ ┌──────┐ ┌──────┐           │
│            │   │ Card │ │ Card │ │ Card │           │
│  Dashboard │   └──────┘ └──────┘ └──────┘           │
│  Comptes   │                                          │
│  Transactions│  ┌───────────────────────────────────┐│
│  Catégories│  │        Chart / Table               ││
│  Import    │  └───────────────────────────────────┘│
│            │                                          │
└────────────┴─────────────────────────────────────────┘
```

- Sidebar collapsible (icônes seules en mode compact, 64px)
- Topbar fixe avec toggle theme + notifications + menu utilisateur
- Content area scrollable

### Angular Material v3 — Configuration

- `@angular/material` v18+ avec theming M3
- Palette personnalisée générée via `mat.define-theme()` avec `mat.define-palette()`
- Les variables CSS des thèmes Material sont surchargées par les tokens du design system
- Composants utilisés : `MatToolbar`, `MatSidenav`, `MatCard`, `MatTable`, `MatPaginator`, `MatDialog`, `MatSnackBar`, `MatFormField`, `MatInput`, `MatButton`, `MatIcon`, `MatMenu`, `MatSelect`, `MatChip`, `MatProgressBar`

### Typographie

| Usage | Font | Taille | Poids |
|-------|------|--------|-------|
| Titres de page | Inter | 24px | 600 |
| Titres de carte | Inter | 16px | 600 |
| Corps | Inter | 14px | 400 |
| Légendes | Inter | 12px | 400 |
| Montants | Inter (tabular-nums) | 20px | 700 |

Police : **Inter** (Google Fonts), fallback `system-ui, sans-serif`.

---

## ADRs

### ADR-001 — Chiffrement AES-256-GCM des libellés de transaction
- **Statut :** Accepté
- **Contexte :** Les libellés de transaction sont des données sensibles devant être chiffrées au repos.
- **Décision :** Utiliser le module `crypto` natif Node.js avec AES-256-GCM. IV généré aléatoirement par transaction, stocké en colonne `labelIv`. Clé dans variable d'environnement `ENCRYPTION_KEY`.
- **Conséquences :** Déchiffrement systématique à la lecture. Perte de `ENCRYPTION_KEY` = perte des libellés.

### ADR-002 — OAuth2 Authorization Code + PKCE avec cookies httpOnly
- **Statut :** Accepté
- **Contexte :** Le grant ROPC (Resource Owner Password Credentials) est retiré d'OAuth 2.1 car il expose les credentials au client et ne supporte pas le MFA. Sécuriser les tokens contre le vol via XSS.
- **Décision :** Flow Authorization Code + PKCE (RFC 7636), même pour l'app first-party. Access token dans cookie `X-Access-Token` (httpOnly, secure, sameSite=strict, 15min). Refresh token dans `X-Refresh-Token` (httpOnly, secure, 30 jours). Librairie `@node-oauth/oauth2-server`.
- **Conséquences :** Pas d'accès JS au token. Le frontend doit envoyer `withCredentials: true`. Le flow est légèrement plus complexe que ROPC mais conforme OAuth 2.1 et extensible au MFA.

### ADR-003 — Scope OAuth2 `app` sur tous les endpoints frontend
- **Statut :** Accepté
- **Contexte :** Préparation au multi-clients sans rework de sécurité.
- **Décision :** Tous les endpoints utilisés par l'app Angular portent le scope `app`. Les futurs clients externes recevront des scopes dédiés plus granulaires.
- **Conséquences :** Toute ouverture d'endpoint à un client tiers nécessite un nouveau scope explicite.

### ADR-004 — CQRS avec @nestjs/cqrs et persistence des commandes/événements
- **Statut :** Accepté
- **Contexte :** Traçabilité complète des opérations métier et découplage lecture/écriture.
- **Décision :** `@nestjs/cqrs` avec `CommandLogMiddleware` et `EventLogMiddleware` branchés sur le bus. Chaque commande et chaque événement de domaine sont persistés en base.
- **Conséquences :** Overhead de persistence à chaque opération. Audit log natif.

### ADR-005 — Clean Architecture / DDD / Hexagonal par module
- **Statut :** Accepté
- **Contexte :** Maintenabilité long terme, testabilité, indépendance du domaine vis-à-vis de l'infrastructure.
- **Décision :** 4 couches par module : `domain` / `application` / `infrastructure` / `presentation`. Le domaine ne dépend de rien d'externe. L'infrastructure implémente les ports du domaine.
- **Conséquences :** Plus de fichiers, structure plus stricte. Compensé par dependency-cruiser qui enforce les règles automatiquement.

### ADR-006 — Collections TypeScript (pas de tableaux natifs exposés)
- **Statut :** Accepté
- **Contexte :** Encapsulation des listes d'objets métier avec comportements propres.
- **Décision :** Toute liste d'objets de domaine est encapsulée dans une classe `XxxCollection extends Collection<Xxx>`. Les tableaux natifs restent un détail d'implémentation interne.
- **Conséquences :** Légèrement plus verbeux, mais les collections peuvent porter de la logique métier (ex: `TransactionCollection.totalAmount()`).

### ADR-007 — Criteria/Criterion pour les Finders et Repositories
- **Statut :** Accepté
- **Contexte :** Éviter la prolifération de méthodes `findByXxx` dans les interfaces.
- **Décision :** Toutes les méthodes de Finder/Repository prennent un `Criteria` (collection de `Criterion`). Chaque module définit ses propres `Criterion` typés.
- **Conséquences :** Interface stable indépendamment des filtres ajoutés. Nécessite une convention de nommage rigoureuse des Criterion.

### ADR-008 — papaparse (CSV) + ofx-js (OFX)
- **Statut :** Accepté
- **Contexte :** Parsing robuste des formats d'export bancaire.
- **Décision :** `papaparse` pour CSV (gère les variations d'encodage et de séparateur), `ofx-js` pour OFX/QFX. Les parsers sont des adapters de ports définis dans le domaine.
- **Conséquences :** Remplacement d'un parser possible sans modifier le domaine.

### ADR-009 — Solde stocké, recalculé après chaque import
- **Statut :** Accepté
- **Contexte :** Éviter les requêtes d'agrégation à chaque affichage du solde.
- **Décision :** `BankAccount.balance` est mis à jour après chaque import (somme de toutes les transactions du compte). Pas de calcul à la volée sur le dashboard.
- **Conséquences :** Légère incohérence possible si une transaction est modifiée sans recalcul. Le recalcul est déclenché par l'événement `ImportCompleted`.

### ADR-010 — Rôles USER et ADMIN
- **Statut :** Accepté
- **Contexte :** Préparation au multi-utilisateurs avec administration.
- **Décision :** Enum `Role { USER, ADMIN }` sur l'entité `User`. Tout nouvel utilisateur reçoit `USER` par défaut. `RolesGuard` appliqué après `ScopesGuard`.
- **Conséquences :** Les routes ADMIN ne sont pas exposées en phase 1 mais la structure est prête.

### ADR-011 — Tokens d'injection symboliques pour les buses et services d'infrastructure
- **Statut :** Accepté
- **Contexte :** Audit Clean Architecture (2026-05-17) : `AuthController`, `BankAccountController` et `ImportController` importaient directement les classes `CommandBus`/`QueryBus` depuis `_shared/infrastructure/`. `AuthController` et `OAuthGuard` importaient directement `OAuthService` depuis `auth/infrastructure/`. Violation de la dependency rule : la présentation ne doit pas dépendre de l'infrastructure.
- **Décision :** (1) Créer `_shared/domain/bus/ICommandBus`, `IQueryBus`, `ICommand`, `IQuery` avec tokens symboliques `COMMAND_BUS`/`QUERY_BUS`. Les classes infra déclarent `implements ICommandBus`/`IQueryBus`. `MessageBusModule` expose les tokens via `useExisting`. (2) Créer `auth/domain/services/IOAuthService` avec token `OAUTH_SERVICE`. Les controllers et guards injectent via `@Inject(TOKEN) service: IInterface`.
- **Conséquences :** Présentation découplée de l'infrastructure. Les mocks de tests ciblent les interfaces. Aucune logique métier ni migration de base de données affectées.
