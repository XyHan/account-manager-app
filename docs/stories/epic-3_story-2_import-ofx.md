# Story 3.2 — Import OFX

**Epic :** Import de transactions
**Statut :** À faire

## Description
En tant qu'utilisateur, je veux importer un fichier OFX exporté depuis ma banque afin d'ajouter mes transactions sans saisie manuelle.

## Critères d'acceptation
- [ ] L'endpoint POST `/import` accepte également les fichiers OFX/QFX (multipart/form-data)
- [ ] Le format est détecté automatiquement (OFX vs CSV) selon le contenu ou l'extension du fichier
- [ ] Chaque transaction OFX importée contient : date (DTPOSTED), montant (TRNAMT), libellé (NAME ou MEMO)
- [ ] L'identifiant unique OFX (FITID) est utilisé comme composante du hash de dédoublonnage
- [ ] Les règles de dédoublonnage, chiffrement et importLog sont identiques à l'import CSV (story 3.1)
- [ ] L'endpoint retourne 201 avec le résumé de l'import
- [ ] La page `/import` accepte les fichiers `.ofx` et `.qfx` en plus de `.csv`

## Tâches techniques

### Backend
- [ ] Créer le port `IOfxParserService` (interface domaine)
- [ ] Créer l'adapter `OfxJsParser` (implémentation avec `ofx-js`)
- [ ] Ajouter la détection de format dans `ImportTransactionsCommandHandler` (inspecter extension ou magic bytes)
- [ ] Gérer la valeur `FITID` dans la construction du hash (remplace ou complète SHA-256(date+amount+label))
- [ ] Étendre la validation multer pour accepter `.ofx` et `.qfx`

### Frontend
- [ ] Étendre le composant d'upload pour accepter `.ofx` et `.qfx`
- [ ] Afficher le format détecté (CSV / OFX) avant confirmation de l'import

## Notes techniques
- Dépendance : story 3.1 (infrastructure d'import en place)
- Le `FITID` OFX est un identifiant de transaction fourni par la banque — l'utiliser dans le hash rend le dédoublonnage plus fiable pour ce format
- `ofx-js` parse les formats OFX 1.x (SGML) et OFX 2.x (XML) — couvre la majorité des banques françaises
