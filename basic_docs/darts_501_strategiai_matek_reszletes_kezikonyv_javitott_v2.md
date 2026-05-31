# Darts 501 stratégiai matek — részletes magyar kézikönyv

**Készült:** 2026-05-21  
**Téma:** magas pontszámos 501 stratégia, 350/290/250/230 környéki döntések, bogey-számok, setup-játék, magas kiszállók, 19-re váltás, miss-protection és gyakorlási rendszer.

Ez az anyag az alul felsorolt internetes források alapján készült, de nem egyszerű fordítás és nem checkout-tábla másolat. A cél egy magyarul használható, játékos szemléletű stratégiai jegyzet: mit kell gondolni a dobás előtt, miért fontosak bizonyos számok, és hogyan lehet ezt edzésbe beépíteni.

> **Javítás / pontosítás:** a 230/229 részt pontosítottam. A korábbi változat túl általánosan fogalmazott: külön kell választani a teljes kör eleji helyzetet, a két nyíllal kézben lévő setupot és az egyetlen nyíllal kézben lévő négynyilas-plafon logikát.

---

## 1. A legfontosabb alapgondolat: nem pontot dobunk, hanem pozíciót építünk

501-ben a kezdő vagy középhaladó játékos általában így gondolkodik:

> „Minél többet kell dobnom, lehetőleg T20-ra.”

Ez részben igaz, de erős szinten kevés. A magasabb szintű gondolkodás inkább ez:

> „Olyan maradékot akarok hagyni, amelyből a következő körben vagy az azt követő körben reális, tiszta, nem bogey kiszállóm van, lehetőleg kedvenc duplára.”

Ez a különbség a nyers pontgyűjtés és az 501-stratégia között. A 180 látványos, de egy rossz maradékot hagyó 140 néha kisebb stratégiai értékű, mint egy okosan dobott 99 vagy 100, ha az utóbbi tiszta kiszálló-struktúrát hagy.

A profi szemlélet szerint a leg nem csak az utolsó három nyílról szól. A kiszállót már korábban elő kell készíteni. A források alapján a legfontosabb váltópont a **350**: ettől lefelé már minden dobásnak checkout-tudatosnak kell lennie.

---

## 2. Miért pont a 350 a nagy stratégiai határ?

A standard táblán a legnagyobb háromnyilas kiszálló a **170**:

- T20 = 60
- T20 = 60
- Bull = 50
- összesen: 170

Ebből következik:

- **170** = legnagyobb háromnyilas checkout
- **230** = legnagyobb négynyilas befejezés lehetősége, mert egy extra nyíl maximum 60 pontot ér, utána 170 maradhat a következő három nyílra
- **290** = legnagyobb ötnyilas befejezés lehetősége, mert két extra nyíl maximum 120 pontot ér, utána 170 maradhat
- **350** = legnagyobb hatnyilas befejezés lehetősége, mert egy teljes 180-as kör után 170 maradhat

Ezért mondják azt a jó stratégiai anyagok, hogy **350 alatt már nem puszta scoring van, hanem checkout-előkészítés**. 350-ről egy 180 után 170 marad. Nem könnyű, de matematikailag él a hatnyilas lehetőség. 349-ről viszont a maximális 180 után 169 marad, ami nem checkout. Ez óriási különbség.

### 2.1. A 350 stratégiai jelentése

350 nem azért fontos, mert onnan gyakran ki fogsz szállni hat nyílból. Hanem azért, mert onnan **még van elméleti út**:

- 350 → 180 → 170
- 350 → 140 → 210, majd lehet tovább építeni
- 350 → 100 → 250, ami még kezelhető középső játék

A 349 ezzel szemben rosszabb, mint amilyennek elsőre tűnik:

- 349 → 180 → 169
- 169 nem háromnyilas checkout
- tehát a tökéletes következő kör sem ad azonnali kiszállót

Ezért a magasabb szintű stratégia nem csak azt nézi, hogy „mennyi maradt”, hanem azt is, hogy **hány nyílból lehet még befejezni**.

---

## 3. Bogey-számok: a darts-matek központi fogalma

A klasszikus bogey-számok azok a 170 alatti maradékok, amelyeket három nyílból nem lehet kiszállni, hiába tűnnek magas, de közeli számoknak.

A hét klasszikus háromnyilas bogey:

| Bogey | Miért baj? |
|---:|---|
| 169 | nincs háromnyilas dupla-befejezés |
| 168 | nincs háromnyilas dupla-befejezés |
| 166 | nincs háromnyilas dupla-befejezés |
| 165 | nincs háromnyilas dupla-befejezés |
| 163 | nincs háromnyilas dupla-befejezés |
| 162 | nincs háromnyilas dupla-befejezés |
| 159 | nincs háromnyilas dupla-befejezés |

