import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/server/db";
import { Task } from "@/server/models/Task";
import { getCurrentUser } from "@/server/auth";
import { updateTaskSchema } from "@/lib/validations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId } = await params;
  await connectDB();

  const task = await Task.findOne({ _id: taskId, spaceId: user.spaceId }).lean();
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  return NextResponse.json(task);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId } = await params;
  const body = await req.json();
  const parsed = updateTaskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  await connectDB();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: any = {};
  const data = parsed.data;

  if (data.title !== undefined) update.title = data.title;
  if (data.description !== undefined) update.description = data.description;
  if (data.completed !== undefined) {
    update.completed = data.completed;
    update.completedAt = data.completed ? new Date() : null;
  }
  if (data.priority !== undefined) update.priority = data.priority;
  if (data.dueDate !== undefined) update.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.dueTime !== undefined) update.dueTime = data.dueTime;
  if (data.labels !== undefined) update.labels = data.labels;
  if (data.projectId !== undefined) update.projectId = data.projectId || null;
  if (data.notes !== undefined) update.notes = data.notes;
  if (data.estimatedMinutes !== undefined) update.estimatedMinutes = data.estimatedMinutes;

  const task = await Task.findOneAndUpdate(
    { _id: taskId, spaceId: user.spaceId },
    update,
    { new: true }
  ).lean();

  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  return NextResponse.json(task);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId } = await params;
  await connectDB();

  // Delete task and all subtasks
  await Task.deleteMany({
    $or: [
      { _id: taskId, spaceId: user.spaceId },
      { parentTaskId: taskId, spaceId: user.spaceId },
    ],
  });

  return NextResponse.json({ ok: true });
}
