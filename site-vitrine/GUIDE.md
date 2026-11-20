# Ton site vitrine : mode d'emploi

Ce dossier contient ton site complet, prêt à mettre en ligne. Il est en **portugais** par défaut, avec une version **française** et **anglaise** (boutons PT / FR / EN en haut).

Le site choisit tout seul la langue du téléphone du visiteur. Pour forcer une langue dans un lien que tu envoies :

- `https://ton-site.pt/?lang=pt` → portugais
- `https://ton-site.pt/?lang=fr` → français (pratique pour les commerçants français au Portugal)
- `https://ton-site.pt/?lang=en` → anglais

---

## 1. Ce qu'il y a dans le dossier

| Fichier | À quoi il sert | Tu y touches ? |
|---|---|---|
| `contenu.js` | **Tous les textes, prix, ton téléphone, tes couleurs** | **Oui, c'est le seul** |
| `index.html` | La page (et l'aperçu quand tu partages le lien) | Une fois, voir étape 3 |
| `images/` | Ta photo, les captures des exemples, l'image d'aperçu | Pour ajouter ta photo |
| `exemples/` | 3 faux sites (boulangerie, barbier, restaurant) à montrer aux clients | Non |
| `style.css`, `script.js`, `polices/` | Le design et le moteur | Non |

---

## 2. Modifier ton site (sans rien installer)

Tout se fait sur **github.com**, depuis un ordinateur ou ton téléphone :

1. Ouvre ton dépôt sur GitHub, puis le fichier `contenu.js`.
2. Clique sur le **crayon ✏️** (« Edit this file »).
3. Modifie le texte **entre les guillemets** `"..."`.
4. Clique sur **« Commit changes »** (en vert), puis encore **« Commit changes »**.
5. Le site en ligne se met à jour tout seul en 1 minute environ.

### Les 4 règles pour ne rien casser

- Ne modifie que ce qui est **entre guillemets**.
- Garde la **virgule** à la fin des lignes.
- Ne supprime pas les `{ }` et `[ ]`.
- Si ton texte contient un guillemet `"`, utilise plutôt les guillemets typographiques « » ou “ ”.

Pour surligner un mot en jaune : entoure-le d'étoiles, ex. `"A montra do seu negócio, *aberta 24 horas.*"`

### La page est devenue blanche ?

Le site affiche alors un message « Le fichier contenu.js contient une erreur ». C'est presque toujours une virgule ou un guillemet oublié. Sur GitHub, ouvre `contenu.js` → bouton **History** → reviens à la version précédente, ou corrige la ligne que tu viens de modifier.

---

## 3. À remplacer avant de montrer le site (liste de contrôle)

Dans **`contenu.js`** (tout en haut) :

- [ ] `marque` : le nom de ton activité (actuellement « Montra », c'est un exemple)
- [ ] `nom` : ton prénom et nom (actuellement « Nome Apelido »)
- [ ] `telephone` : ton numéro tel qu'il s'affiche, ex. `"+351 912 345 678"`
- [ ] `whatsapp` : **le même numéro**, chiffres seulement, ex. `"351912345678"`
- [ ] `email`
- [ ] `photo` : voir étape 4
- [ ] Section **9. QUI SUIS-JE** : vérifie que les phrases te correspondent (pays d'origine, langues parlées…)
- [ ] Section **11. CONTACT** → `zone` : ta ville / ta région
- [ ] Section **6. TARIFS** : tes vrais prix
- [ ] Section **2. OFFRE** : garde, modifie ou cache le bandeau (`afficher: false`)

Dans **`index.html`** (le bloc encadré tout en haut, une seule fois) :

- [ ] Remplace `Montra` par ta marque dans les lignes `title` et `og:title`
- [ ] Remplace `https://example.com` par l'adresse de ton site (2 endroits) : c'est ce qui affiche la belle image d'aperçu quand tu envoies le lien sur WhatsApp

---

## 4. Ajouter ta photo

1. Prends une photo carrée, souriante, bien éclairée (format JPG, idéalement moins de 300 Ko).
2. Sur GitHub, ouvre le dossier `images/` → **Add file** → **Upload files** → dépose la photo, nommée par exemple `moi.jpg` → **Commit changes**.
3. Dans `contenu.js`, mets : `photo: "images/moi.jpg",`

Sans photo, le site affiche tes initiales sur un motif d'azulejo.

---

## 5. Mettre le site en ligne (gratuit)

### Option A : Vercel (recommandé, tu l'utilises déjà)

1. Va sur **vercel.com** → **Add New… → Project**.
2. Choisis ton dépôt GitHub qui contient le dossier `site-vitrine`.
3. Dans **Root Directory**, clique **Edit** et choisis `site-vitrine`.
4. **Framework Preset** : « Other ». Ne touche à rien d'autre → **Deploy**.
5. Ton site est en ligne à une adresse du type `ton-projet.vercel.app`.

Chaque modification sur GitHub met le site à jour automatiquement.

> Conseil : à terme, mets ce dossier dans **son propre dépôt GitHub** (ex. `mon-site-vitrine`), séparé de tes autres projets. Crée un dépôt vide et dis-le-moi, je peux y copier le site.

### Option B : Netlify

**app.netlify.com** → **Add new site → Import an existing project** → GitHub → ton dépôt → **Base directory** : `site-vitrine` → **Deploy**.

---

## 6. Ton propre nom de domaine (.pt)

Une adresse comme `montra.pt` fait beaucoup plus pro que `xxx.vercel.app`.

1. Achète le domaine chez un registraire portugais ou européen (ex. PTisp, Amen.pt, OVHcloud). Compte environ 10 à 20 € par an, à vérifier selon le registraire.
2. Dans Vercel : ton projet → **Settings → Domains** → ajoute ton domaine. Vercel t'indique les 1 ou 2 réglages DNS à copier chez le registraire.
3. Mets à jour l'adresse dans `index.html` (étape 3).

C'est aussi exactement ce que tu feras pour tes clients.

---

## 7. Quand tu auras tes premiers clients

Dans `contenu.js`, section **7. EXEMPLES**, remplace un exemple fictif par un vrai site :

```js
{
  nom: "Café Central",
  type: { pt: "Café", fr: "Café", en: "Café" },
  lien: "https://cafecentral.pt",
  image: "images/cafe-central.jpg"
},
```

L'étiquette « Negócio fictício » disparaît toute seule pour les vrais liens (ceux qui commencent par `https://`).

---

## 8. Ce que fait le site pour toi

- **Tous les boutons WhatsApp** ouvrent une conversation avec toi, avec un message déjà écrit dans la langue du visiteur.
- **Les boutons « Quero este » des tarifs** précisent la formule qui intéresse le client.
- **Le formulaire** n'a pas besoin de serveur : il ouvre WhatsApp (ou l'e-mail) avec le nom et le commerce du client déjà remplis.
- **Les 3 exemples** montrent le résultat sur téléphone. Si un commerçant clique sur « Encomendar » dans un exemple, une bulle lui explique que sur son vrai site, ce bouton l'enverrait vers lui, avec un bouton pour te contacter.
- **Aucun cookie, aucun traceur, polices hébergées sur le site** : pas besoin de bandeau cookies (RGPD).

---

## 9. Conseils pour démarcher

- **Montre les exemples sur ton téléphone**, en vrai, au comptoir. C'est le plus convaincant.
- Avant d'entrer, **cherche le commerce sur Google Maps** : souvent la fiche est incomplète (pas d'horaires, pas de photos, pas de site). C'est ton argument d'ouverture.
- Laisse une **petite carte avec un QR code** vers ton site (n'importe quel générateur de QR code gratuit fait l'affaire).
- Utilise l'**offre de lancement** pour signer tes premiers clients, puis demande-leur l'autorisation de les afficher comme exemples.

### À vérifier côté administratif au Portugal (avec un comptable)

- Ouvrir ton activité aux Finanças (trabalhador independente, recibos verdes).
- Le régime de TVA (IVA) : une exonération existe pour les petits chiffres d'affaires (article 53.º do CIVA). Si tu factures avec TVA, indique-le près des prix.
- Le **Livro de Reclamações** électronique : le lien est déjà en bas de page, il faut aussi t'inscrire sur livroreclamacoes.pt.
