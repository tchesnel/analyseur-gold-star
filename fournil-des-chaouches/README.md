# Le Fournil des Chaouches · site vitrine et commande en ligne

Site complet pour la boulangerie **Le Fournil des Chaouches**, à Ondres (Landes), élue meilleure baguette tradition des Landes en 2022 et en 2024.

C'est un site statique : pas de serveur, pas de base de données, pas d'abonnement. Il s'héberge gratuitement (Vercel, Netlify, GitHub Pages, OVH…).

## Ce que contient le site

| Section | Contenu |
|---|---|
| Accueil | Photo de la devanture, statut « Ouvert / Fermé » calculé en direct à l'heure de Paris, sceau du lauréat, appel et commande en un clic |
| Distinctions | 1er prix Landes 2022, 2e Nouvelle-Aquitaine 2022, 1er prix Landes 2024 (Parentis-en-Born, 8 avril 2024), citation d'ICI Gascogne |
| La maison | L'histoire de Pierre-Philippe et Clothilde, avec une frise chronologique |
| Savoir-faire | Ce qu'impose l'appellation « baguette de tradition française » |
| Boutique | 22 produits en 4 catégories, avec options (taille, garniture) et quantités |
| Click & Collect | Choix du jour et de l'heure de retrait selon les horaires et le délai de chaque produit, coordonnées, confirmation, n° de commande, ajout à l'agenda (.ics), impression |
| Événements | Formulaire de demande de devis (anniversaire, mariage, entreprise…) |
| Avis | Note Google 4,6/5 (307 avis), citations de la presse |
| Infos pratiques | Horaires avec le jour en cours mis en évidence, carte Google Maps, itinéraire, téléphone, e-mail, Facebook, accessibilité |
| Mobile | Barre fixe « Appeler / Panier », menu plein écran, panier en tiroir |

## Avant la mise en ligne

1. **E-mail de réception des commandes.** Dans `assets/js/config.js`, remplacez `email` par la vraie adresse de la boulangerie. Aucune adresse publique n'a été trouvée : celle qui est en place est provisoire.
2. **Activation (une seule fois).** Les commandes passent par [FormSubmit](https://formsubmit.co), un service gratuit et sans compte. La toute première commande envoie un e-mail d'activation à cette adresse. Il suffit de cliquer sur le lien. Ensuite, chaque commande arrive par e-mail sous forme de tableau, avec l'adresse du client en « répondre à ».
3. **Prix.** Dans `assets/js/produits.js`, vérifiez les prix. Seuls deux tarifs viennent d'une source (ICI Gascogne, 2022) : la baguette tradition à environ 1 € et le gâteau basque 4 parts à 10 €. Les autres sont indicatifs.
4. **Photos.** Les produits sont illustrés par des dessins vectoriels créés pour le site. Pour mettre une vraie photo, placez-la dans `assets/img/produits/` et renseignez `photo: "assets/img/produits/baguette.jpg"` sur le produit. La photo de la devanture vient de la fiche Google de la boulangerie : remplacez-la par une photo du patron si possible.
5. **Mentions légales.** Complétez l'hébergeur dans la fenêtre « Mentions légales » (`index.html`).

## Modes d'envoi des commandes (`config.js` → `commande.mode`)

| Mode | Fonctionnement |
|---|---|
| `formsubmit` (par défaut) | E-mail à la boulangerie via formsubmit.co |
| `endpoint` | POST JSON vers votre URL (serveur, Zapier, Make, n8n, Google Sheets…) |
| `mailto` | Ouvre la messagerie du client avec la commande pré-remplie |
| `demo` | Simule l'envoi, pour une présentation |

**Astuce pour une démo :** ajoutez `?demo` à l'adresse (ex. `https://…/index.html?demo`). Tout fonctionne, sans envoyer d'e-mail.

Si l'envoi échoue (réseau, service indisponible), le client voit son récapitulatif avec deux boutons de secours : envoyer la commande par e-mail ou appeler la boutique. Son panier est conservé. Aucune commande n'est perdue en silence.

## Modifier les horaires, congés, délais

Tout se règle dans `assets/js/config.js` :

- `horaires` : heures d'ouverture par jour (0 = dimanche).
- `fermeturesExceptionnelles` : jours de congés, par exemple `["2026-12-25", "2027-01-01"]`.
- `delaiMinimumMinutes` : délai minimum avant un retrait (2 h par défaut).
- `delaiHeures`, dans `produits.js` : délai propre à un produit (24 h pour les gâteaux entiers, 48 h pour les anniversaires). Les créneaux proposés s'adaptent automatiquement.

## Mise en ligne en 2 minutes (Vercel)

1. Sur vercel.com, cliquez sur « Add New Project » et importez ce dépôt.
2. Dans **Root Directory**, choisissez `fournil-des-chaouches`.
3. Cliquez sur Deploy, puis branchez le nom de domaine (ex. `lefournildeschaouches.fr`).

Pour tester en local, lancez `python3 -m http.server` dans ce dossier, puis ouvrez http://localhost:8000.

## Sources des informations

- Fiche Google Maps de la boulangerie : adresse, téléphone, note 4,6/5 sur 307 avis, accessibilité, photo de la devanture.
- Horaires relevés sur la vitrine (photo de la devanture) : du lundi au samedi 7h–20h, le dimanche 7h–13h.
- ICI Gascogne (Radio France), 22 avril et 31 mai 2022 : prix 2022, histoire des fondateurs, produits.
- Ville de Parentis-en-Born : palmarès du concours départemental 2024.
- Annuaire des entreprises (data.gouv.fr) : SARL, SIREN 894 886 274, créée en 2021.
- Page Facebook : facebook.com/chaouches.
