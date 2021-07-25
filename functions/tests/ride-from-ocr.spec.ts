import { ride_from_ocr } from '../src/ride-from-ocr'
import { DateTime } from 'luxon'

describe('Ride from OCR', () => {
  test('Kéthly -> Bem', () => {
    const result = ride_from_ocr("O al\n\"0 98% I 2:54\nPál-völgyi-barlang\nPalatinus Gyógy-,\nStrand- és Hullámfürdő\nHősök tere\nXIV. KI\nPASARÉT\nórház H\nÖLGY\nOrszágh\nVII. KERÜLET\nRÜLET\nBudapest\nNagy Vásárcsarnok\nVIII. KERÜLET\nÜllői út\nNÉPLIG\nGoogle\nKerékpár\n861027\nKezdés\n2021. júl. 23.\n14:18:18\n0707-Kéthly Anna tér\nVisszaadás\n2021. júl. 23.\n0203-Bem József tér\n14:40:17\nHungária,\nJózsef krt.\nDuna\n")
    expect(result).toBeDefined()
    expect(result?.bike).toEqual(861027)
    expect(result?.from).toEqual("0707")
    expect(result?.to).toEqual("0203")
    expect(result?.when).toEqual(DateTime.fromISO('2021-07-23T14:18:18.000+02:00').toMillis())
    expect(result?.sec).toEqual(21 * 60 + 59)
  })

  test('Clark -> Klauzál', () => {
    const result = ride_from_ocr("1 92%\n4:17\nMargit kört\nOrszágház\nPodmaniczky\nAndrássy út\nVI. KERÜLET\nDamjanich u.\nSzent István Bazilika\nVII. KERÜLET\nBudapest\nDohány utcai Zsina\nAttila út\nRákóczi út\nLGY\nBELVÁROS\nGoogle\nNagy Vásárcsarnok\nGellért-hegy\nVIII. K\nCORVIN-NEGYE\no Kerékpár\n860754\nKezdés\n0103-Clark Ádám tér\n2021. jún. 2.\n17:40:56\nPa\nVisszaadás\n0704-Klauzál tér\n2021. jún. 2.\n17:50:41\nJózsef krt.\nLónyay\nDun\nKrisztina\nkrt.\nAlkotás u.\n")
    expect(result).toBeDefined()
    expect(result?.bike).toEqual(860754)
    expect(result?.from).toEqual("0103")
    expect(result?.to).toEqual("0704")
    expect(result?.when).toEqual(DateTime.fromISO('2021-06-02T17:40:56.000+02:00').toMillis())
    expect(result?.sec).toEqual(9 * 60 + 45)
  })

  test('Ferdinánd -> Clark', () => {
    const result = ride_from_ocr("F al 95% 3:21\nPál-völgyi-barlang\nPalatinus Gyógy-,\nStrand- és Hullámfürdő\nHősök tere\nXIV. KE\nPASARÉT\nórház H\nÖLGY\nOrszágház\nVII. KERÜLET\nRÜLET\nBud est\nNagy Vásárcsarnok\nVIII. KERÜLET\nÜllői út\nNÉPLIG\nGoogle\no Kerékpár\n860370\n2021. júl. 23.\nA Kezdés\n0613-Ferdinánd híd -\nPodmaniczky utca\n00:05:03\nVisszaadás\n2021. júl. 23.\n0103-Clark Ádám tér\n00:22:16\nHungária /\nJózsef krt.\nDuna\n")
    expect(result).toBeDefined()
    expect(result?.bike).toEqual(860370)
    expect(result?.from).toEqual("0613")
    expect(result?.to).toEqual("0103")
    expect(result?.when).toEqual(DateTime.fromISO('2021-07-23T00:05:03.000+02:00').toMillis())
    expect(result?.sec).toEqual(17 * 60 + 13)
  })

  test('Hősök -> Clark', () => {
    const result = ride_from_ocr("М 82%\n6:36\nAII, AERULCT\nPál-völgyi-barlang\nPalatinus Gyógy-,\nStrand- és Hullámfürdő\nHősök tere\nXIV. KERÜL\nSARÉT\náz H\n(H)\nהה\nOrszágház\nVII. KERÜLET\nET\nBudpest\nNagy Vásárcsarnok\nVIII. KERÜLET\nÜllői út\nNÉPLIGET\nGoogle\no Kerékpár\n861119\nA Kezdés\n2021. júl. 21.\n0602-Hősök tere\n22:54:26\n2021. júl. 21.\nPa\n0103-Clark Ádám tér\nVisszaadás\n23:16:16\nHungária,\nJózsef krt.\nDuna\n")
    expect(result).toBeDefined()
    expect(result?.bike).toEqual(861119)
    expect(result?.from).toEqual("0602")
    expect(result?.to).toEqual("0103")
    expect(result?.when).toEqual(DateTime.fromISO('2021-07-21T22:54:26.000+02:00').toMillis())
    expect(result?.sec).toEqual(21 * 60 + 50)
  })

  test('Széll -> Hősök', () => {
    const result = ride_from_ocr("1 82%\n6:36\nAIV. N\nPASARÉT\nCórház\nOrszágház\nÖLGY\nVII. KERÜLET\nERÜLET\nBudapest\nNagy Vásárcsarnok\nVIII. KERÜLET\nGoogle\nÜllői út\nNÉPLIC\no Kerékpár\n860283\n2021. júl. 21.\nA Kezdés\n0210-Széll Kálmán tér\n16:38:01\nPa\nVisszaadás\n2021. júl. 21.\n0602-Hősök tere\n17:03:51\nIdőtartam\n25 perc, 50 másodperc\nHasználat díja\n0,00 Ft\nHungária\nJózsef krt.\n")
    expect(result).toBeDefined()
    expect(result?.bike).toEqual(860283)
    expect(result?.from).toEqual("0210")
    expect(result?.to).toEqual("0602")
    expect(result?.when).toEqual(DateTime.fromISO('2021-07-21T16:38:01.000+02:00').toMillis())
    expect(result?.sec).toEqual(25 * 60 + 50)
  })
})
