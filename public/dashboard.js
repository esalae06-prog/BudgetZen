document.addEventListener("DOMContentLoaded", () => {

    const typeSelect =
        document.getElementById("type");

    const categorieInput =
        document.getElementById("categorie");

    const listeCategories =
        document.getElementById("liste-categories");


    if (
        !typeSelect ||
        !categorieInput ||
        !listeCategories
    ) {
        return;
    }


    const categories = {

        depense: [
            "Alimentation",
            "Logement",
            "Transport",
            "Loisirs",
            "Santé",
            "Études",
            "Autres dépenses"
        ],

        revenu: [
            "Salaire",
            "Autres revenus"
        ]
    };


    function actualiserCategories() {

        const type =
            typeSelect.value;


        listeCategories.innerHTML = "";


        const valeurs =
            categories[type] || [];


        valeurs.forEach((categorie) => {

            const option =
                document.createElement("option");

            option.value =
                categorie;

            listeCategories.appendChild(
                option
            );
        });
    }


    typeSelect.addEventListener(
        "change",
        () => {

            /*
             * On vide la catégorie lorsqu'on
             * change revenu/dépense afin
             * d'éviter une incohérence.
             */
            categorieInput.value = "";

            actualiserCategories();
        }
    );


    actualiserCategories();
});