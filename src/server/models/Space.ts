import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISpace extends Document {
  _id: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const spaceSchema = new Schema<ISpace>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "Owner", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
  },
  { timestamps: true }
);



export const Space: Model<ISpace> =
  mongoose.models.Space || mongoose.model<ISpace>("Space", spaceSchema);
