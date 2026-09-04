import assert from "node:assert/strict";
import { fallbackContent } from "../src/content/fallback";
import { normalizeContent } from "../src/content/selectors";
import { mapPayloadPortfolio } from "../src/payload/portfolio/mapper";
import { readPublishedPortfolioSnapshot } from "../src/payload/portfolio/repository";

const snapshot = await readPublishedPortfolioSnapshot();
const actual = normalizeContent(mapPayloadPortfolio(snapshot));
const expected = normalizeContent(fallbackContent);

assert.deepEqual(actual, expected, "El DTO publicado por Payload difiere del fallback original.");

const expectedCounts = {
  skills: expected.skills.length,
  experience: expected.experience.length,
  projects: expected.projects.length,
  credentials: expected.credentials.length,
};
const actualCounts = {
  skills: snapshot.skills.length,
  experience: snapshot.experience.length,
  projects: snapshot.projects.length,
  credentials: snapshot.credentials.length,
};

assert.deepEqual(actualCounts, expectedCounts, "Los conteos publicados no coinciden con la fuente local.");
assert.equal(snapshot.settings._status, "published");
for (const documents of [snapshot.skills, snapshot.experience, snapshot.projects, snapshot.credentials]) {
  assert.ok(documents.every((document) => document._status === "published"));
  assert.equal(new Set(documents.map((document) => document.key)).size, documents.length);
}

console.log(JSON.stringify({ ok: true, dtoEquivalent: true, counts: actualCounts }, null, 2));
