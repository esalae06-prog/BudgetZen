require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const crypto = require("node:crypto");
const path = require("node:path");
const db = require("./db");

const SQLiteStore =
    require("better-sqlite3-session-store")(session);

const app = express();

const isProduction =
    process.env.NODE_ENV === "production";

const SESSION_COOKIE_NAME = "budgetzen.sid";


// ========================================
// 1. CONFIGURATION GÉNÉRALE
// ========================================

if (
    !process.env.SESSION_SECRET ||
    process.env.SESSION_SECRET.length < 32
) {
    throw new Error(
        "SESSION_SECRET manquant ou trop court dans .env"
    );
}


if (isProduction) {
    app.set("trust proxy", 1);
}


app.use(helmet());

app.disable("x-powered-by");


app.use(
    express.urlencoded({
        extended: false,
        limit: "10kb"
    })
);


app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


app.set(
    "views",
    path.join(__dirname, "views")
);

app.set("view engine", "ejs");


// ========================================
// 2. GESTION DES SESSIONS
// ========================================

app.use(
    session({
        name: SESSION_COOKIE_NAME,

        store: new SQLiteStore({
            client: db
        }),

        secret: process.env.SESSION_SECRET,

        resave: false,

        saveUninitialized: false,

        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: isProduction,
            maxAge: 60 * 60 * 1000
        }
    })
);


// Empêcher la mise en cache des pages privées
app.use((req, res, next) => {

    if (req.session?.utilisateurId) {

        res.set(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, private"
        );

        res.set("Pragma", "no-cache");
        res.set("Expires", "0");
    }

    next();
});


// ========================================
// 3. PROTECTION CSRF
// ========================================

function genererToken(req) {

    if (!req.session.csrfToken) {

        req.session.csrfToken =
            crypto
                .randomBytes(32)
                .toString("hex");
    }

    return req.session.csrfToken;
}


function verifierCsrf(req, res, next) {

    const attendu =
        Buffer.from(
            genererToken(req)
        );

    const recu =
        Buffer.from(
            typeof req.body._csrf === "string"
                ? req.body._csrf
                : ""
        );


    if (
        attendu.length !== recu.length ||
        !crypto.timingSafeEqual(
            attendu,
            recu
        )
    ) {

        return res
            .status(403)
            .send(
                "Formulaire non valide ou expiré."
            );
    }

    next();
}


// ========================================
// 4. PROTÉGER LES ROUTES PRIVÉES
// ========================================

function exigerConnexion(req, res, next) {

    if (!req.session.utilisateurId) {

        return res.redirect(
            "/connexion"
        );
    }

    next();
}


// ========================================
// 5. RATE LIMIT
// ========================================

const limiter = rateLimit({

    windowMs:
        15 * 60 * 1000,

    limit: 10,

    standardHeaders: "draft-8",

    legacyHeaders: false
});


// ========================================
// 6. PAGE D'ACCUEIL
// ========================================

app.get("/", (req, res) => {

    if (req.session.utilisateurId) {

        return res.redirect(
            "/dashboard"
        );
    }

    res.render("index");
});


// ========================================
// 7. PAGE D'INSCRIPTION
// ========================================

app.get(
    "/inscription",
    (req, res) => {

        if (req.session.utilisateurId) {

            return res.redirect(
                "/dashboard"
            );
        }

        res.render(
            "inscription",
            {
                erreur: null,
                succes: false,
                csrfToken:
                    genererToken(req)
            }
        );
    }
);


// ========================================
// 8. INSCRIPTION
// ========================================