Ezeket nem elég tudni. A valódi stratégiai játék ott kezdődik, hogy nem is hagyod őket magadnak.

### 3.1. Miért különösen fájdalmas egy bogey?

Ha például 186-on állsz, és automatikusan T20-ra dobsz, de csak sima 20-at találsz:

- 186 − 20 = 166
- 166 bogey
- nincs háromnyilas kiszálló

Ezzel gyakorlatilag adtál az ellenfélnek egy extra lehetőséget. Nem azért, mert rosszul dobtál nagyot, hanem mert rossz első célpontot választottál.

### 3.2. A bogey nem csak 170 alatt létezik

A mélyebb 501-matekban vannak többnyilas bogey-k is. A logika egyszerű: ha 170 a legnagyobb háromnyilas checkout, akkor 230 a legnagyobb négynyilas, 290 az ötnyilas, 350 a hatnyilas. Az ezek alatti, de mégsem megfelelően befejezhető számok stratégiai csapdák.

A forrásokban szereplő fontosabb setup-bogey-k:

| Kategória | Bogey-számok | Mit jelent? |
|---|---|---|
| 3 nyilas bogey | 169, 168, 166, 165, 163, 162, 159 | innen nem lehet azonnal kiszállni három nyílból |
| 4 nyilas bogey | 229, 228, 226, 225, 223, 222, 219 | innen a következő plusz egy nyíllal sem tiszta a max út |
| 5 nyilas bogey | 289, 288, 286, 285, 283, 282, 279 | a 290-es ötnyilas küszöb alatt rossz csapdák |
| 6 nyilas bogey | 349, 348, 346, 345, 343, 342, 339 | a 350-es hatnyilas küszöb alatt rossz csapdák |

Ezeket nem feltétlenül kell mind mechanikusan bemagolni, de a mintát érteni kell. A döntés lényege:

> Ne hagyj olyan számot, amelyből a tökéletes következő dobásaid sem adnak checkout-lehetőséget.

### 3.3. Memóriafogódzó

A források egyik hasznos megfigyelése: az 50 fölötti bogey-számok jellemzően a következő végződésekre esnek:

- 2
- 3
- 5
- 6
- 8
- 9

Ez nem azt jelenti, hogy minden ilyen végződésű szám bogey. De azt igen, hogy ha bizonytalan vagy, akkor a **0, 1, 4, 7 végződésű maradékok** gyakran barátságosabbak.

---

## 4. A 230 és 229 pontos jelentése — javított, kontextusos értelmezés

Itt nagyon fontos a kontextus: **nem mindegy, hogy 230/229 maradékod van egy teljes kör elején, két nyíllal kézben, vagy egyetlen nyíllal kézben.** A 230/229 logika csak így értelmes.

A matematikai alap:

> 230 = 60 + 170

Ez azt jelenti, hogy **230 a legnagyobb négynyilas befejezési plafon**: egy T20 után 170 maradhat, amit a következő három nyílból elvileg ki lehet szállni. Ez nem azt jelenti, hogy 230-ról egy teljes kör elején „T20 és kész”. Ha 230-ról három nyíllal állsz oda, akkor a forrás gyakorlati ajánlása nem az, hogy az első nyíllal T20 után már jó vagy, hanem az, hogy **60 pont összesen** — például három sima 20 — 170-et hagy a következő körre.

### 4.1. 230 teljes kör elején

Ha 230-on állsz a kör elején, akkor:

- S20 + S20 + S20 = 60
- 230 − 60 = 170

Ezért írja a forrás, hogy **230-nál 60 checkoutot hagy**, és ha az első két nyíl sima 20, akkor ne válts automatikusan cover shotra. A harmadik sima 20 pontosan 170-et hagy.

Helyes értelmezés:

- 230 → három sima 20 → 170 marad
- 170 a legnagyobb háromnyilas checkout
- tehát 230-ról egy gyenge, de tiszta 60-as kör is meghagyja az elméleti következő körös kiszállót

### 4.2. 229 teljes kör elején

229-nél ugyanez már rosszabb:

- S20 + S20 + S20 = 60
- 229 − 60 = 169
- 169 nem checkout

Ezért írja a forrás, hogy **229-nél 60 bogey-t hagy**, és két sima 20 után érdemes 19-re váltani:

- S20 + S20 + S19 = 59
- 229 − 59 = 170

