# Gold Live Analyzer v0.9.3 — R03 INVALIDATION STATE HARDENED

## v0.9.3 — R03 ne peut plus laisser survivre un signal après invalidation du pullback

- R03 reste **RESEARCH SHADOW** avec `promotionGate=XAUUSD_REPLAY_REQUIRED` et `actionable=false`.
- Correction d’état : un pullback qui a atteint une zone utile puis devient trop volumineux/énergique, trop profond ou casse l’origine structurelle passe explicitement à `INVALIDATED` au lieu de retomber silencieusement à `DETECTED`.
- Le signal mémorisé 15 minutes est donc supprimé par l’UI dès cette invalidation explicite.
- Les scénarios `PULLBACK_NOT_WEAK`, `RETRACE_TOO_DEEP` et `STRUCTURE_BROKEN` sont exposés dans le résultat pour audit.
- La correction v0.9.2 d’ordre des objectifs est conservée : TP1 est toujours rencontré avant TP2 dans le sens du trade.
- Aucun seuil n’a été retuné sur ES et aucune performance Gold n’est revendiquée sans replay du fichier XAUUSD brut.
- Validation v0.9.3 : **182/182 tests**, check/security/smoke OK, **320** stress R03, plus un sweep de seuils BUY/SELL vérifiant qu’un pullback invalidé ne se réarme pas artificiellement quand son volume adverse augmente.

Rapport : `AUDIT_R03_V0.9.3_INVALIDATION_STATE.md`.


## v0.8.2 — Refonte décisionnelle R01/R02 + signal mémorisé

- Nouvelle navigation séparée : **STRATÉGIES / MARCHÉ / DIAGNOSTIC**.
- Vue stratégies recentrée sur deux cartes compactes R01/R02 puis une seule route détaillée à la fois.
- Hiérarchie UX : **décision → prochaine étape → plan de trade → parcours du setup → validations groupées → graphique → détail technique repliable**.
- Les états internes du moteur sont traduits en quatre états lisibles : `RECHERCHE`, `SETUP EN CONSTRUCTION`, `SETUP INVALIDÉ`, `TRADE VALIDÉ`.
- Une condition pas encore applicable est désormais affichée comme **EN ATTENTE** et n'est plus présentée visuellement comme un échec.
- R01 : correction de plusieurs états prématurément verts (`ADX/régime`, fenêtre de session et géométrie risque) lorsqu'aucun sweep/plan n'est encore réellement évaluable.
- R02 : le biais H4 ne peut plus passer par accident lorsque breakout et direction sont tous deux absents.
- Un `ENTRY_READY` R01/R02 est mémorisé pendant **15 minutes** avec son plan d'origine (direction, entrée, SL, TP1, TP2, overlays) et un compte à rebours.
- La fenêtre de 15 minutes est **fixe** : chaque tick ne rallonge pas artificiellement le signal. Un nouveau setup peut remplacer l'ancien.
- Si le moteur quitte `ENTRY_READY` mais que le signal est encore dans sa fenêtre, l'UI affiche **SIGNAL MÉMORISÉ** et non `TRADE VALIDÉ`, pour éviter de présenter un ancien signal comme une validation live actuelle.
- Le signal mémorisé est supprimé à expiration, lors d'une invalidation explicite du setup ou lorsque le quote live indique déjà le SL/TP2 terminal atteint.
- La mémorisation utilise `localStorage`, donc un rafraîchissement de page ne fait pas disparaître immédiatement le plan.
- Les détails experts restent disponibles mais sont repliés par défaut ; les graphiques stratégie démarrent avec des calques simplifiés et proposent les calques avancés à la demande.
- Toujours **aucune exécution automatique** : l'analyseur reste lecture/analyse uniquement.

Contrôles v0.8.2 : tests unitaires/intégration, check, sécurité, smoke, stress R01 et R02. Voir `AUDIT_V0.8.2_DECISION_UX_SIGNAL_HOLD.md`.

## v0.8.1 — Audit croisé R01/R02 broker-aware

