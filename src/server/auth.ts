import { cookies } from "next/headers";
import { connectDB } from "@/server/db";
import { Session } from "@/server/models/Session";
import { hashSessionToken, generateSessionToken, hashOwnerKey, generateOwnerKey, verifyOwnerKey, generateRoomId } from "@/lib/crypto";
import { SESSION_MAX_AGE_DAYS } from "@/lib/constants";
import { Owner } from "@/server/models/Owner";
import { Space } from "@/server/models/Space";
import { SpaceMember } from "@/server/models/SpaceMember";
import { Project } from "@/server/models/Project";
import { DEFAULT_PROJECTS } from "@/lib/constants";

export interface AuthUser {
  ownerId: string;
  spaceId: string;
  sessionId: string;
}

export async function createSpace(name: string): Promise<{ ownerKey: string; spaceId: string; roomId: string; ownerId: string }> {
  await connectDB();

  const ownerKey = generateOwnerKey();
  const ownerKeyHash = await hashOwnerKey(ownerKey);

  const owner = await Owner.create({ name, ownerKeyHash });
  const roomId = generateRoomId();
  const space = await Space.create({ ownerId: owner._id, name, roomId });
  await SpaceMember.create({ spaceId: space._id, ownerId: owner._id, role: "owner" });

  for (const proj of DEFAULT_PROJECTS) {
    await Project.create({ spaceId: space._id, ...proj });
  }

  return { ownerKey, spaceId: space._id.toString(), roomId, ownerId: owner._id.toString() };
}

export async function accessSpace(ownerKey: string): Promise<{ spaceId: string; ownerId: string } | null> {
  await connectDB();

  const owner = await Owner.findOne({});
  if (!owner) return null;

  const owners = await Owner.find({}).lean();

  for (const o of owners) {
    const valid = await verifyOwnerKey(ownerKey, o.ownerKeyHash);
    if (valid) {
      const space = await Space.findOne({ ownerId: o._id });
      if (!space) return null;
      return { spaceId: space._id.toString(), ownerId: o._id.toString() };
    }
  }

  return null;
}

export async function createSession(ownerId: string): Promise<string> {
  await connectDB();

  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_MAX_AGE_DAYS);

  await Session.create({ ownerId, tokenHash, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set("dotodo_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
    path: "/",
  });

  return token;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("dotodo_session")?.value;
    if (!token) return null;

    await connectDB();
    const tokenHash = hashSessionToken(token);

    const session = await Session.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
    });

    if (!session) return null;

    const space = await Space.findOne({ ownerId: session.ownerId });
    if (!space) return null;

    return {
      ownerId: session.ownerId.toString(),
      spaceId: space._id.toString(),
      sessionId: session._id.toString(),
    };
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get("dotodo_session")?.value;

  if (token) {
    await connectDB();
    const tokenHash = hashSessionToken(token);
    await Session.deleteOne({ tokenHash });
  }

  cookieStore.delete("dotodo_session");
}
