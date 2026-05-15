# Story 5.1 — Tableau de bord

**Epic :** Tableau de bord & statistiques
**Statut :** À faire

## Description
En tant qu'utilisateur, je veux voir un tableau de bord avec le solde total, les revenus et dépenses du mois en cours afin d'avoir une vue immédiate de ma situation financière.

## Critères d'acceptation
- [ ] L'endpoint GET `/statistics/dashboard` retourne :
  - Solde total consolidé de tous les comptes
  - Total des revenus du mois en cours (transactions positives)
  - Total des dépenses du mois en cours (transactions négatives, en valeur absolue)
  - Solde du mois (revenus - dépenses)
- [ ] Les données sont filtrées par l'utilisateur authentifié
- [ ] La page `/dashboard` est la page d'accueil après connexion
- [ ] Les 4 indicateurs sont affichés en cartes (KPI cards)
- [ ] Un état de chargement est affiché pendant le fetch

## Tâches techniques

### Backend
- [ ] Créer le Value Object `Period` (startDate, endDate, factory `currentMonth()`)
- [ ] Créer `IStatisticsFinder` avec `getDashboard(criteria: Criteria): Promise<DashboardData>`
- [ ] Créer le critère `WithPeriod` pour le module statistics
- [ ] Créer `GetDashboardQuery` (primitives : userId, year, month)
- [ ] Créer `GetDashboardQueryHandler`
- [ ] Implémenter `StatisticsFinder.getDashboard()` (requêtes SQL d'agrégation sur TransactionOrmEntity)
- [ ] Créer `DashboardView` (consolidatedBalance, monthlyIncome, monthlyExpenses, monthlyBalance)
- [ ] Créer `StatisticsController.getDashboard()` → GET `/statistics/dashboard`

### Frontend
- [ ] Créer la page `/dashboard` avec `DashboardComponent` (standalone)
- [ ] Créer 4 `KpiCardComponent` (label, valeur, couleur selon positif/négatif)
- [ ] Créer `StatisticsService.getDashboard()` → GET `/statistics/dashboard`
- [ ] Créer l'interface TypeScript `DashboardModel`
- [ ] Définir `/dashboard` comme route par défaut après authentification
- [ ] Gérer l'état de chargement (skeleton cards)

## Notes techniques
- Dépendance : stories 2.x (comptes), 3.x (transactions importées)
- Le solde consolidé est lu depuis `BankAccount.balance` (pas recalculé) pour la performance
- Les revenus/dépenses du mois sont calculés par requête SQL d'agrégation (`SUM WHERE date BETWEEN`)
