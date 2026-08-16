const mongoose = require("mongoose");

const REALM_IDS = [303, 202, 101, 55, 44, 0];
const COLLECTION_TYPES = [
  "flagship",
  "realm-anchor-set",
  "public-three-piece",
  "vault",
  "premium",
  "season",
  "episode",
  "release-project",
  "playlist",
];

const MusicCollectionSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, index: true },
    legacyRegistryId: { type: String, default: "", trim: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    type: { type: String, enum: COLLECTION_TYPES, default: "playlist", index: true },
    realmId: { type: Number, enum: [...REALM_IDS, null], default: null, index: true },
    releaseWorldId: { type: mongoose.Schema.Types.ObjectId, ref: "ReleaseWorld", default: null, index: true },
    description: { type: String, default: "" },
    story: { type: String, default: "" },
    artworkUrl: { type: String, default: "" },
    trackIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "ReleaseTrack" }],
    accessTier: { type: String, enum: ["public", "signup", "premium"], default: "public", index: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 999, index: true },
    legacyImportedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

MusicCollectionSchema.index({ ownerId: 1, slug: 1 }, { unique: true });
MusicCollectionSchema.index(
  { ownerId: 1, legacyRegistryId: 1 },
  { unique: true, partialFilterExpression: { legacyRegistryId: { $type: "string", $ne: "" } } }
);
MusicCollectionSchema.index({ ownerId: 1, isActive: 1, sortOrder: 1 });

module.exports = mongoose.model("MusicCollection", MusicCollectionSchema);