Vagyis a lényeg nem az, hogy 229-nél „soha ne dobj 20-ra”. A lényeg az, hogy ha két sima 20 után még egy sima 20-at dobsz, akkor 169-et hagysz, miközben egy sima 19-cel 170-et hagynál.

### 4.3. 230/229 egyetlen nyíllal kézben

Ez egy másik helyzet.

Ha **egy nyilad van kézben 230-ról**, akkor:

- T20 → 170

Ezért 230 négynyilas plafon: egy nyíl + következő három nyíl.

Ha **egy nyilad van kézben 229-ről**, akkor:

- T20 → 169
- 169 nem checkout

Ez mutatja, hogy 229 miért négy nyilas bogey-jellegű szám: nincs olyan egyetlen dobható nyílérték, amellyel tiszta háromnyilas checkoutot lehetne hagyni. A 229-hez 59 pont kellene a 170-hez, de egyetlen nyíllal 59 nem dobható.

### 4.4. Mit kellett volna rövidebben írni?

A helyes, nem félrevezető szabály:

> **230 jó kapuszám, mert egy extra T20 után 170 maradhat, illetve teljes körben három sima 20 is 170-et hagy. 229 azért csapda, mert 60 pont 169-et hagy; teljes körben két sima 20 után ezért a harmadik nyíllal 19-re kell váltani, ha 170-et akarsz hagyni.**

A korábbi megfogalmazás, miszerint „230-ról T20 → 170”, önmagában igaz, de túl általános volt. A pontos játékhelyzetet mindig hozzá kell tenni.

---

## 5. A 250 környéke: miért kezd itt nagyon élesen számítani a setup?

A 250 környéke azért érdekes, mert innen már nem pusztán az a kérdés, hogy „leérek-e 170 alá”, hanem hogy **milyen úton** érek oda.

Különösen akkor fontos, amikor már van egy vagy két nyíl a kézben a visitből. Ilyenkor nem mindegy, hogy a maradék 230, 227, 224, 220 vagy éppen 229/228/226/225/223/222/219 lesz.

### 5.1. Példa: 249 két nyíllal kézben

Ha 249-en állsz, és két nyilad maradt, automatikusan T20-ra dobni kockázatos:

- S20 esetén 229 marad
- 229 négy nyilas bogey-jellegű csapda

Ezért ilyen helyzetben jobb lehet 19-re váltani:

- 249 − S19 = 230
- 230 tisztább, mert T20 után 170 maradhat

Ez a gondolkodás a 250 környékén kulcsfontosságú: nem a maximális dobásérték az egyetlen cél, hanem a rossz maradék elkerülése.

### 5.2. A 249/248/246/245/243/242/239 minta

A forrásokban több ilyen setup-példa szerepel. A minta:

| Maradék két nyíllal | Miért lehet kerülendő a T20? | Tipikus stratégiai gondolat |
|---:|---|---|
| 249 | S20 → 229, rossz | 19 felé nézni |
| 248 | S20 → 228, rossz | 18 felé nézni |
| 246 | S20 → 226, rossz | 19 felé nézni |
| 245 | S20 → 225, rossz | 18 felé nézni |
| 243 | S20 → 223, rossz | 19 felé nézni |
| 242 | S20 → 222, rossz | 18 felé nézni |
| 239 | S20 → 219, rossz | 19 felé nézni |

Itt nem az a lényeg, hogy minden játékosnak pontosan ugyanazt kell dobnia. A lényeg:

> Ha a sima 20 rossz, bogey-jellegű maradékot hagy, akkor a 20 automatikus célzása hibás döntés lehet.

---

## 6. A 290 és 350 közötti sáv: hatnyilas és ötnyilas gondolkodás

A 350–291 közötti sávban a nagy kérdés:

> Tudok-e úgy dobni, hogy a következő visit végére checkouton legyek, vagy legalább ne zárjam ki magam a gyors befejezésből?

A 350 a maximális hatnyilas út teteje. 291 alatt már másik logika kezdődik, mert 290 a legnagyobb ötnyilas befejezési lehetőség.

### 6.1. Miért rossz például a 349?

- 349 → 180 = 169
- 169 bogey
- tehát még tökéletes 180-nal sem marad háromnyilas out

Ezért a 349, 348, 346, 345, 343, 342, 339 típusú számok hatnyilas szempontból csapdák.

### 6.2. Mit jelent ez játék közben?

Ha 360–351 körül vagy, akkor már figyelned kell, hogy milyen számra érkezel. Nem mindegy, hogy 350 vagy 349 marad. Egy pont különbség a táblán itt egy teljes visitnyi stratégiai különbséget okozhat.

Példa:

