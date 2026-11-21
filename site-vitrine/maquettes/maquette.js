/* Moteur des maquettes prospects (HEGO STUDIO).
   Chaque maquette = un dossier maquettes/<nom>/ avec un index.html qui contient
   sa configuration (window.MAQUETTE) et ses photos. Ce fichier n'a pas à être modifié. */
(function () {
  "use strict";
  var M = window.MAQUETTE || {};
  var TEXTES = {
    pt: { apropos: "Sobre nós", galerie: "Galeria", infos: "Horário e contactos", horaires: "Horário", adresse: "Morada", contact: "Contactos",
          carte: "Ver no mapa", voirHoraires: "Ver horário", bandeau: "Maquete de site para {nom}, proposta pela HEGO STUDIO", cta: "Quero este site",
          propose: "Site proposto pela HEGO STUDIO", instagram: "Seguir no Instagram", ferme: "Encerrado", avis: "O que dizem os clientes", marcacoes: "Marcações" },
    fr: { apropos: "À propos", galerie: "Galerie", infos: "Horaires et contact", horaires: "Horaires", adresse: "Adresse", contact: "Contact",
          carte: "Voir sur la carte", voirHoraires: "Voir les horaires", bandeau: "Maquette de site pour {nom}, proposée par HEGO STUDIO", cta: "Je veux ce site",
          propose: "Site proposé par HEGO STUDIO", instagram: "Suivre sur Instagram", ferme: "Fermé", avis: "Ce que disent les clients", marcacoes: "Rendez-vous" },
    en: { apropos: "About", galerie: "Gallery", infos: "Hours and contact", horaires: "Opening hours", adresse: "Address", contact: "Contact",
          carte: "View on the map", voirHoraires: "Opening hours", bandeau: "Website mockup for {nom}, made by HEGO STUDIO", cta: "I want this website",
          propose: "Website by HEGO STUDIO", instagram: "Follow on Instagram", ferme: "Closed", avis: "What clients say", marcacoes: "Bookings" }
  };
  var L = TEXTES[M.langue] || TEXTES.pt;
  var POLICES = {
    serif:     { titre: '"Young Serif", Georgia, serif' },
    elegante:  { titre: '"Bodoni Moda", Didot, "Times New Roman", serif', style: "italic" },
    condensee: { titre: '"Oswald", Impact, "Arial Narrow", sans-serif', poids: "600", casse: "uppercase" },
    classique: { titre: '"Alegreya", Georgia, serif', poids: "700" },
    moderne:   { titre: '"Archivo", Arial, sans-serif', poids: "800", casse: "uppercase", etirement: "125%" }
  };

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ext(href) { return ' href="' + esc(href) + '" target="_blank" rel="noopener"'; }

  // Thème
  var r = document.documentElement.style, c = M.couleurs || {}, p = POLICES[M.police] || POLICES.serif;
  [["--fond", c.fond], ["--fond-2", c.fond2], ["--texte", c.texte], ["--doux", c.doux], ["--accent", c.accent], ["--sur-accent", c.surAccent]]
    .forEach(function (v) { if (v[1]) r.setProperty(v[0], v[1]); });
  r.setProperty("--f-titre", p.titre);
  if (p.style) r.setProperty("--style-titre", p.style);
  if (p.poids) r.setProperty("--poids-titre", p.poids);
  if (p.casse) r.setProperty("--casse-titre", p.casse);
  if (p.etirement) r.setProperty("--etirement", p.etirement);
  document.documentElement.lang = M.langue || "pt";
  document.title = (M.nom || "") + (M.type ? " · " + M.type : "");

  var ph = M.photos || {};
  var insta = M.instagram ? "https://www.instagram.com/" + String(M.instagram).replace(/^@/, "") + "/" : "";
  var bouton = M.bouton || {};
  var dm = M.instagram ? "https://ig.me/m/" + String(M.instagram).replace(/^@/, "") : "";
  var lienBouton = bouton.lien || dm || insta || "#infos";
  var carte = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent((M.nom || "") + " " + (M.adresse || M.ville || ""));
  var hego = "../../index.html?maquette=" + encodeURIComponent(M.nom || "") + "#contact";

  var nav = [];
  if (M.apropos) nav.push('<a href="#apropos">' + esc(L.apropos) + "</a>");
  if (M.services) nav.push('<a href="#services">' + esc(M.services.titre) + "</a>");
  if ((ph.galerie || []).length) nav.push('<a href="#galerie">' + esc(L.galerie) + "</a>");
  if ((M.avis || []).length) nav.push('<a href="#avis">' + esc(M.avisTitre || L.avis) + "</a>");
  nav.push('<a href="#infos">' + esc(L.infos) + "</a>");

  var html = "";
  html += '<div class="hego"><div class="wrap"><span>' + esc(L.bandeau.replace("{nom}", M.nom || "")) + '</span><a href="' + esc(hego) + '">' + esc(L.cta) + " →</a></div></div>";
  html += '<header class="entete"><div class="wrap"><a class="marque" href="#">' + (ph.logo ? '<img src="' + esc(ph.logo) + '" alt="">' : "") + esc(M.nom) + "</a>" +
    "<nav>" + nav.join("") + "</nav>" +
    (bouton.texte ? '<a class="btn btn--accent"' + ext(lienBouton) + ">" + esc(bouton.texte) + "</a>" : "") + "</div></header>";

  html += '<main><section class="hero' + (ph.hero ? "" : " sans-photo") + (M.heroStyle === "portrait" ? " hero--portrait" : "") + '"><div class="wrap"><div class="hero-boite">' +
    (ph.hero ? '<img src="' + esc(ph.hero) + '" alt="">' : "") +
    '<div class="hero-texte"><small>' + esc([M.type, M.ville || M.sousTitre].filter(Boolean).join(" · ")) + "</small><h1>" + esc(M.nom) + "</h1>" +
    (M.slogan ? "<p>" + esc(M.slogan) + "</p>" : "") +
    '<div class="actions">' + (bouton.texte ? '<a class="btn btn--accent"' + ext(lienBouton) + ">" + esc(bouton.texte) + "</a>" : "") +
    '<a class="btn" href="#infos">' + esc(L.voirHoraires) + "</a></div></div></div></div></section>";

  if (M.apropos) {
    html += '<section class="bloc apropos" id="apropos"><div class="wrap">' +
      (ph.apropos ? '<img src="' + esc(ph.apropos) + '" alt="" loading="lazy">' : "") +
      '<div><h2 class="titre-section">' + esc(M.apropos.titre || L.apropos) + "</h2>" +
      (M.apropos.textes || []).map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("") + "</div></div></section>";
  }
  if (M.services) {
    html += '<section class="bloc" id="services"><div class="wrap"><h2 class="titre-section">' + esc(M.services.titre) + '</h2><ul class="liste">' +
      (M.services.liste || []).map(function (s) {
        return "<li" + (s.prix ? "" : ' class="sans-prix"') + "><span>" + esc(s.nom) + (s.detail ? "<small>" + esc(s.detail) + "</small>" : "") + "</span>" + (s.prix ? "<b>" + esc(s.prix) + "</b>" : "") + "</li>";
      }).join("") + "</ul></div></section>";
  }
  if ((ph.galerie || []).length) {
    html += '<section class="bloc" id="galerie"><div class="wrap"><h2 class="titre-section">' + esc(L.galerie) + '</h2><div class="galerie">' +
      ph.galerie.map(function (src) { return '<img src="' + esc(src) + '" alt="" loading="lazy">'; }).join("") + "</div></div></section>";
  }
  if ((M.avis || []).length) {
    html += '<section class="bloc avis" id="avis"><div class="wrap"><h2 class="titre-section">' + esc(M.avisTitre || L.avis) + '</h2><div class="avis-grille">' +
      M.avis.map(function (a) { return "<figure><blockquote>“" + esc(a.texte) + "”</blockquote><figcaption>" + esc(a.auteur || "") + "</figcaption></figure>"; }).join("") +
      "</div></div></section>";
  }
  html += '<section class="bloc infos" id="infos"><div class="wrap">' +
    "<div><h3>" + esc(L.horaires) + "</h3><table>" + (M.horaires || []).map(function (h) {
      return "<tr><td>" + esc(h[0]) + "</td><td>" + esc(h[1] || L.ferme) + "</td></tr>";
    }).join("") + "</table></div>" +
    (M.adresse
      ? "<div><h3>" + esc(L.adresse) + "</h3><p>" + esc(M.adresse) + '</p><a class="btn"' + ext(carte) + ">" + esc(L.carte) + "</a></div>"
      : "<div><h3>" + esc(L.marcacoes) + "</h3><p>" + esc(M.marcacoes || "") + "</p>" + (bouton.texte ? '<a class="btn"' + ext(lienBouton) + ">" + esc(bouton.texte) + "</a>" : "") + "</div>") +
    "<div><h3>" + esc(L.contact) + "</h3>" + (M.telephone ? "<p>" + esc(M.telephone) + "</p>" : "") +
    (insta ? "<p>@" + esc(String(M.instagram).replace(/^@/, "")) + '</p><a class="btn btn--accent"' + ext(insta) + ">" + esc(L.instagram) + "</a>" : "") +
    "</div></div></section></main>";

  html += '<footer><div class="wrap"><span>© ' + new Date().getFullYear() + " " + esc(M.nom) + '</span><a href="../../index.html">' + esc(L.propose) + "</a></div></footer>";
  document.getElementById("maquette").innerHTML = html;
})();
