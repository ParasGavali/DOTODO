import { NextRequest, NextResponse } from "next/server";
import { accessSpaceSchema } from "@/lib/validations";
import { accessSpace, createSession } from "@/server/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = accessSpaceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { ownerKey } = parsed.data;
    const result = await accessSpace(ownerKey);

    if (!result) {
      return NextResponse.json({ error: "Invalid Owner Key. Check and try again." }, { status: 401 });
    }

    const response = NextResponse.json({
      spaceId: result.spaceId,
      ownerId: result.ownerId,
    });

    const token = await createSession(result.ownerId);

    response.cookies.set("dotodo_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Access space error:", error);
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("ECONNREFUSED") || msg.includes("ETIMEOUT") || msg.includes("ServerSelection") || msg.includes("ReplicaSetNoPrimary")) {
      return NextResponse.json({ error: "Database connection failed. Please try again later." }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to access space. Try again." }, { status: 500 });
  }
}
