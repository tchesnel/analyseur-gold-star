/* =====================================================================
   LE FOURNIL DES CHAOUCHES — CONFIGURATION
   ---------------------------------------------------------------------
   C'est LE fichier à modifier pour mettre à jour le site :
   coordonnées, horaires, réception des commandes.
   (Les produits et les prix sont dans assets/js/produits.js)
   ===================================================================== */

window.FOURNIL_CONFIG = {
  nom: "Le Fournil des Chaouches",
  slogan: "Artisan Boulanger Pâtissier",

  // --- Coordonnées -------------------------------------------------------
  telephone: "05 59 42 22 21",          // affiché sur le site
  telephoneLien: "+33559422221",         // utilisé pour les liens « Appeler »

  // ⚠️ À CONFIRMER : la boulangerie n'a pas d'adresse e-mail publique.
  // Mettez ici la vraie adresse : c'est elle qui reçoit les commandes.
  email: "contact@lefournildeschaouches.fr",

  adresse: {
    rue: "1717 avenue du 11 Novembre 1918",
    codePostal: "40440",
    ville: "Ondres",
    departement: "Landes",
    lat: 43.5645309,
    lng: -1.4451559
  },

  facebook: "https://www.facebook.com/chaouches/",
  instagram: "",                         // ex. "https://www.instagram.com/..."

  googleAvis: {
    note: 4.6,
    nombre: 307,
    lien: "https://maps.google.com/?cid=3474382052241393305"
  },

  // --- Horaires (0 = dimanche … 6 = samedi) -----------------------------
  // Relevés sur la vitrine de la boutique : du lundi au samedi 7h–20h,
  // le dimanche 7h–13h. Mettre null pour un jour de fermeture.
  horaires: {
    0: ["07:00", "13:00"],
    1: ["07:00", "20:00"],
    2: ["07:00", "20:00"],
    3: ["07:00", "20:00"],
    4: ["07:00", "20:00"],
    5: ["07:00", "20:00"],
    6: ["07:00", "20:00"]
  },

  // Jours de fermeture exceptionnelle (congés), format "AAAA-MM-JJ"
  fermeturesExceptionnelles: [],

  // --- Commandes en ligne (Click & Collect) -----------------------------
  commande: {
    /* mode :
       "formsubmit" → la commande est envoyée par e-mail à l'adresse ci-dessus
                      via formsubmit.co (gratuit, sans serveur). La toute
                      première commande déclenche un e-mail d'activation à
                      valider une seule fois.
       "endpoint"   → la commande est envoyée (POST JSON) à l'URL ci-dessous
                      (votre propre serveur, Zapier, Make, n8n, etc.)
       "mailto"     → ouvre la messagerie du client avec la commande pré-remplie
       "demo"       → simule l'envoi (pour une présentation)
       Astuce : ajouter ?demo à l'adresse du site active le mode démo. */
    mode: "formsubmit",
    endpoint: "",

    delaiMinimumMinutes: 120,   // délai mini avant retrait (produits du jour)
    pasCreneauMinutes: 30,      // intervalle entre deux créneaux de retrait
    joursReservables: 14,       // jusqu'à combien de jours à l'avance
    paiement: "Paiement en boutique au moment du retrait (CB, espèces)."
  }
};
