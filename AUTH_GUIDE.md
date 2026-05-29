# Guide d'Authentification — Oriotel ERP

Ce document explique le fonctionnement des processus de Connexion (Login) et d'Inscription (Register) du microservice Identity.

---

## 🔐 Processus de Connexion (Login)

La connexion est multi-étapes et dépend de l'état de sécurité du compte utilisateur.

### 1. Authentification Initiale
L'utilisateur s'identifie via son **Email** ou son **CIN** et son mot de passe.
- **Endpoint:** `POST /api/v1/auth/login`
- **Payload:** `{ "login": "...", "password": "..." }`

### 2. Réponses Possibles (Actions)
Le serveur renvoie un objet JSON avec une clé `action` qui détermine la suite du workflow :

- **`authenticated`** : Succès immédiat. Un token JWT complet est fourni. L'utilisateur est redirigé vers le Dashboard.
- **`two_factor_required`** : La Double Authentification (2FA) est active. Un code a été envoyé par email.
    - *Action suivante:* Appeler `POST /api/v1/auth/two-factor/verify`.
- **`force_password_change`** : C'est la première connexion ou le mot de passe a été réinitialisé. Un token temporaire (limité au changement de mot de passe) est fourni.
    - *Action suivante:* Appeler `POST /api/v1/auth/force-change-password`.
- **`account_locked`** : Trop de tentatives échouées. Le compte est bloqué pour X minutes.
- **`account_inactive`** : Le compte est soit en attente d'approbation, soit suspendu par un admin.

---

## 📝 Processus d'Inscription (Register)

L'inscription sur Oriotel ERP n'est pas immédiate ; elle suit un workflow de validation.

### 1. Soumission de la demande
L'utilisateur remplit le formulaire d'inscription.
- **Endpoint:** `POST /api/v1/auth/register`
- **Statut Initial:** `pending` (En attente).

### 2. Vérification de l'Email
Un code de sécurité est envoyé à l'adresse email fournie.
- **Action:** L'utilisateur doit saisir ce code.
- **Endpoint:** `POST /api/v1/auth/register/verify`
- **Résultat:** L'email est marqué comme vérifié, mais l'accès reste bloqué.

### 3. Approbation Administrative (Permission)
**C'est l'étape cruciale.** Pour des raisons de sécurité :
- Un utilisateur nouvellement inscrit **n'a aucune permission d'accès** par défaut.
- Son statut reste `pending`.
- **Action requise:** Un Administrateur système doit examiner la demande et passer le statut à `active` via le panneau d'administration (ou directement en BDD pour les tests).

---

## 🛡️ Rôles et Permissions

| Type de Rôle | Rôles inclus | Permissions de base |
| :--- | :--- | :--- |
| **Interne** | Administrateur, Animateur, Opérateur | Accès complet ou partiel aux modules de gestion selon le grade. |
| **Externe** | Agence | Accès limité aux fonctionnalités de réservation et de suivi de dossiers. |

### Conditions pour s'inscrire :
- Posséder un **CIN** valide et unique.
- Fournir un **motif d'accès** (Access Reason) qui sera lu par l'administrateur lors de la validation.
- Choisir un rôle approprié (Interne/Externe).

---

## 💡 Notes pour le Développement
- Tous les tokens (JWT) doivent être envoyés dans le header `Authorization: Bearer <token>`.
- En mode **Mock/Test**, vous pouvez utiliser le code `123456` pour bypasser toute vérification 2FA ou Email.
