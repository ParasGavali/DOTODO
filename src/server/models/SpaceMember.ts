import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISpaceMember extends Document {
  _id: mongoose.Types.ObjectId;
  spaceId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  role: "owner" | "editor" | "viewer";
  createdAt: Date;
}

const spaceMemberSchema = new Schema<ISpaceMember>({
  spaceId: { type: Schema.Types.ObjectId, ref: "Space", required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: "Owner", required: true, index: true },
  role: { type: String, enum: ["owner", "editor", "viewer"], default: "viewer" },
  createdAt: { type: Date, default: Date.now },
});



export const SpaceMember: Model<ISpaceMember> =
  mongoose.models.SpaceMember || mongoose.model<ISpaceMember>("SpaceMember", spaceMemberSchema);
