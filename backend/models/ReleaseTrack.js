const mongoose = require("mongoose");

const ReleaseTrackSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, index: true },
    releaseWorldId: { type: mongoose.Schema.Types.ObjectId, ref: "ReleaseWorld", required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    trackNumber: { type: Number, default: 1, min: 1, index: true },
    role: { type: String, enum: ["intro","lead-single","second-single","focus-track","deep-cut","interlude","outro","bonus","unknown"], default: "unknown" },
    status: { type: String, enum: ["idea","writing","demo","recording","mixing","mastered","released","archived"], default: "idea", index: true },
    visibility: { type: String, enum: ["private","listed","public"], default: "private", index: true },
    playbackStatus: { type: String, enum: ["locked","preview","playable","coming-soon"], default: "locked", index: true },
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

    // Creator chooses the Realm they believe best fits the signal. Admin/Owner
    // review can approve or change this value before Nexus publication.
    realmId: { type: Number, enum: [303, 202, 101, 55, 44, 0, null], default: null, index: true },

    // Nexus review workflow. showInNexus means actually published to Nexus;
    // creators submit through nexusReviewStatus instead of setting it directly.
    nexusReviewStatus: {
      type: String,
      enum: ["draft", "in-review", "needs-changes", "approved", "published"],
      default: "draft",
      index: true,
    },
    nexusSubmittedAt: { type: Date, default: null },
    nexusReviewedAt: { type: Date, default: null },
    nexusReviewedBy: { type: String, default: "" },
    nexusReviewNotes: { type: String, default: "" },

    // Realm Finder stores a lightweight creative snapshot for editorial review.
    // It is advisory only; realmId remains the creator/admin placement field.
    realmFinderSuggestedRealmId: {
      type: Number,
      enum: [303, 202, 101, 55, 44, 0, null],
      default: null,
    },
    realmFinderSecondaryRealmId: {
      type: Number,
      enum: [303, 202, 101, 55, 44, 0, null],
      default: null,
    },
    realmFinderTraceRealmId: {
      type: Number,
      enum: [303, 202, 101, 55, 44, 0, null],
      default: null,
    },
    realmFinderAlignment: { type: Number, min: 0, max: 100, default: null },
    realmFinderSignals: { type: [String], default: [] },
    realmFinderSummary: { type: String, default: "" },
    realmFinderDominantSignal: { type: String, default: "" },
    realmFinderExplanation: { type: String, default: "" },
    realmFinderScores: {
      realm303: { type: Number, min: 0, max: 100, default: 0 },
      realm202: { type: Number, min: 0, max: 100, default: 0 },
      realm101: { type: Number, min: 0, max: 100, default: 0 },
      realm55: { type: Number, min: 0, max: 100, default: 0 },
      realm44: { type: Number, min: 0, max: 100, default: 0 },
      realm0: { type: Number, min: 0, max: 100, default: 0 },
    },
    realmFinderVersion: { type: String, default: "" },

    showInNexus: { type: Boolean, default: false, index: true },
    nexusRole: { type: String, enum: ["flagship","anchor","public","featured","expansion","vault","premium"], default: "public" },
    isRealmAnchor: { type: Boolean, default: false, index: true },
    isPublicPick: { type: Boolean, default: false, index: true },
    nexusSortOrder: { type: Number, default: 999, index: true },
    lastOpenedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ReleaseTrackSchema.index({ ownerId: 1, releaseWorldId: 1, trackNumber: 1 });
ReleaseTrackSchema.index({ ownerId: 1, releaseWorldId: 1, slug: 1 }, { unique: true });
ReleaseTrackSchema.index({ releaseWorldId: 1, status: 1 });
ReleaseTrackSchema.index({ releaseWorldId: 1, visibility: 1, playbackStatus: 1 });
ReleaseTrackSchema.index({ showInNexus: 1, realmId: 1, visibility: 1, playbackStatus: 1, nexusSortOrder: 1 });
ReleaseTrackSchema.index({ ownerId: 1, showInNexus: 1, realmId: 1 });
ReleaseTrackSchema.index({ nexusReviewStatus: 1, nexusSubmittedAt: -1 });

module.exports = mongoose.model("ReleaseTrack", ReleaseTrackSchema);