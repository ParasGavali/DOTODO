import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/server/db";
import { Task } from "@/server/models/Task";
import { getCurrentUser } from "@/server/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId } = await params;
  await connectDB();

  const subtasks = await Task.find({
    parentTaskId: taskId,
    spaceId: user.spaceId,
    archived: false,
  })
    .sort({ position: 1, createdAt: -1 })
    .lean();

  return NextResponse.json(subtasks);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId } = await params;
  const { title } = await req.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  await connectDB();

  const parent = await Task.findOne({ _id: taskId, spaceId: user.spaceId });
  if (!parent) return NextResponse.json({ error: "Parent task not found" }, { status: 404 });

  const lastSubtask = await Task.findOne({ parentTaskId: taskId }).sort({ position: -1 });

  const subtask = await Task.create({
    spaceId: user.spaceId,
    projectId: parent.projectId,
    parentTaskId: taskId,
    title: title.trim(),
    position: (lastSubtask?.position || 0) + 1,
  });

  return NextResponse.json(subtask, { status: 201 });
}
