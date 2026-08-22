import { NextRequest, NextResponse } from "next/server";
import { createSpaceSchema } from "@/lib/validations";
import { createSpace, createSession } from "@/server/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSpaceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name } = parsed.data;
    const result = await createSpace(name);

    const response = NextResponse.json({
      ownerKey: result.ownerKey,
      spaceId: result.spaceId,
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
  } catch (error) {
    console.error("Create space error:", error);
    return NextResponse.json({ error: "Failed to create space. Try again." }, { status: 500 });
  }
}
