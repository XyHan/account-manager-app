# Story 2.3 — Modifier un compte bancaire

**Epic :** Gestion des comptes bancaires
**Statut :** Terminé

## Description
En tant qu'utilisateur, je veux modifier les informations d'un compte bancaire afin de maintenir ma liste à jour.

## Critères d'acceptation
- [x] L'endpoint PATCH `/bank-accounts/:id` permet de modifier le nom, la banque et le type
- [x] Un utilisateur ne peut modifier que ses propres comptes (403 sinon)
- [x] Un compte inexistant retourne 404
- [x] La commande `UpdateBankAccountCommand` est persistée
- [x] L'événement `BankAccountUpdated` est dispatché et persisté
- [x] L'endpoint retourne la vue du compte mis à jour
- [x] Un bouton "Modifier" est accessible sur chaque ligne de la liste des comptes
- [x] Le formulaire est pré-rempli avec les valeurs actuelles

## Tâches techniques

### Backend
- [x] Créer `UpdateBankAccountCommand` (primitives : userId, bankAccountId, name, bank, type)
- [x] Créer `UpdateBankAccountCommandHandler` (vérifie ownership, met à jour l'entité)
- [x] Ajouter méthode `update()` sur l'entité `BankAccount`
- [x] Créer le domain event `BankAccountUpdated`
- [x] Créer `UpdateBankAccountDto` avec validation (tous les champs optionnels)
- [x] Créer `BankAccountController.update()` → PATCH `/bank-accounts/:id`

### Frontend
- [x] Réutiliser `BankAccountFormComponent` en mode édition (pré-remplissage)
- [x] Créer `BankAccountService.update()` → PATCH `/bank-accounts/:id`
- [x] Afficher un message de succès et rafraîchir la liste après modification

## Notes techniques
- Dépendance : story 2.1 (BankAccount créé), story 2.2 (liste affichée)
- Le solde n'est pas modifiable manuellement — il est calculé depuis les transactions
