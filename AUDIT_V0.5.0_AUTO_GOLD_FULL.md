# Audit final — Gold Live Analyzer v0.5.0 AUTO GOLD FULL

Date : 16 septembre 2026.

## Périmètre ajouté

La v0.5.0 conserve tout le socle v0.4.0 et ajoute six briques autonomes : Volume Profile/tick-volume, cTrader Market Depth Level II, ADX/DMI, compression/expansion via Bollinger Band Width, Anchored VWAP et contexte macro Gold.

Le moteur calcule ces familles en permanence et le mode AUTO choisit lesquelles afficher selon leur score contextuel. Le plafond visuel reste fixé à 9 familles simultanées. Le registre stratégique est toujours vide et l'exécution reste désactivée.

## Vérification 1 — logique et intégration

Résultat final : **94/94 tests réussis**.

Les tests couvrent notamment : OAuth cTrader, SSE, historique multi-timeframes, structure/SMC, Fibonacci, liquidité interne/externe, EMA/VWAP/RSI/ATR, ADX/DMI, Bollinger Band Width, Volume Profile, AVWAP, tick-volume, Market Depth, DXY broker, priorité DXY cTrader sur proxy public, parsers BLS/BEA/FOMC/FRED + calendrier officiel des discours/témoignages Fed, AUTO display et absence d'exécution.

## Vérification 2 — structure et sécurité

- `CHECK OK` : 53 fichiers JavaScript analysés, HTML/routes OAuth/vercel.json cohérents.
- `SECURITY CHECK OK` : OAuth scope accounts, session chiffrée HttpOnly, aucun secret client, aucune primitive d'exécution, transport LIVE.
- `SMOKE OK` : LIVE par défaut, OAuth intégré, portail cTrader officiel, moteur données prêt.

## Vérification 3 — stress-test

**3 000 analyses réussies** : 500 contextes synthétiques × 6 timeframes (M1/M5/M15/M30/H1/H4).

Assertions vérifiées à chaque analyse : aucune exception ; aucune valeur NaN/Infinity ; aucune zone inversée ; RSI et ADX bornés ; BB Width non négatif ; imbalance DOM borné [-1,1] ; `VAL <= POC <= VAH` ; familles AUTO connues ; au plus 9 familles visibles ; `execution = null`.

## Contrôle visuel avec le renderer réel

Les captures dans `audit-screenshots/` utilisent le même `assets/chart.js` que l'application et un payload déterministe généré par le moteur pour forcer les familles à être auditables.

- `auto.png` : sélection autonome lisible avec focus macro et calques pertinents.
- `profile.png` : Volume Profile + POC/VAH/VAL + AVWAP.
- `flow.png` : DOM BID/ASK walls + structure/order-flow.
- `regime.png` : RSI/ATR/BB Width et régime de volatilité.
- `all.png` : toutes les familles forcées pour vérifier l'existence de chaque renderer. Cette vue est volontairement dense et n'est pas le comportement AUTO normal.

## Limites assumées

Le Volume Profile est fondé sur le tick-volume du broker cTrader, pas sur un volume consolidé COMEX. Le DOM est le carnet du broker connecté, pas un carnet mondial. Les probabilités CME FedWatch exactes ne sont pas simulées : l’API officielle CME est payante et nécessite un accès dédié. Les sources macro publiques intégrées sont best-effort : si une source ne répond pas, la donnée est déclarée indisponible et n'est jamais inventée. Si un vrai DXY/USDX existe chez le broker, sa quote LIVE a priorité sur le proxy dollar public.

## Verdict technique

Aucun défaut bloquant n'a été trouvé après les trois niveaux de vérification. Cela valide la cohérence logicielle du socle ; cela ne constitue pas une preuve de performance ou de rentabilité des futurs setups, qui devront être testés stratégie par stratégie.
