const galeries = document.querySelectorAll(".galerie-projet");

const lightbox = document.querySelector("#lightbox");
const imageLightbox = document.querySelector("#lightbox-image");
const zoneImage = document.querySelector(".zone-image-lightbox");

const descriptionLightbox = document.querySelector(
    "#lightbox-description"
);

const boutonFermer = document.querySelector(
    ".lightbox-fermer"
);

const boutonPrecedent = document.querySelector(
    ".lightbox-precedent"
);

const boutonSuivant = document.querySelector(
    ".lightbox-suivant"
);

const boutonZoomMoins = document.querySelector(
    "#zoom-moins"
);

const boutonZoomPlus = document.querySelector(
    "#zoom-plus"
);

const boutonZoomReinitialiser = document.querySelector(
    "#zoom-reinitialiser"
);

const affichageZoom = document.querySelector(
    "#niveau-zoom"
);


/* État de la galerie */

let imagesGalerieActive = [];
let imageActuelle = 0;
let dernierBoutonSelectionne = null;


/* État du zoom */

let niveauZoom = 1;
let deplacementX = 0;
let deplacementY = 0;


/* État du déplacement */

let deplacementEnCours = false;
let imageDeplacee = false;

let positionDepartX = 0;
let positionDepartY = 0;

let deplacementDepartX = 0;
let deplacementDepartY = 0;


/* Limiter l’image à l’intérieur de la zone visible */

function limiterDeplacement() {
    const largeurZone = zoneImage.clientWidth;
    const hauteurZone = zoneImage.clientHeight;

    const largeurImage =
        imageLightbox.clientWidth * niveauZoom;

    const hauteurImage =
        imageLightbox.clientHeight * niveauZoom;

    const limiteX = Math.max(
        0,
        (largeurImage - largeurZone) / 2
    );

    const limiteY = Math.max(
        0,
        (hauteurImage - hauteurZone) / 2
    );

    deplacementX = Math.min(
        limiteX,
        Math.max(-limiteX, deplacementX)
    );

    deplacementY = Math.min(
        limiteY,
        Math.max(-limiteY, deplacementY)
    );
}


/* Appliquer le zoom et le déplacement */

function appliquerTransformation() {
    limiterDeplacement();

    imageLightbox.style.transform =
        `translate(${deplacementX}px, ${deplacementY}px)
         scale(${niveauZoom})`;

    affichageZoom.textContent =
        `${Math.round(niveauZoom * 100)} %`;

    zoneImage.classList.toggle(
        "zoom-actif",
        niveauZoom > 1
    );
}


/* Modifier le niveau de zoom */

function modifierZoom(changement) {
    niveauZoom += changement;

    niveauZoom = Math.max(
        1,
        Math.min(4, niveauZoom)
    );

    if (niveauZoom === 1) {
        deplacementX = 0;
        deplacementY = 0;
    }

    appliquerTransformation();
}


/* Réinitialiser le zoom */

function reinitialiserZoom() {
    niveauZoom = 1;
    deplacementX = 0;
    deplacementY = 0;

    appliquerTransformation();
}


/* Zoom par clic ou toucher sur l’image */

function basculerZoom() {
    if (imageDeplacee) {
        imageDeplacee = false;
        return;
    }

    if (niveauZoom === 1) {
        niveauZoom = 2;
    } else {
        niveauZoom = 1;
        deplacementX = 0;
        deplacementY = 0;
    }

    appliquerTransformation();
}


/* Afficher une image */

function afficherImage(numero) {
    if (imagesGalerieActive.length === 0) {
        return;
    }

    if (numero < 0) {
        numero = imagesGalerieActive.length - 1;
    }

    if (numero >= imagesGalerieActive.length) {
        numero = 0;
    }

    imageActuelle = numero;

    const bouton = imagesGalerieActive[imageActuelle];
    const figure = bouton.closest("figure");
    const image = figure.querySelector("img");
    const legende = figure.querySelector("figcaption");

    imageLightbox.src = image.src;
    imageLightbox.alt = image.alt;

    descriptionLightbox.textContent = legende
        ? legende.textContent.trim()
        : image.alt;

    reinitialiserZoom();
}


/* Recalculer les limites après le chargement */

imageLightbox.addEventListener("load", () => {
    reinitialiserZoom();
});


/* Ouvrir la lightbox */

function ouvrirLightbox(boutonsGalerie, numero) {
    imagesGalerieActive = boutonsGalerie;
    dernierBoutonSelectionne = boutonsGalerie[numero];

    const plusieursImages =
        imagesGalerieActive.length > 1;

    boutonPrecedent.hidden = !plusieursImages;
    boutonSuivant.hidden = !plusieursImages;

    /*
       La lightbox est rendue visible avant le calcul
       des dimensions de l’image.
    */

    lightbox.classList.add("ouverte");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-active");

    afficherImage(numero);

    requestAnimationFrame(() => {
        reinitialiserZoom();
    });

    boutonFermer.focus();
}

