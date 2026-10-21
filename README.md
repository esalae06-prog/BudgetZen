# BudgetZen

BudgetZen est une application web de gestion de budget personnel développée avec **Node.js**, **Express**, **EJS** et **SQLite**.

L'application permet à un utilisateur de créer un compte, de se connecter, d'enregistrer ses revenus et ses dépenses, de définir un budget et de consulter différentes statistiques financières depuis un tableau de bord personnel.

Chaque utilisateur possède son propre espace et ne peut consulter que ses propres données.

---

# 1. Sujet et fonctionnalités de l'application

L'objectif de BudgetZen est de permettre à un utilisateur de suivre simplement ses finances personnelles.

Les principales fonctionnalités sont :

- création d'un compte utilisateur ;
- connexion et déconnexion ;
- accès à un tableau de bord protégé ;
- ajout de revenus ;
- ajout de dépenses ;
- choix d'une catégorie de transaction ;
- consultation des dernières transactions ;
- suppression d'une transaction ;
- définition d'un budget ;
- calcul du total des revenus ;
- calcul du total des dépenses ;
- calcul du solde ;
- affichage de statistiques financières ;
- répartition des dépenses par catégorie ;
- gestion des erreurs 404 et 500.

---

# 2. Technologies utilisées

## Back-end

- Node.js
- Express.js
- SQLite
- better-sqlite3
- bcryptjs
- express-session
- better-sqlite3-session-store
- dotenv
- Helmet
- express-rate-limit

## Front-end

- EJS
- HTML
- CSS
- JavaScript

---

# 3. Prérequis

Avant de lancer l'application, il faut avoir installé :

- Node.js
- npm
- Git

Le projet a notamment été testé avec **Node.js 24**.

Pour vérifier les versions installées :

```bash
node --version
npm --version
git --version
```

---

# 4. Installation

## Étape 1 : cloner le projet

```bash
git clone https://github.com/esalae06-prog/BudgetZen.git
```

Entrer dans le dossier du projet :

```bash
cd BudgetZen
```

---

## Étape 2 : installer les dépendances

```bash
npm install
```

Les dépendances nécessaires sont déclarées dans le fichier `package.json`.

Le dossier `node_modules` n'est donc pas fourni dans le dépôt, car il peut être recréé avec `npm install`.

---

# 5. Configuration du fichier `.env`

Le vrai fichier `.env` n'est pas fourni dans le dépôt pour des raisons de sécurité.

Un fichier `.env.example` est fourni avec des valeurs fictives.

## Sous Windows PowerShell

Créer le fichier `.env` avec :

```powershell
Copy-Item .env.example .env
```

Puis l'ouvrir :

```powershell
notepad .env
```

## Sous Linux ou macOS

```bash
cp .env.example .env
```

Le fichier `.env` doit contenir par exemple :

```env
SESSION_SECRET=replace_with_a_random_secret_of_at_least_32_characters
PORT=3000
NODE_ENV=development
```

Il est recommandé de remplacer `SESSION_SECRET` par une chaîne longue et difficile à deviner.

Aucun mot de passe réel, aucune clé privée et aucun secret réel ne sont présents dans le dépôt.

---

# 6. Démarrage de l'application

Pour lancer l'application :

```bash
npm start
```

Le terminal doit afficher notamment :

```text
Base de données BudgetZen initialisée !
Serveur lancé sur http://localhost:3000
```

Ouvrir ensuite dans le navigateur :

```text
http://localhost:3000
```

Pour lancer l'application en mode développement :

```bash
npm run dev
```

---

# 7. Préparation de la base de données

BudgetZen utilise **SQLite**.

La base de données est initialisée automatiquement au démarrage de l'application grâce au fichier :

```text
db.js
```

Le fichier local :

```text
budgetzen.db
```

n'est pas présent dans le dépôt GitHub.

Il est créé automatiquement lorsque l'application est lancée.

Aucune importation manuelle de base de données n'est donc nécessaire.

---

# 8. Données de démonstration

Aucun compte utilisateur réel n'est fourni dans le dépôt.

Pour tester l'application, il suffit de créer un nouveau compte depuis la page d'inscription.

Exemple :

```text
Nom : Utilisateur Test
Email : test@example.com
Mot de passe : choisir un mot de passe respectant les règles demandées
```

Le mot de passe est haché avant son stockage dans la base de données.

---

# 9. Procédure pour tester la connexion

Après avoir lancé l'application :

1. ouvrir :

```text
http://localhost:3000
```

2. créer un nouveau compte ;

3. se connecter avec ce compte ;

4. vérifier que l'utilisateur est redirigé vers son tableau de bord.

Lors de la connexion :

- le serveur recherche l'utilisateur grâce à son adresse email ;
- le mot de passe saisi est comparé au hash enregistré avec `bcryptjs` ;
- si les informations sont correctes, une session est créée ;
- l'utilisateur est ensuite redirigé vers le tableau de bord.

Les mots de passe ne sont jamais stockés en clair dans la base de données.

---

# 10. Procédure pour tester une fonctionnalité protégée

La route suivante est protégée :

```text
/dashboard
```

Pour vérifier la protection :

1. créer un compte ;
2. se connecter ;
3. accéder au tableau de bord ;
4. ajouter par exemple un revenu ou une dépense ;
5. se déconnecter ;
6. essayer d'accéder directement à :

```text
http://localhost:3000/dashboard
```

Un utilisateur non authentifié ne doit pas pouvoir accéder au tableau de bord.

Il est redirigé vers la page de connexion.

Cette vérification est réalisée côté serveur grâce à un middleware d'authentification.

---

# 11. Test rapide de l'application

