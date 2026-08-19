import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOwner extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  ownerKeyHash: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ownerSchema = new Schema<IOwner>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    ownerKeyHash: { type: String, required: true },
    email: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
  },
  { timestamps: true }
);



export const Owner: Model<IOwner> =
  mongoose.models.Owner || mongoose.model<IOwner>("Owner", ownerSchema);
