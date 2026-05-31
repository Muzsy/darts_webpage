# 00 — Aktuális scope

## Rövid cél

A projekt első verziójának célja egy egyszerű, de később bővíthető webalkalmazás létrehozása, amely egy stratégia/kiszállótábla képernyőn megjeleníti a darts score-okhoz tartozó dobásstratégiákat.

## Beleértett funkciók

### 1. Stratégia képernyő

A felhasználó kiválaszt vagy megnyit egy score-t, például:

```text
501
321
170
108
60
40
32
0
```

A képernyő megjeleníti:

- az aktuális score-t,
- az adott score-hoz tartozó stratégiai verziókat,
- a stratégiai verziók prioritását,
- a tervezett háromnyilas dobássort,
- a lehetséges outcome-okat,
- az outcome-okból következő más score-okat.

### 2. Kiszállótábla / score-stratégia adatbázis

Az adatbázis tárolja:

- az összes releváns score-t 0 és 501 között,
- a score-ok kategóriáját,
- a score-okhoz tartozó stratégiákat,
- a stratégiák tervezett dobásait,
- a stratégiák lehetséges eredményeit,
- az eredményekből következő score-kapcsolatokat.

## Nem része az első körnek

Az alábbiak most szándékosan kimaradnak:

- gyakorló képernyő,
- felhasználói gyakorlási session,
- próbálkozások mentése,
- statisztikai dashboard,
- személyre szabott ajánlás,
- admin felület,
- többnyelvűség,
- mobilapp,
- gamification,
- teljes auth-flow implementálása.

## Tervezési elv

Az első verzió legyen kicsi, de ne legyen zsákutca.

Ez azt jelenti:

- az adatbázis legyen relációs és bővíthető,
- a stratégia képernyő ne fix JSON-ra épüljön véglegesen,
- a későbbi userhez kötött funkciók számára maradjon tiszta kapcsolódási pont,
- a jelenlegi scope-ot ne tágítsuk ki idő előtt.