- R01 : BID/ASK obligatoires, spread inconnu = blocage, SL SELL toujours protégé sur ASK avec ATR M5.
- R02 : entrée BUY live sur ASK, clôture M1 conservée comme `signalEntry`, SL déclenché par BID, risque recalculé au prix exécutable.
- R02 : suppression du faux filtre obligatoire `R:R >= 2,25` ; 2,25R reste la cible calibrée, informative et non comptée comme confirmation indépendante.
- R01/R02 : impossible d’atteindre 100 % sans quote BID+ASK et spread connu.
- R02 : cockpit complet + graphique autonome H1/M5/M1.
- Validation : 147/147 tests, check/security/smoke OK, stress R01 801/801, stress R02 200/200.

Rapport complet : `AUDIT_R01_R02_V0.8.1_BROKER_UX.md`.

Analyseur XAUUSD LIVE pour Vercel + cTrader Open API. Le moteur observe le marché en continu, calcule toutes les familles de contexte en arrière-plan puis choisit automatiquement quoi afficher. **Aucune exécution automatique n'est présente.**

## Moteur AUTO

Le mode `AUTO` est activé par défaut. Les familles sont recalculées à chaque mise à jour pertinente et classées par utilité contextuelle. Le moteur limite l'affichage à 9 familles simultanées pour conserver un graphique lisible, tout en continuant de calculer les autres en arrière-plan.

Familles disponibles :

- Structure : swings, BOS, CHOCH, MSS.
- Liquidité externe : EQH/EQL, BSL/SSL, sweeps.
- Liquidité interne : micro-swings non consommés dans le dealing range actif.
- SMC : Order Blocks, FVG, iFVG, BUY/SELL zones confirmées et candidates séparées.
- Localisation : Fibonacci automatique, Premium/Discount, EQ 50 %, PDH/PDL/PWH/PWL, Daily/Weekly Open.
- Sessions : Asie, Londres, New York.
- Tendance : EMA 20/50/200, VWAP, Anchored VWAP (Daily Open, swing, structure, NY Open selon disponibilité).
- Momentum/volatilité : RSI 14, ATR 14, ADR, ADX/DMI, Bollinger Band Width pour compression/expansion.
- Volume : tick volume broker + Volume Profile avec POC/VAH/VAL/HVN/LVN et détection de spike/exhaustion.
- Order flow : cTrader Market Depth / Level II, déséquilibre BID/ASK et murs de liquidité broker.
- Macro Gold : dollar/DXY broker lorsqu'il existe, sinon proxy dollar public ; US 10Y ; US 10Y real yield ; calendrier CPI/NFP/PPI/JOLTS/ECI/PCE/FOMC + discours/témoignages Fed à contenu macro.

## Autonomie

Le moteur AUTO donne un score à chaque famille à partir du contexte LIVE : distance au prix normalisée par ATR, structure récente, sweeps, POI, position Fibonacci, niveaux HTF, session, alignement EMA/VWAP/AVWAP, RSI, ADX, régime de volatilité, Volume Profile, spike de tick-volume, déséquilibre DOM et risque macro.

Il peut par exemple masquer Fibonacci si le retracement n'est pas utile, afficher ADX/DMI dans un marché directionnel, afficher BB Width pendant une compression/expansion, activer le Volume Profile près de POC/VAH/VAL, ou forcer le contexte macro quand un événement critique est imminent.

## Volume Profile et DOM : périmètre exact

Le `volume` des trendbars cTrader est utilisé comme **tick volume broker**. Le Volume Profile est donc un profil de l'activité observée chez le broker, pas un volume consolidé COMEX.

Le Market Depth / Level II est le carnet exposé par le broker cTrader connecté. Il ne représente pas le carnet mondial de l'or. Si le broker ne fournit pas le Depth sur XAUUSD, la famille DOM reste simplement indisponible et le reste de l'analyseur continue de fonctionner.

## Macro Gold

Aucune nouvelle clé API n'est nécessaire pour les sources publiques intégrées. Le serveur utilise des sources publiques pour les taux/calendriers et privilégie un symbole DXY/USDX LIVE du broker cTrader lorsqu'il en existe un. Un rafraîchissement macro ne peut pas écraser le DXY broker LIVE.

