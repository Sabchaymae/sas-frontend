# 🚀 Guide de mise à jour et installation (Post-Pull)

Ce guide explique les étapes à suivre après avoir effectué un `git pull` pour s'assurer que le projet fonctionne correctement.

## 💻 Frontend (front-office)

Après avoir récupéré la dernière version :

1.  **Installer les nouvelles dépendances** :
    ```bash
    npm install
    ```
2.  **Lancer le serveur de développement** :
    ```bash
    npm run dev
    ```

---

## 🏢 Backend (oriotel-erp)

Après avoir récupéré la dernière version :

1.  **Mettre à jour les variables d'environnement** :
    ```bash
    cp .env.docker .env
    ```
2.  **Reconstruire et démarrer les conteneurs** :
    ```bash
    docker compose up -d --build
    ```
3.  **Installer les dépendances PHP** :
    ```bash
    docker compose exec identity-php composer install
    ```
4.  **Exécuter les migrations** :
    ```bash
    docker compose exec identity-php php artisan migrate
    ```

---

## 🛠️ Dépannage rapide

*   **Erreur de dépendances** : Supprimez `node_modules` et refaites `npm install`.
*   **Port déjà utilisé** : Vérifiez qu'aucune autre instance de `npm run dev` ne tourne.
*   **API non accessible** : Vérifiez que le Backend est bien démarré sur le port 8080.
