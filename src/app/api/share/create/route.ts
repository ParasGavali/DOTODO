import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/server/db";
import { ShareLink } from "@/server/models/ShareLink";
import { getCurrentUser } from "@/server/auth";
import { generateShareToken, hashShareToken } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { spaceId, projectId, permission, expiresInDays } = await req.json();

  await connectDB();

  const token = generateShareToken();
  const tokenHash = await hashShareToken(token);

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const shareLink = await ShareLink.create({
    spaceId: spaceId || user.spaceId,
    projectId: projectId || null,
    tokenHash,
    permission: permission || "viewer",
    expiresAt,
    createdBy: user.ownerId,
  });

  return NextResponse.json({
    id: shareLink._id,
    token,
    permission: shareLink.permission,
    expiresAt: shareLink.expiresAt,
  }, { status: 201 });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const links = await ShareLink.find({ spaceId: user.spaceId, active: true })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(links);
}