Les prises de parole Fed pertinentes sont récupérées depuis le calendrier officiel du Federal Reserve Board. Les probabilités CME FedWatch exactes ne sont volontairement pas approximées : l’API officielle FedWatch est un produit payant et nécessiterait un accès dédié.

Les sources macro sont best-effort : une indisponibilité réseau n'arrête jamais le flux cTrader. Pour le 10Y nominal et le 10Y réel, le serveur essaie d'abord FRED puis bascule sur les courbes officielles U.S. Treasury ; si aucune source ne répond, l'interface affiche `N/A`. Le moteur n'invente jamais `0.00 %`.

## cTrader LIVE

OAuth intégré avec scope `accounts` en lecture seule. Les secrets restent côté serveur. Les quotes BID/ASK partielles conservent le dernier côté valide. Le flux cTrader suit XAUUSD, les 6 timeframes M1/M5/M15/M30/H1/H4, le Market Depth et, si disponible chez le broker, un symbole DXY/USDX.

## Variables Vercel

```text
DATA_MODE=live
CTRADER_ENV=live
CTRADER_CLIENT_ID=...
CTRADER_CLIENT_SECRET=...
CTRADER_APP_URL=https://gold-live-analyzer-v010.vercel.app
CTRADER_REDIRECT_URI=https://gold-live-analyzer-v010.vercel.app/api/auth/callback
```

Aucune variable supplémentaire n'est obligatoire pour Volume Profile, DOM, ADX/DMI, BB Width, AVWAP ou le contexte macro public.

## Contrôles v0.5.1

```bash
npm test
npm run check
npm run security
npm run smoke
node scripts/stress-v050.mjs
```

Validation finale : **100/100 tests unitaires/intégration**, contrôle de **54 fichiers JavaScript**, audit sécurité, smoke test LIVE/OAuth et **3 000 analyses de stress** sur les 6 timeframes.

Le moteur visuel reste séparé du moteur stratégique : `execution = null`. Les stratégies futures consommeront ce contexte mais devront valider leurs propres règles déterministes avant toute proposition de setup.


## v0.5.1 — garde-fous qualité de données

- Une donnée absente (`null`, vide ou non numérique) n'est plus jamais convertie silencieusement en `0`.
- DOM/Level II : états `EN COLLECTE`, `PARTIEL`, `NEUTRE`, `BID/ASK imbalance` ou `INDISPONIBLE` selon la qualité réelle du carnet.
- Macro : DXY/US10Y/real yield affichent `N/A` si la source n'a pas fourni de valeur ; le calendrier peut rester actif indépendamment (`DATA CALENDRIER`).
- Le moteur AUTO n'accorde aucun score DOM à un imbalance absent et ne transforme pas une valeur macro absente en valeur neutre chiffrée.
- Le parseur FRED rejette explicitement les observations vides ou `.`.
- US 10Y / real 10Y : fallback automatique `FRED → U.S. Treasury officiel → N/A`.
- Le parseur XML Treasury gère les balises avec attributs (`m:type`) et ne transforme jamais une absence de valeur en zéro.

## v0.5.2 — Context hierarchy
- FOMC/CPI/NFP/PCE critiques le même jour : `WATCH` jusqu'à 24 h, puis `ELEVATED/HIGH/CRITICAL` à l'approche.
- Le focus AUTO distingue désormais une réaction locale (ex. sweep SSL → réaction BUY) de la structure globale, au lieu d'afficher un ambigu `CONTEXTE BUY/SELL`.


## v0.6.1 — R01 Liquidity Sweep / Failed Auction Reversal — calibrée

Première stratégie intégrée, isolée du moteur visuel. **Aucune exécution automatique : `execution = null`.**

Machine de décision R01 :

```text
SEARCHING
→ DETECTED : liquidité externe réellement testée
→ ARMED : sweep + reclaim + absence d'acceptation au-delà
→ CONFIRMED : shift M1 + displacement/FVG dans le sens du reversal
→ ENTRY_READY : retest + spread + macro + R:R valides
→ INVALIDATED : acceptation au-delà, timeout ou rupture de l'extrême
```

