import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/server/db";
import { Project } from "@/server/models/Project";
import { Task } from "@/server/models/Task";
import { getCurrentUser } from "@/server/auth";
import { createProjectSchema } from "@/lib/validations";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const projects = await Project.find({ spaceId: user.spaceId, archived: false })
    .sort({ position: 1, createdAt: -1 })
    .lean();

  // Add task counts
  const projectsWithCounts = await Promise.all(
    projects.map(async (p) => {
      const taskCount = await Task.countDocuments({
        spaceId: user.spaceId,
        projectId: p._id,
        completed: false,
      });
      return { ...p, taskCount };
    })
  );

  return NextResponse.json(projectsWithCounts);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  await connectDB();

  const lastProject = await Project.findOne({ spaceId: user.spaceId }).sort({ position: -1 });

  const project = await Project.create({
    spaceId: user.spaceId,
    name: parsed.data.name,
    description: parsed.data.description || "",
    icon: parsed.data.icon || "folder",
    color: parsed.data.color || "#6366f1",
    position: (lastProject?.position || 0) + 1,
  });

  return NextResponse.json(project, { status: 201 });
}
