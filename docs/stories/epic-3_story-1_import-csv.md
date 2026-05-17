# Story 3.1 — Import CSV

**Epic :** Import de transactions
**Statut :** Terminé

## Description
En tant qu'utilisateur, je veux importer un fichier CSV exporté depuis ma banque afin d'ajouter mes transactions sans saisie manuelle.

## Critères d'acceptation
- [x] L'endpoint POST `/import` accepte un fichier CSV (multipart/form-data) et un `bankAccountId`
- [x] Le parser détecte automatiquement le séparateur (virgule, point-virgule)
- [x] Chaque transaction importée contient : date, montant (positif = crédit, négatif = débit), libellé
- [x] Le libellé est chiffré en AES-256-GCM avant stockage (labelEncrypted + labelIv)
- [x] Les doublons sont détectés via un hash SHA-256(date + amount + label) par compte — les doublons sont ignorés
- [x] Un `ImportLog` est créé avec le résumé (addedCount, skippedCount, filename, format=CSV)
- [x] La commande `ImportTransactionsCommand` est persistée
- [x] L'événement `ImportCompleted` est dispatché et déclenche le recalcul du solde du compte
- [x] L'endpoint retourne 201 avec le résumé de l'import (ImportResultView)
- [x] Une page `/import` permet de sélectionner un compte et d'uploader un fichier CSV
- [x] Le résumé (transactions ajoutées / ignorées) est affiché après l'import

## Tâches techniques

### Backend
- [ ] Créer le port `ICsvParserService` (interface domaine)
- [ ] Créer l'adapter `PapaparseCSVParser` (implémentation avec `papaparse`)
- [ ] Créer `TransactionCryptoService` (AES-256-GCM, encrypt/decrypt avec clé depuis env)
- [ ] Créer le Value Object `TransactionHash` (SHA-256 de date+amount+label)
- [ ] Créer le Value Object `TransactionLabel` (wraps string | null, méthodes encrypt/decrypt)
- [ ] Créer l'entité de domaine `Transaction` avec factory `create()`
- [ ] Créer l'entité de domaine `ImportLog` avec factory `create()`
- [ ] Créer `ITransactionRepository` avec `saveBatch()` et `existsByHash()`
- [ ] Créer `IImportLogRepository` avec `save()`
- [ ] Créer `TransactionOrmEntity` avec migration
- [ ] Créer `ImportLogOrmEntity` avec migration
- [ ] Créer `ImportTransactionsCommand` (primitives : userId, bankAccountId, filename, format, rawContent)
- [ ] Créer `ImportTransactionsCommandHandler` (parse → dédoublonne → chiffre → sauvegarde batch → crée ImportLog → dispatch ImportCompleted)
- [ ] Créer le domain event `ImportCompleted` (avec bankAccountId pour déclencher recalcul solde)
- [ ] Créer un handler `OnImportCompleted` qui recalcule et met à jour le solde du BankAccount
- [ ] Créer `ImportResultView` (addedCount, skippedCount, filename)
- [ ] Créer `ImportTransactionsDto` (bankAccountId, file)
- [ ] Créer `ImportController.import()` → POST `/import` avec `FileInterceptor` (multer)
- [ ] Configurer `multer` (taille max 10 Mo, types autorisés : text/csv)

### Frontend
- [ ] Créer la page `/import` avec `ImportComponent` (standalone)
- [ ] Créer un sélecteur de compte (liste déroulante des comptes de l'utilisateur)
- [ ] Créer le composant d'upload de fichier (drag & drop + click)
- [ ] Détecter automatiquement le format (CSV) selon l'extension
- [ ] Créer `ImportService.import()` → POST `/import` (multipart/form-data)
- [ ] Afficher un indicateur de progression pendant l'upload
- [ ] Afficher le résumé (X transactions ajoutées, Y ignorées) après l'import

## Notes techniques
- Dépendance : stories 1.x (auth), 2.1 (compte bancaire), 4.2 (catégorisation auto — peut être appliquée après import)
- Le format CSV varie selon les banques — `papaparse` avec `dynamicTyping: false` et détection auto du séparateur couvre la majorité des cas
- La clé de chiffrement `ENCRYPTION_KEY` doit être une chaîne de 32 octets (256 bits) en base64 dans le `.env`
- `saveBatch()` doit utiliser une transaction PostgreSQL pour garantir l'atomicité