/* Fermer la lightbox */

function fermerLightbox() {
    /*
       Réinitialiser pendant que la lightbox est encore
       visible permet de conserver des dimensions valides.
    */

    reinitialiserZoom();

    lightbox.classList.remove("ouverte");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-active");

    imageLightbox.src = "";
    imageLightbox.alt = "";
    descriptionLightbox.textContent = "";

    imagesGalerieActive = [];
    imageActuelle = 0;

    if (dernierBoutonSelectionne) {
        dernierBoutonSelectionne.focus();
    }
}

/* Navigation */

function afficherImagePrecedente() {
    afficherImage(imageActuelle - 1);
}

function afficherImageSuivante() {
    afficherImage(imageActuelle + 1);
}


/* Activation des galeries */

galeries.forEach((galerie) => {
    const boutonsGalerie = Array.from(
        galerie.querySelectorAll(".bouton-image")
    );

    boutonsGalerie.forEach((bouton, numero) => {
        bouton.addEventListener("click", () => {
            ouvrirLightbox(boutonsGalerie, numero);
        });
    });
});


/* Contrôles de navigation */

boutonPrecedent.addEventListener(
    "click",
    afficherImagePrecedente
);

boutonSuivant.addEventListener(
    "click",
    afficherImageSuivante
);

boutonFermer.addEventListener(
    "click",
    fermerLightbox
);


/* Contrôles de zoom */

boutonZoomPlus.addEventListener("click", () => {
    modifierZoom(0.25);
});

boutonZoomMoins.addEventListener("click", () => {
    modifierZoom(-0.25);
});

boutonZoomReinitialiser.addEventListener(
    "click",
    reinitialiserZoom
);


/* Deuxième clic sur l’image : zoom */

imageLightbox.addEventListener(
    "click",
    basculerZoom
);


/* Molette de la souris */

zoneImage.addEventListener(
    "wheel",
    (evenement) => {
        evenement.preventDefault();

        if (evenement.deltaY < 0) {
            modifierZoom(0.25);
        } else {
            modifierZoom(-0.25);
        }
    },
    {
        passive: false
    }
);


/* Déplacement avec la souris ou le doigt */

zoneImage.addEventListener(
    "pointerdown",
    (evenement) => {
        if (niveauZoom <= 1) {
            return;
        }

        deplacementEnCours = true;
        imageDeplacee = false;

        positionDepartX = evenement.clientX;
        positionDepartY = evenement.clientY;

        deplacementDepartX = deplacementX;
        deplacementDepartY = deplacementY;

        zoneImage.classList.add(
            "deplacement-actif"
        );

        zoneImage.setPointerCapture(
            evenement.pointerId
        );
    }
);

zoneImage.addEventListener(
    "pointermove",
    (evenement) => {
        if (!deplacementEnCours) {
            return;
        }

        const differenceX =
            evenement.clientX - positionDepartX;

        const differenceY =
            evenement.clientY - positionDepartY;

        if (
            Math.abs(differenceX) > 5 ||
            Math.abs(differenceY) > 5
        ) {
            imageDeplacee = true;
        }

        deplacementX =
            deplacementDepartX + differenceX;

        deplacementY =
            deplacementDepartY + differenceY;

        appliquerTransformation();
    }
);

function terminerDeplacement(evenement) {
    if (!deplacementEnCours) {
        return;
    }

    deplacementEnCours = false;

    zoneImage.classList.remove(
        "deplacement-actif"
    );

    if (
        zoneImage.hasPointerCapture(
            evenement.pointerId
        )
    ) {
        zoneImage.releasePointerCapture(
            evenement.pointerId
        );
    }

    setTimeout(() => {
        imageDeplacee = false;
    }, 100);
}

zoneImage.addEventListener(
    "pointerup",
    terminerDeplacement
);

zoneImage.addEventListener(
    "pointercancel",
    terminerDeplacement
);


/* Fermer en cliquant sur l’arrière-plan */

lightbox.addEventListener("click", (evenement) => {
    if (evenement.target === lightbox) {
        fermerLightbox();
    }
});


/* Recalculer lors d’un changement de taille */

window.addEventListener("resize", () => {
    if (lightbox.classList.contains("ouverte")) {
        appliquerTransformation();
    }
});


/* Commandes au clavier */

document.addEventListener("keydown", (evenement) => {
    if (!lightbox.classList.contains("ouverte")) {
        return;
    }

    if (evenement.key === "Escape") {
        fermerLightbox();
    }

    if (evenement.key === "ArrowLeft") {
        afficherImagePrecedente();
    }

    if (evenement.key === "ArrowRight") {
        afficherImageSuivante();
    }

    if (
        evenement.key === "+" ||
        evenement.key === "="
    ) {
        modifierZoom(0.25);
    }

    if (evenement.key === "-") {
        modifierZoom(-0.25);
    }

    if (evenement.key === "0") {
        reinitialiserZoom();
    }
});