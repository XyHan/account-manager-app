# Story 5.4 — Liste des transactions avec filtres

**Epic :** Tableau de bord & statistiques
**Statut :** À faire

## Description
En tant qu'utilisateur, je veux voir la liste de mes transactions avec des filtres et une recherche afin de retrouver rapidement une opération spécifique.

## Critères d'acceptation
- [ ] L'endpoint GET `/transactions` retourne les transactions de l'utilisateur, paginées (page, limit)
- [ ] Les libellés sont déchiffrés avant d'être retournés dans la réponse
- [ ] Les filtres disponibles : `bankAccountId`, `categoryId`, `startDate`, `endDate`, `minAmount`, `maxAmount`
- [ ] La recherche textuelle sur le libellé (insensible à la casse) est supportée
- [ ] Les résultats sont triés par date décroissante par défaut
- [ ] La réponse inclut le total de résultats pour la pagination
- [ ] La page `/transactions` affiche la liste avec pagination
- [ ] Les filtres sont affichés dans un panneau latéral ou en en-tête
- [ ] La catégorie de chaque transaction est affichable et modifiable (lien avec story 4.3)

## Tâches techniques

### Backend
- [ ] Créer `ITransactionFinder` avec `findAll(criteria: Criteria): Promise<TransactionCollection>` et `count(criteria: Criteria): Promise<number>`
- [ ] Créer `TransactionCollection extends Collection<TransactionView>`
- [ ] Créer les critères : `WithUserId`, `WithBankAccountId`, `WithCategoryId`, `WithDateRange`, `WithAmountRange`, `WithLabelSearch`, `WithPagination`
- [ ] Créer `ListTransactionsQuery` (primitives : userId, bankAccountId, categoryId, startDate, endDate, minAmount, maxAmount, search, page, limit)
- [ ] Créer `ListTransactionsQueryHandler` (appelle Finder, déchiffre les libellés)
- [ ] Implémenter `TransactionFinder` (TypeORM avec requête dynamique selon les critères)
- [ ] Créer `TransactionView` (id, date, amount, label (déchiffré), categoryId, categoryName, bankAccountId, bankAccountName)
- [ ] Créer `TransactionListView` (transactions: TransactionView[], total: number, page: number, limit: number)
- [ ] Créer `ListTransactionsDto` avec validation (tous les paramètres optionnels)
- [ ] Créer `TransactionController.findAll()` → GET `/transactions`

### Frontend
- [ ] Créer la page `/transactions` avec `TransactionListComponent`
- [ ] Créer un tableau Angular Material avec colonnes : date, libellé, montant, catégorie, compte
- [ ] Implémenter la pagination côté serveur (`mat-paginator`)
- [ ] Créer `TransactionFiltersComponent` (formulaire réactif avec tous les filtres)
- [ ] Créer `TransactionService.findAll()` → GET `/transactions`
- [ ] Créer l'interface TypeScript `TransactionModel`
- [ ] Afficher les montants en rouge (dépenses) et vert (revenus)
- [ ] Intégrer le sélecteur de catégorie inline (story 4.3)

## Notes techniques
- Dépendance : story 3.1 (transactions importées), story 4.1 (catégories)
- La recherche textuelle sur libellé nécessite un déchiffrement de toutes les transactions avant filtre — envisager une pagination stricte et un index sur le hash pour des performances acceptables. En phase 1 (volumes modestes), une approche applicative est acceptable.
- Limite par défaut : 50 transactions par page
