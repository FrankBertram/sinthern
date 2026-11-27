// Gemeinsames für Beiträge aus Firebase (Anzeige auf den Seiten und redaktion.html)
export const FIREBASE_KONFIG = {
  apiKey: 'AIzaSyDmiQvDu0pxQYoidaZfRVY0BXZjLOHhw7w',
  authDomain: 'skatverein-b77ef.firebaseapp.com',
  projectId: 'skatverein-b77ef',
  storageBucket: 'skatverein-b77ef.firebasestorage.app',
  messagingSenderId: '763387283518',
  appId: '1:763387283518:web:9edf27d79876cf2059296f'
};
export const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';

// Seiten, auf denen Beiträge erscheinen können (Schlüssel = Dateiname ohne .html)
// jahre: Seite ist nach Jahresüberschriften gegliedert; chronik: erscheint auch in der Chronik
export const SEITEN = {
  'int-spielbetrieb':  { name: 'Int_Spielbetrieb (Club intern)', jahre: true, chronik: 'intern' },
  'verb-spielbetrieb': { name: 'Verb_Spielbetrieb (Verband)', jahre: true, chronik: 'verband' },
  'sonderturniere':    { name: 'Sonderturniere' },
  'fotos':             { name: 'Fotos' },
  'archiv':            { name: 'Archiv' }
};

export function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// '2026-11-27' → '27.11.2026'
export function datumDeutsch(iso) {
  var t = String(iso || '').split('-');
  return t.length === 3 ? t[2] + '.' + t[1] + '.' + t[0] : '';
}

// Text: Leerzeile = neuer Absatz, Zeilenumbruch bleibt erhalten, fett wie auf den alten Seiten
function absaetze(text) {
  return String(text || '').replace(/\r/g, '').split(/\n\s*\n/)
    .map(function (a) { return a.trim(); })
    .filter(Boolean)
    .map(function (a) { return '<p><strong>' + esc(a).replace(/\n/g, '<br>') + '</strong></p>'; })
    .join('');
}

// HTML eines Beitrags im Stil der bestehenden Seiten (Text links, Fotos rechts).
// Fotos als Platzhalter <figure data-bild="id">, die das Anzeigeskript nachlädt.
export function beitragHtml(b) {
  var bilder = (b.bilder || []).map(function (id) {
    return '<figure class="bild links beitrag-bild" data-bild="' + esc(id) + '"><span class="beitrag-laedt">Foto wird geladen …</span></figure>';
  }).join('');
  var text = '<div class="text">' +
    '<p class="beitrag-datum">' + esc(datumDeutsch(b.datum)) + '</p>' +
    (b.titel ? '<p class="beitrag-titel"><strong>' + esc(b.titel) + '</strong></p>' : '') +
    absaetze(b.text) + '</div>';
  var inhalt = bilder
    ? '<div class="spalten"><div class="spalte" style="--w:50%">' + text + '</div>' +
      '<div class="spalte" style="--w:50%">' + bilder + '</div></div>'
    : text;
  return '<article class="beitrag" id="b-' + esc(b.id || 'vorschau') + '" data-datum="' + esc(b.datum) + '">' + inhalt + '</article>';
}
