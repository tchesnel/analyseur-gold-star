# Audit v0.8.2 — Decision UX + Signal Hold

## Objet

Cette version ne remplace pas les moteurs stratégiques R01/R02. Elle refond leur présentation pour rendre la décision lisible immédiatement et ajoute une mémorisation temporaire d'un plan validé afin qu'un signal exploitable ne disparaisse pas au tick suivant.

## 1. Signal mémorisé

Durée par défaut : **15 minutes** pour R01 et R02.

Lorsqu'une route est réellement `ENTRY_READY` avec toutes les validations obligatoires satisfaites :

1. le plan est capturé une seule fois pour l'identité du setup ;
2. direction, entrée, SL, TP1, TP2 et overlays sont figés ;
3. un compte à rebours de 15 minutes démarre ;
4. le même setup ne repousse pas l'échéance à chaque tick ;
5. un rechargement de page conserve le signal grâce à `localStorage`.

Si le moteur n'est plus `ENTRY_READY` pendant cette fenêtre, le plan ne disparaît pas brutalement. L'interface le présente comme **SIGNAL MÉMORISÉ** et indique la durée restante. Cela distingue explicitement un signal historique encore consultable d'une validation live actuelle.

Le signal est retiré lorsque :

- les 15 minutes sont écoulées ;
- le setup est explicitement `INVALIDATED` ;
- le quote live indique que le niveau terminal est déjà atteint (SL ou TP2 selon le sens).

Ce mécanisme n'est pas une exécution automatique et ne transforme pas un ancien signal en ordre actuel. Le prix live doit toujours être vérifié avant toute prise de position manuelle.

## 2. Refonte de l'interface

### Navigation

Trois vues distinctes :

- **STRATÉGIES** : décision R01/R02 ;
- **MARCHÉ** : grand graphique et contexte général ;
- **DIAGNOSTIC** : état cTrader/moteur et informations techniques.

### Vue stratégies

Deux cartes compactes résument R01 et R02. Une seule route détaillée est affichée à la fois.

Ordre de lecture d'une route :

1. décision principale ;
2. prochaine étape attendue ;
3. plan de trade ;
4. timeline/parcours du setup ;
5. validations regroupées par Structure / Confirmation / Exécution ;
6. graphique autonome simplifié ;
7. détails techniques complets, repliés par défaut.

### États visuels

- Validé : vert.
- Bloquant / invalidé réellement : rouge.
- Pas encore applicable : gris / `EN ATTENTE`.
- Setup en cours : ambre.
- Information : bleu/neutre.

Un critère non encore évaluable n'est plus présenté comme un échec rouge.

## 3. Corrections de cohérence découvertes pendant la refonte

### R01

Les contrôles suivants ne peuvent plus apparaître comme satisfaits avant qu'ils soient réellement évaluables :

- régime ADX M5 ;
- fenêtre/session liée au sweep ;
- géométrie entrée → SL.

Ils nécessitent maintenant le contexte/sweep/plan pertinent au lieu de devenir vrais sur une valeur absente ou un état trop précoce.

### R02

Le contrôle de biais H4 exige désormais un breakout/direction réellement disponible. Deux valeurs absentes ne peuvent plus produire une égalité et donc un faux `true`.

Les correctifs broker-aware de v0.8.1 restent en place : entrée BUY sur ASK réel, SL BUY surveillé côté BID et plan non `ENTRY_READY` si le prix exécutable dérive au-delà de la géométrie de risque admissible.

## 4. Validation

- Suite tests : **152/152 PASS** avant packaging final.
- Stress R01 v0.8.2 : **81 évaluations**, 0 invariant cassé (8 classes × 10 + calibration guard).
- Stress R02 v0.8.2 : **200 évaluations**, 0 invariant cassé.
- `execution = null` / aucune primitive d'exécution automatique ajoutée.

Le contrôle navigateur automatisé local n'a pas pu être utilisé dans cet environnement car la politique du navigateur bloque les URL localhost/file. La validation finale repose donc sur les tests, contrôles statiques, smoke/security et contrôles DOM/CSS automatisés ; elle ne doit pas être présentée comme un test visuel navigateur complet.

## 5. Limite importante

Le maintien 15 minutes sert à laisser au trader le temps de **voir** et **examiner** le plan qui vient d'être validé. Cela ne signifie pas qu'une entrée reste valable pendant 15 minutes quel que soit le déplacement du prix. Si le moteur n'est plus à 100 %, l'interface l'indique explicitement comme signal mémorisé. La pertinence d'une entrée manuelle doit être réévaluée par rapport au prix live.
