// Redaktion: Beiträge mit Datum, Text und Fotos anlegen, ändern, löschen (Firebase).
// Schreiben dürfen der Admin und Redakteure (homepage_redakteure/{uid}), siehe firestore.rules.
import { FIREBASE_KONFIG, SDK, SEITEN, beitragHtml, datumDeutsch, esc } from './beitraege-gemeinsam.js';

const [{ initializeApp }, fs, au] = await Promise.all([
  import(SDK + 'firebase-app.js'),
  import(SDK + 'firebase-firestore.js'),
  import(SDK + 'firebase-auth.js')
]);
const app = initializeApp(FIREBASE_KONFIG);
const db = fs.getFirestore(app);
const auth = au.getAuth(app);

const ADMIN_UID = 'ERwEUD2Dsddsij05p32oCb6EGs53';
const ADMIN_EMAIL = 'frank.bertram@koeln.de';
const MAX_BYTES = 700 * 1024;   // ein Firestore-Dokument darf höchstens 1 MB groß sein
const MAX_FOTOS = 6;

const $ = function (id) { return document.getElementById(id); };
let nutzer = null;
let bearbeiteId = null;     // null = neuer Beitrag
let fotos = [];             // { id?: vorhandenes Bild, blob?: neues Bild, url }
let entfernt = [];          // Bild-IDs, die beim Speichern gelöscht werden
let beitraege = [];
let fest = new Set();        // schon fest in den HTML-Seiten (daten/uebernommen.json)

async function ladeUebernommen() {
  try {
    const r = await fetch('daten/uebernommen.json', { cache: 'no-store' });
    if (r.ok) fest = new Set((await r.json()).ids || []);
  } catch (e) { /* noch nie übernommen */ }
}

// ---------- Anmeldung ----------
function zeigeBereich(name) {
  ['redAnmelden', 'redGesperrt', 'redArbeit'].forEach(function (id) { $(id).hidden = id !== name; });
}

au.onAuthStateChanged(auth, async function (u) {
  nutzer = u;
  $('redNutzer').textContent = u ? (u.displayName || u.email || '') : '';
  $('redAbmelden').hidden = !u;
  if (!u) { zeigeBereich('redAnmelden'); return; }
  let darf = u.uid === ADMIN_UID;
  if (!darf) {
    try { darf = (await fs.getDoc(fs.doc(db, 'homepage_redakteure', u.uid))).exists(); }
    catch (err) { console.warn(err); }
  }
  if (!darf) {
    $('redUid').textContent = u.uid;
    zeigeBereich('redGesperrt');
    return;
  }
  zeigeBereich('redArbeit');
  $('redAdmin').hidden = u.uid !== ADMIN_UID;
  neuerBeitrag();
  ladeListe();
  if (u.uid === ADMIN_UID) ladeRedakteure();
});

$('redGoogle').addEventListener('click', async function () {
  try { await au.signInWithPopup(auth, new au.GoogleAuthProvider()); }
  catch (err) { meldung('Anmeldung nicht möglich: ' + err.message, true); }
});
$('redAbmelden').addEventListener('click', function () { au.signOut(auth); });
$('redFreischaltung').addEventListener('click', function () {
  const u = nutzer;
  const text = 'Hallo Frank,\n\nbitte schalte mich für die Redaktion der Homepage frei.\n\n' +
    'Name: ' + (u.displayName || '') + '\nE-Mail: ' + (u.email || '') + '\nUID: ' + u.uid + '\n';
  location.href = 'mailto:' + ADMIN_EMAIL + '?subject=' + encodeURIComponent('Freischaltung Homepage-Redaktion') +
    '&body=' + encodeURIComponent(text);
});

// ---------- Formular ----------
const seiteWahl = $('redSeite');
seiteWahl.innerHTML = '<option value="monatssieger">Monatssieger (Kachel und Int_Spielbetrieb)</option>' +
  Object.keys(SEITEN).map(function (s) {
    return '<option value="' + s + '">' + esc(SEITEN[s].name) + '</option>';
  }).join('');
seiteWahl.value = 'int-spielbetrieb';

// ---------- Monatssieger: feste Felder statt Überschrift ----------
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August',
  'September', 'Oktober', 'November', 'Dezember'];
