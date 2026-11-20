/* =====================================================================
   HEGO STUDIO · CONTENU DU SITE
   C'EST LE SEUL FICHIER À MODIFIER
   =====================================================================

   - Chaque texte existe en 3 langues côte à côte :
       pt = portugais (langue par défaut) · fr = français · en = anglais
   - Modifie uniquement ce qui est ENTRE LES GUILLEMETS "...".
   - Garde la virgule en fin de ligne, ne supprime pas les { } [ ].
   - *Entre étoiles* = texte en italique (police Bodoni).
   - Un texte simple sans pt/fr/en s'affiche pareil dans les 3 langues.
   - Les prix "à partir de" du haut de page se calculent tout seuls
     à partir des tarifs (section 6).

   Page avec un message d'erreur ? Il manque une virgule ou un guillemet
   près de ta dernière modification (voir le guide).
   ===================================================================== */

window.CONTENU = {

  /* -------------------------------------------------------------------
     1. TES INFORMATIONS
     ------------------------------------------------------------------- */
  marque: "HEGO STUDIO",
  activite: { pt: "Web & Social Media", fr: "Web & Social Média", en: "Web & Social Media" },
  pays: "Portugal · France",
  email: "hello.hegostudio@gmail.com",   // adresse affichée ET qui reçoit les demandes du formulaire

  // Formulaire de contact : les demandes arrivent par e-mail (service gratuit FormSubmit).
  // Après l'activation (voir le guide), FormSubmit t'envoie un code : colle-le ici
  // pour que ton adresse n'apparaisse plus dans le code du formulaire. Sinon, laisse "".
  formulaireCode: "",
  formulaireSujet: "Nouvelle demande de devis",   // objet des e-mails que tu reçois

  instagram: "https://www.instagram.com/hego_studio/",
  instagramPseudo: "@hego_studio",
  nif: "",                         // ton numéro fiscal (NIF), affiché en bas de page (obligation légale) : ex. "123456789"
  livroReclamacoes: true,          // lien "Livro de Reclamações" en bas de page (obligatoire au Portugal)

  // Langues proposées, la première est celle par défaut. ["pt"] = portugais uniquement.
  langues: ["pt", "fr", "en"],

  /* -------------------------------------------------------------------
     2. BANDEAU D'OFFRE (tout en haut) : afficher: true pour l'activer
     ------------------------------------------------------------------- */
  offre: {
    afficher: false,
    texte: {
      pt: "Oferta de lançamento: primeiro mês de manutenção oferecido",
      fr: "Offre de lancement : premier mois de maintenance offert",
      en: "Launch offer: first month of maintenance free"
    }
  },

  /* -------------------------------------------------------------------
     3. MENU
     ------------------------------------------------------------------- */
  menu: {
    services:     { pt: "Serviços",  fr: "Services",     en: "Services" },
    tarifs:       { pt: "Preços",    fr: "Tarifs",       en: "Pricing" },
    realisations: { pt: "Trabalhos", fr: "Réalisations", en: "Work" },
    studio:       { pt: "Quem somos", fr: "Qui sommes-nous", en: "About" },
    contact:      { pt: "Contacto",  fr: "Contact",      en: "Contact" }
  },

  /* -------------------------------------------------------------------
     4. HAUT DE PAGE
     ------------------------------------------------------------------- */
  accueil: {
    // les 3 grands mots décalés comme le logo (décoratifs)
    lignes: ["Web", "Social", { pt: "Vídeo", fr: "Vidéo", en: "Video" }],
    titre: {
      pt: "Criamos o site e gerimos as *redes sociais* do seu negócio.",
      fr: "Nous créons votre site et gérons vos *réseaux sociaux.*",
      en: "We build your website and run your *social media.*"
    },
    texte: {
      pt: "Para restaurantes, lojas, marcas e profissionais em Portugal e em França. Fotografia e vídeo feitos por nós, preço fechado antes de começar e um único contacto do início ao fim.",
      fr: "Pour les restaurants, boutiques, marques et indépendants au Portugal et en France. Photos et vidéos réalisées par nous, prix fixé avant de commencer et un seul interlocuteur du début à la fin.",
      en: "For restaurants, shops, brands and independent professionals in Portugal and France. Photos and video shot by us, a fixed price before we start and one point of contact from start to finish."
    },
    boutonPrincipal:  { pt: "Pedir orçamento", fr: "Demander un devis", en: "Get a quote" },
    boutonSecondaire: { pt: "Ver preços",      fr: "Voir les tarifs",   en: "See pricing" }
  },

  /* -------------------------------------------------------------------
     5. SERVICES
     onglet : "web", "social" ou "video" → ouvre le bon onglet des tarifs
     ------------------------------------------------------------------- */
  services: {
    surtitre: { pt: "Serviços", fr: "Services", en: "Services" },
    titre: { pt: "O que fazemos", fr: "Ce que nous faisons", en: "What we do" },
    liste: [
      {
        onglet: "web",
        nom: { pt: "Sites web", fr: "Sites web", en: "Websites" },
        texte: {
          pt: "Sites rápidos, bonitos no telemóvel e fáceis de encontrar no Google. Do site de uma página à loja online.",
          fr: "Des sites rapides, beaux sur mobile et faciles à trouver sur Google. Du site d'une page à la boutique en ligne.",
          en: "Fast websites that look good on a phone and are easy to find on Google. From a one-page site to an online shop."
        },
        tags: [
          { pt: "Site de apresentação", fr: "Site vitrine", en: "Showcase site" },
          { pt: "Loja online", fr: "Boutique en ligne", en: "Online shop" },
          "Google Maps",
          { pt: "Domínio e alojamento", fr: "Domaine et hébergement", en: "Domain and hosting" }
        ]
      },
      {
        onglet: "social",
        nom: { pt: "Redes sociais", fr: "Réseaux sociaux", en: "Social media" },
        texte: {
          pt: "Planeamos, criamos e publicamos o seu conteúdo no Instagram, Facebook e TikTok, com fotografias e vídeos feitos no seu espaço.",
          fr: "Nous planifions, créons et publions vos contenus sur Instagram, Facebook et TikTok, avec des photos et vidéos tournées chez vous.",
          en: "We plan, create and publish your content on Instagram, Facebook and TikTok, with photos and video shot at your place."
        },
        tags: ["Instagram", "Facebook", "TikTok", { pt: "Relatórios mensais", fr: "Rapports mensuels", en: "Monthly reports" }]
      },
      {
        onglet: "video",
        nom: { pt: "Foto & vídeo", fr: "Photo & vidéo", en: "Photo & video" },
        texte: {
          pt: "Reels, fotografia de produto e de espaço, vídeos de marca e cobertura de eventos.",
          fr: "Reels, photos de produits et de lieux, films de marque et couverture d'événements.",
          en: "Reels, product and venue photography, brand films and event coverage."
        },
        tags: ["Reels", { pt: "Fotografia", fr: "Photo", en: "Photography" }, { pt: "Vídeo de marca", fr: "Film de marque", en: "Brand film" }, { pt: "Eventos", fr: "Événements", en: "Events" }]
      }
    ]
  },

  /* -------------------------------------------------------------------
     6. TARIFS
     ------------------------------------------------------------------- */
  tarifs: {
    surtitre: { pt: "Preços", fr: "Tarifs", en: "Pricing" },
    titre: { pt: "Preços", fr: "Tarifs", en: "Pricing" },
    texte: {
      pt: "Valores fechados e confirmados por escrito antes de começarmos.",
      fr: "Des prix fixes, confirmés par écrit avant de commencer.",
      en: "Fixed prices, confirmed in writing before we start."
    },
    onglets: {
      web:    { pt: "Sites web",     fr: "Sites web",       en: "Websites" },
      social: { pt: "Redes sociais", fr: "Réseaux sociaux", en: "Social media" },
      video:  { pt: "Foto & vídeo",  fr: "Photo & vidéo",   en: "Photo & video" }
    },

    /* ----- 6a. SITES WEB -----
       prix = création (payée une fois) · mensuel = maintenance par mois */
    web: {
      libelleMensuel:  { pt: "manutenção", fr: "maintenance", en: "maintenance" },
      unite: { pt: "/mês", fr: "/mois", en: "/month" },
      formules: [
        {
          nom: { pt: "Site Essencial", fr: "Site Essentiel", en: "Essential Site" },
          prix: "390 €",
          mensuel: "19 €",
          description: {
            pt: "Uma página completa para apresentar o seu negócio.",
            fr: "Une page complète pour présenter votre activité.",
            en: "One complete page to present your business."
          },
          inclus: [
            { pt: "Design à medida, perfeito no telemóvel", fr: "Design sur mesure, parfait sur mobile", en: "Custom design, perfect on mobile" },
            { pt: "Horário, morada, mapa e contactos", fr: "Horaires, adresse, carte et contacts", en: "Opening hours, address, map and contact" },
            { pt: "Botões de WhatsApp e de chamada", fr: "Boutons WhatsApp et appel", en: "WhatsApp and call buttons" },
            { pt: "Ficha Google Maps otimizada", fr: "Fiche Google Maps optimisée", en: "Optimised Google Maps listing" },
            { pt: "Online em 10 dias", fr: "En ligne en 10 jours", en: "Live in 10 days" }
          ]
        },
        {
          nom: { pt: "Site Profissional", fr: "Site Professionnel", en: "Professional Site" },
          populaire: true,
          prix: "690 €",
          mensuel: "25 €",
          description: {
            pt: "Várias páginas para mostrar tudo o que faz.",
            fr: "Plusieurs pages pour montrer tout ce que vous faites.",
            en: "Several pages to show everything you do."
          },
          inclus: [
            { pt: "Até 6 páginas", fr: "Jusqu'à 6 pages", en: "Up to 6 pages" },
            { pt: "Em duas línguas", fr: "En deux langues", en: "In two languages" },
            { pt: "Galeria de fotografias e vídeos", fr: "Galerie photos et vidéos", en: "Photo and video gallery" },
            { pt: "Formulário de contacto ou de reservas", fr: "Formulaire de contact ou de réservation", en: "Contact or booking form" },
            { pt: "Otimização para pesquisas locais no Google", fr: "Optimisation pour les recherches locales sur Google", en: "Optimised for local Google searches" },
            { pt: "Online em 3 semanas", fr: "En ligne en 3 semaines", en: "Live in 3 weeks" }
          ]
        },
        {
          nom: { pt: "Loja Online", fr: "Boutique en ligne", en: "Online Shop" },
          prefixe: { pt: "desde", fr: "dès", en: "from" },
          prix: "990 €",
          mensuel: "35 €",
          description: {
            pt: "Para vender os seus produtos na internet.",
            fr: "Pour vendre vos produits sur internet.",
            en: "To sell your products online."
          },
          inclus: [
            { pt: "Até 50 produtos colocados por nós", fr: "Jusqu'à 50 produits mis en ligne par nous", en: "Up to 50 products added by us" },
            { pt: "Pagamento por MB WAY, Multibanco e cartão", fr: "Paiement MB WAY, Multibanco et carte", en: "MB WAY, Multibanco and card payments" },
            { pt: "Encomendas e stock geridos no telemóvel", fr: "Commandes et stock gérés depuis le téléphone", en: "Orders and stock managed from your phone" },
            { pt: "Formação de 1 hora para a sua equipa", fr: "Formation d'1 heure pour votre équipe", en: "1-hour training for your team" },
            { pt: "Online em 4 a 6 semanas", fr: "En ligne en 4 à 6 semaines", en: "Live in 4 to 6 weeks" }
          ],
          note: {
            pt: "Subscrição da plataforma de vendas paga à parte.",
            fr: "Abonnement à la plateforme de vente en supplément.",
            en: "Sales platform subscription billed separately."
          }
        }
      ],
      // Encadré "Ce que comprend la maintenance"
      maintenance: {
        titre: { pt: "A manutenção mensal inclui", fr: "La maintenance mensuelle comprend", en: "Monthly maintenance includes" },
        elements: [
          { pt: "Alojamento e domínio", fr: "Hébergement et nom de domaine", en: "Hosting and domain" },
          { pt: "Segurança e cópias de segurança", fr: "Sécurité et sauvegardes", en: "Security and backups" },
          { pt: "Até 1 hora de alterações por mês", fr: "Jusqu'à 1 heure de modifications par mois", en: "Up to 1 hour of changes per month" },
          { pt: "Apoio por email", fr: "Assistance par e-mail", en: "Support by email" }
        ],
        texte: {
          pt: "Compromisso de 12 meses, depois mês a mês.",
          fr: "Engagement de 12 mois, puis au mois.",
          en: "12-month commitment, then month to month."
        }
      }
    },

    /* ----- 6b. RÉSEAUX SOCIAUX (forfaits mensuels) -----
       prix : un NOMBRE (sans €), ex. 249 */
    social: {
      unite: { pt: "/mês", fr: "/mois", en: "/month" },
      formules: [
        {
          nom: { pt: "Presença", fr: "Présence", en: "Presence" },
          prix: 179,
          description: {
            pt: "Para publicar com regularidade numa rede.",
            fr: "Pour publier régulièrement sur un réseau.",
            en: "To post consistently on one network."
          },
          inclus: [
            { pt: "Instagram ou Facebook", fr: "Instagram ou Facebook", en: "Instagram or Facebook" },
            { pt: "8 publicações por mês, das quais 2 reels", fr: "8 publications par mois, dont 2 reels", en: "8 posts a month, including 2 reels" },
            { pt: "1 sessão de fotografia e vídeo por mês", fr: "1 séance photo et vidéo par mois", en: "1 photo and video shoot a month" },
            { pt: "Textos, hashtags e calendário", fr: "Textes, hashtags et calendrier", en: "Captions, hashtags and calendar" }
          ]
        },
        {
          nom: { pt: "Crescimento", fr: "Croissance", en: "Growth" },
          populaire: true,
          prix: 299,
          description: {
            pt: "Para crescer nas redes e trazer mais clientes.",
            fr: "Pour grandir sur les réseaux et attirer plus de clients.",
            en: "To grow your audience and bring in more customers."
          },
          inclus: [
            { pt: "Instagram e Facebook", fr: "Instagram et Facebook", en: "Instagram and Facebook" },
            { pt: "12 publicações por mês, das quais 4 reels", fr: "12 publications par mois, dont 4 reels", en: "12 posts a month, including 4 reels" },
            { pt: "Stories todas as semanas", fr: "Stories chaque semaine", en: "Stories every week" },
            { pt: "1 sessão de 2 horas por mês", fr: "1 séance de 2 heures par mois", en: "1 two-hour shoot a month" },
            { pt: "Relatório mensal de resultados", fr: "Rapport mensuel de résultats", en: "Monthly results report" }
          ]
        },
        {
          nom: { pt: "Premium", fr: "Premium", en: "Premium" },
          prix: 549,
          description: {
            pt: "Para marcas que querem estar presentes todos os dias.",
            fr: "Pour les marques qui veulent être présentes chaque jour.",
            en: "For brands that want to be present every day."
          },
          inclus: [
            { pt: "Instagram, Facebook e TikTok", fr: "Instagram, Facebook et TikTok", en: "Instagram, Facebook and TikTok" },
            { pt: "20 publicações por mês, das quais 8 reels", fr: "20 publications par mois, dont 8 reels", en: "20 posts a month, including 8 reels" },
            { pt: "Stories 3 vezes por semana", fr: "Stories 3 fois par semaine", en: "Stories 3 times a week" },
            { pt: "2 sessões de fotografia e vídeo por mês", fr: "2 séances photo et vidéo par mois", en: "2 photo and video shoots a month" },
            { pt: "Criação e gestão de anúncios", fr: "Création et gestion des publicités", en: "Ad creation and management" },
            { pt: "Reunião mensal de estratégia", fr: "Point stratégie mensuel", en: "Monthly strategy meeting" }
          ]
        }
      ],
      note: {
        pt: "Compromisso mínimo de 3 meses, depois pode parar com 30 dias de aviso. O orçamento dos anúncios pagos não está incluído.",
        fr: "Engagement minimum de 3 mois, puis arrêt possible avec 30 jours de préavis. Le budget des publicités payantes n'est pas inclus.",
        en: "3-month minimum, then cancel with 30 days' notice. Paid ad spend is not included."
      }
    },

    /* ----- 6c. PHOTO & VIDÉO À L'UNITÉ ----- */
    video: {
      liste: [
        {
          nom: { pt: "Reel", fr: "Reel", en: "Reel" },
          detail: { pt: "Filmagem e edição, até 30 segundos", fr: "Tournage et montage, jusqu'à 30 secondes", en: "Shoot and edit, up to 30 seconds" },
          prix: "79 €"
        },
        {
          nom: { pt: "4 reels", fr: "4 reels", en: "4 reels" },
          detail: { pt: "Filmados no mesmo dia", fr: "Tournés le même jour", en: "Shot on the same day" },
          prix: "249 €"
        },
        {
          nom: { pt: "Sessão fotográfica", fr: "Séance photo", en: "Photo shoot" },
          detail: { pt: "1 hora, 20 fotografias editadas", fr: "1 heure, 20 photos retouchées", en: "1 hour, 20 edited photos" },
          prix: "129 €"
        },
        {
          nom: { pt: "Fotografia de produto", fr: "Photo produit", en: "Product photography" },
          detail: { pt: "Até 20 produtos, fundo neutro", fr: "Jusqu'à 20 produits, fond neutre", en: "Up to 20 products, plain background" },
          prix: "169 €"
        },
        {
          nom: { pt: "Vídeo de marca", fr: "Film de marque", en: "Brand film" },
          detail: { pt: "60 a 90 segundos, guião, filmagem e edição", fr: "60 à 90 secondes, script, tournage et montage", en: "60 to 90 seconds, script, shoot and edit" },
          prefixe: { pt: "desde", fr: "dès", en: "from" },
          prix: "390 €"
        },
        {
          nom: { pt: "Cobertura de evento", fr: "Couverture d'événement", en: "Event coverage" },
          detail: { pt: "Meio dia, fotografias e vídeo resumo", fr: "Demi-journée, photos et vidéo résumé", en: "Half day, photos and highlight video" },
          prefixe: { pt: "desde", fr: "dès", en: "from" },
          prix: "290 €"
        }
      ]
    },

    /* ----- 6d. PACK (toujours visible sous les onglets) ----- */
    pack: {
      afficher: true,
      etiquette: { pt: "Pack Arranque", fr: "Pack Démarrage", en: "Starter Pack" },
      titre: {
        pt: "Site Essencial, 3 meses de redes sociais e uma sessão fotográfica",
        fr: "Site Essentiel, 3 mois de réseaux sociaux et une séance photo",
        en: "Essential Site, 3 months of social media and a photo shoot"
      },
      texte: {
        pt: "Tudo o que precisa para começar bem. Manutenção do site incluída nos 3 primeiros meses.",
        fr: "Tout ce qu'il faut pour bien démarrer. Maintenance du site incluse les 3 premiers mois.",
        en: "Everything you need to start well. Website maintenance included for the first 3 months."
      },
      prix: "890 €",
      ancienPrix: "1 113 €"
    },

    note: {
      pt: "Criação de sites: 50% na adjudicação e 50% na entrega, ou 3 prestações sem juros. IVA à taxa legal em vigor, se aplicável.",
      fr: "Création de sites : 50 % à la commande et 50 % à la livraison, ou en 3 fois sans frais. TVA au taux en vigueur, le cas échéant.",
      en: "Website builds: 50% on order and 50% on delivery, or 3 interest-free instalments. VAT at the applicable rate, if due."
    }
  },

  /* -------------------------------------------------------------------
     7. RÉALISATIONS
     Pour ajouter un projet : copie un bloc { nom: ... }, colle-le après
     le dernier (avec une virgule entre les deux) et change les textes.
     Image : capture au format paysage, dans images/realisations/
     ------------------------------------------------------------------- */
  realisations: {
    titre: { pt: "Trabalhos recentes", fr: "Réalisations récentes", en: "Recent work" },
    projets: [
      {
        nom: "Cysta",
        categorie: { pt: "Aplicação web · SOP", fr: "Application web · SOPK", en: "Web app · PCOS" },
        phrase: {
          pt: "O acompanhamento do ciclo, todos os dias.",
          fr: "Le suivi du cycle au quotidien.",
          en: "Everyday cycle tracking."
        },
        texte: {
          pt: "Aplicação para mulheres com síndrome do ovário poliquístico: registo diário em 60 segundos, previsões de ciclo e relatório para o ginecologista.",
          fr: "Application pour les femmes atteintes du SOPK : check-in quotidien en 60 secondes, prédictions du cycle et rapport pour le gynécologue.",
          en: "An app for women with PCOS: a 60-second daily check-in, cycle predictions and a report for their gynaecologist."
        },
        lien: "https://cysta-app.com",
        lienTexte: "cysta-app.com",
        image: "images/realisations/cysta.jpg"
      },
      {
        nom: "Loggio",
        categorie: { pt: "Plataforma imobiliária", fr: "Plateforme immobilière", en: "Real estate platform" },
        phrase: {
          pt: "Procurar ou arrendar um imóvel.",
          fr: "Chercher ou louer son bien.",
          en: "Find a home or rent one out."
        },
        texte: {
          pt: "Arrendamento entre particulares com identidades verificadas, candidaturas autenticadas e contrato assinado online.",
          fr: "Location entre particuliers avec identités vérifiées, dossiers authentifiés et bail signé en ligne.",
          en: "Peer-to-peer rentals with verified identities, authenticated applications and leases signed online."
        },
        lien: "https://loggio.fr",
        lienTexte: "loggio.fr",
        image: "images/realisations/loggio.jpg"
      },
      {
        nom: "Vila Haritza",
        categorie: { pt: "Marca de roupa", fr: "Marque de vêtements", en: "Clothing brand" },
        phrase: {
          pt: "Criação do site e gestão das redes sociais.",
          fr: "Création du site web et gestion des réseaux sociaux.",
          en: "Website and social media management."
        },
        texte: {
          pt: "Lançamento da coleção Verão 2024: reels, fotografia e bastidores das sessões na praia.",
          fr: "Lancement de la collection Été 2024 : reels, photos et coulisses des tournages à la plage.",
          en: "Summer 2024 collection launch: reels, photography and behind the scenes of the beach shoots."
        },
        lien: "https://instagram.com/vila.haritza",
        lienTexte: "@vila.haritza",
        image: "images/realisations/vila-haritza.jpg"
      }
    ],
    // Avis clients (affichés sous les réalisations)
    temoignagesTitre: { pt: "O que dizem os clientes", fr: "Ce que disent nos clients", en: "What our clients say" },
    temoignages: [
      {
        nom: "Marie",
        entreprise: "Cysta",
        texte: {
          pt: "Um grande agradecimento pelo nosso site Cysta, que nos ajudou realmente a ganhar visibilidade e a ter sucesso.",
          fr: "Merci pour notre site web Cysta, qui nous a réellement aidés pour notre visibilité et notre réussite.",
          en: "Thank you for our Cysta website, which genuinely helped our visibility and our success."
        }
      },
      {
        nom: "Mathieu",
        entreprise: "Loggio",
        texte: {
          pt: "Um site muito profissional, uma equipa muito rápida a responder e os nossos pedidos respeitados à letra. Um grande obrigado por tudo!",
          fr: "Merci pour notre site web : très pro, très réactif, et nos demandes respectées à la lettre. Merci pour tout !",
          en: "Thank you for our website: very professional, very responsive and our requests followed to the letter. Thanks for everything!"
        }
      },
      {
        nom: "Antoine",
        entreprise: "Vila Haritza",
        texte: {
          pt: "Uma campanha incrível e um site fantástico. Um grande obrigado à HEGO STUDIO pelo profissionalismo!",
          fr: "Merci pour cette superbe campagne et ce merveilleux site web. Merci à HEGO STUDIO pour leur professionnalisme !",
          en: "Thank you for this superb campaign and this wonderful website. Thank you to HEGO STUDIO for their professionalism!"
        }
      }
    ],

    // Sites d'exemple fictifs (boulangerie, barbier, restaurant) : masqués sur la page
    // d'accueil, mais toujours en ligne pour les montrer en prospection :
    // ton-site/exemples/padaria.html · barbearia.html · tasca.html
    afficherExemples: false,
    exemplesTitre: { pt: "Exemplos para comércio local", fr: "Exemples pour le commerce de proximité", en: "Examples for local businesses" },
    exemplesTexte: {
      pt: "Três sites de demonstração. Os negócios são fictícios.",
      fr: "Trois sites de démonstration. Les commerces sont fictifs.",
      en: "Three demo websites. The businesses are made up."
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
    titre: { pt: "Como trabalhamos", fr: "Comment nous travaillons", en: "How we work" },
    etapes: [
      {
        titre: { pt: "Conversa", fr: "Échange", en: "Call" },
        texte: {
          pt: "Uma chamada ou um café para perceber o seu negócio e o que precisa. Sem compromisso.",
          fr: "Un appel ou un café pour comprendre votre activité et vos besoins. Sans engagement.",
          en: "A call or a coffee to understand your business and what you need. No commitment."
        }
      },
      {
        titre: { pt: "Proposta", fr: "Proposition", en: "Proposal" },
        texte: {
          pt: "Enviamos em 24 horas uma proposta escrita com o preço final e o prazo.",
          fr: "Sous 24 heures, vous recevez une proposition écrite avec le prix final et le délai.",
          en: "Within 24 hours you get a written proposal with the final price and timeline."
        }
      },
      {
        titre: { pt: "Produção", fr: "Production", en: "Production" },
        texte: {
          pt: "Criamos o site ou o conteúdo e mostramos-lhe tudo antes de publicar.",
          fr: "Nous créons le site ou les contenus et vous montrons tout avant de publier.",
          en: "We build the site or the content and show you everything before it goes live."
        }
      },
      {
        titre: { pt: "Acompanhamento", fr: "Suivi", en: "Follow-up" },
        texte: {
          pt: "Depois de publicar, continuamos disponíveis por email para qualquer alteração.",
          fr: "Après la mise en ligne, nous restons joignables par e-mail pour toute modification.",
          en: "Once it's live, we stay available by email for any changes."
        }
      }
    ]
  },

  /* -------------------------------------------------------------------
     9. QUI SOMMES-NOUS : vérifie que ces phrases te correspondent
     ------------------------------------------------------------------- */
  studio: {
    surtitre: { pt: "Quem somos", fr: "Qui sommes-nous", en: "About us" },
    titre: "Thomas & Lydia",
    photo: "images/thomas-lydia.jpg",
    legende: { pt: "Fundadores da HEGO STUDIO", fr: "Fondateurs de HEGO STUDIO", en: "Founders of HEGO STUDIO" },
    paragraphes: [
      {
        pt: "Somos Thomas e Lydia, os fundadores da HEGO STUDIO. Trabalhamos entre Portugal e França: fazemos sites, gerimos redes sociais e produzimos fotografia e vídeo para restaurantes, lojas, marcas e profissionais independentes.",
        fr: "Nous sommes Thomas et Lydia, les fondateurs de HEGO STUDIO. Nous travaillons entre le Portugal et la France : nous créons des sites, gérons des réseaux sociaux et produisons photos et vidéos pour des restaurants, boutiques, marques et indépendants.",
        en: "We're Thomas and Lydia, the founders of HEGO STUDIO. We work between Portugal and France, building websites, running social media and producing photos and video for restaurants, shops, brands and independent professionals."
      },
      {
        pt: "Trabalhamos com poucos clientes de cada vez, para responder depressa e acompanhar cada projeto de perto. Fala sempre connosco diretamente, do primeiro contacto à entrega.",
        fr: "Nous travaillons avec peu de clients à la fois, pour répondre vite et suivre chaque projet de près. Vous parlez toujours directement avec nous, du premier contact à la livraison.",
        en: "We take on a few clients at a time, so we can reply quickly and follow each project closely. You always deal with us directly, from first contact to delivery."
      }
    ]
  },

  /* -------------------------------------------------------------------
     10. QUESTIONS FRÉQUENTES
     ------------------------------------------------------------------- */
  faq: {
    surtitre: { pt: "Perguntas frequentes", fr: "Questions fréquentes", en: "FAQ" },
    titre: { pt: "Perguntas frequentes", fr: "Questions fréquentes", en: "Frequently asked questions" },
    liste: [
      {
        question: { pt: "O que inclui a manutenção mensal do site?", fr: "Que comprend la maintenance mensuelle du site ?", en: "What does the monthly website maintenance include?" },
        reponse: {
          pt: "Alojamento, domínio, certificado de segurança, cópias de segurança e até 1 hora por mês de alterações: textos, fotografias, preços ou horários. Basta enviar-nos uma mensagem.",
          fr: "L'hébergement, le nom de domaine, le certificat de sécurité, les sauvegardes et jusqu'à 1 heure de modifications par mois : textes, photos, prix ou horaires. Il suffit de nous envoyer un message.",
          en: "Hosting, domain, security certificate, backups and up to 1 hour of changes a month: text, photos, prices or opening hours. Just send us a message."
        }
      },
      {
        question: { pt: "Quanto tempo demora um site?", fr: "Combien de temps faut-il pour un site ?", en: "How long does a website take?" },
        reponse: {
          pt: "Site Essencial: 10 dias. Site Profissional: 3 semanas. Loja online: 4 a 6 semanas. Os prazos contam a partir da receção dos textos e das fotografias.",
          fr: "Site Essentiel : 10 jours. Site Professionnel : 3 semaines. Boutique en ligne : 4 à 6 semaines. Les délais commencent à la réception des textes et des photos.",
          en: "Essential Site: 10 days. Professional Site: 3 weeks. Online shop: 4 to 6 weeks, counted from when we receive your text and photos."
        }
      },
      {
        question: { pt: "O site fica em meu nome?", fr: "Le site est-il à mon nom ?", en: "Is the website in my name?" },
        reponse: {
          pt: "Sim. O domínio é registado em seu nome e o site é seu. Se um dia quiser sair, entregamos-lhe todos os ficheiros.",
          fr: "Oui. Le nom de domaine est enregistré à votre nom et le site vous appartient. Si un jour vous partez, nous vous remettons tous les fichiers.",
          en: "Yes. The domain is registered in your name and the website is yours. If you ever leave, we hand over all the files."
        }
      },
      {
        question: { pt: "Posso cancelar?", fr: "Puis-je arrêter ?", en: "Can I cancel?" },
        reponse: {
          pt: "A manutenção do site tem um compromisso de 12 meses e depois é mês a mês. As redes sociais têm um mínimo de 3 meses e depois pode parar com 30 dias de aviso.",
          fr: "La maintenance du site est sur 12 mois, puis au mois. Les réseaux sociaux ont un minimum de 3 mois, puis vous pouvez arrêter avec 30 jours de préavis.",
          en: "Website maintenance has a 12-month commitment, then runs month to month. Social media has a 3-month minimum, then you can stop with 30 days' notice."
        }
      },
      {
        question: { pt: "Quem faz as fotografias e os vídeos?", fr: "Qui fait les photos et les vidéos ?", en: "Who takes the photos and videos?" },
        reponse: {
          pt: "Nós. Vamos ao seu espaço para fotografar e filmar. As sessões estão incluídas nos pacotes de redes sociais.",
          fr: "Nous. Nous venons chez vous pour photographier et filmer. Les séances sont incluses dans les forfaits réseaux sociaux.",
          en: "We do. We come to your place to shoot photos and video. Shoots are included in the social media packages."
        }
      },
      {
        question: { pt: "Como funciona o pagamento?", fr: "Comment se passe le paiement ?", en: "How does payment work?" },
        reponse: {
          pt: "Criação de sites: 50% na adjudicação e 50% na entrega, ou 3 prestações sem juros. Mensalidades: no início de cada mês, por transferência ou MB WAY.",
          fr: "Création de sites : 50 % à la commande et 50 % à la livraison, ou en 3 fois sans frais. Abonnements : en début de mois, par virement ou MB WAY.",
          en: "Website builds: 50% on order and 50% on delivery, or 3 interest-free instalments. Monthly plans: at the start of each month, by bank transfer or MB WAY."
        }
      }
    ]
  },

  /* -------------------------------------------------------------------
     11. CONTACT
     ------------------------------------------------------------------- */
  contact: {
    surtitre: { pt: "Contacto", fr: "Contact", en: "Contact" },
    titre: { pt: "Pedir orçamento", fr: "Demander un devis", en: "Get a quote" },
    texte: {
      pt: "Diga-nos o que precisa. Respondemos em 24 horas com uma proposta e um preço fechado.",
      fr: "Dites-nous ce dont vous avez besoin. Nous répondons sous 24 heures avec une proposition et un prix fixe.",
      en: "Tell us what you need. We reply within 24 hours with a proposal and a fixed price."
    },
    zone: {
      pt: "Portugal e França, também à distância",
      fr: "Portugal et France, aussi à distance",
      en: "Portugal and France, remote too"
    }
  },

  /* -------------------------------------------------------------------
     12. PIED DE PAGE
     ------------------------------------------------------------------- */
  pied: {
    cookies: { pt: "Este site não usa cookies.", fr: "Ce site n'utilise pas de cookies.", en: "This website uses no cookies." }
  },

  /* -------------------------------------------------------------------
     13. PETITS TEXTES (boutons, formulaire)
     {formule}, {commerce} et {email} sont remplacés automatiquement :
     ne les traduis pas.
     ------------------------------------------------------------------- */
  textes: {
    desde:           { pt: "desde", fr: "dès", en: "from" },
    chiffreWeb:      { pt: "Site web", fr: "Site web", en: "Website" },
    chiffreSocial:   { pt: "Redes sociais", fr: "Réseaux sociaux", en: "Social media" },
    chiffreVideo:    { pt: "Reel", fr: "Reel", en: "Reel" },
    populaire:       { pt: "Mais escolhido", fr: "Le plus choisi", en: "Most popular" },
    choisir:         { pt: "Pedir orçamento", fr: "Demander un devis", en: "Get a quote" },
    voirSite:        { pt: "Ver o site", fr: "Voir le site", en: "View site" },
    voirTarifs:      { pt: "Ver preços", fr: "Voir les tarifs", en: "See pricing" },
    fictif:          { pt: "Fictício", fr: "Fictif", en: "Made-up" },
    economie:        { pt: "Poupa", fr: "Économisez", en: "Save" },
    email:           { pt: "Email", fr: "E-mail", en: "Email" },
    instagram:       { pt: "Instagram · mensagem privada", fr: "Instagram · message privé", en: "Instagram · direct message" },
    zone:            { pt: "Onde trabalhamos", fr: "Où nous travaillons", en: "Where we work" },
    menu:            { pt: "Menu", fr: "Menu", en: "Menu" },
    champNom:        { pt: "Nome", fr: "Nom", en: "Name" },
    champEmail:      { pt: "Email", fr: "E-mail", en: "Email" },
    champCommerce:   { pt: "Empresa ou marca (opcional)", fr: "Entreprise ou marque (facultatif)", en: "Business or brand (optional)" },
    champService:    { pt: "Serviço", fr: "Service", en: "Service" },
    champMessage:    { pt: "Mensagem", fr: "Message", en: "Message" },
    autre:           { pt: "Outro pedido", fr: "Autre demande", en: "Something else" },
    envoyer:         { pt: "Enviar pedido", fr: "Envoyer la demande", en: "Send request" },
    envoiEnCours:    { pt: "A enviar…", fr: "Envoi en cours…", en: "Sending…" },
    confidentialite: {
      pt: "Os seus dados servem apenas para responder ao seu pedido.",
      fr: "Vos données servent uniquement à répondre à votre demande.",
      en: "Your details are only used to reply to your request."
    },
    politique:       { pt: "Política de privacidade", fr: "Politique de confidentialité", en: "Privacy policy" },
    merciTitre:      { pt: "Pedido enviado. Obrigado!", fr: "Demande envoyée. Merci !", en: "Request sent. Thank you!" },
    merciTexte: {
      pt: "Recebemos a sua mensagem e respondemos por email em 24 horas.",
      fr: "Nous avons bien reçu votre message et vous répondons par e-mail sous 24 heures.",
      en: "We've received your message and will reply by email within 24 hours."
    },
    champManquant:   { pt: "Indique o seu nome e um email válido.", fr: "Indiquez votre nom et une adresse e-mail valide.", en: "Please enter your name and a valid email address." },
    echec: {
      pt: "O envio automático não funcionou. Pode enviar-nos o seu pedido por email:",
      fr: "L'envoi automatique n'a pas fonctionné. Vous pouvez nous envoyer votre demande par e-mail :",
      en: "Automatic sending didn't work. You can send us your request by email:"
    },
    activation: {
      pt: "O formulário ainda não está ativado: abra o email “Activate Form” recebido em {email} e clique no botão. Entretanto, pode enviar o pedido por email:",
      fr: "Le formulaire n'est pas encore activé : ouvrez l'e-mail « Activate Form » reçu sur {email} et cliquez sur le bouton. En attendant, vous pouvez envoyer la demande par e-mail :",
      en: "The form isn't activated yet: open the “Activate Form” email sent to {email} and click the button. Meanwhile, you can send the request by email:"
    },
    secours:         { pt: "Enviar por email", fr: "Envoyer par e-mail", en: "Send by email" },
    livro:           { pt: "Livro de Reclamações", fr: "Livre de réclamations", en: "Complaints Book" },
    messageFormule: {
      pt: "Olá! Tenho interesse no {formule}.",
      fr: "Bonjour ! Je suis intéressé(e) par l'offre {formule}.",
      en: "Hello! I'm interested in the {formule}."
    },
    messageDemo: {
      pt: "Olá! Vi o exemplo “{commerce}” no vosso site e gostava de um site assim.",
      fr: "Bonjour ! J'ai vu l'exemple « {commerce} » sur votre site et j'aimerais un site comme ça.",
      en: "Hello! I saw the “{commerce}” example on your website and I'd like a site like that."
    }
  }
};
