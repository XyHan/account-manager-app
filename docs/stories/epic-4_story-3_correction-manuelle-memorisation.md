# Story 4.3 — Correction manuelle et mémorisation des règles

**Epic :** Catégorisation des transactions
**Statut :** À faire

## Description
En tant qu'utilisateur, je veux corriger manuellement la catégorie d'une transaction et que cette correction soit mémorisée afin que les prochains imports appliquent automatiquement la même règle.

## Critères d'acceptation
- [ ] L'endpoint PATCH `/transactions/:id/category` met à jour la catégorie d'une transaction
- [ ] Après la mise à jour, une `CategoryRule` est créée automatiquement (labelPattern = libellé de la transaction, categoryId = nouvelle catégorie)
- [ ] Si une règle avec le même pattern existe déjà pour cet utilisateur, elle est mise à jour (pas de doublon de règle)
- [ ] Un utilisateur ne peut modifier que ses propres transactions (403 sinon)
- [ ] La commande `UpdateTransactionCategoryCommand` est persistée
- [ ] L'événement `TransactionCategoryUpdated` est dispatché et persisté
- [ ] L'événement `CategoryRuleCreated` est dispatché lors de la création d'une règle
- [ ] Dans la liste des transactions, chaque transaction a un sélecteur de catégorie
- [ ] La correction est appliquée immédiatement sans rechargement de page

## Tâches techniques

### Backend
- [ ] Créer `TransactionId` Value Object (UUID)
- [ ] Créer l'entité de domaine `Transaction` (si non créée en story 3.1)
- [ ] Créer `UpdateTransactionCategoryCommand` (primitives : userId, transactionId, categoryId)
- [ ] Créer `UpdateTransactionCategoryCommandHandler` :
  - Vérifie ownership de la transaction
  - Met à jour `categoryId` sur la transaction
  - Appelle le service de mémorisation : cherche ou crée un `CategoryRule` pour ce libellé (déchiffré)
- [ ] Créer `CreateCategoryRuleCommand` + Handler (appelé par le handler précédent via le bus)
- [ ] Créer les domain events `TransactionCategoryUpdated`, `CategoryRuleCreated`
- [ ] Créer `UpdateTransactionCategoryDto` (categoryId nullable — null = retirer la catégorie)
- [ ] Créer `TransactionController.updateCategory()` → PATCH `/transactions/:id/category`

### Frontend
- [ ] Dans `TransactionListComponent`, ajouter un sélecteur de catégorie sur chaque ligne (mat-select Angular Material)
- [ ] Créer `TransactionService.updateCategory()` → PATCH `/transactions/:id/category`
- [ ] Mettre à jour la catégorie dans la liste localement après succès (pas de rechargement complet)
- [ ] Afficher l'option "Aucune catégorie" pour retirer la catégorie

## Notes techniques
- Dépendance : story 4.1 (catégories), story 4.2 (CategoryRule en place), story 5.4 (liste des transactions)
- Le libellé de la transaction doit être déchiffré côté serveur pour créer le labelPattern de la règle — ne jamais envoyer le libellé en clair au frontend pour cette opération
- Si `categoryId: null` est envoyé, on supprime la catégorie sans créer de règle