$('redMsMonat').innerHTML = MONATE.map(function (m, i) {
  return '<option value="' + (i + 1) + '">' + (i === 11 ? 'Dezember (Clubmeister)' : m) + '</option>';
}).join('');
$('redNamen').innerHTML = (window.MITGLIEDER || []).map(function (m) {
  return '<option value="' + esc(m.vorname + ' ' + m.name) + '">';
}).join('');
function istMs() { return seiteWahl.value === 'monatssieger'; }
function msModus() {
  $('redMsFelder').hidden = !istMs();
  $('redTitelFeld').hidden = istMs();
  $('redTextLabel').textContent = istMs() ? 'Zusätzlicher Text (optional)' : 'Text';
}
// Monat/Jahr folgen dem Datum, bis sie von Hand geändert werden
let msHand = false;
function msAusDatum() {
  if (msHand) return;
  const d = $('redDatum').value;
  if (/^\d{4}-\d{2}/.test(d)) { $('redMsJahr').value = d.slice(0, 4); $('redMsMonat').value = String(Number(d.slice(5, 7))); }
}
seiteWahl.addEventListener('change', msModus);
$('redDatum').addEventListener('change', msAusDatum);
$('redMsMonat').addEventListener('change', function () { msHand = true; });
$('redMsJahr').addEventListener('change', function () { msHand = true; });
function msLeeren() {
  msHand = false;
  for (let i = 1; i <= 3; i++) { $('redMsName' + i).value = ''; $('redMsPkt' + i).value = ''; }
  $('redMsHinweis').value = '';
  msAusDatum();
}
function msFuellen(ms) {
  msHand = true;
  $('redMsJahr').value = ms.jahr;
  $('redMsMonat').value = String(ms.monat);
  for (let i = 1; i <= 3; i++) {
    const p = (ms.platz || [])[i - 1] || {};
    $('redMsName' + i).value = p.name || '';
    $('redMsPkt' + i).value = p.punkte || '';
  }
  $('redMsHinweis').value = ms.hinweis || '';
}
// alter Beitrag ohne feste Felder: „Monatssieger Januar 2027 …" + „Platz 1 Name 4210 Pkt." erkennen
function msAusText(b) {
  const m = /^Monatssieger\s+(\S+)\s+(\d{4})/i.exec(b.titel || '');
  if (!m) return null;
  const monat = MONATE.findIndex(function (x) { return x.toLowerCase() === m[1].toLowerCase(); }) + 1;
  if (!monat) return null;
  const platz = [];
  const re = /Platz\s*(\d)\.?\s+(.+?)\s+(\d[\d.]*)\s*Pkt/gi;
  let z;
  while ((z = re.exec(b.text || ''))) platz[Number(z[1]) - 1] = { name: z[2].trim(), punkte: Number(z[3].replace(/\./g, '')) };
  if (!platz[0]) return null;
  return { jahr: Number(m[2]), monat: monat, platz: platz.filter(Boolean) };
}

function heute() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

$('redDatum').value = heute();

function meldung(text, fehler) {
  const m = $('redMeldung');
  m.textContent = text;
  m.className = 'red-meldung' + (fehler ? ' fehler' : '');
  m.hidden = !text;
}

function neuerBeitrag() {
  bearbeiteId = null;
  fotos.forEach(function (f) { if (f.blob) URL.revokeObjectURL(f.url); });
  fotos = []; entfernt = [];
  $('redDatum').value = heute();
  $('redTitel').value = '';
  $('redText').value = '';
  msLeeren();
  msModus();
  $('redFormTitel').textContent = 'Neuer Beitrag';
  $('redNeu').hidden = true;
  $('redVorschau').innerHTML = '';
  zeigeFotos();
}
$('redNeu').addEventListener('click', function () { neuerBeitrag(); meldung(''); });

function zeigeFotos() {
  $('redFotos').innerHTML = fotos.map(function (f, i) {
    return '<div class="red-foto"><img src="' + f.url + '" alt=""><button type="button" data-weg="' + i +
      '" aria-label="Foto entfernen">✕ entfernen</button></div>';
  }).join('');
  $('redFotoWahl').disabled = fotos.length >= MAX_FOTOS;
}
$('redFotos').addEventListener('click', function (e) {
  const b = e.target.closest('button[data-weg]');
  if (!b) return;
  const f = fotos.splice(Number(b.dataset.weg), 1)[0];
  if (f.id) entfernt.push(f.id); else URL.revokeObjectURL(f.url);
  zeigeFotos();
});