app.post(
    "/inscription",
    limiter,
    verifierCsrf,

    async (req, res, next) => {

        const nom =
            typeof req.body.nom === "string"
                ? req.body.nom.trim()
                : "";

        const email =
            typeof req.body.email === "string"
                ? req.body.email
                    .trim()
                    .toLowerCase()
                : "";

        const password =
            typeof req.body.password === "string"
                ? req.body.password
                : "";

        const confirmation =
            typeof req.body.confirmation === "string"
                ? req.body.confirmation
                : "";


        function afficherErreur(message) {

            return res
                .status(400)
                .render(
                    "inscription",
                    {
                        erreur: message,
                        succes: false,
                        csrfToken:
                            genererToken(req)
                    }
                );
        }


        // Vérification nom + email
        if (
            nom.length < 2 ||
            nom.length > 80 ||
            email.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email
            )
        ) {

            return afficherErreur(
                "Nom ou adresse email invalide."
            );
        }


        // Mot de passe fort
        const motDePasseFort =

            password.length >= 16 &&

            /[A-Za-z]/.test(
                password
            ) &&

            /[0-9]/.test(
                password
            ) &&

            /[^A-Za-z0-9\s]/.test(
                password
            ) &&

            Buffer.byteLength(
                password,
                "utf8"
            ) <= 72;


        if (!motDePasseFort) {

            return afficherErreur(

                "Le mot de passe doit contenir au moins " +
                "16 caractères, une lettre, un chiffre et " +
                "un caractère spécial."
            );
        }


        if (
            password !== confirmation
        ) {

            return afficherErreur(
                "Les mots de passe ne correspondent pas."
            );
        }


        try {

            const existe =
                db.prepare(`
                    SELECT id
                    FROM utilisateurs
                    WHERE email = ?
                `).get(email);


            if (existe) {

                return afficherErreur(
                    "Cet email est déjà utilisé."
                );
            }


            const hash =
                await bcrypt.hash(
                    password,
                    12
                );


            const resultat =
                db.prepare(`
                    INSERT INTO utilisateurs
                    (
                        nom,
                        email,
                        mot_de_passe_hash
                    )
                    VALUES (?, ?, ?)
                `).run(
                    nom,
                    email,
                    hash
                );


            // Nouvelle session
            req.session.regenerate(
                (err) => {

                    if (err) {
                        return next(err);
                    }


                    req.session.utilisateurId =
                        Number(
                            resultat.lastInsertRowid
                        );


                    genererToken(req);


                    req.session.save(
                        (err) => {

                            if (err) {
                                return next(err);
                            }


                            res.redirect(
                                "/dashboard"
                            );
                        }
                    );
                }
            );

        } catch (error) {

            if (
                error.code ===
                "SQLITE_CONSTRAINT_UNIQUE"
            ) {

                return afficherErreur(
                    "Cet email est déjà utilisé."
                );
            }

            next(error);
        }
    }
);


// ========================================
// 9. PAGE DE CONNEXION
// ========================================

app.get(
    "/connexion",
    (req, res) => {

        if (req.session.utilisateurId) {

            return res.redirect(
                "/dashboard"
            );
        }


        res.render(
            "connexion",
            {
                erreur: null,

                csrfToken:
                    genererToken(req)
            }
        );
    }
);


// ========================================
// 10. AUTHENTIFICATION
// ========================================

app.post(
    "/connexion",
    limiter,
    verifierCsrf,

    async (req, res, next) => {

        try {

            const email =
                typeof req.body.email === "string"
                    ? req.body.email
                        .trim()
                        .toLowerCase()
                    : "";


            const password =
                typeof req.body.password === "string"
                    ? req.body.password
                    : "";


            const utilisateur =
                db.prepare(`
                    SELECT
                        id,
                        nom,
                        email,
                        mot_de_passe_hash
                    FROM utilisateurs
                    WHERE email = ?
                `).get(email);


            const valide =
                utilisateur
                    ? await bcrypt.compare(
                        password,
                        utilisateur
                            .mot_de_passe_hash
                    )
                    : false;


            if (!valide) {

                return res
                    .status(401)
                    .render(
                        "connexion",
                        {
                            erreur:
                                "Email ou mot de passe incorrect.",

                            csrfToken:
                                genererToken(req)
                        }
                    );
            }


            // Protection contre fixation de session
            req.session.regenerate(
                (err) => {

                    if (err) {
                        return next(err);
                    }


                    req.session.utilisateurId =
                        utilisateur.id;


                    genererToken(req);


                    req.session.save(
                        (err) => {

                            if (err) {
                                return next(err);
                            }


                            res.redirect(
                                "/dashboard"
                            );
                        }
                    );
                }
            );

        } catch (error) {

            next(error);
        }
    }
);


// ========================================
// 11. TABLEAU DE BORD
// ========================================

