# Story 5.2 — Répartition des dépenses par catégorie

**Epic :** Tableau de bord & statistiques
**Statut :** À faire

## Description
En tant qu'utilisateur, je veux voir les dépenses regroupées par catégorie avec montant et pourcentage afin d'identifier mes principaux postes de dépenses.

## Critères d'acceptation
- [ ] L'endpoint GET `/statistics/by-category` retourne la liste des catégories avec, pour chacune :
  - Nom de la catégorie (ou "Non catégorisé" si null)
  - Montant total dépensé (valeur absolue des transactions négatives)
  - Pourcentage du total des dépenses
- [ ] Les résultats sont triés par montant décroissant
- [ ] Les paramètres de filtre acceptés : `startDate`, `endDate`, `bankAccountId` (optionnels)
- [ ] La vue affiche un graphique en donut ou en barres horizontales
- [ ] Un tableau sous le graphique liste les catégories avec montant et pourcentage

## Tâches techniques

### Backend
- [ ] Créer `GetSpendingByCategoryQuery` (primitives : userId, startDate, endDate, bankAccountId nullable)
- [ ] Créer `GetSpendingByCategoryQueryHandler`
- [ ] Créer les critères `WithDateRange`, `WithBankAccountId` pour statistics
- [ ] Implémenter `StatisticsFinder.getSpendingByCategory()` (GROUP BY categoryId avec JOIN sur Category pour le nom)
- [ ] Créer `CategoryShareView` (categoryId nullable, categoryName, amount, percentage)
- [ ] Créer `SpendingByCategoryView` (items: CategoryShareView[], totalExpenses: number)
- [ ] Créer `StatisticsController.getSpendingByCategory()` → GET `/statistics/by-category`
- [ ] Créer `StatisticsFiltersDto` (startDate, endDate, bankAccountId — tous optionnels)

### Frontend
- [ ] Créer `SpendingByCategoryComponent` (standalone)
- [ ] Intégrer un graphique donut avec `ngx-charts` ou `Chart.js`
- [ ] Créer `StatisticsService.getSpendingByCategory()` → GET `/statistics/by-category`
- [ ] Afficher le tableau récapitulatif sous le graphique
- [ ] Ajouter des filtres (sélecteur de période, sélecteur de compte) — déclenche un rechargement
- [ ] Intégrer ce composant dans la page dashboard ou créer une page dédiée `/statistics`

## Notes techniques
- Dépendance : story 5.1 (StatisticsFinder et Controller créés), stories 4.x (catégories)
- Les transactions sans catégorie sont groupées sous "Non catégorisé" (categoryId IS NULL)
- Le calcul du pourcentage se fait côté backend pour éviter les artefacts d'arrondi côté client