// Foto verkleinern (max. 1600 px, JPEG), bis es unter MAX_BYTES liegt
async function verkleinere(datei) {
  let quelle;
  try { quelle = await createImageBitmap(datei, { imageOrientation: 'from-image' }); }
  catch (e) {
    quelle = await new Promise(function (ok, fehl) {
      const i = new Image();
      i.onload = function () { ok(i); };
      i.onerror = function () { fehl(new Error('Bild kann nicht gelesen werden')); };
      i.src = URL.createObjectURL(datei);
    });
  }
  let max = 1600, q = 0.85, blob = null;
  for (let n = 0; n < 10; n++) {
    const f = Math.min(1, max / Math.max(quelle.width, quelle.height));
    const c = document.createElement('canvas');
    c.width = Math.round(quelle.width * f);
    c.height = Math.round(quelle.height * f);
    const g = c.getContext('2d');
    g.fillStyle = '#fff';
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(quelle, 0, 0, c.width, c.height);
    blob = await new Promise(function (ok) { c.toBlob(ok, 'image/jpeg', q); });
    if (blob.size <= MAX_BYTES) return blob;
    if (q > 0.65) q -= 0.1; else max = Math.round(max * 0.8);
  }
  throw new Error('Foto ist zu groß');
}

$('redFotoWahl').addEventListener('click', function () { $('redFotoDatei').click(); });
$('redFotoDatei').addEventListener('change', async function (e) {
  const dateien = Array.from(e.target.files || []);
  e.target.value = '';
  for (const d of dateien) {
    if (fotos.length >= MAX_FOTOS) { meldung('Höchstens ' + MAX_FOTOS + ' Fotos pro Beitrag.', true); break; }
    try {
      meldung('Foto wird vorbereitet …');
      const blob = await verkleinere(d);
      fotos.push({ blob: blob, url: URL.createObjectURL(blob) });
      meldung('');
    } catch (err) { meldung('„' + d.name + '" konnte nicht verwendet werden: ' + err.message, true); }
  }
  zeigeFotos();
});

function formularDaten() {
  const b = {
    seite: seiteWahl.value,
    datum: $('redDatum').value,
    titel: $('redTitel').value.trim(),
    text: $('redText').value.trim()
  };
  if (!istMs()) return b;
  // Monatssieger: Überschrift und Platzierungen werden aus den Feldern erzeugt
  const jahr = Number($('redMsJahr').value), monat = Number($('redMsMonat').value);
  const platz = [];
  for (let i = 1; i <= 3; i++) {
    const name = $('redMsName' + i).value.trim(), punkte = Number($('redMsPkt' + i).value);
    if (name) platz.push({ name: name, punkte: punkte || 0 });
  }
  const zusatz = b.text;
  b.seite = 'int-spielbetrieb';
  b.monatssieger = { jahr: jahr, monat: monat, platz: platz, hinweis: $('redMsHinweis').value.trim(), zusatz: zusatz };
  b.titel = (monat === 12 ? 'Clubmeister ' + jahr : 'Monatssieger ' + MONATE[monat - 1] + ' ' + jahr) +
    (platz[0] ? ' ' + platz[0].name : '');
  b.text = platz.map(function (p, i) {
    return 'Platz ' + (i + 1) + ' ' + p.name + ' ' + p.punkte.toLocaleString('de-DE') + ' Pkt.';
  }).join('\n') + (b.monatssieger.hinweis ? '\n(' + b.monatssieger.hinweis + ')' : '') + (zusatz ? '\n\n' + zusatz : '');
  return b;
}

function pruefe(b) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.datum)) return 'Bitte ein Datum eingeben.';
  if (b.monatssieger) {
    const ms = b.monatssieger;
    if (!(ms.jahr >= 1992 && ms.jahr <= 2100)) return 'Bitte das Jahr eingeben.';
    if (!ms.platz.length || !ms.platz[0].punkte) return 'Bitte mindestens Platz 1 mit Name und Punkten eingeben.';
    return '';
  }
  if (!b.titel && !b.text && !fotos.length) return 'Bitte Überschrift, Text oder ein Foto eingeben.';
  return '';
}

