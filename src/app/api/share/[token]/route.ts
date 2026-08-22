import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/server/db";
import { ShareLink } from "@/server/models/ShareLink";
import { Task } from "@/server/models/Task";
import { Project } from "@/server/models/Project";
import { Space } from "@/server/models/Space";
import { verifyShareToken } from "@/lib/crypto";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  await connectDB();

  // Find all active share links and check token
  const links = await ShareLink.find({ active: true }).lean();

  let matchedLink = null;
  for (const link of links) {
    const valid = await verifyShareToken(token, link.tokenHash);
    if (valid) {
      matchedLink = link;
      break;
    }
  }

  if (!matchedLink) {
    return NextResponse.json({ error: "Share link not found or expired" }, { status: 404 });
  }

  // Check expiry
  if (matchedLink.expiresAt && new Date(matchedLink.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Share link has expired" }, { status: 410 });
  }

  // Get space info
  const space = await Space.findById(matchedLink.spaceId).lean();
  if (!space) return NextResponse.json({ error: "Space not found" }, { status: 404 });

  // Get tasks
  const taskQuery: Record<string, unknown> = { spaceId: matchedLink.spaceId, parentTaskId: null, archived: false };
  if (matchedLink.projectId) taskQuery.projectId = matchedLink.projectId;

  const tasks = await Task.find(taskQuery).sort({ position: 1, createdAt: -1 }).lean();
  const projects = matchedLink.projectId
    ? [await Project.findById(matchedLink.projectId).lean()]
    : await Project.find({ spaceId: matchedLink.spaceId, archived: false }).lean();

  return NextResponse.json({
    permission: matchedLink.permission,
    spaceName: space.name,
    tasks,
    projects: projects.filter(Boolean),
  });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  await connectDB();

  // Deactivate share link
  const links = await ShareLink.find({ active: true }).lean();
  for (const link of links) {
    const valid = await verifyShareToken(token, link.tokenHash);
    if (valid) {
      await ShareLink.updateOne({ _id: link._id }, { active: false });
      return NextResponse.json({ ok: true });
    }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
