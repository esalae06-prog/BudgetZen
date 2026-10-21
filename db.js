const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(
    path.join(__dirname, "budgetzen.db")
);

db.pragma("foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS utilisateurs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        mot_de_passe_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        utilisateur_id INTEGER NOT NULL,
        type TEXT NOT NULL
            CHECK(type IN ('revenu', 'depense')),
        montant_centimes INTEGER NOT NULL
            CHECK(montant_centimes > 0),
        categorie TEXT NOT NULL,
        description TEXT,
        date_transaction TEXT NOT NULL,

        FOREIGN KEY (utilisateur_id)
            REFERENCES utilisateurs(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        utilisateur_id INTEGER NOT NULL,
        montant_limite_centimes INTEGER NOT NULL
            CHECK(montant_limite_centimes > 0),
        mois TEXT NOT NULL,

        UNIQUE(utilisateur_id, mois),

        FOREIGN KEY (utilisateur_id)
            REFERENCES utilisateurs(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS objectifs_epargne (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        utilisateur_id INTEGER NOT NULL,
        nom TEXT NOT NULL,
        montant_cible_centimes INTEGER NOT NULL
            CHECK(montant_cible_centimes > 0),
        montant_epargne_centimes INTEGER NOT NULL
            DEFAULT 0
            CHECK(montant_epargne_centimes >= 0),
        date_echeance TEXT NOT NULL,
        created_at TEXT NOT NULL
            DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (utilisateur_id)
            REFERENCES utilisateurs(id)
            ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS
        idx_transactions_utilisateur
    ON transactions(utilisateur_id);

    CREATE INDEX IF NOT EXISTS
        idx_budgets_utilisateur
    ON budgets(utilisateur_id);

    CREATE INDEX IF NOT EXISTS
        idx_objectifs_epargne_utilisateur
    ON objectifs_epargne(utilisateur_id);
`);

console.log("Base de données BudgetZen initialisée !");

module.exports = db;