$('redVorschauKnopf').addEventListener('click', function () {
  const b = formularDaten();
  b.bilder = fotos.map(function (f, i) { return 'v' + i; });
  const v = $('redVorschau');
  v.innerHTML = '<h2>Vorschau</h2>' + beitragHtml(b);
  v.querySelectorAll('figure[data-bild]').forEach(function (fig, i) {
    fig.innerHTML = '<img alt="" src="' + fotos[i].url + '">';
  });
  v.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

$('redSpeichern').addEventListener('click', async function () {
  const b = formularDaten();
  const fehler = pruefe(b);
  if (fehler) { meldung(fehler, true); return; }
  const knopf = $('redSpeichern');
  knopf.disabled = true;
  meldung('Wird veröffentlicht …');
  try {
    const ref = bearbeiteId ? fs.doc(db, 'homepage_beitraege', bearbeiteId) : fs.doc(fs.collection(db, 'homepage_beitraege'));
    const ids = [];
    for (const f of fotos) {
      if (f.id) { ids.push(f.id); continue; }
      const bref = fs.doc(fs.collection(db, 'homepage_bilder'));
      await fs.setDoc(bref, {
        daten: fs.Bytes.fromUint8Array(new Uint8Array(await f.blob.arrayBuffer())),
        typ: 'image/jpeg', beitrag: ref.id, vereinId: 'sinthern', hochgeladen: fs.serverTimestamp()
      });
      f.id = bref.id;
      ids.push(bref.id);
    }
    const daten = Object.assign(b, {
      bilder: ids, vereinId: 'sinthern', uid: nutzer.uid,
      autor: nutzer.displayName || nutzer.email || '', geaendert: fs.serverTimestamp()
    });
    if (!bearbeiteId) daten.erstellt = fs.serverTimestamp();
    else if (!daten.monatssieger) daten.monatssieger = fs.deleteField();
    await fs.setDoc(ref, daten, { merge: true });
    for (const id of entfernt) await fs.deleteDoc(fs.doc(db, 'homepage_bilder', id)).catch(console.warn);
    const link = b.monatssieger ? 'monatssieger.html#' + b.monatssieger.jahr : b.seite + '.html#b-' + ref.id;
    neuerBeitrag();
    meldung('');
    $('redMeldung').hidden = false;
    $('redMeldung').className = 'red-meldung ok';
    $('redMeldung').innerHTML = '✔ Veröffentlicht. <a href="' + link + '" target="_blank">Auf der Seite ansehen</a>';
    ladeListe();
  } catch (err) {
    console.error(err);
    meldung('Speichern nicht möglich: ' + err.message, true);
  } finally {
    knopf.disabled = false;
  }
});

// ---------- Liste der Beiträge ----------
async function ladeListe() {
  const ziel = $('redListe');
  await ladeUebernommen();
  try {
    const snap = await fs.getDocs(fs.collection(db, 'homepage_beitraege'));
    beitraege = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); })
      .sort(function (a, b) { return a.datum < b.datum ? 1 : a.datum > b.datum ? -1 : 0; });
  } catch (err) {
    ziel.innerHTML = '<p class="red-meldung fehler">Liste nicht lesbar: ' + esc(err.message) + '</p>';
    return;
  }
  if (!beitraege.length) { ziel.innerHTML = '<p>Noch keine Beiträge.</p>'; return; }
  ziel.innerHTML = '<table class="red-tabelle"><thead><tr><th>Datum</th><th>Seite</th><th>Überschrift</th><th></th></tr></thead><tbody>' +
    beitraege.map(function (b) {
      return '<tr><td>' + esc(datumDeutsch(b.datum)) + '</td><td>' + esc(b.monatssieger ? 'Monatssieger' : ((SEITEN[b.seite] || {}).name || b.seite)) +
        '</td><td>' + esc(b.titel || (b.text || '').slice(0, 60)) + (b.bilder && b.bilder.length ? ' 📷' + b.bilder.length : '') +
        (fest.has(b.id) ? '<br><small>fest auf der Homepage – Änderungen hier wirken nicht mehr</small>' : '') +
        '</td><td class="red-aktionen"><a href="' + esc(b.seite) + '.html#b-' + esc(b.id) + '" target="_blank">Ansehen</a>' +
        (fest.has(b.id) ? '' : '<button type="button" data-bearbeiten="' + esc(b.id) + '">Ändern</button>') +
        '<button type="button" class="red-loeschen" data-loeschen="' + esc(b.id) + '">Löschen</button></td></tr>';
    }).join('') + '</tbody></table>';
  const anzahl = beitraege.filter(function (b) { return fest.has(b.id); }).length;
  $('redAufraeumen').hidden = !anzahl || !nutzer || nutzer.uid !== ADMIN_UID;
  $('redAufraeumen').textContent = 'Übernommene in Firebase löschen (' + anzahl + ')';
}

