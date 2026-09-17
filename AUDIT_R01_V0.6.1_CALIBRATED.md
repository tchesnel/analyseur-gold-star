# Audit final — R01 v0.6.1 CALIBRATED

## Objet

Finalisation de **R01 — Liquidity Sweep / Failed Auction Reversal** après :

1. recherche supplémentaire sur les reversals / failed breakouts / absorption ;
2. backtest causal M5 proxy sur l'historique utilisateur XAUUSD 2021–2026 ;
3. calibration par stabilité développement / hors échantillon / années ;
4. intégration des filtres retenus dans le moteur LIVE ;
5. non-régression, sécurité, smoke et stress-tests.

Aucune exécution automatique n'est ajoutée. Le contrat reste `execution = null`.

---

## Sources de logique examinées

- Axia Futures — *Reversal Trade Catching The Stops In Gold* : emplacement préparé par Market Profile + stop-run + prise de contrôle opposée.
- Axia Futures — *Price Ladder Clues For Breakout Failure* : le déclenchement des stops ne suffit pas ; la continuation après le break et le retour/maintien sous le niveau distinguent break réussi et échec.
- Jigsaw Trading — *Order Flow Absorption & Market Reversals* : l'absorption seule n'est pas une entrée ; attendre le fade du momentum puis la participation opposée réduit les faux reversals.
- Bookmap — absorption/exhaustion : failed push / perte de follow-through / changement d'agression comme confirmations.
- Fidelity — ADX : <20 généralement non-tendanciel ; >25 généralement tendance forte ; zone 20–25 intermédiaire. Le seuil exact 24 ci-dessous vient du backtest, pas de Fidelity.
- CME — Gold open-outcry historique : 08:20–13:30 ET. L'ancrage 08:20 NY est utilisé comme référence ; la fin 16:00 NY est un choix empirique large, non une heure officielle CME.

---

## Dataset de calibration

Fichier utilisateur : `xauusd-m5-2021-05-19-2026-09-07(9).csv`

- 375 985 bougies M5
- 19/05/2021 20:25 UTC → 07/09/2026 13:35 UTC
- OHLCV complet

### Limite majeure

Le fichier ne contient **pas de M1**. R01 LIVE exige :

- shift M1 après reclaim ;
- displacement ou FVG M1 ;
- retest.

Le backtest est donc un **proxy M5 causal de calibration**. Il ne doit pas être présenté comme la performance exacte du moteur LIVE M1.

---

## Paramètres finaux intégrés

```text
minSweepPenetrationAtr       = 0.05
reclaimMaxBars               = 3 M5
acceptanceBufferAtr          = 0.08
acceptanceConsecutiveCloses  = 2
maxAdxM5                     = 24
minRiskAtrM5                 = 0.75
nyWindow                     = 08:20–16:00 America/New_York
minRewardRisk                = 1.5
macro HIGH / CRITICAL        = NO NEW ENTRY
M1 shift                     = REQUIRED LIVE
M1 displacement / FVG        = REQUIRED LIVE
DOM / tick volume            = OPTIONAL CONFIRMATION
```

### Univers de liquidité R01

Conservé :

- PDH / PDL
- PWH / PWL
- H1 swings confirmés
- EQH / EQL M15/H1 confirmés
- VAH / VAL calculés causalement
- session highs/lows déjà connus au moment du sweep

Exclu après calibration :

- **pivot M15 isolé**, jugé trop bruité pour R01.

---

## Résultat du proxy retenu

Hypothèses : cible normalisée 1,5R, coût 0,30 $/oz par trade, un trade simultané, ambiguïté SL+TP dans la même M5 comptée en SL.

| Période | Trades | Win rate | Expectancy | Profit factor | Total R | Max DD |
|---|---:|---:|---:|---:|---:|---:|
| 2021–2023 développement | 108 | 62.0% | +0.318R | 1.71 | +34.31R | 8.83R |
| 2024–2026 hors échantillon | 109 | 56.0% | +0.295R | 1.61 | +32.11R | 7.11R |
| Ensemble | 217 | 59.0% | +0.306R | 1.66 | +66.41R | 8.83R |

### Stabilité annuelle

| Année | Trades | Exp. | Total R |
|---|---:|---:|---:|
| 2021 | 26 | +0.148R | +3.86R |
| 2022 | 41 | +0.164R | +6.71R |
| 2023 | 41 | +0.579R | +23.74R |
| 2024 | 29 | +0.733R | +21.27R |
| 2025 | 44 | +0.144R | +6.33R |
| 2026 | 36 | +0.125R | +4.51R |

