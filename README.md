# Catalog Creator

Catalog Creator is a generic structural crawler and catalog parser.

## The important change

You configure the **website**, not every game.

You do NOT put individual game URLs, CUSA links, or update links in the configuration. The same source configuration can receive any game name.

## How it works

```
Game name
  ↓
Site search
  ↓
Search/tag/category page?
  ↓ yes
Find matching game card/title
  ↓
Follow link
  ↓
Individual game page
  ↓
Find CUSA + region blocks
  ↓
Separate Game / Update / DLC
  ↓
Find mirrors
  ↓
Compare versions
  ↓
Catalog JSON
```

## What you configure

Open `src/config/source.js`.

Normally you only change:

```js
name: "Nome do site",
baseUrl: "https://example.com"
```

The crawler tries to discover a GET search form automatically. If that fails, add a site-wide search pattern:

```js
searchTemplates: ["https://example.com/?s={query}"]
```

`{query}` is replaced automatically with the game name.

## Run

```bash
npm install
npm test
npm start -- "Risk of Rain 2"
```

Several games:

```bash
npm start -- "Risk of Rain 2" "Minecraft" "God of War"
```

## Parser

The generic parser attempts to recognize CUSA blocks, regions, Game, Update/Patch/Fix, DLC, mirrors and numeric versions. Multiple CUSA blocks stay separate and multiple updates stay separate.

Version comparison remains in `src/parser/version.js` and `src/catalog/normalize.js`.

## Limitation

This is a structural crawler/parser. It does not implement automation for bypassing protected links, shorteners, advertisements, access controls, or similar protections.

## Tests

```bash
npm test
```
