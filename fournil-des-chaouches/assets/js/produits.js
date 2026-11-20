/* =====================================================================
   LE FOURNIL DES CHAOUCHES — CATALOGUE
   ---------------------------------------------------------------------
   Pour chaque produit :
     prix       → en euros (ex. 1.1 = 1,10 €)
     photo      → facultatif : "assets/img/produits/ma-photo.jpg".
                  Si vide, une illustration est affichée à la place.
     delaiHeures→ délai de commande minimum (ex. 48 pour un gâteau entier)
     options    → variantes (taille, parfum…) avec leur propre prix
     dispo      → false pour masquer temporairement un produit
   ⚠️ Prix indicatifs à valider avec la boulangerie, sauf la baguette
   tradition et le gâteau basque 4 parts (tarifs cités par ICI Gascogne).
   ===================================================================== */

window.FOURNIL_CATEGORIES = [
  { id: "pains", nom: "Pains", accroche: "Pétris, façonnés et cuits ici, chaque jour" },
  { id: "viennoiseries", nom: "Viennoiseries", accroche: "Pur beurre, feuilletées à la main" },
  { id: "patisseries", nom: "Pâtisseries", accroche: "Le gâteau basque de la maison, et le reste" },
  { id: "snacking", nom: "Snacking", accroche: "Le midi, sur le pouce ou en terrasse" }
];

