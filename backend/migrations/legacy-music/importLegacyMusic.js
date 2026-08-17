/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const ReleaseTrack = require("../../models/ReleaseTrack");
const ReleaseWorld = require("../../models/ReleaseWorld");
const MusicCollection = require("../../models/MusicCollection");

const SNAPSHOT_PATH = path.join(__dirname, "registry.snapshot.json");

function argValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] || null;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "untitled";
}

function normalizeTitle(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function mapLegacyStatus(status) {
  return ({
    finished: "mastered",
    demo: "demo",
    "rough-draft": "writing",
    "needs-mix": "mixing",
    "needs-writing": "writing",
    "clip-only": "demo",
  })[status] || "idea";
}

function mapVisibility(accessTier) {
  // Keep gated tracks discoverable without treating them as anonymously playable.
  if (accessTier === "public") return "public";
  return "listed";
}

function loadJson(filePath, fallback = {}) {
  if (!filePath) return fallback;
  return JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
}

function resolveReleaseWorldId(track, releaseMap) {
  return (
    releaseMap.tracks?.[track.id] ||
    (track.releaseProjectId ? releaseMap.projects?.[track.releaseProjectId] : null) ||
    releaseMap.defaultReleaseWorldId ||
    null
  );
}

function collectionDestinationType(collection) {
  if (collection.type === "flagship") return "NEXUS_FEATURED_SIGNAL";
  if (collection.type === "realm-anchor-set") return "NEXUS_REALM_ANCHORS";
  if (collection.type === "release-project") return "RELEASE_WORLD";
  return "MUSIC_COLLECTION";
}

async function main() {
  const apply = hasFlag("--apply");
  const ownerId = argValue("--owner-id") || process.env.LEGACY_MUSIC_OWNER_ID;
  const releaseMapPath = argValue("--release-map");
  const outputPath = path.resolve(argValue("--output") || path.join(process.cwd(), "legacy-music-import-report.json"));
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!ownerId) {
    throw new Error("Provide --owner-id <userId> or LEGACY_MUSIC_OWNER_ID.");
  }
  if (!mongoUri) {
    throw new Error("MONGODB_URI (or MONGO_URI) is required.");
  }

  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8"));
  const releaseMap = loadJson(releaseMapPath, { tracks: {}, projects: {} });

  await mongoose.connect(mongoUri);

  const existingTracks = await ReleaseTrack.find({ ownerId }).lean();
  const existingCollections = await MusicCollection.find({ ownerId }).lean();
  const releaseWorlds = await ReleaseWorld.find({ ownerId }).select("_id title slug releaseType status visibility").lean();

  const byLegacyId = new Map(existingTracks.filter((t) => t.legacyRegistryId).map((t) => [t.legacyRegistryId, t]));
  const byTitleRealm = new Map();
  for (const track of existingTracks) {
    const key = `${normalizeTitle(track.title)}::${track.realmId ?? "none"}`;
    const list = byTitleRealm.get(key) || [];
    list.push(track);
    byTitleRealm.set(key, list);
  }

  const report = {
    version: "v5l9-legacy-music-import-v1",
    mode: apply ? "APPLY" : "DRY_RUN",
    ownerId,
    generatedAt: new Date().toISOString(),
    source: {
      tracks: snapshot.tracks.length,
      collections: snapshot.collections.length,
      featuredReleases: snapshot.featuredReleases.length,
    },
    database: {
      existingTracks: existingTracks.length,
      existingCollections: existingCollections.length,
      releaseWorlds: releaseWorlds.map((r) => ({ id: String(r._id), title: r.title, slug: r.slug, releaseType: r.releaseType })),
    },
    tracks: [],
    collections: [],
    editorialCandidates: [],
    summary: {},
  };

  const resolvedTrackIds = new Map();

  for (const legacy of snapshot.tracks) {
    let existing = byLegacyId.get(legacy.id) || null;
    let matchMethod = existing ? "legacy-id" : null;

    if (!existing) {
      const candidates = byTitleRealm.get(`${normalizeTitle(legacy.trackTitle)}::${legacy.realmId}`) || [];
      if (candidates.length === 1) {
        existing = candidates[0];
        matchMethod = "title+realm";
      } else if (candidates.length > 1) {
        report.tracks.push({
          legacyId: legacy.id,
          title: legacy.trackTitle,
          action: "CONFLICT",
          reason: "multiple-title-realm-matches",
          candidateIds: candidates.map((c) => String(c._id)),
        });
        continue;
      }
    }

    const safeMetadata = {
      legacyRegistryId: legacy.id,
      accessTier: legacy.visibility || "public",
      legacyReleaseBatch: legacy.releaseBatch || "",
      legacyEnergy: legacy.energy || "",
      legacyVibe: Array.isArray(legacy.vibe) ? legacy.vibe : [],
      legacyBestUse: Array.isArray(legacy.bestUse) ? legacy.bestUse : [],
      legacyImportedAt: new Date(),
    };

    if (existing) {
      const changes = {};
      for (const [key, value] of Object.entries(safeMetadata)) {
        const current = existing[key];
        const same = Array.isArray(value)
          ? JSON.stringify(current || []) === JSON.stringify(value)
          : String(current ?? "") === String(value ?? "");
        if (!same) changes[key] = value;
      }
      if (!existing.audioUrl && legacy.trackUrl) changes.audioUrl = legacy.trackUrl;
      if (!existing.keySignature && legacy.key) changes.keySignature = legacy.key;
      if ((existing.bpm === null || existing.bpm === undefined) && legacy.bpm) changes.bpm = legacy.bpm;

      const action = Object.keys(changes).length ? "UPDATE" : "MATCH";
      report.tracks.push({
        legacyId: legacy.id,
        title: legacy.trackTitle,
        action,
        matchMethod,
        trackId: String(existing._id),
        changes: Object.keys(changes),
      });
      resolvedTrackIds.set(legacy.id, existing._id);

      if (apply && action === "UPDATE") {
        await ReleaseTrack.updateOne({ _id: existing._id, ownerId }, { $set: changes });
      }
      continue;
    }

    const releaseWorldId = resolveReleaseWorldId(legacy, releaseMap);
    let releaseWorld = null;

    if (releaseWorldId) {
      releaseWorld = releaseWorlds.find((r) => String(r._id) === String(releaseWorldId));
      if (!releaseWorld) {
        report.tracks.push({
          legacyId: legacy.id,
          title: legacy.trackTitle,
          action: "CONFLICT",
          reason: "release-world-id-not-found-for-owner",
          releaseWorldId,
        });
        continue;
      }
    } else if (legacy.releaseProjectId) {
      report.tracks.push({
        legacyId: legacy.id,
        title: legacy.trackTitle,
        action: "CONFLICT",
        reason: "release-project-unmapped",
        releaseProjectId: legacy.releaseProjectId,
      });
      continue;
    }

    const createPayload = {
      ownerId,
      releaseWorldId: releaseWorld?._id || null,
      title: legacy.trackTitle,
      slug: slugify(legacy.trackTitle),
      trackNumber: legacy.releasePriority || legacy.sortOrder || 1,
      role: "unknown",
      status: mapLegacyStatus(legacy.status),
      visibility: mapVisibility(legacy.visibility || "public"),
      accessTier: legacy.visibility || "public",
      playbackStatus: legacy.trackUrl ? "playable" : "locked",
      bpm: legacy.bpm || null,
      keySignature: legacy.key || "",
      mood: Array.isArray(legacy.vibe) ? legacy.vibe.slice(0, 3).join(" · ") : "",
      notes: legacy.notes || "",
      audioUrl: legacy.trackUrl || "",
      previewAudioUrl: "",
      platformUrl: "",
      isPublic: legacy.visibility === "public",
      realmId: legacy.realmId,
      showInNexus: false,
      nexusReviewStatus: "draft",
      nexusRole: legacy.role || "public",
      isRealmAnchor: false,
      isPublicPick: Boolean(legacy.isPublicPick),
      nexusSortOrder: legacy.sortOrder ?? 999,
      ...safeMetadata,
    };

    report.tracks.push({
      legacyId: legacy.id,
      title: legacy.trackTitle,
      action: "CREATE",
      releaseWorldId: releaseWorld ? String(releaseWorld._id) : null,
      releaseWorldTitle: releaseWorld?.title || null,
      catalogOnly: !releaseWorld,
      safety: releaseWorld
        ? "created as Nexus draft; showInNexus=false"
        : "created as standalone catalog track; no Release World; Nexus draft; showInNexus=false",
    });

    if (apply) {
      const created = await ReleaseTrack.create(createPayload);
      resolvedTrackIds.set(legacy.id, created._id);
    }
  }

  // In dry-run mode, also resolve planned CREATE records symbolically so collection
  // reports can explain dependencies without pretending Mongo IDs already exist.
  for (const row of report.tracks) {
    if (row.action === "CREATE" && !resolvedTrackIds.has(row.legacyId)) {
      resolvedTrackIds.set(row.legacyId, `PLANNED:${row.legacyId}`);
    }
  }

  const existingCollectionByLegacy = new Map(existingCollections.filter((c) => c.legacyRegistryId).map((c) => [c.legacyRegistryId, c]));

  for (const legacyCollection of snapshot.collections) {
    const destination = collectionDestinationType(legacyCollection);
    if (destination !== "MUSIC_COLLECTION") {
      report.editorialCandidates.push({
        legacyId: legacyCollection.id,
        title: legacyCollection.title,
        legacyType: legacyCollection.type,
        destination,
        trackIds: legacyCollection.trackIds,
        note: destination === "RELEASE_WORLD"
          ? "Map to existing ReleaseWorld; do not duplicate as a collection."
          : "Apply through NexusEditorialConfig only after referenced Signals are published.",
      });
      continue;
    }

    const unresolved = legacyCollection.trackIds.filter((id) => !resolvedTrackIds.has(id));
    if (unresolved.length) {
      report.collections.push({
        legacyId: legacyCollection.id,
        title: legacyCollection.title,
        action: "CONFLICT",
        reason: "unresolved-track-references",
        unresolvedTrackIds: unresolved,
      });
      continue;
    }

    const existing = existingCollectionByLegacy.get(legacyCollection.id);
    const resolvedIds = legacyCollection.trackIds.map((id) => resolvedTrackIds.get(id));
    if (existing) {
      report.collections.push({
        legacyId: legacyCollection.id,
        title: legacyCollection.title,
        action: "UPDATE",
        collectionId: String(existing._id),
      });
      if (apply) {
        await MusicCollection.updateOne(
          { _id: existing._id, ownerId },
          { $set: {
            title: legacyCollection.title,
            type: legacyCollection.type,
            realmId: legacyCollection.realmId ?? null,
            description: legacyCollection.description || "",
            story: legacyCollection.story || "",
            artworkUrl: legacyCollection.artworkUrl || "",
            trackIds: resolvedIds,
            accessTier: legacyCollection.type === "premium" ? "premium" : legacyCollection.type === "vault" ? "signup" : "public",
            isActive: legacyCollection.isActive !== false,
            sortOrder: legacyCollection.sortOrder ?? 999,
            legacyImportedAt: new Date(),
          } }
        );
      }
    } else {
      report.collections.push({
        legacyId: legacyCollection.id,
        title: legacyCollection.title,
        action: "CREATE",
        type: legacyCollection.type,
      });
      if (apply) {
        // All planned IDs are real ObjectIds in apply mode; unresolved creates never reach here.
        await MusicCollection.create({
          ownerId,
          legacyRegistryId: legacyCollection.id,
          title: legacyCollection.title,
          slug: slugify(legacyCollection.title),
          type: legacyCollection.type,
          realmId: legacyCollection.realmId ?? null,
          description: legacyCollection.description || "",
          story: legacyCollection.story || "",
          artworkUrl: legacyCollection.artworkUrl || "",
          trackIds: resolvedIds,
          accessTier: legacyCollection.type === "premium" ? "premium" : legacyCollection.type === "vault" ? "signup" : "public",
          isActive: legacyCollection.isActive !== false,
          sortOrder: legacyCollection.sortOrder ?? 999,
          legacyImportedAt: new Date(),
        });
      }
    }
  }

  const countBy = (rows, key) => rows.reduce((acc, row) => {
    const value = row[key] || "UNKNOWN";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  report.summary = {
    trackActions: countBy(report.tracks, "action"),
    collectionActions: countBy(report.collections, "action"),
    editorialCandidates: report.editorialCandidates.length,
    writesPerformed: apply,
  };

  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.summary, null, 2));
  console.log(`\nReport: ${outputPath}`);
  console.log(apply ? "\nAPPLY complete." : "\nDRY RUN complete. No database writes performed.");

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("[legacy-music-import]", error);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
