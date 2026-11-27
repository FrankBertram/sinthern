// Monatssieger aus der Redaktion (Firebase) auf der Seite „Monatssieger" ergänzen.
// Feste Einträge in monatssieger-daten.js haben Vorrang
// (dorthin schreibt _werkzeug/beitraege_uebernehmen.py die Firebase-Einträge 3–4× im Jahr).
import { FIREBASE_KONFIG, SDK } from './beitraege-gemeinsam.js';

async function start() {
  const DATEN = window.MONATSSIEGER = window.MONATSSIEGER || {};
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
    DATEN[jahr] = DATEN[jahr] || {};
    if (DATEN[jahr][monat]) return; // fest eingetragen
    const e = { platz: ms.platz.map(function (p) { return [p.name, Number(p.punkte) || 0]; }) };
    if (ms.hinweis) e.hinweis = ms.hinweis;
    if (monat === 12) e.clubmeister = true;
    DATEN[jahr][monat] = e;
    neu.push({ e: e, bild: (b.bilder || [])[0] });
  });
  if (!neu.length) return;
  if (window.msNeuZeichnen) window.msNeuZeichnen();
  // Fotos nachladen (erstes Foto des Beitrags)
  await Promise.all(neu.filter(function (n) { return n.bild; }).map(async function (n) {
    try {
      const d = await fs.getDoc(fs.doc(db, 'homepage_bilder', n.bild));
      if (!d.exists()) return;
      const x = d.data();
      n.e.bild = URL.createObjectURL(new Blob([x.daten.toUint8Array()], { type: x.typ || 'image/jpeg' }));
    } catch (err) { console.warn('Foto nicht geladen', err); }
  }));
  if (window.msNeuZeichnen) window.msNeuZeichnen();
}

start().catch(function (err) { console.warn('Monatssieger aus Firebase nicht geladen:', err); });
