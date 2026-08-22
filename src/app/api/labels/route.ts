import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/server/db";
import { Label } from "@/server/models/Label";
import { getCurrentUser } from "@/server/auth";
import { createLabelSchema } from "@/lib/validations";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const labels = await Label.find({ spaceId: user.spaceId }).sort({ name: 1 }).lean();
  return NextResponse.json(labels);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createLabelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  await connectDB();

  const label = await Label.create({
    spaceId: user.spaceId,
    name: parsed.data.name,
    color: parsed.data.color || "#8b5cf6",
  });

  return NextResponse.json(label, { status: 201 });
}