app.get(
    "/dashboard",
    exigerConnexion,

    (req, res, next) => {

        try {

            // Message temporaire transaction
            const erreurTransaction =
                req.session
                    .erreurTransaction ||
                null;


            const ancienneTransaction =
                req.session
                    .ancienneTransaction ||
                null;


            delete req.session
                .erreurTransaction;

            delete req.session
                .ancienneTransaction;


            const id =
                req.session
                    .utilisateurId;


            // Utilisateur
            const utilisateur =
                db.prepare(`
                    SELECT
                        id,
                        nom,
                        email
                    FROM utilisateurs
                    WHERE id = ?
                `).get(id);


            if (!utilisateur) {

                return req.session.destroy(
                    (err) => {

                        if (err) {
                            return next(err);
                        }

                        res.redirect(
                            "/connexion"
                        );
                    }
                );
            }


            const maintenant =
                new Date();


            const moisActuel =

                `${maintenant.getFullYear()}-${String(
                    maintenant.getMonth() + 1
                ).padStart(2, "0")}`;


            // ====================================
            // SOLDE TOTAL
            // ====================================

            const total =
                db.prepare(`
                    SELECT
                        COALESCE(
                            SUM(
                                CASE

                                    WHEN type = 'revenu'
                                    THEN montant_centimes

                                    ELSE -montant_centimes

                                END
                            ),
                            0
                        ) AS solde

                    FROM transactions

                    WHERE utilisateur_id = ?
                `).get(id);


            // ====================================
            // REVENUS / DÉPENSES DU MOIS
            // ====================================

            const statistiques =
                db.prepare(`
                    SELECT

                        COALESCE(
                            SUM(
                                CASE

                                    WHEN type = 'revenu'
                                    THEN montant_centimes

                                    ELSE 0

                                END
                            ),
                            0
                        ) AS revenus,


                        COALESCE(
                            SUM(
                                CASE

                                    WHEN type = 'depense'
                                    THEN montant_centimes

                                    ELSE 0

                                END
                            ),
                            0
                        ) AS depenses

                    FROM transactions

                    WHERE utilisateur_id = ?

                    AND substr(
                        date_transaction,
                        1,
                        7
                    ) = ?
                `).get(
                    id,
                    moisActuel
                );


            // ====================================
            // HISTORIQUE
            // ====================================

            const transactions =
                db.prepare(`
                    SELECT

                        id,
                        type,
                        montant_centimes,
                        categorie,
                        description,
                        date_transaction

                    FROM transactions

                    WHERE utilisateur_id = ?

                    ORDER BY
                        date_transaction DESC,
                        id DESC

                    LIMIT 10
                `).all(id);


            // ====================================
            // GRAPHIQUE 6 DERNIERS MOIS
            // ====================================

            const requeteMois =
                db.prepare(`
                    SELECT

                        COALESCE(
                            SUM(
                                CASE
                                    WHEN type = 'revenu'
                                    THEN montant_centimes
                                    ELSE 0
                                END
                            ),
                            0
                        ) AS revenus,


                        COALESCE(
                            SUM(
                                CASE
                                    WHEN type = 'depense'
                                    THEN montant_centimes
                                    ELSE 0
                                END
                            ),
                            0
                        ) AS depenses

                    FROM transactions

                    WHERE utilisateur_id = ?

                    AND substr(
                        date_transaction,
                        1,
                        7
                    ) = ?
                `);


            const graphique = [];


            for (
                let i = 5;
                i >= 0;
                i--
            ) {

                const date =
                    new Date(
                        maintenant.getFullYear(),
                        maintenant.getMonth() - i,
                        1
                    );


                const mois =

                    `${date.getFullYear()}-${String(
                        date.getMonth() + 1
                    ).padStart(2, "0")}`;


                const valeurs =
                    requeteMois.get(
                        id,
                        mois
                    );


                graphique.push({

                    label:
                        date.toLocaleDateString(
                            "fr-FR",
                            {
                                month: "short"
                            }
                        ),

                    revenus:
                        valeurs.revenus,

                    depenses:
                        valeurs.depenses
                });
            }


            const maximumGraphique =
                Math.max(

                    1,

                    ...graphique.map(
                        (m) =>
                            Math.max(
                                m.revenus,
                                m.depenses
                            )
                    )
                );


            // ====================================
            // RÉPARTITION DES DÉPENSES
            // ====================================

            const categories =
                db.prepare(`
                    SELECT

                        categorie,

                        SUM(
                            montant_centimes
                        ) AS total

                    FROM transactions

                    WHERE utilisateur_id = ?

                    AND type = 'depense'

                    AND substr(
                        date_transaction,
                        1,
                        7
                    ) = ?

                    GROUP BY categorie

                    ORDER BY total DESC
                `).all(
                    id,
                    moisActuel
                );


            let progression = 0;


            const repartition =
                categories.map(
                    (c) => {

                        const pourcentage =
                            statistiques.depenses > 0

                                ? (
                                    c.total /
                                    statistiques.depenses
                                ) * 100

                                : 0;


                        const segment = {

                            ...c,

                            pourcentage,

                            decalage:
                                progression
                        };


                        progression +=
                            pourcentage;


                        return segment;
                    }
                );


            // ====================================
            // BUDGET
            // ====================================

            const budget =
                db.prepare(`
                    SELECT
                        montant_limite_centimes

                    FROM budgets

                    WHERE utilisateur_id = ?

                    AND mois = ?
                `).get(
                    id,
                    moisActuel
                );


            const limite =
                budget
                    ? budget
                        .montant_limite_centimes
                    : 0;


            const utilisation =
                limite > 0

                    ? Math.min(
                        100,

                        Math.round(
                            statistiques.depenses /
                            limite *
                            100
                        )
                    )

                    : 0;


            // ====================================
            // FORMAT EUROS
            // ====================================

            const formatEuro =
                (centimes) =>

                    new Intl.NumberFormat(
                        "fr-FR",
                        {
                            style: "currency",
                            currency: "EUR"
                        }
                    ).format(
                        centimes / 100
                    );


            // ====================================
            // RENDU DASHBOARD
            // ====================================

            res.render(
                "dashboard",
                {

                    utilisateur,

                    csrfToken:
                        genererToken(req),

                    erreurTransaction,

                    ancienneTransaction,

                    solde:
                        total.solde,

                    statistiques,

                    transactions,

                    graphique,

                    maximumGraphique,

                    repartition,

                    limite,

                    utilisation,

                    formatEuro,

                    dateAujourdhui: [

                        maintenant
                            .getFullYear(),

                        String(
                            maintenant
                                .getMonth() + 1
                        ).padStart(
                            2,
                            "0"
                        ),

                        String(
                            maintenant
                                .getDate()
                        ).padStart(
                            2,
                            "0"
                        )

                    ].join("-")
                }
            );

        } catch (error) {

            next(error);
        }
    }
);


