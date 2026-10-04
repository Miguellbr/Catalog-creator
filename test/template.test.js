import test from "node:test";
import assert from "node:assert/strict";
import { expandTemplate, slugify } from "../src/crawler/generic.js";

test("creates a reusable game slug", () => {
  assert.equal(slugify("Risk of Rain 2"), "risk-of-rain-2");
  assert.equal(slugify("The Legend of Zelda: Tears of the Kingdom"), "the-legend-of-zelda-tears-of-the-kingdom");
});

test("fills site template without hardcoding a game", () => {
  assert.equal(
    expandTemplate("https://example.com/tag/{GAME_SLUG}/", "Risk of Rain 2"),
    "https://example.com/tag/risk-of-rain-2/"
  );
});

test("supports encoded query placeholders", () => {
  assert.equal(
    expandTemplate("https://example.com/search/{GAME}/", "God of War Ragnarök"),
    "https://example.com/search/God%20of%20War%20Ragnar%C3%B6k/"
  );
});
