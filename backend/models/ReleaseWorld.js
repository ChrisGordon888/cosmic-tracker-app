const mongoose = require("mongoose");

const ReleaseWorldSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, index: true },

    creativeProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CreativeProfile",
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    releaseType: {
      type: String,
      enum: ["single", "ep", "album", "campaign"],
      default: "ep",
    },

    status: {
      type: String,
      enum: ["draft", "active", "released", "archived"],
      default: "draft",
      index: true,
    },

    visibility: {
      type: String,
      enum: ["private", "unlisted", "public"],
      default: "private",
      index: true,
    },

    isFeatured: { type: Boolean, default: false, index: true },

    oneLineSummary: { type: String, default: "" },
    story: { type: String, default: "" },
    currentFocus: { type: String, default: "" },
    secondFocus: { type: String, default: "" },
    fullDropDate: { type: Date, default: null },

    // Asset V1: release-level cover support
    coverArtUrl: { type: String, default: "" },

    coverAssetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReleaseAsset",
      default: null,
    },

    theme: {
      primaryColor: { type: String, default: "#7ed3ff" },
      accentColor: { type: String, default: "#f3e7d1" },
      boardDefaultColor: { type: String, default: "cream" },
      backgroundMode: { type: String, default: "cosmic-dark" },
      typographyMode: { type: String, default: "editorial" },
    },

    lastOpenedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ReleaseWorldSchema.index({ ownerId: 1, slug: 1 }, { unique: true });
ReleaseWorldSchema.index({ creativeProfileId: 1, slug: 1 }, { unique: true });
ReleaseWorldSchema.index({ slug: 1, visibility: 1 });
ReleaseWorldSchema.index({ ownerId: 1, coverAssetId: 1 });

module.exports = mongoose.model("ReleaseWorld", ReleaseWorldSchema);