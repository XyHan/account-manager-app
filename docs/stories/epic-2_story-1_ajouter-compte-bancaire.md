# Story 2.1 — Ajouter un compte bancaire

**Epic :** Gestion des comptes bancaires
**Statut :** À faire

## Description
En tant qu'utilisateur, je veux ajouter un compte bancaire (nom, banque, type) afin de l'inclure dans mon suivi budgétaire.

## Critères d'acceptation
- [ ] L'endpoint POST `/bank-accounts` crée un compte avec : nom (obligatoire), banque (obligatoire), type (CHECKING / SAVINGS / OTHER)
- [ ] Le compte est lié à l'utilisateur authentifié
- [ ] Le solde initial est à 0.00
- [ ] La commande `CreateBankAccountCommand` est persistée
- [ ] L'événement `BankAccountCreated` est dispatché et persisté
- [ ] L'endpoint retourne 201 avec la vue du compte créé
- [ ] Un bouton "Ajouter un compte" ouvre un formulaire/modal sur la page `/bank-accounts`
- [ ] Les champs nom, banque et type sont requis avec validation affichée

## Tâches techniques

### Backend
- [ ] Créer le Value Object `BankAccountId` (UUID, factory `generate()`)
- [ ] Créer le Value Object `BankName` (non null, non vide)
- [ ] Créer le Value Object `AccountType` (enum CHECKING/SAVINGS/OTHER)
- [ ] Créer le Value Object `Balance` (decimal, factory `zero()`)
- [ ] Créer l'entité de domaine `BankAccount` avec factory `create()`
- [ ] Créer le domain event `BankAccountCreated`
- [ ] Créer `IBankAccountRepository` avec `save()` et `findById()`
- [ ] Créer `CreateBankAccountCommand` (primitives : userId, name, bank, type)
- [ ] Créer `CreateBankAccountCommandHandler`
- [ ] Créer `BankAccountOrmEntity` avec migration
- [ ] Implémenter `BankAccountRepository`
- [ ] Créer `BankAccountView` (id, name, bank, type, balance)
- [ ] Créer `CreateBankAccountDto` avec validation class-validator
- [ ] Créer `BankAccountController.create()` → POST `/bank-accounts` (scope `app`, rôle USER)

### Frontend
- [ ] Créer la page `/bank-accounts` avec `BankAccountListComponent`
- [ ] Créer `BankAccountFormComponent` (formulaire réactif dans un dialog Angular Material)
- [ ] Créer `BankAccountService.create()` → POST `/bank-accounts`
- [ ] Créer l'interface TypeScript `BankAccountModel` (miroir de `BankAccountView`)
- [ ] Afficher un message de succès et rafraîchir la liste après création

## Notes techniques
- Dépendance : stories 1.1 et 1.2 (auth en place)
- Le type `OTHER` couvre les comptes non standards (PEA, compte-titres, etc.)