- 439-ről 100-at dobva 339 marad, ami rossz hatnyilas bogey-jellegű szám.
- 439-ről 99-et dobva 340 marad, ami jobb struktúrát ad.

Ez a példa jól mutatja: néha egy kevesebb pontot érő dobás stratégiailag erősebb, ha jobb maradékot hagy.

---

## 7. A 309–301 tartomány: klasszikus középsőjáték-csapdák

A 300 környékén sok játékos még mindig automatikusan 20-ra dob. Ez néha jó, de több ponton hibás lehet, mert egy sima 20 vagy egy rossz kombináció bogey-hoz vagy nehéz setuphoz vezet.

A források külön foglalkoznak a 309–301 sávval. A lényeg: bizonyos számoknál az első nyíl célpontja nem T20, hanem T19 vagy T18 lehet.

### 7.1. Tipikus gondolkodási példák

| Maradék | Tipikus első cél | Miért? |
|---:|---|---|
| 309 | T19 | ha csak S19 jön, még lehet T20-T20 jelleggel outot hagyni |
| 308 | T18 | hasonló ok: a sima találat után is élhet a setup |
| 307 | T20 | itt a 20-as út természetesebb |
| 306 | T19 | S19 után is marad építhető út |
| 305 | bull / óvatos alternatíva | kockázatos, játékosfüggő döntés |
| 304 | T20 | maradhat 170 alatti setup |
| 303 | T19 vagy T18 jellegű út | cél a bogey elkerülése és a magas out hagyása |
| 302 | T18 | a sima találat után is védhetőbb út |
| 301 | T20 | természetes scoring út |

Fontos: ezek nem kőbe vésett törvények. A forrásokban is látszik, hogy a játékos preferenciája, dobásképe és a miss-mintája számít. De a fő tanulság egyértelmű:

> 300 környékén már nem lehet minden számot ugyanazzal a T20 reflexszel kezelni.

### 7.2. 303 példa részletesebben

303-on sok játékos reflexből 20-ra megy:

- ha 180 jön, 123 marad, ami checkout — jó
- de ha csak 140 jön, 163 marad
- 163 bogey

Ezért 303-on érdemes tudatosan megvizsgálni a 18-as vagy 19-es útvonalakat. A cél nem feltétlenül a maximális visit-score, hanem az, hogy a reális hibák után se maradjon halott szám.

---

## 8. Mikor kell 19-re váltani?

A 19-re váltás nem „gyengeség” és nem menekülés. Jó játékosnál ez tudatos stratégiai döntés.

Két fő oka van:

1. **Mechanikai ok:** a dartjaid lefelé csúsznak, gyakran a T20 alá mennek. Ilyenkor a 19-es szektor stabilabb lehet.
2. **Matematikai ok:** ha a sima 20 bogey-számot hagyna, akkor a 20-ra dobás stratégiai hiba lehet.

### 8.1. A mechanikai ok

A 20-as szektor szomszédai:

- 1
- 5

Ha T20-ra dobsz, de oldalra tévedsz, gyakran 1 vagy 5 lesz. Ez nagy pontveszteség.

A 19-es szektor szomszédai:

- 3
- 7

Ezek sem jók, de kevésbé büntetnek, mint az 1 és az 5. Ezért ha a dobásod lefelé/oldalra szór, a 19-es néha jobb scoring-floor-t ad.

### 8.2. A matematikai ok

A legfontosabb matematikai trigger:

> Ha S20 bogey-t hagyna, ne automatikusan 20-ra dobj.

A klasszikus példák:

| Maradék | Ha S20-at dobsz | Probléma | Döntés |
|---:|---:|---|---|
| 189 | 169 | bogey | válts 19-re vagy más célra |
| 188 | 168 | bogey | válts 19-re vagy más célra |
| 186 | 166 | bogey | válts 19-re vagy más célra |
| 185 | 165 | bogey | válts 19-re vagy más célra |
| 183 | 163 | bogey | válts 19-re vagy más célra |
| 182 | 162 | bogey | válts 19-re vagy más célra |
| 179 | 159 | bogey | válts 19-re vagy más célra |

Ez a táblázat az egyik legfontosabb gyakorlati tudás 501-ben. Aki ezt automatikusan felismeri, sok felesleges rossz maradékot elkerül.

### 8.3. Mikor NEM kell 19-re váltani?

Nem kell 19-re váltani csak azért, mert:

- elrontottál egy nyilat
- ideges vagy
- a profiknál láttad
- „változtatni akarsz valamit”
- babonából úgy érzed

Ha jól csoportosítasz T20-ra, és a maradék nem hagyna bogey-t S20 esetén, akkor a T20 továbbra is a legnagyobb értékű cél.

