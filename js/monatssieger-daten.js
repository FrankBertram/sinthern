// Monatssieger des 1. Sintherner Skatclubs – Daten für monatssieger.html
// Pflege: neuen Monat als Eintrag ergänzen, Foto nach bilder/ legen.
// Aufbau: jahr -> monat (1–12) -> { platz: [[Name, Punkte], ...], bild: 'bilder/…', hinweis: '…' }
// Ein Monat ohne Monatssieger: { kein: 'Begründung' }
// Dezember (12) = Clubmeister mit Jahreswertung: { clubmeister: true, platz: [...], bild: '…' }
// Neueste Monate werden zuerst angezeigt, noch offene Monate am Ende.
window.MONATSSIEGER = {
  2026: {
    1:  { platz: [['Norbert Bleckmann', 3689], ['Kai Faßbender', 3279], ['Gottfried Böllsterling', 3151]], bild: 'bilder/norbert-bleckmann-img_0296-high.jpg' },
    2:  { platz: [['Peter Schwarz', 3714], ['Frank Bertram', 3663], ['Max Kraus', 3558]], bild: 'bilder/monatssieger2-februar-2025-peter-schwarz-img_0402-high.jpg' },
    3:  { platz: [['Kai Faßbender', 3747], ['Norbert Josek', 3657], ['Kurt Langer', 3401]], bild: 'bilder/monatssieger3-m-rz-kai-fa-bender-img_0561-high.jpg' },
    4:  { platz: [['Peter Schwarz', 3954], ['Klaus Heimann', 3377], ['Bodo Holtkamp', 3352]], bild: 'bilder/monatssieger4-april-2026-peter-schwarz-img_0564-high.jpg' },
    5:  { platz: [['Peter Schwarz', 3427], ['Norbert Josek', 3269], ['Norbert Bleckmann', 3041]], bild: 'bilder/monatssieger5-2026-p-schwarz-img_0818-high.jpg' },
    6:  { platz: [['Alexander Grapatin', 5031], ['Heinz Bühl', 4706], ['Norbert Bleckmann', 4610]], bild: 'bilder/monatssieger6-alexander-grapatin-img_0891-high.jpg', hinweis: '3 Wertungstage' },
    7:  { platz: [['Norbert Bleckmann', 3318], ['Michael Hetz', 3192], ['Frank Bertram', 3167]], bild: 'bilder/monatssieger7-norbert-bleckmann-img_0893-high.jpg' },
    8:  { platz: [['Peter Schwarz', 3335], ['Norbert Josek', 3264], ['Norbert Bleckmann', 3137]], bild: 'bilder/foto-monatssieger-august-peter-schwarzimg_0958-high.jpg' },
    9:  { platz: [['Norbert Josek', 3692], ['Kurt Langer', 3637], ['Martin Mauelshagen', 3413]], bild: 'bilder/monatssieger9-sept-26-norbert-josek-img_1122-high.jpg' },
    10: { platz: [['Kai Faßbender', 3459], ['Michael Hetz', 3392], ['Frank Bertram', 3350]], bild: 'bilder/monatssieger10-oktober-26-kai-fa-bender-img_1127-high.jpg' },
    11: { platz: [['Norbert Bleckmann', 3447], ['Herbert Schekerka', 3427], ['Bodo Holtkamp', 3350]] }
  },
  2025: {
    1:  { platz: [['Heinz Bühl', 3449], ['Harry Gebhardt', 3419], ['Frank Bertram', 3284]], bild: 'bilder/monatssieger-januar-h-b-hl-img_8693-high.jpg' },
    2:  { platz: [['Kurt Langer', 3323], ['Peter Schwarz', 3251], ['Joachim Jeske', 3084]], bild: 'bilder/foto-monatssieger2-kurt-langer-februar-2025img_8810-high.jpg' },
    3:  { platz: [['Kurt Langer', 3901], ['Wilfried Puls', 3787], ['Michael Hetz', 3537]], bild: 'bilder/foto-monatssieger3-m-rz-2025-img_8862-high.jpg' },
    4:  { platz: [['Kurt Langer', 3830], ['Frank Bertram', 3351], ['Dieter Schnecke', 3167]], bild: 'bilder/foto-monatssieger-april-2025-k-langer-img_8938-high-eakad2.jpg' },
    5:  { platz: [['Dieter Schnecke', 3457], ['Peter Schwarz', 3048], ['Michael Hetz', 3040]], bild: 'bilder/foto-monatssieger-mai-2025-dieter-schnecke-img_8978-high.jpg' },
    6:  { platz: [['Klaus Heimann', 3595], ['Peter Schwarz', 3358], ['Kai Faßbender', 3107]], bild: 'bilder/img_9290-high-i0b6i9.jpg' },
    7:  { platz: [['Joachim Jeske', 4315], ['Heinz Bühl', 4289], ['Wilfried Puls', 4287]], bild: 'bilder/monatssieger-juli-2025-j-jeske-img_9563-high.jpg' },
    8:  { platz: [['Frank Bertram', 4253], ['Michael Hetz', 3388], ['Klaus Heimann', 3297]], bild: 'bilder/foto-monatssieger-august-2025-frank-bertramimg_9605-high.jpg' },
    9:  { platz: [['Wilfried Puls', 3668], ['Frank Bertram', 3528], ['Kai Faßbender', 3514]], bild: 'bilder/foto-monatssieger-september-2025-w-puls-img_9738-high.jpg' },
    10: { platz: [['Frank Bertram', 4227], ['Herbert Schekerka', 3512], ['Joachim Jeske', 3025]], bild: 'bilder/foto-monatssieger-oktober-2025-frank-bertram-img_9774-high.jpg' },
    11: { platz: [['Joachim Jeske', 3221], ['Achim Stümpges', 3196], ['Kai Faßbender', 3186]], bild: 'bilder/monatssieger-november-2025-joachim-jeske-img_9990-high.jpg' },
    12: { clubmeister: true, platz: [['Kurt Langer', 31357], ['Frank Bertram', 29549], ['Michael Hetz', 28799]], bild: 'bilder/foto-clubmeisterschaft-2025-img_0175-high.jpg', hinweis: '21 Teilnehmer' }
  },
  2024: {
    1:  { platz: [['Heinz Bühl', 3827], ['Klaus Heimann', 3686], ['Kurt Langer', 3489]], bild: 'bilder/image-high-f5yw33.png' },
    2:  { platz: [['Heinz Bühl', 3859], ['Peter Schwarz', 3199], ['Klaus Heimann', 3150]], bild: 'bilder/image-high-swvoey.png' },
    3:  { platz: [['Norbert Götte', 3949], ['Wilfried Puls', 3255], ['Klaus Heimann', 3183]], bild: 'bilder/foto-monatssieger3-m-rz-2024-img_7642-high-ny6rnt.jpg' },
    4:  { platz: [['Michael Hetz', 3349], ['Heinz Bühl', 3290], ['Peter Schwarz', 3232]], bild: 'bilder/foto-monatssieger-april-2024-img_7721-high.jpg' },
    5:  { platz: [['Klaus Heimann', 3513], ['Peter Schwarz', 3134], ['Kai Faßbender', 3009]], bild: 'bilder/foto-monatssieger-mai-2024-img_7742-high-kyoak1.jpg' },
    6:  { platz: [['Kai Faßbender', 3765], ['Manfred Hallmann', 3579], ['Heinz Grünenwald', 3236]], bild: 'bilder/foto-monatssieger-juni-2024-img_7824-high.jpg' },
    7:  { platz: [['Peter Schwarz', 5497], ['Kurt Langer', 5106], ['Norbert Götte', 4798]], bild: 'bilder/monatssieger7-juli-2024-img_8180-high.jpg' },
    8:  { platz: [['Achim Stümpges', 4114], ['Heinz Grünenwald', 3659], ['Kai Faßbender', 3036]], bild: 'bilder/monatssieger8-august-2024-img_8181-high.jpg' },
    9:  { platz: [['Kurt Langer', 3319], ['Joachim Jeske', 3201], ['Peter Schwarz', 3163]], bild: 'bilder/monatssieger9-september-2024-kurt-langer-img_8191-high.jpg' },
    10: { platz: [['Frank Kühn', 3496], ['Peter Schwarz', 3306], ['Joachim Jeske', 3239]], bild: 'bilder/foto-monatssieger-oktober-2024-e70e7af9-945b-46dc-aa62-ddfbadf5e7b6-high-phqwei.jpg' },
    11: { platz: [['Heinz Grünenwald', 3477], ['Kai Faßbender', 3401], ['Klaus Heimann', 3221]], bild: 'bilder/foto-monatssieger11-2024-heinz-gr-nenwald-img_7487-high.jpg' },
    12: { clubmeister: true, platz: [['Peter Schwarz', 30699], ['Kurt Langer', 29393], ['Heinz Bühl', 29071]], bild: 'bilder/foto-clubmeister-2024-img_8470-high-zjfgg3.jpg', hinweis: '19 Teilnehmer' }
  },
  2023: {
    1:  { platz: [['Manfred Hallmann', 2915], ['Kurt Langer', 2838], ['Bodo Holtkamp', 2836]], bild: 'bilder/fotomonatssieger1januar2023mhallmannimg_5891.jpg' },
    2:  { platz: [['Kurt Langer', 3527], ['Manfred Hallmann', 3518], ['Reinhard Ubber', 2953]], bild: 'bilder/fotomonatssieger2klangerfebruar2023img_5852.jpg' },
    3:  { platz: [['Kurt Langer', 3240], ['Heinz Grünenwald', 3069], ['Heinz Bühl', 2765]], bild: 'bilder/fotomonatssieger3klangermrz2023fotoimg_5898.jpg' },
    4:  { platz: [['Manfred Hallmann', 2914], ['Reinhard Ubber', 2892], ['Joachim Stümpges', 2887]], bild: 'bilder/fotomonatssiegerapril2023mhallmannimg_5960.jpg' },
    5:  { platz: [['Kurt Langer', 3538], ['Heinz Grünenwald', 2739], ['Frank Kühn', 2720]], bild: 'bilder/fotomonatssiegermai2023klangerimg_5980.jpg' },
    6:  { platz: [['Norbert Götte', 3296], ['Manfred Hallmann', 3056], ['Kurt Langer', 2707]], bild: 'bilder/monatssiegerjuni2023norbertgtteimg_6056.jpg' },
    7:  { platz: [['Heinz Grünenwald', 2962], ['Bodo Holtkamp', 2874], ['Joachim Stümpges', 2747]], bild: 'bilder/fotomonatssieger7juli2023img_6386.jpg' },
    8:  { platz: [['Heinz Grünenwald', 3522], ['Norbert Götte', 3508], ['Manfred Hallmann', 3405]], bild: 'bilder/fotomonatssieger8august2023heinzgrnenwaldimg_6746.jpg' },
    9:  { platz: [['Joachim Jeske', 3062], ['Frank Kühn', 3001], ['Kurt Langer', 2943]], bild: 'bilder/monatssiegerseptember2023joachimjeskeimg_6985.jpg' },
    10: { platz: [['Peter Schwarz', 3129], ['Joachim Stümpges', 2939], ['Frank Kühn', 2921]], bild: 'bilder/monatssiegeroktober2023peterschwarzimg_6806.jpg' },
    11: { platz: [['Kurt Langer', 3315], ['Manfred Hallmann', 2886], ['Reinhard Ubber', 2787]], bild: 'bilder/fotomonatssiegernovember2023img_7062.jpg' },
    12: { clubmeister: true, platz: [['Kurt Langer', 27653], ['Manfred Hallmann', 26945], ['Heinz Grünenwald', 24475]], bild: 'bilder/clubmeisterfoto2023img_7021.jpg' }
  },
  2022: {
    1:  { kein: 'Wegen der Corona-Pandemie kein Monatssieger' },
    2:  { platz: [['Heinz Grünenwald', 3009], ['Bodo Holtkamp', 2728], ['Kurt Langer', 2666]] },
    3:  { platz: [['Heinz Grünenwald', 4673], ['Kurt Langer', 4264], ['Karl-Heinz Kohl', 4119]] },
    4:  { platz: [['Joachim Stümpges', 3158], ['Kurt Langer', 3149], ['Peter Schwarz', 2928]] },
    5:  { platz: [['Karl-Heinz Kohl', 3166], ['Heinz Grünenwald', 2839], ['Kurt Langer', 2751]] },
    6:  { platz: [['Kurt Langer', 3057], ['Manfred Hallmann', 2975], ['Joachim Jeske', 2852]] },
    7:  { platz: [['Norbert Götte', 3516], ['Manfred Hallmann', 3343], ['Peter Schwarz', 2713]] },
    8:  { platz: [['Norbert Götte', 4736], ['Kurt Langer', 4373], ['Bernhard Selzer', 4198]] },
    9:  { platz: [['Joachim Jeske', 3607], ['Manfred Hallmann', 2995], ['Heinz Bühl', 2906]] },
    10: { platz: [['Frank Kühn', 2829], ['Reinhard Ubber', 2802], ['Joachim Stümpges', 2738]] },
    11: { platz: [['Norbert Götte', 3257], ['Kurt Langer', 2926], ['Manfred Hallmann', 2879]] },
    12: { clubmeister: true, platz: [['Kurt Langer', 27433], ['Heinz Grünenwald', 25212], ['Manfred Hallmann', 25069]], bild: 'bilder/fotoderdreiclubmeister202220221220_181211-2.jpg' }
  }
};
