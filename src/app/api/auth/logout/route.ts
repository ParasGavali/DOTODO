import { NextResponse } from "next/server";
import { logout } from "@/server/auth";

export async function POST() {
  await logout();
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("dotodo_session");
  return response;
}
