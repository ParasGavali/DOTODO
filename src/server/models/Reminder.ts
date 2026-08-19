import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReminder extends Document {
  _id: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  remindAt: Date;
  sent: boolean;
  type: "notification" | "email";
  createdAt: Date;
}

const reminderSchema = new Schema<IReminder>({
  taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true, index: true },
  remindAt: { type: Date, required: true, index: true },
  sent: { type: Boolean, default: false, index: true },
  type: { type: String, enum: ["notification", "email"], default: "notification" },
  createdAt: { type: Date, default: Date.now },
});

reminderSchema.index({ taskId: 1 });
reminderSchema.index({ remindAt: 1, sent: 1 });

export const Reminder: Model<IReminder> =
  mongoose.models.Reminder || mongoose.model<IReminder>("Reminder", reminderSchema);
