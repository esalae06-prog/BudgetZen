# BudgetZen

BudgetZen est une application web de gestion de budget personnel développée avec **Node.js**, **Express**, **EJS** et **SQLite**.

Elle permet à un utilisateur de gérer ses revenus, ses dépenses, son budget mensuel et ses objectifs d'épargne depuis un tableau de bord sécurisé.

---

## Auteur

**ES-SALLAMY Alae**

Projet réalisé dans le cadre du module de développement Web / Node.js.

---

## Fonctionnalités

BudgetZen permet de :

- créer un compte utilisateur ;
- se connecter et se déconnecter ;
- protéger l'accès au tableau de bord ;
- ajouter des revenus ;
- ajouter des dépenses ;
- classer les transactions par catégorie ;
- afficher les dernières transactions ;
- supprimer une transaction ;
- calculer le solde total ;
- afficher les revenus du mois ;
- afficher les dépenses du mois ;
- visualiser l'évolution financière des 6 derniers mois ;
- afficher la répartition des dépenses par catégorie ;
- définir un budget mensuel ;
- modifier le budget mensuel ;
- afficher le pourcentage du budget utilisé ;
- créer des objectifs d'épargne ;
- détecter automatiquement l'épargne disponible ;
- afficher la progression d'un objectif ;
- calculer le montant restant à épargner ;
- calculer le nombre de mois restants ;
- proposer un montant recommandé à épargner chaque mois ;
- supprimer un objectif d'épargne.

---

## Épargne automatique

BudgetZen calcule automatiquement l'épargne disponible du mois avec la formule :

```text
Épargne disponible = Revenus du mois - Dépenses du mois
```

Si les dépenses sont supérieures aux revenus, l'épargne disponible est considérée comme égale à `0 €`.

### Exemple

```text
Revenus : 2 700 €
Dépenses : 680 €

Épargne disponible :
2 700 - 680 = 2 020 €
```

Pour un objectif de `5 000 €`, BudgetZen peut alors afficher :

```text
2 020 € sur 5 000 €

40 % de l'objectif atteint

Reste à épargner :
2 980 €
```

BudgetZen calcule également le montant recommandé à épargner chaque mois en fonction de la date limite choisie.

---

## Technologies utilisées

### Backend

- Node.js
- Express.js

### Frontend

- HTML
- CSS
- EJS

### Base de données

- SQLite
- better-sqlite3

### Sécurité

- bcryptjs
- express-session
- better-sqlite3-session-store
- Helmet
- express-rate-limit
- protection CSRF
- cookies de session sécurisés

### Configuration

- dotenv

---

## Base de données

BudgetZen utilise une base de données **SQLite**.

La base et les tables nécessaires sont créées automatiquement au lancement de l'application.

### Table `utilisateurs`

Contient les comptes utilisateurs.

Principaux champs :

```text
id
nom
email
mot_de_passe_hash
```

Les mots de passe ne sont jamais enregistrés en clair.

---

### Table `transactions`

Contient les revenus et les dépenses.

Principaux champs :

```text
id
utilisateur_id
type
montant_centimes
categorie
description
date_transaction
```

Les montants sont stockés en centimes.

Exemple :

```text
25,50 € = 2550 centimes
```

---

### Table `budgets`

Contient les budgets mensuels des utilisateurs.

Principaux champs :

```text
id
utilisateur_id
montant_limite_centimes
mois
```

---

### Table `objectifs_epargne`

Contient les objectifs d'épargne.

Principaux champs :

```text
id
utilisateur_id
nom
montant_cible_centimes
montant_epargne_centimes
date_echeance
created_at
```

Chaque objectif est lié à l'utilisateur connecté.

---

# Installation

## 1. Cloner le projet

```bash
git clone https://github.com/esalae06-prog/BudgetZen.git
```

Puis entrer dans le dossier :

```bash
cd BudgetZen
```

---

## 2. Installer les dépendances

```bash
npm install
```

Les dépendances sont déclarées dans le fichier `package.json`.

Il n'est donc pas nécessaire de fournir le dossier `node_modules`.

---

# Configuration

BudgetZen utilise un fichier `.env`.

Le vrai fichier `.env` n'est pas publié sur GitHub afin de ne pas exposer de secret.

Un fichier `.env.example` est fourni dans le projet.

Créer un fichier `.env` à la racine du projet avec par exemple :

```env
SESSION_SECRET=une_cle_secrete_de_test_avec_plus_de_32_caracteres
PORT=3000
NODE_ENV=development
```

Le `SESSION_SECRET` doit contenir au minimum 32 caractères.

---

# Lancer l'application

Dans le terminal :

```bash
npm start
```

Le serveur démarre par défaut sur :

```text
http://localhost:3000
```

Le terminal doit afficher un message indiquant que la base de données a été initialisée et que le serveur est lancé.

---

# Tester l'application

## 1. Créer un compte

Ouvrir :

```text
http://localhost:3000/inscription
```

Renseigner :

- le nom ;
- l'adresse email ;
- le mot de passe ;
- la confirmation du mot de passe.

Le mot de passe doit contenir au minimum :

- 16 caractères ;
- une lettre ;
- un chiffre ;
- un caractère spécial.

Après l'inscription, l'utilisateur est connecté à son compte.

---

## 2. Tester la connexion

La page de connexion est disponible sur :

```text
http://localhost:3000/connexion
```

Le mot de passe saisi est comparé au mot de passe haché enregistré dans la base de données.

---

## 3. Tester une ressource protégée

Le tableau de bord est disponible sur :

