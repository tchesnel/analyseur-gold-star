# HEGO STUDIO · Mode d'emploi du site

Le site est en **portugais** par défaut, avec **français** et **anglais** (boutons PT / FR / EN en haut). Il prend automatiquement la langue du téléphone du visiteur. Pour forcer une langue dans un lien :

- `https://ton-site/?lang=pt` · `?lang=fr` · `?lang=en`

---

## 1. Mettre le site en ligne en 2 minutes (avec le zip)

### Vercel Drop (recommandé)

1. Va sur **vercel.com/drop** et connecte-toi (ou crée un compte gratuit).
2. **Glisse le fichier `hego-studio-site.zip`** dans la zone. Inutile de le décompresser.
3. Choisis un nom de projet, par exemple `hego-studio`, puis clique sur **Deploy**.
4. Ton site est en ligne à une adresse du type `hego-studio.vercel.app`.

**Pour mettre à jour le site :** dans le tableau de bord Vercel, ouvre ton projet et glisse le nouveau zip dessus. Ne repasse pas par vercel.com/drop, sinon ça crée un deuxième projet.

### Autres hébergeurs gratuits qui acceptent un glisser-déposer

- **Netlify Drop** : app.netlify.com/drop. Décompresse le zip et glisse le **dossier**, c'est ce que conseille Netlify.
- **Cloudflare Pages** : Workers & Pages → Create → « Drag and drop your files ». Accepte le zip.

---

## 2. Modifier le site

Tout ce qui s'affiche (textes, prix, numéro, e-mail, forfaits, FAQ) est dans **un seul fichier : `contenu.js`**.

1. Décompresse le zip.
2. Ouvre `contenu.js` avec un éditeur de texte : **TextEdit** sur Mac (Format → « Convertir au format texte »), **Bloc-notes** sur Windows, ou mieux, **VS Code** (gratuit).
3. Modifie uniquement le texte **entre guillemets** `"..."`.
4. Enregistre, recompresse le dossier en zip, puis redépose-le sur Vercel (étape 1).

Pour vérifier avant de publier : double-clique sur `index.html`, le site s'ouvre dans ton navigateur. En local, certains navigateurs affichent une police de remplacement : c'est normal, les vraies polices s'affichent une fois le site en ligne.

### Les 4 règles pour ne rien casser

- Ne modifie que ce qui est **entre guillemets**.
- Garde la **virgule** à la fin des lignes.
- Ne supprime pas les `{ }` et `[ ]`.
- Pour un guillemet dans un texte, utilise « » ou “ ”.

Astuce : `*entre étoiles*` affiche le texte en italique élégant (la police Bodoni du site).

**Page avec un message d'erreur rouge ?** Il manque une virgule ou un guillemet près de ta dernière modification. Corrige-la ou reprends le `contenu.js` du zip d'origine.

---

## 3. À remplacer AVANT de diffuser le lien

Dans `contenu.js`, tout en haut :

- [ ] `telephone` : ton numéro tel qu'il s'affiche, par exemple `"+351 912 345 678"`.
- [ ] `whatsapp` : le **même numéro**, en chiffres seulement, par exemple `"351912345678"`.
- [ ] `email`
- [ ] `instagram` : le lien de ton compte, par exemple `"https://instagram.com/tonpseudo"`.
- [ ] `instagramPseudo` : par exemple `"@tonpseudo"`.
- [ ] Section **9. LE STUDIO** : vérifie que les phrases te correspondent (langues parlées…).
- [ ] Section **7. RÉALISATIONS** : remplace les 4 images Vila Haritza par tes fichiers en **haute définition** (voir étape 5).

Dans `index.html`, dans le bloc encadré tout en haut :

- [ ] Remplace `https://example.com` par l'adresse de ton site (2 endroits). C'est ce qui affiche la belle image d'aperçu quand tu envoies le lien sur WhatsApp ou Instagram.

---

## 4. La stratégie de prix (déjà intégrée, modifiable dans `contenu.js`)

