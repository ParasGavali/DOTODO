import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  spaceId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  icon: string;
  color: string;
  position: number;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    spaceId: { type: Schema.Types.ObjectId, ref: "Space", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: "" },
    icon: { type: String, default: "folder" },
    color: { type: String, default: "#6366f1" },
    position: { type: Number, default: 0 },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

projectSchema.index({ spaceId: 1, position: 1 });

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", projectSchema);
