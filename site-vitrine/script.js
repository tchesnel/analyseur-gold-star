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
      "Annule-la (historique GitHub) ou vérifie la ligne modifiée, puis enregistre à nouveau.</p></div>";
    return;
  }

  var langues = (C.langues && C.langues.length) ? C.langues : ["pt"];
  var lang = choisirLangue();

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
  function riche(v) { return esc(t(v)).replace(/\*(.+?)\*/g, "<mark>$1</mark>"); }
  function remplir(modele, valeurs) {
    return t(modele).replace(/\{(\w+)\}/g, function (_, k) { return valeurs[k] != null ? valeurs[k] : ""; }).trim();
  }
  function lienWa(message) {
    var num = String(C.whatsapp || "").replace(/\D/g, "");
    return "https://wa.me/" + num + (message ? "?text=" + encodeURIComponent(message) : "");
  }
  function lienTel() { return "tel:" + String(C.telephone || "").replace(/[^\d+]/g, ""); }
  function initiales(nom) {
    return String(nom || "").trim().split(/\s+/).slice(0, 2).map(function (m) { return m.charAt(0); }).join("").toUpperCase();
  }
  function choisirLangue() {
    var demandee = null;
    try { demandee = new URLSearchParams(location.search).get("lang"); } catch (e) {}
    if (demandee && langues.indexOf(demandee) > -1) return demandee;
    try {
      var memo = localStorage.getItem("langue");
      if (memo && langues.indexOf(memo) > -1) return memo;
    } catch (e) {}
    var nav = (navigator.language || "").slice(0, 2).toLowerCase();
    if (langues.indexOf(nav) > -1) return nav;
    return langues[0];
  }

  /* ---------- Icônes ---------- */
  var traces = {
    carte: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    horloge: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    message: '<path d="M20.5 11.6a8.4 8.4 0 0 1-12.3 7.4L3.5 20.5l1.5-4.6a8.4 8.4 0 1 1 15.5-4.3z"/><path d="M9 10.5h6M9 13.5h4"/>',
    etoile: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    telephone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    panier: '<path d="M4 6h16l-1.5 9h-13z"/><circle cx="9" cy="19" r="1.3"/><circle cx="16" cy="19" r="1.3"/><path d="M8 6l1-3h6l1 3"/>',
    coche: '<path d="M4.5 12.5l4.5 4.5L19.5 6.5"/>',
    fleche: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    loupe: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/>',
    email: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>',
    lieu: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    appel: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.2 6.8h.01"/>'
  };
  function ico(nom) {
    return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (traces[nom] || traces.etoile) + "</svg>";
  }
  var logoSvg =
    '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" fill="var(--principale)"/>' +
    '<g fill="none" stroke="#fff" stroke-width="2.4"><path d="M0 9a9 9 0 0 0 9-9M23 0a9 9 0 0 0 9 9M32 23a9 9 0 0 0-9 9M9 32a9 9 0 0 0-9-9"/>' +
    '<circle cx="16" cy="16" r="5"/></g><circle cx="16" cy="16" r="1.8" fill="var(--accent)"/></svg>';

  /* ---------- Sections ---------- */
  function logo() {
    var m = esc(C.marque || "");
    return '<a class="logo" href="#top">' + logoSvg + "<span>" + m + "<b>.</b></span></a>";
  }

  function entete() {
    var M = C.menu || {};
    var liens = ["pourquoi", "tarifs", "exemples", "etapes", "contact"].map(function (k) {
      return M[k] ? '<a href="#' + k + '">' + esc(t(M[k])) + "</a>" : "";
    }).join("");
    var choix = langues.length > 1
      ? '<div class="langues" role="group" aria-label="Idioma / Langue / Language">' +
        langues.map(function (l) {
          return '<button type="button" data-lang="' + l + '" aria-pressed="' + (l === lang) + '">' + l + "</button>";
        }).join("") + "</div>"
      : "";
    return (
      (C.offre && C.offre.afficher ? '<div class="offre"><div class="wrap"><span>' + esc(t(C.offre.texte)) + "</span></div></div>" : "") +
      '<header class="entete" id="entete"><div class="wrap">' + logo() +
      '<nav class="nav" id="nav">' + liens + "</nav>" +
      '<div class="entete-actions">' + choix +
      '<a class="btn btn--wa btn--petit" href="' + lienWa(t(C.textes.messageGeneral)) + '" target="_blank" rel="noopener">' + ico("message") + esc(t(C.textes.whatsapp)) + "</a>" +
      '<button class="menu-btn" type="button" id="menuBtn" aria-expanded="false" aria-controls="nav" aria-label="' + esc(t(C.textes.menuOuvrir)) + '">' + ico("menu") + "</button>" +
      "</div></div></header>"
    );
  }

  function scene() {
    return (
      '<div class="scene" aria-hidden="true">' +
      '<div class="scene-fond"></div>' +
      '<div class="google"><span class="etiquette">1 · Google</span>' +
        '<div class="google-recherche">' + ico("loupe") + "padaria perto de mim</div>" +
        '<div class="google-carte"></div>' +
        '<div class="google-nom">Padaria do Bairro</div>' +
        '<div class="google-meta">Padaria · Rua do Exemplo, 12</div>' +
        '<div class="google-meta"><b>Aberto</b> · Fecha às 19:30</div>' +
        '<div class="google-actions"><span>Site</span><span>Direções</span><span>Ligar</span></div>' +
      "</div>" +
      '<div class="telephone"><span class="etiquette">2 · Site</span><div class="ecran">' +
        '<div class="ecran-barre"><span>9:41</span><span>●●●</span></div>' +
        '<div class="ecran-nav"><b>Padaria do Bairro</b><i></i></div>' +
        '<div class="ecran-hero"><small>Aberto agora</small><strong>Pão quente desde as 7h</strong></div>' +
        '<div class="ecran-liste">' +
          "<div><span>Pastel de nata</span><span>1,20 €</span></div>" +
          "<div><span>Broa de milho</span><span>2,50 €</span></div>" +
          "<div><span>Pão alentejano</span><span>3,20 €</span></div>" +
          "<div><span>Bolo de arroz</span><span>1,10 €</span></div>" +
        "</div>" +
        '<p class="ecran-horaire">Seg a Sáb 7h–19h30 · Dom 7h–13h</p>' +
        '<div class="ecran-bouton">Encomendar por WhatsApp</div>' +
      "</div></div>" +
      '<div class="wa"><div class="wa-tete"><i></i>Padaria do Bairro</div><span class="etiquette">3 · WhatsApp</span>' +
        '<div class="wa-bulle">Bom dia! Pode guardar-me 2 broas para as 9h?<small>08:12 ✓✓</small></div>' +
      "</div>" +
      "</div>"
    );
  }

  function accueil() {
    var A = C.accueil;
    return (
      '<section class="hero" id="top"><div class="wrap">' +
      '<div class="hero-texte">' +
        '<p class="surtitre">' + esc(t(A.surtitre)) + "</p>" +
        "<h1>" + riche(A.titre) + "</h1>" +
        '<p class="intro">' + riche(A.texte) + "</p>" +
        '<div class="hero-boutons">' +
          '<a class="btn btn--wa" href="' + lienWa(t(C.textes.messageGeneral)) + '" target="_blank" rel="noopener">' + ico("message") + esc(t(A.boutonPrincipal)) + "</a>" +
          '<a class="btn btn--contour" href="#exemples">' + esc(t(A.boutonSecondaire)) + "</a>" +
        "</div>" +
        '<ul class="points">' + (A.points || []).map(function (p) { return "<li>" + ico("coche") + esc(t(p)) + "</li>"; }).join("") + "</ul>" +
      "</div>" +
      scene() +
      "</div></section>" +
      '<div class="calcada" role="presentation"></div>'
    );
  }

  function pourquoi() {
    var P = C.pourquoi;
    return (
      '<section class="bande pourquoi" id="pourquoi"><div class="wrap">' +
      '<div class="tete-section"><h2>' + riche(P.titre) + '</h2><p class="intro">' + riche(P.texte) + "</p></div>" +
      '<div class="raisons">' +
      (P.elements || []).map(function (e) {
        return '<div class="raison"><span class="raison-ico">' + ico(e.icone) + "</span><h3>" + riche(e.titre) + "</h3><p>" + riche(e.texte) + "</p></div>";
      }).join("") +
      "</div></div></section>"
    );
  }

  function tarifs() {
    var T = C.tarifs;
    var cartes = (T.formules || []).map(function (f) {
      var nom = t(f.nom);
      return (
        '<article class="formule' + (f.populaire ? " formule--populaire" : "") + '">' +
        (f.populaire ? '<span class="formule-badge">' + esc(t(C.textes.populaire)) + "</span>" : "") +
        '<h3 class="formule-nom">' + esc(nom) + "</h3>" +
        '<div class="prix">' + (t(f.prefixe) ? "<small>" + esc(t(f.prefixe)) + "</small>" : "") + "<strong>" + esc(t(f.prix)) + "</strong></div>" +
        "<p>" + riche(f.description) + "</p>" +
        '<ul class="inclus">' + (f.inclus || []).map(function (i) { return "<li>" + ico("coche") + "<span>" + riche(i) + "</span></li>"; }).join("") + "</ul>" +
        '<a class="btn ' + (f.populaire ? "btn--plein" : "btn--contour") + '" href="' + lienWa(remplir(C.textes.messageFormule, { formule: nom })) + '" target="_blank" rel="noopener">' + esc(t(C.textes.choisir)) + "</a>" +
        "</article>"
      );
    }).join("");
    var M = T.mensualite;
    var mens = M && M.afficher
      ? '<div class="mensualite"><div><h3>' + riche(M.titre) + "</h3><p>" + riche(M.texte) + "</p></div>" +
        '<div class="prix"><strong>' + esc(t(M.prix)) + "</strong><small>" + esc(t(M.unite)) + "</small></div></div>"
      : "";
    return (
      '<section class="bande bande--azul tarifs" id="tarifs"><div class="wrap">' +
      '<div class="tete-section"><h2>' + riche(T.titre) + '</h2><p class="intro">' + riche(T.texte) + "</p></div>" +
      '<div class="formules">' + cartes + "</div>" + mens +
      (t(T.note) ? '<p class="note">' + ico("info") + "<span>" + riche(T.note) + "</span></p>" : "") +
      "</div></section>"
    );
  }

  function exemples() {
    var E = C.exemples;
    return (
      '<section class="bande exemples" id="exemples"><div class="wrap">' +
      '<div class="tete-section"><h2>' + riche(E.titre) + '</h2><p class="intro">' + riche(E.texte) + "</p></div>" +
      '<div class="exemples-grille">' +
      (E.liste || []).map(function (x) {
        var adresse = String(x.lien || "").indexOf("http") === 0
          ? x.lien.replace(/^https?:\/\//, "").replace(/\/$/, "")
          : String(x.nom || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-") + ".pt";
        var fictif = String(x.lien || "").indexOf("http") !== 0;
        return (
          '<a class="exemple" href="' + esc(x.lien) + '">' +
          '<div class="navigateur"><div class="navigateur-barre"><i></i><i></i><i></i><span>' + esc(adresse) + "</span></div>" +
          (x.image ? '<img src="' + esc(x.image) + '" alt="" loading="lazy" width="800" height="600">' : "") + "</div>" +
          '<div class="exemple-infos"><div><h3>' + esc(t(x.nom)) + "</h3><p>" + esc(t(x.type)) + "</p></div>" +
          (fictif ? '<span class="puce">' + esc(t(C.textes.exempleFictif)) + "</span>" : "") + "</div>" +
          '<span class="exemple-lien">' + esc(t(C.textes.voirDemo)) + ico("fleche") + "</span>" +
          "</a>"
        );
      }).join("") +
      "</div></div></section>"
    );
  }

  function etapes() {
    var E = C.etapes;
    return (
      '<section class="bande bande--azul" id="etapes"><div class="wrap">' +
      '<div class="tete-section"><h2>' + riche(E.titre) + "</h2></div>" +
      '<ol class="etapes-liste">' +
      (E.liste || []).map(function (e, i) {
        return '<li class="etape"><span class="etape-num" aria-label="' + esc(t(C.textes.etape)) + " " + (i + 1) + '">' + (i + 1) + "</span><h3>" + riche(e.titre) + "</h3><p>" + riche(e.texte) + "</p></li>";
      }).join("") +
      "</ol></div></section>"
    );
  }

  function apropos() {
    var A = C.apropos;
    var portrait = C.photo
      ? '<img src="' + esc(C.photo) + '" alt="' + esc(C.nom) + '">'
      : "<span>" + esc(initiales(C.nom)) + "</span>";
    return (
      '<section class="bande apropos" id="apropos"><div class="wrap">' +
      '<div class="portrait">' + portrait + "</div>" +
      '<div class="apropos-texte"><h2>' + riche(A.titre) + "</h2>" +
      (A.paragraphes || []).map(function (p) { return "<p>" + riche(p) + "</p>"; }).join("") +
      (t(A.langues) ? '<p class="apropos-langues">' + ico("globe") + esc(t(A.langues)) + "</p>" : "") +
      '<p class="signature">' + esc(C.nom) + " · " + esc(C.marque) + "</p>" +
      "</div></div></section>"
    );
  }

  function faq() {
    var F = C.faq;
    return (
      '<section class="bande bande--azul faq" id="faq"><div class="wrap">' +
      '<div class="tete-section"><h2>' + riche(F.titre) + "</h2></div>" +
      '<div class="questions">' +
      (F.liste || []).map(function (q) {
        return "<details><summary>" + riche(q.question) + "</summary><p>" + riche(q.reponse) + "</p></details>";
      }).join("") +
      "</div></div></section>"
    );
  }

  function contact() {
    var K = C.contact, X = C.textes;
    var lignes =
      '<li><span>' + ico("message") + '</span><span><small>WhatsApp</small><a href="' + lienWa(t(X.messageGeneral)) + '" target="_blank" rel="noopener">' + esc(C.telephone) + "</a></span></li>" +
      '<li><span>' + ico("appel") + '</span><span><small>' + esc(t(X.telephone)) + '</small><a href="' + lienTel() + '">' + esc(C.telephone) + "</a></span></li>" +
      '<li><span>' + ico("email") + '</span><span><small>' + esc(t(X.email)) + '</small><a href="mailto:' + esc(C.email) + '">' + esc(C.email) + "</a></span></li>" +
      (C.instagram ? '<li><span>' + ico("instagram") + '</span><span><small>Instagram</small><a href="' + esc(C.instagram) + '" target="_blank" rel="noopener">' + esc(C.instagram.replace(/^https?:\/\/(www\.)?/, "")) + "</a></span></li>" : "") +
      '<li><span>' + ico("lieu") + '</span><span><small>' + esc(t(X.zone)) + "</small><strong>" + esc(t(K.zone)) + "</strong></span></li>";
    return (
      '<section class="bande contact" id="contact"><div class="wrap">' +
      '<div class="contact-texte"><p class="surtitre">' + esc(C.marque) + "</p><h2>" + riche(K.titre) + '</h2><p class="intro">' + riche(K.texte) + "</p>" +
      '<ul class="coordonnees">' + lignes + "</ul></div>" +
      '<form class="formulaire" id="formulaire" novalidate>' +
        '<div class="champ"><label for="f-nom">' + esc(t(X.champNom)) + '</label><input id="f-nom" name="nom" autocomplete="name" required></div>' +
        '<div class="champ"><label for="f-commerce">' + esc(t(X.champCommerce)) + '</label><input id="f-commerce" name="commerce" placeholder="' + esc(t(X.exempleCommerce)) + '" required></div>' +
        '<div class="champ"><label for="f-message">' + esc(t(X.champMessage)) + '</label><textarea id="f-message" name="message" placeholder="' + esc(t(X.exempleMessage)) + '"></textarea></div>' +
        '<p class="erreur" id="f-erreur" role="alert" hidden>' + esc(t(X.champManquant)) + "</p>" +
        '<button class="btn btn--wa" type="submit">' + ico("message") + esc(t(X.envoyer)) + "</button>" +
        '<a class="lien-email" id="f-email" href="mailto:' + esc(C.email) + '">' + esc(t(X.ouEmail)) + "</a>" +
      "</form>" +
      "</div></section>"
    );
  }

  function pied() {
    var P = C.pied;
    var annee = new Date().getFullYear();
    return (
      '<footer class="pied"><div class="wrap">' +
      "<div>" + logo() + '<p style="margin-top:10px">' + esc(t(P.slogan)) + "</p></div>" +
      '<div class="pied-liens">' +
      (C.livroReclamacoes ? '<a href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener">' + esc(t(C.textes.livro)) + "</a>" : "") +
      "<span>" + esc(t(P.cookies)) + "</span>" +
      "<span>© " + annee + " " + esc(C.nom) + "</span>" +
      "</div></div></footer>" +
      '<a class="wa-flottant" href="' + lienWa(t(C.textes.messageGeneral)) + '" target="_blank" rel="noopener" aria-label="' + esc(t(C.textes.whatsapp)) + '">' + ico("message") + "</a>"
    );
  }

  /* ---------- Assemblage ---------- */
  function afficher() {
    var html = document.documentElement;
    html.lang = lang;
    if (C.couleurs) {
      if (C.couleurs.principale) html.style.setProperty("--principale", C.couleurs.principale);
      if (C.couleurs.accent) html.style.setProperty("--accent", C.couleurs.accent);
    }
    document.title = C.marque + " · " + t(C.pied.slogan).replace(/\.$/, "");
    racine.innerHTML = entete() + "<main>" + accueil() + pourquoi() + tarifs() + exemples() + etapes() + apropos() + faq() + contact() + "</main>" + pied();
    brancher();
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
    btn.addEventListener("click", function () {
      var ouvert = ent.classList.toggle("ouvert");
      btn.setAttribute("aria-expanded", String(ouvert));
    });
    Array.prototype.forEach.call(document.querySelectorAll("#nav a"), function (a) {
      a.addEventListener("click", function () { ent.classList.remove("ouvert"); btn.setAttribute("aria-expanded", "false"); });
    });

    // Formulaire → WhatsApp (ou e-mail)
    var form = document.getElementById("formulaire");
    var err = document.getElementById("f-erreur");
    var lienMail = document.getElementById("f-email");
    function valeurs() {
      return {
        nom: form.nom.value.trim(),
        commerce: form.commerce.value.trim(),
        message: form.message.value.trim()
      };
    }
    function texte() { return remplir(C.textes.messageFormulaire, valeurs()); }
    function majMail() {
      lienMail.href = "mailto:" + C.email + "?subject=" + encodeURIComponent(C.marque + " · " + (valeurs().commerce || "Site")) + "&body=" + encodeURIComponent(texte());
    }
    form.addEventListener("input", function () { err.hidden = true; majMail(); });
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
