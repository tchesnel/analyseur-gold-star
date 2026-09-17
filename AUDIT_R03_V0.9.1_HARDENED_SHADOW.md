# R03 v0.9.1 — Trend Pullback Continuation — audit, falsification externe et durcissement

Date : 2026-09-16

## Verdict

R03 **n'est pas promue ACTIVE** dans cette version. Elle reste **RESEARCH / SHADOW**.

Ce choix est volontaire : le fichier nouvellement fourni est un historique **ES (E-mini S&P 500) M1**, pas XAUUSD. Il permet un test externe de falsification utile, mais pas une calibration Gold honnête. Le garde de dataset v0.9.1 refuse désormais automatiquement d'utiliser un fichier non-XAUUSD comme historique de calibration Gold.

Le moteur R03 a en revanche été durci techniquement et un bug réel d'invalidation broker-side a été trouvé puis corrigé.

---

## 1. Dataset externe reçu

Fichier : `ES_v_0_OHLCV_1m_2020-01-01_2026-08-15(2).csv`

- Instrument détecté : `ES.v.0`
- Classe : **ES**, pas XAUUSD
- Résolution : M1
- Lignes : **2 338 835**
- Période : 2020-01-01 → 2026-08-14
- OHLCV complet dans l'audit de données
- SHA-256 : `e673a15fb42d366e5e04e32b7fc4b20a19206b7daaa2eef78e5302eb180788e2`

Le script `scripts/r03-dataset-guard.mjs` produit :

- `--external` : autorise le fichier comme **EXTERNAL_FALSIFICATION** ;
- mode calibration Gold : refuse le fichier avec `DATASET_MISMATCH`.

Aucun chiffre ES n'est étiqueté XAUUSD dans ce projet.

---

## 2. Test externe de la paramétrisation R03 actuelle

Le test ES est un **proxy causal de l'architecture R03**, avec :

1. contexte multi-timeframe fermé ;
2. impulsion M5 ;
3. pullback moins volumineux / moins énergétique ;
4. interaction zone AVWAP/FVG/OB/breakout ;
5. confirmation M1 ;
6. entrée après confirmation avec friction ;
7. stop structurel ;
8. TP2 = 2R ;
9. stop-first si SL et TP sont touchables dans la même M1 ;
10. une seule position R03 à la fois ;
11. time-stop 720 minutes ;
12. coûts conservateurs ES de 0,50 point par côté dans ce test de falsification.

### Résultat — configuration candidate actuelle

| Mesure | ES externe |
|---|---:|
| Trades non superposés | **310** |
| Win rate | **26,45 %** |
| Expectancy | **−0,432R/trade** |
| Profit Factor | **0,516** |
| Net | **−133,98R** |
| Max DD | **141,58R** |

### Chronologie

| Segment | Trades | WR | Exp. | PF | Net R |
|---|---:|---:|---:|---:|---:|
| DEV 2020–2023 | 187 | 26,20 % | −0,442R | 0,504 | −82,74R |
| VAL 2024–2025 | 88 | 22,73 % | −0,566R | 0,410 | −49,81R |
| SEALED 2026 | 35 | 37,14 % | −0,041R | 0,944 | −1,44R |

### Direction

| Sens | Trades | WR | Exp. | PF | Net R |
|---|---:|---:|---:|---:|---:|
| BUY | 181 | 23,20 % | −0,562R | 0,416 | −101,70R |
| SELL | 129 | 31,01 % | −0,250R | 0,686 | −32,28R |

Conclusion : **le modèle générique n'est pas robuste cross-market**. Ce n'est pas une preuve d'échec sur Gold, mais c'est une raison forte de ne pas promouvoir des seuils simplement parce qu'ils semblent intuitifs.

Le détail des 310 trades est conservé dans `R03_ES_EXTERNAL_ROBUSTNESS_TRADES.csv`.

---

## 3. Stress de voisinage des paramètres

Un voisinage de **243 combinaisons** a perturbé :

- impulsion minimum : 1,25 / 1,50 / 1,75 ATR ;
- ratio volume pullback max : 0,80 / 0,88 / 0,95 ;
- ratio énergie pullback max : 0,80 / 0,90 / 1,00 ;
- displacement M1 minimum : 0,70 / 0,85 / 1,00 ATR ;
- cible : 1,5 / 2,0 / 2,5R.

Risque structurel conservé entre 0,50 et 2,00 ATR, confirmation volume M1 >= 1,05x, ADX >= 18, retracement 18–68 %, entrée causale et non superposition.

### Résultat

- Combinaisons testées : **243**
- Combinaisons avec expectancy > 0 à la fois en DEV et VAL : **0 / 243**
- Combinaisons avec PF > 1 à la fois en DEV et VAL : **0 / 243**

La meilleure zone ES reste négative sur les deux blocs anciens. Il n'existe donc pas de plateau externe qui justifierait une optimisation opportuniste de R03 sur ES.

Le tableau complet est conservé dans `R03_ES_PARAMETER_NEIGHBORHOOD_243.csv`.

---

## 4. Ce que les preuves Gold antérieures disent réellement

Les archives Gold antérieures contiennent des familles de pullback rentables, mais elles **ne sont pas équivalentes à la R03 v0.9.x actuelle**.

### Ancienne Route 03 structurelle M30

Un ancien moteur R03 M30 LONG avait : structure HH/HL, breakout-retest, régime H1 EMA50/EMA200, stop structurel +0,18 ATR, plafond 2 ATR, TP 2R/3R.

Rapport antérieur :

- 146 trades ;
- +0,217R/trade ;
- PF 1,36 ;
- +31,66R ;
- DD 8,05R.

C'est une preuve que la **famille continuation/pullback peut fonctionner sur Gold**, pas une validation de la R03 actuelle.