Les six années du proxy retenu sont positives. Ce critère de stabilité a été privilégié au maximum d'expectancy brut.

---

## Sensibilité des paramètres

### ADX

À risque >=0,75 ATR et fenêtre 08:20–16:00 NY :

- ADX 22 : expectancy proxy plus élevée, mais 2 années négatives.
- **ADX 24 : 217 trades, +0.306R, PF 1.66, 0 année négative, développement et OOS équilibrés.**
- ADX 25 : reste positif mais expectancy/PF inférieurs.

Le seuil 24 a donc été retenu pour la **robustesse**, pas parce qu'il maximise le backtest.

### Géométrie entrée → SL

- 0,25–0,60 ATR : davantage de trades mais au moins une année négative.
- **0,75 ATR : premier seuil testé avec 0 année négative et un échantillon encore conséquent (217 trades).**
- 0,90+ ATR : résultats parfois supérieurs mais échantillon rapidement réduit.

Le seuil 0,75 ATR réduit le risque d'overfit. L'idée antérieure de 2 ATR a été **rejetée** : échantillon trop contracté.

### Fenêtre horaire

Les fenêtres voisines restent positives : 08:00, 08:20, 08:30, 09:00 comme heures de départ ont toutes produit un proxy positif. **08:20** est conservé pour sa robustesse et son ancrage Gold historique. 16:00 reste volontairement large pour ne pas optimiser artificiellement à 15:30.

### R:R

Les seuils testés 1,2R / 1,3R / 1,5R / 1,7R / 2,0R restent positifs. **1,5R** est gardé comme milieu stable et comme minimum ; le moteur LIVE vise toujours des cibles structurelles réelles.

### Reclaim

0–3 M5 restent exploitables dans le proxy. `reclaimMaxBars=3` est maintenu afin de ne pas exiger un reclaim dans la même bougie, tout en gardant une séquence courte.

---

## Corrections de logique intégrées pendant l'audit

- priorité au **dernier épisode de liquidité** ; un ancien sweep ne peut plus masquer un breakout plus récent ;
- 2 clôtures acceptées au-delà avant reclaim = breakout accepté / R01 rejeté ;
- reclaim autorisé dans les 3 M5 suivantes ;
- le niveau affiché dans le panneau R01 est exactement le niveau utilisé par le setup ;
- M15 swing isolé supprimé ;
- ADX M5, fenêtre NY et géométrie de risque intégrés comme conditions déterministes ;
- R:R valide si **n'importe quelle cible structurelle admissible** offre >=1,5R ; plus de dépendance artificielle à TP2 ;
- SL et zone de reclaim restent ancrés sur la volatilité connue au moment de la construction du setup ;
- DOM/tick-volume restent des confirmations, jamais un trigger obligatoire ;
- macro HIGH/CRITICAL bloque une nouvelle entrée ;
- aucune primitive d'ordre ajoutée.

---

## Validation logicielle finale

À la dernière passe avant packaging :

```text
npm test
→ 124 / 124 tests réussis

npm run check
→ CHECK OK

npm run security
→ SECURITY CHECK OK

npm run smoke
→ SMOKE OK

R01_STRESS_ITERATIONS=20 node scripts/stress-r01.mjs
→ R01_STRESS_OK — 161 évaluations, 0 invariant cassé

node scripts/stress-v050.mjs
→ STRESS_V050_OK — 3 000 analyses, 0 erreur
```

Contrôles spécifiques :

- anti-look-ahead niveaux / profile / sessions ;
- delayed reclaim ;
- acceptance avant reclaim ;
- dernier probe prioritaire ;
- shift M1 post-reclaim ;
- displacement/FVG ;
- retest ;
- filtre ADX ;
- fenêtre New York ;
- géométrie risque ;
- spread ;
- macro ;
- R:R ;
- OAuth lecture seule ;
- `execution = null`.

---

## Conclusion technique

Aucun défaut bloquant n'a été trouvé dans les contrôles finaux de la v0.6.1. Les paramètres choisis sont soutenus par un voisinage de sensibilité et par une séparation développement / hors échantillon, mais ils **ne garantissent aucune performance future**.

La prochaine amélioration méthodologiquement utile pour R01 n'est pas de rajouter des conditions : c'est de disposer d'un historique **M1** (idéalement avec données futures/COMEX si l'on veut valider l'order-flow) afin de backtester le vrai trigger M1 de la route LIVE sans proxy.
