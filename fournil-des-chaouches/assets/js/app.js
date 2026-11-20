/* =====================================================================
   LE FOURNIL DES CHAOUCHES — Application
   Panier, Click & Collect, horaires en direct, animations.
   ===================================================================== */
(function () {
  "use strict";

  var CFG = window.FOURNIL_CONFIG;
  var PRODUCTS = window.FOURNIL_PRODUITS.filter(function (p) { return p.dispo !== false; });
  var CATS = window.FOURNIL_CATEGORIES;
  var ART = window.FournilArt;
  var BY_ID = {};
  PRODUCTS.forEach(function (p) { BY_ID[p.id] = p; });

  var DEMO = /[?&]demo\b/.test(location.search) || CFG.commande.mode === "demo";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ */
  /* Utilitaires                                                         */
  /* ------------------------------------------------------------------ */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var EUR = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
  function price(n) { return EUR.format(n); }
  function icon(id) { return '<svg aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } }
  };

  function toast(msg, ic) {
    var z = $("#toast-zone"), t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = icon(ic || "i-check") + "<span>" + esc(msg) + "</span>";
    z.appendChild(t);
    setTimeout(function () { t.classList.add("out"); setTimeout(function () { t.remove(); }, 400); }, 2600);
  }

  /* ------------------------------------------------------------------ */
  /* Coordonnées depuis la configuration                                 */
  /* ------------------------------------------------------------------ */
  function bindContact() {
    $$("[data-phone]").forEach(function (el) { el.textContent = CFG.telephone; });
    $$("[data-tel]").forEach(function (el) { el.setAttribute("href", "tel:" + CFG.telephoneLien); });
    $$("[data-email]").forEach(function (el) { el.textContent = CFG.email; });
    $$("[data-mail]").forEach(function (el) {
      if (!CFG.email) { var li = el.closest("li"); (li || el).style.display = "none"; return; }
      el.setAttribute("href", "mailto:" + CFG.email);
    });
    $$("[data-fb]").forEach(function (el) { if (CFG.facebook) el.setAttribute("href", CFG.facebook); else (el.closest("li") || el).style.display = "none"; });
    $$("[data-google]").forEach(function (el) { el.setAttribute("href", CFG.googleAvis.lien); });
    var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------ */
  /* Heure de Paris & horaires                                           */
  /* ------------------------------------------------------------------ */
  var DAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  var DAYS_SHORT = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
  var MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  var MONTHS_SHORT = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

  function parisNow() {
    var parts = {};
    try {
      new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })
        .formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    } catch (e) {
      var d = new Date(); parts = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), hour: d.getHours(), minute: d.getMinutes() };
    }
    var y = +parts.year, mo = +parts.month, da = +parts.day, h = +parts.hour % 24, mi = +parts.minute;
    return { y: y, mo: mo, d: da, minutes: h * 60 + mi, dow: new Date(Date.UTC(y, mo - 1, da)).getUTCDay() };
  }
  function addDays(base, n) {
    var dt = new Date(Date.UTC(base.y, base.mo - 1, base.d + n));
    return { y: dt.getUTCFullYear(), mo: dt.getUTCMonth() + 1, d: dt.getUTCDate(), dow: dt.getUTCDay() };
  }
  function dayKey(x) { return x.y + "-" + pad(x.mo) + "-" + pad(x.d); }
  function toMin(hhmm) { var p = hhmm.split(":"); return +p[0] * 60 + +p[1]; }
  function fmtMin(m) { return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
  function fmtHour(hhmm) { var p = hhmm.split(":"); return +p[0] + "h" + p[1]; }
  function hoursFor(day) {
    if ((CFG.fermeturesExceptionnelles || []).indexOf(dayKey(day)) !== -1) return null;
    return CFG.horaires[day.dow] || null;
  }
  function longDate(day) { return DAYS[day.dow] + " " + day.d + " " + MONTHS[day.mo - 1] + " " + day.y; }

  function renderStatus() {
    var now = parisNow(), h = hoursFor(now), pill = $("#status-pill"), txt = $("#status-text");
    if (!pill) return;
    var open = h && now.minutes >= toMin(h[0]) && now.minutes < toMin(h[1]);
    pill.classList.toggle("open", !!open);
    pill.classList.toggle("closed", !open);
    if (open) {
      var left = toMin(h[1]) - now.minutes;
      txt.textContent = left <= 60 ? "Ouvert · ferme bientôt (" + fmtHour(h[1]) + ")" : "Ouvert maintenant · jusqu'à " + fmtHour(h[1]);
    } else if (h && now.minutes < toMin(h[0])) {
      txt.textContent = "Fermé · ouvre aujourd'hui à " + fmtHour(h[0]);
    } else {
      for (var i = 1; i <= 7; i++) {
        var d = addDays(now, i), hh = hoursFor(d);
        if (hh) { txt.textContent = "Fermé · ouvre " + (i === 1 ? "demain" : DAYS[d.dow]) + " à " + fmtHour(hh[0]); break; }
      }
    }
  }

  function renderHours() {
    var tb = $("#hours-table tbody"); if (!tb) return;
    var now = parisNow(), order = [1, 2, 3, 4, 5, 6, 0], html = "";
    order.forEach(function (dow) {
      var h = CFG.horaires[dow];
      html += '<tr class="' + (dow === now.dow ? "today" : "") + '"><th scope="row">' + DAYS[dow].charAt(0).toUpperCase() + DAYS[dow].slice(1) + "</th><td>" +
        (h ? fmtHour(h[0]) + " – " + fmtHour(h[1]) : "Fermé") + "</td></tr>";
    });
    tb.innerHTML = html;
  }

  /* ------------------------------------------------------------------ */
  /* Catalogue                                                           */
  /* ------------------------------------------------------------------ */
  var currentCat = "all";

  function badgeHtml(b) {
    var cls = /bio/i.test(b) ? "bio" : /meilleure|prim/i.test(b) ? "gold" : /cœur|coeur/i.test(b) ? "love" : "";
    var ic = cls === "gold" ? icon("i-trophy") : cls === "bio" ? icon("i-leaf") : cls === "love" ? icon("i-heart") : "";
    return '<span class="badge ' + cls + '">' + ic + esc(b) + "</span>";
  }
  function mediaHtml(p) {
    if (p.photo) return '<img src="' + esc(p.photo) + '" alt="' + esc(p.nom) + '" loading="lazy">';
    return ART.svg(p.art, p.nom);
  }
  function hasOptions(p) { return (p.options && p.options.length) || (p.parfums && p.parfums.length); }
  function fromPrice(p) {
    if (p.options && p.options.length) return Math.min.apply(null, p.options.map(function (o) { return o.prix; }));
    return p.prix;
  }

  function productCard(p) {
    var opts = hasOptions(p);
    var priceLabel = (p.options && p.options.length > 1 ? "<small>à partir de</small>" : "") + "<b>" + price(fromPrice(p)) + "</b>" + (p.unite && !(p.options && p.options.length > 1) ? "<small>" + esc(p.unite) + "</small>" : "");
    return '<article class="product reveal' + (p.vedette ? " featured" : "") + '" data-id="' + p.id + '">' +
      '<div class="product-media">' + (p.badges ? '<div class="badges">' + p.badges.map(badgeHtml).join("") + "</div>" : "") + mediaHtml(p) + "</div>" +
      '<div class="product-body"><h4 class="product-name">' + esc(p.nom) + '</h4><p class="product-desc">' + esc(p.description) + "</p>" +
      '<div class="product-foot"><div class="price">' + priceLabel + '</div><div class="product-cta" data-cta="' + p.id + '">' + ctaHtml(p, opts) + "</div></div></div></article>";
  }
  function ctaHtml(p, opts) {
    if (opts) {
      var n = qtyOfProduct(p.id);
      return '<button class="add-btn" type="button" data-choose="' + p.id + '">' + icon("i-plus") + (n ? "Ajouter (" + n + ")" : "Choisir") + "</button>";
    }
    var q = qtyOfKey(lineKey(p.id));
    if (!q) return '<button class="add-btn" type="button" data-add="' + p.id + '" aria-label="Ajouter ' + esc(p.nom) + ' au panier">' + icon("i-plus") + "Ajouter</button>";
    return '<div class="stepper" role="group" aria-label="Quantité ' + esc(p.nom) + '"><button type="button" data-dec="' + p.id + '" aria-label="Retirer un">' + icon("i-minus") + "</button><output>" + q + '</output><button type="button" data-inc="' + p.id + '" aria-label="Ajouter un">' + icon("i-plus") + "</button></div>";
  }
  function refreshCtas() {
    $$("[data-cta]").forEach(function (el) { var p = BY_ID[el.getAttribute("data-cta")]; el.innerHTML = ctaHtml(p, hasOptions(p)); });
  }

  function renderTabs() {
    var tabs = $("#tabs");
    var html = '<button class="tab" role="tab" aria-selected="true" data-cat="all">Tout <span class="tab-n">' + PRODUCTS.length + "</span></button>";
    CATS.forEach(function (c) {
      var n = PRODUCTS.filter(function (p) { return p.categorie === c.id; }).length;
      if (n) html += '<button class="tab" role="tab" aria-selected="false" data-cat="' + c.id + '">' + esc(c.nom) + ' <span class="tab-n">' + n + "</span></button>";
    });
    tabs.innerHTML = html;
    tabs.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cat]"); if (!b) return;
      currentCat = b.getAttribute("data-cat");
      $$(".tab", tabs).forEach(function (t) { t.setAttribute("aria-selected", t === b ? "true" : "false"); });
      renderCatalog();
      var top = $("#tabs").getBoundingClientRect().top + window.scrollY - 90;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: REDUCED ? "auto" : "smooth" });
    });
  }

  function renderCatalog() {
    var html = "";
    CATS.forEach(function (c) {
      if (currentCat !== "all" && currentCat !== c.id) return;
      var items = PRODUCTS.filter(function (p) { return p.categorie === c.id; });
      if (!items.length) return;
      html += '<div class="cat-block" id="cat-' + c.id + '"><div class="cat-head"><h3>' + esc(c.nom) + "</h3><p>" + esc(c.accroche) + '</p></div><div class="products">' + items.map(productCard).join("") + "</div></div>";
    });
    $("#catalog").innerHTML = html;
    observeReveals($$("#catalog .reveal"));
  }

  /* ------------------------------------------------------------------ */
  /* Panier                                                              */
  /* ------------------------------------------------------------------ */
  var cart = store.get("fc_cart_v1", []).filter(function (l) { return BY_ID[l.id] && l.qty > 0; });

  function lineKey(id, opt, parfum) { return [id, opt || "", parfum || ""].join("|"); }
  function lineUnit(l) {
    var p = BY_ID[l.id];
    if (l.opt && p.options) { var o = p.options.filter(function (x) { return x.id === l.opt; })[0]; if (o) return o.prix; }
    return p.prix;
  }
  function lineLabel(l) {
    var p = BY_ID[l.id], bits = [];
    if (l.opt && p.options) { var o = p.options.filter(function (x) { return x.id === l.opt; })[0]; if (o) bits.push(o.nom); }
    if (l.parfum) bits.push(l.parfum);
    return bits.join(" · ");
  }
  function qtyOfKey(key) { var l = cart.filter(function (x) { return x.key === key; })[0]; return l ? l.qty : 0; }
  function qtyOfProduct(id) { return cart.filter(function (x) { return x.id === id; }).reduce(function (s, x) { return s + x.qty; }, 0); }
  function cartCount() { return cart.reduce(function (s, l) { return s + l.qty; }, 0); }
  function cartTotal() { return cart.reduce(function (s, l) { return s + l.qty * lineUnit(l); }, 0); }
  function saveCart() { store.set("fc_cart_v1", cart); updateCartUI(); }

  function addToCart(id, opt, parfum, qty, fromEl) {
    var key = lineKey(id, opt, parfum), l = cart.filter(function (x) { return x.key === key; })[0];
    if (l) l.qty += qty || 1; else cart.push({ key: key, id: id, opt: opt || "", parfum: parfum || "", qty: qty || 1 });
    saveCart();
    if (fromEl) fly(fromEl);
    var b = $("#cart-open"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
  }
  function changeQty(key, delta) {
    var l = cart.filter(function (x) { return x.key === key; })[0]; if (!l) return;
    l.qty += delta;
    if (l.qty <= 0) cart = cart.filter(function (x) { return x !== l; });
    saveCart();
  }

  function fly(fromEl) {
    if (REDUCED || !fromEl.getBoundingClientRect) return;
    var a = fromEl.getBoundingClientRect(), target = $("#cart-open").getBoundingClientRect();
    if (getComputedStyle($("#mobile-bar")).display !== "none" && $("#mobile-bar").classList.contains("show")) target = $("#mb-order").getBoundingClientRect();
    var dot = document.createElement("div"); dot.className = "fly-dot"; document.body.appendChild(dot);
    var sx = a.left + a.width / 2 - 9, sy = a.top + a.height / 2 - 9, ex = target.left + target.width / 2 - 9, ey = target.top + target.height / 2 - 9;
    if (!dot.animate) { dot.remove(); return; }
    var anim = dot.animate([
      { transform: "translate(" + sx + "px," + sy + "px) scale(1)", opacity: 1 },
      { transform: "translate(" + (sx + (ex - sx) * 0.5) + "px," + (Math.min(sy, ey) - 120) + "px) scale(1.3)", opacity: 1, offset: 0.5 },
      { transform: "translate(" + ex + "px," + ey + "px) scale(.4)", opacity: 0.2 }
    ], { duration: 750, easing: "cubic-bezier(.5,0,.5,1)" });
    dot.style.left = "0"; dot.style.top = "0";
    anim.onfinish = function () { dot.remove(); };
  }

  function thumb(p) { return '<div class="cart-thumb">' + (p.photo ? '<img src="' + esc(p.photo) + '" alt="">' : ART.svg(p.art, "")) + "</div>"; }

  function updateCartUI() {
    var n = cartCount(), total = cartTotal();
    $("#cart-count").textContent = n;
    $("#cart-total").textContent = price(total);
    $("#mb-order-label").textContent = n ? "Panier (" + n + ") · " + price(total) : "Commander";
    refreshCtas();
    renderCart();
  }

  function renderCart() {
    var body = $("#cart-body"), foot = $("#cart-foot");
    if (!cart.length) {
      body.innerHTML = '<div class="cart-empty">' + ART.svg("baguette", "") + '<p><b style="color:var(--navy-900);font-size:18px">Votre panier est vide</b><br>La baguette primée vous attend…</p><button class="btn btn-navy btn-sm" type="button" data-goto-shop>Voir la boutique</button></div>' + historyHtml();
      foot.style.display = "none";
      return;
    }
    foot.style.display = "";
    body.innerHTML = cart.map(function (l) {
      var p = BY_ID[l.id], sub = lineLabel(l);
      return '<div class="cart-line">' + thumb(p) + '<div class="cart-info"><b>' + esc(p.nom) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") +
        '<span class="line-price">' + price(l.qty * lineUnit(l)) + '</span></div><div class="stepper"><button type="button" data-line-dec="' + esc(l.key) + '" aria-label="Retirer un">' + icon("i-minus") +
        "</button><output>" + l.qty + '</output><button type="button" data-line-inc="' + esc(l.key) + '" aria-label="Ajouter un">' + icon("i-plus") + "</button></div></div>";
    }).join("") + historyHtml();
  }

  function historyHtml() {
    var h = store.get("fc_orders_v1", []);
    if (!h.length) return "";
    return '<div class="history"><h3>Mes dernières commandes</h3>' + h.slice(0, 3).map(function (o) {
      return '<div class="history-item"><span><b>' + esc(o.numero) + "</b><br>" + esc(o.retraitTexte) + "</span><b>" + esc(o.totalTexte) + "</b></div>";
    }).join("") + "</div>";
  }

  /* ------------------------------------------------------------------ */
  /* Panneaux & modales                                                  */
  /* ------------------------------------------------------------------ */
  var lastFocus = null;
  function lockScroll(on) { document.body.classList.toggle("no-scroll", on); }

  function openCart() {
    lastFocus = document.activeElement;
    $("#cart-drawer").classList.add("open"); $("#cart-drawer").setAttribute("aria-hidden", "false");
    $("#overlay").classList.add("open"); lockScroll(true);
    setTimeout(function () { $("#cart-drawer").focus(); }, 50);
  }
  function closeCart() {
    $("#cart-drawer").classList.remove("open"); $("#cart-drawer").setAttribute("aria-hidden", "true");
    $("#overlay").classList.remove("open");
    if (!$(".modal.open")) lockScroll(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function openModal(id) {
    var m = $(id); if (!lastFocus || !$(".modal.open")) lastFocus = document.activeElement;
    m.classList.add("open"); m.setAttribute("aria-hidden", "false"); lockScroll(true);
    $("#overlay").classList.add("open");
    setTimeout(function () { var f = m.querySelector("button, [href], input, select, textarea"); if (f) f.focus(); }, 60);
  }
  function closeModal(m) {
    m = m || $(".modal.open"); if (!m) return;
    m.classList.remove("open"); m.setAttribute("aria-hidden", "true");
    if (!$(".modal.open") && !$("#cart-drawer").classList.contains("open")) { $("#overlay").classList.remove("open"); lockScroll(false); }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function trapFocus(e) {
    if (e.key !== "Tab") return;
    var root = $(".modal.open .modal-box") || ($("#cart-drawer").classList.contains("open") ? $("#cart-drawer") : null);
    if (!root) return;
    var f = $$('button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', root).filter(function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* Options d'un produit (taille, parfum) */
  function openOptions(id) {
    var p = BY_ID[id], sel = { opt: p.options ? p.options[Math.min(1, p.options.length - 1)].id : "", parfum: p.parfums ? p.parfums[0] : "", qty: 1 };
    if (p.options && p.options.length) sel.opt = p.options[0].id;
    $("#options-title").textContent = p.nom;
    function unit() { if (sel.opt) { var o = p.options.filter(function (x) { return x.id === sel.opt; })[0]; return o.prix; } return p.prix; }
    function draw() {
      var html = '<div class="opt-body"><div class="opt-hero">' + thumb(p) + '<p style="margin:0;color:var(--muted);font-size:14.5px">' + esc(p.description) +
        (p.delaiHeures ? '<br><b style="color:var(--navy-800)">À commander ' + p.delaiHeures + " h à l'avance.</b>" : "") + "</p></div>";
      if (p.options && p.options.length) {
        html += '<div class="opt-group"><h4>Format</h4><div class="opt-choices">' + p.options.map(function (o) {
          return '<button type="button" class="opt-choice" data-opt="' + o.id + '" aria-pressed="' + (sel.opt === o.id) + '">' + esc(o.nom) + "<small>" + price(o.prix) + "</small></button>";
        }).join("") + "</div></div>";
      }
      if (p.parfums && p.parfums.length) {
        html += '<div class="opt-group"><h4>' + (p.id === "gateau-basque" ? "Garniture" : "Parfum") + '</h4><div class="opt-choices">' + p.parfums.map(function (f) {
          return '<button type="button" class="opt-choice" data-parfum="' + esc(f) + '" aria-pressed="' + (sel.parfum === f) + '">' + esc(f) + "</button>";
        }).join("") + "</div></div>";
      }
      html += '<div class="opt-foot"><div class="stepper"><button type="button" data-oq="-1" aria-label="Moins">' + icon("i-minus") + "</button><output>" + sel.qty +
        '</output><button type="button" data-oq="1" aria-label="Plus">' + icon("i-plus") + '</button></div><button class="btn" type="button" data-opt-add>' + icon("i-bag") + "Ajouter · " + price(unit() * sel.qty) + "</button></div></div>";
      $("#options-content").innerHTML = html;
    }
    draw();
    $("#options-content").onclick = function (e) {
      var t = e.target.closest("button"); if (!t) return;
      if (t.hasAttribute("data-opt")) { sel.opt = t.getAttribute("data-opt"); draw(); }
      else if (t.hasAttribute("data-parfum")) { sel.parfum = t.getAttribute("data-parfum"); draw(); }
      else if (t.hasAttribute("data-oq")) { sel.qty = Math.max(1, sel.qty + +t.getAttribute("data-oq")); draw(); }
      else if (t.hasAttribute("data-opt-add")) {
        addToCart(p.id, sel.opt, sel.parfum, sel.qty, t);
        closeModal($("#options-modal"));
        toast(sel.qty + " × " + p.nom + " ajouté" + (sel.qty > 1 ? "s" : "") + " au panier", "i-bag");
      }
    };
    openModal("#options-modal");
  }

  /* ------------------------------------------------------------------ */
  /* Commande : créneaux de retrait                                      */
  /* ------------------------------------------------------------------ */
  var checkout = { step: 1, day: null, slot: null, customer: store.get("fc_customer_v1", { nom: "", tel: "", email: "" }), comment: "" };

  function leadMinutes() {
    var m = CFG.commande.delaiMinimumMinutes || 120;
    cart.forEach(function (l) { var p = BY_ID[l.id]; if (p.delaiHeures) m = Math.max(m, p.delaiHeures * 60); });
    return m;
  }
  function buildDays() {
    var now = parisNow(), earliest = now.minutes + leadMinutes(), step = CFG.commande.pasCreneauMinutes || 30, out = [];
    for (var i = 0; i < (CFG.commande.joursReservables || 14); i++) {
      var d = addDays(now, i), h = hoursFor(d), slots = [];
      if (h) {
        for (var m = toMin(h[0]); m <= toMin(h[1]) - step; m += step) {
          if (i * 1440 + m >= earliest) slots.push(m);
        }
      }
      d.slots = slots; d.closed = !h; d.offset = i;
      out.push(d);
    }
    return out;
  }
  function stepsHtml() {
    function st(n, label) { return '<span class="st ' + (checkout.step === n ? "on" : checkout.step > n ? "done" : "") + '"><i>' + (checkout.step > n ? "✓" : n) + "</i>" + label + "</span>"; }
    return '<div class="steps">' + st(1, "Retrait") + '<span class="sep"></span>' + st(2, "Coordonnées") + '<span class="sep"></span>' + st(3, "Confirmation") + "</div>";
  }
  function summaryHtml() {
    var html = '<h3 class="block-title" style="font-size:22px">' + icon("i-bag") + "Ma commande</h3>";
    html += cart.map(function (l) {
      var p = BY_ID[l.id], sub = lineLabel(l);
      return '<div class="sum-line"><span>' + l.qty + " × " + esc(p.nom) + (sub ? " <small>(" + esc(sub) + ")</small>" : "") + "</span><b>" + price(l.qty * lineUnit(l)) + "</b></div>";
    }).join("");
    html += '<div class="total-row" style="margin-top:6px"><span>Total</span><b>' + price(cartTotal()) + "</b></div>";
    if (checkout.day && checkout.slot != null) html += '<div class="pickup-box"><small>Retrait</small><b>' + esc(longDate(checkout.day)) + "</b><span>à " + fmtMin(checkout.slot).replace(":", "h") + " · " + esc(CFG.adresse.rue) + ", " + esc(CFG.adresse.ville) + "</span></div>";
    html += '<div class="pay-note">' + icon("i-check") + "<span>" + esc(CFG.commande.paiement) + "</span></div>";
    if (leadMinutes() >= 24 * 60) html += '<div class="pay-note">' + icon("i-info") + "<span>Votre panier contient un produit à commander " + Math.round(leadMinutes() / 60) + " h à l'avance : les premiers créneaux s'adaptent automatiquement.</span></div>";
    return html;
  }

  function renderCheckout() {
    var c = $("#checkout-content");
    if (checkout.step === 1) {
      var days = buildDays();
      if (!checkout.day || !days.some(function (d) { return dayKey(d) === dayKey(checkout.day) && d.slots.length; })) {
        checkout.day = days.filter(function (d) { return d.slots.length; })[0] || null; checkout.slot = null;
      }
      var cur = checkout.day ? days.filter(function (d) { return dayKey(d) === dayKey(checkout.day); })[0] : null;
      if (cur && checkout.slot != null && cur.slots.indexOf(checkout.slot) === -1) checkout.slot = null;
      var html = '<div class="checkout"><div class="checkout-main">' + stepsHtml() +
        '<div><h3 class="block-title">' + icon("i-cal") + 'Jour de retrait</h3><div class="days" role="group" aria-label="Jour de retrait">' +
        days.map(function (d) {
          var label = d.offset === 0 ? "Auj." : d.offset === 1 ? "Demain" : DAYS_SHORT[d.dow];
          return '<button type="button" class="day" data-day="' + dayKey(d) + '" aria-pressed="' + (cur && dayKey(cur) === dayKey(d)) + '"' + (d.slots.length ? "" : " disabled") +
            ' aria-label="' + esc(longDate(d)) + (d.closed ? " (fermé)" : d.slots.length ? "" : " (indisponible : délai de préparation)") + '"><small>' + label + "</small><b>" + d.d + "</b><span>" + MONTHS_SHORT[d.mo - 1] + "</span></button>";
        }).join("") + "</div></div>" +
        '<div><h3 class="block-title">' + icon("i-clock") + "Heure de retrait</h3>" +
        (cur ? '<div class="slots" role="group" aria-label="Heure de retrait">' + cur.slots.map(function (m) {
          return '<button type="button" class="slot" data-slot="' + m + '" aria-pressed="' + (checkout.slot === m) + '">' + fmtMin(m).replace(":", "h") + "</button>";
        }).join("") + "</div>" : '<div class="slots-empty">Aucun créneau disponible sur les prochains jours. Appelez-nous au ' + esc(CFG.telephone) + ".</div>") +
        "</div>" +
        '<div style="display:flex;justify-content:flex-end"><button class="btn btn-navy" type="button" id="to-step-2"' + (checkout.slot == null ? " disabled" : "") + ">Continuer " + icon("i-arrow") + "</button></div>" +
        '</div><aside class="checkout-aside">' + summaryHtml() + "</aside></div>";
      c.innerHTML = html;
    } else if (checkout.step === 2) {
      var cu = checkout.customer;
      c.innerHTML = '<div class="checkout"><div class="checkout-main">' + stepsHtml() +
        '<form id="checkout-form" novalidate><h3 class="block-title">' + icon("i-users") + 'Vos coordonnées</h3><div class="form-grid">' +
        '<div class="field full"><label for="co-nom">Prénom et nom <span class="req">*</span></label><input class="input" id="co-nom" name="nom" autocomplete="name" required value="' + esc(cu.nom) + '"><span class="field-error"></span></div>' +
        '<div class="field"><label for="co-tel">Téléphone <span class="req">*</span></label><input class="input" id="co-tel" name="tel" type="tel" inputmode="tel" autocomplete="tel" required value="' + esc(cu.tel) + '" placeholder="06 12 34 56 78"><span class="field-error"></span></div>' +
        '<div class="field"><label for="co-mail">E-mail <span class="req">*</span></label><input class="input" id="co-mail" name="email" type="email" autocomplete="email" required value="' + esc(cu.email) + '" placeholder="vous@exemple.fr"><span class="field-error"></span></div>' +
        '<div class="field full"><label for="co-com">Un mot pour la boulangerie ?</label><textarea class="textarea" id="co-com" name="commentaire" placeholder="Baguette bien cuite, message sur le gâteau, allergies…">' + esc(checkout.comment) + "</textarea></div>" +
        '<label class="check full"><input type="checkbox" name="rgpd" required> <span>J\'accepte que ces informations soient transmises à la boulangerie pour préparer ma commande. <span class="req">*</span></span></label>' +
        '<div class="full form-msg" id="checkout-msg" role="alert"></div>' +
        '<div class="full" style="display:flex;gap:10px;justify-content:space-between;flex-wrap:wrap"><button class="btn btn-outline" type="button" id="back-step-1">' + icon("i-back") + 'Retour</button><button class="btn" type="submit" id="submit-order">' + icon("i-check") + "Valider ma commande · " + price(cartTotal()) + "</button></div>" +
        "</div></form></div><aside class=\"checkout-aside\">" + summaryHtml() + "</aside></div>";
    }
  }

  function validateField(input) {
    var v = input.value.trim(), err = "";
    if (input.required && !v && input.type !== "checkbox") err = "Champ obligatoire.";
    else if (input.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) err = "Adresse e-mail invalide.";
    else if (input.type === "tel" && v && v.replace(/[^\d]/g, "").length < 10) err = "Numéro de téléphone incomplet.";
    input.classList.toggle("invalid", !!err);
    var e = input.parentNode.querySelector(".field-error"); if (e) e.textContent = err;
    return !err;
  }

  function orderNumber() {
    var n = parisNow();
    return "FC-" + String(n.y).slice(2) + pad(n.mo) + pad(n.d) + "-" + Math.floor(1000 + Math.random() * 9000);
  }

  function orderText(o) {
    var lines = cart.map(function (l) { var p = BY_ID[l.id], sub = lineLabel(l); return l.qty + " × " + p.nom + (sub ? " (" + sub + ")" : "") + " — " + price(l.qty * lineUnit(l)); });
    return "Commande " + o.numero + "\n" +
      "Retrait : " + o.retraitTexte + "\n" +
      "Client : " + o.client.nom + " — " + o.client.tel + " — " + o.client.email + "\n\n" +
      lines.join("\n") + "\n\n" +
      "Total : " + o.totalTexte + " (paiement en boutique)" +
      (o.commentaire ? "\nCommentaire : " + o.commentaire : "");
  }

  /* Envoi : FormSubmit, endpoint, mailto ou démo */
  function transmit(payload, subject, bodyText) {
    var mode = DEMO ? "demo" : CFG.commande.mode;
    if (mode === "demo") return new Promise(function (res) { setTimeout(function () { res({ ok: true, via: "demo" }); }, 900); });
    if (mode === "mailto") { openMailto(subject, bodyText); return Promise.resolve({ ok: true, via: "mailto" }); }
    var url = mode === "endpoint" ? CFG.commande.endpoint : "https://formsubmit.co/ajax/" + encodeURIComponent(CFG.email || "");
    if (!url || (mode !== "endpoint" && !CFG.email)) return Promise.resolve({ ok: false });
    var body = mode === "endpoint" ? payload : Object.assign({ _subject: subject, _template: "table", _captcha: "false" }, flatten(payload));
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
    return fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body), signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { r: r, d: d }; }); })
      .then(function (x) {
        clearTimeout(timer);
        var ok = x.r.ok && (mode === "endpoint" || x.d.success === true || x.d.success === "true");
        return { ok: ok, via: mode, message: x.d && x.d.message };
      })
      .catch(function () { clearTimeout(timer); return { ok: false }; });
  }
  function flatten(o) {
    var out = {};
    Object.keys(o).forEach(function (k) { var v = o[k]; out[k] = typeof v === "object" ? JSON.stringify(v) : v; });
    return out;
  }
  function mailtoHref(subject, body) { return "mailto:" + (CFG.email || "") + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body); }
  function openMailto(subject, body) { window.location.href = mailtoHref(subject, body); }

  function submitOrder(form) {
    var inputs = $$("input, textarea", form), ok = true;
    inputs.forEach(function (i) { if (i.type !== "checkbox" && !validateField(i)) ok = false; });
    var rg = form.querySelector('[name="rgpd"]'), msg = $("#checkout-msg");
    if (!ok || !rg.checked) {
      msg.className = "full form-msg show err";
      msg.textContent = !ok ? "Merci de compléter les champs indiqués." : "Merci de cocher la case de consentement.";
      var bad = form.querySelector(".invalid"); if (bad) bad.focus();
      return;
    }
    msg.className = "full form-msg";
    var cu = { nom: form.nom.value.trim(), tel: form.tel.value.trim(), email: form.email.value.trim() };
    checkout.customer = cu; checkout.comment = form.commentaire.value.trim();
    store.set("fc_customer_v1", cu);

    var o = {
      numero: orderNumber(),
      retraitTexte: longDate(checkout.day) + " à " + fmtMin(checkout.slot).replace(":", "h"),
      retraitISO: dayKey(checkout.day) + "T" + fmtMin(checkout.slot),
      client: cu,
      commentaire: checkout.comment,
      lignes: cart.map(function (l) { var p = BY_ID[l.id]; return { produit: p.nom, option: lineLabel(l), quantite: l.qty, prixUnitaire: lineUnit(l), total: +(l.qty * lineUnit(l)).toFixed(2) }; }),
      total: +cartTotal().toFixed(2),
      totalTexte: price(cartTotal())
    };
    var text = orderText(o);
    var subject = "🥖 Commande " + o.numero + " — retrait " + DAYS_SHORT[checkout.day.dow] + " " + checkout.day.d + "/" + pad(checkout.day.mo) + " à " + fmtMin(checkout.slot).replace(":", "h");
    var payload = {
      "Commande": o.numero,
      "Retrait": o.retraitTexte,
      "Nom": cu.nom,
      "Téléphone": cu.tel,
      "email": cu.email,
      "_replyto": cu.email,
      "Articles": o.lignes.map(function (l) { return l.quantite + " × " + l.produit + (l.option ? " (" + l.option + ")" : "") + " = " + price(l.total); }).join(" | "),
      "Total": o.totalTexte + " — paiement en boutique",
      "Commentaire": o.commentaire || "—"
    };
    if (CFG.commande.mode === "endpoint") payload = { type: "commande", commande: o, texte: text };

    var btn = $("#submit-order"); btn.disabled = true; btn.innerHTML = "Envoi en cours…";
    transmit(payload, subject, text).then(function (res) {
      if (res.ok && res.via !== "mailto") {
        var hist = store.get("fc_orders_v1", []);
        hist.unshift({ numero: o.numero, retraitTexte: o.retraitTexte, totalTexte: o.totalTexte, date: Date.now() });
        store.set("fc_orders_v1", hist.slice(0, 10));
      }
      showConfirmation(o, text, subject, res);
      if (res.ok) { cart = []; saveCart(); }
    });
  }

  function showConfirmation(o, text, subject, res) {
    checkout.step = 3;
    var lines = o.lignes.map(function (l) { return '<div class="sum-line"><span>' + l.quantite + " × " + esc(l.produit) + (l.option ? " <small>(" + esc(l.option) + ")</small>" : "") + "</span><b>" + price(l.total) + "</b></div>"; }).join("");
    var head, intro, extra = "";
    if (res.ok) {
      head = "Merci " + esc(o.client.nom.split(" ")[0]) + ", c'est noté !";
      intro = res.via === "mailto"
        ? "Votre messagerie s'est ouverte avec la commande pré-remplie : pensez à envoyer l'e-mail pour la transmettre à la boulangerie."
        : "Votre commande a bien été transmise à la boulangerie. Elle vous attendra au comptoir à l'heure choisie." + (res.via === "demo" ? " (mode démonstration : aucun e-mail réel n'a été envoyé)" : "");
    } else {
      head = "Presque fini…";
      intro = "Nous n'avons pas pu transmettre votre commande automatiquement. Envoyez-la en un clic par e-mail ou appelez-nous : elle sera prise en compte tout de suite.";
      extra = '<div class="warn-box"><b>Votre panier est conservé.</b><div class="confirm-actions" style="justify-content:flex-start"><a class="btn btn-sm" href="' + esc(mailtoHref(subject, text)) + '">' + icon("i-mail") + 'Envoyer par e-mail</a><a class="btn btn-sm btn-navy" href="tel:' + esc(CFG.telephoneLien) + '">' + icon("i-phone") + esc(CFG.telephone) + "</a></div></div>";
    }
    $("#checkout-content").innerHTML = '<div class="confirm">' +
      (res.ok ? '<div class="confirm-check"><svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" d="M4 12.5 9.5 18 20 6.5"/></svg></div>' : "") +
      "<h3>" + head + "</h3><p>" + intro + "</p>" + extra +
      '<div class="order-ticket"><div class="ticket-head"><div><small>N° de commande</small><b>' + esc(o.numero) + '</b></div><svg style="width:52px;height:52px"><use href="#seal"/></svg></div>' +
      lines + '<div class="total-row" style="margin-top:8px"><span>Total</span><b>' + esc(o.totalTexte) + '</b></div>' +
      '<div class="pickup-box" style="margin-top:12px"><small>Retrait</small><b>' + esc(o.retraitTexte) + "</b><span>" + esc(CFG.nom) + " · " + esc(CFG.adresse.rue) + ", " + esc(CFG.adresse.codePostal + " " + CFG.adresse.ville) + "</span></div>" +
      '<p style="margin:12px 0 0;font-size:13px;color:var(--muted)">' + esc(CFG.commande.paiement) + "</p></div>" +
      '<div class="confirm-actions">' +
      (res.ok ? '<button class="btn btn-navy btn-sm" type="button" id="ics-btn">' + icon("i-cal") + "Ajouter à mon agenda</button>" : "") +
      '<button class="btn btn-outline btn-sm" type="button" onclick="window.print()">' + icon("i-print") + "Imprimer</button>" +
      '<button class="btn btn-sm" type="button" data-close-modal>' + icon("i-check") + "Terminer</button>" +
      "</div></div>";
    if ($("#ics-btn")) $("#ics-btn").onclick = function () { downloadIcs(o); };
  }

  function downloadIcs(o) {
    var d = o.retraitISO.replace(/[-:]/g, ""), start = d.slice(0, 8) + "T" + d.slice(9, 13) + "00";
    var endMin = toMin(o.retraitISO.slice(11)) + 15, end = d.slice(0, 8) + "T" + pad(Math.floor(endMin / 60)) + pad(endMin % 60) + "00";
    var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Le Fournil des Chaouches//Click and Collect//FR", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      "UID:" + o.numero + "@fournil-des-chaouches", "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
      "DTSTART;TZID=Europe/Paris:" + start, "DTEND;TZID=Europe/Paris:" + end,
      "SUMMARY:Retrait commande " + o.numero + " — Fournil des Chaouches",
      "LOCATION:" + CFG.adresse.rue + "\\, " + CFG.adresse.codePostal + " " + CFG.adresse.ville,
      "DESCRIPTION:" + o.lignes.map(function (l) { return l.quantite + " x " + l.produit; }).join("\\n") + "\\nTotal : " + o.totalTexte + " (paiement en boutique)",
      "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    a.download = "retrait-" + o.numero + ".ics";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function openCheckout() {
    if (!cart.length) { toast("Votre panier est vide", "i-info"); return; }
    checkout.step = 1;
    renderCheckout();
    if ($("#cart-drawer").classList.contains("open")) { $("#cart-drawer").classList.remove("open"); $("#cart-drawer").setAttribute("aria-hidden", "true"); }
    openModal("#checkout-modal");
  }

  /* ------------------------------------------------------------------ */
  /* Demande de devis                                                    */
  /* ------------------------------------------------------------------ */
  function bindSpecialForm() {
    var f = $("#special-form"); if (!f) return;
    var now = parisNow(), min = addDays(now, 2);
    f.date.min = dayKey(min);
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      $$("[required]", f).forEach(function (i) {
        var good = i.type === "checkbox" ? i.checked : !!i.value.trim() && (i.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(i.value.trim()));
        if (i.type !== "checkbox") i.classList.toggle("invalid", !good);
        if (!good) ok = false;
      });
      var msg = $("#special-msg");
      if (!ok) { msg.className = "full form-msg show err"; msg.textContent = "Merci de compléter les champs obligatoires et de cocher la case de consentement."; return; }
      var data = { "Type": "Demande de devis / événement", "Nom": f.nom.value.trim(), "Téléphone": f.telephone.value.trim(), "email": f.email.value.trim(), "_replyto": f.email.value.trim(),
        "Événement": f.evenement.value, "Date souhaitée": f.date.value, "Personnes": f.personnes.value || "—", "Budget": f.budget.value || "—", "Message": f.message.value.trim() };
      var subject = "🎂 Demande de devis — " + f.evenement.value + " le " + f.date.value.split("-").reverse().join("/");
      var text = Object.keys(data).filter(function (k) { return k.charAt(0) !== "_"; }).map(function (k) { return k + " : " + data[k]; }).join("\n");
      if (CFG.commande.mode === "endpoint") data = { type: "devis", demande: data, texte: text };
      var btn = f.querySelector('[type="submit"]'); btn.disabled = true;
      transmit(data, subject, text).then(function (res) {
        btn.disabled = false;
        if (res.ok) {
          msg.className = "full form-msg show ok";
          msg.textContent = res.via === "mailto" ? "Votre messagerie s'est ouverte : envoyez l'e-mail pour transmettre la demande." : "Merci ! Votre demande est partie. La boulangerie vous recontacte très vite." + (res.via === "demo" ? " (démo)" : "");
          if (res.via !== "mailto") f.reset();
        } else {
          msg.className = "full form-msg show err";
          msg.innerHTML = "L'envoi automatique n'a pas abouti. <a href=\"" + esc(mailtoHref(subject, text)) + "\" style=\"text-decoration:underline\">Envoyez-la par e-mail</a> ou appelez le <a href=\"tel:" + esc(CFG.telephoneLien) + "\" style=\"text-decoration:underline\">" + esc(CFG.telephone) + "</a>.";
        }
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Animations & navigation                                             */
  /* ------------------------------------------------------------------ */
  var revealObserver = null;
  function observeReveals(els) {
    if (!("IntersectionObserver" in window) || REDUCED) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); revealObserver.unobserve(en.target); } });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    }
    els.forEach(function (e) { revealObserver.observe(e); });
  }

  function counters() {
    var els = $$("[data-count]");
    if (!("IntersectionObserver" in window) || REDUCED) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, to = parseFloat(el.getAttribute("data-count")), dec = +(el.getAttribute("data-decimals") || 0), t0 = null;
        function tick(t) {
          if (!t0) t0 = t;
          var k = Math.min(1, (t - t0) / 1400), v = to * (1 - Math.pow(1 - k, 3));
          el.textContent = v.toFixed(dec).replace(".", ",");
          if (k < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    els.forEach(function (e) { e.textContent = "0"; io.observe(e); });
  }

  function headerAndNav() {
    var header = $(".site-header"), bar = $("#mobile-bar"), hero = $(".hero");
    function onScroll() {
      var y = window.scrollY;
      header.classList.toggle("scrolled", y > 30);
      bar.classList.toggle("show", y > hero.offsetHeight * 0.6);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if ("IntersectionObserver" in window) {
      var links = $$(".main-nav a"), map = {};
      links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && map[en.target.id]) { links.forEach(function (a) { a.classList.remove("active"); }); map[en.target.id].classList.add("active"); }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
    }

    // Défilement doux vers les ancres (compatible <base>)
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]'); if (!a) return;
      var id = a.getAttribute("href").slice(1), t = id ? document.getElementById(id) : null;
      if (!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - (id === "accueil" ? 0 : 60);
      window.scrollTo({ top: y, behavior: REDUCED ? "auto" : "smooth" });
      if (history.replaceState) history.replaceState(null, "", location.pathname + location.search + "#" + id);
    });
  }

  function mobileMenu() {
    var m = $("#mobile-menu"), btn = $("#menu-open");
    function set(open) { m.classList.toggle("open", open); m.setAttribute("aria-hidden", String(!open)); btn.setAttribute("aria-expanded", String(open)); lockScroll(open); }
    btn.addEventListener("click", function () { set(true); });
    $("#menu-close").addEventListener("click", function () { set(false); });
    $$("[data-close-menu]", m).forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
  }

  function ticker() {
    var t = $("#ticker-track"); if (!t) return;
    t.innerHTML = t.innerHTML + t.innerHTML + t.innerHTML + t.innerHTML;
  }

  function lazyMap() {
    var card = $("#map-card"); if (!card) return;
    var q = encodeURIComponent(CFG.nom + ", " + CFG.adresse.rue + ", " + CFG.adresse.codePostal + " " + CFG.adresse.ville);
    function load() {
      if (card.querySelector("iframe")) return;
      var f = document.createElement("iframe");
      f.src = "https://www.google.com/maps?q=" + q + "&z=16&output=embed";
      f.title = "Plan d'accès au Fournil des Chaouches";
      f.loading = "lazy"; f.referrerPolicy = "no-referrer-when-downgrade";
      card.insertBefore(f, card.firstChild);
    }
    if (!("IntersectionObserver" in window)) return load();
    var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { load(); io.disconnect(); } }, { rootMargin: "400px" });
    io.observe(card);
  }

  /* Farine qui flotte dans le héro */
  function flour() {
    var c = $("#flour"); if (!c || REDUCED || !c.getContext) return;
    var ctx = c.getContext("2d"), parts = [], w, h, dpr = Math.min(window.devicePixelRatio || 1, 2), running = true;
    function size() { w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); window.addEventListener("resize", size);
    var N = w < 700 ? 36 : 70;
    for (var i = 0; i < N; i++) parts.push({ x: Math.random() * w, y: Math.random() * h, r: 0.6 + Math.random() * 2.2, vx: -0.15 + Math.random() * 0.3, vy: -0.08 - Math.random() * 0.25, a: 0.15 + Math.random() * 0.45, p: Math.random() * 6.28 });
    var io = new IntersectionObserver(function (en) { running = en[0].isIntersecting; if (running) requestAnimationFrame(draw); });
    io.observe(c);
    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.p += 0.01; p.x += p.vx + Math.sin(p.p) * 0.15; p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = "rgba(255,246,228," + p.a + ")"; ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* ------------------------------------------------------------------ */
  /* Événements globaux                                                  */
  /* ------------------------------------------------------------------ */
  function bindEvents() {
    document.addEventListener("click", function (e) {
      var t = e.target.closest("button, a"); if (!t) return;
      var id;
      if ((id = t.getAttribute("data-add"))) { addToCart(id, "", "", 1, t); toast(BY_ID[id].nom + " ajouté au panier", "i-bag"); }
      else if ((id = t.getAttribute("data-inc"))) addToCart(id, "", "", 1, t);
      else if ((id = t.getAttribute("data-dec"))) changeQty(lineKey(id), -1);
      else if ((id = t.getAttribute("data-choose"))) openOptions(id);
      else if ((id = t.getAttribute("data-line-inc"))) changeQty(id, 1);
      else if ((id = t.getAttribute("data-line-dec"))) changeQty(id, -1);
      else if (t.hasAttribute("data-close-cart")) closeCart();
      else if (t.hasAttribute("data-close-modal")) {
        var m = t.closest(".modal");
        if (m && m.id === "checkout-modal" && checkout.step === 3) checkout.step = 1;
        closeModal(m);
      }
      else if (t.hasAttribute("data-goto-shop")) { closeCart(); var s = $("#boutique"); window.scrollTo({ top: s.getBoundingClientRect().top + window.scrollY - 60, behavior: "smooth" }); }
      else if (t.hasAttribute("data-day")) {
        var k = t.getAttribute("data-day"); buildDays().forEach(function (d) { if (dayKey(d) === k) checkout.day = d; }); checkout.slot = null; renderCheckout();
        var slot = $("#checkout-content .slot"); if (slot) slot.focus();
      }
      else if (t.hasAttribute("data-slot")) { checkout.slot = +t.getAttribute("data-slot"); renderCheckout(); var nx = $("#to-step-2"); if (nx) nx.focus(); }
      else if (t.id === "to-step-2") { checkout.step = 2; renderCheckout(); $("#checkout-modal .modal-content").scrollTop = 0; setTimeout(function () { var n = $("#co-nom"); if (n) n.focus(); }, 50); }
      else if (t.id === "back-step-1") { var f = $("#checkout-form"); if (f) { checkout.customer = { nom: f.nom.value, tel: f.tel.value, email: f.email.value }; checkout.comment = f.commentaire.value; } checkout.step = 1; renderCheckout(); }
    });

    document.addEventListener("submit", function (e) {
      if (e.target.id === "checkout-form") { e.preventDefault(); submitOrder(e.target); }
    });
    document.addEventListener("input", function (e) {
      var f = e.target.closest && e.target.closest("#checkout-form, #special-form");
      if (!f) return;
      e.target.classList.remove("invalid");
      var err = e.target.parentNode && e.target.parentNode.querySelector(".field-error"); if (err) err.textContent = "";
      var m = f.querySelector(".form-msg.err"); if (m) m.className = "full form-msg";
    });
    document.addEventListener("focusout", function (e) {
      if (e.target.closest && e.target.closest("#checkout-form") && /INPUT|TEXTAREA/.test(e.target.tagName) && e.target.type !== "checkbox" && e.target.value) validateField(e.target);
    });

    $("#cart-open").addEventListener("click", openCart);
    $("#mb-order").addEventListener("click", function () { if (cart.length) openCart(); else { var s = $("#boutique"); window.scrollTo({ top: s.getBoundingClientRect().top + window.scrollY - 60, behavior: "smooth" }); } });
    $("#checkout-open").addEventListener("click", openCheckout);
    $("#overlay").addEventListener("click", function () { if ($(".modal.open")) closeModal(); else closeCart(); });
    $("#legal-open").addEventListener("click", function () { openModal("#legal-modal"); });
    $$(".modal").forEach(function (m) { m.addEventListener("click", function (e) { if (e.target === m) closeModal(m); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if ($("#mobile-menu").classList.contains("open")) $("#menu-close").click();
        else if ($(".modal.open")) closeModal();
        else if ($("#cart-drawer").classList.contains("open")) closeCart();
      }
      trapFocus(e);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Démarrage                                                           */
  /* ------------------------------------------------------------------ */
  function init() {
    ART.injectDefs();
    bindContact();
    renderStatus(); setInterval(renderStatus, 60000);
    renderHours();
    renderTabs();
    renderCatalog();
    updateCartUI();
    bindEvents();
    bindSpecialForm();
    headerAndNav();
    mobileMenu();
    ticker();
    observeReveals($$(".reveal"));
    counters();
    lazyMap();
    flour();
    if (DEMO) setTimeout(function () { toast("Mode démonstration : les commandes ne sont pas réellement envoyées", "i-info"); }, 1200);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
