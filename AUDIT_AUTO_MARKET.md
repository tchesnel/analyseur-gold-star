# Audit v0.4.0 — AUTO MARKET

## Objet

Le moteur visuel analyse XAUUSD en continu et choisit automatiquement les familles graphiques utiles au contexte courant. Le calcul reste séparé de toute exécution d'ordre.

## Nouveaux modules

- Liquidité interne : micro-pivots non consommés dans le dealing range majeur actif, regroupés par proximité.
- Fibonacci automatique : swing majeur confirmé, amplitude minimale relative à l'ATR, retracements 23.6/38.2/50/61.8/78.6, zone 61.8–78.6 et extensions 127.2/161.8 après continuation.
- Sélecteur AUTO : score de pertinence par famille, maximum 8 familles visibles simultanément.
- AUTO / MANUEL : AUTO est le mode par défaut ; en AUTO, les cases reflètent la décision du moteur et sont non modifiables.
- Focus AUTO : explication courte des raisons dominantes du contexte.

## Vérification 1 — logique

`npm test` : **77/77 tests réussis**.

Inclut les tests spécifiques :
- liquidité interne non consommée ;
- Fibonacci ancré sur swings confirmés ;
- sélection AUTO contextuelle ;
- mode AUTO par défaut ;
- non-régression OAuth/cTrader/SSE/SMC.

## Vérification 2 — structure et sécurité

- `npm run check` : **CHECK OK** — 44 fichiers JS analysés.
- `npm run security` : **SECURITY CHECK OK**.
- scope OAuth `accounts` uniquement ;
- aucune primitive d'exécution d'ordre ;
- aucun secret cTrader dans le frontend ;
- transport cTrader verrouillé sur LIVE.

## Vérification 3 — intégration

- `npm run smoke` : **SMOKE OK**.
- serveur local final v0.4.0 en mode mock ;
- flux SSE analysé jusqu'au payload `visual` non vide ;
- `display.mode = auto` ;
- maximum 8 familles actives ;
- objets `internalLiquidity` réellement présents ;
- objets `fibonacci` réellement présents ;
- `execution = null`.

Exemple d'une décision AUTO observée pendant le contrôle :
- focus : `STRUCTURE BEARISH` ;
- calques actifs : structure, liquidité, liquidité interne, Fibonacci, sessions, VWAP, RSI ;
- raisons : CHOCH récent, sweep récent, liquidité interne proche, RSI extrême, extension Fibonacci active.
