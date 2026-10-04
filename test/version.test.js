import test from "node:test";
import assert from "node:assert/strict";
import { compareVersions } from "../src/parser/version.js";

test("compares numeric versions", () => {
  assert.equal(compareVersions("1.20", "1.18"), 1);
  assert.equal(compareVersions("1.08", "1.18"), -1);
  assert.equal(compareVersions("2.0", "2.0"), 0);
});
