// Zeigt Beiträge aus Firebase (homepage_beitraege) auf der aktuellen Seite an,
// einsortiert nach Datum unter der passenden Jahresüberschrift; in der Chronik im passenden Jahr.
// Beiträge, die schon fest in der Seite stehen (<article id="b-…">, übernommen mit
// _werkzeug/beitraege_uebernehmen.py), werden nicht doppelt angezeigt.
import { FIREBASE_KONFIG, SDK, SEITEN, beitragHtml } from './beitraege-gemeinsam.js';

const seite = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
const istChronik = seite === 'chronik';
const JAHR = /^(19|20)\d\d$/;

function jahrVon(b) { return Number(String(b.datum).slice(0, 4)); }
function neuesteZuerst(a, b) { return a.datum < b.datum ? 1 : a.datum > b.datum ? -1 : 0; }
function element(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }

// ---------- Einfügen auf den normalen Seiten ----------
function jahresKoepfe(sec) {
  return Array.from(sec.querySelectorAll(':scope > .text')).filter(function (d) {
    const h = d.querySelector(':scope > h1');
    return h && JAHR.test(h.textContent.trim());
  }).map(function (d) { return { el: d, jahr: Number(d.querySelector('h1').textContent.trim()) }; });
}

function kopfFuerJahr(sec, jahr) {
  const koepfe = jahresKoepfe(sec);
  const da = koepfe.find(function (k) { return k.jahr === jahr; });
  if (da) return da.el;
  const neu = element('<div class="text"><h1><strong>' + jahr + '</strong></h1></div>');
  const spaeter = koepfe.find(function (k) { return k.jahr < jahr; });
  if (spaeter) sec.insertBefore(neu, spaeter.el); else sec.appendChild(neu);
  return neu;
}

// hinter dem Jahreskopf bzw. am Seitenanfang einfügen, innerhalb des Jahres neueste zuerst
function einfuegenNach(anker, parent, b) {
  const el = element(beitragHtml(b));
  let vor = anker ? anker.nextElementSibling : parent.firstElementChild;
  while (vor && vor.classList.contains('beitrag') && vor.dataset.datum >= b.datum) vor = vor.nextElementSibling;
  parent.insertBefore(el, vor);
  return el;
}

function zeigeAufSeite(liste) {
  const sec = document.querySelector('main section');
  if (!sec) return;
  const mitJahren = SEITEN[seite] && SEITEN[seite].jahre;
  liste.forEach(function (b) {
    einfuegenNach(mitJahren ? kopfFuerJahr(sec, jahrVon(b)) : null, sec, b);
  });
}

// ---------- Einfügen in der Chronik ----------
function zeigeInChronik(liste) {
  const inhalt = document.querySelector('.ch-inhalt');
  const leiste = document.getElementById('chJahre');
  if (!inhalt || !leiste) return;
  liste.forEach(function (b) {
    const art = SEITEN[b.seite] && SEITEN[b.seite].chronik;
    if (!art) return;
    const jahr = jahrVon(b);
    let sec = inhalt.querySelector('.ch-jahr[data-jahr="' + jahr + '"]');
    if (!sec) {
      sec = element('<section class="ch-jahr" id="j' + jahr + '" data-jahr="' + jahr + '" hidden><h2 class="ch-titel">' + jahr + '</h2></section>');
      const spaeter = Array.from(inhalt.querySelectorAll('.ch-jahr')).find(function (s) { return Number(s.dataset.jahr) < jahr; });
      inhalt.insertBefore(sec, spaeter || null);
      const knopf = element('<button type="button" data-jahr="' + jahr + '">' + jahr + '</button>');
      const kSpaeter = Array.from(leiste.querySelectorAll('button')).find(function (k) { return Number(k.dataset.jahr) < jahr; });
      leiste.insertBefore(knopf, kSpaeter || null);
    }
    let teil = sec.querySelector('.ch-teil[data-art="' + art + '"]');
    if (!teil) {
      teil = element('<div class="ch-teil" data-art="' + art + '"><h3 class="ch-art">' +
        (art === 'intern' ? 'Club intern' : 'Verbandsspielbetrieb') + '</h3></div>');
      // „Club intern" vor „Verband"
      const verband = art === 'intern' ? sec.querySelector('.ch-teil[data-art="verband"]') : null;
      sec.insertBefore(teil, verband || sec.querySelector('.ch-leer'));
    }
    einfuegenNach(teil.querySelector('.ch-art'), teil, b);
  });
  document.dispatchEvent(new Event('beitraege-geladen'));
}

// ---------- Fotos nachladen, wenn sie in die Nähe des Bildschirms kommen ----------
let holeBild = null;
const beobachter = 'IntersectionObserver' in window
  ? new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (!e.isIntersecting) return;
        beobachter.unobserve(e.target);
        ladeBild(e.target);
      });
    }, { rootMargin: '600px' })
  : null;

async function ladeBild(fig) {
  try {
    const url = await holeBild(fig.dataset.bild);
    if (!url) { fig.remove(); return; }
    fig.innerHTML = '<a class="lightbox" href="' + url + '"><img alt="" src="' + url + '"></a>';
  } catch (err) {
    console.warn('Foto nicht geladen', fig.dataset.bild, err);
    fig.innerHTML = '<span class="beitrag-laedt">Foto konnte nicht geladen werden.</span>';
  }
}

export function bilderBeobachten(wurzel, holen) {
  holeBild = holen;
  wurzel.querySelectorAll('figure[data-bild]').forEach(function (f) {
    if (beobachter) beobachter.observe(f); else ladeBild(f);
  });
}

// ---------- Laden ----------
export function zeigeBeitraege(liste) {
  const neu = liste
    .filter(function (b) { return b.datum && !document.getElementById('b-' + b.id); })
    .sort(neuesteZuerst)
    .reverse(); // älteste zuerst einfügen; einfuegenNach sortiert jeden an die richtige Stelle
  if (istChronik) zeigeInChronik(neu); else zeigeAufSeite(neu);
}

async function start() {
  const relevant = istChronik
    ? Object.keys(SEITEN).filter(function (s) { return SEITEN[s].chronik; })
    : (SEITEN[seite] ? [seite] : []);
  if (!relevant.length) return;
  const [{ initializeApp }, fs] = await Promise.all([
    import(SDK + 'firebase-app.js'),
    import(SDK + 'firebase-firestore-lite.js')
  ]);
  const db = fs.getFirestore(initializeApp(FIREBASE_KONFIG));
  const snap = await fs.getDocs(fs.query(fs.collection(db, 'homepage_beitraege'), fs.where('seite', 'in', relevant)));
  const liste = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
  zeigeBeitraege(liste);
  bilderBeobachten(document, async function (id) {
    const d = await fs.getDoc(fs.doc(db, 'homepage_bilder', id));
    if (!d.exists()) return null;
    const x = d.data();
    return URL.createObjectURL(new Blob([x.daten.toUint8Array()], { type: x.typ || 'image/jpeg' }));
  });
  // Sprungziel „seite.html#b-ID" (Link aus der Redaktion)
  if (!istChronik && /^#b-/.test(location.hash)) {
    const ziel = document.getElementById(location.hash.slice(1));
    if (ziel) ziel.scrollIntoView({ block: 'start' });
  }
}

start().catch(function (err) { console.warn('Beiträge aus Firebase nicht geladen:', err); });
