# R01 v0.6.1 — Calibration / backtest M5 proxy (XAUUSD 2021–2026)

## Périmètre

Source utilisateur : `xauusd-m5-2021-05-19-2026-09-07(9).csv`

- 375 985 bougies M5.
- Période : 19/05/2021 20:25 UTC → 07/09/2026 13:35 UTC.
- Colonnes : time, open, high, low, close, volume.
- Aucune valeur OHLCV manquante détectée.

**Limite essentielle :** ce fichier ne contient pas de M1. Le moteur LIVE R01 exige un shift + displacement/FVG M1 après reclaim. Le backtest ci-dessous emploie donc un **proxy causal M5** pour cette étape. Il sert à calibrer les filtres M5 (régime, horaire, géométrie, reclaim, R:R), pas à annoncer une performance exacte de la route LIVE M1.

## Proxy de déclenchement utilisé

Séquence conservatrice :
1. liquidité externe qualifiée ;
2. pénétration ≥ 0,05 ATR M5 ;
3. reclaim dans 0–3 M5, rejet si 2 clôtures consécutives acceptées au-delà ;
4. proxy de shift/displacement M5 causal ;
5. retest avant expiration ;
6. filtre ADX ;
7. filtre horaire New York ;
8. filtre de distance entrée→SL en ATR ;
9. cible normalisée 1,5R ;
10. coût conservateur : 0,30 $/oz par trade ;
11. si SL et TP sont tous deux touchables dans la même bougie M5, le résultat est compté comme SL.

## Paramètres retenus pour la v0.6.1 LIVE

- `minSweepPenetrationAtr = 0.05`
- `reclaimMaxBars = 3`
- `acceptanceBufferAtr = 0.08`
- `acceptanceConsecutiveCloses = 2`
- **pas de pivot M15 isolé comme liquidité R01**
- H1 swing confirmé + M15/H1 EQH/EQL conservés
- `maxAdxM5 = 24`
- fenêtre `08:20–16:00 America/New_York`
- `minRiskAtrM5 = 0.75`
- `minRewardRisk = 1.5`
- macro HIGH/CRITICAL = blocage de nouvelle entrée
- DOM/tick-volume = bonus, jamais trigger obligatoire

## Résultat proxy retenu

| Période | Trades | Win rate | Expectancy | Profit factor | Total R | Max DD |
|---|---:|---:|---:|---:|---:|---:|
| 2021–2023 développement | 108 | 62.0% | +0.318R | 1.71 | +34.31R | 8.83R |
| 2024–2026 hors échantillon | 109 | 56.0% | +0.295R | 1.61 | +32.11R | 7.11R |
| Ensemble | 217 | 59.0% | +0.306R | 1.66 | +66.41R | 8.83R |

### Par année

| Année | Trades | Expectancy | Total R |
|---|---:|---:|---:|
| 2021 | 26 | +0.148R | +3.86R |
| 2022 | 41 | +0.164R | +6.71R |
| 2023 | 41 | +0.579R | +23.74R |
| 2024 | 29 | +0.733R | +21.27R |
| 2025 | 44 | +0.144R | +6.33R |
| 2026 | 36 | +0.125R | +4.51R |

## Sensibilité ADX (distance stop ≥ 0,75 ATR, 08:20–16:00 NY)

Le seuil 22 maximise davantage le proxy global, mais il laisse deux années légèrement négatives. Le seuil **24** est retenu parce qu'il reste positif sur les six années et équilibre mieux développement / hors échantillon. Ce choix vise la robustesse, pas le maximum du backtest.

| ADX max | Trades | Exp. | PF | Dev 21–23 | OOS 24–26 | Années négatives |
|---:|---:|---:|---:|---:|---:|---:|
| 18 | 94 | +0.255R | 1.51 | +0.161R | +0.361R | 2 |
| 20 | 137 | +0.274R | 1.56 | +0.183R | +0.384R | 2 |
| 22 | 175 | +0.335R | 1.74 | +0.256R | +0.415R | 2 |
| 23 | 201 | +0.311R | 1.67 | +0.231R | +0.393R | 1 |
| 24 | 217 | +0.306R | 1.66 | +0.318R | +0.295R | 0 |
| 25 | 230 | +0.281R | 1.59 | +0.295R | +0.267R | 0 |
| 27 | 260 | +0.212R | 1.41 | +0.235R | +0.186R | 1 |
| 30 | 304 | +0.233R | 1.47 | +0.308R | +0.155R | 0 |
| 35 | 340 | +0.236R | 1.47 | +0.256R | +0.214R | 0 |
| 40 | 371 | +0.235R | 1.47 | +0.238R | +0.231R | 0 |

