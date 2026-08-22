import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAiMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface IAiConversation extends Document {
  _id: mongoose.Types.ObjectId;
  spaceId: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  messages: IAiMessage[];
  createdAt: Date;
}

const aiMessageSchema = new Schema<IAiMessage>(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const aiConversationSchema = new Schema<IAiConversation>({
  spaceId: { type: Schema.Types.ObjectId, ref: "Space", required: true },
  taskId: { type: Schema.Types.ObjectId, ref: "Task", default: null },
  messages: { type: [aiMessageSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

aiConversationSchema.index({ spaceId: 1 });

export const AiConversation: Model<IAiConversation> =
  mongoose.models.AiConversation ||
  mongoose.model<IAiConversation>("AiConversation", aiConversationSchema);
