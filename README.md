# Catalog Creator

Structural catalog builder and page parser.

## Architecture

The project separates:

- crawling/navigation
- page classification
- source adapters
- structured parsing
- version normalization/comparison
- catalog output

## Source adapter

Each source should implement the generic interface in `src/sources/adapter.js`.

The adapter is intentionally isolated from the core parser so new sources can be added without changing the rest of the system.

## Reserved integration point

```js
// TODO: SOURCE-SPECIFIC INTEGRATION
// Add source-specific navigation/request handling here.
//
// Keep the rest of the project independent from this implementation.
```

This placeholder is intentionally left for a source-specific implementation to be added later.

## Development

```bash
npm install
npm test
```
