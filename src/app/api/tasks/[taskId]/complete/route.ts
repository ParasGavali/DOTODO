import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/server/db";
import { Task } from "@/server/models/Task";
import { getCurrentUser } from "@/server/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId } = await params;
  await connectDB();

  const task = await Task.findOne({ _id: taskId, spaceId: user.spaceId });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  // Toggle completion
  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date() : undefined;
  await task.save();

  return NextResponse.json(task);
}
