# Story 1.1 — Inscription

**Epic :** Authentification & gestion du compte utilisateur
**Statut :** Terminé

## Description
En tant qu'utilisateur, je veux m'inscrire avec un email et un mot de passe afin d'accéder à mon espace personnel.

## Critères d'acceptation
- [x] Un utilisateur peut s'inscrire avec un email valide et un mot de passe d'au moins 8 caractères
- [x] L'email est unique — une tentative avec un email déjà utilisé retourne une erreur 409
- [x] Le mot de passe est hashé avec bcrypt avant stockage (jamais en clair)
- [x] Le rôle `USER` est attribué par défaut
- [x] Un événement `UserRegistered` est dispatché et persisté après succès
- [x] La commande `RegisterUserCommand` est persistée en base (succès et échec)
- [x] L'endpoint retourne 201 avec la vue utilisateur (sans mot de passe)
- [x] Un formulaire d'inscription est accessible sur la page `/register`
- [x] Les erreurs de validation sont affichées sous chaque champ

## Tâches techniques

### Backend
- [x] Créer le Value Object `Email` (validation format, factory `from()`)
- [x] Créer le Value Object `HashedPassword` (bcryptjs, factory `fromPlain()`)
- [x] Créer le Value Object `Role` (enum USER/ADMIN)
- [x] Créer l'entité de domaine `User` avec factory `create()`
- [x] Créer l'interface `IUserRepository` avec méthode `save()` et `findById()`
- [x] Créer `RegisterUserCommand` (primitives : email, password)
- [x] Créer `RegisterUserCommandHandler` (vérifie unicité email, crée User, sauvegarde)
- [x] Créer `UserOrmEntity` (TypeORM) avec migration
- [x] Implémenter `UserRepository`
- [x] Créer `UserFinder` avec critère `WithEmail`
- [x] Créer `UserView` (id, email, role, createdAt)
- [x] Créer `RegisterDto` avec validation class-validator
- [x] Créer `AuthController.register()` → POST `/auth/register`
- [x] Créer `CommandDispatcher` et `EventLogSubscriber` (Shared Kernel)
- [x] Créer les ORM entities `CommandLog` et `EventLog` avec migrations
- [x] Brancher `EventLogSubscriber` sur `EventBus.subject$`

### Frontend
- [x] Créer la page `/register` avec `RegisterComponent` (standalone)
- [x] Créer le formulaire réactif (email, password, confirmPassword)
- [x] Ajouter la validation côté client (format email, longueur password, correspondance)
- [x] Appel HTTP POST `/auth/register` inline dans le composant
- [x] Afficher les erreurs API sous les champs concernés
- [x] Rediriger vers `/login` après inscription réussie

## Notes techniques
- Dépendance : cette story pose les fondations CQRS (CommandLog, EventLog, middlewares) utilisées par toutes les stories suivantes — à implémenter en premier
- Le `RegisterDto` n'inclut pas de `confirmPassword` côté backend (validation frontend uniquement)
- L'email est stocké en clair dans `UserOrmEntity` (c'est le login, pas une donnée sensible à chiffrer)
- L'appel HTTP est fait directement dans `RegisterComponent` (pas de `AuthService` séparé à ce stade — sera extrait lors de la story 1.2)
