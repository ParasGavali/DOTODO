import { NextResponse } from "next/server";
import { getCurrentUser, logout } from "@/server/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ ownerId: user.ownerId, spaceId: user.spaceId });
}

export async function POST() {
  await logout();
  return NextResponse.json({ ok: true });
}
