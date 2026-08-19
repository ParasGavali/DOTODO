import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILabel extends Document {
  _id: mongoose.Types.ObjectId;
  spaceId: mongoose.Types.ObjectId;
  name: string;
  color: string;
  createdAt: Date;
}

const labelSchema = new Schema<ILabel>({
  spaceId: { type: Schema.Types.ObjectId, ref: "Space", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 50 },
  color: { type: String, default: "#8b5cf6" },
  createdAt: { type: Date, default: Date.now },
});

labelSchema.index({ spaceId: 1 });

export const Label: Model<ILabel> =
  mongoose.models.Label || mongoose.model<ILabel>("Label", labelSchema);