```text
/dashboard
```

Cette page est protégée.

Un utilisateur non connecté qui tente d'accéder au tableau de bord est redirigé vers :

```text
/connexion
```

---

## 4. Ajouter un revenu

Exemple :

```text
Type : Revenu
Montant : 2700
Catégorie : Salaire
Description : Salaire mensuel
```

---

## 5. Ajouter une dépense

Exemple :

```text
Type : Dépense
Montant : 680
Catégorie : Logement
Description : Loyer
```

BudgetZen calcule alors automatiquement :

```text
2700 - 680 = 2020 €
```

L'épargne disponible du mois est donc de :

```text
2 020 €
```

---

## 6. Définir un budget mensuel

Exemple :

```text
Budget : 900 €
```

Si les dépenses sont de `675 €`, BudgetZen affiche :

```text
75 % du budget utilisé
```

---

## 7. Créer un objectif d'épargne

Exemple :

```text
Nom : École
Montant cible : 5000 €
Date limite : 01/09/2027
```

Avec une épargne disponible de `2 020 €`, BudgetZen affiche environ :

```text
2 020 € sur 5 000 €

40 % de l'objectif atteint

Reste à épargner :
2 980 €
```

L'application calcule aussi automatiquement une recommandation mensuelle en fonction du montant restant et de la date limite.

---

# Sécurité

## Mots de passe

Les mots de passe sont protégés avec **bcryptjs**.

Ils ne sont jamais stockés en clair dans SQLite.

Le coût utilisé pour le hachage est de :

```text
12
```

---

## Sessions

L'authentification utilise :

```text
express-session
```

Les sessions sont stockées dans SQLite grâce à :

```text
better-sqlite3-session-store
```

Les cookies utilisent notamment :

```text
HttpOnly
SameSite=Lax
```

En production, le cookie peut également utiliser l'option :

```text
Secure
```

---

## Protection CSRF

Les formulaires sensibles utilisent un token CSRF.

Cela concerne notamment :

- l'ajout et la suppression de transactions ;
- le budget ;
- les objectifs d'épargne ;
- la déconnexion.

---

## Limitation des tentatives

Les routes d'inscription et de connexion sont protégées avec :

```text
express-rate-limit
```

Cela limite le nombre de tentatives répétées.

---

## Helmet

L'application utilise :

```text
helmet
```

afin d'ajouter plusieurs en-têtes HTTP de sécurité.

---

## Requêtes SQL

Les requêtes utilisent des paramètres.

Exemple :

```sql
WHERE utilisateur_id = ?
```

Les données saisies par l'utilisateur ne sont donc pas directement concaténées dans les requêtes SQL.

---

## Contrôle d'accès

Lors de la suppression d'une transaction ou d'un objectif, BudgetZen vérifie également l'identifiant de l'utilisateur connecté.

Exemple :

```sql
WHERE id = ?
AND utilisateur_id = ?
```

Un utilisateur ne peut donc pas supprimer les données appartenant à un autre utilisateur.

---

# Structure du projet

```text
BudgetZen/
│
├── public/
│   ├── styles.css
│   └── confirm-delete.js
│
├── views/
│   ├── index.ejs
│   ├── inscription.ejs
│   ├── connexion.ejs
│   ├── dashboard.ejs
│   ├── 404.ejs
│   └── 500.ejs
│
├── app.js
├── db.js
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
└── README.md
```

---

# Rôle des fichiers principaux

## `app.js`

Contient principalement :

- la configuration du serveur Express ;
- les sessions ;
- l'authentification ;
- les routes ;
- la protection CSRF ;
- les transactions ;
- le budget ;
- les objectifs d'épargne ;
- les calculs du tableau de bord ;
- la gestion des erreurs.

---

## `db.js`

Configure SQLite et crée les tables nécessaires :

- utilisateurs ;
- transactions ;
- budgets ;
- objectifs d'épargne.

---

## `views/dashboard.ejs`

Affiche le tableau de bord avec :

- le solde ;
- les revenus ;
- les dépenses ;
- l'épargne ;
- le budget ;
- les graphiques ;
- les transactions ;
- les objectifs d'épargne.

---

## `public/styles.css`

Contient la mise en forme graphique de BudgetZen.

---

# Persistance des données

BudgetZen n'utilise pas un simple tableau JavaScript en mémoire.

Les données sont enregistrées dans une base SQLite.

Elles restent donc disponibles après l'arrêt et le redémarrage du serveur.

---

# Limites connues

BudgetZen est un projet pédagogique.

L'application n'est pas connectée à un véritable compte bancaire.

L'épargne affichée correspond donc à une estimation calculée à partir des transactions enregistrées dans l'application :

```text
Revenus enregistrés - Dépenses enregistrées
```

BudgetZen ne réalise aucun transfert bancaire réel.

Les objectifs d'épargne permettent uniquement de suivre et de planifier l'épargne disponible.

---

# Relancer le projet sur une autre machine

```bash
git clone https://github.com/esalae06-prog/BudgetZen.git
cd BudgetZen
npm install
```

Créer ensuite le fichier `.env` à partir de `.env.example`.

Puis lancer :

```bash
npm start
```

Enfin ouvrir :

```text
http://localhost:3000
```

---

# Dépôt GitHub

Le code source du projet est disponible ici :

```text
https://github.com/esalae06-prog/BudgetZen
```

---

# Auteur

**ES-SALLAMY Alae**

**Projet : BudgetZen**

Application web de gestion de budget personnel développée avec **Node.js, Express, EJS et SQLite**.