// ========================================
// 12. CONVERSION MONTANT
// ========================================

function convertirMontant(valeur) {

    if (
        typeof valeur !== "string"
    ) {

        return null;
    }


    const resultat =

        /^(\d{1,7})(?:[.,](\d{1,2}))?$/
            .exec(
                valeur.trim()
            );


    if (!resultat) {

        return null;
    }


    const euros =
        Number(
            resultat[1]
        );


    const centimes =
        Number(
            (
                resultat[2] || ""
            ).padEnd(
                2,
                "0"
            )
        );


    const total =
        euros * 100 +
        centimes;


    return (
        total > 0 &&
        total <= 100000000
    )
        ? total
        : null;
}


// ========================================
// 13. AJOUTER UNE TRANSACTION
// ========================================

app.post(
    "/transactions/ajouter",
    exigerConnexion,
    verifierCsrf,

    (req, res, next) => {

        try {

            const type =
                req.body.type;


            const montant =
                convertirMontant(
                    req.body.montant
                );


            const categorie =
                req.body.categorie;


            const description =

                typeof req.body
                    .description === "string"

                    ? req.body
                        .description
                        .trim()

                    : "";


            const date =
                req.body.date;


            // Fonction retour avec message
            function retourErreurTransaction(
                message
            ) {

                req.session
                    .erreurTransaction =
                    message;


                req.session
                    .ancienneTransaction =
                {
                    type:
                        typeof type === "string"
                            ? type
                            : "",

                    montant:
                        typeof req.body
                            .montant === "string"

                            ? req.body
                                .montant

                            : "",

                    categorie:
                        typeof categorie === "string"
                            ? categorie
                            : "",

                    description,

                    date:
                        typeof date === "string"
                            ? date
                            : ""
                };


                return req.session.save(
                    (err) => {

                        if (err) {

                            return next(err);
                        }


                        res.redirect(
                            303,
                            "/dashboard#ajout"
                        );
                    }
                );
            }


            const categoriesAutorisees =
            [
                "Salaire",
                "Autres revenus",
                "Alimentation",
                "Logement",
                "Transport",
                "Loisirs",
                "Santé",
                "Études",
                "Autres dépenses"
            ];


            const dateValide =

                typeof date === "string" &&

                /^\d{4}-\d{2}-\d{2}$/.test(
                    date
                ) &&

                !Number.isNaN(
                    Date.parse(date)
                ) &&

                new Date(date)
                    .toISOString()
                    .slice(0, 10) ===
                    date;


            if (
                ![
                    "revenu",
                    "depense"
                ].includes(type) ||

                montant === null ||

                !categoriesAutorisees
                    .includes(
                        categorie
                    ) ||

                description.length > 140 ||

                !dateValide
            ) {

                return retourErreurTransaction(

                    "Certaines informations sont invalides. " +
                    "Vérifiez le montant, la catégorie et la date."
                );
            }


            const estRevenu =
                [
                    "Salaire",
                    "Autres revenus"
                ].includes(
                    categorie
                );


            if (
                (type === "revenu") !==
                estRevenu
            ) {

                return retourErreurTransaction(

                    type === "revenu"

                        ? "Pour un revenu, choisissez « Salaire » ou « Autres revenus »."

                        : "Pour une dépense, choisissez une catégorie de dépense."
                );
            }


            db.prepare(`
                INSERT INTO transactions
                (
                    utilisateur_id,
                    type,
                    montant_centimes,
                    categorie,
                    description,
                    date_transaction
                )

                VALUES (?, ?, ?, ?, ?, ?)
            `).run(

                req.session
                    .utilisateurId,

                type,

                montant,

                categorie,

                description,

                date
            );


            res.redirect(
                303,
                "/dashboard#transactions"
            );

        } catch (error) {

            next(error);
        }
    }
);


