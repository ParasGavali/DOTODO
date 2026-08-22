import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/server/db";
import { Task } from "@/server/models/Task";
import { getCurrentUser } from "@/server/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI is not configured" }, { status: 503 });

  await connectDB();

  const task = await Task.findOne({ _id: taskId, spaceId: user.spaceId }).lean();
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

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
            content: `Break this task into actionable subtasks. Return a JSON array of objects with "title" field only. Be specific and practical. Max 8 subtasks. Example: [{"title":"Subtask 1"},{"title":"Subtask 2"}]`,
          },
          { role: "user", content: `Task: ${task.title}\nDescription: ${task.description || "none"}\nPriority: P${4 - task.priority}` },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const subtasks = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json({ subtasks });
  } catch {
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
