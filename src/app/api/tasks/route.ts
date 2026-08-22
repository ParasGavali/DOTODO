import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/server/db";
import { Task } from "@/server/models/Task";
import { getCurrentUser } from "@/server/auth";
import { createTaskSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const completed = searchParams.get("completed");
  const inbox = searchParams.get("inbox");
  const dueDate = searchParams.get("dueDate");
  const parentTaskId = searchParams.get("parentTaskId");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = { spaceId: user.spaceId, archived: false };

  if (projectId) query.projectId = projectId;
  if (completed !== null && completed !== undefined) query.completed = completed === "true";
  if (inbox === "true") query.projectId = null;
  if (parentTaskId) query.parentTaskId = parentTaskId;
  else if (!parentTaskId && searchParams.has("parentTaskId") === false) {
    // By default, only return top-level tasks (no parent) unless specified
  }

  // If no specific parentTaskId filter, only get top-level tasks
  if (!parentTaskId && !searchParams.has("parentTaskId")) {
    query.parentTaskId = null;
  }

  if (dueDate) {
    const start = new Date(dueDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dueDate);
    end.setHours(23, 59, 59, 999);
    query.dueDate = { $gte: start, $lte: end };
  }

  const tasks = await Task.find(query).sort({ position: 1, createdAt: -1 }).lean();
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createTaskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  await connectDB();

  const { title, projectId, parentTaskId, description, priority, dueDate, dueTime, labels, estimatedMinutes } = parsed.data;

  const lastTask = await Task.findOne({
    spaceId: user.spaceId,
    parentTaskId: parentTaskId || null,
    projectId: projectId || null,
  }).sort({ position: -1 });

  const task = await Task.create({
    spaceId: user.spaceId,
    projectId: projectId || null,
    parentTaskId: parentTaskId || null,
    title,
    description: description || "",
    priority: priority || 0,
    dueDate: dueDate ? new Date(dueDate) : null,
    dueTime: dueTime || null,
    labels: labels || [],
    estimatedMinutes: estimatedMinutes || null,
    position: (lastTask?.position || 0) + 1,
  });

  return NextResponse.json(task, { status: 201 });
}