A döntést a dobás előtt kell meghozni, nem a dobás közben. A bizonytalan célváltás rontja a mechanikát.

---

## 9. Magas kiszállók: nem csak kombináció, hanem kockázatkezelés

A magas kiszállók tanulásánál sokan csak checkout-chartot memorizálnak. Ez kell, de nem elég. A magas checkout stratégiai kérdései:

1. Melyik út ad tényleges kiszállónyilat?
2. Mi történik, ha az első nyíl csak sima szektor?
3. Milyen duplára érkezem?
4. Ha elrontom a duplát, marad-e jó split?
5. Mit csinál az ellenfél? Van-e időm setupolni, vagy ki kell mennem?

### 9.1. 161–170 tartomány

Ebben a sávban csak néhány szám közvetlen háromnyilas checkout:

| Maradék | Tipikus logika |
|---:|---|
| 170 | T20, T20, Bull |
| 167 | T20, T19, Bull jellegű út |
| 164 | T20, T18, Bull jellegű út |
| 161 | T20, T17, Bull jellegű út |

A köztes számok közül több nem checkout:

- 169
- 168
- 166
- 165
- 163
- 162
- 159

Ha ilyen bogey-n állsz, már nem kiszállót dobsz, hanem **setupot**. A cél ilyenkor általában egy erős dupla-közeli szám, például 40, 32, 36, 24, 16 környéke, attól függően, hogy milyen út nyílik.

### 9.2. A magas outshot pszichológiája

Egy 170, 167 vagy 164 ritkán jön be, de a puszta lehetősége nyomást gyakorol az ellenfélre. Ha te 170-en vagy, az ellenfél nem dobhat teljesen lazán, mert tudja, hogy kiszállhatsz. Ha viszont 169-en vagy, akkor nincs azonnali veszély. Az ellenfél nyugodtabban setupolhat.

Ezért stratégiailag sokszor már az is érték, ha **outshoton vagy**, még akkor is, ha a checkout nehéz.

### 9.3. Kedvenc duplák és struktúra

Sok stratégiai anyag kiemeli a következő duplákat:

- D16
- D20
- D8
- D12

Ezek azért értékesek, mert sok esetben jól splitelhetők vagy kényelmes útvonalakra építhetők. Példa:

- D16 miss single 16 → 16 marad → D8
- D8 miss single 8 → 8 marad → D4
- D20 miss single 20 → 20 marad → D10

Ez nem jelenti, hogy más dupla rossz. De ha választhatsz, érdemes olyan leave-et építeni, amely kedvenc duplára vagy jól splitelhető duplára visz.

---

## 10. A „rossz kiszállóút” problémája

Két route matematikailag egyformán működhet, de stratégiailag nem egyformák.

Egy jó route:

- elég gyakran nyit ismert, begyakorolt célon
- ha az első nyíl sima lesz, még marad értelmes út
- ha oldalra megy, nem feltétlenül hal meg a finish
- jó duplára vezet
- nem kényszerít pánikdöntésre a második nyílnál

Egy rossz route:

- csak tökéletes első nyíllal működik szépen
- sima találat után szétesik
- rossz duplára vagy bull-kényszerre visz
- miss után bogey-t vagy awkward leave-et hagy

### 10.1. Miss-protection

A miss-protection azt jelenti:

> Nem csak azt nézed, mit hagy a tiszta találat, hanem azt is, mit hagy a reális hiba.

Példa gondolkodás:

- Mi van, ha T20 helyett S20 jön?
- Mi van, ha T20 helyett 5 vagy 1 jön?
- Mi van, ha T19 helyett 7 vagy 3 jön?
- A következő darttal még él a route?
- Marad dobásom duplára?

Ez app-logikában is jól modellezhető: minden célponthoz nem csak egy „siker” ágat, hanem több hibaágat kell rendelni.

---

## 11. Magas pontszámos stratégia 501-ben szakaszokra bontva

### 11.1. 501–351: scoring, de nem agyatlan scoring

Ebben a szakaszban a fő cél még a nagy pont:

- T20 domináns
- 19-es akkor jön, ha a dobásképed vagy blokkolás indokolja
- cél: gyorsan 350 alá kerülni

De már itt sem teljesen mindegy a maradék. Ha 360–351 környékére érsz, a következő dobással már tudatosan kell figyelni, hogy 350, 347, 344, 341 jellegű jobb számokra vagy csapdás 349/348/346/345/343/342/339 környékre kerülsz.

### 11.2. 350–291: hatnyilas setup-zóna

Itt a kérdés:

> Tudok-e olyan számot hagyni, hogy a következő visit után checkouton legyek?

