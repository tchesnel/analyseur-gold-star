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

### Pourquoi pas Vercel gratuit ?

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

- [ ] `telephone` : ton numéro tel qu'il s'affiche, par exemple `"+351 912 345 678"`.
- [ ] `whatsapp` : le **même numéro**, en chiffres seulement, par exemple `"351912345678"`.
- [ ] `email`
- [ ] `instagram` et `instagramPseudo`
- [ ] Section **9. QUI SOMMES-NOUS** : vérifie que les phrases te correspondent (langues parlées, façon de travailler).
- [ ] Section **7. RÉALISATIONS** : remplace les 4 images Vila Haritza par tes fichiers en haute définition (voir étape 5).
- [ ] Section **6. TARIFS** → `note` : adapte la mention de TVA à ton statut (à voir avec ton comptable).

Dans `index.html`, dans le bloc encadré tout en haut :

- [ ] Remplace `https://example.com` par l'adresse de ton site (2 endroits). C'est ce qui affiche l'image d'aperçu quand tu envoies le lien sur WhatsApp ou Instagram.

---

## 4. Les tarifs en place

**Sites web** : création (payée une fois) + maintenance mensuelle (engagement de 12 mois, puis au mois)

| Offre | Création | Maintenance |
|---|---|---|
| Site Essentiel (1 page) | 490 € | 25 €/mois |
| Site Professionnel (jusqu'à 6 pages, mis en avant) | 990 € | 35 €/mois |
| Boutique en ligne | dès 1 690 € | 49 €/mois |

La maintenance comprend l'hébergement, le nom de domaine, la sécurité, les sauvegardes, jusqu'à 1 heure de modifications par mois et l'assistance WhatsApp. Pour une boutique, l'abonnement à la plateforme de vente est payé directement par le client.

**Réseaux sociaux** : engagement de 3 mois, puis préavis de 30 jours

| Forfait | Prix | Contenu |
|---|---|---|
| Présence | 249 €/mois | 1 réseau, 8 publications dont 2 reels, 1 séance par mois |
| Croissance (mis en avant) | 449 €/mois | Instagram + Facebook, 12 publications dont 4 reels, stories, rapport |
| Premium | 790 €/mois | 3 réseaux, 20 publications dont 8 reels, 2 séances, publicités |

**Photo et vidéo à l'unité**

| Prestation | Prix |
|---|---|
| Reel | 120 € |
| 4 reels | 390 € |
| Séance photo (1 h) | 190 € |
| Photo produit (20 produits) | 250 € |
| Film de marque | dès 590 € |
| Couverture d'événement | dès 450 € |

**Pack Démarrage** : Site Essentiel, 3 mois de forfait Présence, 1 séance photo et 3 mois de maintenance, pour **1 190 €** au lieu de 1 502 €.

**Paiement** : création 50 % à la commande et 50 % à la livraison, ou en 3 fois sans frais. Abonnements en début de mois.

Les montants « dès… » en haut de page se mettent à jour tout seuls quand tu modifies les tarifs.

---

## 5. Remplacer les photos

- **Réalisations :** mets tes photos HD (format vertical 4:5, en JPG, moins de 400 Ko chacune) dans `images/realisations/`, puis indique leurs noms dans `contenu.js` → section 7 → `images: [...]`.
- **Pour ajouter un projet :** copie le bloc `{ client: "Vila Haritza", ... }`, colle-le juste après (avec une virgule entre les deux), puis change les textes et les images.
- **Logo :** les fichiers vectoriels sont dans `images/` (`logo-hego-lettres.svg`, `logo-hego-rond.svg`, `logo-hego-rond-blanc.svg`).

---

## 6. Nom de domaine

1. Achète le domaine chez un registraire (PTisp, Amen.pt, OVHcloud ou Cloudflare). Compte environ 10 à 30 € par an selon l'extension, à vérifier.
2. Dans Cloudflare : ton projet Pages → **Custom domains** → ajoute le domaine et suis les instructions.
3. Mets à jour l'adresse dans `index.html` (étape 3).

---

## 7. Ce que fait le site

- **Chaque bouton « Demander un devis »** ouvre WhatsApp avec un message déjà écrit qui précise l'offre choisie, dans la langue du client.
- **Le formulaire** envoie le nom, l'entreprise et le service choisi sur WhatsApp, ou par e-mail.
- **Les 3 sites d'exemple** (boulangerie, barbier, restaurant) montrent aux commerçants ce qu'ils peuvent obtenir.
- **Aucun cookie et polices hébergées sur le site** : pas besoin de bandeau cookies (RGPD).
- **Bandeau d'offre** : prêt à l'emploi dans `contenu.js` → section 2 (`afficher: true` pour l'activer).
