/* =====================================================================
   CONTENU DU SITE — C'EST LE SEUL FICHIER À MODIFIER
   =====================================================================

   Comment ça marche :
   - Chaque texte existe en 3 langues, côte à côte :
       pt = portugais (langue par défaut du site)
       fr = français
       en = anglais
   - Tu modifies uniquement ce qui est ENTRE LES GUILLEMETS "...".
   - Garde la virgule à la fin des lignes et ne supprime pas les { } [ ].
   - Pour mettre un mot en valeur (surligné en jaune) : *entoure-le d'étoiles*.
   - Si tu écris un texte simple sans pt/fr/en (ex. prix: "350 €"),
     il s'affiche pareil dans toutes les langues.

   Si la page devient blanche après une modification : il manque
   sûrement une virgule ou un guillemet. Annule ta dernière modif
   et recommence (voir le GUIDE.md).
   ===================================================================== */

window.CONTENU = {

  /* -------------------------------------------------------------------
     1. TES INFORMATIONS — à remplacer en premier
     ------------------------------------------------------------------- */
  marque: "Montra",                  // nom de ton activité (logo, onglet du navigateur)
  nom: "Nome Apelido",               // ton prénom et ton nom
  telephone: "+351 900 000 000",     // affiché tel quel sur le site
  whatsapp: "351900000000",          // MÊME numéro : chiffres uniquement, 351 devant, sans + ni espaces
  email: "ola@example.com",
  instagram: "",                     // ex. "https://instagram.com/tonprofil" — laisse "" pour le cacher
  photo: "",                         // ex. "images/moi.jpg" — laisse "" pour afficher tes initiales
  livroReclamacoes: true,            // lien "Livro de Reclamações" en bas de page (obligatoire au Portugal)

  // Langues proposées. La première est celle par défaut.
  // Mets ["pt"] si tu ne veux que le portugais (le sélecteur de langue disparaît).
  langues: ["pt", "fr", "en"],

  // Couleurs du site (codes hexadécimaux, ex. trouvés sur https://htmlcolorcodes.com)
  couleurs: {
    principale: "#1f4aa8",           // bleu azulejo
    accent: "#f2b705"                // jaune des trams de Lisbonne
  },

  /* -------------------------------------------------------------------
     2. OFFRE DE LANCEMENT — petit bandeau tout en haut
     ------------------------------------------------------------------- */
  offre: {
    afficher: true,                  // false pour cacher le bandeau
    texte: {
      pt: "Oferta de lançamento: −20% para os primeiros 5 negócios.",
      fr: "Offre de lancement : −20 % pour les 5 premiers commerces.",
      en: "Launch offer: 20% off for the first 5 businesses."
    }
  },

  /* -------------------------------------------------------------------
     3. MENU DU HAUT
     ------------------------------------------------------------------- */
  menu: {
    pourquoi: { pt: "Porquê um site", fr: "Pourquoi un site", en: "Why a website" },
    tarifs:   { pt: "Preços",         fr: "Tarifs",           en: "Prices" },
    exemples: { pt: "Exemplos",       fr: "Exemples",         en: "Examples" },
    etapes:   { pt: "Como funciona",  fr: "Comment ça marche", en: "How it works" },
    contact:  { pt: "Contacto",       fr: "Contact",          en: "Contact" }
  },

  /* -------------------------------------------------------------------
     4. EN-TÊTE (le grand titre en haut de page)
     ------------------------------------------------------------------- */
  accueil: {
    surtitre: {
      pt: "Sites para pequenos negócios em Portugal",
      fr: "Sites web pour les petits commerces au Portugal",
      en: "Websites for small businesses in Portugal"
    },
    titre: {
      pt: "A montra do seu negócio, *aberta 24 horas.*",
      fr: "La vitrine de votre commerce, *ouverte 24 h/24.*",
      en: "Your shop window, *open 24 hours a day.*"
    },
    texte: {
      pt: "Crio sites simples e bonitos para cafés, restaurantes, lojas, cabeleireiros e oficinas. Os seus clientes encontram-no no Google, veem o horário e falam consigo por WhatsApp.",
      fr: "Je crée des sites simples et soignés pour les cafés, restaurants, boutiques, salons de coiffure et artisans. Vos clients vous trouvent sur Google, voient vos horaires et vous écrivent sur WhatsApp.",
      en: "I build simple, good-looking websites for cafés, restaurants, shops, hair salons and workshops. Customers find you on Google, check your opening hours and message you on WhatsApp."
    },
    boutonPrincipal:  { pt: "Pedir orçamento grátis", fr: "Demander un devis gratuit", en: "Get a free quote" },
    boutonSecondaire: { pt: "Ver exemplos",           fr: "Voir des exemples",         en: "See examples" },
    points: [
      { pt: "Pronto em 7 dias",          fr: "En ligne en 7 jours",      en: "Live in 7 days" },
      { pt: "Preço fixo, sem surpresas", fr: "Prix fixe, sans surprise", en: "Fixed price, no surprises" },
      { pt: "Feito para telemóvel",      fr: "Pensé pour le mobile",     en: "Built for mobile" }
    ]
  },

  /* -------------------------------------------------------------------
     5. POURQUOI UN SITE
     icone possibles : "carte", "horloge", "message", "etoile", "telephone", "panier"
     ------------------------------------------------------------------- */
  pourquoi: {
    titre: {
      pt: "Antes de entrar na sua loja, os clientes procuram-no no telemóvel.",
      fr: "Avant d'entrer dans votre boutique, vos clients vous cherchent sur leur téléphone.",
      en: "Before they walk in, customers look you up on their phone."
    },
    texte: {
      pt: "Sem site, perde clientes para o negócio do lado que aparece no Google. Um site resolve isso de uma vez.",
      fr: "Sans site, vous perdez des clients au profit du commerce d'à côté qui apparaît sur Google. Un site règle ça une bonne fois pour toutes.",
      en: "Without a website, you lose customers to the business next door that shows up on Google. A website fixes that for good."
    },
    elements: [
      {
        icone: "carte",
        titre: { pt: "Apareça no Google", fr: "Apparaissez sur Google", en: "Show up on Google" },
        texte: {
          pt: "Quando alguém procura “padaria perto de mim” ou “cabeleireiro no Porto”, o seu negócio aparece, com mapa e horário.",
          fr: "Quand quelqu'un cherche « boulangerie près de moi » ou « coiffeur à Porto », votre commerce apparaît, avec la carte et les horaires.",
          en: "When someone searches “bakery near me” or “hairdresser in Porto”, your business shows up with a map and opening hours."
        }
      },
      {
        icone: "horloge",
        titre: { pt: "Informação sempre à mão", fr: "Les infos à portée de main", en: "Everything in one place" },
        texte: {
          pt: "Horário, menu, preços e morada num só sítio. Menos chamadas a perguntar a mesma coisa.",
          fr: "Horaires, carte, prix et adresse au même endroit. Moins d'appels pour poser les mêmes questions.",
          en: "Opening hours, menu, prices and address in one spot. Fewer calls asking the same questions."
        }
      },
      {
        icone: "message",
        titre: { pt: "Contacto direto por WhatsApp", fr: "Contact direct par WhatsApp", en: "Direct contact on WhatsApp" },
        texte: {
          pt: "Um toque e o cliente fala consigo: encomendas, marcações e reservas, sem intermediários nem comissões.",
          fr: "Un geste et le client vous écrit : commandes, rendez-vous et réservations, sans intermédiaire ni commission.",
          en: "One tap and the customer is talking to you: orders, bookings and reservations, with no middleman and no commission."
        }
      },
      {
        icone: "etoile",
        titre: { pt: "Uma imagem profissional", fr: "Une image professionnelle", en: "A professional image" },
        texte: {
          pt: "Um site cuidado inspira confiança. É o seu cartão de visita, aberto dia e noite.",
          fr: "Un site soigné inspire confiance. C'est votre carte de visite, ouverte jour et nuit.",
          en: "A well-made website builds trust. It's your business card, open day and night."
        }
      }
    ]
  },

  /* -------------------------------------------------------------------
     6. TARIFS
     populaire: true  → la formule est mise en avant
     prefixe          → petit mot avant le prix (ex. "à partir de"), laisse "" sinon
     ------------------------------------------------------------------- */
  tarifs: {
    titre: {
      pt: "Preços claros, combinados antes de começar",
      fr: "Des prix clairs, fixés avant de commencer",
      en: "Clear prices, agreed before we start"
    },
    texte: {
      pt: "Sem letras pequenas. Paga o site uma vez e, se quiser, uma pequena mensalidade para eu tratar de tudo.",
      fr: "Pas de petites lignes. Vous payez le site une fois et, si vous le souhaitez, un petit abonnement pour que je m'occupe de tout.",
      en: "No small print. You pay once for the website and, if you like, a small monthly fee so I take care of everything."
    },
    formules: [
      {
        nom: { pt: "Essencial", fr: "Essentiel", en: "Essential" },
        prefixe: "",
        prix: "350 €",
        description: {
          pt: "Uma página completa, ideal para começar.",
          fr: "Une page complète, idéale pour démarrer.",
          en: "One complete page, ideal to get started."
        },
        inclus: [
          { pt: "Site de 1 página adaptado a telemóvel", fr: "Site d'1 page adapté au mobile",        en: "1-page site, mobile-friendly" },
          { pt: "Horário, morada e mapa",                fr: "Horaires, adresse et carte",            en: "Opening hours, address and map" },
          { pt: "Botões WhatsApp e telefone",            fr: "Boutons WhatsApp et téléphone",         en: "WhatsApp and call buttons" },
          { pt: "Ficha Google Maps criada ou melhorada", fr: "Fiche Google Maps créée ou améliorée",  en: "Google Maps listing set up or improved" },
          { pt: "Pronto em 7 dias",                      fr: "En ligne en 7 jours",                   en: "Live in 7 days" }
        ]
      },
      {
        nom: { pt: "Profissional", fr: "Professionnel", en: "Professional" },
        populaire: true,
        prefixe: "",
        prix: "650 €",
        description: {
          pt: "Para mostrar tudo o que faz, com fotos e várias páginas.",
          fr: "Pour montrer tout ce que vous faites, avec photos et plusieurs pages.",
          en: "To show everything you do, with photos and several pages."
        },
        inclus: [
          { pt: "Tudo o que está no Essencial",           fr: "Tout ce qu'il y a dans Essentiel",       en: "Everything in Essential" },
          { pt: "Até 5 páginas (serviços, menu, galeria)", fr: "Jusqu'à 5 pages (services, carte, galerie)", en: "Up to 5 pages (services, menu, gallery)" },
          { pt: "Versão em inglês para turistas",         fr: "Version anglaise pour les touristes",    en: "English version for tourists" },
          { pt: "Menu digital com código QR",             fr: "Carte digitale avec QR code",            en: "Digital menu with QR code" },
          { pt: "Otimização para o Google (SEO local)",   fr: "Optimisation Google (référencement local)", en: "Local SEO for Google" }
        ]
      },
      {
        nom: { pt: "Loja online", fr: "Boutique en ligne", en: "Online shop" },
        prefixe: { pt: "desde", fr: "à partir de", en: "from" },
        prix: "1 200 €",
        description: {
          pt: "Para vender os seus produtos na internet.",
          fr: "Pour vendre vos produits sur internet.",
          en: "To sell your products online."
        },
        inclus: [
          { pt: "Tudo o que está no Profissional",          fr: "Tout ce qu'il y a dans Professionnel",   en: "Everything in Professional" },
          { pt: "Catálogo com fotos e preços",              fr: "Catalogue avec photos et prix",          en: "Catalogue with photos and prices" },
          { pt: "Pagamento por MB WAY, Multibanco e cartão", fr: "Paiement MB WAY, Multibanco et carte",  en: "MB WAY, Multibanco and card payments" },
          { pt: "Gestão simples de encomendas",             fr: "Gestion simple des commandes",           en: "Simple order management" },
          { pt: "Formação para gerir a loja com autonomia",       fr: "Formation pour gérer la boutique vous-même", en: "Training to run the shop yourself" }
        ]
      }
    ],
    mensualite: {
      afficher: true,
      titre: { pt: "Manutenção tranquila", fr: "Maintenance sereine", en: "Worry-free maintenance" },
      prix: "15 €",
      unite: { pt: "/mês", fr: "/mois", en: "/month" },
      texte: {
        pt: "Alojamento, domínio .pt, cópias de segurança e pequenas alterações sempre que precisar (horário, preços, fotos).",
        fr: "Hébergement, nom de domaine .pt, sauvegardes et petites modifications quand vous en avez besoin (horaires, prix, photos).",
        en: "Hosting, .pt domain, backups and small changes whenever you need them (hours, prices, photos)."
      }
    },
    note: {
      pt: "Pagamento em duas vezes: 50% no início, 50% na entrega. MB WAY ou transferência bancária.",
      fr: "Paiement en deux fois : 50 % au début, 50 % à la livraison. MB WAY ou virement bancaire.",
      en: "Pay in two parts: 50% upfront, 50% on delivery. MB WAY or bank transfer."
    }
  },

  /* -------------------------------------------------------------------
     7. EXEMPLES DE SITES
     Quand tu auras de vrais clients, remplace ces exemples par leurs sites :
     lien: "https://site-du-client.pt", image: "images/capture-client.jpg"
     ------------------------------------------------------------------- */
  exemples: {
    titre: { pt: "Exemplos de sites", fr: "Exemples de sites", en: "Example websites" },
    texte: {
      pt: "Três negócios fictícios, criados para mostrar como pode ficar o seu. Abra-os no telemóvel para os ver como os seus clientes.",
      fr: "Trois commerces fictifs, créés pour montrer à quoi pourrait ressembler le vôtre. Ouvrez-les sur votre téléphone pour les voir comme vos clients.",
      en: "Three made-up businesses, built to show what yours could look like. Open them on your phone to see them the way your customers will."
    },
    liste: [
      {
        nom: "Padaria do Bairro",
        type: { pt: "Padaria e pastelaria", fr: "Boulangerie-pâtisserie", en: "Bakery and pastry shop" },
        lien: "exemples/padaria.html",
        image: "images/exemplo-padaria.jpg"
      },
      {
        nom: "Barbearia Navalha",
        type: { pt: "Barbearia", fr: "Barbier", en: "Barber shop" },
        lien: "exemples/barbearia.html",
        image: "images/exemplo-barbearia.jpg"
      },
      {
        nom: "Tasca da Esquina",
        type: { pt: "Restaurante tradicional", fr: "Restaurant traditionnel", en: "Traditional restaurant" },
        lien: "exemples/tasca.html",
        image: "images/exemplo-tasca.jpg"
      }
    ]
  },

  /* -------------------------------------------------------------------
     8. COMMENT ÇA MARCHE (les étapes, dans l'ordre)
     ------------------------------------------------------------------- */
  etapes: {
    titre: { pt: "Como funciona", fr: "Comment ça marche", en: "How it works" },
    liste: [
      {
        titre: { pt: "Conversamos", fr: "On discute", en: "We talk" },
        texte: {
          pt: "Visito o seu negócio ou falamos por telefone. 20 minutos, sem compromisso.",
          fr: "Je passe vous voir ou on s'appelle. 20 minutes, sans engagement.",
          en: "I visit your business or we talk on the phone. 20 minutes, no commitment."
        }
      },
      {
        titre: { pt: "Proposta com preço fixo", fr: "Proposition à prix fixe", en: "Fixed-price proposal" },
        texte: {
          pt: "Recebe uma proposta clara, com o preço final. Só avançamos se concordar.",
          fr: "Vous recevez une proposition claire avec le prix final. Rien ne démarre sans votre accord.",
          en: "You get a clear proposal with the final price. Nothing starts until you agree."
        }
      },
      {
        titre: { pt: "Eu crio o site", fr: "Je crée le site", en: "I build the site" },
        texte: {
          pt: "Trato de tudo: textos, fotos, design e domínio. Mostro-lhe o resultado antes de publicar.",
          fr: "Je m'occupe de tout : textes, photos, design et nom de domaine. Je vous montre le résultat avant la mise en ligne.",
          en: "I handle everything: text, photos, design and domain. You see the result before it goes live."
        }
      },
      {
        titre: { pt: "O site fica online", fr: "Le site est en ligne", en: "Your site goes live" },
        texte: {
          pt: "Em cerca de 7 dias, o seu negócio está na internet. Continuo disponível para alterações.",
          fr: "En 7 jours environ, votre commerce est sur internet. Je reste disponible pour les modifications.",
          en: "In about 7 days your business is online. I stay available for any changes."
        }
      }
    ]
  },

  /* -------------------------------------------------------------------
     9. QUI SUIS-JE — vérifie et personnalise ces phrases !
     ------------------------------------------------------------------- */
  apropos: {
    titre: { pt: "Quem sou", fr: "Qui suis-je", en: "About me" },
    paragraphes: [
      {
        pt: "Venho de França e vivo em Portugal. Gosto do comércio de bairro: as tascas, as padarias, as lojas onde nos tratam pelo nome.",
        fr: "Je viens de France et je vis au Portugal. J'aime les commerces de quartier : les tascas, les boulangeries, les boutiques où l'on vous appelle par votre prénom.",
        en: "I'm from France and I live in Portugal. I love neighbourhood businesses: the tascas, the bakeries, the shops where they call you by your name."
      },
      {
        pt: "O meu trabalho é dar a estes negócios um lugar na internet, sem complicações e a um preço justo. Trabalho por conta própria: fala sempre diretamente comigo, do primeiro café até ao site online.",
        fr: "Mon travail, c'est de donner à ces commerces une place sur internet, sans complications et à un prix juste. Je travaille à mon compte : vous parlez toujours directement avec moi, du premier café jusqu'à la mise en ligne.",
        en: "My job is to give these businesses a place online, without the hassle and at a fair price. I work for myself, so you always deal with me directly, from the first coffee to the day your site goes live."
      }
    ],
    langues: {
      pt: "Falo português, francês e inglês.",
      fr: "Je parle portugais, français et anglais.",
      en: "I speak Portuguese, French and English."
    }
  },

  /* -------------------------------------------------------------------
     10. QUESTIONS FRÉQUENTES
     ------------------------------------------------------------------- */
  faq: {
    titre: { pt: "Perguntas frequentes", fr: "Questions fréquentes", en: "Frequently asked questions" },
    liste: [
      {
        question: {
          pt: "Preciso de perceber de informática?",
          fr: "Faut-il s'y connaître en informatique ?",
          en: "Do I need to know about computers?"
        },
        reponse: {
          pt: "Não. Eu trato de tudo. Só precisa de me dar as informações do seu negócio e, se tiver, algumas fotos.",
          fr: "Non. Je m'occupe de tout. Il vous suffit de me donner les informations sur votre commerce et, si vous en avez, quelques photos.",
          en: "No. I take care of everything. You just give me your business details and a few photos if you have them."
        }
      },
      {
        question: {
          pt: "Quanto tempo demora?",
          fr: "Combien de temps ça prend ?",
          en: "How long does it take?"
        },
        reponse: {
          pt: "Um site Essencial fica pronto cerca de 7 dias depois de eu receber as informações. Uma loja online demora 3 a 4 semanas.",
          fr: "Un site Essentiel est prêt environ 7 jours après réception des informations. Une boutique en ligne prend 3 à 4 semaines.",
          en: "An Essential site is ready about 7 days after I get your information. An online shop takes 3 to 4 weeks."
        }
      },
      {
        question: {
          pt: "O site e o domínio ficam em meu nome?",
          fr: "Le site et le nom de domaine sont-ils à mon nom ?",
          en: "Are the website and domain in my name?"
        },
        reponse: {
          pt: "Sim. O domínio (por exemplo, oseunegocio.pt) é registado em seu nome. O site é seu.",
          fr: "Oui. Le nom de domaine (par exemple votrecommerce.pt) est enregistré à votre nom. Le site vous appartient.",
          en: "Yes. The domain (for example yourbusiness.pt) is registered in your name. The website is yours."
        }
      },
      {
        question: {
          pt: "E se quiser mudar o horário ou os preços?",
          fr: "Et si je veux changer mes horaires ou mes prix ?",
          en: "What if I want to change my hours or prices?"
        },
        reponse: {
          pt: "Com a mensalidade, basta enviar-me uma mensagem e eu altero, normalmente no mesmo dia.",
          fr: "Avec l'abonnement, il suffit de m'envoyer un message et je modifie, en général le jour même.",
          en: "With the monthly plan, just send me a message and I'll update it, usually the same day."
        }
      },
      {
        question: {
          pt: "A mensalidade é obrigatória?",
          fr: "L'abonnement est-il obligatoire ?",
          en: "Is the monthly fee mandatory?"
        },
        reponse: {
          pt: "Não. Pode ficar só com o site e tratar do alojamento por conta própria. A mensalidade é para quem não se quer preocupar com nada.",
          fr: "Non. Vous pouvez garder uniquement le site et gérer l'hébergement vous-même. L'abonnement, c'est pour ne s'occuper de rien.",
          en: "No. You can keep just the website and handle hosting yourself. The monthly plan is for people who'd rather not deal with any of it."
        }
      },
      {
        question: {
          pt: "Já tenho Facebook ou Instagram. Preciso de um site?",
          fr: "J'ai déjà Facebook ou Instagram. Ai-je besoin d'un site ?",
          en: "I already have Facebook or Instagram. Do I need a website?"
        },
        reponse: {
          pt: "As redes sociais ajudam, mas nem todos os clientes as usam. Quem procura no Google encontra sites e fichas do Google Maps. E no seu site é você que decide o que aparece.",
          fr: "Les réseaux sociaux aident, mais tous vos clients ne les utilisent pas. Ceux qui cherchent sur Google tombent sur des sites et des fiches Google Maps. Et sur votre site, c'est vous qui décidez de ce qui s'affiche.",
          en: "Social media helps, but not every customer uses it. People searching on Google find websites and Google Maps listings. And on your own site, you decide what shows."
        }
      }
    ]
  },

  /* -------------------------------------------------------------------
     11. CONTACT
     ------------------------------------------------------------------- */
  contact: {
    titre: { pt: "Vamos falar do seu negócio?", fr: "On parle de votre commerce ?", en: "Shall we talk about your business?" },
    texte: {
      pt: "Escreva-me por WhatsApp ou preencha o formulário. Respondo no mesmo dia.",
      fr: "Écrivez-moi sur WhatsApp ou remplissez le formulaire. Je réponds dans la journée.",
      en: "Message me on WhatsApp or fill in the form. I reply the same day."
    },
    zone: {
      pt: "Lisboa e arredores. À distância em todo o país.",
      fr: "Lisbonne et ses environs. À distance dans tout le pays.",
      en: "Lisbon area. Remotely anywhere in Portugal."
    }
  },

  /* -------------------------------------------------------------------
     12. PIED DE PAGE
     ------------------------------------------------------------------- */
  pied: {
    slogan: {
      pt: "Sites para pequenos negócios em Portugal.",
      fr: "Sites web pour les petits commerces au Portugal.",
      en: "Websites for small businesses in Portugal."
    },
    cookies: {
      pt: "Este site não usa cookies.",
      fr: "Ce site n'utilise pas de cookies.",
      en: "This website uses no cookies."
    }
  },

  /* -------------------------------------------------------------------
     13. PETITS TEXTES (boutons, formulaire, messages WhatsApp)
     Dans les messages, {nom}, {commerce}, {message} et {formule}
     sont remplacés automatiquement : ne les traduis pas.
     ------------------------------------------------------------------- */
  textes: {
    populaire:       { pt: "Mais escolhido", fr: "Le plus choisi", en: "Most popular" },
    choisir:         { pt: "Quero este", fr: "Je veux celui-ci", en: "I want this one" },
    voirDemo:        { pt: "Ver o site", fr: "Voir le site", en: "View the site" },
    exempleFictif:   { pt: "Negócio fictício", fr: "Commerce fictif", en: "Made-up business" },
    etape:           { pt: "Passo", fr: "Étape", en: "Step" },
    whatsapp:        { pt: "Falar no WhatsApp", fr: "Écrire sur WhatsApp", en: "Chat on WhatsApp" },
    telephone:       { pt: "Telefone", fr: "Téléphone", en: "Phone" },
    email:           { pt: "Email", fr: "E-mail", en: "Email" },
    zone:            { pt: "Onde trabalho", fr: "Où je travaille", en: "Where I work" },
    menuOuvrir:      { pt: "Menu", fr: "Menu", en: "Menu" },
    champNom:        { pt: "O seu nome", fr: "Votre nom", en: "Your name" },
    champCommerce:   { pt: "O seu negócio", fr: "Votre commerce", en: "Your business" },
    exempleCommerce: { pt: "Ex.: café em Almada", fr: "Ex. : café à Almada", en: "E.g. café in Almada" },
    champMessage:    { pt: "Mensagem (opcional)", fr: "Message (facultatif)", en: "Message (optional)" },
    exempleMessage:  { pt: "Conte-me o que precisa", fr: "Dites-moi ce dont vous avez besoin", en: "Tell me what you need" },
    envoyer:         { pt: "Enviar por WhatsApp", fr: "Envoyer sur WhatsApp", en: "Send on WhatsApp" },
    ouEmail:         { pt: "Prefere email? Enviar por email", fr: "Vous préférez l'e-mail ? Envoyer par e-mail", en: "Prefer email? Send by email" },
    champManquant:   { pt: "Indique o seu nome e o seu negócio.", fr: "Indiquez votre nom et votre commerce.", en: "Please enter your name and your business." },
    livro:           { pt: "Livro de Reclamações", fr: "Livre de réclamations", en: "Complaints Book" },
    messageGeneral: {
      pt: "Olá! Gostava de saber mais sobre um site para o meu negócio.",
      fr: "Bonjour ! J'aimerais en savoir plus sur un site pour mon commerce.",
      en: "Hello! I'd like to know more about a website for my business."
    },
    messageFormule: {
      pt: "Olá! Tenho interesse no pacote {formule}. Podemos falar?",
      fr: "Bonjour ! La formule {formule} m'intéresse. On peut en parler ?",
      en: "Hello! I'm interested in the {formule} package. Can we talk?"
    },
    messageFormulaire: {
      pt: "Olá! Sou {nom}, do negócio {commerce}. Gostava de saber mais sobre um site. {message}",
      fr: "Bonjour ! Je suis {nom}, de {commerce}. J'aimerais en savoir plus sur un site. {message}",
      en: "Hello! I'm {nom} from {commerce}. I'd like to know more about a website. {message}"
    },
    messageDemo: {
      pt: "Olá! Vi o exemplo “{commerce}” no seu site e gostava de um site assim para o meu negócio.",
      fr: "Bonjour ! J'ai vu l'exemple « {commerce} » sur votre site et j'aimerais un site comme ça pour mon commerce.",
      en: "Hello! I saw the “{commerce}” example on your website and I'd like a site like that for my business."
    }
  }
};
