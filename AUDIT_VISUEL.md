# Audit visuel — Gold Live Analyzer v0.3.3

Les captures de ce dossier utilisent une fixture déterministe, mais **le même renderer Canvas `assets/chart.js` que l'application de production**. Elles servent à prouver le chemin calcul → overlay → renderer et le placement de chaque famille sans dépendre de l'état instantané du marché.

## Placement vérifié

| Famille | Calcul | Emplacement | Visibilité hors écran |
|---|---|---|---|
| Structure | BOS / CHOCH / MSS | marqueurs sur le prix | hint ↑/↓ si nécessaire |
| Liquidité | EQH / EQL, BSL / SSL, sweeps | niveaux horizontaux + marqueurs | hint ↑/↓ pour sweep hors écran |
| Order Blocks | bullish / bearish, mitigés | rectangles sur le prix | hint ↑/↓ si zone hors écran |
| FVG / iFVG | bullish / bearish | rectangles sur le prix | hint ↑/↓ si zone hors écran |
| BUY / SELL zones | confluence OB + FVG | rectangles renforcés sur le prix | hint ↑/↓ prioritaire |
| Premium / Discount | dealing range + EQ 50 % | zones sur le prix | n/a |
| Niveaux HTF | PDH/PDL/PWH/PWL/D Open/W Open | lignes horizontales | hint ↑/↓ si hors écran |
| Sessions | Asie / Londres / New York | rectangles temporels | n/a |
| EMA 20 / 50 / 200 | EMA | courbes sur le prix | label de dernière valeur si visible |
| VWAP | daily VWAP | courbe pointillée sur le prix | label de dernière valeur si visible |
| RSI 14 | Wilder RSI | panneau oscillateur 0–100 sous le prix | seuils 30/50/70 |
| ATR 14 | Wilder ATR | panneau volatilité séparé sous le RSI | échelle locale |
| ADR | daily ranges | métrique `ADR utilisé` en haut | numérique, pas une courbe prix |

## Statuts de détection

La colonne `Calques essentiels` indique maintenant combien d'éléments sont réellement détectés / affichés. Une case cochée signifie **autorisé à l'affichage**, pas qu'une zone doit être inventée. Exemple : `SELL 0` signifie qu'aucune SELL ZONE confluence valide n'existe à cet instant.

## Vérifications

- 68 / 68 tests unitaires et non-régression
- `CHECK OK`
- `SECURITY CHECK OK`
- `SMOKE OK`
- audit visuel séparé par famille + vue globale
