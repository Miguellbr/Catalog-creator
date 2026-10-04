import { compareVersions, normalizeVersion } from "../parser/version.js";

export function normalizeGame(game) {
  const versions = Array.isArray(game?.versions) ? game.versions : [];

  const normalized = versions.map((entry, index) => ({
    ...entry,
    version: normalizeVersion(entry.version),
    position: index
  }));

  normalized.sort((a, b) => {
    const versionOrder = compareVersions(b.version, a.version);
    return versionOrder !== 0 ? versionOrder : a.position - b.position;
  });

  return {
    ...game,
    versions: normalized.map((entry, index) => ({
      ...entry,
      preferred: index === 0
    }))
  };
}