| Offre | Prix | Pourquoi |
|---|---|---|
| **Site Vitrine** | 349 € | Prix d'appel, sous la barre psychologique des 350 € |
| **Site Pro** (le plus choisi) | 690 € | L'offre que tu veux vendre, mise en avant en noir |
| **Boutique en ligne** | dès 1 290 € | Ancre haute : elle fait paraître le Site Pro raisonnable |
| Hébergement & maintenance | 15 €/mois | Revenu récurrent, facultatif |
| **Réseaux sociaux Essentiel** | 149 €/mois | 6 photos + 2 reels + 1 tournage |
| **Réseaux sociaux Croissance** (le plus choisi) | 249 €/mois | 8 photos + 4 reels + stories, 2 réseaux |
| **Réseaux sociaux Premium** | 449 €/mois | 12 photos + 8 reels, 3 réseaux, pubs |
| Reel à l'unité | 69 € | Porte d'entrée pour tester ton travail |
| Pack 4 reels | 229 € | Au lieu de 276 € : pousse à prendre plus |
| **Pack Lancement** | 599 € | Site + 3 mois de réseaux, au lieu de 796 € |

**Le calculateur « Composez votre pack »** : le client choisit son nombre de photos, de reels et de réseaux, et voit son prix en direct. Les prix à l'unité du calculateur (49 € de base + 10 €/photo + 30 €/reel + 25 €/réseau en plus) sont **volontairement un peu plus chers que les forfaits**. Le site affiche alors : « Le forfait Croissance inclut tout ça pour 249 €. Vous économisez 25 € ». Le client voit qu'il fait une affaire en prenant un forfait.

Si tu changes les forfaits, garde cette règle : le calculateur doit toujours donner un peu plus cher que le forfait équivalent.

Les montants « dès 349 € / 149 €/mois / 69 € » du haut de page se calculent **tout seuls** à partir des tarifs.

---

## 5. Remplacer les photos

- **Réalisations :** mets tes photos HD (format vertical 4:5, en JPG, moins de 400 Ko chacune) dans `images/realisations/`, puis indique leur nom dans `contenu.js` → section 7 → `images: [...]`. Les photos actuelles sont des captures de ton Instagram, donc en basse définition.
- **Pour ajouter un projet :** copie le bloc `{ client: "Vila Haritza", ... }`, colle-le juste après (avec une virgule entre les deux) et change les textes et les images.
- **Logo :** les fichiers vectoriels sont dans `images/` (`logo-hego-lettres.svg`, `logo-hego-rond.svg`, `logo-hego-rond-blanc.svg`). Tu peux aussi les utiliser ailleurs (cartes de visite, signature e-mail).

---

## 6. Nom de domaine

Une adresse comme `hegostudio.pt` ou `hego.studio` fait plus pro que `xxx.vercel.app`.

1. Achète le domaine chez un registraire (PTisp, Amen.pt, OVHcloud…). Compte environ 10 à 30 € par an selon l'extension, à vérifier.
2. Dans Vercel : ton projet → **Settings → Domains** → ajoute le domaine. Vercel t'indique les réglages DNS à recopier chez le registraire.
3. Mets à jour l'adresse dans `index.html` (étape 3).

---

## 7. Ce que fait le site pour toi

- **Chaque bouton** (« Choisir », « Demander ce pack », le formulaire…) ouvre WhatsApp avec un message déjà écrit qui précise l'offre choisie, dans la langue du client.
- **Les 3 sites d'exemple** (boulangerie, barbier, restaurant) montrent aux commerçants ce qu'ils peuvent obtenir. Un bandeau en haut renvoie vers toi.
- **Aucun cookie, polices hébergées sur le site** : pas besoin de bandeau cookies (RGPD).

## 8. À vérifier côté administratif (avec un comptable)

- Statut au Portugal (trabalhador independente / recibos verdes) ou en France (micro-entreprise).
- **TVA :** les prix affichés n'en parlent pas. Si tu factures la TVA (IVA), ajoute « + IVA » ou « IVA incluído » dans les notes de prix.
- **Livro de Reclamações** électronique : le lien est déjà en bas de page, inscris-toi aussi sur livroreclamacoes.pt.
