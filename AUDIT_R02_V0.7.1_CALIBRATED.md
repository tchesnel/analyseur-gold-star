# Audit R02 v0.7.1 — Balance Breakout / Acceptance

## Verdict technique

R02 est intégrée comme seconde stratégie indépendante après R01. Elle ne passe jamais d'ordre : `execution = null` dans le module, le registre et les tests de stress.

**Version calibrée active : BUY-only.** La branche SELL existe conceptuellement dans le setup breakout mais est désactivée dans cette implémentation après échec hors échantillon de la formule symétrique SELL.

## Machine d'état

```text
SEARCHING
  ↓ balance H1 mature + pression proche du bord + H4 bullish
DETECTED
  ↓ breakout M5 avec character change
ACCEPTED
  ↓ deux clôtures M5 hors de la balance
RETEST
  ↓ premier retest de la frontière tient
CONFIRMED
  ↓ reprise M1 haussière + displacement
ENTRY_READY
  ↓ spread + macro + risque valides
(no execution)

Toute réintégration nette avant/pendant l'acceptation ou le retest => INVALIDATED.
```

## Paramètres figés

- Balance : 60 H1 clôturées, largeur 4–12 ATR H1, efficiency ratio <= 0,32.
- Pression : >= 5 des 6 dernières clôtures H1 dans les 35 % supérieurs du range.
- Biais : H4 `close > EMA20 > EMA50`.
- Breakout : pénétration >= 0,10 ATR M5.
- Character change : True Range >= 1,30 ATR M5, tick-volume >= 1,20x médiane 20 M5 antérieures, ADX14 en hausse d'au moins +1 sur 5 M5.
- Pré-break : 6 clôtures M5 dans la balance.
- Acceptance : 2 closes M5 consécutives >= frontière + 0,08 ATR, dans une fenêtre max 4 M5.
- Re-entry : close < frontière - 0,10 ATR => invalidation.
- Retest : premier test dans les 12 M5 suivantes, bande 0,35 ATR.
- LIVE resume : M1 haussier, clôture au-dessus des 5 micro-highs précédents + displacement >=1,10 ATR M1, max 20 min.
- SL : sous le low du retest et sous la frontière, buffer 0,12 ATR M5.
- Risque : 0,50–3,00 ATR M5.
- TP1 : 1R ; TP2 : 2,25R ; measured move de la balance affiché séparément.
- Macro : HIGH/CRITICAL bloque une nouvelle entrée sans transformer le pattern en faux breakout.
- Spread : <=0,30 ATR M1.
- Aucun filtre horaire obligatoire : la calibration all-day est moins fragile que les sous-échantillons de session testés.

## Backtest proxy exact-math

CSV XAUUSD M5 utilisateur 2021-05-19 → 2026-09-07, 375 985 bougies.

- 45 trades BUY proxy.
- Win rate : 55,56 %.
- Expectancy : +0,692R/trade.
- Profit Factor : 2,40.
- Total : +31,12R.
- Max DD observé : 2,38R.
- 2021–2023 : 18 trades, +0,657R, PF 2,28.
- 2024–2026 OOS : 27 trades, +0,715R, PF 2,49.

Les six années ont une expectancy positive, mais 2021 et 2026 n'ont que 3 trades chacune : ce détail ne doit pas être surinterprété.

### SELL symétrique rejeté

Avec les mêmes équations/paramètres :

- DEV 2021–2023 : 11 trades, +0,364R, PF 1,60.
- OOS 2024–2026 : 12 trades, **-0,687R, PF 0,24**.

La branche SELL est donc explicitement désactivée dans `R02_CONFIG.allowDirections`.

## Contrôles code

### Tests globaux

`npm test` : **139/139 PASS**, 0 fail, 0 skipped.

R02 possède des tests dédiés pour :
- paramètres figés ;
- balance 60 H1 ;
- pression 5/6 ;
- biais H4 ;
- character change range/volume/ADX ;
- bougies M5 clôturées uniquement ;
- acceptance 2 closes ;
- réintégration ;
- retest ;
- reprise M1 causale ;
- ENTRY_READY ;
- plan figé dans le temps ;
- SELL désactivé ;
- blocage macro ;
- registre R01/R02 indépendant ;
- panneau frontend et overlays.

### Structure / sécurité / smoke

- `npm run check` : **CHECK OK — 66 fichiers JS analysés** avant ajout du script de backtest/audit final.
- `npm run security` : **SECURITY CHECK OK**.
- `npm run smoke` : **SMOKE OK**.
- OAuth cTrader : scope `accounts`, lecture seule.
- Aucun secret frontend.
- Aucune primitive order/position execution.

### Stress

- `node scripts/stress-r02.mjs` : **200 évaluations ciblées**, invariants/overlays/execution=null OK.
- `node scripts/stress-r01.mjs` : **801 évaluations R01**, 0 invariant failure.
- `node scripts/stress-v050.mjs` : **3 000 analyses générales**, OK.

## Contrôle de parité backtest

Un script standalone inclus (`backtests/r02_m5_proxy_exact.py`) a été relancé depuis zéro sur le CSV original. La sortie a été comparée colonne par colonne avec les 45 trades de calibration : **PARITY TRUE** sur les 21 colonnes, tolérance numérique 1e-12.