Kulcs:

- 350 jó csúcsszám
- 349 rosszabb, mint látszik
- 339 típusú számokat kerülni kell
- 309–301 környékén már sokszor nem automatikus a T20

### 11.3. 290–231: ötnyilas setup-zóna

Itt egyre fontosabb, hogy a visit végén 170 alatti vagy 230-közeli, tiszta struktúra maradjon.

Kulcs:

- 290 az ötnyilas plafon
- 289 már csapda-jellegű
- 249/248/246/245/243/242/239 környékén figyeld, hogy S20 mit hagyna

### 11.4. 230–171: közvetlen checkout-előkészítő zóna

Itt a következő visit már potenciálisan a legnyerő visit lehet. A döntések nagyon élesek.

Kulcs:

- 230 jó kapu 170 felé
- 229/228/226/225/223/222/219 rossz négy nyilas csapdák
- 189/188/186/185/183/182/179 esetén a sima 20 klasszikus bogey-t hagyna
- ha az ellenfél outon van, a tiszta leave fontosabb lehet, mint a magasabb pont

### 11.5. 170 alatt: checkout vagy setup

Itt két kategória van:

1. checkout-számok
2. bogey / setup-számok

A cél nem mindig az, hogy mindenáron kiszállót dobj. Ha nincs checkout, akkor a cél egy erős setup, lehetőleg kedvenc duplára.

---

## 12. Gyors döntési algoritmus dobás előtt

Dobás előtt kérdezd végig ezt a sort:

1. **Outon vagyok?**  
   Ha igen: tudom a fő route-ot és a hibaágat?

2. **350 alatt vagyok?**  
   Ha igen: már checkoutot építek, nem csak pontot dobok.

3. **Ha T20 helyett S20 jön, bogey marad?**  
   Ha igen: válts 19-re, 18-ra vagy más setup-célra.

4. **A célom miss esetén is védhető?**  
   Ha T20 mellé 1/5 jön, mi marad? Ha T19 mellé 3/7 jön, mi marad?

5. **Milyen duplára akarok érkezni?**  
   D16, D20, D8, D12 környéke gyakran jó struktúra.

6. **Mit csinál az ellenfél?**  
   Ha az ellenfél nincs outon, setupolhatsz okosabban. Ha outon van, lehet, hogy agresszívebb route kell.

---

## 13. Konkrét stratégiai példák

### 13.1. 186

Rossz reflex:

- cél T20
- S20 esetén 166 marad
- 166 bogey

Jobb gondolkodás:

- előre felismered, hogy S20 bajt okoz
- T19 vagy más route jöhet szóba
- cél: finishable számot hagyni, nem halottat

### 13.2. 189

Rossz reflex:

- T20-ra mész
- S20 → 169
- 169 bogey

Stratégiai gondolat:

- 19-es cél logikusabb lehet
- nem a 3 pont különbség a lényeg, hanem hogy ne zárd ki a checkoutot

### 13.3. 303

Rossz reflex:

- „T20, mert magas pont kell”
- 140 után 163 maradhat
- 163 bogey

Jobb gondolkodás:

- 18 vagy 19 irányú setup megvizsgálása
- cél: magas outshot vagy legalább nem-bogey leave

### 13.4. 249 két nyíllal

Rossz reflex:

- T20
- S20 → 229
- 229 rossz négy nyilas csapda

Jobb gondolkodás:

- 19-es irány, hogy 230 jellegű tisztább leave maradjon

### 13.5. 349

Rossz helyzet:

- maximális 180 után 169 marad
- nincs checkout

Tanulság:

- 350 sokkal jobb, mint 349
- egy pont különbség teljes stratégiai különbséget jelent

---

## 14. Edzésrendszer: hogyan gyakorold ezt?

### 14.1. Bogey-felismerő drill

Írd fel ezeket a számokat:

- 189
- 188
- 186
- 185
- 183
- 182
- 179

Feladat:

1. Mondd ki, mit hagyna S20.
2. Mondd ki, miért rossz.
3. Válassz alternatív első célpontot.
4. Dobj három nyilat.
5. Jegyezd fel, outon maradtál-e.

Cél: a bogey-elkerülés automatikussá tétele.

### 14.2. 309–301 setup drill

Induló számok:

- 309
- 308
- 307
- 306
- 305
- 304
- 303
- 302
- 301

Feladat:

1. Minden szám előtt döntsd el az első célpontot.
2. Ne dobás közben változtass.
3. Dobj három nyilat.
4. Jegyezd fel, maradt-e háromnyilas checkout vagy tiszta setup.

Mérőszám:

