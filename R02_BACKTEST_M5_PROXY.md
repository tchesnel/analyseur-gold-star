# R02 — Balance Breakout / Acceptance — backtest M5 proxy

## Statut

Backtest de calibration **BUY-only** pour R02 v0.7.1 sur le CSV XAUUSD M5 fourni par l'utilisateur.

- Période : 2021-05-19 20:25 UTC → 2026-09-07 13:35 UTC.
- 375 985 bougies M5, 0 timestamp dupliqué.
- Les interruptions de cotation/week-ends/maintenance restent celles du fichier source ; elles ne sont pas comblées artificiellement.
- Les équations EMA/ATR/ADX du backtest sont les mêmes que celles du moteur JavaScript LIVE.
- Hypothèse de friction de base : **0,30 $/oz par trade**, déduite en R selon la distance du stop.
- Un seul trade proxy à la fois.
- Si SL et TP sont tous les deux touchables dans la même bougie M5, le test attribue le **SL** (hypothèse conservatrice).
- Sortie temporelle maximale du proxy : 144 bougies M5 (12 h).

## Limite principale

Le CSV ne contient que du M5. Le moteur LIVE R02 exige une vraie reprise M1 après le retest : clôture haussière au-dessus des 5 micro-highs précédents + displacement M1 >= 1,10 ATR M1 dans une fenêtre de 20 minutes.

Le backtest remplace uniquement ce trigger M1 par un **proxy causal M5** : première cassure haussière après le retest dans les 4 bougies M5 suivantes avec range >= 0,70 ATR M5. Le contexte H4/H1/M5, la balance, la cassure, l'acceptation et le retest utilisent les mathématiques exactes du moteur LIVE.

Les chiffres ci-dessous ne sont donc **pas** une performance exacte ni garantie du LIVE. Le filtre macro HIGH/CRITICAL et le spread cTrader LIVE ne peuvent pas non plus être reconstruits exactement depuis le CSV OHLCV ; ils restent des garde-fous LIVE additionnels.

## Configuration retenue

```text
Direction              BUY uniquement
Balance                60 H1 clôturées
Largeur balance        4,0–12,0 ATR H1
Efficiency ratio max   0,32
Pression bord haut     >= 5 clôtures sur les 6 dernières H1
Zone pression          35 % supérieurs de la balance
Bias H4                close > EMA20 > EMA50
Pénétration breakout   >= 0,10 ATR M5
Character change       TR >= 1,30 ATR M5
Tick-volume breakout   >= 1,20 x médiane des 20 M5 précédentes
ADX acceleration       ADX14 actuel - ADX14[5] >= +1,0
Réarmement             6 clôtures M5 dans la balance avant break
Acceptation             2 clôtures M5 consécutives hors balance
Buffer acceptation     0,08 ATR M5
Fenêtre acceptation    max 4 M5
Réintégration invalide close < boundary - 0,10 ATR M5
Premier retest         max 12 M5 après acceptation
Bande retest           <= boundary + 0,35 ATR M5
Trigger LIVE           reprise M1 obligatoire
Stop buffer            0,12 ATR M5
Risque admissible      0,50–3,00 ATR M5
TP2 calibré            2,25R
Macro LIVE             HIGH / CRITICAL = NO NEW ENTRY
Exécution              aucune (execution = null)
```

## Résultat exact-math proxy

| Échantillon | Trades | Win rate | Expectancy | Profit Factor | Total | Max DD |
|---|---:|---:|---:|---:|---:|---:|
| 2021–2026 | 45 | 55,56 % | **+0,692R** | **2,40** | **+31,12R** | **2,38R** |
| Développement 2021–2023 | 18 | 55,56 % | **+0,657R** | **2,28** | **+11,82R** | **2,38R** |
| Hors échantillon 2024–2026 | 27 | 55,56 % | **+0,715R** | **2,49** | **+19,30R** | **2,27R** |

### Par année

| Année | Trades | Expectancy | PF | Total R |
|---|---:|---:|---:|---:|
| 2021 | 3 | +0,973R | 3,41 | +2,92R |
| 2022 | 6 | +1,019R | 3,76 | +6,12R |
| 2023 | 9 | +0,310R | 1,48 | +2,79R |
| 2024 | 11 | +0,968R | 3,45 | +10,65R |
| 2025 | 13 | +0,653R | 2,30 | +8,49R |
| 2026* | 3 | +0,052R | 1,08 | +0,16R |

`*` 2026 est partiel jusqu'au 7 septembre et l'échantillon annuel est trop petit pour une conclusion autonome.

### Blocs roulants de deux ans

| Bloc | Trades | Expectancy | PF |
|---|---:|---:|---:|
| 2021–2022 | 9 | +1,004R | 3,64 |
| 2022–2023 | 15 | +0,594R | 2,11 |
| 2023–2024 | 20 | +0,672R | 2,33 |
| 2024–2025 | 24 | +0,797R | 2,75 |
| 2025–2026 | 16 | +0,540R | 2,00 |

