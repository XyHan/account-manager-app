# Story 2.2 — Lister les comptes et solde consolidé

**Epic :** Gestion des comptes bancaires
**Statut :** À faire

## Description
En tant qu'utilisateur, je veux lister mes comptes avec leur solde actuel et voir le solde total consolidé afin d'avoir une vue globale de mon patrimoine.

## Critères d'acceptation
- [ ] L'endpoint GET `/bank-accounts` retourne tous les comptes de l'utilisateur avec leur solde
- [ ] La réponse inclut le solde total consolidé (somme de tous les comptes)
- [ ] Un utilisateur ne voit que ses propres comptes
- [ ] La liste est triée par date de création (plus récent en premier)
- [ ] La page affiche chaque compte avec son nom, banque, type et solde
- [ ] Le solde total consolidé est affiché en en-tête
- [ ] Un état "vide" est affiché si l'utilisateur n'a pas encore de compte

## Tâches techniques

### Backend
- [ ] Créer `IBankAccountFinder` avec `findAll(criteria: Criteria): Promise<BankAccountCollection>` et `consolidatedBalance(criteria: Criteria): Promise<number>`
- [ ] Créer `BankAccountCollection extends Collection<BankAccountView>`
- [ ] Créer le critère `WithUserId` pour le module bank-account
- [ ] Créer `ListBankAccountsQuery` (primitives : userId)
- [ ] Créer `ListBankAccountsQueryHandler` (appelle le Finder)
- [ ] Créer `GetConsolidatedBalanceQuery` (primitives : userId)
- [ ] Créer `GetConsolidatedBalanceQueryHandler`
- [ ] Implémenter `BankAccountFinder` (TypeORM)
- [ ] Créer `BankAccountListView` (accounts: BankAccountView[], consolidatedBalance: number)
- [ ] Créer `BankAccountController.findAll()` → GET `/bank-accounts`

### Frontend
- [ ] Afficher la liste des comptes dans `BankAccountListComponent`
- [ ] Afficher le solde consolidé en en-tête de page
- [ ] Créer `BankAccountService.findAll()` → GET `/bank-accounts`
- [ ] Gérer l'état de chargement (skeleton ou spinner)
- [ ] Afficher le composant "aucun compte" avec CTA "Ajouter un compte"

## Notes techniques
- Dépendance : story 2.1 (BankAccount créé)
- Le solde consolidé peut inclure les comptes d'épargne selon la préférence utilisateur — pour l'instant, tous les comptes sont inclus
