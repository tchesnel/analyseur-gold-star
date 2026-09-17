# Audit v0.3.4 — Adaptive LIVE Zones

## Contrôles visuels

1. `01-buy-sell-confirmed.png` : une BUY ZONE et une SELL ZONE confirmées sont toutes les deux préservées. La zone éloignée reste signalée hors écran.
2. `02-sell-zone-live.png` : lorsque le BID entre dans la SELL ZONE, son libellé devient `SELL ZONE A · LIVE` et le contour est renforcé.
3. `03-candidates.png` : en l'absence de confluence confirmée, BUY/SELL CANDIDATE sont affichés en pointillés et restent distincts d'une zone confirmée.

Ces captures utilisent le renderer réel `assets/chart.js` et le moteur `buildAdaptivePois`.

## Règles importantes

- Une SELL ZONE confirmée n'est jamais inventée : elle exige une confluence réelle OB + FVG/iFVG.
- Un SELL CANDIDATE est une zone de contexte, pas une confirmation.
- Les zones sont recalculées et reclassées avec le prix LIVE, mais leurs bornes restent ancrées sur les données du marché.
