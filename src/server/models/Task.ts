import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRecurrence {
  type: "daily" | "weekly" | "monthly" | "yearly" | "weekdays" | "custom";
  interval: number;
  daysOfWeek?: number[];
  endDate?: Date;
}

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  spaceId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  parentTaskId?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  completed: boolean;
  priority: number;
  dueDate?: Date;
  dueTime?: string;
  recurrence?: IRecurrence;
  reminderAt?: Date;
  estimatedMinutes?: number;
  assigneeId?: mongoose.Types.ObjectId;
  labels: mongoose.Types.ObjectId[];
  position: number;
  notes: string;
  completedAt?: Date;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const recurrenceSchema = new Schema<IRecurrence>(
  {
    type: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly", "weekdays", "custom"],
      required: true,
    },
    interval: { type: Number, default: 1, min: 1 },
    daysOfWeek: [{ type: Number, min: 0, max: 6 }],
    endDate: { type: Date },
  },
  { _id: false }
);

const taskSchema = new Schema<ITask>(
  {
    spaceId: { type: Schema.Types.ObjectId, ref: "Space", required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", default: null, index: true },
    parentTaskId: { type: Schema.Types.ObjectId, ref: "Task", default: null, index: true },
    title: { type: String, required: true, trim: true, maxlength: 500 },
    description: { type: String, default: "" },
    completed: { type: Boolean, default: false, index: true },
    priority: { type: Number, default: 0, min: 0, max: 4, index: true },
    dueDate: { type: Date, default: null, index: true },
    dueTime: { type: String, default: null },
    recurrence: { type: recurrenceSchema, default: null },
    reminderAt: { type: Date, default: null },
    estimatedMinutes: { type: Number, default: null },
    assigneeId: { type: Schema.Types.ObjectId, ref: "Owner", default: null, index: true },
    labels: [{ type: Schema.Types.ObjectId, ref: "Label" }],
    position: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    completedAt: { type: Date, default: null },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

taskSchema.index({ spaceId: 1, completed: 1 });
taskSchema.index({ spaceId: 1, projectId: 1 });
taskSchema.index({ spaceId: 1, dueDate: 1 });
taskSchema.index({ parentTaskId: 1 });
taskSchema.index({ title: "text", description: "text" });

export const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", taskSchema);
