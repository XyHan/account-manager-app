# Story 4.1 — CRUD catégories personnalisées

**Epic :** Catégorisation des transactions
**Statut :** À faire

## Description
En tant qu'utilisateur, je veux créer, modifier et supprimer des catégories personnalisées afin d'adapter la classification à mes habitudes de dépenses.

## Critères d'acceptation
- [ ] L'endpoint POST `/categories` crée une catégorie (nom obligatoire, couleur optionnelle)
- [ ] L'endpoint PATCH `/categories/:id` modifie le nom et/ou la couleur
- [ ] L'endpoint DELETE `/categories/:id` supprime la catégorie (les transactions liées passent à `categoryId: null`)
- [ ] L'endpoint GET `/categories` retourne toutes les catégories de l'utilisateur
- [ ] Un utilisateur ne peut opérer que sur ses propres catégories (403 sinon)
- [ ] Les commandes et événements correspondants sont persistés
- [ ] Une page `/categories` liste les catégories avec leur couleur
- [ ] Un formulaire permet de créer et modifier une catégorie (nom + color picker)
- [ ] Une confirmation est demandée avant suppression

## Tâches techniques

### Backend
- [ ] Créer le Value Object `CategoryId` (UUID)
- [ ] Créer le Value Object `CategoryName` (non null, longueur 1-50)
- [ ] Créer le Value Object `CategoryColor` (hex color, ex: #FF5733, nullable)
- [ ] Créer l'entité de domaine `Category` avec factory `create()`
- [ ] Créer les domain events `CategoryCreated`, `CategoryUpdated`, `CategoryDeleted`
- [ ] Créer `ICategoryRepository` (save, findById, delete)
- [ ] Créer `ICategoryFinder` (findAll avec Criteria)
- [ ] Créer `CategoryCollection extends Collection<CategoryView>`
- [ ] Créer les commandes `CreateCategoryCommand`, `UpdateCategoryCommand`, `DeleteCategoryCommand` + Handlers
- [ ] Créer `ListCategoriesQuery` + Handler
- [ ] Créer `CategoryOrmEntity` avec migration
- [ ] Implémenter `CategoryRepository` et `CategoryFinder`
- [ ] Créer `CategoryView` (id, name, color, isDefault)
- [ ] Créer `CategoryListView` (categories: CategoryView[])
- [ ] Créer les DTOs `CreateCategoryDto`, `UpdateCategoryDto`
- [ ] Créer `CategoryController` avec les 4 endpoints

### Frontend
- [ ] Créer la page `/categories` avec `CategoryListComponent`
- [ ] Créer `CategoryFormComponent` (dialog Angular Material, formulaire réactif)
- [ ] Ajouter un color picker (Angular Material ou composant simple HTML input[type=color])
- [ ] Créer `CategoryService` (findAll, create, update, delete)
- [ ] Créer l'interface TypeScript `CategoryModel`
- [ ] Gérer l'état vide et les états de chargement/erreur

## Notes techniques
- Dépendance : stories 1.x (auth)
- `isDefault` est réservé pour les catégories système prédéfinies (phase future) — les catégories créées par l'utilisateur ont toujours `isDefault: false`
- La suppression d'une catégorie met `categoryId = null` sur les transactions (FK nullable avec SET NULL)
