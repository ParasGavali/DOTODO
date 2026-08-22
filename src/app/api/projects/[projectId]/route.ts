import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/server/db";
import { Project } from "@/server/models/Project";
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

  const project = await Project.findOne({ _id: projectId, spaceId: user.spaceId }).lean();
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json(project);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const body = await req.json();

  await connectDB();

  const project = await Project.findOneAndUpdate(
    { _id: projectId, spaceId: user.spaceId },
    body,
    { new: true }
  ).lean();

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json(project);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  await connectDB();

  // Move tasks to inbox, then delete project
  await Task.updateMany(
    { projectId, spaceId: user.spaceId },
    { projectId: null }
  );

  await Project.deleteOne({ _id: projectId, spaceId: user.spaceId });

  return NextResponse.json({ ok: true });
}
