# Story 2.4 — Supprimer un compte bancaire

**Epic :** Gestion des comptes bancaires
**Statut :** À faire

## Description
En tant qu'utilisateur, je veux supprimer un compte bancaire afin de retirer un compte que je n'utilise plus.

## Critères d'acceptation
- [ ] L'endpoint DELETE `/bank-accounts/:id` supprime le compte et toutes ses transactions associées
- [ ] Un utilisateur ne peut supprimer que ses propres comptes (403 sinon)
- [ ] Un compte inexistant retourne 404
- [ ] La commande `DeleteBankAccountCommand` est persistée
- [ ] L'événement `BankAccountDeleted` est dispatché et persisté
- [ ] L'endpoint retourne 204
- [ ] Un bouton "Supprimer" est accessible sur chaque compte avec une confirmation explicite
- [ ] La boîte de confirmation affiche le nom du compte et avertit de la suppression des transactions

## Tâches techniques

### Backend
- [ ] Créer `DeleteBankAccountCommand` (primitives : userId, bankAccountId)
- [ ] Créer `DeleteBankAccountCommandHandler` (vérifie ownership, supprime compte + transactions en cascade)
- [ ] Créer le domain event `BankAccountDeleted`
- [ ] Configurer la suppression en cascade sur `TransactionOrmEntity` (FK bankAccountId avec ON DELETE CASCADE)
- [ ] Créer `BankAccountController.delete()` → DELETE `/bank-accounts/:id`

### Frontend
- [ ] Ouvrir un dialog de confirmation Angular Material avant suppression
- [ ] Afficher le nom du compte et l'avertissement sur les transactions dans le dialog
- [ ] Créer `BankAccountService.delete()` → DELETE `/bank-accounts/:id`
- [ ] Rafraîchir la liste et mettre à jour le solde consolidé après suppression

## Notes techniques
- Dépendance : story 2.1 (BankAccount créé)
- La suppression en cascade est intentionnelle : un compte sans transactions n'a pas de sens dans ce contexte
