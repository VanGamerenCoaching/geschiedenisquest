# Privacy

GeschiedenisQuest is een statische oefenapp voor toetsvoorbereiding. De app werkt volledig lokaal in de browser en gebruikt geen backend, database, login of registratie.

## Welke gegevens worden lokaal opgeslagen?

De app slaat alleen voortgang op in `localStorage` van de browser, onder de sleutel `geschiedenisquest_local_progress_v1`.

Per vraag kan dit worden opgeslagen:

- `questionId`
- `correctCount`
- `wrongCount`
- `lastAnsweredAt`
- `mastered`

Daarnaast kan dit worden opgeslagen:

- `earnedBadges`
- `totalXp`

De app slaat geen gekozen antwoorden, namen, e-mailadressen, leerlingnummers, klasnamen, schoolnamen, IP-adressen, apparaat-ID's, analytics-ID's of cookies op.

## Waarom zijn er geen persoonsgegevens nodig?

De leerling hoeft geen account te maken en hoeft geen naam in te vullen. De app is bedoeld om zelfstandig te oefenen op hetzelfde apparaat. Voor voortgang is alleen nodig welke vaste vraag geoefend is, hoe vaak die goed of fout ging, welke badges zijn behaald en hoeveel XP is verdiend.

## Hoe kan een leerling voortgang wissen?

Open in de app het scherm **Voortgang** en klik op **Mijn voortgang wissen**. Deze knop verwijdert de lokale voortgang uit `localStorage` en zet de sessievoortgang terug.

## Worden gegevens naar een server gestuurd?

Nee. Er worden geen gegevens naar een server gestuurd. De app gebruikt geen externe API-calls, tracking, analytics, cookies, online leaderboard, backend of database.

## Staat de vraagbank vast in de app?

Ja. De vraagbank staat vast in de app in `src/data/geschiedenisquest_h6_vraagbank_90.ts`. De quizvragen worden lokaal uit deze vaste vraagbank gelezen.

## Gebruikt de app GPT of AI?

Nee. De app gebruikt geen GPT, geen AI-integratie en geen AI-feedback. Alle vragen, antwoorden, uitleg, badges en adviezen komen uit vaste code en vaste regels in de app.
