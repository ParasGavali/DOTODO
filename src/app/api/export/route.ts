import { NextResponse } from "next/server";
import { connectDB } from "@/server/db";
import { Task } from "@/server/models/Task";
import { Project } from "@/server/models/Project";
import { Label } from "@/server/models/Label";
import { getCurrentUser } from "@/server/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const [tasks, projects, labels] = await Promise.all([
    Task.find({ spaceId: user.spaceId }).lean(),
    Project.find({ spaceId: user.spaceId }).lean(),
    Label.find({ spaceId: user.spaceId }).lean(),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    space: { id: user.spaceId },
    tasks: tasks.map((t) => ({
      id: t._id,
      title: t.title,
      description: t.description,
      completed: t.completed,
      priority: t.priority,
      dueDate: t.dueDate,
      dueTime: t.dueTime,
      notes: t.notes,
      projectId: t.projectId,
      parentTaskId: t.parentTaskId,
      labels: t.labels,
      createdAt: t.createdAt,
      completedAt: t.completedAt,
    })),
    projects: projects.map((p) => ({
      id: p._id,
      name: p.name,
      description: p.description,
      color: p.color,
    })),
    labels: labels.map((l) => ({
      id: l._id,
      name: l.name,
      color: l.color,
    })),
  };

  return NextResponse.json(exportData, {
    headers: {
      "Content-Disposition": `attachment; filename="dotodo-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
