/* =====================================================================
   Illustrations vectorielles des produits (aucune image à charger).
   Utilisées tant qu'aucune photo n'est renseignée dans produits.js.
   ===================================================================== */
(function () {
  "use strict";

  // Dégradés partagés, injectés une seule fois dans la page.
  var DEFS =
    '<svg aria-hidden="true" focusable="false" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden">' +
    "<defs>" +
    '<linearGradient id="fc-crust" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4c47c"/><stop offset=".45" stop-color="#dc9143"/><stop offset="1" stop-color="#9c5220"/></linearGradient>' +
    '<linearGradient id="fc-crust-h" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6cd8a"/><stop offset=".5" stop-color="#d98a3d"/><stop offset="1" stop-color="#a0561f"/></linearGradient>' +
    '<linearGradient id="fc-crust-dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b87a46"/><stop offset=".5" stop-color="#8a4f26"/><stop offset="1" stop-color="#5b3014"/></linearGradient>' +
    '<linearGradient id="fc-crust-light" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe0a6"/><stop offset=".5" stop-color="#eeb064"/><stop offset="1" stop-color="#c47530"/></linearGradient>' +
    '<linearGradient id="fc-score" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fae6b5"/><stop offset="1" stop-color="#e7b067"/></linearGradient>' +
    '<linearGradient id="fc-choco" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4528"/><stop offset="1" stop-color="#3b1d0f"/></linearGradient>' +
    '<linearGradient id="fc-custard" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3c9"/><stop offset="1" stop-color="#f2cd6e"/></linearGradient>' +
    '<linearGradient id="fc-caramel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9a5420"/><stop offset="1" stop-color="#5c2c0c"/></linearGradient>' +
    '<linearGradient id="fc-cream" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf1"/><stop offset="1" stop-color="#efdcc0"/></linearGradient>' +
    '<linearGradient id="fc-pink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7c6cf"/><stop offset="1" stop-color="#e08a9c"/></linearGradient>' +
    '<linearGradient id="fc-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0583c"/><stop offset="1" stop-color="#8e2414"/></linearGradient>' +
    '<linearGradient id="fc-green" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8d36b"/><stop offset="1" stop-color="#4f8a2a"/></linearGradient>' +
    '<linearGradient id="fc-plate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e6ddd0"/></linearGradient>' +
    '<linearGradient id="fc-navy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22335c"/><stop offset="1" stop-color="#101a33"/></linearGradient>' +
    '<radialGradient id="fc-shadow"><stop offset="0" stop-color="#1c2540" stop-opacity=".38"/><stop offset="1" stop-color="#1c2540" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="fc-flour"><stop offset="0" stop-color="#fffdf7" stop-opacity=".85"/><stop offset="1" stop-color="#fffdf7" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="fc-shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
    "</defs></svg>";

  function injectDefs() {
    if (document.getElementById("fc-defs")) return;
    var d = document.createElement("div");
    d.id = "fc-defs";
    d.innerHTML = DEFS;
    document.body.insertBefore(d, document.body.firstChild);
  }

  // Petit générateur pseudo-aléatoire déterministe (même dessin à chaque fois)
  function rng(seed) {
    var s = seed;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function shadow(cx, cy, rx, ry) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="url(#fc-shadow)"/>';
  }

  function flourDust(seed, n, x0, x1, y0, y1) {
    var r = rng(seed), out = "";
    for (var i = 0; i < n; i++) {
      out += '<circle cx="' + (x0 + r() * (x1 - x0)).toFixed(1) + '" cy="' + (y0 + r() * (y1 - y0)).toFixed(1) +
        '" r="' + (0.6 + r() * 1.4).toFixed(1) + '" fill="#fffaf0" opacity="' + (0.35 + r() * 0.5).toFixed(2) + '"/>';
    }
    return out;
  }

  function grigne(x, y, len, angle) {
    return '<g transform="translate(' + x + " " + y + ") rotate(" + angle + ')">' +
      '<ellipse cx="0" cy="0" rx="' + len + '" ry="5.2" fill="url(#fc-score)"/>' +
      '<path d="M' + (-len) + ",0 Q0,-8 " + len + ',0" fill="none" stroke="#8d4a1c" stroke-width="2" stroke-linecap="round" opacity=".55"/>' +
      '<path d="M' + (-len + 4) + ",2.5 Q0,6 " + (len - 4) + ',2.5" fill="none" stroke="#fff6dc" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>' +
      "</g>";
  }

  function baguetteBody(len, pointy) {
    var h = len / 2, body;
    if (pointy) {
      body = '<path d="M' + -h + ",0 C" + (-h + 14) + ",-21 " + (-h + 44) + ",-23 0,-23 C" + (h - 44) + ",-23 " + (h - 14) + ",-21 " + h + ",0 C" +
        (h - 14) + ",21 " + (h - 44) + ",23 0,23 C" + (-h + 44) + ",23 " + (-h + 14) + ",21 " + -h + ',0Z" fill="url(#fc-crust)"/>';
    } else {
      body = '<rect x="' + -h + '" y="-22" width="' + len + '" height="44" rx="22" fill="url(#fc-crust)"/>';
    }
    return body +
      '<path d="M' + (-h + 18) + ",-14 C" + (-h / 2) + ",-21 " + h / 2 + ",-21 " + (h - 18) + ',-14" fill="none" stroke="url(#fc-shine)" stroke-width="6" stroke-linecap="round" opacity=".7"/>' +
      '<path d="M' + (-h + 14) + ",16 C" + (-h / 2) + ",22 " + h / 2 + ",22 " + (h - 14) + ',16" fill="none" stroke="#7a3d14" stroke-width="3" stroke-linecap="round" opacity=".35"/>';
  }

  function baguette(len, n, pointy, seed) {
    var out = baguetteBody(len, pointy), step = (len - 50) / (n - 1), start = -(len - 50) / 2;
    for (var i = 0; i < n; i++) out += grigne((start + i * step).toFixed(1), -2, step * 0.62, -22);
    return out + flourDust(seed, 26, -len / 2 + 20, len / 2 - 20, -16, 14);
  }

  function batard(fill, seed) {
    return '<ellipse cx="0" cy="0" rx="86" ry="38" fill="' + (fill || "url(#fc-crust)") + '"/>' +
      '<ellipse cx="-6" cy="-16" rx="62" ry="14" fill="url(#fc-shine)" opacity=".55"/>' +
      '<path d="M-78,14 Q0,44 78,14" fill="none" stroke="#5e2f10" stroke-width="3" opacity=".3"/>';
  }

  function seeds(seed, n, rx, ry, cols) {
    var r = rng(seed), out = "";
    for (var i = 0; i < n; i++) {
      var a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.9;
      var x = Math.cos(a) * rx * d, y = Math.sin(a) * ry * d - 4;
      out += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + (2.4 + r() * 1.6).toFixed(1) + '" ry="' + (1.3 + r() * 0.8).toFixed(1) +
        '" transform="rotate(' + Math.round(r() * 180) + " " + x.toFixed(1) + " " + y.toFixed(1) + ')" fill="' + cols[i % cols.length] + '"/>';
    }
    return out;
  }

  function fluted(cx, cy, rx, ry, n, fill) {
    var out = "";
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      out += '<circle cx="' + (cx + Math.cos(a) * rx).toFixed(1) + '" cy="' + (cy + Math.sin(a) * ry).toFixed(1) + '" r="7" fill="' + fill + '"/>';
    }
    return out;
  }

  var ART = {
    baguette: function () {
      return shadow(120, 126, 108, 14) + '<g transform="translate(120 80) rotate(-13)">' + baguette(216, 5, true, 7) + "</g>";
    },
    baguette2: function () {
      return shadow(120, 124, 104, 13) + '<g transform="translate(120 80) rotate(-9)">' + baguette(206, 6, false, 11) + "</g>";
    },
    demi: function () {
      return shadow(120, 122, 70, 11) + '<g transform="translate(120 82) rotate(-10)">' + baguette(132, 3, true, 5) + "</g>";
    },
    boule: function () {
      return shadow(120, 128, 92, 13) +
        '<g transform="translate(120 84)">' +
        '<ellipse cx="0" cy="8" rx="86" ry="38" fill="#8f4c1d"/>' +
        '<ellipse cx="0" cy="0" rx="86" ry="44" fill="url(#fc-crust-h)"/>' +
        '<ellipse cx="-4" cy="-10" rx="62" ry="26" fill="url(#fc-flour)" opacity=".85"/>' +
        '<path d="M-50,-6 Q0,-40 50,-6" fill="none" stroke="url(#fc-score)" stroke-width="9" stroke-linecap="round"/>' +
        '<path d="M-44,14 Q0,-18 44,14" fill="none" stroke="url(#fc-score)" stroke-width="8" stroke-linecap="round"/>' +
        '<path d="M-50,-6 Q0,-40 50,-6" fill="none" stroke="#7d3f14" stroke-width="1.6" opacity=".5" transform="translate(0 -3)"/>' +
        flourDust(21, 40, -60, 60, -30, 20) +
        "</g>";
    },
    graines: function () {
      return shadow(120, 126, 92, 12) + '<g transform="translate(120 82)">' + batard() +
        seeds(31, 120, 80, 32, ["#f6e7c6", "#3b2a1c", "#7aa046", "#d7b073", "#fff3dd", "#2c1f15"]) + "</g>";
    },
    seigle: function () {
      var lines = "";
      for (var i = -3; i <= 3; i++) {
        lines += '<path d="M' + (i * 22 - 26) + ",-30 L" + (i * 22 + 26) + ',30" stroke="#e8c79a" stroke-width="3" opacity=".75"/>';
        lines += '<path d="M' + (i * 22 + 26) + ",-30 L" + (i * 22 - 26) + ',30" stroke="#e8c79a" stroke-width="3" opacity=".75"/>';
      }
      return shadow(120, 126, 92, 12) +
        '<g transform="translate(120 82)"><defs><clipPath id="fc-clip-seigle"><rect x="-82" y="-36" width="164" height="72" rx="26"/></clipPath></defs>' +
        '<rect x="-82" y="-30" width="164" height="72" rx="26" fill="#4a250f"/>' +
        '<rect x="-82" y="-36" width="164" height="72" rx="26" fill="url(#fc-crust-dark)"/>' +
        '<g clip-path="url(#fc-clip-seigle)">' + lines + '<rect x="-82" y="-36" width="164" height="40" fill="url(#fc-flour)" opacity=".7"/></g>' +
        flourDust(41, 50, -70, 70, -28, 20) + "</g>";
    },
    cereales: function () {
      var r = rng(51), oats = "";
      for (var i = 0; i < 46; i++) {
        var a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.85, x = Math.cos(a) * 76 * d, y = Math.sin(a) * 28 * d - 6;
        oats += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="5" ry="2.4" transform="rotate(' + Math.round(r() * 180) + " " + x.toFixed(1) + " " + y.toFixed(1) + ')" fill="#f3e2bf" stroke="#c9a46a" stroke-width=".6"/>';
      }
      return shadow(120, 126, 92, 12) + '<g transform="translate(120 82)">' + batard("url(#fc-crust-h)") +
        grigne(-40, -4, 18, -30) + grigne(0, -4, 18, -30) + grigne(40, -4, 18, -30) + oats + "</g>";
    },
    chorizo: function () {
      var r = rng(61), dots = "";
      for (var i = 0; i < 16; i++) {
        var a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.8, x = Math.cos(a) * 72 * d, y = Math.sin(a) * 26 * d - 4;
        var rr = 4 + r() * 4;
        dots += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + rr.toFixed(1) + '" fill="url(#fc-red)"/>' +
          '<circle cx="' + (x - rr / 3).toFixed(1) + '" cy="' + (y - rr / 3).toFixed(1) + '" r="' + (rr / 3).toFixed(1) + '" fill="#f7b29c" opacity=".6"/>';
      }
      return shadow(120, 126, 92, 12) + '<g transform="translate(120 82)">' + batard() +
        '<path d="M-70,-8 C-30,-26 30,-26 70,-8" fill="none" stroke="url(#fc-score)" stroke-width="10" stroke-linecap="round"/>' +
        dots + "</g>";
    },
    croissant: function () {
      function seg(cx, cy, rx, ry, rot) {
        return '<g transform="translate(' + cx + " " + cy + ") rotate(" + rot + ')">' +
          '<ellipse rx="' + rx + '" ry="' + ry + '" fill="url(#fc-crust-light)" stroke="#a75d22" stroke-width="1.6"/>' +
          '<path d="M' + (-rx * 0.6) + "," + (-ry * 0.55) + " Q0," + (-ry * 0.95) + " " + rx * 0.6 + "," + (-ry * 0.55) + '" fill="none" stroke="#fff3d6" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>' +
          '<path d="M' + (-rx * 0.75) + "," + ry * 0.35 + " Q0," + ry * 0.85 + " " + rx * 0.75 + "," + ry * 0.35 + '" fill="none" stroke="#8c4718" stroke-width="1.4" opacity=".45"/>' +
          "</g>";
      }
      return shadow(120, 128, 96, 12) +
        seg(46, 108, 18, 14, -58) + seg(194, 108, 18, 14, 58) +
        seg(72, 90, 26, 22, -38) + seg(168, 90, 26, 22, 38) +
        seg(120, 80, 36, 32, 0);
    },
    chocolatine: function () {
      var layers = "";
      for (var i = 0; i < 5; i++) layers += '<path d="M60,' + (64 + i * 9) + " Q120," + (58 + i * 9) + " 180," + (64 + i * 9) + '" fill="none" stroke="#f6d8a0" stroke-width="1.4" opacity="' + (0.65 - i * 0.08) + '"/>';
      return shadow(120, 126, 92, 12) +
        '<rect x="40" y="60" width="13" height="9" rx="3" fill="url(#fc-choco)"/><rect x="40" y="84" width="13" height="9" rx="3" fill="url(#fc-choco)"/>' +
        '<rect x="187" y="60" width="13" height="9" rx="3" fill="url(#fc-choco)"/><rect x="187" y="84" width="13" height="9" rx="3" fill="url(#fc-choco)"/>' +
        '<rect x="48" y="52" width="144" height="66" rx="22" fill="url(#fc-crust-light)" stroke="#a75d22" stroke-width="1.6"/>' +
        layers +
        '<path d="M70,58 Q120,50 170,58" fill="none" stroke="#fff4da" stroke-width="5" stroke-linecap="round" opacity=".6"/>' +
        '<path d="M58,110 Q120,120 182,110" fill="none" stroke="#8c4718" stroke-width="2" opacity=".35"/>';
    },
    raisins: function () {
      var spiral = "M120,84 ", a, r, i;
      for (i = 0; i <= 64; i++) { a = i * 0.32; r = 3 + i * 0.82; spiral += "L" + (120 + Math.cos(a) * r).toFixed(1) + "," + (84 + Math.sin(a) * r * 0.62).toFixed(1) + " "; }
      var rs = "", g = rng(71);
      for (i = 6; i < 60; i += 5) { a = i * 0.32; r = 3 + i * 0.82; rs += '<ellipse cx="' + (120 + Math.cos(a + 0.15) * r).toFixed(1) + '" cy="' + (84 + Math.sin(a + 0.15) * r * 0.62).toFixed(1) + '" rx="3.6" ry="2.6" fill="#4b2615" transform="rotate(' + Math.round(g() * 90) + " " + (120 + Math.cos(a + 0.15) * r).toFixed(1) + " " + (84 + Math.sin(a + 0.15) * r * 0.62).toFixed(1) + ')"/>'; }
      return shadow(120, 128, 78, 11) +
        '<ellipse cx="120" cy="92" rx="60" ry="38" fill="#a65c22"/>' +
        '<ellipse cx="120" cy="84" rx="60" ry="38" fill="url(#fc-crust-light)"/>' +
        '<path d="' + spiral + '" fill="none" stroke="url(#fc-custard)" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="' + spiral + '" fill="none" stroke="#b56a2a" stroke-width="1.4" stroke-linecap="round" opacity=".6" transform="translate(0 4)"/>' +
        rs;
    },
    chausson: function () {
      var veins = "";
      for (var i = -2; i <= 2; i++) veins += '<path d="M' + (120 + i * 22) + ",104 Q" + (120 + i * 16) + ",78 " + (120 + i * 6) + ',58" fill="none" stroke="#fbe3b0" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>';
      return shadow(120, 124, 86, 11) +
        '<path d="M42,112 C42,58 84,34 120,34 C156,34 198,58 198,112 Z" fill="url(#fc-crust)"/>' +
        '<path d="M42,112 L198,112" stroke="#8c4718" stroke-width="4" stroke-linecap="round" opacity=".55"/>' +
        veins +
        '<path d="M70,62 Q120,32 170,62" fill="none" stroke="url(#fc-shine)" stroke-width="8" stroke-linecap="round" opacity=".6"/>';
    },
    brioche: function () {
      var out = shadow(120, 126, 96, 12), i, x, rot;
      for (i = 0; i < 7; i++) {
        x = 44 + i * 25; rot = i % 2 ? 28 : -28;
        out += '<g transform="translate(' + x + " " + (82 + (i % 2 ? 4 : -4)) + ") rotate(" + rot + ')"><ellipse rx="22" ry="30" fill="url(#fc-crust)" stroke="#8c4718" stroke-width="1.2"/><ellipse cx="-4" cy="-12" rx="10" ry="8" fill="url(#fc-shine)"/></g>';
      }
      var g = rng(81);
      for (i = 0; i < 34; i++) out += '<circle cx="' + (40 + g() * 160).toFixed(1) + '" cy="' + (62 + g() * 36).toFixed(1) + '" r="' + (1.4 + g() * 1.4).toFixed(1) + '" fill="#fffdf6"/>';
      return out;
    },
    basque: function () {
      var hatch = "";
      for (var i = -8; i <= 8; i++) {
        hatch += '<path d="M' + (i * 16 - 60) + ",-40 L" + (i * 16 + 60) + ',40" stroke="#9b5220" stroke-width="1.6" opacity=".45"/>';
        hatch += '<path d="M' + (i * 16 + 60) + ",-40 L" + (i * 16 - 60) + ',40" stroke="#9b5220" stroke-width="1.6" opacity=".45"/>';
      }
      return shadow(120, 134, 104, 12) +
        '<ellipse cx="120" cy="114" rx="104" ry="24" fill="url(#fc-plate)" stroke="#d8cbb6"/>' +
        '<g transform="translate(120 72)">' +
        '<path d="M-86,0 L-86,30 A86,30 0 0 0 86,30 L86,0 Z" fill="url(#fc-crust-dark)"/>' +
        '<path d="M-86,12 A86,30 0 0 0 86,12" fill="none" stroke="#f3cf8a" stroke-width="2" opacity=".35"/>' +
        '<defs><clipPath id="fc-clip-basque"><ellipse rx="86" ry="30"/></clipPath></defs>' +
        '<ellipse rx="86" ry="30" fill="url(#fc-crust-light)"/>' +
        '<g clip-path="url(#fc-clip-basque)">' + hatch + "</g>" +
        '<ellipse rx="86" ry="30" fill="none" stroke="#b0652a" stroke-width="2"/>' +
        '<ellipse cx="-16" cy="-12" rx="46" ry="10" fill="url(#fc-shine)" opacity=".7"/>' +
        "</g>";
    },
    tarte: function () {
      var fruits = "", g = rng(91), i, a, d, x, y;
      for (i = 0; i < 14; i++) {
        a = g() * Math.PI * 2; d = Math.sqrt(g()) * 0.78; x = 120 + Math.cos(a) * 66 * d; y = 80 + Math.sin(a) * 24 * d;
        if (i % 3 === 0) fruits += '<path d="M' + x.toFixed(1) + "," + (y - 8).toFixed(1) + " c7,0 9,6 0,14 c-9,-8 -7,-14 0,-14z" + '" fill="url(#fc-red)"/><path d="M' + (x - 3).toFixed(1) + "," + (y - 9).toFixed(1) + ' l3,3 l3,-3" stroke="#4f8a2a" stroke-width="2" fill="none"/>';
        else if (i % 3 === 1) fruits += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="11" ry="7" fill="#f2a13a" stroke="#d27a1a"/><ellipse cx="' + (x - 3).toFixed(1) + '" cy="' + (y - 2).toFixed(1) + '" rx="4" ry="2" fill="#fff" opacity=".5"/>';
        else fruits += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4.5" fill="#3a3f8f"/><circle cx="' + (x - 1.5).toFixed(1) + '" cy="' + (y - 1.5).toFixed(1) + '" r="1.4" fill="#fff" opacity=".5"/>';
      }
      return shadow(120, 128, 104, 12) +
        '<ellipse cx="120" cy="92" rx="96" ry="34" fill="#a65c22"/>' +
        fluted(120, 84, 92, 32, 34, "#e7a65a") +
        '<ellipse cx="120" cy="84" rx="92" ry="32" fill="url(#fc-crust-light)"/>' +
        '<ellipse cx="120" cy="82" rx="78" ry="26" fill="url(#fc-custard)"/>' +
        fruits +
        '<ellipse cx="100" cy="72" rx="40" ry="7" fill="#fff" opacity=".25"/>';
    },
    eclair: function () {
      return shadow(120, 122, 96, 11) +
        '<g transform="translate(120 84) rotate(-6)">' +
        '<rect x="-92" y="-22" width="184" height="46" rx="23" fill="url(#fc-crust-light)" stroke="#a75d22" stroke-width="1.4"/>' +
        '<rect x="-88" y="-26" width="176" height="28" rx="14" fill="url(#fc-choco)"/>' +
        '<path d="M-70,-19 Q0,-25 70,-19" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".45"/>' +
        '<path d="M-80,14 Q0,24 80,14" fill="none" stroke="#8c4718" stroke-width="2" opacity=".35"/>' +
        "</g>";
    },
    flan: function () {
      var dots = "", g = rng(101);
      for (var i = 0; i < 22; i++) dots += '<circle cx="' + (80 + g() * 100).toFixed(1) + '" cy="' + (58 + g() * 18).toFixed(1) + '" r="' + (1 + g() * 2).toFixed(1) + '" fill="#3a1a07" opacity=".5"/>';
      return shadow(130, 128, 90, 12) +
        '<path d="M50,64 L80,82 L80,124 L50,106 Z" fill="#f0c862"/>' +
        '<path d="M80,82 L206,64 L206,106 L80,124 Z" fill="url(#fc-custard)"/>' +
        '<path d="M50,100 L80,118 L80,124 L50,106 Z" fill="#b5692a"/>' +
        '<path d="M80,118 L206,100 L206,106 L80,124 Z" fill="#c47a33"/>' +
        '<path d="M50,64 L176,46 L206,64 L80,82 Z" fill="url(#fc-caramel)"/>' +
        dots +
        '<path d="M86,84 L200,68" stroke="#fff" stroke-width="2" opacity=".45"/>';
    },
    entremets: function () {
      return shadow(120, 136, 96, 12) +
        '<ellipse cx="120" cy="120" rx="96" ry="20" fill="url(#fc-plate)" stroke="#d8cbb6"/>' +
        '<path d="M44,70 L44,112 A76,18 0 0 0 196,112 L196,70 Z" fill="url(#fc-cream)" stroke="#e5d3b6"/>' +
        '<path d="M44,92 A76,18 0 0 0 196,92" fill="none" stroke="#e08a9c" stroke-width="5" opacity=".75"/>' +
        '<ellipse cx="120" cy="70" rx="76" ry="18" fill="url(#fc-pink)"/>' +
        '<circle cx="92" cy="66" r="6" fill="url(#fc-red)"/><circle cx="110" cy="74" r="6" fill="url(#fc-red)"/><circle cx="140" cy="66" r="6" fill="url(#fc-red)"/><circle cx="154" cy="74" r="6" fill="url(#fc-red)"/>' +
        '<rect x="117" y="34" width="6" height="32" rx="2" fill="#2b4f9e"/><path d="M117,42 l6,-4 M117,50 l6,-4 M117,58 l6,-4" stroke="#fff" stroke-width="1.5"/>' +
        '<path class="fc-flame" d="M120,16 C126,24 126,30 120,33 C114,30 114,24 120,16Z" fill="#f6b73c"/><path d="M120,23 C122,27 122,30 120,31 C118,30 118,27 120,23Z" fill="#fff4c2"/>';
    },
    sandwich: function () {
      return shadow(120, 128, 104, 12) +
        '<g transform="translate(120 88) rotate(-8)">' +
        '<rect x="-100" y="6" width="200" height="26" rx="13" fill="url(#fc-crust)"/>' +
        '<path d="M-96,8 q8,-10 16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0" fill="url(#fc-green)"/>' +
        '<rect x="-94" y="-4" width="188" height="12" rx="6" fill="#f0a3a6"/><path d="M-90,0 L90,0" stroke="#fbd3d3" stroke-width="2"/>' +
        '<rect x="-92" y="-10" width="184" height="6" rx="3" fill="#fff2c9"/>' +
        '<path d="M-100,-12 C-100,-34 -80,-38 0,-38 C80,-38 100,-34 100,-12 Z" fill="url(#fc-crust)"/>' +
        grigne(-50, -24, 16, -16) + grigne(0, -26, 16, -16) + grigne(50, -24, 16, -16) +
        "</g>";
    },
    sandwich2: function () {
      return shadow(120, 128, 104, 12) +
        '<g transform="translate(120 88) rotate(6)">' +
        '<rect x="-100" y="6" width="200" height="26" rx="13" fill="url(#fc-crust)"/>' +
        '<path d="M-96,8 q8,-10 16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0" fill="url(#fc-green)"/>' +
        '<circle cx="-60" cy="0" r="12" fill="url(#fc-red)"/><circle cx="-20" cy="2" r="12" fill="url(#fc-red)"/><circle cx="22" cy="0" r="12" fill="url(#fc-red)"/><circle cx="62" cy="2" r="12" fill="url(#fc-red)"/>' +
        '<path d="M-94,-8 L94,-8 L80,4 L64,-6 L40,6 L20,-6 L-4,6 L-26,-6 L-48,6 L-70,-6 L-94,4 Z" fill="#f7d35e"/>' +
        '<path d="M-100,-10 C-100,-34 -80,-38 0,-38 C80,-38 100,-34 100,-10 Z" fill="url(#fc-crust-h)"/>' +
        seeds(111, 30, 80, 10, ["#f6e7c6", "#fff3dd"]).replace(/cy="/g, 'data-y="').replace(/data-y="(-?[\d.]+)"/g, function (m, y) { return 'cy="' + (parseFloat(y) - 22).toFixed(1) + '"'; }) +
        "</g>";
    },
    quiche: function () {
      var spots = "", herbs = "", g = rng(121), i;
      for (i = 0; i < 18; i++) spots += '<ellipse cx="' + (60 + g() * 120).toFixed(1) + '" cy="' + (68 + g() * 30).toFixed(1) + '" rx="' + (4 + g() * 7).toFixed(1) + '" ry="' + (2 + g() * 3).toFixed(1) + '" fill="#c0782f" opacity=".55"/>';
      for (i = 0; i < 14; i++) herbs += '<rect x="' + (60 + g() * 120).toFixed(1) + '" y="' + (66 + g() * 32).toFixed(1) + '" width="4" height="1.8" fill="#3f7a26" transform="rotate(' + Math.round(g() * 180) + ' 120 84)"/>';
      return shadow(120, 128, 104, 12) +
        '<ellipse cx="120" cy="92" rx="96" ry="34" fill="#a65c22"/>' +
        fluted(120, 84, 92, 32, 34, "#e2a35c") +
        '<ellipse cx="120" cy="84" rx="92" ry="32" fill="url(#fc-crust-light)"/>' +
        '<ellipse cx="120" cy="82" rx="78" ry="26" fill="#f4d27a"/>' + spots + herbs +
        '<ellipse cx="100" cy="72" rx="36" ry="6" fill="#fff" opacity=".3"/>';
    },
    formule: function () {
      return shadow(120, 130, 104, 12) +
        '<g transform="translate(150 92) scale(.62) rotate(-8)">' +
        '<rect x="-100" y="6" width="200" height="26" rx="13" fill="url(#fc-crust)"/>' +
        '<path d="M-96,8 q8,-10 16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0" fill="url(#fc-green)"/>' +
        '<rect x="-94" y="-4" width="188" height="12" rx="6" fill="#f0a3a6"/>' +
        '<path d="M-100,-12 C-100,-34 -80,-38 0,-38 C80,-38 100,-34 100,-12 Z" fill="url(#fc-crust)"/>' +
        grigne(-50, -24, 16, -16) + grigne(0, -26, 16, -16) + grigne(50, -24, 16, -16) +
        "</g>" +
        '<g transform="translate(66 74)">' +
        '<path d="M-24,-34 L24,-34 L18,46 L-18,46 Z" fill="url(#fc-cream)" stroke="#d8c3a2"/>' +
        '<path d="M-21,-6 L21,-6 L19,22 L-19,22 Z" fill="url(#fc-navy)"/>' +
        '<text x="0" y="12" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#d9b36b" font-weight="700">FC</text>' +
        '<rect x="-28" y="-42" width="56" height="10" rx="4" fill="#2a3a63"/>' +
        '<rect x="6" y="-62" width="4" height="24" rx="2" fill="#d9b36b" transform="rotate(14 8 -50)"/>' +
        "</g>";
    }
  };

  window.FournilArt = {
    injectDefs: injectDefs,
    svg: function (key, label) {
      var fn = ART[key] || ART.baguette;
      return '<svg class="art" viewBox="0 0 240 150" role="img" aria-label="' + (label || "") + '">' + fn() + "</svg>";
    }
  };
})();
