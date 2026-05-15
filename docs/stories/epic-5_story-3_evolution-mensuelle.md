# Story 5.3 — Évolution mensuelle sur 12 mois

**Epic :** Tableau de bord & statistiques
**Statut :** À faire

## Description
En tant qu'utilisateur, je veux voir l'évolution de mes dépenses et revenus mois par mois sur les 12 derniers mois afin d'identifier des tendances dans mon budget.

## Critères d'acceptation
- [ ] L'endpoint GET `/statistics/monthly` retourne, pour chacun des 12 derniers mois :
  - Le mois (format YYYY-MM)
  - Total des revenus
  - Total des dépenses (valeur absolue)
  - Solde du mois (revenus - dépenses)
- [ ] Les mois sans transaction apparaissent avec des valeurs à 0 (pas de trous dans la série)
- [ ] Les paramètres de filtre acceptés : `bankAccountId`, `categoryId` (optionnels)
- [ ] La vue affiche un graphique en barres groupées ou courbes par mois
- [ ] Les 12 mois sont affichés de gauche (le plus ancien) à droite (le plus récent)

## Tâches techniques

### Backend
- [ ] Créer `GetMonthlyEvolutionQuery` (primitives : userId, bankAccountId nullable, categoryId nullable)
- [ ] Créer `GetMonthlyEvolutionQueryHandler`
- [ ] Implémenter `StatisticsFinder.getMonthlyEvolution()` :
  - Génère la série des 12 derniers mois côté SQL (generate_series ou logique applicative)
  - LEFT JOIN pour inclure les mois sans transactions
- [ ] Créer `MonthlyAmountView` (month: string, income: number, expenses: number, balance: number)
- [ ] Créer `MonthlyEvolutionView` (months: MonthlyAmountView[])
- [ ] Créer `StatisticsController.getMonthlyEvolution()` → GET `/statistics/monthly`

### Frontend
- [ ] Créer `MonthlyEvolutionComponent` (standalone)
- [ ] Intégrer un graphique en barres groupées (revenus en vert, dépenses en rouge)
- [ ] Créer `StatisticsService.getMonthlyEvolution()` → GET `/statistics/monthly`
- [ ] Afficher les filtres optionnels (compte, catégorie)
- [ ] Intégrer dans la page `/statistics`

## Notes techniques
- Dépendance : story 5.1 (StatisticsFinder), story 5.2 (StatisticsFiltersDto)
- Utiliser `generate_series` PostgreSQL pour garantir les 12 mois même sans données : `generate_series(date_trunc('month', now()) - interval '11 months', date_trunc('month', now()), '1 month')`
