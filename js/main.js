// Mobiles Menü, Lightbox für Fotos, aktuelles Jahr im Fuß
(function () {
  var nav = document.querySelector('.menue');
  var burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var offen = nav.classList.toggle('offen');
      burger.setAttribute('aria-expanded', offen ? 'true' : 'false');
      burger.setAttribute('aria-label', offen ? 'Menü schließen' : 'Menü öffnen');
    });
  }

  var jahr = document.querySelector('.jahr');
  if (jahr) jahr.textContent = new Date().getFullYear();

  // Lightbox
  // Links werden beim Klick neu ermittelt, damit auch nachträglich erzeugte Bilder (Monatssieger) gehen
  var links = [];
  var lb = document.querySelector('.lb');
  if (!lb) return;
  var bild = lb.querySelector('img');
  var pos = 0;

  function zeige(i) {
    pos = (i + links.length) % links.length;
    bild.src = links[pos].getAttribute('href');
    bild.alt = links[pos].querySelector('img').alt || '';
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function zu() {
    lb.hidden = true;
    bild.removeAttribute('src');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.lightbox');
    if (!a) return;
    e.preventDefault();
    links = Array.prototype.slice.call(document.querySelectorAll('a.lightbox'));
    zeige(links.indexOf(a));
  });
  lb.querySelector('.lb-zu').addEventListener('click', zu);
  lb.querySelector('.lb-zurueck').addEventListener('click', function (e) { e.stopPropagation(); zeige(pos - 1); });
  lb.querySelector('.lb-weiter').addEventListener('click', function (e) { e.stopPropagation(); zeige(pos + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) zu(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') zu();
    else if (e.key === 'ArrowLeft') zeige(pos - 1);
    else if (e.key === 'ArrowRight') zeige(pos + 1);
  });

  // Wischen auf dem Handy
  var startX = null;
  lb.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) zeige(pos + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();
