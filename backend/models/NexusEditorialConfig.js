const mongoose = require("mongoose");

const REALM_IDS = [303, 202, 101, 55, 44, 0];

const RealmAnchorSchema = new mongoose.Schema(
  {
    realmId: { type: Number, enum: REALM_IDS, required: true },
    trackId: { type: mongoose.Schema.Types.ObjectId, ref: "ReleaseTrack", default: null },
  },
  { _id: false }
);

const RealmOrderSchema = new mongoose.Schema(
  {
    realmId: { type: Number, enum: REALM_IDS, required: true },
    trackIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "ReleaseTrack" }],
  },
  { _id: false }
);

const NexusEditorialConfigSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true, index: true },
    featuredTrackId: { type: mongoose.Schema.Types.ObjectId, ref: "ReleaseTrack", default: null },
    realmAnchors: { type: [RealmAnchorSchema], default: () => REALM_IDS.map((realmId) => ({ realmId, trackId: null })) },
    realmOrders: { type: [RealmOrderSchema], default: () => REALM_IDS.map((realmId) => ({ realmId, trackIds: [] })) },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NexusEditorialConfig", NexusEditorialConfigSchema);
