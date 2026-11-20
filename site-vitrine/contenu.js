/* =====================================================================
   HEGO STUDIO — CONTENU DU SITE
   C'EST LE SEUL FICHIER À MODIFIER
   =====================================================================

   - Chaque texte existe en 3 langues côte à côte :
       pt = portugais (langue par défaut) · fr = français · en = anglais
   - Modifie uniquement ce qui est ENTRE LES GUILLEMETS "...".
   - Garde la virgule en fin de ligne, ne supprime pas les { } [ ].
   - *Entre étoiles* = mot écrit en italique élégant (police Bodoni).
   - Un texte simple sans pt/fr/en s'affiche pareil dans les 3 langues.
   - Les prix "à partir de" du haut de page sont calculés tout seuls
     à partir des tarifs : tu n'as à les changer qu'à un seul endroit.

   Page blanche après une modif ? Il manque une virgule ou un guillemet :
   annule ta dernière modification (voir GUIDE.md).
   ===================================================================== */

window.CONTENU = {

  /* -------------------------------------------------------------------
     1. TES INFORMATIONS
     ------------------------------------------------------------------- */
  marque: "HEGO STUDIO",
  activite: { pt: "Web & Social Media", fr: "Web & Social Média", en: "Web & Social Media" },
  pays: "Portugal · France",
  telephone: "+351 900 000 000",   // À REMPLACER — affiché tel quel
  whatsapp: "351900000000",        // À REMPLACER — même numéro, chiffres seulement, 351 devant
  email: "ola@example.com",        // À REMPLACER
  instagram: "",                   // À REMPLACER — ex. "https://instagram.com/hegostudio" (vide = caché)
  instagramPseudo: "",             // ex. "@hegostudio"
  livroReclamacoes: true,          // lien "Livro de Reclamações" en bas de page (obligatoire au Portugal)

  // Langues proposées, la première est celle par défaut. ["pt"] = portugais uniquement.
  langues: ["pt", "fr", "en"],

  /* -------------------------------------------------------------------
     2. OFFRE DE LANCEMENT (bandeau tout en haut)
     ------------------------------------------------------------------- */
  offre: {
    afficher: true,
    texte: {
      pt: "Oferta de lançamento · −20% para os 5 primeiros clientes",
      fr: "Offre de lancement · −20 % pour les 5 premiers clients",
      en: "Launch offer · 20% off for our first 5 clients"
    }
  },

  /* -------------------------------------------------------------------
     3. MENU
     ------------------------------------------------------------------- */
  menu: {
    services:     { pt: "Serviços",  fr: "Services",     en: "Services" },
    tarifs:       { pt: "Preços",    fr: "Tarifs",       en: "Pricing" },
    realisations: { pt: "Trabalhos", fr: "Réalisations", en: "Work" },
    studio:       { pt: "Estúdio",   fr: "Studio",       en: "Studio" },
    contact:      { pt: "Contacto",  fr: "Contact",      en: "Contact" }
  },

  /* -------------------------------------------------------------------
     4. HAUT DE PAGE
     lignes : les 3 grands mots, décalés comme ton logo
     ------------------------------------------------------------------- */
  accueil: {
    lignes: [
      "Web",
      "Social",
      { pt: "Vídeo", fr: "Vidéo", en: "Video" }
    ],
    phrase: {
      pt: "O look de uma grande agência. *O preço de um estúdio independente.*",
      fr: "L'image d'une grande agence. *Le prix d'un studio indépendant.*",
      en: "The look of a big agency. *The price of an independent studio.*"
    },
    texte: {
      pt: "Sites, redes sociais e vídeos para marcas, restaurantes, lojas e profissionais em Portugal e em França.",
      fr: "Sites, réseaux sociaux et vidéos pour les marques, restaurants, boutiques et indépendants au Portugal et en France.",
      en: "Websites, social media and video for brands, restaurants, shops and professionals in Portugal and France."
    },
    boutonPrincipal:  { pt: "Ver os preços",  fr: "Voir les tarifs",   en: "See pricing" },
    boutonSecondaire: { pt: "Pedir orçamento", fr: "Demander un devis", en: "Get a quote" }
  },

  // Mots qui défilent dans la bande blanche
  defilement: [
    { pt: "Sites web", fr: "Sites web", en: "Websites" },
    { pt: "Redes sociais", fr: "Réseaux sociaux", en: "Social media" },
    "Reels",
    { pt: "Fotografia", fr: "Photographie", en: "Photography" },
    { pt: "Criação de conteúdo", fr: "Création de contenu", en: "Content creation" },
    { pt: "Vídeo de marca", fr: "Vidéo de marque", en: "Brand film" }
  ],

  /* -------------------------------------------------------------------
     5. SERVICES (les 3 grandes lignes)
     onglet : "web", "social" ou "video" → ouvre le bon onglet des tarifs
     ------------------------------------------------------------------- */
  services: {
    surtitre: { pt: "Serviços", fr: "Services", en: "Services" },
    titre: {
      pt: "Três especialidades. *Um só estúdio.*",
      fr: "Trois expertises. *Un seul studio.*",
      en: "Three crafts. *One studio.*"
    },
    liste: [
      {
        onglet: "web",
        nom: { pt: "Sites web", fr: "Sites web", en: "Websites" },
        texte: {
          pt: "Sites elegantes, rápidos e pensados para o telemóvel. Do site vitrine à loja online.",
          fr: "Des sites élégants, rapides et pensés pour le mobile. Du site vitrine à la boutique en ligne.",
          en: "Elegant, fast, mobile-first websites. From a showcase site to a full online shop."
        },
        tags: [
          { pt: "Site vitrine", fr: "Site vitrine", en: "Showcase site" },
          { pt: "Loja online", fr: "E-commerce", en: "Online shop" },
          { pt: "SEO local", fr: "SEO local", en: "Local SEO" },
          "Google Maps"
        ]
      },
      {
        onglet: "social",
        nom: { pt: "Redes sociais", fr: "Réseaux sociaux", en: "Social media" },
        texte: {
          pt: "Gerimos o seu Instagram, Facebook e TikTok: estratégia, publicações, stories e resultados.",
          fr: "On gère votre Instagram, Facebook et TikTok : stratégie, publications, stories et résultats.",
          en: "We run your Instagram, Facebook and TikTok: strategy, posts, stories and results."
        },
        tags: ["Instagram", "Facebook", "TikTok", { pt: "Estratégia", fr: "Stratégie", en: "Strategy" }]
      },
      {
        onglet: "video",
        nom: { pt: "Vídeo & Reels", fr: "Vidéo & Reels", en: "Video & Reels" },
        texte: {
          pt: "Reels, vídeos de marca e fotografia. Filmamos no seu espaço e entregamos tudo pronto a publicar.",
          fr: "Reels, vidéos de marque et photo. On tourne chez vous et on livre tout prêt à publier.",
          en: "Reels, brand films and photography. We shoot on location and deliver everything ready to post."
        },
        tags: ["Reels", { pt: "Fotografia", fr: "Photo", en: "Photography" }, { pt: "Vídeo de marca", fr: "Film de marque", en: "Brand film" }, { pt: "Bastidores", fr: "Coulisses", en: "Behind the scenes" }]
      }
    ]
  },

  /* -------------------------------------------------------------------
     6. TARIFS
     ------------------------------------------------------------------- */
  tarifs: {
    surtitre: { pt: "Preços", fr: "Tarifs", en: "Pricing" },
    titre: {
      pt: "Preços claros. *Sem surpresas.*",
      fr: "Des prix clairs. *Sans surprise.*",
      en: "Clear prices. *No surprises.*"
    },
    texte: {
      pt: "Qualidade de agência a preços de estúdio. Escolha um pacote ou monte o seu.",
      fr: "La qualité d'une agence au prix d'un studio. Choisissez un forfait ou composez le vôtre.",
      en: "Agency quality at studio prices. Pick a package or build your own."
    },
    onglets: {
      web:    { pt: "Sites web",     fr: "Sites web",       en: "Websites" },
      social: { pt: "Redes sociais", fr: "Réseaux sociaux", en: "Social media" },
      video:  { pt: "Vídeo & foto",  fr: "Vidéo & photo",   en: "Video & photo" }
    },

    /* ----- 6a. SITES WEB (prix payé une fois) ----- */
    web: {
      formules: [
        {
          nom: { pt: "Site Vitrine", fr: "Site Vitrine", en: "Showcase Site" },
          prix: "349 €",
          description: {
            pt: "Uma página elegante para apresentar o seu negócio.",
            fr: "Une page élégante pour présenter votre activité.",
            en: "One elegant page to present your business."
          },
          inclus: [
            { pt: "Site de 1 página, design à medida", fr: "Site d'1 page, design sur mesure", en: "1-page site, custom design" },
            { pt: "Perfeito no telemóvel", fr: "Parfait sur mobile", en: "Perfect on mobile" },
            { pt: "Botões WhatsApp, chamada e mapa", fr: "Boutons WhatsApp, appel et carte", en: "WhatsApp, call and map buttons" },
            { pt: "Ficha Google Maps otimizada", fr: "Fiche Google Maps optimisée", en: "Optimised Google Maps listing" },
            { pt: "Online em 7 dias", fr: "En ligne en 7 jours", en: "Live in 7 days" }
          ]
        },
        {
          nom: { pt: "Site Pro", fr: "Site Pro", en: "Pro Site" },
          populaire: true,
          prix: "690 €",
          description: {
            pt: "Várias páginas para mostrar tudo o que faz.",
            fr: "Plusieurs pages pour montrer tout ce que vous faites.",
            en: "Several pages to show everything you do."
          },
          inclus: [
            { pt: "Até 6 páginas", fr: "Jusqu'à 6 pages", en: "Up to 6 pages" },
            { pt: "Galeria de fotos e vídeos", fr: "Galerie photos et vidéos", en: "Photo and video gallery" },
            { pt: "Bilingue (ex.: PT + EN)", fr: "Bilingue (ex. FR + PT)", en: "Bilingual (e.g. EN + PT)" },
            { pt: "Formulário de contacto e reservas", fr: "Formulaire de contact et réservations", en: "Contact and booking form" },
            { pt: "SEO local para aparecer no Google", fr: "SEO local pour sortir sur Google", en: "Local SEO to rank on Google" },
            { pt: "Online em 2 semanas", fr: "En ligne en 2 semaines", en: "Live in 2 weeks" }
          ]
        },
        {
          nom: { pt: "Loja Online", fr: "Boutique en ligne", en: "Online Shop" },
          prefixe: { pt: "desde", fr: "dès", en: "from" },
          prix: "1 290 €",
          description: {
            pt: "Venda os seus produtos 24 horas por dia.",
            fr: "Vendez vos produits 24 h/24.",
            en: "Sell your products around the clock."
          },
          inclus: [
            { pt: "Catálogo de produtos", fr: "Catalogue produits", en: "Product catalogue" },
            { pt: "Pagamento MB WAY, Multibanco e cartão", fr: "Paiement MB WAY, Multibanco et carte", en: "MB WAY, Multibanco and card payments" },
            { pt: "Gestão de encomendas e stock", fr: "Gestion des commandes et du stock", en: "Order and stock management" },
            { pt: "Formação para gerir a loja", fr: "Formation pour gérer la boutique", en: "Training to run the shop" },
            { pt: "Online em 3 a 4 semanas", fr: "En ligne en 3 à 4 semaines", en: "Live in 3 to 4 weeks" }
          ]
        }
      ],
      mensualite: {
        afficher: true,
        titre: { pt: "Alojamento & manutenção", fr: "Hébergement & maintenance", en: "Hosting & maintenance" },
        prix: "15 €",
        unite: { pt: "/mês", fr: "/mois", en: "/month" },
        texte: {
          pt: "Opcional. Alojamento, segurança, cópias de segurança e pequenas alterações (textos, preços, fotos).",
          fr: "Facultatif. Hébergement, sécurité, sauvegardes et petites modifications (textes, prix, photos).",
          en: "Optional. Hosting, security, backups and small edits (text, prices, photos)."
        }
      }
    },

    /* ----- 6b. RÉSEAUX SOCIAUX (forfaits mensuels) -----
       prix : un NOMBRE (sans €), ex. 149
       photos / reels / reseaux : servent au calculateur pour proposer le bon forfait */
    social: {
      unite: { pt: "/mês", fr: "/mois", en: "/month" },
      formules: [
        {
          nom: { pt: "Essencial", fr: "Essentiel", en: "Essential" },
          prix: 149, photos: 6, reels: 2, reseaux: 1,
          description: {
            pt: "Para marcar presença com regularidade.",
            fr: "Pour être présent avec régularité.",
            en: "To show up consistently."
          },
          inclus: [
            { pt: "1 rede (Instagram ou Facebook)", fr: "1 réseau (Instagram ou Facebook)", en: "1 network (Instagram or Facebook)" },
            { pt: "6 publicações foto ou carrossel", fr: "6 publications photo ou carrousel", en: "6 photo or carousel posts" },
            { pt: "2 reels filmados e editados", fr: "2 reels tournés et montés", en: "2 reels shot and edited" },
            { pt: "1 sessão de captação por mês (1 h)", fr: "1 séance de tournage par mois (1 h)", en: "1 shoot per month (1 h)" },
            { pt: "Legendas, hashtags e calendário", fr: "Légendes, hashtags et calendrier", en: "Captions, hashtags and calendar" }
          ]
        },
        {
          nom: { pt: "Crescimento", fr: "Croissance", en: "Growth" },
          populaire: true,
          prix: 249, photos: 8, reels: 4, reseaux: 2,
          description: {
            pt: "Para crescer e trazer mais clientes.",
            fr: "Pour grandir et attirer plus de clients.",
            en: "To grow and bring in more customers."
          },
          inclus: [
            { pt: "Instagram + Facebook", fr: "Instagram + Facebook", en: "Instagram + Facebook" },
            { pt: "8 publicações foto ou carrossel", fr: "8 publications photo ou carrousel", en: "8 photo or carousel posts" },
            { pt: "4 reels filmados e editados", fr: "4 reels tournés et montés", en: "4 reels shot and edited" },
            { pt: "Stories todas as semanas", fr: "Stories chaque semaine", en: "Weekly stories" },
            { pt: "1 sessão de captação por mês (2 h)", fr: "1 séance de tournage par mois (2 h)", en: "1 shoot per month (2 h)" },
            { pt: "Relatório mensal de resultados", fr: "Rapport mensuel de résultats", en: "Monthly results report" }
          ]
        },
        {
          nom: { pt: "Premium", fr: "Premium", en: "Premium" },
          prix: 449, photos: 12, reels: 8, reseaux: 3,
          description: {
            pt: "Para marcas que querem marcar a diferença.",
            fr: "Pour les marques qui veulent faire la différence.",
            en: "For brands that want to stand out."
          },
          inclus: [
            { pt: "Instagram, Facebook e TikTok", fr: "Instagram, Facebook et TikTok", en: "Instagram, Facebook and TikTok" },
            { pt: "12 publicações foto ou carrossel", fr: "12 publications photo ou carrousel", en: "12 photo or carousel posts" },
            { pt: "8 reels filmados e editados", fr: "8 reels tournés et montés", en: "8 reels shot and edited" },
            { pt: "Stories 3 vezes por semana", fr: "Stories 3 fois par semaine", en: "Stories 3 times a week" },
            { pt: "2 sessões de captação por mês", fr: "2 séances de tournage par mois", en: "2 shoots per month" },
            { pt: "Gestão de anúncios (orçamento à parte)", fr: "Gestion des publicités (budget en plus)", en: "Ad management (ad spend extra)" },
            { pt: "Reunião mensal de estratégia", fr: "Point stratégie mensuel", en: "Monthly strategy meeting" }
          ]
        }
      ],
      note: {
        pt: "Sem fidelização: pode parar quando quiser, com 30 dias de aviso.",
        fr: "Sans engagement : vous arrêtez quand vous voulez, avec 30 jours de préavis.",
        en: "No lock-in: stop whenever you like with 30 days' notice."
      },

      /* Calculateur "Composez votre pack"
         prix = base + photos × prixPhoto + reels × prixReel + (réseaux − 1) × prixReseau
         Le site compare automatiquement avec les forfaits ci-dessus (voir GUIDE.md). */
      calculateur: {
        afficher: true,
        base: 49,          // gestion, calendrier, légendes + 1 séance de tournage
        prixPhoto: 10,     // par publication photo / carrousel
        prixReel: 30,      // par reel
        prixReseau: 25,    // par réseau en plus du premier
        photos: { min: 2, max: 20, depart: 8 },
        reels:  { min: 0, max: 12, depart: 4 },
        reseaux: { min: 1, max: 3, depart: 2 }
      }
    },

    /* ----- 6c. VIDÉO & PHOTO À L'UNITÉ ----- */
    video: {
      liste: [
        {
          nom: { pt: "Reel", fr: "Reel", en: "Reel" },
          detail: { pt: "Filmagem + edição, até 30 s", fr: "Tournage + montage, jusqu'à 30 s", en: "Shoot + edit, up to 30 s" },
          prix: "69 €"
        },
        {
          nom: { pt: "Pack 4 reels", fr: "Pack 4 reels", en: "4-reel pack" },
          detail: { pt: "Filmados no mesmo dia", fr: "Tournés le même jour", en: "Shot on the same day" },
          prix: "229 €"
        },
        {
          nom: { pt: "Sessão fotográfica", fr: "Shooting photo", en: "Photo shoot" },
          detail: { pt: "1 h, 20 fotos editadas", fr: "1 h, 20 photos retouchées", en: "1 h, 20 edited photos" },
          prix: "99 €"
        },
        {
          nom: { pt: "Fotografia de produto", fr: "Photo produit", en: "Product photography" },
          detail: { pt: "Até 15 produtos, fundo neutro", fr: "Jusqu'à 15 produits, fond neutre", en: "Up to 15 products, plain background" },
          prix: "120 €"
        },
        {
          nom: { pt: "Vídeo de marca", fr: "Film de marque", en: "Brand film" },
          detail: { pt: "60 a 90 s, guião + filmagem + edição", fr: "60 à 90 s, script + tournage + montage", en: "60–90 s, script + shoot + edit" },
          prefixe: { pt: "desde", fr: "dès", en: "from" },
          prix: "290 €"
        },
        {
          nom: { pt: "Cobertura de evento", fr: "Couverture d'événement", en: "Event coverage" },
          detail: { pt: "Meio dia, fotos + aftermovie", fr: "Demi-journée, photos + aftermovie", en: "Half day, photos + aftermovie" },
          prefixe: { pt: "desde", fr: "dès", en: "from" },
          prix: "249 €"
        }
      ]
    },

    /* ----- 6d. PACK LANCEMENT (toujours visible sous les onglets) ----- */
    pack: {
      afficher: true,
      etiquette: { pt: "Pack Lançamento", fr: "Pack Lancement", en: "Launch Pack" },
      titre: {
        pt: "Site Vitrine + 3 meses de redes sociais *Essencial*",
        fr: "Site Vitrine + 3 mois de réseaux sociaux *Essentiel*",
        en: "Showcase Site + 3 months of *Essential* social media"
      },
      texte: {
        pt: "Tudo para lançar o seu negócio online, de uma vez.",
        fr: "Tout pour lancer votre activité en ligne, en une fois.",
        en: "Everything to launch your business online, in one go."
      },
      prix: "599 €",
      ancienPrix: "796 €"
    },

    note: {
      pt: "Sites: 50% no início, 50% na entrega. Redes sociais: pagamento mensal. MB WAY ou transferência.",
      fr: "Sites : 50 % au début, 50 % à la livraison. Réseaux sociaux : paiement mensuel. MB WAY ou virement.",
      en: "Websites: 50% upfront, 50% on delivery. Social media: billed monthly. MB WAY or bank transfer."
    }
  },

  /* -------------------------------------------------------------------
     7. RÉALISATIONS
     Remplace les images par tes fichiers HD (dossier images/realisations/).
     ------------------------------------------------------------------- */
  realisations: {
    surtitre: { pt: "Trabalhos", fr: "Réalisations", en: "Work" },
    titre: { pt: "Imagens que *vendem.*", fr: "Des images qui *vendent.*", en: "Visuals that *sell.*" },
    projets: [
      {
        client: "Vila Haritza",
        titre: { pt: "Lançamento da coleção Verão 2024", fr: "Lancement de la collection Été 2024", en: "Summer 2024 collection launch" },
        type: { pt: "Reels · Fotografia · Bastidores", fr: "Reels · Photo · Coulisses", en: "Reels · Photography · Behind the scenes" },
        lien: "",   // ex. lien vers le reel Instagram
        images: [
          "images/realisations/vila-haritza-1.jpg",
          "images/realisations/vila-haritza-3.jpg",
          "images/realisations/vila-haritza-2.jpg",
          "images/realisations/vila-haritza-4.jpg"
        ]
      }
    ],
    exemplesTitre: { pt: "Exemplos de sites", fr: "Exemples de sites", en: "Website examples" },
    exemplesTexte: {
      pt: "Três negócios fictícios, criados para mostrar o resultado. Abra-os no telemóvel.",
      fr: "Trois commerces fictifs, créés pour montrer le résultat. Ouvrez-les sur votre téléphone.",
      en: "Three made-up businesses, built to show the result. Open them on your phone."
    },
    exemples: [
      { nom: "Padaria do Bairro", type: { pt: "Padaria", fr: "Boulangerie", en: "Bakery" }, lien: "exemples/padaria.html", image: "images/exemplo-padaria.jpg" },
      { nom: "Barbearia Navalha", type: { pt: "Barbearia", fr: "Barbier", en: "Barber shop" }, lien: "exemples/barbearia.html", image: "images/exemplo-barbearia.jpg" },
      { nom: "Tasca da Esquina", type: { pt: "Restaurante", fr: "Restaurant", en: "Restaurant" }, lien: "exemples/tasca.html", image: "images/exemplo-tasca.jpg" }
    ]
  },

  /* -------------------------------------------------------------------
     8. MÉTHODE (étapes, dans l'ordre)
     ------------------------------------------------------------------- */
  processus: {
    surtitre: { pt: "Como trabalhamos", fr: "Notre méthode", en: "How we work" },
    etapes: [
      {
        titre: { pt: "Briefing", fr: "Brief", en: "Briefing" },
        texte: {
          pt: "Falamos do seu negócio, dos seus objetivos e do seu público. Gratuito e sem compromisso.",
          fr: "On parle de votre activité, de vos objectifs et de votre public. Gratuit et sans engagement.",
          en: "We talk about your business, goals and audience. Free, no commitment."
        }
      },
      {
        titre: { pt: "Proposta", fr: "Proposition", en: "Proposal" },
        texte: {
          pt: "Recebe em 48 h uma proposta clara, com preço fixo.",
          fr: "Vous recevez sous 48 h une proposition claire, à prix fixe.",
          en: "Within 48 hours you get a clear, fixed-price proposal."
        }
      },
      {
        titre: { pt: "Criação", fr: "Création", en: "Creation" },
        texte: {
          pt: "Design, filmagens e textos: tratamos de tudo e mostramos antes de publicar.",
          fr: "Design, tournages et textes : on s'occupe de tout et on vous montre avant de publier.",
          en: "Design, shoots and copy: we handle it all and show you before anything goes live."
        }
      },
      {
        titre: { pt: "Lançamento", fr: "Lancement", en: "Launch" },
        texte: {
          pt: "O seu site ou as suas redes ganham vida. Acompanhamos os resultados consigo.",
          fr: "Votre site ou vos réseaux prennent vie. On suit les résultats avec vous.",
          en: "Your site or socials go live, and we track the results with you."
        }
      }
    ]
  },

  /* -------------------------------------------------------------------
     9. LE STUDIO — vérifie que ces phrases te correspondent
     ------------------------------------------------------------------- */
  studio: {
    surtitre: { pt: "Estúdio", fr: "Studio", en: "Studio" },
    titre: {
      pt: "Uma imagem premium *não tem de custar uma fortuna.*",
      fr: "Une image premium *n'a pas à coûter une fortune.*",
      en: "A premium image *shouldn't cost a fortune.*"
    },
    paragraphes: [
      {
        pt: "A HEGO STUDIO é um estúdio criativo entre Portugal e França. Criamos sites, conteúdos e vídeos para marcas, restaurantes, lojas e profissionais que querem uma imagem à altura do seu trabalho.",
        fr: "HEGO STUDIO est un studio créatif entre le Portugal et la France. Nous créons des sites, des contenus et des vidéos pour les marques, restaurants, boutiques et indépendants qui veulent une image à la hauteur de leur travail.",
        en: "HEGO STUDIO is a creative studio between Portugal and France. We make websites, content and video for brands, restaurants, shops and professionals who want an image that matches their work."
      },
      {
        pt: "Sem intermediários nem estrutura pesada: fala diretamente com quem cria. É por isso que os nossos preços são justos.",
        fr: "Pas d'intermédiaires ni de grosse structure : vous parlez directement avec ceux qui créent. C'est pour ça que nos prix restent justes.",
        en: "No middlemen and no heavy overheads: you talk directly to the people who create. That's why our prices stay fair."
      }
    ],
    langues: {
      pt: "Falamos português, francês e inglês.",
      fr: "Nous parlons portugais, français et anglais.",
      en: "We speak Portuguese, French and English."
    }
  },

  /* -------------------------------------------------------------------
     10. QUESTIONS FRÉQUENTES
     ------------------------------------------------------------------- */
  faq: {
    surtitre: { pt: "Perguntas frequentes", fr: "Questions fréquentes", en: "FAQ" },
    liste: [
      {
        question: { pt: "Quanto tempo demora um site?", fr: "Combien de temps pour un site ?", en: "How long does a website take?" },
        reponse: {
          pt: "Site Vitrine: 7 dias. Site Pro: cerca de 2 semanas. Loja online: 3 a 4 semanas, a contar da receção dos conteúdos.",
          fr: "Site Vitrine : 7 jours. Site Pro : environ 2 semaines. Boutique en ligne : 3 à 4 semaines, à partir de la réception des contenus.",
          en: "Showcase Site: 7 days. Pro Site: about 2 weeks. Online shop: 3 to 4 weeks from when we receive your content."
        }
      },
      {
        question: { pt: "Os pacotes de redes sociais têm fidelização?", fr: "Les forfaits réseaux sociaux sont-ils avec engagement ?", en: "Are the social media packages a long-term contract?" },
        reponse: {
          pt: "Não. Pode parar quando quiser, com 30 dias de aviso. Recomendamos 3 meses para ver resultados reais.",
          fr: "Non. Vous arrêtez quand vous voulez, avec 30 jours de préavis. On conseille 3 mois pour voir de vrais résultats.",
          en: "No. Stop whenever you like with 30 days' notice. We recommend 3 months to see real results."
        }
      },
      {
        question: { pt: "Onde fazem as filmagens?", fr: "Où se passent les tournages ?", en: "Where do you shoot?" },
        reponse: {
          pt: "No seu espaço: loja, restaurante, atelier ou exterior. Em Portugal e em França.",
          fr: "Chez vous : boutique, restaurant, atelier ou en extérieur. Au Portugal et en France.",
          en: "At your place: shop, restaurant, studio or outdoors. In Portugal and France."
        }
      },
      {
        question: { pt: "O orçamento de publicidade está incluído?", fr: "Le budget publicitaire est-il inclus ?", en: "Is ad spend included?" },
        reponse: {
          pt: "Não. O valor pago ao Instagram ou ao Facebook é seu e decide quanto investir. No pacote Premium tratamos da criação e da gestão das campanhas.",
          fr: "Non. Le montant payé à Instagram ou Facebook reste le vôtre, vous décidez combien investir. Dans le forfait Premium, on s'occupe de créer et de gérer les campagnes.",
          en: "No. What you pay Instagram or Facebook is your own budget, and you decide how much. In the Premium package we create and manage the campaigns."
        }
      },
      {
        question: { pt: "O site fica em meu nome?", fr: "Le site est-il à mon nom ?", en: "Is the website in my name?" },
        reponse: {
          pt: "Sim. O domínio e o site são seus.",
          fr: "Oui. Le nom de domaine et le site vous appartiennent.",
          en: "Yes. The domain and the website are yours."
        }
      },
      {
        question: { pt: "Posso pagar em prestações?", fr: "Puis-je payer en plusieurs fois ?", en: "Can I pay in instalments?" },
        reponse: {
          pt: "Sim. Sites: 50% no início e 50% na entrega. Redes sociais: pagamento mensal.",
          fr: "Oui. Sites : 50 % au début et 50 % à la livraison. Réseaux sociaux : paiement mensuel.",
          en: "Yes. Websites: 50% upfront and 50% on delivery. Social media: billed monthly."
        }
      }
    ]
  },

  /* -------------------------------------------------------------------
     11. CONTACT
     ------------------------------------------------------------------- */
  contact: {
    lignes: [
      { pt: "Vamos", fr: "Parlons", en: "Let's" },
      { pt: "criar.", fr: "projet.", en: "create." }
    ],
    texte: {
      pt: "Orçamento gratuito em 24 h. Escreva-nos por WhatsApp, por mensagem no Instagram ou pelo formulário.",
      fr: "Devis gratuit sous 24 h. Écrivez-nous sur WhatsApp, en message privé sur Instagram ou via le formulaire.",
      en: "Free quote within 24 hours. Message us on WhatsApp, by Instagram DM or through the form."
    },
    zone: {
      pt: "Portugal & França · também à distância",
      fr: "Portugal & France · aussi à distance",
      en: "Portugal & France · remote too"
    }
  },

  /* -------------------------------------------------------------------
     12. PIED DE PAGE
     ------------------------------------------------------------------- */
  pied: {
    cookies: { pt: "Este site não usa cookies.", fr: "Ce site n'utilise pas de cookies.", en: "This website uses no cookies." }
  },

  /* -------------------------------------------------------------------
     13. PETITS TEXTES (boutons, formulaire, messages WhatsApp)
     {nom}, {commerce}, {service}, {message}, {formule}, {detail}
     sont remplacés automatiquement : ne les traduis pas.
     ------------------------------------------------------------------- */
  textes: {
    desde:           { pt: "desde", fr: "dès", en: "from" },
    chiffreWeb:      { pt: "Site web", fr: "Site web", en: "Website" },
    chiffreSocial:   { pt: "Redes sociais", fr: "Réseaux sociaux", en: "Social media" },
    chiffreVideo:    { pt: "Reel", fr: "Reel", en: "Reel" },
    populaire:       { pt: "Mais escolhido", fr: "Le plus choisi", en: "Most popular" },
    choisir:         { pt: "Escolher", fr: "Choisir", en: "Choose" },
    voirTarifs:      { pt: "Ver preços", fr: "Voir les prix", en: "See prices" },
    demander:        { pt: "Pedir", fr: "Demander", en: "Ask" },
    voirSite:        { pt: "Ver o site", fr: "Voir le site", en: "View site" },
    fictif:          { pt: "Fictício", fr: "Fictif", en: "Made-up" },
    calcTitre:       { pt: "Monte o seu pack", fr: "Composez votre pack", en: "Build your pack" },
    calcTexte:       { pt: "Escolha o que precisa por mês. O preço atualiza-se na hora.", fr: "Choisissez ce qu'il vous faut chaque mois. Le prix se met à jour en direct.", en: "Pick what you need each month. The price updates live." },
    calcPhotos:      { pt: "Publicações foto / carrossel", fr: "Publications photo / carrousel", en: "Photo / carousel posts" },
    calcReels:       { pt: "Reels", fr: "Reels", en: "Reels" },
    calcReseaux:     { pt: "Redes sociais", fr: "Réseaux sociaux", en: "Social networks" },
    calcTotal:       { pt: "O seu pack", fr: "Votre pack", en: "Your pack" },
    calcConseil:     { pt: "O pacote {formule} inclui tudo isto por {prix}. Poupa {economie}.", fr: "Le forfait {formule} inclut tout ça pour {prix}. Vous économisez {economie}.", en: "The {formule} package covers all of this for {prix}. You save {economie}." },
    calcBouton:      { pt: "Pedir este pack", fr: "Demander ce pack", en: "Request this pack" },
    economie:        { pt: "Poupa", fr: "Économisez", en: "Save" },
    au_lieu_de:      { pt: "em vez de", fr: "au lieu de", en: "instead of" },
    whatsapp:        { pt: "WhatsApp", fr: "WhatsApp", en: "WhatsApp" },
    email:           { pt: "Email", fr: "E-mail", en: "Email" },
    menu:            { pt: "Menu", fr: "Menu", en: "Menu" },
    champNom:        { pt: "Nome", fr: "Nom", en: "Name" },
    champCommerce:   { pt: "Empresa / marca", fr: "Entreprise / marque", en: "Business / brand" },
    champService:    { pt: "Serviço", fr: "Service", en: "Service" },
    champMessage:    { pt: "Mensagem (opcional)", fr: "Message (facultatif)", en: "Message (optional)" },
    envoyer:         { pt: "Enviar por WhatsApp", fr: "Envoyer sur WhatsApp", en: "Send on WhatsApp" },
    ouEmail:         { pt: "ou enviar por email", fr: "ou envoyer par e-mail", en: "or send by email" },
    champManquant:   { pt: "Indique o seu nome e a sua empresa.", fr: "Indiquez votre nom et votre entreprise.", en: "Please enter your name and business." },
    livro:           { pt: "Livro de Reclamações", fr: "Livre de réclamations", en: "Complaints Book" },
    messageGeneral: {
      pt: "Olá HEGO STUDIO! Gostava de pedir um orçamento.",
      fr: "Bonjour HEGO STUDIO ! J'aimerais demander un devis.",
      en: "Hello HEGO STUDIO! I'd like to request a quote."
    },
    messageFormule: {
      pt: "Olá! Tenho interesse no pacote {formule}. Podemos falar?",
      fr: "Bonjour ! Le forfait {formule} m'intéresse. On peut en parler ?",
      en: "Hello! I'm interested in the {formule} package. Can we talk?"
    },
    messageCalcul: {
      pt: "Olá! Montei um pack de redes sociais no vosso site: {detail}. Podemos falar?",
      fr: "Bonjour ! J'ai composé un pack réseaux sociaux sur votre site : {detail}. On peut en parler ?",
      en: "Hello! I built a social media pack on your website: {detail}. Can we talk?"
    },
    messageFormulaire: {
      pt: "Olá! Sou {nom}, de {commerce}. Interesse: {service}. {message}",
      fr: "Bonjour ! Je suis {nom}, de {commerce}. Intéressé(e) par : {service}. {message}",
      en: "Hello! I'm {nom} from {commerce}. Interested in: {service}. {message}"
    },
    messageDemo: {
      pt: "Olá! Vi o exemplo “{commerce}” no vosso site e gostava de um site assim.",
      fr: "Bonjour ! J'ai vu l'exemple « {commerce} » sur votre site et j'aimerais un site comme ça.",
      en: "Hello! I saw the “{commerce}” example on your website and I'd like a site like that."
    }
  }
};
