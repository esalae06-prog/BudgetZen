# BudgetZen

BudgetZen est une application web de gestion de budget personnel développée avec **Node.js**, **Express**, **EJS** et **SQLite**.

L'application permet à un utilisateur de créer un compte, se connecter, enregistrer ses revenus et ses dépenses, définir un budget et consulter différentes statistiques financières depuis un tableau de bord.

---

## Fonctionnalités

BudgetZen permet de :

- créer un compte utilisateur ;
- se connecter et se déconnecter ;
- accéder à un tableau de bord personnel ;
- ajouter des revenus ;
- ajouter des dépenses ;
- choisir une catégorie de transaction ;
- consulter les dernières transactions ;
- supprimer une transaction ;
- définir un budget ;
- consulter le total des revenus ;
- consulter le total des dépenses ;
- consulter le solde ;
- visualiser la répartition des dépenses par catégorie ;
- consulter des statistiques financières.

Chaque utilisateur accède uniquement à ses propres données.

---

## Technologies utilisées

### Back-end

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

### Front-end

- HTML
- CSS
- JavaScript
- EJS

---

## Prérequis

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

# Installation

## 1. Cloner le projet

Ouvrir un terminal puis exécuter :

```bash
git clone https://github.com/esalae06-prog/BudgetZen.git
```

Entrer ensuite dans le dossier du projet :

```bash
cd BudgetZen
```

---

## 2. Installer les dépendances

Exécuter :

```bash
npm install
```

Cette commande installe automatiquement les dépendances présentes dans le fichier `package.json`.

Il n'est donc pas nécessaire de récupérer le dossier `node_modules`.

---

## 3. Créer le fichier `.env`

Le vrai fichier `.env` n'est volontairement pas présent sur GitHub pour des raisons de sécurité.

Un fichier `.env.example` est fourni.

### Sous Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Puis ouvrir le fichier :

```powershell
notepad .env
```

### Sous Linux / macOS

```bash
cp .env.example .env
```

Le fichier `.env` doit contenir par exemple :

```env
SESSION_SECRET=replace_with_a_random_secret_of_at_least_32_characters
PORT=3000
NODE_ENV=development
```

Il est recommandé de remplacer la valeur de `SESSION_SECRET` par une chaîne longue et difficile à deviner.

Exemple :

```env
SESSION_SECRET=BudgetZen_Secret_Local_2026_Change_Me_123456789
PORT=3000
NODE_ENV=development
```

> Ne jamais publier un vrai secret de session sur GitHub.

---

# Lancement de l'application

## Mode normal

```bash
npm start
```

Le terminal doit afficher notamment :

```text
Base de données BudgetZen initialisée !
Serveur lancé sur http://localhost:3000
```

Ouvrir ensuite dans un navigateur :

```text
http://localhost:3000
```

---

## Mode développement

Il est également possible d'utiliser :

```bash
npm run dev
```

Ce mode redémarre automatiquement le serveur lorsqu'un fichier est modifié.

---

# Base de données

BudgetZen utilise **SQLite**.

La base de données est initialisée automatiquement au démarrage de l'application grâce au fichier :

```text
db.js
```

Le fichier local :

```text
budgetzen.db
```

n'est pas envoyé sur GitHub.

Il sera créé automatiquement lorsque l'application sera lancée.

Il n'est donc pas nécessaire d'importer manuellement une base de données.

---

# Données de démonstration

Aucun compte utilisateur réel n'est fourni dans le dépôt.

Pour tester l'application, il suffit de créer un compte depuis la page d'inscription.

Par exemple :

```text
Nom : Utilisateur Test
Email : test@example.com
Mot de passe : choisir un mot de passe respectant les règles demandées
```

Le mot de passe sera automatiquement haché avant son stockage dans la base de données.

---

# Test rapide de l'application

Après avoir lancé BudgetZen :

1. ouvrir `http://localhost:3000` ;
2. créer un compte ;
3. se connecter ;
4. accéder au tableau de bord ;
5. ajouter un revenu ;
6. ajouter une dépense ;
7. définir un budget ;
8. vérifier les statistiques ;
9. supprimer une transaction ;
10. se déconnecter.

---

# Authentification

Lors de l'inscription :

1. les données du formulaire sont vérifiées côté serveur ;
2. le mot de passe est haché avec `bcryptjs` ;
3. le hash du mot de passe est enregistré dans SQLite ;
4. le mot de passe original n'est jamais stocké en clair.

Lors de la connexion :

1. le serveur recherche l'utilisateur à partir de son adresse email ;
2. `bcrypt` compare le mot de passe fourni avec le hash enregistré ;
3. si les informations sont correctes, une session est créée ;
4. l'identifiant de l'utilisateur est conservé dans la session ;
5. l'utilisateur est redirigé vers son tableau de bord.

---

# Route protégée

Le tableau de bord est une ressource protégée.

Route principale :

```text
/dashboard
```