### Route 18 NY EMA50/VWAP rejection

Autre famille pullback Gold documentée :

- 838 trades sur le rapport de recherche ;
- +0,162R/trade ;
- PF 1,279 ;
- +135,52R ;
- 2026 scellé plus fort que les périodes anciennes.

Elle était néanmoins maintenue SHADOW dans ce rapport et des audits ultérieurs ont montré l'importance de la parité exacte entre générateur historique et moteur live.

### Ancien chiffre R03 68 trades / PF 2,79

Un manifeste historique mentionne 68 trades, PF 2,79 et +50,37R pour une ancienne R03, mais l'audit ultérieur classe ce chiffre **« rapport fourni » et non « reproduit »** : le script générateur manquait. Cette statistique n'est donc **pas utilisée comme certification** de la nouvelle R03.

---

## 5. Bugs / fragilités trouvés et corrigés en v0.9.1

### A. Invalidation stop dépendante du plan — CORRIGÉ

Défaut trouvé pendant les nouveaux tests : le stop broker-side n'était contrôlé que si un `plan` restait constructible. Si le quote avait déjà traversé l'invalidation mais rendait simultanément la géométrie du plan non valide, R03 pouvait revenir à `CONFIRMED` au lieu de `INVALIDATED`.

Correction : `r03StructuralStop()` existe indépendamment du ticket de trade. Le setup est invalidé directement par :

- BUY : **BID <= stop structurel** ;
- SELL : **ASK >= stop structurel**.

Le SELL conserve son buffer spread pour que l'invalidation trade-side corresponde au broker.

### B. Volume manquant silencieux — CORRIGÉ

Avant v0.9.1, plusieurs helpers pouvaient convertir un volume absent en zéro lors d'agrégations.

Correction :

- `r03VolumeHealth()` audite M1 et M5 ;
- volume absent/majoritairement nul => `VOLUME_FEED_MISSING` ;
- R03 fail-closed ;
- aucune entrée ne peut être validée depuis des zéros artificiels.

### C. Lookahead sur bougie en formation — TEST DE NON-RÉGRESSION AJOUTÉ

Un test injecte des valeurs absurdes dans une M1 et une M5 non clôturées. Stage, direction, entry, SL, TP1 et TP2 doivent rester strictement identiques.

### D. Stop artificiellement élargi — TEST DE NON-RÉGRESSION AJOUTÉ

Si le prix live s'éloigne et fait sortir le risque des bornes, `plan = null`. Le moteur ne déplace jamais le stop pour forcer la validation.

### E. Exécution historique conservatrice — CONTRAT AJOUTÉ

`backtests/r03-execution-model.mjs` verrouille :

- gap à travers le stop => fill à l'open réel, pas au niveau de stop ;
- SL + TP touchables dans la même barre => **SL prioritaire** ;
- calcul R depuis le prix réellement simulé.

### F. Dataset Gold vs externe — GARDE AJOUTÉ

Un ES, NQ ou autre instrument ne peut plus être passé par erreur comme dataset de calibration Gold.

---

## 6. Vérifications code v0.9.1

À finaliser après création de ce rapport :

- suite `npm test` complète ;
- `npm run check` ;
- `npm run security` ;
- `npm run smoke` ;
- stress R03 BUY/SELL/scénarios ;
- archive ZIP + SHA-256.

Aucune primitive d'exécution broker n'est ajoutée. `execution = null` reste un invariant.

---

## 7. Condition de promotion R03

R03 restera SHADOW jusqu'à un replay XAUUSD brut reproductible.

Dataset préféré : **XAUUSD M1 BID + ASK**. À défaut, le M5 canonique peut calibrer le contexte avec un proxy M1 explicitement déclaré, comme R01/R02, mais cela ne constituera pas une preuve d'exécution M1 exacte.

Processus prévu :

1. audit du CSV + SHA-256 ;
2. DEV 2021–2023 ;
3. VAL 2024–2025 ;
4. gel des paramètres ;
5. révélation 2026 uniquement après gel ;
6. BUY et SELL séparés ;
7. voisinage de paramètres ;
8. coûts x1 / x2 / x3 ;
9. same-bar stop-first ;
10. gaps au vrai open ;
11. suppression des meilleurs trades / bootstrap ;
12. parité live/backtest via le **même moteur R03** ;
13. seulement ensuite décision de promotion.

Le but n'est pas de maximiser le PF in-sample, mais d'obtenir une zone de paramètres qui reste positive après perturbation et hors échantillon.

## Addendum v0.9.2 — ordre des objectifs + firewall de promotion

Un recomptage indépendant du CSV de 310 trades ES a trouvé **40 lignes** où l'ancien `TP1` structurel était plus éloigné que le `TP2` fixe 2R. Ce défaut n'altérait pas le diagnostic ES global négatif (le replay externe liquidait sur TP2/SL), mais il rendait le ticket et toute future gestion partielle incohérents.

Correction v0.9.2 :
- la cible structurelle est conservée ;
- le niveau fixe 2R est conservé ;
- les deux sont **ordonnés chronologiquement** dans le sens du trade ;
- si la cible structurelle est <=2R, elle est TP1 ; sinon 2R devient TP1 et l'extrême structurel devient TP2 ;
- `rr1 <= rr2` et l'ordre prix TP1/TP2 sont désormais des invariants testés BUY/SELL.

Un second verrou a été ajouté : la définition de R03 porte désormais `mode: shadow` et `promotionGate: XAUUSD_REPLAY_REQUIRED`. `StrategyRuntime` expose `actionable=false` pour toute stratégie SHADOW, même si son moteur atteint mécaniquement `ENTRY_READY`. Cela évite qu'une future couche de sélection confonde un setup de recherche avec une stratégie promue.
