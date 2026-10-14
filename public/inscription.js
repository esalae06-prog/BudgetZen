"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const formulaire = document.querySelector("form");

    const password = document.getElementById("password");

    const confirmation = document.getElementById("confirmation");

    const messageErreur = document.getElementById("confirmation-error");

    if (
        !formulaire ||
        !password ||
        !confirmation ||
        !messageErreur
    ) {
        return;
    }

    function verifierConfirmation() {

        const identiques =
            password.value === confirmation.value;

        confirmation.setCustomValidity(
            identiques
                ? ""
                : "Les mots de passe ne correspondent pas."
        );

        messageErreur.hidden = identiques;
    }

    confirmation.addEventListener(
        "input",
        verifierConfirmation
    );

    password.addEventListener(
        "input",
        () => {

            if (confirmation.value) {
                verifierConfirmation();
            }

        }
    );

    formulaire.addEventListener(
        "submit",
        verifierConfirmation
    );

});