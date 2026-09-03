import { NextResponse } from "next/server";
import { getCurrentUser, logout } from "@/server/auth";
import { Space } from "@/server/models/Space";
import { connectDB } from "@/server/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  await connectDB();
  const space = await Space.findById(user.spaceId).lean();
  return NextResponse.json({
    ownerId: user.ownerId,
    spaceId: user.spaceId,
    roomId: space?.roomId ?? null,
    spaceName: space?.name ?? null,
  });
}

export async function POST() {
  await logout();
  return NextResponse.json({ ok: true });
}
