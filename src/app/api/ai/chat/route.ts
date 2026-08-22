import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/server/db";
import { Task } from "@/server/models/Task";
import { getCurrentUser } from "@/server/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prompt, context } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI is not configured" }, { status: 503 });
  }

  await connectDB();

  // Gather context
  let systemPrompt = `You are DOTODO AI, a productivity assistant. Be concise and actionable. Current date: ${new Date().toISOString().split("T")[0]}.`;

  if (context?.projectId) {
    const tasks = await Task.find({
      spaceId: user.spaceId,
      projectId: context.projectId,
      archived: false,
    }).lean();
    systemPrompt += `\n\nProject tasks:\n${tasks.map((t) => `- [${t.completed ? "x" : " "}] ${t.title} (priority: ${t.priority})`).join("\n")}`;
  }

  if (context?.todayTasks) {
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
    }).sort({ priority: -1, dueDate: 1 }).lean();
    systemPrompt += `\n\nToday's tasks:\n${tasks.map((t) => `- [${t.completed ? "x" : " "}] ${t.title} (P${4 - t.priority}, due: ${t.dueDate || "none"})`).join("\n")}`;
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
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "I couldn't generate a response.";

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