- hány visit végződött outshoton?
- hány visit hagyott bogey-t?
- hány visit hagyott kényelmes setupot?

### 14.3. 250 környéki két nyilas drill

Induló számok két nyíllal:

- 249
- 248
- 246
- 245
- 243
- 242
- 239

Feladat:

1. Döntsd el: 20, 19 vagy 18?
2. Dobd le a két nyilat.
3. Nézd meg, hogy 230/227/224/220 jellegű jobb leave-et vagy rossz bogey-csapdát hagytál-e.

Cél: a két nyíllal kézben történő setup-döntés gyakorlása.

### 14.4. 350 drill

Induló számok:

- 350
- 349
- 348
- 347
- 346
- 345
- 344
- 343
- 342
- 341
- 340
- 339

Feladat:

1. Minden számnál mondd ki, hogy hatnyilas szempontból jó vagy rossz.
2. Dobj egy visitet.
3. Jegyezd fel, maradt-e következő visitre háromnyilas checkout esély.

Cél: megtanulni, hogy 350 környékén miért nem egyenértékűek az egymás melletti számok.

### 14.5. Magas outshot drill

Induló számok:

- 170
- 167
- 164
- 161
- 160
- 158
- 157
- 156
- 154
- 151

Feladat:

1. Döntsd el a route-ot.
2. Mondd ki a miss utáni tervet is.
3. Dobj.
4. Ha nem sikerül, a maradékot setupold kedvenc duplára.

Cél: ne csak a tökéletes route-ot tudd, hanem a hibából való mentést is.

### 14.6. Nyomás alatti dupla drill

Válassz egy kedvenc duplát:

- D16
- D20
- D8
- D12

Szabály:

- 10 próbád van.
- minden kihagyott dupla után büntetés: például 5 fekvőtámasz, vagy visszalépés egy korábbi score-ra.
- jegyezd fel a találati arányt.

Cél: a dupla ne legyen különleges, félelmetes dobás. Ugyanolyan ritmusból kell mennie, mint a scoring dartnak.

---

## 15. Játék közbeni rövid cheat sheet

### 15.1. Klasszikus bogey-k

Kerüld:

- 169
- 168
- 166
- 165
- 163
- 162
- 159

### 15.2. Ha S20 ezeket hagyná, gondolkodj 19-ben

- 189 → S20 = 169
- 188 → S20 = 168
- 186 → S20 = 166
- 185 → S20 = 165
- 183 → S20 = 163
- 182 → S20 = 162
- 179 → S20 = 159

### 15.3. Setup-kapuk

- 350 = hatnyilas út teteje
- 290 = ötnyilas út teteje
- 230 = négynyilas út teteje
- 170 = háromnyilas út teteje

### 15.4. Jó cél nem mindig a legnagyobb cél

Néha:

- 99 jobb, mint 100
- 19 jobb, mint 20
- setup jobb, mint erőltetett bull
- kedvenc dupla jobb, mint magasabb, de rosszabb szerkezetű leave

---

## 16. Hogyan lehet ezt alkalmazáslogikába átültetni?

Ha ebből döntési motort vagy gyakorló appot szeretnél csinálni, akkor nem elég statikus checkout chartot használni.

Szükséges fogalmak:

### 16.1. Score-state

Minden állásnál tárolni kell:

- aktuális score
- hány nyíl van kézben
- ellenfél score-ja
- játékos preferált duplái
- játékos találati valószínűsége szektoronként
- miss-eloszlás: single, tripla, szomszéd szektor, bull stb.

### 16.2. Döntési fa

Egy célpont nem csak egy kimenetet ad. Példa T20 célzásnál:

- T20 = −60
- S20 = −20
- T5 = −15
- S5 = −5
- T1 = −3
- S1 = −1
- esetleges miss / no score

A jó stratégia nem csak azt számolja, hogy T20 esetén mi történik, hanem azt is, hogy a valószínű hibák után milyen maradék jön.

### 16.3. Értékelési függvény

Egy maradék értéke nem csak a pontszámtól függ. Például:

- 170 értékesebb, mint 169
- 230 értékesebb, mint 229
- 40 gyakran jobb, mint 41
- 32 gyakran jobb, mint 33
- bogey maradék nagy büntetést kap
- kedvenc dupla plusz értéket kap
- ellenfél outon van → agresszívabb route előnyösebb lehet

### 16.4. Javasolt értékprioritás apphoz

Egy egyszerű stratégiai pontozás:

