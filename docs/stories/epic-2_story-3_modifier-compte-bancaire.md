# Story 2.3 — Modifier un compte bancaire

**Epic :** Gestion des comptes bancaires
**Statut :** À faire

## Description
En tant qu'utilisateur, je veux modifier les informations d'un compte bancaire afin de maintenir ma liste à jour.

## Critères d'acceptation
- [ ] L'endpoint PATCH `/bank-accounts/:id` permet de modifier le nom, la banque et le type
- [ ] Un utilisateur ne peut modifier que ses propres comptes (403 sinon)
- [ ] Un compte inexistant retourne 404
- [ ] La commande `UpdateBankAccountCommand` est persistée
- [ ] L'événement `BankAccountUpdated` est dispatché et persisté
- [ ] L'endpoint retourne la vue du compte mis à jour
- [ ] Un bouton "Modifier" est accessible sur chaque ligne de la liste des comptes
- [ ] Le formulaire est pré-rempli avec les valeurs actuelles

## Tâches techniques

### Backend
- [ ] Créer `UpdateBankAccountCommand` (primitives : userId, bankAccountId, name, bank, type)
- [ ] Créer `UpdateBankAccountCommandHandler` (vérifie ownership, met à jour l'entité)
- [ ] Ajouter méthode `update()` sur l'entité `BankAccount`
- [ ] Créer le domain event `BankAccountUpdated`
- [ ] Créer `UpdateBankAccountDto` avec validation (tous les champs optionnels)
- [ ] Créer `BankAccountController.update()` → PATCH `/bank-accounts/:id`

### Frontend
- [ ] Réutiliser `BankAccountFormComponent` en mode édition (pré-remplissage)
- [ ] Créer `BankAccountService.update()` → PATCH `/bank-accounts/:id`
- [ ] Afficher un message de succès et rafraîchir la liste après modification

## Notes techniques
- Dépendance : story 2.1 (BankAccount créé), story 2.2 (liste affichée)
- Le solde n'est pas modifiable manuellement — il est calculé depuis les transactions
