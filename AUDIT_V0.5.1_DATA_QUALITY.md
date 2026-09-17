# Audit final — Gold Live Analyzer v0.5.1 DATA QUALITY

Date de validation : 2026-09-16

## Pourquoi cette version existe

Les captures LIVE de la v0.5.0 ont révélé deux ambiguïtés dangereuses :

1. `DOM BID 0 %` pouvait représenter soit un vrai carnet équilibré, soit un carnet encore vide/partiel.
2. `US 10Y 0.00 %` et `Real yield 10Y 0.00 %` pouvaient provenir d'une donnée absente convertie silencieusement en zéro par JavaScript.

La v0.5.1 supprime ces deux ambiguïtés à la source.

## Correctifs DOM / Level II

- Une profondeur absente ou vide reste absente : elle ne devient jamais `0 %`.
- États explicites : `INDISPONIBLE`, `EN COLLECTE`, `PARTIEL`, `NEUTRE`, `BID`, `ASK`.
- Un imbalance exactement égal à `0` n'est affiché `NEUTRE 0 %` que lorsqu'il existe réellement des niveaux BID et ASK suffisants.
- Le moteur AUTO n'accorde aucun score Order Flow si l'imbalance est absent.
- Le nombre de niveaux BID/ASK est transporté jusqu'à l'interface pour diagnostiquer la qualité du carnet.

## Correctifs macro Gold

- Toute valeur `null`, vide, `undefined`, `.` ou non numérique reste absente.
- DXY, US10Y et real 10Y affichent `N/A` lorsqu'aucune source valide n'a répondu.
- Le calendrier macro peut continuer de fonctionner seul : état `DATA CALENDRIER`.
- US10Y et real 10Y utilisent désormais : `FRED → U.S. Treasury officiel → N/A`.
- Le parseur FRED rejette explicitement les observations vides.
- Le parseur XML Treasury accepte les balises avec attributs (`m:type`) et ne transforme jamais une absence de valeur en zéro.
- Une donnée macro absente ne contribue jamais au biais AUTO.

## Vérification 1/3 — tests logique / non-régression

Commande : `npm test`

Résultat final : **100/100 tests réussis, 0 échec**.

Les tests couvrent notamment :

- cTrader LIVE/OAuth/SSE ;
- quotes BID/ASK partielles ;
- Market Depth / Level II ;
- DOM absent vs DOM réellement neutre ;
- FRED valeurs vides ;
- parsing U.S. Treasury nominal et real 10Y avec attributs XML ;
- DXY broker prioritaire ;
- structure/liquidité/SMC ;
- Fibonacci ;
- AUTO layers ;
- Volume Profile ;
- AVWAP ;
- ADX/DMI ;
- BB Width ;
- macro/calendar/Fed ;
- absence d'exécution.

## Vérification 2/3 — architecture / sécurité / smoke

- `CHECK OK` — **54 fichiers JavaScript** + HTML/OAuth/vercel.json cohérents.
- `SECURITY CHECK OK` — OAuth `accounts` lecture seule, session chiffrée HttpOnly/Secure, aucun secret navigateur, aucune primitive d'exécution.
- `SMOKE OK` — LIVE par défaut, portail OAuth cTrader officiel, moteur de données prêt.

## Vérification 3/3 — stress

Commande : `node scripts/stress-v050.mjs`

Résultat : **3 000 analyses**, 500 contextes × 6 timeframes, **0 erreur**.

Contrôles : pas d'exception, pas de `NaN`/`Infinity`, pas de zone inversée, bornes RSI/ADX cohérentes, POC/VAH/VAL ordonnés, AUTO borné, `execution = null`.

## Contrôle visuel

Les captures de contrôle utilisent le front réel mais des états déterministes de test afin de forcer les cas limites. Elles ne sont pas présentées comme des données de marché LIVE.

- `01-quality-valid.png` : vrai DOM équilibré → `DOM NEUTRE 0 %`, macro valide → vraies valeurs affichées.
- `02-quality-missing.png` : DOM vide → `EN COLLECTE`, taux manquants → `N/A`, calendrier conservé.
- `03-top-valid.png` : bandeau supérieur avec DOM neutre valide.
- `04-top-collecting.png` : bandeau supérieur avec DOM en collecte.

## État final

- `execution = null`
- stratégies chargées : 0
- mode : LIVE par défaut
- moteur AUTO : actif
- données absentes : jamais converties en faux zéro
- fallback taux : FRED → U.S. Treasury → N/A

Cette version est la base recommandée avant l'ajout de la première stratégie.
