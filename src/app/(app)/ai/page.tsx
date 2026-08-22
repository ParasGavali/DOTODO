"use client";

import { useState } from "react";
import { useTasks, useProjects } from "@/hooks/use-data";
import { Sparkles, Send } from "lucide-react";

export default function AiPage() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg, context: { todayTasks: true } }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || data.error }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-full flex-col px-6 pt-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Sparkles size={24} className="text-primary-1" /> AI Assistant</h1>
        <p className="mt-1 text-sm text-text-muted">Your productivity partner. Ask anything about your tasks.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 text-4xl opacity-20">&#x2728;</div>
            <p className="text-sm text-text-dim">Ask me to break down tasks, plan your day, or help with projects.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm ${
              msg.role === "user" ? "bg-primary text-white" : "bg-surface-1 text-text"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-surface-1 px-4 py-2.5 text-sm text-text-dim">Thinking...</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="border-t border-border py-3">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 focus-within:border-primary">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI about your tasks..."
            className="flex-1 bg-transparent text-sm text-text placeholder-text-dim outline-none" />
          <button type="submit" disabled={loading || !input.trim()}
            className="text-primary hover:text-primary-1 disabled:text-text-dim">
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
