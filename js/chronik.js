// Seite „Chronik": ein Jahr anzeigen (Leiste rechts), Filter Club intern / Verband
(function () {
  var jahre = Array.prototype.slice.call(document.querySelectorAll('.ch-jahr'));
  var knoepfe = Array.prototype.slice.call(document.querySelectorAll('#chJahre button'));
  var filter = Array.prototype.slice.call(document.querySelectorAll('.ch-filter button'));
  var titel = document.getElementById('chTitel');
  var art = 'alle', jahr = null;

  function zeige() {
    jahre.forEach(function (s) {
      var an = Number(s.dataset.jahr) === jahr;
      s.hidden = !an;
      if (!an) return;
      var sichtbar = 0;
      Array.prototype.forEach.call(s.querySelectorAll('.ch-teil'), function (t) {
        t.hidden = art !== 'alle' && t.dataset.art !== art;
        if (!t.hidden) sichtbar++;
      });
      var leer = s.querySelector('.ch-leer');
      if (!sichtbar && !leer) {
        leer = document.createElement('p');
        leer.className = 'ch-leer';
        s.appendChild(leer);
      }
      if (leer) {
        leer.hidden = sichtbar > 0;
        leer.textContent = 'Für ' + jahr + ' gibt es hier keine Einträge.';
      }
    });
    knoepfe.forEach(function (b) {
      var an = Number(b.dataset.jahr) === jahr;
      b.classList.toggle('aktiv', an);
      b.setAttribute('aria-pressed', an ? 'true' : 'false');
    });
    filter.forEach(function (b) {
      var an = b.dataset.art === art;
      b.classList.toggle('aktiv', an);
      b.setAttribute('aria-pressed', an ? 'true' : 'false');
    });
    titel.textContent = 'Chronik ' + jahr;
    if (location.hash !== '#' + jahr) history.replaceState(null, '', '#' + jahr);
  }

  function waehle(j) {
    var gibt = knoepfe.some(function (b) { return Number(b.dataset.jahr) === j; });
    jahr = gibt ? j : Number(knoepfe[0].dataset.jahr);
    zeige();
  }

  document.getElementById('chJahre').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    waehle(Number(b.dataset.jahr));
    // nach oben, damit „Chronik JJJJ" unter dem festen Menü sichtbar ist
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  filter.forEach(function (b) {
    b.addEventListener('click', function () { art = b.dataset.art; zeige(); });
  });
  window.addEventListener('hashchange', function () { waehle(Number(location.hash.slice(1))); });

  waehle(Number(location.hash.slice(1)));
})();
