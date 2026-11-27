// Seite „Monatssieger": Jahresleiste rechts, 4x3-Raster der Monate
(function () {
  var DATEN = window.MONATSSIEGER || {};
  var MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August',
    'September', 'Oktober', 'November', 'Dezember'];
  var jahre = [];
  var festgelegt = /^#\d{4}$/.test(location.hash); // Jahr per Link oder Klick gewählt
  var raster = document.getElementById('msRaster');
  var leiste = document.getElementById('msJahre');
  var titel = document.getElementById('msTitel');
  var heute = new Date();

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function pkt(n) { return Number(n).toLocaleString('de-DE'); }
  function initialen(name) {
    return name.split(/\s+/).map(function (t) { return t.charAt(0); }).join('').slice(0, 2).toUpperCase();
  }

  function offen(jahr, m) {
    return jahr > heute.getFullYear() || (jahr === heute.getFullYear() && m >= heute.getMonth() + 1);
  }

  function karte(jahr, m) {
    var e = (DATEN[jahr] || {})[m];
    var club = m === 12;
    var kopf = club
      ? '<div class="ms-monat ms-club-kopf">🏆 Clubmeister ' + jahr + '</div>'
      : '<div class="ms-monat">' + MONATE[m - 1] + '</div>';
    var klasse = 'ms-karte' + (club ? ' ms-club' : '');
    if (!e) {
      var text;
      if (club) text = offen(jahr, m)
        ? 'Die Clubmeisterschaft ' + jahr + ' läuft noch &ndash; der Clubmeister steht im Dezember fest.'
        : 'Keine Angaben zur Clubmeisterschaft.';
      else if (offen(jahr, m)) text = 'Noch offen';
      else text = 'Keine Angaben';
      return '<article class="' + klasse + ' ms-leer">' + kopf + '<div class="ms-leertext">' + text + '</div></article>';
    }
    if (e.kein) {
      return '<article class="ms-karte ms-leer">' + kopf + '<div class="ms-leertext">' + esc(e.kein) + '</div></article>';
    }
    var sieger = e.platz[0];
    var alt = club ? 'Clubmeister ' + jahr + ': ' + e.platz.map(function (p) { return p[0]; }).join(', ')
      : 'Monatssieger ' + MONATE[m - 1] + ' ' + jahr + ': ' + sieger[0];
    var foto = e.bild
      ? '<a class="ms-foto lightbox" href="' + esc(e.bild) + '"><img src="' + esc(e.bild) + '" alt="' + esc(alt) + '" loading="lazy"></a>'
      : '<div class="ms-foto ms-ohne" aria-hidden="true"><span>' + esc(initialen(sieger[0])) + '</span></div>';
    var liste = e.platz.map(function (p, i) {
      return '<li><span class="ms-platz">' + (i + 1) + '.</span><span class="ms-name">' + esc(p[0]) +
        '</span><span class="ms-pkt">' + pkt(p[1]) + '</span></li>';
    }).join('');
    return '<article class="' + klasse + '">' + kopf + foto +
      '<div class="ms-sieger">' + esc(sieger[0]) + '</div>' +
      (club ? '<div class="ms-unter">Jahreswertung</div>' : '') +
      '<ol class="ms-liste">' + liste + '</ol>' +
      (e.hinweis ? '<div class="ms-hinweis">' + esc(e.hinweis) + '</div>' : '') +
      '</article>';
  }

  function zeige(jahr) {
    if (jahre.indexOf(jahr) < 0) jahr = jahre[0];
    titel.textContent = 'Monatssieger ' + jahr;
    // Neueste zuerst (Dezember = Clubmeister … Januar); Monate ohne Eintrag werden nicht angezeigt
    var monate = [];
    for (var m = 12; m >= 1; m--) {
      if ((DATEN[jahr] || {})[m]) monate.push(m);
    }
    raster.innerHTML = monate.map(function (mm) { return karte(jahr, mm); }).join('');
    Array.prototype.forEach.call(leiste.querySelectorAll('button'), function (b) {
      var aktiv = Number(b.dataset.jahr) === jahr;
      b.classList.toggle('aktiv', aktiv);
      b.setAttribute('aria-pressed', aktiv ? 'true' : 'false');
    });
    if (location.hash !== '#' + jahr) history.replaceState(null, '', '#' + jahr);
  }

  function leisteAufbauen() {
    jahre = Object.keys(DATEN).map(Number).sort(function (a, b) { return b - a; });
    leiste.innerHTML = jahre.map(function (j) {
      return '<button type="button" data-jahr="' + j + '">' + j + '</button>';
    }).join('');
  }
  leisteAufbauen();
  leiste.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) { festgelegt = true; zeige(Number(b.dataset.jahr)); }
  });

  // Monatssieger aus der Redaktion (Firebase, js/monatssieger-firebase.js) ergänzen
  window.msNeuZeichnen = function () {
    var aktuell = Number(location.hash.slice(1));
    leisteAufbauen();
    zeige(festgelegt && aktuell ? aktuell : jahre[0]);
  };
  window.addEventListener('hashchange', function () { zeige(Number(location.hash.slice(1))); });

  zeige(Number(location.hash.slice(1)) || jahre[0]);
})();
