import { cookies } from "next/headers";
import { connectDB } from "@/server/db";
import { Session } from "@/server/models/Session";
import { hashSessionToken, generateSessionToken, hashOwnerKey, generateOwnerKey, verifyOwnerKey } from "@/lib/crypto";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_DAYS } from "@/lib/constants";
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

export async function createSpace(name: string): Promise<{ ownerKey: string; spaceId: string; ownerId: string }> {
  await connectDB();

  const ownerKey = generateOwnerKey();
  const ownerKeyHash = await hashOwnerKey(ownerKey);

  const owner = await Owner.create({ name, ownerKeyHash });
  const space = await Space.create({ ownerId: owner._id, name });
  await SpaceMember.create({ spaceId: space._id, ownerId: owner._id, role: "owner" });

  // Create default projects
  for (const proj of DEFAULT_PROJECTS) {
    await Project.create({ spaceId: space._id, ...proj });
  }

  // Create session
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_MAX_AGE_DAYS);

  await Session.create({
    ownerId: owner._id,
    tokenHash,
    expiresAt,
  });

  return { ownerKey, spaceId: space._id.toString(), ownerId: owner._id.toString() };
}

export async function accessSpace(ownerKey: string): Promise<{ spaceId: string; ownerId: string } | null> {
  await connectDB();

  // Find all owners and check the key
  const owners = await Owner.find({}).limit(100);

  for (const owner of owners) {
    const valid = await verifyOwnerKey(ownerKey, owner.ownerKeyHash);
    if (valid) {
      const space = await Space.findOne({ ownerId: owner._id });
      if (!space) return null;

      // Create session
      const token = generateSessionToken();
      const tokenHash = hashSessionToken(token);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + SESSION_MAX_AGE_DAYS);

      await Session.create({
        ownerId: owner._id,
        tokenHash,
        expiresAt,
      });

      return { spaceId: space._id.toString(), ownerId: owner._id.toString() };
    }
  }

  return null;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    await connectDB();
    const tokenHash = hashSessionToken(token);

    const session = await Session.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
    }).populate("ownerId");

    if (!session || !session.ownerId) return null;

    const owner = session.ownerId as unknown as { _id: { toString(): string } };
    const space = await Space.findOne({ ownerId: owner._id });
    if (!space) return null;

    return {
      ownerId: owner._id.toString(),
      spaceId: space._id.toString(),
      sessionId: session._id.toString(),
    };
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await connectDB();
    const tokenHash = hashSessionToken(token);
    await Session.deleteOne({ tokenHash });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
