// Monatssieger und Clubmeister aus der Redaktion (Firebase) ergänzen:
//  - Seite „Monatssieger": Kacheln (window.msNeuZeichnen)
//  - Seite „Mitglieder": Monatssiege und Clubmeister in den Steckbriefen (window.mgNeuZeichnen)
//  - Seite „Vereinsgeschichte": neue Zeile in der Clubmeister-Liste (p.cm-zeile[data-jahr])
// Feste Einträge (monatssieger-daten.js, clubmeister-daten.js, vereinsgeschichte.html) haben Vorrang;
// dorthin schreibt _werkzeug/beitraege_uebernehmen.py die Firebase-Einträge 3–4× im Jahr.
import { FIREBASE_KONFIG, SDK, esc } from './beitraege-gemeinsam.js';

function pkt(n) { return Number(n || 0).toLocaleString('de-DE'); }

// Zeile wie in der Vereinsgeschichte: „2026 Kurt Langer 31.357 Pkt., Frank Bertram 29.549 Pkt., …"
export function clubmeisterZeile(jahr, platz) {
  return jahr + ' ' + platz.map(function (p) { return p.name + ' ' + pkt(p.punkte) + ' Pkt.'; }).join(', ');
}

function inVereinsgeschichte(jahr, platz) {
  const zeilen = Array.from(document.querySelectorAll('p.cm-zeile[data-jahr]'));
  if (!zeilen.length || zeilen.some(function (z) { return Number(z.dataset.jahr) === jahr; })) return;
  const p = document.createElement('p');
  p.className = 'cm-zeile';
  p.dataset.jahr = jahr;
  p.innerHTML = '<strong>' + esc(clubmeisterZeile(jahr, platz)) + '</strong>';
  const spaeter = zeilen.find(function (z) { return Number(z.dataset.jahr) > jahr; });
  if (spaeter) spaeter.before(p); else zeilen[zeilen.length - 1].after(p);
}

async function start() {
  const MS = window.MONATSSIEGER = window.MONATSSIEGER || {};
  const CM = window.CLUBMEISTER = window.CLUBMEISTER || {};
  const [{ initializeApp }, fs] = await Promise.all([
    import(SDK + 'firebase-app.js'),
    import(SDK + 'firebase-firestore-lite.js')
  ]);
  const db = fs.getFirestore(initializeApp(FIREBASE_KONFIG));
  const snap = await fs.getDocs(fs.query(fs.collection(db, 'homepage_beitraege'), fs.where('seite', '==', 'int-spielbetrieb')));
  const neu = [];
  snap.docs.forEach(function (d) {
    const b = d.data(), ms = b.monatssieger;
    if (!ms || !ms.jahr || !ms.monat || !(ms.platz || []).length) return;
    const jahr = Number(ms.jahr), monat = Number(ms.monat);
    if (monat === 12) {
      if (!CM[jahr]) CM[jahr] = ms.platz.map(function (p) { return p.name; });
      inVereinsgeschichte(jahr, ms.platz);
    }
    MS[jahr] = MS[jahr] || {};
    if (MS[jahr][monat]) return; // fest eingetragen
    const e = { platz: ms.platz.map(function (p) { return [p.name, Number(p.punkte) || 0]; }) };
    if (ms.hinweis) e.hinweis = ms.hinweis;
    if (monat === 12) e.clubmeister = true;
    MS[jahr][monat] = e;
    neu.push({ e: e, bild: (b.bilder || [])[0] });
  });
  if (window.mgNeuZeichnen) window.mgNeuZeichnen();
  if (!neu.length || !window.msNeuZeichnen) return;
  window.msNeuZeichnen();
  // Fotos für die Kacheln nachladen (erstes Foto des Beitrags)
  await Promise.all(neu.filter(function (n) { return n.bild; }).map(async function (n) {
    try {
      const d = await fs.getDoc(fs.doc(db, 'homepage_bilder', n.bild));
      if (!d.exists()) return;
      const x = d.data();
      n.e.bild = URL.createObjectURL(new Blob([x.daten.toUint8Array()], { type: x.typ || 'image/jpeg' }));
    } catch (err) { console.warn('Foto nicht geladen', err); }
  }));
  window.msNeuZeichnen();
}

start().catch(function (err) { console.warn('Monatssieger aus Firebase nicht geladen:', err); });