Liquidités admissibles : PDH/PDL, PWH/PWL, **swings H1 confirmés**, EQH/EQL M15/H1 confirmés sans look-ahead, VAH/VAL calculés uniquement sur les barres antérieures au sweep, et hauts/bas de sessions déjà connus avant le candidat. Le **pivot M15 isolé est volontairement exclu** de R01 après calibration.

Garde-fous importants :
- le stop-run seul ne déclenche jamais l'entrée ;
- le reclaim peut se faire dans une fenêtre causale courte de 1 à 3 bougies M5 ;
- 2 clôtures M5 acceptées au-delà avant reclaim invalident le failed auction ;
- le shift M1 doit arriver **après le reclaim** ;
- absorption/tick-volume/DOM restent une confirmation bonus, jamais le trigger obligatoire ;
- HIGH/CRITICAL macro bloque une nouvelle entrée sans transformer le pattern en faux rejet ;
- la zone d'entrée et le stop sont ancrés sur l'ATR connu au moment du sweep/shift et ne se déplacent pas avec l'ATR futur ;
- filtre de régime : `ADX M5 < 24` ;
- fenêtre de déclenchement : `08:20–16:00 America/New_York` ;
- géométrie minimale : distance entrée→SL `>= 0,75 ATR M5` ;
- R:R minimum : `1.5` vers une cible structurelle admissible ;
- les seuils ci-dessus ont été retenus après backtest/sensibilité 2021–2026 et non par choix arbitraire.

### Contrôles R01

```bash
npm test
npm run check
npm run security
npm run smoke
R01_STRESS_ITERATIONS=20 node scripts/stress-r01.mjs
node scripts/stress-v050.mjs
```

Validation finale v0.6.1 : **124/124 tests**, check structure/sécurité/smoke, **161 évaluations R01 ciblées** et **3 000 analyses générales**.

Backtest M5 proxy sur **375 985 bougies 2021–2026** : 217 trades proxy, expectancy +0,306R, PF 1,66, +66,41R, max DD 8,83R ; développement 2021–2023 et hors échantillon 2024–2026 restent positifs. Les six années du proxy retenu sont positives.

**Limite obligatoire :** le CSV utilisateur ne contient pas de M1. Le shift/displacement/FVG M1 du moteur LIVE est donc représenté par un proxy causal M5 dans le backtest. Ces chiffres servent à calibrer les filtres M5 et ne constituent pas une performance exacte ou garantie de la route LIVE. Voir `R01_BACKTEST_M5_PROXY.md` et `AUDIT_R01_V0.6.1_CALIBRATED.md`.


## v0.8.0 — Correctif R01 SELL SL + Strategy Cockpit

Correctif ciblé après observation de SELL R01 dont la direction restait correcte mais dont le stop proposé était trop proche de la mèche de sweep. Deux écarts ont été supprimés sans remplacer l’invalidation structurelle :

- le buffer du stop R01 est désormais calculé sur **l’ATR M5 au moment du sweep** ; l’ancienne formule pouvait privilégier `atrAtMicroSweep` (M1), beaucoup plus petit ;
- pour un **SELL**, le niveau proposé ajoute le spread live au-delà de l’extrême + buffer structurel, car le stop-loss d’une position SELL est déclenché par l’**ASK** avec le comportement cTrader par défaut ;
- l’invalidation LIVE SELL compare elle aussi l’ASK au SL ; BUY reste déclenché par le BID ;
- le buffer structurel reste `0,12 × ATR M5` et la géométrie entrée→SL reste `>= 0,75 ATR M5` : aucun élargissement arbitraire n’a été ajouté pour « sauver » les trades ;
- le plan expose `stopMeta` (base ATR, buffer structurel, buffer spread, côté de déclenchement) afin que l’UI explique le stop au lieu d’afficher un chiffre opaque.

### Strategy Cockpit

R01/R02 sont maintenant prioritaires dans l’interface, **avant** le dashboard général. R01 dispose de :

