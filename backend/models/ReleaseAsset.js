const mongoose = require("mongoose");

const ReleaseAssetSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, index: true },

    releaseWorldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReleaseWorld",
      required: true,
      index: true,
    },

    trackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReleaseTrack",
      default: null,
      index: true,
    },

    boardArtifactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BoardArtifact",
      default: null,
      index: true,
    },

    kind: {
      type: String,
      enum: ["image", "audio", "video", "document", "cover", "other"],
      default: "image",
      index: true,
    },

    usage: {
      type: String,
      enum: [
        "cover",
        "track-audio",
        "visual-reference",
        "promo",
        "canvas",
        "lyric",
        "other",
      ],
      default: "other",
      index: true,
    },

    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    url: { type: String, required: true, trim: true },
    fileName: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    size: { type: Number, default: null },

    isPublic: { type: Boolean, default: false, index: true },

    lastOpenedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ReleaseAssetSchema.index({ ownerId: 1, releaseWorldId: 1, usage: 1 });
ReleaseAssetSchema.index({ ownerId: 1, releaseWorldId: 1, kind: 1 });
ReleaseAssetSchema.index({ ownerId: 1, trackId: 1 });
ReleaseAssetSchema.index({ ownerId: 1, boardArtifactId: 1 });

module.exports = mongoose.model("ReleaseAsset", ReleaseAssetSchema);