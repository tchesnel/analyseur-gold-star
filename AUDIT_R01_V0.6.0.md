# Audit R01 v0.6.0 — Liquidity Sweep / Failed Auction Reversal

## Conclusion

R01 est intégré comme module déterministe et isolé. Il produit uniquement un état, des conditions, des tracés et un plan théorique. `execution = null` partout.

## Recherche croisée

La logique a été recoupée avant intégration avec plusieurs sources orientées futures/order-flow :

1. Axia Futures — **Reversal Trade Catching The Stops In Gold**  
   https://axiafutures.com/blog/reversal-trade-catching-the-stops-in-gold/  
   Point retenu : la localisation de reversal vient d'abord du Market Profile / zone préparée ; la price ladder sert ensuite à confirmer que la réaction au niveau est réelle.

2. Axia Futures — **Price Ladder Clues For Breakout Failure**  
   https://axiafutures.com/blog/price-ladder-clues-for-breakout-failure/  
   Point retenu : sur Gold, le déclenchement des stops au-dessus d'un niveau ne suffit pas ; il faut surveiller la pression qui suit le break. Le retour sous le niveau et le maintien sous celui-ci sans défense des acheteurs confirment progressivement le breakout failure.

3. Jigsaw Trading / Axia — **Order Flow Absorption & Market Reversals**  
   https://www.jigsawtrading.com/blog/order-flow-absorption-market-reversals/  
   Point retenu : absorption ≠ entrée immédiate. On peut attendre que les participants se joignent au retournement et lire le momentum avant d'entrer.

4. Jigsaw Trading — **Elements of a Reversal**  
   https://www.jigsawtrading.com/blog/elements-of-a-reversal/  
   Point retenu : absorption, fade d'un côté et arrivée de l'autre côté sont des éléments de reversal ; la confirmation augmente la sélectivité, et le contexte de positionnement/Volume Profile reste important.

5. Bookmap — **Absorption & Exhaustion**  
   https://bookmap.com/learning-center/en/supply-demand-setups/supply-demand-setups/absorption-exhaustion  
   Point retenu : une absorption doit être accompagnée de signes supplémentaires comme failed push, changement d'agression/CVD ou perte de follow-through.

6. CME Group — **Gold Futures / COMEX liquidity**  
   https://www.cmegroup.com/markets/metals/precious/gold-futures.html  
   https://www.cmegroup.com/education/articles-and-reports/liquidity-of-comex-gold-and-silver-is-excellent-during-asia-hours  
   Point retenu : GC est le benchmark Gold futures majeur ; profondeur et bid/ask sont des métriques professionnelles. Le DOM cTrader de cette app reste toutefois le carnet du broker, pas le carnet COMEX centralisé.

7. cTrader Open API — **Depth / Level II quotes**  
   https://help.ctrader.com/open-api/symbol-data/  
   Point retenu : l'API permet bien de recevoir les Depth Quotes. R01 les traite comme confirmation broker facultative, jamais comme déclencheur unique.

## Contrat algorithmique retenu

```text
LIQUIDITÉ EXTERNE QUALIFIÉE
→ PENETRATION / STOP-RUN
→ RECLAIM (immédiat ou dans les 1–3 M5 suivantes)
→ PAS D'ACCEPTATION AU-DELÀ
→ SHIFT M1 APRÈS RECLAIM
→ DISPLACEMENT ou FVG M1 DANS LE SENS DU REVERSAL
→ RETEST DE LA ZONE D'ENTRÉE
→ SPREAD + MACRO + R:R VALIDES
→ ENTRY_READY
```

### Liquidités admises
- PDH / PDL
- PWH / PWL
- swing highs/lows M15 et H1 confirmés
- EQH/EQL M15/H1 confirmés
- VAH/VAL du Volume Profile **snapshotté avant le sweep**
- hauts/bas de session connus **avant le candidat**

### Invalidations
- deux clôtures M5 consécutives acceptées au-delà du niveau avant reclaim ;
- acceptation au-delà après le sweep ;
- rupture de l'extrême + buffer ;
- expiration du setup ;
- nouvelle entrée bloquée pendant macro HIGH/CRITICAL.

### Confirmation order-flow
Tick-volume, wick rejection et DOM broker peuvent renforcer le setup, mais `effort_result_proxy` est volontairement **non obligatoire**. C'est cohérent avec la limite de notre source : cTrader Level II ≠ tape/CVD consolidé COMEX.

## Paramètres initiaux à backtester

Ces valeurs sont des choix d'implémentation initiaux, pas des seuils universels publiés :
- pénétration minimum : 0.05 ATR M5 ;
- fenêtre reclaim : 3 barres M5 ;
- buffer d'acceptation : 0.08 ATR ;
- acceptation : 2 clôtures M5 consécutives ;
- délai shift M1 : 30 min après reclaim ;
- timeout setup : 45 min ;
- stop buffer : 0.12 ATR du sweep ;
- spread max : 0.30 ATR M1 ;
- R:R minimum initial : 1.5.

Ils doivent être calibrés par backtest Gold hors échantillon avant d'être interprétés comme paramètres de performance.

## Vérifications finales

### Check 1 — tests logique/intégration
`119 / 119` tests réussis. Le runner se ferme proprement.

Cas R01 explicitement couverts :
- SELL et BUY symétriques ;
- delayed reclaim ;
- acceptance avant reclaim ;
- acceptance après sweep ;
- macro CRITICAL ;
- absence de DOM ;
- attente du retest ;
- anti-look-ahead M15/H1 ;
- Volume Profile causal ;
- sessions causales ;
- cohérence du niveau affiché avec le sweep réellement actif.

### Check 2 — structure / sécurité / LIVE
- `CHECK OK — 60 fichiers JS`
- `SECURITY CHECK OK`
- `SMOKE OK`
- OAuth scope `accounts` lecture seule
- aucun secret cTrader dans le frontend
- aucune primitive d'ouverture/fermeture d'ordre

### Check 3 — stress
- `R01_STRESS_OK — 160 évaluations`, 8 classes de scénario
- `STRESS_V050_OK — 3 000 analyses` générales du moteur
- 0 invariant cassé
- `execution = null`

## Captures de contrôle

Le dossier `audit-screenshots-r01/` contient des rendus déterministes avec le même renderer Canvas que l'application :
- `01-entry-ready-sell.png`
- `02-confirmed-wait-retest.png`
- `03-invalidated-acceptance.png`
- `04-entry-ready-buy.png`
- `00-r01-overview.png`

Ces captures sont des fixtures d'audit, pas des données LIVE présentées comme réelles.