- score obligatoire en pourcentage ;
- état explicite `PAS DE TRADE` tant que toutes les conditions obligatoires ne sont pas vertes ;
- affichage `R01 100% VALIDÉE` uniquement si `readiness.allGreen === true` **et** `stage === ENTRY_READY` ;
- ticket Entrée / SL / TP1 / TP2 / R:R affiché uniquement dans cet état ;
- checklist de toutes les conditions obligatoires ;
- graphique autonome R01 avec bascule **M5 CONTEXTE / M1 TRIGGER**, alimenté indépendamment du timeframe du graphique général ;
- tags dédiés : liquidité, sweep/reclaim, shift M1, displacement/FVG, ATR/risque, ADX, spread, macro, R:R et fenêtre NY.

Contrôles v0.8.0 : **142/142 tests**, `npm run check`, `npm run security`, `npm run smoke`, tests spécifiques M5-ATR/ASK/spread/readiness et contrôle visuel desktop + mobile sans overflow horizontal.

**Limite de validation :** le ZIP ne contient pas le CSV brut M5 utilisé pour la calibration R01, seulement le rapport et les trades exportés. Le backtest proxy historique v0.6.1 n’est donc pas réinventé/recalculé à partir de données absentes. Il reste une calibration M5 proxy ; le comportement exact M1 + spread/ASK LIVE nécessite des données broker/tick ou un forward test pour être mesuré proprement.

## v0.7.1 — R02 Balance Breakout / Acceptance — BUY-only calibrée

Deuxième stratégie intégrée, séparée de R01 et toujours sans exécution automatique (`execution = null`).

Machine R02 :

```text
SEARCHING
→ DETECTED : balance H1 mature + pression au bord + character change breakout
→ ACCEPTED : 2 clôtures M5 acceptées hors balance
→ RETEST : premier retest de la frontière tient
→ CONFIRMED : vraie reprise M1 haussière
→ ENTRY_READY : spread + macro + risque valides
→ INVALIDATED : réintégration de la balance ou expiration
```

Configuration finale : balance 60 H1, largeur 4–12 ATR H1, ER <=0,32, pression >=5/6 H1 dans les 35 % supérieurs du range, biais H4 `close > EMA20 > EMA50`, breakout M5 >=0,10 ATR, TR >=1,30 ATR, tick-volume >=1,20x médiane, ADX14 Δ5 >=+1, 2 clôtures d’acceptation, retest <=12 M5, reprise M1 <=20 min, risque 0,50–3,00 ATR et TP2 2,25R.

**BUY-only volontairement :** la branche SELL symétrique a échoué hors échantillon 2024–2026 (12 trades, expectancy -0,687R, PF 0,24), alors que BUY reste positif (27 trades OOS, +0,715R, PF 2,49). SELL est donc désactivé au lieu de forcer une fausse symétrie.

Backtest M5 proxy exact-math BUY sur le CSV utilisateur 2021–2026 : **45 trades**, 55,56 % positifs, expectancy **+0,692R**, PF **2,40**, +31,12R, DD observé 2,38R. Développement 2021–2023 et OOS 2024–2026 restent positifs. Les paramètres voisins restent globalement positifs et le coût de friction a été stressé jusqu’à 1,50 $/oz.

**Limite obligatoire :** le CSV est M5. Le LIVE exige une vraie reprise M1 ; le backtest remplace uniquement ce trigger par un proxy causal M5. Le macro HIGH/CRITICAL et le spread cTrader restent des garde-fous LIVE non reconstitués parfaitement dans le CSV. Voir `R02_BACKTEST_M5_PROXY.md` et `AUDIT_R02_V0.7.1_CALIBRATED.md`.

Contrôles R02 :

```bash
npm test
npm run check
npm run security
npm run smoke
node scripts/stress-r02.mjs
node scripts/stress-r01.mjs
node scripts/stress-v050.mjs
```

Validation finale : **139/139 tests**, R02 stress 200, R01 stress complet antérieur 801 + recheck final borné 161, moteur général 3 000, plus parité SHA-256 exacte du backtest standalone sur les 45 trades.
