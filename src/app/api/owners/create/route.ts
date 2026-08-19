import { NextRequest, NextResponse } from "next/server";
import { createSpaceSchema } from "@/lib/validations";
import { createSpace } from "@/server/auth";
import { setSessionCookie } from "@/server/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSpaceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name } = parsed.data;
    const result = await createSpace(name);

    // Set session cookie
    const { generateSessionToken, hashSessionToken } = await import("@/lib/crypto");
    const { Session } = await import("@/server/models/Session");
    const { connectDB } = await import("@/server/db");

    // We need to get the token that was just created
    // Re-query the most recent session for this owner
    await connectDB();
    const sessions = await Session.find({ ownerId: result.ownerId })
      .sort({ createdAt: -1 })
      .limit(1);

    // The token was returned from createSpace but we need to set it as cookie
    // Actually, we need to modify createSpace to return the token too
    // For now, let's use a different approach
    // Let's just set a fresh session

    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Delete old session and create new one
    if (sessions.length > 0) {
      await Session.deleteOne({ _id: sessions[0]._id });
    }

    await Session.create({
      ownerId: result.ownerId,
      tokenHash,
      expiresAt,
    });

    const response = NextResponse.json({
      ownerKey: result.ownerKey,
      spaceId: result.spaceId,
    });

    // Set cookie on response
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
    return NextResponse.json(
      { error: "Failed to create space. Try again." },
      { status: 500 }
    );
  }
}
