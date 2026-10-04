import test from "node:test";
import assert from "node:assert/strict";
import { parseGamePage } from "../src/parser/heuristic.js";

const html = `
<html><head><title>Example Game</title></head><body>
<h2>CUSA16209 - EUR</h2>
<a href="/game">Game</a><a href="/u118">Update 1.18</a>
<a href="/u105">Update 1.05 Fix 5.05</a><a href="/dlc">DLC (2)</a>
<h2>CUSA16153 - USA</h2><a href="/game2">Game</a><a href="/u108">Update 1.08</a>
</body></html>`;

test("separates CUSA blocks and categories", () => {
  const game = parseGamePage({
    url: "https://example.test/game",
    html,
    text: "Example Game CUSA16209 EUR Game Update 1.18 DLC CUSA16153 USA Game Update 1.08"
  });
  assert.equal(game.versions.length, 2);
  assert.equal(game.versions[0].cusa, "CUSA16209");
  assert.equal(game.versions[0].region, "EUR");
  assert.equal(game.versions[0].game.length, 1);
  assert.equal(game.versions[0].updates.length, 2);
  assert.equal(game.versions[0].dlc.length, 1);
  assert.equal(game.versions[1].cusa, "CUSA16153");
});