Après le lancement :

1. créer un compte ;
2. se connecter ;
3. accéder au tableau de bord ;
4. ajouter un revenu ;
5. ajouter une dépense ;
6. définir un budget ;
7. consulter les statistiques ;
8. supprimer une transaction ;
9. se déconnecter ;
10. essayer d'accéder à `/dashboard` sans être connecté.

---

# 12. Authentification et sécurité

BudgetZen utilise plusieurs mécanismes de sécurité.

## Hachage des mots de passe

Les mots de passe sont hachés avec :

```text
bcryptjs
```

Ils ne sont jamais stockés en clair dans SQLite.

---

## Sessions

Les connexions sont gérées avec :

```text
express-session
```

Les sessions sont stockées dans SQLite grâce à :

```text
better-sqlite3-session-store
```

L'identifiant de l'utilisateur connecté est conservé dans la session.

---

## Protection des routes

Le tableau de bord est protégé par un middleware.

Un utilisateur non connecté ne peut pas accéder aux fonctionnalités privées.

---

## Protection des données utilisateurs

Chaque transaction est associée à son propriétaire.

Les requêtes utilisent l'identifiant de l'utilisateur connecté afin d'éviter qu'un utilisateur puisse accéder ou supprimer les données d'un autre utilisateur.

---

## Protection CSRF

Les formulaires sensibles utilisent un token CSRF afin de réduire le risque de requêtes frauduleuses effectuées au nom d'un utilisateur connecté.

---

## Rate limiting

Les routes sensibles comme la connexion et l'inscription utilisent :

```text
express-rate-limit
```

afin de limiter le nombre de tentatives pendant une période donnée.

---

## Helmet

L'application utilise :

```text
helmet
```

pour ajouter plusieurs en-têtes HTTP de sécurité.

---

## Requêtes SQL paramétrées

Les requêtes SQL utilisent des paramètres afin de réduire le risque d'injection SQL.

Exemple :

```sql
SELECT *
FROM utilisateurs
WHERE email = ?
```

---

## Cookies

Les cookies de session utilisent notamment :

- `HttpOnly`
- `SameSite`
- `Secure` en environnement de production

---

# 13. Base de données et montants

Les transactions sont stockées dans SQLite.

Les montants sont enregistrés en centimes afin d'éviter les problèmes d'arrondi avec les nombres décimaux.

Exemple :

```text
12,50 € = 1250 centimes
```

---

# 14. Structure du projet

```text
BudgetZen/
│
├── app.js
├── db.js
├── package.json
├── package-lock.json
├── README.md
├── .env.example
├── .gitignore
│
├── public/
│   ├── styles.css
│   ├── dashboard.js
│   ├── inscription.js
│   └── confirm-delete.js
│
└── views/
    ├── index.ejs
    ├── connexion.ejs
    ├── inscription.ejs
    ├── dashboard.ejs
    ├── 404.ejs
    └── 500.ejs
```

---

# 15. Rôle des principaux fichiers

## `app.js`

Fichier principal de l'application.

Il contient notamment :

- la configuration d'Express ;
- les middlewares ;
- les routes ;
- l'authentification ;
- les sessions ;
- la gestion des transactions ;
- la gestion du budget ;
- les contrôles d'accès ;
- les protections de sécurité ;
- la gestion des erreurs.

## `db.js`

Ce fichier initialise la base de données SQLite et les tables nécessaires.

## `views/`

Contient les vues EJS affichées par le serveur.

## `public/`

Contient les fichiers accessibles au navigateur :

- CSS ;
- JavaScript côté client.

---

# 16. Gestion des erreurs

Une page personnalisée est utilisée lorsqu'une route n'existe pas :

```text
views/404.ejs
```

Une page spécifique est également utilisée en cas d'erreur interne :

```text
views/500.ejs
```

Les informations techniques sensibles ne sont pas affichées directement à l'utilisateur.

---

# 17. Fichiers non versionnés

Les fichiers suivants ne sont volontairement pas présents sur GitHub :

```text
.env
node_modules/
*.db
```

Ils sont exclus grâce au fichier :

```text
.gitignore
```

Le dépôt contient à la place :

```text
.env.example
```

avec des valeurs fictives.

---

# 18. Vérification des dépendances

Pour rechercher les vulnérabilités connues dans les dépendances :

```bash
npm audit
```

Lors de la préparation de la version remise, la commande retournait :

```text
found 0 vulnerabilities
```

---

# 19. Limitations connues

Les limitations actuelles de BudgetZen sont les suivantes :

- les catégories de transactions sont prédéfinies ;
- la base SQLite est locale ;
- l'application est principalement conçue dans un contexte pédagogique ;
- aucun compte utilisateur réel n'est fourni avec le projet ;
- une mise en production réelle nécessiterait un hébergement adapté et HTTPS.

---

# 20. Réinstallation complète

Pour installer BudgetZen sur une nouvelle machine :

```bash
git clone https://github.com/esalae06-prog/BudgetZen.git
cd BudgetZen
npm install
```

Sous Windows :

```powershell
Copy-Item .env.example .env
```

Puis lancer :

```bash
npm start
```

Enfin ouvrir :

```text
http://localhost:3000
```

---

# 21. Résumé du fonctionnement

```text
Navigateur
    ↓
Requête HTTP
    ↓
Node.js / Express
    ↓
Middleware
    ↓
Route
    ↓
Traitement JavaScript
    ↓
SQLite
    ↓
EJS
    ↓
HTML envoyé au navigateur
```

---

# Auteur

**ES-SALLAMY Alae**

Projet réalisé dans le cadre d'un exercice de développement web avec Node.js.