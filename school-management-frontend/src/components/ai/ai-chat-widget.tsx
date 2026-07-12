"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { aiChatService } from "@/services/ai-chat.service";
import { useAuth } from "@/hooks/use-auth";

type Message = { role: "user" | "assistant"; text: string };
const prompts = ["What is on my timetable?", "How do I request leave?", "Where can I find notices?"];

export function AiChatWidget() {
  const [open, setOpen] = useState(false); const [text, setText] = useState(""); const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]); const { user } = useAuth();
  const send = async (value = text) => {
    if (!value.trim() || sending) return;
    setMessages((m) => [...m, { role: "user", text: value }]); setText(""); setSending(true);
    try { const data = await aiChatService.chat(value, user?.roles[0]); setMessages((m) => [...m, { role: "assistant", text: data.reply }]); }
    catch { toast.error("School assistant is unavailable"); }
    finally { setSending(false); }
  };
  return <div className="fixed bottom-5 right-5 z-50">
    {open && <section className="mb-3 flex h-105 w-[min(23rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--background)] shadow-2xl">
      <header className="flex items-center justify-between bg-[var(--primary)] px-5 py-4 text-white"><div><p className="font-display font-bold">School assistant</p><p className="text-xs text-teal-100">Quick SIS guidance</p></div><button aria-label="Close assistant" onClick={() => setOpen(false)}><X size={19} /></button></header>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">{!messages.length && <><p className="text-sm text-[var(--muted-foreground)]">Ask about school services, your dashboard, or what to do next.</p><div className="flex flex-wrap gap-2">{prompts.map((p) => <button key={p} onClick={() => send(p)} className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs hover:bg-[var(--muted)]">{p}</button>)}</div></>}{messages.map((m, i) => <p key={i} className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "ml-auto bg-[var(--primary)] text-white" : "bg-[var(--muted)]"}`}>{m.text}</p>)}</div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t p-3"><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask a question…" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /><button disabled={sending} aria-label="Send message" className="rounded-xl bg-[var(--primary)] p-2 text-white"><Send size={16} /></button></form>
    </section>}
    <button onClick={() => setOpen(!open)} aria-label="Open school assistant" className="ml-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-lg"><MessageCircle size={21} /></button>
  </div>;
}