1. Kiszállás azonnal: legmagasabb érték.
2. Marad háromnyilas checkout: nagyon magas érték.
3. Marad kényelmes setup kedvenc duplára: magas érték.
4. Marad bármilyen finishable out: közepes/magas érték.
5. Marad bogey: nagy büntetés.
6. Marad 1 vagy bust-veszélyes állás: nagyon nagy büntetés.

Ezzel a rendszer már nem csak checkout-táblát ad, hanem stratégiai tanácsot is.

---

## 17. A lényeg röviden

1. **350-től lefelé már checkoutot építesz.**  
   Nem csak pontot gyűjtesz.

2. **A 230, 290 és 350 nem véletlenül fontos.**  
   Ezek a 4, 5 és 6 nyilas befejezés matematikai plafonjai.

3. **A bogey-számokat nem elég ismerni; el kell kerülni őket.**  
   A jó játékos nem 169-en bosszankodik, hanem már 189-nél nem dob automatikusan S20-veszélyes útra.

4. **A 19-re váltás stratégiai fegyver.**  
   Nem menekülés, hanem tudatos döntés, ha a dobásképed vagy a matek indokolja.

5. **A magas kiszálló nem csak route-memória.**  
   Tudni kell a hibaágakat, a setupot és a kedvenc duplára építést.

6. **A legjobb route az, amelyik hibával is életben tartja a leget.**  
   A tökéletes dobásra optimalizált út gyakran rosszabb, mint a reális miss-eket is kezelő út.

7. **Edzésben mérni kell a maradék minőségét, nem csak a pontot.**  
   Ha egy drill végén sokszor bogey-t hagysz, akkor stratégiailag rosszul játszol akkor is, ha közben néha nagyot dobsz.

---

## 18. Források és mire használtam őket

### Darts Checkout Assistant — A Guide to Reaching a Checkout
URL: https://dartscheckoutassistant.com/2021/01/26/a-guide-to-reaching-a-checkout/  
Felhasználás: 350 küszöb, 230/290/350 logika, setup-zónák, magas pontszámos checkout-előkészítés, 439 → 339/340 jellegű példa.

### Darts Checkout Assistant — The Bogey Numbers
URL: https://dartscheckoutassistant.com/2019/05/21/the-bogey-numbers/  
Felhasználás: klasszikus és többnyilas bogey-számok, 229/289/349 logika, 249/248/246 környéki setup-gondolkodás.

### D-Artist — 501 Darts Strategy
URL: https://d-artist.com/501-strategy.html  
Felhasználás: 350 alatti checkout-tudatos játék, kedvenc duplák, miss geometry, pozícióépítés szemlélete.

### D-Artist — When to Switch to 19 in Darts
URL: https://d-artist.com/switch-to-19-darts.html  
Felhasználás: 19-re váltás két oka: drift és matematika; 189/188/186/185/183/182/179 trigger-számok; 20 és 19 szomszédszektorainak stratégiai jelentése.

### D-Artist — Advanced 501 Darts Strategy
URL: https://d-artist.com/advanced-501-strategy.html  
Felhasználás: kétkörös tervezés, scoring-floor vs ceiling, route-védelem, nyomás alatti döntések, miss-protection szemlélet.

### Shot Darts — Number Power
URL: https://www.shotdarts.com/blog/number-power  
Felhasználás: 309–301 tartomány setup-példái, 300 feletti outshot-előkészítés, 200-as sáv setupgondolkodása.

### Darts501 — Darts Checkout Chart and Combination Finishes
URL: https://darts501.com/Check.html  
Felhasználás: checkout-chart szemlélet, középső játék jelentősége, 303 példa, route-választás és kezdő/haladó megközelítés különbsége.

### Dartshopper — Darts Rules and How to Play 501 with Checkouts
URL: https://www.dartshopper.eu/blog/darts-rules-501/  
Felhasználás: bust-szabály rövid megerősítése, klasszikus bogey-számok és 186 → 166 példa.

---

## 19. Megjegyzés a források használatához

A D-Artist külön jelzi, hogy a saját checkout-route táblái és stratégiai rendszere védett/proprietary anyag. Ezért ebben a jegyzetben nem reprodukáltam teljes route-táblákat vagy eszköz-outputokat. A dokumentum a nyilvánosan olvasható stratégiai elveket, általános darts-matematikai összefüggéseket és néhány szemléltető példát foglal össze magyarul.

A pontos route-választás játékosfüggő. A legjobb stratégia függ:

- dobásképtől
- kedvenc dupláktól
- T20/T19/T18 találati aránytól
- bull-erősségtől
- ellenfél állásától
- meccshelyzettől
- nyomástűréstől

Ezért ezt az anyagot nem dogmaként, hanem edzés- és döntéstámogató kézikönyvként érdemes használni.
