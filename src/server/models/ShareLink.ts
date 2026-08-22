import mongoose, { Schema, Document, Model } from "mongoose";

export interface IShareLink extends Document {
  _id: mongoose.Types.ObjectId;
  spaceId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  tokenHash: string;
  permission: "editor" | "viewer";
  expiresAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  active: boolean;
  createdAt: Date;
}

const shareLinkSchema = new Schema<IShareLink>({
  spaceId: { type: Schema.Types.ObjectId, ref: "Space", required: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project", default: null },
  tokenHash: { type: String, required: true, unique: true, index: true },
  permission: { type: String, enum: ["editor", "viewer"], default: "viewer" },
  expiresAt: { type: Date, default: null },
  createdBy: { type: Schema.Types.ObjectId, ref: "Owner", required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});



export const ShareLink: Model<IShareLink> =
  mongoose.models.ShareLink || mongoose.model<IShareLink>("ShareLink", shareLinkSchema);
