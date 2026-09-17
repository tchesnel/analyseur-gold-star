# R03 — données nécessaires pour la calibration Gold finale

## Priorité 1 — idéal
- XAUUSD M1 BID historique
- XAUUSD M1 ASK historique
- période couvrant au minimum 2021 → 2026

Cela permet : entrée BUY sur ASK, sortie/SL BUY sur BID, entrée SELL sur BID, sortie/SL SELL sur ASK, spread historique réel, trigger M1 exact.

## Priorité 2 — acceptable pour calibration de contexte
- CSV XAUUSD M5 canonique, OHLCV, 375 985 barres (2021-05-19 → 2026-09-07)

Il permet de calibrer contexte/impulsion/pullback/SL/TP M5 avec un trigger M1 proxy explicite, mais ne doit pas être présenté comme performance live exacte.

## Garde anti-erreur
Lancer :

```bash
node scripts/r03-dataset-guard.mjs /chemin/XAUUSD.csv
```

Un fichier ES/NQ/autre renvoie `DATASET_MISMATCH` et n'est jamais accepté comme calibration Gold.
