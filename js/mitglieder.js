// Seite „Mitglieder": Steckbrief-Kacheln aus window.MITGLIEDER,
// Erfolge (Monatssiege, Clubmeister) aus window.MONATSSIEGER
(function () {
  var LISTE = (window.MITGLIEDER || []).slice();
  var SIEGER = window.MONATSSIEGER || {};
  var CLUB = window.CLUBMEISTER || {};
  var raster = document.getElementById('mgRaster');
  var anzahl = document.getElementById('mgAnzahl');
  var sortKnoepfe = document.querySelectorAll('.mg-sort button');
  var heute = new Date();

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function datum(s) { var t = s.split('.'); return new Date(+t[2], +t[1] - 1, +t[0]); }
  function jahreSeit(d) {
    var j = heute.getFullYear() - d.getFullYear();
    if (heute.getMonth() < d.getMonth() || (heute.getMonth() === d.getMonth() && heute.getDate() < d.getDate())) j--;
    return j;
  }
  function initialen(m) { return (m.vorname.charAt(0) + m.name.charAt(0)).toUpperCase(); }

  // Erfolge je Name sammeln: Clubmeisterschaft (Platz 1–3 seit 1992) und Monatssiege
  function erfolge(m) {
    var namen = [m.vorname + ' ' + m.name].concat(m.auch || []);
    var siege = 0, platz = [[], [], []];
    Object.keys(SIEGER).forEach(function (jahr) {
      Object.keys(SIEGER[jahr]).forEach(function (mon) {
        var e = SIEGER[jahr][mon];
        if (e.platz && !e.clubmeister && namen.indexOf(e.platz[0][0]) >= 0) siege++;
      });
    });
    // Clubmeister: clubmeister-daten.js, sonst Dezember-Eintrag (Jahreswertung) der Monatssieger
    var club = {};
    Object.keys(SIEGER).forEach(function (jahr) {
      var e = SIEGER[jahr][12];
      if (e && e.clubmeister && e.platz) club[jahr] = e.platz.map(function (p) { return p[0]; });
    });
    Object.keys(CLUB).forEach(function (jahr) { club[jahr] = CLUB[jahr]; });
    Object.keys(club).forEach(function (jahr) {
      club[jahr].forEach(function (n, i) { if (i < 3 && namen.indexOf(n) >= 0) platz[i].push(jahr); });
    });
    return { siege: siege, platz: platz };
  }
  function jahresliste(j) { return j.sort().join(', '); }

  function karte(m) {
    var seit = datum(m.seit);
    var jahre = jahreSeit(seit);
    var name = m.vorname + ' ' + m.name;
    var marken = [];
    if (m.amt) marken.push('<span class="mg-marke mg-amt">' + esc(m.amt) + '</span>');
    if (seit.getFullYear() === 1992) marken.push('<span class="mg-marke mg-gruender">Gründungsmitglied</span>');
    if (jahre < 1) marken.push('<span class="mg-marke mg-neu">Neu im Club</span>');

    var foto = m.bild && !m.keinFoto
      ? '<a class="mg-foto lightbox" href="' + esc(m.original || m.bild) + '"><img src="' + esc(m.bild) +
        '" alt="' + esc(name) + '" loading="lazy"></a>'
      : '<div class="mg-foto mg-ohne" aria-hidden="true"><span>' + esc(initialen(m)) + '</span></div>';

    var zeilen = [];
    if (m.ort) zeilen.push(['Wohnort', esc(m.ort)]);
    if (m.jahrgang) zeilen.push(['Jahrgang', m.jahrgang]);
    zeilen.push(['Mitglied seit', esc(m.seit) + '<span class="mg-dauer">' +
      (jahre < 1 ? 'neu' : jahre + (jahre === 1 ? ' Jahr' : ' Jahre')) + '</span>']);

    var e = erfolge(m), erf = [];
    var p = e.platz;
    if (p[0].length) erf.push('<li class="mg-club">🏆 ' + (p[0].length > 1 ? p[0].length + '× ' : '') + 'Clubmeister' +
      '<span class="mg-jahre">' + jahresliste(p[0]) + '</span></li>');
    if (e.siege) erf.push('<li>⭐ ' + e.siege + '× Monatssieger</li>');

    return '<article class="mg-karte">' + foto +
      (marken.length ? '<div class="mg-marken">' + marken.join('') + '</div>' : '') +
      '<h2 class="mg-name">' + esc(name) + '</h2>' +
      '<dl class="mg-daten">' + zeilen.map(function (z) { return '<dt>' + z[0] + '</dt><dd>' + z[1] + '</dd>'; }).join('') + '</dl>' +
      (erf.length ? '<ul class="mg-erfolge">' + erf.join('') + '</ul>' : '') +
      '</article>';
  }

  var SORT = {
    name: function (a, b) { return a.name.localeCompare(b.name, 'de') || a.vorname.localeCompare(b.vorname, 'de'); },
    seit: function (a, b) { return datum(a.seit) - datum(b.seit) || SORT.name(a, b); }
  };

  var aktuelleSortierung = 'name';
  function zeige(art) {
    aktuelleSortierung = art;
    LISTE.sort(SORT[art] || SORT.name);
    raster.innerHTML = LISTE.map(karte).join('');
    anzahl.textContent = LISTE.length + ' Mitglieder';
    Array.prototype.forEach.call(sortKnoepfe, function (b) {
      var an = b.dataset.sort === art;
      b.classList.toggle('aktiv', an);
      b.setAttribute('aria-pressed', an ? 'true' : 'false');
    });
  }
  Array.prototype.forEach.call(sortKnoepfe, function (b) {
    b.addEventListener('click', function () { zeige(b.dataset.sort); });
  });
  // nach dem Nachladen aus der Redaktion (js/monatssieger-firebase.js)
  window.mgNeuZeichnen = function () { zeige(aktuelleSortierung); };
  zeige('name');
})();
