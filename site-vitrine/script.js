/* Moteur du site : lit contenu.js et construit la page.
   Tu n'as normalement PAS besoin de modifier ce fichier. */
(function () {
  "use strict";

  var C = window.CONTENU;
  var racine = document.getElementById("site");

  if (!C) {
    racine.innerHTML =
      '<div class="panne"><h1>Le fichier contenu.js contient une erreur</h1>' +
      "<p>Il manque sûrement une virgule, un guillemet ou une accolade près de ta dernière modification. " +
      "Annule-la ou corrige la ligne modifiée, puis enregistre à nouveau.</p></div>";
    return;
  }

  var langues = (C.langues && C.langues.length) ? C.langues : ["pt"];
  var lang = choisirLangue();
  var ongletActif = "web";
  var X = C.textes || {};
  var T = C.tarifs || {};

  /* ---------- Outils ---------- */
  function t(v) {
    if (v == null) return "";
    if (typeof v !== "object") return String(v);
    if (v[lang] != null) return v[lang];
    if (v[langues[0]] != null) return v[langues[0]];
    return v.pt || v.fr || v.en || "";
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function riche(v) { return esc(t(v)).replace(/\*(.+?)\*/g, "<em>$1</em>"); }
  function remplir(modele, valeurs) {
    return t(modele).replace(/\{(\w+)\}/g, function (_, k) { return valeurs[k] != null ? valeurs[k] : ""; }).replace(/\s+/g, " ").trim();
  }
  function euros(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " €"; }
  function nombre(prix) {
    if (typeof prix === "number") return prix;
    var n = parseInt(String(t(prix)).replace(/[^\d]/g, ""), 10);
    return isNaN(n) ? Infinity : n;
  }
  function affPrix(prix) { return typeof prix === "number" ? euros(prix) : t(prix).replace(/ €$/, " €"); }
  function demande(service, formule, classe) {
    return '<a class="btn ' + classe + '" href="#contact" data-demande="' + esc(service) + '"' + (formule ? ' data-formule="' + esc(formule) + '"' : "") + ">" +
      esc(t(X.choisir)) + ico("fleche") + "</a>";
  }
  function ext(href) { return ' href="' + esc(href) + '" target="_blank" rel="noopener"'; }
  function choisirLangue() {
    var demandee = null;
    try { demandee = new URLSearchParams(location.search).get("lang"); } catch (e) {}
    if (demandee && langues.indexOf(demandee) > -1) return demandee;
    try {
      var memo = localStorage.getItem("langue");
      if (memo && langues.indexOf(memo) > -1) return memo;
    } catch (e) {}
    var nav = (navigator.language || "").slice(0, 2).toLowerCase();
    return langues.indexOf(nav) > -1 ? nav : langues[0];
  }
  function moinsCher(liste) {
    var min = null;
    (liste || []).forEach(function (x) { if (!min || nombre(x.prix) < nombre(min.prix)) min = x; });
    return min;
  }
  function tete(surtitre, titre, texte) {
    return '<div class="tete">' + (t(surtitre) ? '<p class="surtitre">' + esc(t(surtitre)) + "</p>" : "") +
      "<h2>" + riche(titre) + "</h2>" + (t(texte) ? '<p class="doux">' + riche(texte) + "</p>" : "") + "</div>";
  }

  /* ---------- Icônes ---------- */
  var traces = {
    fleche: '<path d="M4 12h16M14 6l6 6-6 6"/>',
    diagonale: '<path d="M7 17L17 7M8 7h9v9"/>',
    message: '<path d="M20.5 11.6a8.4 8.4 0 0 1-12.3 7.4L3.5 20.5l1.5-4.6a8.4 8.4 0 1 1 15.5-4.3z"/>',
    menu: '<path d="M3 8h18M3 16h18"/>'
  };
  function ico(nom) {
    return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" aria-hidden="true">' + traces[nom] + "</svg>";
  }

  /* Mots décalés comme le logo : mot + barre / barre + mot */
  function decale(lignes, classe) {
    return '<div class="large decale ' + classe + '" aria-hidden="true">' +
      (lignes || []).map(function (l, i) {
        var mot = '<span class="mot">' + esc(t(l)) + "</span>";
        var barre = '<span class="barre"></span>';
        return '<span class="ligne">' + (i % 2 ? barre + mot : mot + barre) + "</span>";
      }).join("") + "</div>";
  }

  /* ---------- Sections ---------- */
  function entete() {
    var M = C.menu || {};
    var liens = ["realisations", "services", "tarifs", "studio", "contact"].map(function (k) {
      return M[k] ? '<a href="#' + k + '">' + esc(t(M[k])) + "</a>" : "";
    }).join("");
    var choix = langues.length > 1
      ? '<div class="langues" role="group" aria-label="Idioma / Langue / Language">' +
        langues.map(function (l) { return '<button type="button" data-lang="' + l + '" aria-pressed="' + (l === lang) + '">' + l + "</button>"; }).join("") +
        "</div>"
      : "";
    return (
      (C.offre && C.offre.afficher ? '<div class="offre">' + esc(t(C.offre.texte)) + "</div>" : "") +
      '<header class="entete" id="entete"><div class="wrap">' +
      '<a class="logo" href="#top"><img class="logo-lettres" src="images/logo-hego-lettres.svg" alt="' + esc(C.marque) + '" width="92" height="31"></a>' +
      '<nav class="nav" id="nav">' + liens +
        '<div class="nav-extra">' + choix + '<a class="btn btn--plein" href="#contact">' + esc(t(C.accueil.boutonPrincipal)) + ico("fleche") + "</a></div>" +
      "</nav>" +
      '<div class="entete-actions"><div class="langues-entete">' + choix + "</div>" +
      '<a class="btn btn--plein btn--petit" href="#contact">' + esc(t(C.accueil.boutonPrincipal)) + "</a>" +
      '<button class="menu-btn" type="button" id="menuBtn" aria-expanded="false" aria-controls="nav" aria-label="' + esc(t(X.menu)) + '">' + ico("menu") + "</button>" +
      "</div></div></header>"
    );
  }

  function accueil() {
    var A = C.accueil;
    var web = moinsCher(T.web && T.web.formules);
    var soc = moinsCher(T.social && T.social.formules);
    var vid = moinsCher(T.video && T.video.liste);
    var chiffres = [
      web && { onglet: "web", prix: affPrix(web.prix), unite: "", legende: X.chiffreWeb },
      soc && { onglet: "social", prix: affPrix(soc.prix), unite: t(T.social.unite), legende: X.chiffreSocial },
      vid && { onglet: "video", prix: affPrix(vid.prix), unite: "", legende: X.chiffreVideo }
    ].filter(Boolean);
    return (
      '<section class="hero clair" id="top"><div class="wrap">' +
      '<div class="hero-haut"><span>' + esc(C.marque) + " · " + esc(t(C.activite)) + "</span><span>" + esc(C.pays) + "</span></div>" +
      decale(A.lignes, "hero-mots") +
      '<div class="hero-bas"><div>' +
        '<h1 class="hero-titre">' + riche(A.titre) + "</h1>" +
        '<p class="hero-texte">' + riche(A.texte) + "</p>" +
        '<div class="hero-boutons">' +
          '<a class="btn btn--plein" href="#contact">' + esc(t(A.boutonPrincipal)) + ico("fleche") + "</a>" +
          '<a class="btn btn--ligne" href="#tarifs">' + esc(t(A.boutonSecondaire)) + "</a>" +
        "</div></div>" +
        '<div class="chiffres">' + chiffres.map(function (c) {
          return '<a class="chiffre" href="#tarifs" data-onglet="' + c.onglet + '"><small>' + esc(t(X.desde)) + "</small>" +
            "<strong>" + esc(c.prix) + (c.unite ? "<sup>" + esc(c.unite) + "</sup>" : "") + "</strong>" +
            "<span>" + esc(t(c.legende)) + "</span></a>";
        }).join("") + "</div>" +
      "</div></div></section>"
    );
  }

  function services() {
    var S = C.services;
    var prixMin = {
      web: moinsCher(T.web && T.web.formules),
      social: moinsCher(T.social && T.social.formules),
      video: moinsCher(T.video && T.video.liste)
    };
    return (
      '<section class="bande clair services" id="services"><div class="wrap">' + tete(null, S.titre) +
      '<div class="services-liste">' +
      (S.liste || []).map(function (s) {
        var p = prixMin[s.onglet];
        var unite = s.onglet === "social" ? t(T.social.unite) : "";
        return (
          '<a class="service" href="#tarifs" data-onglet="' + esc(s.onglet) + '">' +
          '<h3 class="large service-nom">' + esc(t(s.nom)) + "</h3>" +
          '<div class="service-desc"><p>' + riche(s.texte) + '</p><ul class="tags">' +
            (s.tags || []).map(function (g) { return "<li>" + esc(t(g)) + "</li>"; }).join("") + "</ul></div>" +
          '<div class="service-prix">' + (p ? "<small>" + esc(t(X.desde)) + "</small><strong>" + esc(affPrix(p.prix)) + esc(unite) + "</strong>" : "") + ico("fleche") + "</div>" +
          "</a>"
        );
      }).join("") +
      "</div></div></section>"
    );
  }

  function carte(f, unite, W, service) {
    var nom = t(f.nom);
    var mensuel = f.mensuel && W
      ? '<p class="carte-mensuel">+ ' + esc(affPrix(f.mensuel)) + esc(t(W.unite)) + " <span>" + esc(t(W.libelleMensuel)) + "</span></p>"
      : "";
    return (
      '<article class="carte' + (f.populaire ? " carte--populaire sombre" : "") + '">' +
      '<div class="carte-tete"><h3 class="carte-nom">' + esc(nom) + "</h3>" + (f.populaire ? '<span class="badge">' + esc(t(X.populaire)) + "</span>" : "") + "</div>" +
      '<div><div class="prix">' + (t(f.prefixe) ? "<small>" + esc(t(f.prefixe)) + "</small>" : "") + "<strong>" + esc(affPrix(f.prix)) + "</strong>" +
        (unite ? "<small>" + esc(unite) + "</small>" : "") + "</div>" + mensuel + "</div>" +
      "<p>" + riche(f.description) + "</p>" +
      '<ul class="inclus">' + (f.inclus || []).map(function (i) { return "<li>" + riche(i) + "</li>"; }).join("") + "</ul>" +
      (t(f.note) ? '<p class="carte-note">' + riche(f.note) + "</p>" : "") +
      demande(service, nom, "btn--ligne") +
      "</article>"
    );
  }

  function tarifs() {
    var O = T.onglets || {};
    var W = T.web || {}, S = T.social || {}, V = T.video || {}, P = T.pack, M = W.maintenance;

    var panWeb = '<div class="cartes">' + (W.formules || []).map(function (f) { return carte(f, "", W, "web"); }).join("") + "</div>" +
      (M ? '<div class="maintenance"><h3>' + riche(M.titre) + '</h3><ul>' +
        (M.elements || []).map(function (e) { return "<li>" + riche(e) + "</li>"; }).join("") + "</ul>" +
        (t(M.texte) ? '<p class="doux">' + riche(M.texte) + "</p>" : "") + "</div>" : "");

    var panSocial = '<div class="cartes">' + (S.formules || []).map(function (f) { return carte(f, t(S.unite), null, "social"); }).join("") + "</div>" +
      (t(S.note) ? '<p class="note">' + riche(S.note) + "</p>" : "");

    var panVideo = '<div class="liste-prix">' + (V.liste || []).map(function (v) {
      return "<div><h3>" + esc(t(v.nom)) + "</h3><p>" + riche(v.detail) + '</p><div class="prix">' +
        (t(v.prefixe) ? "<small>" + esc(t(v.prefixe)) + "</small>" : "") + "<strong>" + esc(affPrix(v.prix)) + "</strong></div></div>";
    }).join("") + "</div>" +
      '<div class="panneau-action">' + demande("video", "", "btn--plein") + "</div>";

    var pack = P && P.afficher
      ? '<div class="pack sombre"><div><p class="surtitre">' + esc(t(P.etiquette)) + "</p><h3>" + riche(P.titre) + '</h3><p class="pack-texte">' + riche(P.texte) + "</p></div>" +
        '<div class="pack-prix"><div class="prix"><strong>' + esc(affPrix(P.prix)) + "</strong>" + (P.ancienPrix ? "<del>" + esc(affPrix(P.ancienPrix)) + "</del>" : "") + "</div>" +
        (P.ancienPrix ? '<span class="pack-economie">' + esc(t(X.economie)) + " " + euros(nombre(P.ancienPrix) - nombre(P.prix)) + "</span>" : "") +
        demande("pack", t(P.etiquette), "btn--plein") + "</div></div>"
      : "";

    var panneaux = [["web", panWeb], ["social", panSocial], ["video", panVideo]];
    return (
      '<section class="bande beton" id="tarifs"><div class="wrap">' + tete(null, T.titre, T.texte) +
      '<div class="onglets" role="tablist">' + panneaux.map(function (p) {
        return '<button type="button" role="tab" id="tab-' + p[0] + '" aria-controls="pan-' + p[0] + '" aria-selected="' + (p[0] === ongletActif) + '" data-onglet="' + p[0] + '">' + esc(t(O[p[0]])) + "</button>";
      }).join("") + "</div>" +
      panneaux.map(function (p) {
        return '<div class="panneau" role="tabpanel" id="pan-' + p[0] + '" aria-labelledby="tab-' + p[0] + '"' + (p[0] === ongletActif ? "" : " hidden") + ">" + p[1] + "</div>";
      }).join("") +
      pack +
      (t(T.note) ? '<p class="note doux">' + riche(T.note) + "</p>" : "") +
      "</div></section>"
    );
  }

  function realisations() {
    var R = C.realisations;
    var projets = (R.projets || []).map(function (p) {
      var lien = p.lien ? "<a" + ext(p.lien) + ">" + esc(t(p.lienTexte) || p.lien) + ico("diagonale") + "</a>" : "";
      return (
        '<article class="projet">' +
        '<div class="projet-visuel">' + (p.image ? '<img src="' + esc(p.image) + '" alt="' + esc(t(p.nom)) + '" width="965" height="699" loading="lazy" decoding="async">' : "") + "</div>" +
        '<div class="projet-texte"><p class="projet-cat">' + esc(t(p.categorie)) + "</p>" +
        '<h3 class="projet-nom">' + esc(t(p.nom)) + "</h3>" +
        '<p class="projet-phrase">' + riche(p.phrase) + "</p>" +
        '<p class="projet-desc">' + riche(p.texte) + "</p>" +
        (lien ? '<p class="projet-lien">' + lien + "</p>" : "") +
        "</div></article>"
      );
    }).join("");
    var exemples = (R.exemples || []).length
      ? '<div class="exemples-tete" id="exemples"><h3>' + riche(R.exemplesTitre) + '</h3><p class="doux">' + riche(R.exemplesTexte) + "</p></div>" +
        '<div class="exemples-grille">' + R.exemples.map(function (x) {
          var vrai = String(x.lien || "").indexOf("http") === 0;
          return '<a class="exemple" href="' + esc(x.lien) + '"' + (vrai ? ' target="_blank" rel="noopener"' : "") + ">" +
            '<div class="exemple-image">' + (x.image ? '<img src="' + esc(x.image) + '" alt="" width="800" height="600" loading="lazy" decoding="async">' : "") + "</div>" +
            '<div class="exemple-infos"><h4>' + esc(t(x.nom)) + "</h4><span>" + esc(t(x.type)) + (vrai ? "" : " · " + esc(t(X.fictif))) + "</span></div>" +
            '<span class="exemple-lien">' + esc(t(X.voirSite)) + ico("fleche") + "</span></a>";
        }).join("") + "</div>"
      : "";
    return '<section class="bande sombre realisations" id="realisations"><div class="wrap">' + tete(null, R.titre) +
      '<div class="projets">' + projets + "</div>" + exemples + "</div></section>";
  }

  function methode() {
    var M = C.processus;
    return (
      '<section class="bande clair methode" id="methode"><div class="wrap">' + tete(null, M.titre) +
      '<ol class="etapes">' + (M.etapes || []).map(function (e, i) {
        return '<li class="etape"><span class="etape-num">' + (i + 1) + ".</span><h3>" + riche(e.titre) + "</h3><p>" + riche(e.texte) + "</p></li>";
      }).join("") + "</ol></div></section>"
    );
  }

  function studio() {
    var S = C.studio;
    return (
      '<section class="bande beton studio" id="studio"><div class="wrap">' +
      '<div class="studio-logo"><img src="images/logo-hego-rond.svg" alt="' + esc(C.marque) + '"></div>' +
      '<div class="studio-texte"><p class="surtitre">' + esc(t(S.surtitre)) + "</p><h2>" + riche(S.titre) + "</h2>" +
      (S.paragraphes || []).map(function (p) { return "<p>" + riche(p) + "</p>"; }).join("") +
      (t(S.langues) ? '<p class="langues-parlees">' + esc(t(S.langues)) + "</p>" : "") +
      "</div></div></section>"
    );
  }

  function faq() {
    var F = C.faq;
    return (
      '<section class="bande clair faq" id="faq"><div class="wrap">' +
      '<div><h2>' + riche(F.titre) + "</h2></div>" +
      '<div class="questions">' + (F.liste || []).map(function (q) {
        return "<details><summary>" + riche(q.question) + '<span class="plus" aria-hidden="true"></span></summary><p>' + riche(q.reponse) + "</p></details>";
      }).join("") + "</div></div></section>"
    );
  }

  function contact() {
    var K = C.contact;
    var O = T.onglets || {};
    var canaux =
      '<li><a href="mailto:' + esc(C.email) + '"><small>' + esc(t(X.email)) + "</small><strong class=\"sans-maj\">" + esc(C.email) + "</strong>" + ico("diagonale") + "</a></li>" +
      (C.instagram ? '<li><a' + ext(C.instagram) + "><small>" + esc(t(X.instagram)) + "</small><strong>" + esc(C.instagramPseudo || "Instagram") + "</strong>" + ico("diagonale") + "</a></li>" : "") +
      '<li><div class="canal"><small>' + esc(t(X.zone)) + "</small><strong>" + esc(t(K.zone)) + "</strong></div></li>";
    var options = [["web", t(O.web)], ["social", t(O.social)], ["video", t(O.video)], ["pack", T.pack && T.pack.afficher ? t(T.pack.etiquette) : ""], ["autre", t(X.autre)]]
      .filter(function (o) { return o[1]; })
      .map(function (o) { return '<option value="' + o[0] + '">' + esc(o[1]) + "</option>"; }).join("");
    return (
      '<section class="bande sombre contact" id="contact"><div class="wrap">' +
      '<div class="contact-grille"><div>' + tete(null, K.titre, K.texte) + '<ul class="canaux">' + canaux + "</ul></div>" +
      '<form class="formulaire" id="formulaire" novalidate>' +
        '<div class="champ"><label for="f-nom">' + esc(t(X.champNom)) + '</label><input id="f-nom" name="nom" autocomplete="name" required></div>' +
        '<div class="champ"><label for="f-email">' + esc(t(X.champEmail)) + '</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>' +
        '<div class="champ"><label for="f-commerce">' + esc(t(X.champCommerce)) + '</label><input id="f-commerce" name="commerce" autocomplete="organization"></div>' +
        '<div class="champ"><label for="f-service">' + esc(t(X.champService)) + '</label><select id="f-service" name="service">' + options + "</select></div>" +
        '<div class="champ"><label for="f-message">' + esc(t(X.champMessage)) + '</label><textarea id="f-message" name="message"></textarea></div>' +
        '<input class="piege" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<p class="erreur" id="f-erreur" role="alert" hidden></p>' +
        '<button class="btn btn--plein" type="submit" id="f-envoyer">' + esc(t(X.envoyer)) + ico("fleche") + "</button>" +
        '<p class="mentions">' + esc(t(X.confidentialite)) + ' <a href="privacidade.html">' + esc(t(X.politique)) + "</a></p>" +
      "</form>" +
      '<div class="merci" id="f-merci" role="status" hidden><p class="surtitre">' + esc(C.marque) + "</p><h3>" + esc(t(X.merciTitre)) + '</h3><p class="doux">' + esc(t(X.merciTexte)) + "</p></div>" +
      "</div></div></section>"
    );
  }

  function pied() {
    return (
      '<footer class="pied sombre"><div class="wrap">' +
      '<div class="pied-marque"><img src="images/logo-hego-rond-blanc.svg" alt=""><div><strong>' + esc(C.marque) + "</strong>" + esc(t(C.activite)) + "</div></div>" +
      '<div class="pied-liens">' +
      (C.instagram ? "<a" + ext(C.instagram) + ">Instagram</a>" : "") +
      (C.livroReclamacoes ? "<a" + ext("https://www.livroreclamacoes.pt") + ">" + esc(t(X.livro)) + "</a>" : "") +
      '<a href="privacidade.html">' + esc(t(X.politique)) + "</a>" +
      "<span>" + esc(t(C.pied.cookies)) + "</span></div>" +
      "<span>© " + new Date().getFullYear() + " " + esc(C.marque) + (C.nif ? " · NIF " + esc(C.nif) : "") + "</span>" +
      "</div></footer>"
    );
  }

  /* ---------- Assemblage ---------- */
  function afficher() {
    document.documentElement.lang = lang;
    document.title = C.marque + " · " + t(C.activite) + " · " + C.pays;
    racine.innerHTML = entete() + "<main>" + accueil() + realisations() + services() + tarifs() + methode() + studio() + faq() + contact() + "</main>" + pied();
    brancher();
  }

  function choisirOnglet(id, defiler) {
    if (!document.getElementById("pan-" + id)) return;
    ongletActif = id;
    Array.prototype.forEach.call(document.querySelectorAll('.onglets [role="tab"]'), function (b) {
      var actif = b.getAttribute("data-onglet") === id;
      b.setAttribute("aria-selected", String(actif));
      document.getElementById("pan-" + b.getAttribute("data-onglet")).hidden = !actif;
    });
    if (defiler) document.getElementById("tarifs").scrollIntoView({ behavior: "smooth" });
  }

  function brancher() {
    // Langues
    Array.prototype.forEach.call(document.querySelectorAll("[data-lang]"), function (b) {
      b.addEventListener("click", function () {
        lang = b.getAttribute("data-lang");
        try { localStorage.setItem("langue", lang); } catch (e) {}
        document.documentElement.classList.remove("menu-ouvert");
        var y = window.scrollY;
        afficher();
        window.scrollTo(0, y);
      });
    });

    // Menu mobile
    var ent = document.getElementById("entete");
    var btn = document.getElementById("menuBtn");
    function basculer(ouvert) {
      ent.classList.toggle("ouvert", ouvert);
      document.documentElement.classList.toggle("menu-ouvert", ouvert);
      btn.setAttribute("aria-expanded", String(ouvert));
    }
    btn.addEventListener("click", function () { basculer(!ent.classList.contains("ouvert")); });
    Array.prototype.forEach.call(document.querySelectorAll("#nav a"), function (a) { a.addEventListener("click", function () { basculer(false); }); });
    document.onkeydown = function (ev) { if (ev.key === "Escape") basculer(false); };
    window.onresize = function () { if (window.innerWidth > 1100) basculer(false); };

    // Onglets des tarifs (+ liens qui ouvrent le bon onglet)
    Array.prototype.forEach.call(document.querySelectorAll("[data-onglet]"), function (el) {
      el.addEventListener("click", function (ev) {
        var id = el.getAttribute("data-onglet");
        if (el.getAttribute("role") === "tab") { choisirOnglet(id, false); return; }
        ev.preventDefault();
        choisirOnglet(id, true);
      });
    });

    // Onglets : navigation au clavier (flèches)
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.onglets [role="tab"]'));
    tabs.forEach(function (tab, i) {
      tab.setAttribute("tabindex", tab.getAttribute("aria-selected") === "true" ? "0" : "-1");
      tab.addEventListener("keydown", function (ev) {
        var d = ev.key === "ArrowRight" ? 1 : ev.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        ev.preventDefault();
        var suivant = tabs[(i + d + tabs.length) % tabs.length];
        choisirOnglet(suivant.getAttribute("data-onglet"), false);
        tabs.forEach(function (x) { x.setAttribute("tabindex", x === suivant ? "0" : "-1"); });
        suivant.focus();
      });
      tab.addEventListener("click", function () { tabs.forEach(function (x) { x.setAttribute("tabindex", x === tab ? "0" : "-1"); }); });
    });

    // Boutons "Demander un devis" → formulaire prérempli
    var form = document.getElementById("formulaire");
    function preremplir(service, formule) {
      if (service && form.service.querySelector('option[value="' + service + '"]')) form.service.value = service;
      if (formule) form.message.value = remplir(X.messageFormule, { formule: formule });
    }
    Array.prototype.forEach.call(document.querySelectorAll("[data-demande]"), function (el) {
      el.addEventListener("click", function (ev) {
        ev.preventDefault();
        preremplir(el.getAttribute("data-demande"), el.getAttribute("data-formule"));
        document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
        setTimeout(function () { try { form.nom.focus({ preventScroll: true }); } catch (e) {} }, 700);
      });
    });
    try {
      var demo = new URLSearchParams(location.search).get("demo");
      if (demo) { form.service.value = "web"; form.message.value = remplir(X.messageDemo, { commerce: demo }); }
    } catch (e) {}

    // Envoi du formulaire → e-mail (FormSubmit)
    var err = document.getElementById("f-erreur");
    var bouton = document.getElementById("f-envoyer");
    var merci = document.getElementById("f-merci");
    function erreur(texte, lienSecours) {
      err.innerHTML = esc(texte) + (lienSecours ? ' <a class="lien-secours" href="' + esc(lienSecours) + '">' + esc(t(X.secours)) + "</a>" : "");
      err.hidden = false;
    }
    form.addEventListener("input", function () { err.hidden = true; });
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var v = {
        nom: form.nom.value.trim(), email: form.email.value.trim(), commerce: form.commerce.value.trim(),
        service: form.service.options[form.service.selectedIndex].text, message: form.message.value.trim()
      };
      if (!v.nom || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) {
        erreur(t(X.champManquant));
        (v.nom ? form.email : form.nom).focus();
        return;
      }
      if (form._honey.value) return;
      var adresse = "https://formsubmit.co/ajax/" + String(C.formulaireCode || C.email).trim();
      var donnees = {
        _subject: (C.formulaireSujet || "Nouvelle demande") + " · " + v.nom + (v.commerce ? " (" + v.commerce + ")" : ""),
        _template: "table",
        _captcha: "false",
        _replyto: v.email,
        "Nom": v.nom,
        "E-mail": v.email,
        "Entreprise": v.commerce || "—",
        "Service": v.service,
        "Message": v.message || "—",
        "Langue": lang.toUpperCase()
      };
      bouton.disabled = true;
      bouton.textContent = t(X.envoiEnCours);
      fetch(adresse, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(donnees)
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && String(res.j.success) !== "false") {
            form.hidden = true;
            merci.hidden = false;
          } else {
            throw new Error(res.j && res.j.message);
          }
        })
        .catch(function (e) {
          var info = String((e && e.message) || "");
          if (window.console) console.warn("Formulaire :", info || e);
          bouton.disabled = false;
          bouton.innerHTML = esc(t(X.envoyer)) + ico("fleche");
          var corps = ["Nom : " + v.nom, "E-mail : " + v.email, "Entreprise : " + (v.commerce || "—"), "Service : " + v.service, "", v.message].join("\n");
          var secours = "mailto:" + C.email + "?subject=" + encodeURIComponent(donnees._subject) + "&body=" + encodeURIComponent(corps);
          erreur(remplir(/activ/i.test(info) ? X.activation : X.echec, { email: C.email }), secours);
        });
    });
  }

  afficher();
})();
