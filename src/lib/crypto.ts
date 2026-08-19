import crypto from "crypto";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

// --- Owner Key ---

export function generateOwnerKey(): string {
  const raw = crypto.randomBytes(8).toString("hex").toUpperCase();
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
}

export async function hashOwnerKey(key: string): Promise<string> {
  return bcrypt.hash(key, BCRYPT_ROUNDS);
}

export async function verifyOwnerKey(key: string, hash: string): Promise<boolean> {
  return bcrypt.compare(key, hash);
}

// --- Session Token ---

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// --- Share Token ---

export function generateShareToken(): string {
  return crypto.randomBytes(12).toString("base64url").slice(0, 16);
}

export async function hashShareToken(token: string): Promise<string> {
  return bcrypt.hash(token, BCRYPT_ROUNDS);
}

export async function verifyShareToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash);
}

// --- Validation ---

export function isValidOwnerKey(key: string): boolean {
  return /^[A-F0-9]{4}-[A-F0-9]{4}$/.test(key);
}