Un utilisateur non authentifié ne doit pas pouvoir accéder directement à cette route.

Un middleware vérifie la présence de la session avant d'autoriser l'accès.

Si l'utilisateur n'est pas connecté, il est redirigé vers la page de connexion.

---

# Protection des données utilisateurs

Chaque transaction est associée à l'identifiant de son propriétaire.

Les requêtes vers la base utilisent l'identifiant de l'utilisateur connecté afin qu'un utilisateur ne puisse pas accéder aux transactions d'un autre compte.

Par exemple, une suppression vérifie à la fois :

- l'identifiant de la transaction ;
- l'identifiant de l'utilisateur connecté.

---

# Sécurité

Plusieurs mécanismes de sécurité sont présents dans BudgetZen.

## Hachage des mots de passe

Les mots de passe sont hachés avec :

```text
bcryptjs
```

Ils ne sont jamais stockés en clair dans la base.

---

## Sessions

Les connexions sont maintenues avec :

```text
express-session
```

Les sessions sont stockées dans SQLite avec :

```text
better-sqlite3-session-store
```

---

## Cookies

Les cookies de session utilisent notamment des options de sécurité telles que :

- `HttpOnly`
- `SameSite`
- `Secure` en environnement de production

---

## Protection CSRF

Les formulaires sensibles utilisent un token CSRF afin de réduire le risque de requêtes frauduleuses effectuées au nom d'un utilisateur connecté.

---

## Rate limiting

Les routes sensibles comme la connexion et l'inscription sont protégées avec :

```text
express-rate-limit
```

Cela permet de limiter le nombre de tentatives pendant une période donnée.

---

## Helmet

L'application utilise :

```text
helmet
```

pour ajouter différents en-têtes HTTP de sécurité.

---

## Requêtes SQL paramétrées

Les valeurs fournies par les utilisateurs ne sont pas directement concaténées dans les requêtes SQL.

Des requêtes paramétrées sont utilisées afin de réduire le risque d'injection SQL.

Exemple de principe :

```sql
SELECT *
FROM utilisateurs
WHERE email = ?
```

---

## Validation côté serveur

Les données provenant des formulaires sont vérifiées côté serveur.

La validation HTML ou JavaScript côté navigateur n'est pas considérée comme suffisante pour garantir la sécurité.

---

# Gestion des erreurs

BudgetZen contient une page personnalisée pour les routes inexistantes :

```text
views/404.ejs
```

et une page pour les erreurs internes du serveur :

```text
views/500.ejs
```

Les détails techniques sensibles ne sont pas affichés directement à l'utilisateur.

---

# Structure du projet

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

# Rôle des principaux fichiers

### `app.js`

Fichier principal de l'application.

Il contient notamment :

- la configuration d'Express ;
- les middlewares ;
- la configuration des sessions ;
- les routes ;
- l'authentification ;
- les contrôles d'accès ;
- la gestion des transactions ;
- la gestion du budget ;
- les protections de sécurité ;
- la gestion des erreurs.

### `db.js`

Gère l'initialisation de la base de données SQLite et la création des tables nécessaires.

### `views/`

Contient les vues EJS générées par le serveur.

### `public/`

Contient les ressources accessibles au navigateur :

- CSS ;
- JavaScript côté client.

---

# Catégories

Les transactions utilisent des catégories prédéfinies afin de garder les statistiques cohérentes.

Exemples de dépenses :

- Alimentation
- Logement
- Transport
- Loisirs
- Santé
- Études
- Autres dépenses

Exemples de revenus :

- Salaire
- Autres revenus

---

# Montants

Les montants sont stockés en centimes dans la base de données.

Par exemple :

```text
12,50 € → 1250 centimes
```

Cette méthode permet d'éviter les problèmes d'arrondi liés aux nombres décimaux.

---

# Fichiers non versionnés

Les fichiers suivants ne sont volontairement pas envoyés sur GitHub :

```text
.env
node_modules/
*.db
```

Ils sont exclus grâce au fichier :

```text
.gitignore
```

---

# Vérification des dépendances

Pour vérifier les vulnérabilités connues des dépendances :

```bash
npm audit
```

Lors de la préparation de la version remise, le projet retournait :

```text
found 0 vulnerabilities
```

---

# Limitations connues

- Les catégories de transactions sont prédéfinies.
- L'application est principalement conçue dans un contexte pédagogique.
- La base SQLite est locale.
- Une mise en production réelle nécessiterait notamment un hébergement adapté et HTTPS.
- Le projet ne fournit pas de comptes utilisateurs réels ou de mots de passe de démonstration.

---

# Réinstallation complète

Pour tester le projet sur une nouvelle machine :

```bash
git clone https://github.com/esalae06-prog/BudgetZen.git
cd BudgetZen
npm install
```

Sous Windows :

```powershell
Copy-Item .env.example .env
```

Puis :

```bash
npm start
```

Enfin ouvrir :

```text
http://localhost:3000
```

---

# Résumé du parcours

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