// ========================================
// 14. SUPPRIMER UNE TRANSACTION
// ========================================

app.post(
    "/transactions/:id/supprimer",
    exigerConnexion,
    verifierCsrf,

    (req, res, next) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            if (
                !Number.isSafeInteger(
                    id
                ) ||
                id <= 0
            ) {

                return res
                    .status(400)
                    .send(
                        "Identifiant invalide."
                    );
            }


            db.prepare(`
                DELETE FROM transactions

                WHERE id = ?

                AND utilisateur_id = ?
            `).run(

                id,

                req.session
                    .utilisateurId
            );


            res.redirect(
                303,
                "/dashboard#transactions"
            );

        } catch (error) {

            next(error);
        }
    }
);


// ========================================
// 15. ENREGISTRER LE BUDGET
// ========================================

app.post(
    "/budget/enregistrer",
    exigerConnexion,
    verifierCsrf,

    (req, res, next) => {

        try {

            const montant =
                convertirMontant(
                    req.body.montant
                );


            if (
                montant === null
            ) {

                return res
                    .status(400)
                    .send(
                        "Montant du budget invalide."
                    );
            }


            const date =
                new Date();


            const mois =

                `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(2, "0")}`;


            db.prepare(`
                INSERT INTO budgets
                (
                    utilisateur_id,
                    montant_limite_centimes,
                    mois
                )

                VALUES (?, ?, ?)

                ON CONFLICT(
                    utilisateur_id,
                    mois
                )

                DO UPDATE SET

                    montant_limite_centimes =
                    excluded
                        .montant_limite_centimes
            `).run(

                req.session
                    .utilisateurId,

                montant,

                mois
            );


            res.redirect(
                303,
                "/dashboard#budget"
            );

        } catch (error) {

            next(error);
        }
    }
);


// ========================================
// 16. DÉCONNEXION
// ========================================

app.post(
    "/deconnexion",
    exigerConnexion,
    verifierCsrf,

    (req, res, next) => {

        req.session.destroy(
            (err) => {

                if (err) {

                    return next(err);
                }


                res.clearCookie(
                    SESSION_COOKIE_NAME,
                    {
                        httpOnly: true,
                        sameSite: "lax",
                        secure:
                            isProduction,
                        path: "/"
                    }
                );


                res.redirect(
                    "/connexion"
                );
            }
        );
    }
);


// ========================================
// 17. PAGE 404
// ========================================

app.use(
    (req, res) => {

        res
            .status(404)
            .render("404");
    }
);


// ========================================
// 18. GESTION GLOBALE DES ERREURS
// ========================================

app.use(
    (err, req, res, next) => {

        console.error(
            "Erreur interne :",
            err
        );


        if (
            res.headersSent
        ) {

            return next(err);
        }


        res
            .status(500)
            .render("500");
    }
);


// ========================================
// 19. DÉMARRAGE DU SERVEUR
// ========================================

const PORT =
    Number(
        process.env.PORT ||
        3000
    );


if (
    !Number.isInteger(PORT) ||
    PORT < 1 ||
    PORT > 65535
) {

    throw new Error(
        "PORT invalide dans les variables d'environnement."
    );
}


app.listen(
    PORT,
    () => {

        console.log(
            `Serveur lancé sur http://localhost:${PORT}`
        );
    }
);