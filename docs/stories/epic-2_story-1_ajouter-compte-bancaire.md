# Story 2.1 — Ajouter un compte bancaire

**Epic :** Gestion des comptes bancaires
**Statut :** Terminé

## Description
En tant qu'utilisateur, je veux ajouter un compte bancaire (nom, banque, type) afin de l'inclure dans mon suivi budgétaire.

## Critères d'acceptation
- [x] L'endpoint POST `/bank-accounts` crée un compte avec : nom (obligatoire), banque (obligatoire), type (CHECKING / SAVINGS / OTHER)
- [x] Le compte est lié à l'utilisateur authentifié
- [x] Le solde initial est à 0.00
- [x] La commande `CreateBankAccountCommand` est persistée
- [x] L'événement `BankAccountCreated` est dispatché et persisté
- [x] L'endpoint retourne 201 avec la vue du compte créé
- [x] Un bouton "Ajouter un compte" ouvre un formulaire/modal sur la page `/bank-accounts`
- [x] Les champs nom, banque et type sont requis avec validation affichée

## Tâches techniques

### Backend
- [x] Créer le Value Object `BankAccountId` (UUID, factory `generate()`)
- [x] Créer le Value Object `BankName` (non null, non vide)
- [x] Créer le Value Object `AccountType` (enum CHECKING/SAVINGS/OTHER)
- [x] Créer le Value Object `Balance` (decimal, factory `zero()`)
- [x] Créer l'entité de domaine `BankAccount` avec factory `create()`
- [x] Créer le domain event `BankAccountCreated`
- [x] Créer `IBankAccountRepository` avec `save()` et `findById()`
- [x] Créer `CreateBankAccountCommand` (primitives : userId, name, bank, type)
- [x] Créer `CreateBankAccountCommandHandler`
- [x] Créer `BankAccountOrmEntity` avec migration
- [x] Implémenter `BankAccountRepository`
- [x] Créer `BankAccountView` (id, name, bank, type, balance)
- [x] Créer `CreateBankAccountDto` avec validation class-validator
- [x] Créer `BankAccountController.create()` → POST `/bank-accounts` (scope `app`, rôle USER)

### Frontend
- [x] Créer la page `/bank-accounts` avec `BankAccountListComponent`
- [x] Créer `BankAccountFormComponent` (formulaire réactif dans un dialog Angular Material)
- [x] Créer `BankAccountService.create()` → POST `/bank-accounts`
- [x] Créer l'interface TypeScript `BankAccountModel` (miroir de `BankAccountView`)
- [x] Afficher un message de succès et rafraîchir la liste après création

## Notes techniques
- Dépendance : stories 1.1 et 1.2 (auth en place)
- Le type `OTHER` couvre les comptes non standards (PEA, compte-titres, etc.)
