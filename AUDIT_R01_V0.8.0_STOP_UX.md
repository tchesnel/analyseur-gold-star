# Audit R01 v0.8.0 — Stop SELL broker-aware + Strategy Cockpit

## Incident traité

Deux SELL R01 ont été rapportés avec une direction finale correcte mais un stop touché avant le mouvement vers la cible. L’audit du moteur a identifié deux causes techniques qui pouvaient réduire le coussin réel du stop :

1. la formule du stop privilégiait `atrAtMicroSweep` (ATR M1) avant `atrAtSweep` (ATR M5) ;
2. le stop SELL était placé derrière l’extrême BID sans compensation du spread alors que le déclenchement cTrader standard du SL SELL se fait sur l’ASK.

Le filtre `minRiskAtrM5 = 0.75` contrôlait bien la distance entrée→SL globale, mais ne garantissait pas à lui seul un coussin suffisant **au-delà de l’extrême du sweep**.

## Formule v0.8.0

### SELL

```text
ATR_stop = ATR M5 connu au sweep
buffer_structure = 0.12 × ATR_stop
buffer_spread = spread live × 1.00
SL = sweep_extreme + buffer_structure + buffer_spread
trigger broker reproduit par le moteur = ASK >= SL
entrée exécutable = BID
```

### BUY

```text
ATR_stop = ATR M5 connu au sweep
buffer_structure = 0.12 × ATR_stop
SL = sweep_extreme - buffer_structure
trigger broker reproduit par le moteur = BID <= SL
entrée exécutable = ASK
```

Le seuil structurel `0.12 ATR` n’a pas été augmenté arbitrairement. Le correctif porte sur **la bonne unité de volatilité et le bon côté de cotation**, pas sur un stop artificiellement éloigné.

## Tests ajoutés

- stop SELL = extrême + `0.12 ATR M5` + spread ;
- `stopMeta.atrBasis === M5_AT_SWEEP` ;
- SELL : ASK peut invalider alors que BID reste sous le niveau ;
- BUY conserve une protection sous l’extrême et un déclenchement BID ;
- readiness = 100 % uniquement quand toutes les conditions obligatoires passent et que la machine est `ENTRY_READY` ;
- un veto macro fait redescendre le score sous 100 % ;
- le cockpit R01 apparaît avant le dashboard général ;
- le flux autonome R01 reçoit M1/M5 history, bars et overlays.

## UX v0.8.0

L’écran principal commence désormais par le Strategy Cockpit. R01 affiche : score, état, checklist, diagnostic, ticket conditionnel et graphique autonome. Le ticket n’existe visuellement comme trade prêt que lorsque le moteur est réellement à 100 %.

Le contrôle de layout a été rendu en 1600 px desktop et 430 px mobile : aucun overflow horizontal ; le cockpit commence avant le dashboard général dans les deux formats.

## Validation

- tests Node : 142/142 PASS ;
- check statique : PASS ;
- sécurité : PASS ;
- smoke : PASS ;
- aucune primitive d’exécution automatique ;
- OAuth cTrader lecture seule conservé.

## Limite importante

Le projet contient le rapport historique R01 et l’export des trades, mais pas le CSV brut M5 qui a servi à la calibration. Il serait incorrect de prétendre avoir recalculé un nouveau backtest 2021–2026 de la formule v0.8.0 sans ces bougies, et le dataset M5 ne pourrait de toute façon pas reproduire exactement le trigger M1 ni les spreads ASK/BID historiques. La validation de ce correctif est donc **logique + tests + stress + forward/live**, sans fausse promesse de performance historique exacte.