window.FOURNIL_PRODUITS = [
  /* ------------------------------ PAINS ------------------------------ */
  {
    id: "baguette-tradition",
    nom: "Baguette Tradition",
    categorie: "pains",
    prix: 1.10,
    unite: "la pièce",
    description: "La star de la maison, à la fois moelleuse et croustillante. Farine, eau, sel, du temps — et aucun additif, comme l'exige l'appellation « tradition ».",
    art: "baguette",
    badges: ["Meilleure des Landes 2022 & 2024"],
    vedette: true
  },
  {
    id: "baguette-classique",
    nom: "Baguette",
    categorie: "pains",
    prix: 1.00,
    unite: "la pièce",
    description: "La baguette de tous les jours, croustillante et dorée.",
    art: "baguette2"
  },
  {
    id: "demi-tradition",
    nom: "Demi-baguette Tradition",
    categorie: "pains",
    prix: 0.60,
    unite: "la pièce",
    description: "Notre tradition primée, en format solo.",
    art: "demi"
  },
  {
    id: "campagne-bio",
    nom: "Pain de campagne bio",
    categorie: "pains",
    prix: 3.60,
    unite: "≈ 500 g",
    description: "Farine bio, croûte épaisse, mie dense. Se garde plusieurs jours.",
    art: "boule",
    badges: ["Bio"]
  },
  {
    id: "graines-bio",
    nom: "Pain aux graines bio",
    categorie: "pains",
    prix: 3.90,
    unite: "≈ 450 g",
    description: "Tournesol, lin, sésame, courge : une mie riche et une croûte toastée.",
    art: "graines",
    badges: ["Bio"]
  },
  {
    id: "seigle-bio",
    nom: "Pain de seigle bio",
    categorie: "pains",
    prix: 3.80,
    unite: "≈ 450 g",
    description: "Dense, légèrement acidulé. Parfait avec fromages et fruits de mer.",
    art: "seigle",
    badges: ["Bio"]
  },
  {
    id: "cereales-bio",
    nom: "Pain multicéréales bio",
    categorie: "pains",
    prix: 3.90,
    unite: "≈ 450 g",
    description: "Un mélange de céréales bio pour une mie moelleuse et parfumée.",
    art: "cereales",
    badges: ["Bio"]
  },
  {
    id: "pain-chorizo",
    nom: "Pain au chorizo",
    categorie: "pains",
    prix: 3.20,
    unite: "la pièce",
    description: "Le chouchou des clients : généreux en chorizo, idéal pour l'apéro.",
    art: "chorizo",
    badges: ["Coup de cœur clients"],
    vedette: true
  },

  /* -------------------------- VIENNOISERIES -------------------------- */
  {
    id: "croissant",
    nom: "Croissant pur beurre",
    categorie: "viennoiseries",
    prix: 1.20,
    unite: "la pièce",
    description: "Pur beurre, feuilletage croustillant, cœur fondant.",
    art: "croissant",
    vedette: true
  },
  {
    id: "chocolatine",
    nom: "Chocolatine",
    categorie: "viennoiseries",
    prix: 1.30,
    unite: "la pièce",
    description: "Ici, on dit chocolatine. Deux barres de chocolat noir.",
    art: "chocolatine"
  },
  {
    id: "pain-raisins",
    nom: "Pain aux raisins",
    categorie: "viennoiseries",
    prix: 1.60,
    unite: "la pièce",
    description: "Crème pâtissière vanille et raisins moelleux.",
    art: "raisins"
  },
  {
    id: "chausson",
    nom: "Chausson aux pommes",
    categorie: "viennoiseries",
    prix: 1.80,
    unite: "la pièce",
    description: "Compote de pommes, feuilletage doré.",
    art: "chausson"
  },
  {
    id: "brioche",
    nom: "Brioche tressée",
    categorie: "viennoiseries",
    prix: 4.80,
    unite: "≈ 400 g",
    description: "Filante, beurrée, au sucre perlé. Le goûter du dimanche.",
    art: "brioche"
  },

  /* --------------------------- PÂTISSERIES --------------------------- */
  {
    id: "gateau-basque",
    nom: "Gâteau basque",
    categorie: "patisseries",
    prix: 10,
    unite: "",
    description: "Celui que la radio « recommande chaudement ». Pâte sablée beurrée, garniture généreuse.",
    art: "basque",
    badges: ["Recette maison"],
    vedette: true,
    options: [
      { id: "4", nom: "4 parts", prix: 10 },
      { id: "6", nom: "6 parts", prix: 15 },
      { id: "8", nom: "8 parts", prix: 20 }
    ],
    parfums: ["Crème pâtissière", "Cerise noire"],
    delaiHeures: 24
  },
  {
    id: "tarte-fruits",
    nom: "Tarte aux fruits de saison",
    categorie: "patisseries",
    prix: 18,
    unite: "6 parts",
    description: "Pâte sablée, crème d'amande, fruits du moment.",
    art: "tarte",
    delaiHeures: 24,
    options: [
      { id: "indiv", nom: "Tartelette individuelle", prix: 3.50 },
      { id: "6", nom: "Tarte 6 parts", prix: 18 },
      { id: "8", nom: "Tarte 8 parts", prix: 24 }
    ]
  },
  {
    id: "eclair",
    nom: "Éclair",
    categorie: "patisseries",
    prix: 3.20,
    unite: "la pièce",
    description: "Pâte à choux, crème onctueuse, glaçage brillant.",
    art: "eclair",
    parfums: ["Chocolat", "Café"]
  },
  {
    id: "flan",
    nom: "Flan pâtissier",
    categorie: "patisseries",
    prix: 2.90,
    unite: "la part",
    description: "Vanille, texture tremblotante, dessus caramélisé.",
    art: "flan"
  },
  {
    id: "entremets",
    nom: "Gâteau d'anniversaire",
    categorie: "patisseries",
    prix: 32,
    unite: "6–8 parts",
    description: "Entremets sur commande : chocolat, fraisier, framboisier… Précisez vos envies en commentaire.",
    art: "entremets",
    delaiHeures: 48,
    options: [
      { id: "6", nom: "6–8 parts", prix: 32 },
      { id: "10", nom: "10–12 parts", prix: 45 }
    ],
    parfums: ["Chocolat", "Fraisier", "Framboisier", "Selon vos envies"]
  },

  /* ----------------------------- SNACKING ----------------------------- */
  {
    id: "jambon-beurre",
    nom: "Jambon-beurre tradition",
    categorie: "snacking",
    prix: 4.50,
    unite: "",
    description: "Sur notre baguette tradition primée. Simple, parfait.",
    art: "sandwich"
  },
  {
    id: "sandwich-moment",
    nom: "Sandwich du moment",
    categorie: "snacking",
    prix: 5.90,
    unite: "",
    description: "Une recette qui change selon les saisons et l'humeur du fournil.",
    art: "sandwich2"
  },
  {
    id: "quiche",
    nom: "Quiche maison",
    categorie: "snacking",
    prix: 4.20,
    unite: "la part",
    description: "Pâte brisée maison, appareil crémeux, garniture du jour.",
    art: "quiche"
  },
  {
    id: "formule",
    nom: "Formule midi",
    categorie: "snacking",
    prix: 8.90,
    unite: "",
    description: "Sandwich ou quiche + boisson + pâtisserie au choix. À emporter ou en terrasse.",
    art: "formule",
    badges: ["Le midi"]
  }
];
