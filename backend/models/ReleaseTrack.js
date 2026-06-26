const mongoose = require("mongoose");

const ReleaseTrackSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, index: true },

    releaseWorldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReleaseWorld",
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },

    trackNumber: {
      type: Number,
      default: 1,
      min: 1,
      index: true,
    },

    role: {
      type: String,
      enum: [
        "intro",
        "lead-single",
        "second-single",
        "focus-track",
        "deep-cut",
        "interlude",
        "outro",
        "bonus",
        "unknown",
      ],
      default: "unknown",
    },

    status: {
      type: String,
      enum: [
        "idea",
        "writing",
        "demo",
        "recording",
        "mixing",
        "mastered",
        "released",
        "archived",
      ],
      default: "idea",
      index: true,
    },

    visibility: {
      type: String,
      enum: ["private", "listed", "public"],
      default: "private",
      index: true,
    },

    playbackStatus: {
      type: String,
      enum: ["locked", "preview", "playable", "coming-soon"],
      default: "locked",
      index: true,
    },

    dropDate: { type: Date, default: null },
    unlockDate: { type: Date, default: null },

    bpm: { type: Number, default: null },
    keySignature: { type: String, default: "" },
    mood: { type: String, default: "" },

    hook: { type: String, default: "" },
    notes: { type: String, default: "" },
    audioUrl: { type: String, default: "" },
    previewAudioUrl: { type: String, default: "" },
    platformUrl: { type: String, default: "" },

    isFocusTrack: { type: Boolean, default: false, index: true },
    isSecondFocus: { type: Boolean, default: false, index: true },
    isPublic: { type: Boolean, default: false, index: true },

    lastOpenedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ReleaseTrackSchema.index({ ownerId: 1, releaseWorldId: 1, trackNumber: 1 });
ReleaseTrackSchema.index({ ownerId: 1, releaseWorldId: 1, slug: 1 }, { unique: true });
ReleaseTrackSchema.index({ releaseWorldId: 1, status: 1 });
ReleaseTrackSchema.index({ releaseWorldId: 1, visibility: 1, playbackStatus: 1 });

module.exports = mongoose.model("ReleaseTrack", ReleaseTrackSchema);