## Limites restantes

1. Le dataset historique fourni est M5 : le trigger LIVE M1 est remplacé par un proxy causal M5 dans le backtest.
2. Le CSV ne contient pas le DOM broker historique ; il n'est pas une condition obligatoire R02.
3. Le filtre macro LIVE n'est pas reconstruit sur chaque trade historique dans ce proxy.
4. Le coût fixe est une hypothèse et non un replay bid/ask tick-by-tick.
5. 45 occurrences sur 5,3 ans restent un échantillon sélectif ; le résultat hors échantillon/sensibilité est encourageant mais ne garantit rien en production.
6. De nombreux paramètres ont été étudiés : la validation OOS, les plateaux de sensibilité et la parité exact-math réduisent le risque d'overfit sans l'annuler.

## Conclusion

R02 v0.7.1 est **techniquement intégrée, causalement protégée et calibrée BUY-only**. Aucun défaut bloquant n'a été trouvé dans les contrôles actuels. Sa prochaine validation supérieure serait un replay historique M1 (et idéalement tick/order-flow) pour remplacer le proxy de reprise M5.

## Revalidation indépendante finale — 16 septembre 2026

La calibration a été rejouée depuis zéro sur le CSV utilisateur original avec `backtests/r02_m5_proxy_exact.py`, dans un dossier de sortie séparé. Le fichier de 45 trades produit par ce replay est **byte-for-byte identique** au fichier de calibration livré :

```text
SHA256 = 4a84beb1c33f7ef99d271c40bf6ec4b69101670d4683da646dcf830f240e2aca
45 lignes de trades
21 colonnes
écart numérique maximal = 0
```

Cela confirme la reproductibilité du proxy M5 retenu.

### Robustesse complémentaire BUY

- Leave-one-year-out : expectancy reste positive quelle que soit l'année retirée (~+0,60R à +0,79R) et PF > 2,1.
- Fenêtres roulantes 2 ans : toutes positives ; expectancy ~+0,54R à +1,00R et PF ~2,00 à 3,64.
- Bootstrap IID 50 000 réplications (seed 20260916) : médiane expectancy ~+0,692R ; intervalle 95 % ~+0,205R à +1,139R ; probabilité empirique d'expectancy > 0 ~99,8 %. Ce bootstrap ne corrige pas le risque de data-snooping.
- Friction fixe stressée : la route reste positive jusqu'à 1,50 $/oz dans le proxy, mais l'edge se contracte progressivement.

### Sensibilité des paramètres principaux

La configuration finale n'est pas un pic isolé :

- R:R testé : 1,75 / 2,00 / 2,25 / 2,50 / 2,75 ; toutes les valeurs testées restent positives, 2,25R retenu pour le compromis rendement/stabilité.
- Balance : 54 / 60 / 66 / 72 H1 ; toutes positives, 60 H1 retenu pour conserver fréquence et maturité.
- Efficiency ratio max : 0,28 / 0,30 / 0,32 / 0,34 / 0,36 ; plateau positif, 0,32 retenu au milieu de la zone robuste.
- Aucun filtre horaire obligatoire n'est figé : certains sous-échantillons US sont meilleurs ex post mais trop petits et trop sensibles pour être retenus sans risque d'overfit.

### Branche SELL

La symétrie SELL a été rejouée avec les mêmes équations. Elle devient fortement négative en 2024–2026 ; elle reste donc désactivée. Important : la période 2024–2026 a été consultée pour prendre cette décision de direction, elle n'est donc plus un holdout totalement vierge pour ce choix précis. La robustesse BUY est par conséquent appuyée aussi par les tests année-par-année, fenêtres roulantes, sensibilités et bootstrap, mais une validation supérieure exigerait un nouvel historique non consulté.

### Contrôles exacts sur le package final

Avant packaging final :

```text
npm test              -> 139/139 PASS
npm run check         -> CHECK OK
npm run security      -> SECURITY CHECK OK
npm run smoke         -> SMOKE OK
stress-r02            -> 200 évaluations OK
stress-r01 (run complet antérieur sur le même code) -> 801 évaluations OK
stress-r01 (recheck final borné)                       -> 161 évaluations OK
stress général                                        -> 3 000 analyses OK
execution             -> null partout
```

### Audit visuel déterministe

Les images `audit-screenshots-r02/` sont produites à partir des sorties exactes du module R02 sur des fixtures déterministes destinées à forcer chaque état. Elles ne sont pas présentées comme du marché LIVE et ne remplacent pas un replay navigateur cTrader. Elles permettent de vérifier les états et les niveaux : `DETECTED`, `ACCEPTED`, `RETEST`, `ENTRY_READY`, invalidation, blocage macro et branche SELL désactivée.

## Verdict final

Aucun défaut bloquant n'a été trouvé dans le périmètre actuellement testable. La formule retenue est volontairement **BUY-only**, causalement protégée et non exécutante. La limite méthodologique principale reste la même : le CSV historique est M5 alors que la confirmation LIVE utilise M1. Le prochain niveau de preuve serait un replay historique M1/tick, idéalement complété par order-flow futures GC/MGC.
