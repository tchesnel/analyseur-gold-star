# Audit croisé R01 + R02 v0.8.1 — broker geometry, readiness et UX

Date : 2026-09-16

## Verdict technique

Les deux routes ont été revues ensemble sur la chaîne complète : données broker → conditions obligatoires → construction de l’entrée/SL/TP → invalidation → score 100 % → affichage cockpit.

**Résultat final : aucun défaut bloquant connu dans le périmètre testable du package v0.8.1.** Ce verdict concerne la cohérence technique du moteur et de l’interface. Il ne constitue pas une garantie de performance future ni un replay exact de fills historiques, faute de données historiques tick BID/ASK complètes.

## Référence broker cTrader vérifiée

Documentation officielle cTrader :

- `StopTriggerMethod.Trade` : le SL d’une position BUY est déclenché lorsque le **BID <= SL** ; le SL d’une position SELL lorsque l’**ASK >= SL**.
- `Symbol.Ask` et `Symbol.Bid` exposent les deux côtés du marché.
- Les ordres BUY côté trade sont déclenchés/exécutés sur le côté ASK ; les SELL sur le côté BID.

Sources :
- https://help.ctrader.com/ctrader-algo/references/Trading/StopTriggerMethod/
- https://help.ctrader.com/ctrader-algo/references/MarketData/Symbols/Symbol/
- https://help.ctrader.com/ctrader/trading/orders/

## R01 — Liquidity Sweep / Failed Auction Reversal

### Défaut initial confirmé

La version antérieure pouvait protéger un SELL avec un buffer basé sur l’ATR M1, beaucoup plus petit que l’ATR M5 de la structure sweepée, et ne modélisait pas explicitement le déclenchement du SL SELL sur ASK. Cela pouvait rendre le stop réel trop proche même avec une bonne direction.

### Formule finale v0.8.1

- Entrée BUY : **ASK live**.
- Entrée SELL : **BID live**.
- ATR de protection : **ATR M5 au sweep**.
- SL BUY : extrême bas du sweep − `0,12 × ATR M5`. Déclencheur broker : **BID**.
- SL SELL : extrême haut du sweep + `0,12 × ATR M5` + spread live. Déclencheur broker : **ASK**.
- Distance entrée→SL minimale : filtre calibré en ATR M5 conservé.
- Spread : doit être connu et sous le plafond M1. Un spread inconnu n’est plus considéré comme valide.
- Le score ne peut plus atteindre 100 % sans un vrai BID + ASK cTrader.

### Invalidation

R01 utilise désormais le côté broker réel : BUY invalidé si BID touche le SL ; SELL invalidé si ASK touche le SL.

### Readiness

`readiness.allGreen` n’est vrai que si toutes les conditions obligatoires passent **et** si le stage est `ENTRY_READY`. Un quote broker incomplet ou un spread inconnu maintient la route sous 100 %.

## R02 — Balance Breakout / Acceptance

### Ce qui était déjà correct

- Route **BUY-only** conformément à la calibration.
- SL structurel déjà basé sur ATR M5.
- Stop placé sous le low du retest et sous la frontière de balance avec buffer `0,12 ATR M5`.
- Branche SELL volontairement désactivée.

### Défaut live trouvé et corrigé

La version précédente affichait comme `entry` la clôture M1 du signal (`resume.price`). Ce prix pouvait être ancien et ne plus être exécutable lorsque le quote live avait bougé.

La v0.8.1 sépare maintenant :

- `signalEntry` = clôture M1 qui confirme la reprise ;
- `entry` = **ASK cTrader live** réellement exécutable pour le BUY ;
- `entryMeta.executableSide = ASK` ;
- `entryMeta.stopTriggerSide = BID`.

Le stop reste structurel et ne dérive pas avec le quote. En revanche, le risque et les TP 1R / 2,25R sont recalculés depuis l’entrée ASK live. Si l’ASK s’éloigne tellement que le risque dépasse le plafond calibré de `3 ATR M5`, R02 reste `CONFIRMED` et **n’affiche plus un trade prêt**.