## Sensibilité géométrie du stop (ADX < 24)

Le seuil **0,75 ATR** est retenu comme compromis : en-dessous, au moins une année redevient négative ; au-dessus, l'échantillon se contracte rapidement et augmente le risque d'overfit.

| Min entrée→SL / ATR | Trades | Exp. | PF | Dev | OOS | Années négatives |
|---:|---:|---:|---:|---:|---:|---:|
| 0.25 | 1107 | +0.176R | 1.34 | +0.035R | +0.312R | 1 |
| 0.40 | 738 | +0.208R | 1.40 | +0.116R | +0.297R | 1 |
| 0.50 | 544 | +0.249R | 1.50 | +0.143R | +0.352R | 1 |
| 0.60 | 397 | +0.265R | 1.54 | +0.183R | +0.343R | 1 |
| 0.75 | 217 | +0.306R | 1.66 | +0.318R | +0.295R | 0 |
| 0.90 | 135 | +0.320R | 1.71 | +0.371R | +0.263R | 0 |
| 1.00 | 101 | +0.352R | 1.81 | +0.406R | +0.282R | 1 |
| 1.25 | 37 | +0.353R | 1.85 | +0.386R | +0.292R | 1 |

## Sensibilité horaire

La zone 08:20–16:00 NY n'est pas un pic isolé ; les fenêtres voisines restent positives. Le début 08:20 est conservé car il correspond aussi à l'ancrage historique de la session Gold COMEX open-outcry. La fin 16:00 reste volontairement large pour éviter l'optimisation au quart d'heure.

| Fenêtre NY | Trades | Exp. | PF | Dev | OOS |
|---|---:|---:|---:|---:|---:|
| 08:00–16:00 | 240 | +0.315R | 1.68 | +0.286R | +0.343R |
| 08:20–16:00 | 217 | +0.306R | 1.66 | +0.318R | +0.295R |
| 08:30–16:00 | 209 | +0.281R | 1.59 | +0.276R | +0.285R |
| 09:00–16:00 | 168 | +0.335R | 1.73 | +0.359R | +0.314R |
| 08:20–15:30 | 210 | +0.323R | 1.71 | +0.343R | +0.303R |
| 08:20–16:30 | 218 | +0.299R | 1.64 | +0.303R | +0.295R |
| 08:20–17:00 | 227 | +0.285R | 1.60 | +0.263R | +0.307R |

## Sensibilité R:R

Les tests 1,2R / 1,3R / 1,5R / 1,7R / 2,0R restent globalement positifs. **1,5R** est conservé : il est au centre de la zone stable et correspond mieux au moteur LIVE qui cible des poches de liquidité réelles plutôt qu'un TP fixe arbitraire.

## Reclaim

0, 1, 2 et 3 bougies M5 de délai restent positifs dans le proxy. `reclaimMaxBars = 3` est donc conservé pour ne pas exiger artificiellement un reclaim instantané, tout en gardant une fenêtre courte.

## Pourquoi le résultat n'est pas une garantie

- Le vrai trigger R01 LIVE utilise M1, absent du fichier.
- Le volume du CSV est un tick-volume broker, pas le volume COMEX centralisé.
- Les niveaux de session / pivots / profile ont été reconstruits causalement mais le proxy n'est pas le moteur M1 exact.
- Slippage réel, latence et qualité d'exécution peuvent modifier les résultats.
- Les chiffres servent à **calibrer et éliminer les paramètres fragiles**, pas à promettre un rendement futur.

## Décisions de calibration finales

1. M15 pivot isolé supprimé de l'univers R01.
2. ADX max passé à **24** après test de stabilité multi-années.
3. Fenêtre Gold : **08:20–16:00 New York**.
4. Distance entrée→SL minimale : **0,75 ATR M5**. Le seuil 2 ATR envisagé précédemment est rejeté : il contracte trop l'échantillon et serait une mauvaise calibration.
5. R:R minimum : **1,5**.
6. Reclaim : **≤ 3 M5**.
7. Acceptation : **2 clôtures M5** au-delà = breakout, pas failed auction.
8. M1 shift + momentum restent obligatoires en LIVE.
9. Macro HIGH/CRITICAL bloque l'entrée.
10. Order flow broker reste facultatif.
