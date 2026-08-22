import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/server/db";
import { Task } from "@/server/models/Task";
import { getCurrentUser } from "@/server/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI is not configured" }, { status: 503 });

  await connectDB();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tasks = await Task.find({
    spaceId: user.spaceId,
    completed: false,
    archived: false,
    $or: [
      { dueDate: { $gte: today, $lt: tomorrow } },
      { dueDate: { $lt: today } },
    ],
  })
    .sort({ priority: -1, dueDate: 1 })
    .lean();

  if (tasks.length === 0) {
    return NextResponse.json({ schedule: [], message: "No tasks for today. Enjoy your free time!" });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Create an optimal daily schedule. Return JSON array of objects with "time" (HH:mm), "taskId" (from given list), and "title". Spread tasks through the day starting 9 AM. Max 1 hour per task. Example: [{"time":"09:00","taskId":"abc","title":"Task name"}]`,
          },
          {
            role: "user",
            content: `Tasks:\n${tasks.map((t) => `- ID: ${t._id} | ${t.title} | P${4 - t.priority} | Est: ${t.estimatedMinutes || 30}min`).join("\n")}`,
          },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const schedule = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json({ schedule });
  } catch {
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
