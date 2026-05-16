# Story 1.5 — Changement de mot de passe

**Epic :** Authentification & gestion du compte utilisateur
**Statut :** Terminé

## Description
En tant qu'utilisateur, je veux modifier mon mot de passe afin de maintenir la sécurité de mon compte.

## Critères d'acceptation
- [x] L'endpoint PATCH `/auth/change-password` exige le mot de passe actuel et le nouveau
- [x] Le mot de passe actuel incorrect retourne 401
- [x] Le nouveau mot de passe doit avoir au moins 8 caractères
- [x] Le nouveau mot de passe est hashé avec bcrypt avant stockage
- [x] La commande `ChangePasswordCommand` est persistée
- [x] L'événement `PasswordChanged` est dispatché et persisté après succès
- [x] L'endpoint retourne 204
- [x] Un formulaire de changement de mot de passe est accessible dans les paramètres du profil
- [x] Les erreurs de validation sont affichées sous chaque champ

## Tâches techniques

### Backend
- [x] Créer `ChangePasswordCommand` (primitives : userId, currentPassword, newPassword)
- [x] Créer `ChangePasswordCommandHandler` (vérifie mot de passe actuel, hash le nouveau, sauvegarde)
- [x] Créer `PasswordChanged` domain event
- [x] Créer `ChangePasswordDto` avec validation class-validator
- [x] Créer `AuthController.changePassword()` → PATCH `/auth/change-password` (scope `app`, rôle USER)

### Frontend
- [x] Créer le composant `ChangePasswordComponent` dans les paramètres profil
- [x] Créer le formulaire réactif (currentPassword, newPassword, confirmNewPassword)
- [x] Ajouter validation côté client (longueur, correspondance newPassword/confirmNewPassword)
- [x] Appeler PATCH `/auth/change-password`
- [x] Afficher un message de succès et rediriger vers `/login` (forcer reconnexion)

## Notes techniques
- Dépendance : story 1.1 (User), story 1.2 (guards)
- Après changement de mot de passe, révoquer tous les tokens actifs de l'utilisateur et forcer une reconnexion (bonne pratique sécurité)