// Admin: Beiträge, die fest in den Seiten stehen, aus Firebase entfernen
$('redAufraeumen').addEventListener('click', async function () {
  const weg = beitraege.filter(function (b) { return fest.has(b.id); });
  if (!weg.length || !confirm(weg.length + ' Beiträge stehen fest auf der Homepage.\nAus Firebase löschen (samt Fotos)?')) return;
  for (const b of weg) {
    for (const id of b.bilder || []) await fs.deleteDoc(fs.doc(db, 'homepage_bilder', id)).catch(console.warn);
    await fs.deleteDoc(fs.doc(db, 'homepage_beitraege', b.id)).catch(console.warn);
  }
  meldung(weg.length + ' übernommene Beiträge aus Firebase gelöscht.');
  ladeListe();
});

$('redListe').addEventListener('click', async function (e) {
  const bb = e.target.closest('button[data-bearbeiten]');
  const bl = e.target.closest('button[data-loeschen]');
  if (bb) {
    const b = beitraege.find(function (x) { return x.id === bb.dataset.bearbeiten; });
    if (!b) return;
    neuerBeitrag();
    bearbeiteId = b.id;
    seiteWahl.value = b.seite;
    const ms = b.monatssieger || msAusText(b);
    $('redDatum').value = b.datum;
    $('redTitel').value = b.titel || '';
    $('redText').value = b.text || '';
    if (ms) {
      seiteWahl.value = 'monatssieger';
      msFuellen(ms);
      // eigene Felder: nur der Zusatztext bleibt im Textfeld (bei erkannten alten Beiträgen leer)
      $('redText').value = b.monatssieger ? (b.monatssieger.zusatz || '') : '';
    }
    msModus();
    $('redFormTitel').textContent = 'Beitrag ändern';
    $('redNeu').hidden = false;
    $('redFormular').scrollIntoView({ behavior: 'smooth', block: 'start' });
    meldung('Fotos werden geladen …');
    for (const id of b.bilder || []) {
      try {
        const d = await fs.getDoc(fs.doc(db, 'homepage_bilder', id));
        if (!d.exists()) continue;
        const blob = new Blob([d.data().daten.toUint8Array()], { type: 'image/jpeg' });
        fotos.push({ id: id, url: URL.createObjectURL(blob) });
      } catch (err) { console.warn(err); }
    }
    meldung('');
    zeigeFotos();
  }
  if (bl) {
    const b = beitraege.find(function (x) { return x.id === bl.dataset.loeschen; });
    if (!b) return;
    if (!confirm('Beitrag vom ' + datumDeutsch(b.datum) + ' „' + (b.titel || '') + '" wirklich löschen?\nDas kann nicht rückgängig gemacht werden.')) return;
    try {
      for (const id of b.bilder || []) await fs.deleteDoc(fs.doc(db, 'homepage_bilder', id)).catch(console.warn);
      await fs.deleteDoc(fs.doc(db, 'homepage_beitraege', b.id));
      if (bearbeiteId === b.id) neuerBeitrag();
      meldung('Beitrag gelöscht.');
      ladeListe();
    } catch (err) { meldung('Löschen nicht möglich: ' + err.message, true); }
  }
});

// ---------- Redakteure verwalten (nur Admin) ----------
async function ladeRedakteure() {
  const ziel = $('redRedakteure');
  try {
    const snap = await fs.getDocs(fs.collection(db, 'homepage_redakteure'));
    ziel.innerHTML = snap.empty ? '<li>Noch niemand freigeschaltet.</li>' : snap.docs.map(function (d) {
      return '<li>' + esc(d.data().name || '') + ' <small>(' + esc(d.id) + ')</small> ' +
        '<button type="button" class="red-loeschen" data-entziehen="' + esc(d.id) + '">entfernen</button></li>';
    }).join('');
  } catch (err) { ziel.innerHTML = '<li class="fehler">' + esc(err.message) + '</li>'; }
}
$('redRedakteure').addEventListener('click', async function (e) {
  const b = e.target.closest('button[data-entziehen]');
  if (!b || !confirm('Freischaltung entfernen?')) return;
  await fs.deleteDoc(fs.doc(db, 'homepage_redakteure', b.dataset.entziehen)).catch(function (err) { alert(err.message); });
  ladeRedakteure();
});
$('redRedakteurNeu').addEventListener('submit', async function (e) {
  e.preventDefault();
  const uid = $('redNeuUid').value.trim(), name = $('redNeuName').value.trim();
  if (!uid || !name) return;
  try {
    await fs.setDoc(fs.doc(db, 'homepage_redakteure', uid), { name: name, vereinId: 'sinthern', seit: fs.serverTimestamp() });
    e.target.reset();
    ladeRedakteure();
  } catch (err) { alert('Nicht gespeichert: ' + err.message); }
});
