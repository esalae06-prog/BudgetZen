document.addEventListener("DOMContentLoaded", () => {

    console.log("confirm-delete.js chargé");


    // Tous les formulaires avec la croix rouge
    const formulairesSuppression =
        document.querySelectorAll(".bz-delete-form");


    // Fenêtre personnalisée
    const modal =
        document.getElementById("deleteModal");


    // Bouton Annuler
    const boutonAnnuler =
        document.getElementById("cancelDelete");


    // Bouton Supprimer
    const boutonConfirmer =
        document.getElementById("confirmDelete");



    console.log(
        "Formulaires de suppression trouvés :",
        formulairesSuppression.length
    );



    // Vérification
    if (
        !modal ||
        !boutonAnnuler ||
        !boutonConfirmer
    ) {

        console.error(
            "Impossible de trouver la fenêtre de confirmation."
        );

        return;

    }



    // Formulaire que l'utilisateur veut supprimer
    let formulaireSelectionne = null;



    // ==================================================
    // CLIC SUR UNE CROIX ROUGE
    // ==================================================

    formulairesSuppression.forEach((formulaire) => {


        formulaire.addEventListener(
            "submit",
            (event) => {


                // Si la suppression a déjà été confirmée,
                // ne plus bloquer le formulaire.
                if (
                    formulaire.dataset.confirmed === "true"
                ) {

                    return;

                }



                // Empêcher la suppression immédiate
                event.preventDefault();



                // Mémoriser le formulaire concerné
                formulaireSelectionne =
                    formulaire;



                // Afficher la fenêtre
                modal.classList.add(
                    "visible"
                );



                modal.setAttribute(
                    "aria-hidden",
                    "false"
                );



                // Positionner le clavier sur Supprimer
                boutonConfirmer.focus();


            }
        );


    });



    // ==================================================
    // FERMER LA FENÊTRE
    // ==================================================

    function fermerModal() {


        modal.classList.remove(
            "visible"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        formulaireSelectionne =
            null;


    }



    // ==================================================
    // BOUTON ANNULER
    // ==================================================

    boutonAnnuler.addEventListener(
        "click",
        () => {


            fermerModal();


        }
    );



    // ==================================================
    // BOUTON SUPPRIMER
    // ==================================================

    boutonConfirmer.addEventListener(
        "click",
        () => {


            // Aucun formulaire choisi
            if (!formulaireSelectionne) {

                return;

            }



            const formulaire =
                formulaireSelectionne;



            // Indiquer que l'utilisateur
            // a réellement confirmé.
            formulaire.dataset.confirmed =
                "true";



            // Fermer la fenêtre
            modal.classList.remove(
                "visible"
            );



            /*
             * Envoyer réellement le formulaire.
             *
             * requestSubmit() permet de conserver
             * le fonctionnement normal du formulaire
             * et le token CSRF.
             */

            formulaire.requestSubmit();


        }
    );



    // ==================================================
    // CLIC SUR LE FOND GRIS
    // ==================================================

    modal.addEventListener(
        "click",
        (event) => {


            if (event.target === modal) {

                fermerModal();

            }


        }
    );



    // ==================================================
    // TOUCHE ÉCHAP
    // ==================================================

    document.addEventListener(
        "keydown",
        (event) => {


            if (
                event.key === "Escape" &&
                modal.classList.contains(
                    "visible"
                )
            ) {

                fermerModal();

            }


        }
    );


});