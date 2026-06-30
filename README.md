# GeschiedenisQuest

GeschiedenisQuest is een statische educatieve webapp voor vmbo bk leerjaar 1. Leerlingen oefenen hoofdstuk 6 met korte quests, directe feedback, XP, badges, voortgangsbalken en een Boss Level.

De app gebruikt een vaste lokale vraagbank met 90 vragen uit `src/data/geschiedenisquest_h6_vraagbank_90.ts`. Er is geen backend, database, login of externe API nodig.

## Lokaal starten

Installeer eerst de dependencies:

```bash
npm install
```

Start daarna de ontwikkelserver:

```bash
npm run dev
```

Open de lokale URL die Vite toont, meestal:

```text
http://localhost:5173/
```

## Vraagbank controleren

Controleer de vaste vraagbank met:

```bash
npm run validate:questions
```

Deze controle kijkt onder andere naar:

- exact 90 vragen
- unieke vraag-id's
- verplichte velden zoals `question`, `answer`, `explanation`, `section` en `learningGoal`
- minimaal 4 opties bij meerkeuzevragen
- geen demo- of placeholdervragen

Tijdens development meldt de app deze controle ook in de browserconsole.

## Build maken

Maak een productiebuild met:

```bash
npm run build
```

De build-output komt in:

```text
dist/
```

Je kunt de build lokaal bekijken met:

```bash
npm run preview
```

## Publiceren via GitHub Pages

Deze repository heet `geschiedenisquest`. Daarom staat in `vite.config.ts`:

```ts
base: "/geschiedenisquest/"
```

Publiceren kan bijvoorbeeld met GitHub Pages via GitHub Actions:

1. Push de code naar de repository `geschiedenisquest`.
2. Ga in GitHub naar **Settings** > **Pages**.
3. Kies bij **Build and deployment** voor **GitHub Actions**.
4. Gebruik een workflow die `npm install` en `npm run build` uitvoert en daarna de map `dist/` publiceert.

De gepubliceerde app komt dan op:

```text
https://<gebruikersnaam>.github.io/geschiedenisquest/
```

## Routes op GitHub Pages

GeschiedenisQuest gebruikt geen aparte URL-routes. De schermen worden binnen de React-app gewisseld. Daardoor werkt de app als statische GitHub Pages-site zonder extra routeconfiguratie of backend.

## Privacy en AI

GeschiedenisQuest gebruikt geen GPT, geen AI-integratie en geen AI-feedback. Alle vragen, antwoorden, uitleg, badges en adviezen staan vast in de app.

De app heeft geen persoonsgegevens nodig. Leerlingen hoeven geen naam, e-mailadres, leerlingnummer, klas of school in te vullen. Voortgang wordt alleen lokaal op het apparaat opgeslagen met `localStorage` en kan in de app worden gewist via **Mijn voortgang wissen**.

Er worden geen gegevens naar een server gestuurd. De app gebruikt geen tracking, analytics of cookies.

Meer details staan in `PRIVACY.md`.

## Geen environment variables nodig

De app heeft geen `.env`-bestand of environment variables nodig. De vraagbank wordt meegebundeld in de statische JavaScript-build.
