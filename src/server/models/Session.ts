import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISession extends Document {
  _id: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  tokenHash: string;
  deviceName: string;
  ipAddress: string;
  expiresAt: Date;
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>({
  ownerId: { type: Schema.Types.ObjectId, ref: "Owner", required: true, index: true },
  tokenHash: { type: String, required: true, unique: true, index: true },
  deviceName: { type: String, default: "" },
  ipAddress: { type: String, default: "" },
  expiresAt: { type: Date, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});



export const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>("Session", sessionSchema);
