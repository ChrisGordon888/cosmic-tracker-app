const mongoose = require("mongoose");

const BoardArtifactSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, index: true },

    releaseWorldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReleaseWorld",
      required: true,
      index: true,
    },

    kind: {
      type: String,
      enum: [
        "center",
        "realm",
        "track",
        "moon",
        "visual",
        "hook",
        "action",
        "portal",
        "cover",
        "note",
        "image",
        "lyric",
        "asset",
      ],
      default: "note",
    },

    eyebrow: { type: String, default: "" },
    title: { type: String, required: true, trim: true },
    body: { type: String, default: "" },
    meta: { type: String, default: "" },
    href: { type: String, default: "" },
    connectedTrackSlug: { type: String, default: "" },

    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReleaseAsset",
      default: null,
    },

    position: {
      x: { type: Number, default: 50 },
      y: { type: Number, default: 50 },
      rotate: { type: Number, default: 0 },
    },

    style: {
      color: { type: String, default: "cream" },
      size: { type: String, default: "md" },
      layer: { type: Number, default: 4 },
    },

    isGenerated: { type: Boolean, default: false },
    isUserCreated: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BoardArtifactSchema.index({ releaseWorldId: 1, updatedAt: -1 });
BoardArtifactSchema.index({ ownerId: 1, releaseWorldId: 1 });

module.exports = mongoose.model("BoardArtifact", BoardArtifactSchema);