# Audit R03 v0.9.3 — Invalidation State Hardened

Date : 2026-09-16

## Verdict

R03 est plus sûre et plus cohérente qu'en v0.9.2, mais **reste volontairement RESEARCH / SHADOW**. Aucun seuil n'a été retuné pour embellir le backtest ES et aucune performance XAUUSD n'est inventée sans le CSV Gold brut.

La v0.9.3 ferme un défaut de machine d'état : un pullback déjà pertinent pouvait devenir trop fort ou casser la structure, être rejeté par `findR03Pullback()`, puis disparaître entièrement. `evaluateR03()` retombait alors à `DETECTED` au lieu d'exposer `INVALIDATED`. Comme l'interface mémorise un signal complet 15 minutes, ce comportement pouvait laisser visible un signal ancien alors que la thèse avait déjà été invalidée.

## Correction implantée

Nouvelle fonction `assessR03Pullback()` :

- conserve le meilleur candidat valide ;
- conserve aussi le dernier candidat explicitement invalidé ;
- distingue `PULLBACK_NOT_WEAK`, `RETRACE_TOO_DEEP` et `STRUCTURE_BROKEN` ;
- ne transforme pas un simple pullback trop peu développé / sans zone utile en fausse invalidation ;
- `findR03Pullback()` reste compatible et ne retourne toujours qu'un setup valide ;
- `evaluateR03()` utilise l'évaluation complète pour produire `INVALIDATED` lorsque la thèse est réellement cassée.

Conséquence UX : `captureSignalIfNeeded()` efface déjà un signal mémorisé quand le stage devient `INVALIDATED`. La v0.9.3 fournit désormais correctement cet état pour les invalidations internes du pullback, pas seulement pour un stop broker-side.

## Contrôle de transitions BUY/SELL

Sweep dédié conservé dans `R03_INVALIDATION_THRESHOLD_SWEEP.json`.

### Volume du pullback

Avec la fixture de référence, en faisant varier uniquement le volume des trois M5 de pullback :

- BUY : `ENTRY_READY` jusqu'au voisinage du plafond ; à `ratio = 0,88034`, passage à `INVALIDATED / PULLBACK_NOT_WEAK` ; aucun réarmement ensuite.
- SELL : transition identique ; aucun réarmement ensuite.

Le seuil correspond bien au paramètre `maxPullbackVolumeRatio = 0.88` avec l'arrondi dû aux volumes unitaires des trois barres.

### Profondeur du pullback

BUY et SELL suivent la même logique miroir :

- pullback trop peu développé / sans zone utile : `DETECTED`, pas de fausse invalidation ;
- pullback valide : `ENTRY_READY` ou `CONFIRMED` selon la géométrie d'entrée ;
- pullback devenu non faible : `INVALIDATED / PULLBACK_NOT_WEAK` ;
- retracement au-delà de la limite : `INVALIDATED / RETRACE_TOO_DEEP` ;
- cassure de l'origine de l'impulsion : `INVALIDATED / STRUCTURE_BROKEN`.

Les quatre contrôles automatiques du sweep sont vrais : absence de réarmement après invalidation sur montée du volume BUY/SELL et détection de la cassure structurelle BUY/SELL.

## Correction v0.9.2 conservée — ordre TP1 / TP2

Le recomptage indépendant du ledger ES avait trouvé **40 / 310** plans où l'ancien libellé pouvait placer la cible structurelle plus loin que la cible fixe 2R. La v0.9.2 a corrigé ce point : l'objectif rencontré en premier devient toujours TP1 ; l'autre devient TP2. La v0.9.3 conserve ce garde et le stress impose :

- BUY : `SL < ENTRY < TP1 < TP2` ;
- SELL : `SL > ENTRY > TP1 > TP2` ;
- `rr1 <= rr2`.

## Falsification externe ES — résultat inchangé

La vérification indépendante stockée dans `R03_ES_EXTERNAL_INDEPENDENT_CHECK.json` reste la référence externe actuelle. Elle n'est **pas** utilisée pour calibrer le Gold :

| Bloc | Trades | Win rate | Exp. | PF | Net R | Max DD |
|---|---:|---:|---:|---:|---:|---:|
| FULL | 310 | 26,45 % | -0,4322R | 0,5165 | -133,98R | 141,58R |
| DEV 2020–2023 | 187 | 26,20 % | -0,4424R | 0,5043 | -82,74R | 85,79R |
| VAL 2024–2025 | 88 | 22,73 % | -0,5660R | 0,4096 | -49,81R | 52,30R |
| SEALED 2026 | 35 | 37,14 % | -0,0412R | 0,9442 | -1,44R | 5,99R |

La grille de voisinage compte 243 variantes : **0/243** ont une expectancy positive simultanément DEV + VAL, et **0/243** ont PF > 1 simultanément DEV + VAL. Cela interdit de présenter la paramétrisation générique comme robuste cross-market.

## Pourquoi R03 n'est toujours pas promue

Le dataset Gold canonique connu dans les audits antérieurs contient 375 985 M5 entre 2021-05-19 et 2026-09-07, mais le fichier brut n'est pas présent dans le runtime actif de cette passe. Les rapports historiques ne remplacent pas le replay de la **nouvelle** R03 : ils concernent d'autres variantes de Trend Pullback.

Le firewall reste donc :

- `mode = shadow` ;
- `promotionGate = XAUUSD_REPLAY_REQUIRED` ;
- `actionable = false` dans `StrategyRuntime` ;
- `execution = null` dans le plan ;
- aucune écriture broker.

Les besoins exacts sont documentés dans `R03_GOLD_REPLAY_REQUIREMENTS.md` : idéalement XAUUSD M1 BID + ASK ; à défaut, le M5 canonique permet une calibration proxy explicite du contexte et de la géométrie.

## Vérifications d'implantation

Après la correction :

- tests ciblés R03 + intégration : PASS ;
- suite globale : **182/182 PASS**, 0 fail, 0 skipped ;
- `npm run check` : PASS ;
- `npm run security` : PASS ;
- `npm run smoke` : PASS ;
- stress R03 : **320 évaluations** BUY/SELL/scénarios, 0 invariant failure ;
- sweep de seuils invalidation : PASS ;
- ordre TP1/TP2 contrôlé dans les tests et dans le stress ;
- BUY stop déclenché BID / SELL stop déclenché ASK ;
- volumes manquants = fail-closed ;
- trigger M1 trop ancien = `EXPIRED` ;
- aucune bougie future/incomplète ne peut influencer la décision ;
- aucune primitive d'exécution automatique.

## État final de cette passe

**Technique : renforcée et cohérente.**  
**Statistique Gold de cette implémentation exacte : pas encore certifiée.**  
**Production : interdite par construction tant que le replay XAUUSD n'est pas fourni et reproduit.**
