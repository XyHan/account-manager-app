# Story 1.5 — Changement de mot de passe

**Epic :** Authentification & gestion du compte utilisateur
**Statut :** À faire

## Description
En tant qu'utilisateur, je veux modifier mon mot de passe afin de maintenir la sécurité de mon compte.

## Critères d'acceptation
- [ ] L'endpoint PATCH `/auth/change-password` exige le mot de passe actuel et le nouveau
- [ ] Le mot de passe actuel incorrect retourne 401
- [ ] Le nouveau mot de passe doit avoir au moins 8 caractères
- [ ] Le nouveau mot de passe est hashé avec bcrypt avant stockage
- [ ] La commande `ChangePasswordCommand` est persistée
- [ ] L'événement `PasswordChanged` est dispatché et persisté après succès
- [ ] L'endpoint retourne 204
- [ ] Un formulaire de changement de mot de passe est accessible dans les paramètres du profil
- [ ] Les erreurs de validation sont affichées sous chaque champ

## Tâches techniques

### Backend
- [ ] Créer `ChangePasswordCommand` (primitives : userId, currentPassword, newPassword)
- [ ] Créer `ChangePasswordCommandHandler` (vérifie mot de passe actuel, hash le nouveau, sauvegarde)
- [ ] Créer `PasswordChanged` domain event
- [ ] Créer `ChangePasswordDto` avec validation class-validator
- [ ] Créer `AuthController.changePassword()` → PATCH `/auth/change-password` (scope `app`, rôle USER)

### Frontend
- [ ] Créer le composant `ChangePasswordComponent` dans les paramètres profil
- [ ] Créer le formulaire réactif (currentPassword, newPassword, confirmNewPassword)
- [ ] Ajouter validation côté client (longueur, correspondance newPassword/confirmNewPassword)
- [ ] Appeler PATCH `/auth/change-password`
- [ ] Afficher un message de succès et rediriger vers `/login` (forcer reconnexion)

## Notes techniques
- Dépendance : story 1.1 (User), story 1.2 (guards)
- Après changement de mot de passe, révoquer tous les tokens actifs de l'utilisateur et forcer une reconnexion (bonne pratique sécurité)
