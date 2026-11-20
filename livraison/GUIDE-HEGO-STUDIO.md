# HEGO STUDIO · Mode d'emploi du site

Le site est en **portugais** par défaut, avec **français** et **anglais** (boutons PT / FR / EN en haut). Il prend automatiquement la langue du téléphone du visiteur. Pour forcer une langue dans un lien : `?lang=pt`, `?lang=fr` ou `?lang=en` à la fin de l'adresse.

---

## 1. Mettre le site en ligne (gratuit, avec le zip)

### Cloudflare Pages (recommandé)

1. Crée un compte gratuit sur **dash.cloudflare.com**.
2. Va dans **Workers & Pages → Create → Pages**, puis choisis l'envoi de fichiers par glisser-déposer (« Drag and drop your files » ou « Upload assets », selon la version).
3. Donne un nom au projet, par exemple `hego-studio`.
4. **Glisse le fichier `hego-studio-site.zip`**, puis clique sur **Deploy**.
5. Le site est en ligne à une adresse du type `hego-studio.pages.dev`.

**Pour une mise à jour :** ouvre le projet → **Create deployment** → glisse le nouveau zip.

### Ton site est sur Vercel (hego-studio-site.vercel.app)

**Pour le mettre à jour :** va sur vercel.com → ouvre le projet **hego-studio-site** → onglet **Deployments**, puis glisse le nouveau zip dessus. Ne repasse pas par vercel.com/drop : ça créerait un deuxième projet.

### À savoir sur Vercel gratuit

L'offre gratuite de Vercel (Hobby) est réservée à un usage **personnel et non commercial**. Pour un site d'entreprise, il faut leur offre payante (Pro). Cloudflare Pages n'a pas cette restriction sur son offre gratuite, d'après les comparatifs consultés. Vérifie leurs conditions d'utilisation avant de t'engager.

C'est aussi ce que tu utiliseras pour les sites de tes clients : un projet Cloudflare par client.

---

## 2. Modifier le site

Tout ce qui s'affiche (textes, prix, numéro, e-mail, offres, FAQ) se trouve dans **un seul fichier : `contenu.js`**.

1. Décompresse le zip.
2. Ouvre `contenu.js` avec un éditeur de texte (VS Code, gratuit, est le plus confortable).
3. Modifie uniquement le texte **entre guillemets** `"..."`.
4. Enregistre, recompresse le dossier en zip, puis redépose-le (étape 1).

Pour vérifier avant de publier, double-clique sur `index.html` : le site s'ouvre dans ton navigateur.

### Les 4 règles pour ne rien casser

- Ne modifie que ce qui est **entre guillemets**.
- Garde la **virgule** à la fin des lignes.
- Ne supprime pas les `{ }` et `[ ]`.
- Pour mettre un guillemet dans un texte, utilise « » ou “ ”.

**La page affiche un message d'erreur rouge ?** Il manque une virgule ou un guillemet près de ta dernière modification. Corrige-la ou reprends le `contenu.js` du zip d'origine.

---

## 3. À remplacer AVANT de diffuser le lien

Dans `contenu.js`, tout en haut :