### Invalidation SL

Pour R02 BUY, le moteur invalide le plan lorsque **BID <= SL**, conformément au déclenchement trade-side cTrader.

### Faux filtre R:R supprimé

La condition `rr_min` était tautologique : TP2 était construit directement à 2,25R puis le code vérifiait que R:R >= 2,25. Elle ne pouvait donc pas apporter de confirmation indépendante.

En v0.8.1 :

- 2,25R reste exactement la **cible calibrée** de R02 ;
- elle apparaît comme `target_calibration`, information non obligatoire ;
- elle ne gonfle plus artificiellement le pourcentage de readiness.

Le measured move de la balance reste affiché séparément avec son équivalent en R, sans être transformé en filtre obligatoire non backtesté.

### Quote/spread stricts

Comme R01, R02 exige maintenant un vrai BID + ASK et un spread connu avant `ENTRY_READY`. `N/A` ne compte jamais comme vert.

## UX / Strategy Cockpit

### R01

Conservé : score, décision, ticket uniquement à 100 %, checklist complète et graphique autonome M5/M1.

### R02

R02 possède désormais le même niveau de lecture :

- score de conditions obligatoires ;
- `PAS DE TRADE` tant que la route n’est pas entièrement validée ;
- ticket uniquement à 100 % avec **Entrée ASK / SL / TP1 / TP2 / risque ATR / signal M1** ;
- diagnostic séparant prix de signal et prix d’exécution ;
- graphique autonome **H1 BALANCE / M5 SETUP / M1 TRIGGER** ;
- tags de confirmation propres à R02.

Contrôle responsive statique :
- desktop 1440 px : 0 px d’overflow horizontal ;
- mobile 390 px : 0 px d’overflow horizontal.

## Tests finaux

- `npm test` : **147/147 PASS**.
- `npm run check` : PASS.
- `npm run security` : PASS.
- `npm run smoke` : PASS.
- Stress R01 : **801 évaluations**, 0 invariant failure.
- Stress R02 : **200 évaluations**, 0 invariant failure.
- Aucun ordre automatique : `execution = null`.
- OAuth cTrader reste lecture seule.

Tests dédiés ajoutés :

- R01 impossible à 100 % sans BID/ASK + spread connu ;
- R01 SELL SL déclenché sur ASK ;
- R02 entrée BUY égale à l’ASK live ;
- R02 conserve séparément le prix signal M1 ;
- R02 bloque le chasing lorsque le risque live dépasse 3 ATR M5 ;
- R02 SL BUY invalidé par BID ;
- R02 impossible à 100 % sans BID/ASK + spread connu ;
- cible 2,25R non comptée comme faux filtre indépendant ;
- cockpit R02 et flux H1/M5/M1 câblés.

## Parité backtest : ce qui change / ne change pas

La calibration historique R02 reste **TP1 1R / TP2 2,25R** et le script proxy M5 n’a pas été modifié. Les 45 trades historiques et leurs statistiques restent donc les résultats du proxy de calibration livré.

La v0.8.1 améliore la **géométrie LIVE broker-aware**. Il serait incorrect de présenter les anciennes statistiques comme un nouveau replay exact de cette couche ASK/BID live : le CSV historique M5 n’embarque pas les ticks BID/ASK ni le spread de chaque signal, et le trigger LIVE R02 est M1. Même limite pour le nouveau correctif SL R01.

## Conclusion

R01 et R02 sont maintenant cohérentes sur le point qui causait le plus de risque opérationnel : **le plan affiché correspond au côté de marché que cTrader utilise réellement**, et aucune route ne peut annoncer 100 % avec un quote broker incomplet. R02 ne peut plus afficher une ancienne clôture M1 comme si elle était encore le prix d’achat exécutable.

Le prochain niveau de validation, au-delà de cet audit technique, est un replay historique M1/tick avec BID/ASK/spread broker pour quantifier précisément l’impact des corrections live sur les fills et les statistiques.
