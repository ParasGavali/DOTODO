import { NextRequest, NextResponse } from "next/server";
import { accessSpaceSchema } from "@/lib/validations";
import { accessSpace } from "@/server/auth";
import { generateSessionToken, hashSessionToken } from "@/lib/crypto";
import { connectDB } from "@/server/db";
import { Session } from "@/server/models/Session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = accessSpaceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { ownerKey } = parsed.data;
    const result = await accessSpace(ownerKey);

    if (!result) {
      return NextResponse.json(
        { error: "Invalid Owner Key. Check and try again." },
        { status: 401 }
      );
    }

    // Create a fresh session with token we can set as cookie
    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await connectDB();

    // Remove the session that accessSpace just created, replace with ours
    const recentSessions = await Session.find({ ownerId: result.ownerId })
      .sort({ createdAt: -1 })
      .limit(2);

    if (recentSessions.length > 1) {
      await Session.deleteOne({ _id: recentSessions[0]._id });
    }

    await Session.create({
      ownerId: result.ownerId,
      tokenHash,
      expiresAt,
    });

    const response = NextResponse.json({
      spaceId: result.spaceId,
      ownerId: result.ownerId,
    });

    response.cookies.set("dotodo_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Access space error:", error);
    return NextResponse.json(
      { error: "Failed to access space. Try again." },
      { status: 500 }
    );
  }
}