- [x] `email` : déjà réglé sur `hello.hegostudio@gmail.com` (c'est aussi l'adresse qui reçoit les demandes).
- [x] `instagram` : @hego_studio, affiché dans le contact et en bas de page.
- [x] Le formulaire : activé.
- [ ] `nif` : ton numéro fiscal, affiché en bas de page (identification obligatoire d'un professionnel).
- [ ] `privacidade.html` : relis la politique de confidentialité (déjà rédigée en PT, FR et EN).

Aucun numéro de téléphone n'apparaît sur le site.
- [ ] Section **9. QUI SOMMES-NOUS** : vérifie que les phrases te correspondent.
- [ ] Section **7. RÉALISATIONS** : vérifie les textes de Cysta, Loggio et Vila Haritza.
- [ ] Section **6. TARIFS** → `note` : adapte la mention de TVA à ton statut (à voir avec ton comptable).

Si tu passes sur ton propre nom de domaine : remplace `https://hego-studio-site.vercel.app` dans le bloc encadré en haut d'`index.html`, dans `robots.txt` et dans `sitemap.xml`.
---

## 4. Recevoir les demandes du formulaire par e-mail

Le formulaire utilise **FormSubmit** (formsubmit.co), un service gratuit et sans inscription qui transfère chaque demande vers `hello.hegostudio@gmail.com`.

**À faire une seule fois, juste après la mise en ligne :**

1. Ouvre ton site en ligne et envoie-toi une demande de test avec le formulaire. La toute première fois, le site affiche « Le formulaire n'est pas encore activé » ou « L'envoi automatique n'a pas fonctionné » : c'est normal, FormSubmit attend ta confirmation.
2. Dans Gmail, tu reçois un e-mail de FormSubmit intitulé « Activate Form » (regarde aussi dans **Spam** ou **Promotions**).
3. Clique sur **Activate Form**.
4. Renvoie un test : la demande arrive dans ta boîte, avec un tableau propre (nom, e-mail, entreprise, service, message).

**Pour masquer ton adresse dans le code (facultatif) :** après l'activation, FormSubmit t'envoie un code aléatoire. Colle-le dans `contenu.js` → `formulaireCode: "ton-code"`, puis remets le zip en ligne.

**Conseil :** dans Gmail, crée un filtre « De : FormSubmit » → libellé « Devis HEGO » et étoile, pour ne rater aucune demande.

---

## 5. Les tarifs en place

**Sites web** : création (payée une fois) + maintenance mensuelle (engagement de 12 mois, puis au mois)

| Offre | Création | Maintenance |
|---|---|---|
| Site Essentiel (1 page) | 390 € | 19 €/mois |
| Site Professionnel (jusqu'à 6 pages, mis en avant) | 690 € | 25 €/mois |
| Boutique en ligne | dès 990 € | 35 €/mois |

La maintenance comprend l'hébergement, le nom de domaine, la sécurité, les sauvegardes, jusqu'à 1 heure de modifications par mois et l'assistance par e-mail. Pour une boutique, l'abonnement à la plateforme de vente est payé directement par le client.

**Réseaux sociaux** : engagement de 3 mois, puis préavis de 30 jours

| Forfait | Prix | Contenu |
|---|---|---|
| Présence | 179 €/mois | 1 réseau, 8 publications dont 2 reels, 1 séance par mois |
| Croissance (mis en avant) | 299 €/mois | Instagram + Facebook, 12 publications dont 4 reels, stories, rapport |
| Premium | 549 €/mois | 3 réseaux, 20 publications dont 8 reels, 2 séances, publicités |

**Photo et vidéo à l'unité**

| Prestation | Prix |
|---|---|
| Reel | 79 € |
| 4 reels | 249 € |
| Séance photo (1 h) | 129 € |
| Photo produit (20 produits) | 169 € |
| Film de marque | dès 390 € |
| Couverture d'événement | dès 290 € |

**Pack Démarrage** : Site Essentiel, 3 mois de forfait Présence, 1 séance photo et 3 mois de maintenance, pour **890 €** au lieu de 1 113 €.

**Paiement** : création 50 % à la commande et 50 % à la livraison, ou en 3 fois sans frais. Abonnements en début de mois.

Les montants « dès… » en haut de page se mettent à jour tout seuls quand tu modifies les tarifs.

---

## 6. Remplacer les photos

- **Réalisations :** chaque projet a une capture au format paysage (environ 1000 × 700 px, en JPG) dans `images/realisations/`. Le nom du fichier se règle dans `contenu.js` → section 7 → `image`.
- **Pour ajouter un projet :** copie un bloc `{ nom: "Cysta", ... }`, colle-le après le dernier (avec une virgule entre les deux), puis change les textes, le lien et l'image. Les projets s'affichent en alternance gauche / droite.
- **Logo :** les fichiers vectoriels sont dans `images/` (`logo-hego-lettres.svg`, `logo-hego-rond.svg`, `logo-hego-rond-blanc.svg`).

---

## 7. Nom de domaine

1. Achète le domaine chez un registraire (PTisp, Amen.pt, OVHcloud ou Cloudflare). Compte environ 10 à 30 € par an selon l'extension, à vérifier.
2. Dans Cloudflare : ton projet Pages → **Custom domains** → ajoute le domaine et suis les instructions.
3. Mets à jour l'adresse dans `index.html` (étape 3), puis refais un test du formulaire.

---

## 8. Ce que fait le site

- **Chaque bouton « Demander un devis »** fait descendre au formulaire, avec le service et l'offre choisie déjà remplis.
- **Le formulaire** t'envoie la demande par e-mail (nom, e-mail, entreprise, service, message, langue du visiteur). Tu n'as qu'à cliquer sur « Répondre » dans Gmail pour écrire au client.
- **Les 3 sites d'exemple** (boulangerie, barbier, restaurant) montrent aux commerçants ce qu'ils peuvent obtenir.
- **Aucun cookie et polices hébergées sur le site** : pas besoin de bandeau cookies (RGPD).
- **Bandeau d'offre** : prêt à l'emploi dans `contenu.js` → section 2 (`afficher: true` pour l'activer).

---

## 9. Avis clients, photo et sites d'exemple

- **Avis clients** : `contenu.js` → section 7 → `temoignages`. Pour en ajouter un, copie un bloc `{ nom: "Marie", ... }` et colle-le après le dernier (avec une virgule entre les deux).
- **Votre photo** : `images/thomas-lydia.jpg`. Pour la changer, remplace le fichier en gardant le même nom (format vertical 4:5 de préférence).
- **Sites d'exemple fictifs** (boulangerie, barbier, restaurant) : ils ne sont plus affichés sur la page d'accueil, pour garder le site premium avec vos vrais projets. Ils restent en ligne pour la prospection, à envoyer directement aux commerçants :
  - `https://hego-studio-site.vercel.app/exemples/padaria.html`
  - `https://hego-studio-site.vercel.app/exemples/barbearia.html`
  - `https://hego-studio-site.vercel.app/exemples/tasca.html`

  Pour les réafficher sur la page d'accueil : `afficherExemples: true` dans `contenu.js`.