## Pourquoi BUY-only

La même logique symétrique SELL a été testée avec les mêmes équations et les mêmes paramètres. Elle ne passe pas le hors-échantillon :

| Branche | Période | Trades | Expectancy | PF | Total |
|---|---|---:|---:|---:|---:|
| BUY | 2024–2026 OOS | 27 | **+0,715R** | **2,49** | **+19,30R** |
| SELL | 2024–2026 OOS | 12 | **-0,687R** | **0,24** | **-8,24R** |

R02 v0.7.1 désactive donc SELL. Cela ne signifie pas qu'un breakout Gold ne peut pas être vendu ; cela signifie que **cette formule précise**, appliquée au dataset fourni, ne justifie pas de rendre la branche SELL active. Une route SELL devra être recherchée/calibrée séparément au lieu de forcer une symétrie.

## Sensibilité des paramètres

Le réglage retenu n'est pas un point unique dont toute la performance dépend.

### Durée de balance H1

| H1 | Trades | Expectancy | PF |
|---:|---:|---:|---:|
| 54 | 40 | +0,761R | 2,62 |
| **60** | **45** | **+0,692R** | **2,40** |
| 66 | 42 | +0,439R | 1,76 |
| 72 | 39 | +0,556R | 2,03 |

### Efficiency ratio maximum

| Max ER | Trades | Expectancy | PF |
|---:|---:|---:|---:|
| 0,28 | 37 | +0,728R | 2,51 |
| 0,30 | 41 | +0,707R | 2,45 |
| **0,32** | **45** | **+0,692R** | **2,40** |
| 0,34 | 47 | +0,616R | 2,19 |
| 0,36 | 50 | +0,515R | 1,94 |

### Objectif R:R

| Cible | Trades | Expectancy | PF |
|---:|---:|---:|---:|
| 1,75R | 45 | +0,475R | 2,02 |
| 2,00R | 45 | +0,553R | 2,12 |
| **2,25R** | **45** | **+0,692R** | **2,40** |
| 2,50R | 45 | +0,509R | 1,88 |
| 2,75R | 45 | +0,620R | 2,07 |

Le 2,25R est le meilleur de cette petite grille, mais les valeurs voisines restent positives ; il n'est pas un seuil isolé indispensable au résultat.

### Friction plus sévère

| Coût supposé / oz | Expectancy | PF | Max DD |
|---:|---:|---:|---:|
| 0,30 $ | +0,692R | 2,40 | 2,38R |
| 0,50 $ | +0,616R | 2,17 | 2,63R |
| 0,75 $ | +0,520R | 1,92 | 3,05R |
| 1,00 $ | +0,425R | 1,70 | 3,48R |
| 1,25 $ | +0,330R | 1,51 | 4,42R |
| 1,50 $ | +0,235R | 1,34 | 5,46R |

## Bootstrap indicatif

50 000 rééchantillonnages IID des 45 trades, seed fixe 20260916 :

- intervalle 95 % expectancy : environ **+0,205R à +1,139R** ;
- médiane : +0,692R ;
- intervalle 95 % PF : environ **1,31 à 4,36** ;
- P(expectancy > 0) dans ce bootstrap : ~99,8 % ;
- drawdown bootstrap médian ~4,52R ; 95e percentile ~8,75R ; 97,5e ~9,87R.

Ce bootstrap **ne corrige pas** le data-snooping lié au choix des paramètres et suppose des trades IID ; il est seulement un stress statistique supplémentaire, pas une preuve de performance future.

## Cohérence recherche → code

Les sources futures/order-flow consultées convergent sur les éléments suivants :

1. la balance doit être mature/comprimée avant la cassure ;
2. la pression/positioning doit se construire près de la frontière ;
3. une vraie cassure doit montrer un changement de caractère (range/momentum/volume/order flow) ;
4. le simple spike de stops n'est pas suffisant ; il faut de la continuation/acceptation des nouveaux prix ;
5. une réintégration rapide de l'ancien range est un signal de breakout failure, pas R02 ;
6. un retest qui tient permet une entrée plus contrôlée que de poursuivre la première impulsion.

La configuration numérique (60 H1, 5/6, 1,30 ATR, 1,20x volume, +1 ADX, 2 closes, 12 M5, 2,25R, etc.) est **empirique et propre à cette calibration**, pas une règle universelle issue des sources.

## Reproductibilité

Le script `backtests/r02_m5_proxy_exact.py` reproduit les 45 trades à partir du CSV source et écrit `R02_BACKTEST_RESULTS.json` et `R02_BACKTEST_M5_PROXY_TRADES.csv`.

Une comparaison byte/logique indépendante a confirmé que la sortie reproductible possède les mêmes 45 lignes et les mêmes valeurs numériques que le fichier de calibration exact-math utilisé pour figer v0.7.1.
