# Story 4.2 — Catégorisation automatique à l'import

**Epic :** Catégorisation des transactions
**Statut :** À faire

## Description
En tant qu'utilisateur, je veux que mes transactions soient catégorisées automatiquement à l'import afin de gagner du temps sur la classification.

## Critères d'acceptation
- [ ] À chaque import, les transactions sont automatiquement catégorisées si un `CategoryRule` correspond au libellé
- [ ] La correspondance est insensible à la casse et basée sur une inclusion de sous-chaîne (ex: "carrefour" dans "PAIEMENT CB CARREFOUR CITY")
- [ ] Si plusieurs règles correspondent, la plus spécifique (pattern le plus long) est appliquée
- [ ] Si aucune règle ne correspond, la transaction est importée avec `categoryId: null`
- [ ] Le service de catégorisation est un service de domaine distinct, appelé par `ImportTransactionsCommandHandler`

## Tâches techniques

### Backend
- [ ] Créer le Value Object `LabelPattern` (non null, longueur min 2)
- [ ] Créer l'entité de domaine `CategoryRule` (id, userId, labelPattern, categoryId)
- [ ] Créer `ICategoryRuleRepository` (save, delete, findById)
- [ ] Créer `ICategoryRuleFinder` (findAll avec Criteria)
- [ ] Créer `CategoryRuleOrmEntity` avec migration
- [ ] Implémenter `CategoryRuleRepository` et `CategoryRuleFinder`
- [ ] Créer le service de domaine `AutoCategorizationService` :
  - Reçoit une `CategoryRuleCollection` et un libellé déchiffré
  - Retourne le `CategoryId` correspondant ou `null`
  - Sélectionne la règle avec le pattern le plus long en cas de multiple correspondances
- [ ] Intégrer `AutoCategorizationService` dans `ImportTransactionsCommandHandler` (appelé après déchiffrement du libellé, avant sauvegarde)
- [ ] Charger les règles de l'utilisateur une seule fois par import (pas de requête par transaction)

### Frontend
- [ ] Aucune modification UI pour cette story (la catégorisation est transparente à l'import)
- [ ] La catégorie apparaît dans la liste des transactions (story 5.4)

## Notes techniques
- Dépendance : story 3.1 (import), story 4.1 (catégories), story 4.3 (les règles sont créées par la correction manuelle)
- Le déchiffrement du libellé doit se faire en mémoire uniquement pour la catégorisation — le libellé déchiffré ne doit pas être loggé
- `AutoCategorizationService` est un service de domaine pur (pas d'injection de repository) — il reçoit les données dont il a besoin en paramètre
