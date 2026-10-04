# Catalog Creator

Catalog Creator is a generic structural crawler and catalog parser.

## The important idea

You configure the **website**, not every game.

A source can use reusable template variables:

- `{GAME_SLUG}` → converts a game name to a URL slug
- `{GAME}` → URL-encoded game name
- `{QUERY}` → URL-encoded game name

Example:

```
https://example.com/tag/{GAME_SLUG}/
```

Input:

```
Risk of Rain 2
```

becomes:

```
https://example.com/tag/risk-of-rain-2/
```

No individual game URL needs to be stored in the source configuration.

## Batch input

You can put one game name per line in a text file:

```text
Risk of Rain 2
Minecraft
God of War
```

Then run:

```bash
npm install
npm test
npm start -- --file games.txt
```

The same source configuration is reused for every name in the file.

You can also pass names directly:

```bash
npm start -- "Risk of Rain 2" "Minecraft" "God of War"
```

## How it works

```
Game name
  ↓
Template expansion
  ↓
Site search/tag/category page
  ↓
Find matching game page
  ↓
Find CUSA + region blocks
  ↓
Separate Game / Update / DLC
  ↓
Compare versions
  ↓
Catalog JSON
```

## What you configure

Open `src/config/source.js`.

Normally you describe the **site structure**:

```js
export const sourceConfig = {
  name: "My Source",
  baseUrl: "https://example.com",
  searchTemplates: [
    "https://example.com/tag/{GAME_SLUG}/"
  ],
  maxNavigationDepth: 3
};
```

The crawler can also try to discover a GET search form automatically when no template works.

## Parser

The generic parser attempts to recognize CUSA blocks, regions, Game, Update/Patch/Fix, DLC, mirrors and numeric versions. Multiple CUSA blocks stay separate and multiple updates stay separate.

Version comparison remains in `src/parser/version.js` and `src/catalog/normalize.js`.

## Limitation

This is a structural crawler/parser. It does not implement automation for bypassing protected links, shorteners, advertisements, access controls, or similar protections.

## Tests

```bash
npm test
```
