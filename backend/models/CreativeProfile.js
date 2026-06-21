const mongoose = require("mongoose");

const CreativeProfileSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, index: true },

    artistName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true, index: true },
    displayName: { type: String, trim: true },
    tagline: { type: String, trim: true },
    bio: { type: String, default: "" },

    avatarAssetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReleaseAsset",
      default: null,
    },

    heroAssetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReleaseAsset",
      default: null,
    },

    theme: {
      primaryColor: { type: String, default: "#7ed3ff" },
      accentColor: { type: String, default: "#f3e7d1" },
      backgroundMode: { type: String, default: "cosmic-dark" },
    },

    isPublic: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },

    featuredReleaseWorldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReleaseWorld",
      default: null,
    },
  },
  { timestamps: true }
);

CreativeProfileSchema.index({ ownerId: 1, slug: 1 }, { unique: true });
CreativeProfileSchema.index({ slug: 1, isPublic: 1 });

module.exports = mongoose.model("CreativeProfile", CreativeProfileSchema);