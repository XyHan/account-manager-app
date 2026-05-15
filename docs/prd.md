# PRD — Account Manager

## Vision
Permettre à un utilisateur de suivre et analyser ses revenus et dépenses sur l'ensemble de ses comptes bancaires afin de mieux gérer son budget au quotidien.

## Objectifs
- Centraliser les transactions de plusieurs comptes et plusieurs banques en un seul endroit
- Donner une vision claire et immédiate de la santé financière globale
- Identifier les postes de dépenses les plus importants via la catégorisation
- Visualiser les tendances de dépenses sur le temps (mensuel, annuel)

## Utilisateurs

| Persona | Rôle | Besoin principal |
|---------|------|-----------------|
| Utilisateur solo | Propriétaire unique de l'app (phase 1) | Suivre et comprendre ses finances personnelles |
| Utilisateur inscrit | Futur utilisateur tiers (phase 2) | Gérer ses propres comptes de façon isolée |

## Fonctionnalités (epics)

### Epic 1 — Authentification & gestion du compte utilisateur
**Objectif :** Sécuriser l'accès à l'application et préparer le support multi-utilisateurs.
**Valeur métier :** Protéger les données financières sensibles et poser les bases pour l'ouverture à d'autres utilisateurs.
**Stories :**
- [ ] En tant qu'utilisateur, je veux m'inscrire avec un email et un mot de passe afin d'accéder à mon espace personnel
- [ ] En tant qu'utilisateur, je veux me connecter et recevoir un token JWT afin d'accéder aux fonctionnalités de l'application
- [ ] En tant qu'utilisateur, je veux me déconnecter afin de sécuriser mon accès depuis un appareil partagé
- [ ] En tant qu'utilisateur, je veux modifier mon mot de passe afin de maintenir la sécurité de mon compte

### Epic 2 — Gestion des comptes bancaires
**Objectif :** Permettre à l'utilisateur de déclarer et gérer ses différents comptes bancaires.
**Valeur métier :** Centraliser tous les comptes (toutes banques confondues) pour avoir une vue unifiée du patrimoine.
**Stories :**
- [ ] En tant qu'utilisateur, je veux ajouter un compte bancaire (nom, banque, type : courant / épargne / autre) afin de l'inclure dans mon suivi
- [ ] En tant qu'utilisateur, je veux lister mes comptes avec leur solde actuel afin d'avoir une vue globale de mon patrimoine
- [ ] En tant qu'utilisateur, je veux modifier ou supprimer un compte afin de maintenir ma liste à jour
- [ ] En tant qu'utilisateur, je veux voir le solde total consolidé de tous mes comptes afin d'avoir une vision immédiate de ma situation financière

### Epic 3 — Import de transactions
**Objectif :** Permettre l'alimentation de l'application en données réelles via des exports de banque.
**Valeur métier :** Éviter la saisie manuelle fastidieuse et garantir l'exactitude des données.
**Stories :**
- [ ] En tant qu'utilisateur, je veux importer un fichier CSV exporté depuis ma banque afin d'ajouter mes transactions
- [ ] En tant qu'utilisateur, je veux importer un fichier OFX exporté depuis ma banque afin d'ajouter mes transactions
- [ ] En tant qu'utilisateur, je veux que les doublons soient détectés automatiquement lors d'un import afin d'éviter les transactions en double
- [ ] En tant qu'utilisateur, je veux voir un résumé de chaque import (nombre de transactions ajoutées, ignorées) afin de vérifier que l'import s'est bien déroulé

### Epic 4 — Catégorisation des transactions
**Objectif :** Classer les transactions par catégorie automatiquement, avec possibilité de correction manuelle.
**Valeur métier :** Identifier les postes de dépenses sans effort et permettre une analyse fine par catégorie.
**Stories :**
- [ ] En tant qu'utilisateur, je veux que les transactions soient catégorisées automatiquement à l'import (ex : "Carrefour" → "Alimentation") afin de gagner du temps
- [ ] En tant qu'utilisateur, je veux corriger manuellement la catégorie d'une transaction afin d'assurer l'exactitude des données
- [ ] En tant qu'utilisateur, je veux créer, modifier et supprimer des catégories personnalisées afin d'adapter la classification à mes habitudes
- [ ] En tant qu'utilisateur, je veux que la correction d'une catégorie pour un libellé connu soit mémorisée afin que les prochains imports appliquent la même règle automatiquement

### Epic 5 — Tableau de bord & statistiques
**Objectif :** Offrir une vue synthétique et des analyses visuelles sur les finances de l'utilisateur.
**Valeur métier :** Permettre de comprendre rapidement sa situation financière et identifier les leviers d'optimisation.
**Stories :**
- [ ] En tant qu'utilisateur, je veux voir un tableau de bord avec le solde total, les revenus et dépenses du mois en cours afin d'avoir une vue immédiate de ma situation
- [ ] En tant qu'utilisateur, je veux voir les dépenses regroupées par catégorie (avec montant et pourcentage) afin d'identifier mes principaux postes de dépenses
- [ ] En tant qu'utilisateur, je veux voir l'évolution de mes dépenses mois par mois sur les 12 derniers mois afin d'identifier des tendances
- [ ] En tant qu'utilisateur, je veux filtrer les statistiques par compte, période et catégorie afin d'affiner mon analyse
- [ ] En tant qu'utilisateur, je veux voir la liste de mes transactions avec recherche et filtres (date, catégorie, montant, compte) afin de retrouver rapidement une opération

## Hors scope (phase 1)
- Connexion directe à l'API bancaire (Open Banking / DSP2)
- Définition de budgets par catégorie et alertes de dépassement
- Gestion multi-utilisateurs avec espace partagé (couple, famille)
- Export de données / rapports PDF
- Application mobile native

## Contraintes & hypothèses

### Sécurité
- Les libellés de transactions sont chiffrés en base de données (chiffrement symétrique AES-256) et déchiffrés à l'affichage
- Les numéros de compte bancaire ne sont pas stockés
- Accès protégé par authentification JWT
- Données strictement isolées par utilisateur

### Technique
- L'application est mono-utilisateur en phase 1, mais le modèle de données doit être multi-utilisateurs dès le départ (chaque entité liée à un `userId`)
- Les formats d'import supportés sont CSV et OFX
- La catégorisation automatique repose sur des règles de correspondance sur le libellé (pas de ML dans un premier temps)
