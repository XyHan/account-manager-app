# Story 2.4 — Supprimer un compte bancaire

**Epic :** Gestion des comptes bancaires
**Statut :** Terminé

## Description
En tant qu'utilisateur, je veux supprimer un compte bancaire afin de retirer un compte que je n'utilise plus.

## Critères d'acceptation
- [x] L'endpoint DELETE `/bank-accounts/:id` supprime le compte et toutes ses transactions associées
- [x] Un utilisateur ne peut supprimer que ses propres comptes (403 sinon)
- [x] Un compte inexistant retourne 404
- [x] La commande `DeleteBankAccountCommand` est persistée
- [x] L'événement `BankAccountDeleted` est dispatché et persisté
- [x] L'endpoint retourne 204
- [x] Un bouton "Supprimer" est accessible sur chaque compte avec une confirmation explicite
- [x] La boîte de confirmation affiche le nom du compte et avertit de la suppression des transactions

## Tâches techniques

### Backend
- [x] Créer `DeleteBankAccountCommand` (primitives : userId, bankAccountId)
- [x] Créer `DeleteBankAccountCommandHandler` (vérifie ownership, supprime compte + transactions en cascade)
- [x] Créer le domain event `BankAccountDeleted`
- [ ] Configurer la suppression en cascade sur `TransactionOrmEntity` (FK bankAccountId avec ON DELETE CASCADE) — reporté à la story Transactions
- [x] Créer `BankAccountController.delete()` → DELETE `/bank-accounts/:id`

### Frontend
- [x] Ouvrir un dialog de confirmation Angular Material avant suppression
- [x] Afficher le nom du compte et l'avertissement sur les transactions dans le dialog
- [x] Créer `BankAccountService.delete()` → DELETE `/bank-accounts/:id`
- [x] Rafraîchir la liste et mettre à jour le solde consolidé après suppression

## Notes techniques
- Dépendance : story 2.1 (BankAccount créé)
- La suppression en cascade est intentionnelle : un compte sans transactions n'a pas de sens dans ce contexte
