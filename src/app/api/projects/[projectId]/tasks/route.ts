import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/server/db";
import { Task } from "@/server/models/Task";
import { getCurrentUser } from "@/server/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  await connectDB();

  const tasks = await Task.find({
    projectId,
    spaceId: user.spaceId,
    parentTaskId: null,
    archived: false,
  })
    .sort({ position: 1, createdAt: -1 })
    .lean();

  return NextResponse.json(tasks);
}
