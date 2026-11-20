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
  function euros(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f") + "\u00a0€"; }
  function nombre(prix) {
    if (typeof prix === "number") return prix;
    var n = parseInt(String(t(prix)).replace(/[^\d]/g, ""), 10);
    return isNaN(n) ? Infinity : n;
  }
  function affPrix(prix) { return typeof prix === "number" ? euros(prix) : t(prix); }
  function lienWa(message) {
    return "https://wa.me/" + String(C.whatsapp || "").replace(/\D/g, "") + (message ? "?text=" + encodeURIComponent(message) : "");
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

  /* Titre décalé comme le logo : mot + barre / barre + mot */
  function decale(lignes, classe, balise) {
    balise = balise || "div";
    var texte = (lignes || []).map(t).join(" ");
    return "<" + balise + ' class="large decale ' + classe + '" aria-label="' + esc(texte) + '">' +
      (lignes || []).map(function (l, i) {
        var mot = '<span class="mot" aria-hidden="true">' + esc(t(l)) + "</span>";
        var barre = '<span class="barre" aria-hidden="true"></span>';
        return '<span class="ligne">' + (i % 2 ? barre + mot : mot + barre) + "</span>";
      }).join("") + "</" + balise + ">";
  }

  /* ---------- Sections ---------- */
  function entete() {
    var M = C.menu || {};
    var liens = ["services", "tarifs", "realisations", "studio", "contact"].map(function (k) {
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
      '<a class="logo" href="#top"><img class="logo-lettres" src="images/logo-hego-lettres-blanc.svg" alt="' + esc(C.marque) + '" width="92" height="31"></a>' +
      '<nav class="nav" id="nav">' + liens + "</nav>" +
      '<div class="entete-actions">' + choix +
      '<a class="btn btn--plein btn--petit"' + ext(lienWa(t(X.messageGeneral))) + ">" + esc(t(C.accueil.boutonSecondaire)) + "</a>" +
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
      '<section class="hero" id="top"><div class="wrap">' +
      '<div class="hero-haut"><span>' + esc(C.marque) + " — " + esc(t(C.activite)) + "</span><span>" + esc(C.pays) + "</span></div>" +
      decale(A.lignes, "hero-titre", "h1") +
      '<div class="hero-bas"><div>' +
        '<p class="these">' + riche(A.phrase) + "</p>" +
        '<p class="hero-texte">' + riche(A.texte) + "</p>" +
        '<div class="hero-boutons">' +
          '<a class="btn btn--plein" href="#tarifs">' + esc(t(A.boutonPrincipal)) + ico("fleche") + "</a>" +
          '<a class="btn btn--ligne"' + ext(lienWa(t(X.messageGeneral))) + ">" + ico("message") + esc(t(A.boutonSecondaire)) + "</a>" +
        "</div></div>" +
        '<div class="chiffres">' + chiffres.map(function (c) {
          return '<a class="chiffre" href="#tarifs" data-onglet="' + c.onglet + '"><small>' + esc(t(X.desde)) + "</small>" +
            "<strong>" + esc(c.prix) + (c.unite ? "<sup>" + esc(c.unite) + "</sup>" : "") + "</strong>" +
            "<span>" + esc(t(c.legende)) + "</span></a>";
        }).join("") + "</div>" +
      "</div></div></section>"
    );
  }

  function defilement() {
    var mots = (C.defilement || []).map(function (m) { return "<span>" + esc(t(m)) + "</span>"; }).join("");
    if (!mots) return "";
    return '<div class="defile" aria-hidden="true"><div class="defile-piste">' + mots + mots + mots + mots + "</div></div>";
  }

  function services() {
    var S = C.services;
    var prixMin = {
      web: moinsCher(T.web && T.web.formules),
      social: moinsCher(T.social && T.social.formules),
      video: moinsCher(T.video && T.video.liste)
    };
    return (
      '<section class="bande" id="services"><div class="wrap">' +
      '<div class="tete"><p class="surtitre">' + esc(t(S.surtitre)) + "</p><h2>" + riche(S.titre) + "</h2></div>" +
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

  function carte(f, unite) {
    var nom = t(f.nom);
    return (
      '<article class="carte' + (f.populaire ? " carte--populaire" : "") + '">' +
      '<div class="carte-tete"><h3 class="carte-nom">' + esc(nom) + "</h3>" + (f.populaire ? '<span class="badge">' + esc(t(X.populaire)) + "</span>" : "") + "</div>" +
      '<div class="prix">' + (t(f.prefixe) ? "<small>" + esc(t(f.prefixe)) + "</small>" : "") + "<strong>" + esc(affPrix(f.prix)) + "</strong>" + (unite ? "<small>" + esc(unite) + "</small>" : "") + "</div>" +
      "<p>" + riche(f.description) + "</p>" +
      '<ul class="inclus">' + (f.inclus || []).map(function (i) { return "<li>" + riche(i) + "</li>"; }).join("") + "</ul>" +
      '<a class="btn btn--ligne"' + ext(lienWa(remplir(X.messageFormule, { formule: nom }))) + ">" + esc(t(X.choisir)) + ico("fleche") + "</a>" +
      "</article>"
    );
  }

  function curseur(id, label, reglage) {
    return (
      '<div class="curseur"><div class="curseur-tete"><label for="' + id + '">' + esc(t(label)) + '</label><output id="' + id + '-val" for="' + id + '">' + reglage.depart + "</output></div>" +
      '<input type="range" id="' + id + '" min="' + reglage.min + '" max="' + reglage.max + '" step="1" value="' + reglage.depart + '"></div>'
    );
  }

  function tarifs() {
    var O = T.onglets || {};
    var W = T.web || {}, S = T.social || {}, V = T.video || {}, P = T.pack;
    var K = S.calculateur;

    var panWeb = '<div class="cartes">' + (W.formules || []).map(function (f) { return carte(f, ""); }).join("") + "</div>" +
      (W.mensualite && W.mensualite.afficher
        ? '<div class="ligne-info"><div><h3>' + riche(W.mensualite.titre) + '</h3><p class="doux">' + riche(W.mensualite.texte) + "</p></div>" +
          '<div class="prix"><strong>' + esc(t(W.mensualite.prix)) + "</strong><small>" + esc(t(W.mensualite.unite)) + "</small></div></div>"
        : "");

    var calc = K && K.afficher
      ? '<div class="calc"><div><h3>' + esc(t(X.calcTitre)) + '</h3><p class="doux">' + esc(t(X.calcTexte)) + "</p>" +
          '<div class="calc-champs">' + curseur("c-photos", X.calcPhotos, K.photos) + curseur("c-reels", X.calcReels, K.reels) + curseur("c-reseaux", X.calcReseaux, K.reseaux) + "</div></div>" +
        '<div class="calc-resultat"><div><p class="surtitre">' + esc(t(X.calcTotal)) + '</p><div class="prix" style="margin-top:18px"><strong id="c-total">—</strong><small>' + esc(t(S.unite)) + "</small></div></div>" +
          '<p class="calc-conseil" id="c-conseil" aria-live="polite"></p>' +
          '<a class="btn btn--plein" id="c-bouton" href="#" target="_blank" rel="noopener">' + esc(t(X.calcBouton)) + ico("fleche") + "</a></div></div>"
      : "";
    var panSocial = '<div class="cartes">' + (S.formules || []).map(function (f) { return carte(f, t(S.unite)); }).join("") + "</div>" +
      (t(S.note) ? '<p class="note">' + riche(S.note) + "</p>" : "") + calc;

    var panVideo = '<div class="liste-prix">' + (V.liste || []).map(function (v) {
      return "<div><h3>" + esc(t(v.nom)) + "</h3><p>" + riche(v.detail) + '</p><div class="prix">' +
        (t(v.prefixe) ? "<small>" + esc(t(v.prefixe)) + "</small>" : "") + "<strong>" + esc(affPrix(v.prix)) + "</strong></div></div>";
    }).join("") + "</div>" +
      '<div class="panneau-action"><a class="btn btn--plein"' + ext(lienWa(t(X.messageGeneral))) + ">" + esc(t(C.accueil.boutonSecondaire)) + ico("fleche") + "</a></div>";

    var pack = P && P.afficher
      ? '<div class="pack"><div><p class="surtitre">' + esc(t(P.etiquette)) + "</p><h3>" + riche(P.titre) + '</h3><p class="pack-texte">' + riche(P.texte) + "</p></div>" +
        '<div class="pack-prix"><div class="prix"><strong>' + esc(t(P.prix)) + "</strong>" + (P.ancienPrix ? "<del>" + esc(t(P.ancienPrix)) + "</del>" : "") + "</div>" +
        (P.ancienPrix ? '<span class="pack-economie">' + esc(t(X.economie)) + " " + euros(nombre(P.ancienPrix) - nombre(P.prix)) + "</span>" : "") +
        '<a class="btn btn--plein"' + ext(lienWa(remplir(X.messageFormule, { formule: t(P.etiquette) }))) + ">" + esc(t(X.choisir)) + ico("fleche") + "</a></div></div>"
      : "";

    var panneaux = [["web", panWeb], ["social", panSocial], ["video", panVideo]];
    return (
      '<section class="bande clair" id="tarifs"><div class="wrap">' +
      '<div class="tete"><p class="surtitre">' + esc(t(T.surtitre)) + "</p><h2>" + riche(T.titre) + '</h2><p class="doux">' + riche(T.texte) + "</p></div>" +
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
      return (
        '<article class="projet"><div class="projet-tete"><h3 class="large projet-client">' + esc(t(p.client)) + "</h3>" +
        '<div class="projet-infos"><p>' + riche(p.titre) + '</p><p class="doux">' + riche(p.type) + "</p>" +
        (p.lien ? '<p><a class="exemple-lien"' + ext(p.lien) + ">Instagram" + ico("diagonale") + "</a></p>" : "") + "</div></div>" +
        '<div class="galerie">' + (p.images || []).map(function (src) {
          return '<figure><img src="' + esc(src) + '" alt="' + esc(t(p.client)) + '" loading="lazy"></figure>';
        }).join("") + "</div></article>"
      );
    }).join("");
    var exemples = (R.exemples || []).length
      ? '<div class="exemples-tete"><h3>' + riche(R.exemplesTitre) + '</h3><p class="doux">' + riche(R.exemplesTexte) + "</p></div>" +
        '<div class="exemples-grille">' + R.exemples.map(function (x) {
          var vrai = String(x.lien || "").indexOf("http") === 0;
          return '<a class="exemple" href="' + esc(x.lien) + '"' + (vrai ? ' target="_blank" rel="noopener"' : "") + ">" +
            '<div class="exemple-image">' + (x.image ? '<img src="' + esc(x.image) + '" alt="" loading="lazy">' : "") + "</div>" +
            '<div class="exemple-infos"><h4>' + esc(t(x.nom)) + "</h4><span>" + esc(t(x.type)) + (vrai ? "" : " · " + esc(t(X.fictif))) + "</span></div>" +
            '<span class="exemple-lien">' + esc(t(X.voirSite)) + ico("fleche") + "</span></a>";
        }).join("") + "</div>"
      : "";
    return (
      '<section class="bande" id="realisations"><div class="wrap">' +
      '<div class="tete"><p class="surtitre">' + esc(t(R.surtitre)) + "</p><h2>" + riche(R.titre) + "</h2></div>" +
      projets + exemples + "</div></section>"
    );
  }

  function methode() {
    var M = C.processus;
    return (
      '<section class="bande methode" id="methode"><div class="wrap">' +
      '<div class="tete"><p class="surtitre">' + esc(t(M.surtitre)) + "</p></div>" +
      '<ol class="etapes">' + (M.etapes || []).map(function (e, i) {
        return '<li class="etape"><span class="etape-num">' + (i + 1) + ".</span><h3>" + riche(e.titre) + "</h3><p>" + riche(e.texte) + "</p></li>";
      }).join("") + "</ol></div></section>"
    );
  }

  function studio() {
    var S = C.studio;
    return (
      '<section class="bande clair studio" id="studio"><div class="wrap">' +
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
      '<div><p class="surtitre">' + esc(t(F.surtitre)) + "</p></div>" +
      '<div class="questions">' + (F.liste || []).map(function (q) {
        return "<details><summary>" + riche(q.question) + '<span class="plus" aria-hidden="true"></span></summary><p>' + riche(q.reponse) + "</p></details>";
      }).join("") + "</div></div></section>"
    );
  }

  function contact() {
    var K = C.contact;
    var O = T.onglets || {};
    var canaux =
      '<li><a' + ext(lienWa(t(X.messageGeneral))) + "><small>" + esc(t(X.whatsapp)) + "</small><strong>" + esc(C.telephone) + "</strong>" + ico("diagonale") + "</a></li>" +
      (C.instagram ? '<li><a' + ext(C.instagram) + "><small>Instagram</small><strong>" + esc(C.instagramPseudo || "Instagram") + "</strong>" + ico("diagonale") + "</a></li>" : "") +
      '<li><a href="mailto:' + esc(C.email) + '"><small>' + esc(t(X.email)) + "</small><strong>" + esc(C.email) + "</strong>" + ico("diagonale") + "</a></li>" +
      '<li><div class="canal"><small>' + esc(C.pays) + "</small><strong>" + esc(t(K.zone)) + "</strong></div></li>";
    var options = [t(O.web), t(O.social), t(O.video), T.pack && T.pack.afficher ? t(T.pack.etiquette) : ""].filter(Boolean)
      .map(function (o) { return "<option>" + esc(o) + "</option>"; }).join("");
    return (
      '<section class="bande contact" id="contact"><div class="wrap">' +
      decale(K.lignes, "contact-titre", "h2") +
      '<div class="contact-grille"><div><p class="contact-intro">' + riche(K.texte) + '</p><ul class="canaux">' + canaux + "</ul></div>" +
      '<form class="formulaire" id="formulaire" novalidate>' +
        '<div class="champ"><label for="f-nom">' + esc(t(X.champNom)) + '</label><input id="f-nom" name="nom" autocomplete="name"></div>' +
        '<div class="champ"><label for="f-commerce">' + esc(t(X.champCommerce)) + '</label><input id="f-commerce" name="commerce" autocomplete="organization"></div>' +
        '<div class="champ"><label for="f-service">' + esc(t(X.champService)) + '</label><select id="f-service" name="service">' + options + "</select></div>" +
        '<div class="champ"><label for="f-message">' + esc(t(X.champMessage)) + '</label><textarea id="f-message" name="message"></textarea></div>' +
        '<p class="erreur" id="f-erreur" role="alert" hidden>' + esc(t(X.champManquant)) + "</p>" +
        '<button class="btn btn--plein" type="submit">' + ico("message") + esc(t(X.envoyer)) + "</button>" +
        '<a class="lien-email" id="f-email" href="mailto:' + esc(C.email) + '">' + esc(t(X.ouEmail)) + "</a>" +
      "</form></div></div></section>"
    );
  }

  function pied() {
    return (
      '<footer class="pied"><div class="wrap">' +
      '<div class="pied-marque"><img src="images/logo-hego-rond-blanc.svg" alt=""><div><strong>' + esc(C.marque) + "</strong>" + esc(t(C.activite)) + "</div></div>" +
      '<div class="pied-liens">' +
      (C.instagram ? "<a" + ext(C.instagram) + ">Instagram</a>" : "") +
      (C.livroReclamacoes ? "<a" + ext("https://www.livroreclamacoes.pt") + ">" + esc(t(X.livro)) + "</a>" : "") +
      "<span>" + esc(t(C.pied.cookies)) + "</span></div>" +
      "<span>© " + new Date().getFullYear() + " " + esc(C.marque) + "</span>" +
      "</div></footer>" +
      '<a class="wa-flottant"' + ext(lienWa(t(X.messageGeneral))) + ' aria-label="WhatsApp">' + ico("message") + "</a>"
    );
  }

  /* ---------- Assemblage ---------- */
  function afficher() {
    document.documentElement.lang = lang;
    document.title = C.marque + " · " + t(C.activite) + " · " + C.pays;
    racine.innerHTML = entete() + "<main>" + accueil() + defilement() + services() + tarifs() + realisations() + methode() + studio() + faq() + contact() + "</main>" + pied();
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
        var y = window.scrollY;
        afficher();
        window.scrollTo(0, y);
      });
    });

    // Menu mobile
    var ent = document.getElementById("entete");
    var btn = document.getElementById("menuBtn");
    function fermer() { ent.classList.remove("ouvert"); btn.setAttribute("aria-expanded", "false"); }
    btn.addEventListener("click", function () {
      var ouvert = ent.classList.toggle("ouvert");
      btn.setAttribute("aria-expanded", String(ouvert));
    });
    Array.prototype.forEach.call(document.querySelectorAll("#nav a"), function (a) { a.addEventListener("click", fermer); });

    // Onglets des tarifs (+ liens qui ouvrent le bon onglet)
    Array.prototype.forEach.call(document.querySelectorAll("[data-onglet]"), function (el) {
      el.addEventListener("click", function (ev) {
        var id = el.getAttribute("data-onglet");
        if (el.getAttribute("role") === "tab") { choisirOnglet(id, false); return; }
        ev.preventDefault();
        choisirOnglet(id, true);
      });
    });

    // Calculateur
    var K = T.social && T.social.calculateur;
    if (K && K.afficher && document.getElementById("c-photos")) {
      var champs = { photos: "c-photos", reels: "c-reels", reseaux: "c-reseaux" };
      var calculer = function () {
        var v = {};
        Object.keys(champs).forEach(function (k) {
          var el = document.getElementById(champs[k]);
          v[k] = parseInt(el.value, 10);
          document.getElementById(champs[k] + "-val").textContent = v[k];
          el.style.setProperty("--rempli", ((el.value - el.min) / (el.max - el.min) * 100) + "%");
        });
        var total = K.base + v.photos * K.prixPhoto + v.reels * K.prixReel + Math.max(0, v.reseaux - 1) * K.prixReseau;
        document.getElementById("c-total").textContent = euros(total);
        var meilleur = null;
        (T.social.formules || []).forEach(function (f) {
          if (f.photos >= v.photos && f.reels >= v.reels && f.reseaux >= v.reseaux && f.prix < total) {
            if (!meilleur || f.prix < meilleur.prix) meilleur = f;
          }
        });
        var conseil = document.getElementById("c-conseil");
        conseil.innerHTML = meilleur
          ? esc(remplir(X.calcConseil, { formule: "§", prix: euros(meilleur.prix), economie: euros(total - meilleur.prix) })).replace("§", "<em>" + esc(t(meilleur.nom)) + "</em>")
          : "";
        var detail = v.photos + " " + t(X.calcPhotos).toLowerCase() + ", " + v.reels + " reels, " + v.reseaux + " " + t(X.calcReseaux).toLowerCase() + " (" + euros(total) + t(T.social.unite) + ")";
        document.getElementById("c-bouton").href = lienWa(remplir(X.messageCalcul, { detail: detail }));
      };
      Object.keys(champs).forEach(function (k) { document.getElementById(champs[k]).addEventListener("input", calculer); });
      calculer();
    }

    // Formulaire → WhatsApp (ou e-mail)
    var form = document.getElementById("formulaire");
    var err = document.getElementById("f-erreur");
    var lienMail = document.getElementById("f-email");
    function valeurs() {
      return { nom: form.nom.value.trim(), commerce: form.commerce.value.trim(), service: form.service.value, message: form.message.value.trim() };
    }
    function texte() { return remplir(X.messageFormulaire, valeurs()); }
    function majMail() {
      lienMail.href = "mailto:" + C.email + "?subject=" + encodeURIComponent(C.marque + " · " + (valeurs().commerce || valeurs().service)) + "&body=" + encodeURIComponent(texte());
    }
    form.addEventListener("input", function () { err.hidden = true; majMail(); });
    form.addEventListener("change", majMail);
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var v = valeurs();
      if (!v.nom || !v.commerce) { err.hidden = false; (v.nom ? form.commerce : form.nom).focus(); return; }
      var url = lienWa(texte());
      var w = window.open(url, "_blank");
      if (w) { try { w.opener = null; } catch (e) {} } else { window.location.href = url; }
    });
  }

  afficher();
})();
