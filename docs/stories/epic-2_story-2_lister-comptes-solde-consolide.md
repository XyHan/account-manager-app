# Story 2.2 — Lister les comptes et solde consolidé

**Epic :** Gestion des comptes bancaires
**Statut :** Terminé

## Description
En tant qu'utilisateur, je veux lister mes comptes avec leur solde actuel et voir le solde total consolidé afin d'avoir une vue globale de mon patrimoine.

## Critères d'acceptation
- [x] L'endpoint GET `/bank-accounts` retourne tous les comptes de l'utilisateur avec leur solde
- [x] La réponse inclut le solde total consolidé (somme de tous les comptes)
- [x] Un utilisateur ne voit que ses propres comptes
- [x] La liste est triée par date de création (plus récent en premier)
- [x] La page affiche chaque compte avec son nom, banque, type et solde
- [x] Le solde total consolidé est affiché en en-tête
- [x] Un état "vide" est affiché si l'utilisateur n'a pas encore de compte

## Tâches techniques

### Backend
- [x] Créer `IBankAccountFinder` avec `findAll(criteria: Criteria): Promise<BankAccountCollection>` et `consolidatedBalance(criteria: Criteria): Promise<number>`
- [x] Créer `BankAccountCollection extends Collection<BankAccountReadModel>` (domaine — read model)
- [x] Créer le critère `WithUserId` pour le module bank-account
- [x] Créer `ListBankAccountsQuery` (primitives : userId)
- [x] Créer `ListBankAccountsQueryHandler` (appelle le Finder)
- [x] Créer `GetConsolidatedBalanceQuery` (primitives : userId)
- [x] Créer `GetConsolidatedBalanceQueryHandler`
- [x] Implémenter `BankAccountFinder` (TypeORM)
- [x] Créer `BankAccountListView` (accounts: object[], consolidatedBalance: number)
- [x] Créer `BankAccountController.findAll()` → GET `/bank-accounts`

### Frontend
- [x] Afficher la liste des comptes dans `BankAccountListComponent`
- [x] Afficher le solde consolidé en en-tête de page
- [x] Créer `BankAccountService.findAll()` → GET `/bank-accounts`
- [x] Gérer l'état de chargement (spinner)
- [x] Afficher le composant "aucun compte" avec CTA "Ajouter un compte"

## Notes techniques
- Dépendance : story 2.1 (BankAccount créé)
- Le solde consolidé peut inclure les comptes d'épargne selon la préférence utilisateur — pour l'instant, tous les comptes sont inclus
