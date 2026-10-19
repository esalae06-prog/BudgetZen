# BudgetZen

BudgetZen est une application web de gestion de budget personnel développée avec **Node.js**, **Express**, **EJS** et **SQLite**.

L'application permet à un utilisateur de créer un compte, de se connecter, d'enregistrer ses revenus et ses dépenses, de définir un budget mensuel et de consulter un tableau de bord financier.

---

## 1. Sujet de l'application

L'objectif de BudgetZen est de permettre à un utilisateur de suivre simplement ses finances personnelles.

Chaque utilisateur dispose de son propre espace et peut consulter uniquement ses propres données.

---

## 2. Fonctionnalités

BudgetZen permet notamment de :

- créer un compte utilisateur ;
- se connecter et se déconnecter ;
- accéder à un tableau de bord protégé ;
- ajouter des revenus ;
- ajouter des dépenses ;
- choisir des catégories adaptées au type de transaction ;
- supprimer une transaction ;
- consulter l'historique des transactions ;
- calculer le solde total ;
- calculer les revenus du mois ;
- calculer les dépenses du mois ;
- calculer l'épargne du mois ;
- définir un budget mensuel ;
- afficher le niveau d'utilisation du budget ;
- afficher des statistiques financières ;
- afficher la répartition des dépenses par catégorie ;
- afficher une page 404 lorsqu'une page n'existe pas ;
- afficher une page 500 en cas d'erreur interne.

---

## 3. Technologies utilisées

### Backend

- Node.js
- Express

### Frontend

- EJS
- HTML
- CSS
- JavaScript

### Base de données

- SQLite
- better-sqlite3

### Authentification et sécurité

- bcryptjs
- express-session
- better-sqlite3-session-store
- Helmet
- express-rate-limit
- protection CSRF
- dotenv

---

## 4. Prérequis

Avant de lancer BudgetZen, il faut installer :

- Node.js ;
- npm.

Pour vérifier l'installation :

```bash
node --version
npm --version