import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/server/db";
import { Task } from "@/server/models/Task";
import { Project } from "@/server/models/Project";
import { Label } from "@/server/models/Label";
import { getCurrentUser } from "@/server/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q?.trim()) return NextResponse.json([]);

  await connectDB();
  const regex = new RegExp(q.trim(), "i");

  const [tasks, projects, labels] = await Promise.all([
    Task.find({
      spaceId: user.spaceId,
      $or: [{ title: regex }, { description: regex }, { notes: regex }],
      archived: false,
    })
      .limit(20)
      .lean(),
    Project.find({
      spaceId: user.spaceId,
      $or: [{ name: regex }, { description: regex }],
    })
      .limit(10)
      .lean(),
    Label.find({
      spaceId: user.spaceId,
      name: regex,
    })
      .limit(10)
      .lean(),
  ]);

  return NextResponse.json({ tasks, projects, labels });
}
