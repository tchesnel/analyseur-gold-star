/* Bandeau "site de démonstration" commun aux exemples.
   Il reprend ton nom de marque et ton WhatsApp depuis ../contenu.js. */
(function () {
  "use strict";
  var C = window.CONTENU || {};
  var lang = "pt";
  try { lang = localStorage.getItem("langue") || "pt"; } catch (e) {}
  var TEXTES = {
    pt: { retour: "Voltar", texte: "Site de demonstração criado por", fictif: "negócio fictício", cta: "Quero um site assim",
          toast: "Num site real, este botão leva o cliente diretamente até si (WhatsApp, chamada ou mapa).", fermer: "Fechar" },
    fr: { retour: "Retour", texte: "Site de démonstration créé par", fictif: "commerce fictif", cta: "Je veux un site comme ça",
          toast: "Sur un vrai site, ce bouton envoie le client directement vers vous (WhatsApp, appel ou carte).", fermer: "Fermer" },
    en: { retour: "Back", texte: "Demo website made by", fictif: "made-up business", cta: "I want a site like this",
          toast: "On a real website, this button takes the customer straight to you (WhatsApp, call or map).", fermer: "Close" }
  };
  if (!TEXTES[lang]) lang = "pt";
  var L = TEXTES[lang];

  var nomDemo = document.body.getAttribute("data-demo") || document.title;
  var wa = "../index.html?demo=" + encodeURIComponent(nomDemo) + "#contact";
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var style = document.createElement("style");
  style.textContent =
    ".demo-bandeau{position:relative;z-index:50;display:flex;align-items:center;gap:10px 18px;flex-wrap:wrap;justify-content:space-between;" +
    "padding:10px max(16px,env(safe-area-inset-right,0px)) 10px max(16px,env(safe-area-inset-left,0px));background:#0b0b0c;color:#e9eef8;" +
    "font:600 12px/1.35 Figtree,system-ui,sans-serif;letter-spacing:.04em}" +
    ".demo-bandeau a{color:#fff;text-decoration:none;font-weight:700;white-space:nowrap}" +
    ".demo-bandeau a:hover{text-decoration:underline}" +
    ".demo-bandeau span{flex:1 1 220px}" +
    ".demo-bandeau .demo-cta{background:#f4f4f2;color:#0b0b0c;padding:7px 12px;border-radius:0}" +
    ".demo-toast{position:fixed;z-index:60;left:50%;bottom:calc(20px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);" +
    "width:min(440px,calc(100% - 32px));background:#0b0b0c;color:#fff;border-radius:0;padding:16px 18px;" +
    "box-shadow:0 20px 40px -12px rgba(0,0,0,.5);font:500 15px/1.45 Figtree,system-ui,sans-serif;display:grid;gap:12px}" +
    ".demo-toast div{display:flex;gap:10px;flex-wrap:wrap}" +
    ".demo-toast a,.demo-toast button{font:700 14px/1 Figtree,system-ui,sans-serif;border-radius:0;padding:10px 14px;cursor:pointer;text-decoration:none}" +
    ".demo-toast a{background:#f4f4f2;color:#0b0b0c}" +
    ".demo-toast button{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.4)}";
  document.head.appendChild(style);

  var b = document.createElement("div");
  b.className = "demo-bandeau";
  b.innerHTML =
    '<a href="../index.html">← ' + esc(L.retour) + "</a>" +
    "<span>" + esc(L.texte) + " <b>" + esc(C.marque || "") + "</b> · " + esc(L.fictif) + "</span>" +
    '<a class="demo-cta" href="' + wa + '">' + esc(L.cta) + "</a>";
  document.body.insertBefore(b, document.body.firstChild);

  var toast = null;
  function montrer() {
    if (toast) toast.remove();
    toast = document.createElement("div");
    toast.className = "demo-toast";
    toast.setAttribute("role", "status");
    toast.innerHTML = "<p style=\"margin:0\">" + esc(L.toast) + "</p><div>" +
      '<a href="' + wa + '">' + esc(L.cta) + "</a>" +
      '<button type="button">' + esc(L.fermer) + "</button></div>";
    toast.querySelector("button").addEventListener("click", function () { toast.remove(); toast = null; });
    document.body.appendChild(toast);
  }
  Array.prototype.forEach.call(document.querySelectorAll("[data-demo]:not(body)"), function (el) {
    el.addEventListener("click", function (ev) { ev.preventDefault(); montrer(); });
  });
})();
