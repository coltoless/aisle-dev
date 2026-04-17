"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUp, Loader2, X } from "lucide-react";
import { useAIBuddy } from "@/hooks/useAIBuddy";
import type { BuddyChatMode } from "@/types/api";
import { useBuddyStore } from "@/store/buddyStore";
import { ChatMessage } from "@/components/buddy/ChatMessage";
import { cn } from "@/lib/utils";

const MODES: { id: BuddyChatMode; label: string; emoji: string }[] = [
  { id: "planning", label: "Planning", emoji: "\u{1F4AC}" },
  { id: "vendor_email", label: "Vendor Email", emoji: "\u{1F4E7}" },
  { id: "vision_board", label: "Vision Board", emoji: "\u{1F3A8}" },
  { id: "timeline", label: "Day-of Timeline", emoji: "\u{1F4CB}" },
];

const MODE_HINT: Record<BuddyChatMode, string> = {
  planning: "Knows your full wedding profile",
  vendor_email: "Drafting on your behalf",
  vision_board: "Generating visual concepts",
  timeline: "Building your day-of schedule",
};

const SUGGESTED: string[] = [
  "What should I be working on right now?",
  "Am I on track with my budget?",
  "Help me write a vendor inquiry email",
  "What vendors do I still need to book?",
];

const INTRO: Record<Exclude<BuddyChatMode, "planning">, string> = {
  vendor_email:
    "I can draft vendor inquiry emails for you. Tell me which vendor type you're reaching out to, and I'll write something professional that reflects your wedding style and asks the right questions.",
  vision_board:
    "Describe the feeling you want for your wedding — a vibe, a place, an era, a color, anything. I'll build you a visual concept and mood description to share with your vendors.",
  timeline:
    "I'll build your complete day-of timeline. To start, tell me: what time does your ceremony begin, and what time does your reception end? I'll handle everything in between.",
};

type BuddyChatPanelProps = {
  coupleId: string;
  /** When true, fetch proactive nudge once when this panel mounts */
  enableProactiveNudge?: boolean;
  /** Drawer-style top bar with wordmark + close; hide for full-page layout */
  showWindowChrome?: boolean;
  /** Full-page history focus: only show messages whose ids are listed */
  visibleMessageIds?: string[] | null;
  className?: string;
};

export function BuddyChatPanel({
  coupleId,
  enableProactiveNudge = false,
  showWindowChrome = true,
  visibleMessageIds = null,
  className,
}: BuddyChatPanelProps) {
  const messages = useBuddyStore((s) => s.messages);
  const isStreaming = useBuddyStore((s) => s.isStreaming);
  const activeMode = useBuddyStore((s) => s.activeMode);
  const setActiveMode = useBuddyStore((s) => s.setActiveMode);
  const patchAssistantMessage = useBuddyStore((s) => s.patchAssistantMessage);
  const { sendMessage, loadHistory } = useAIBuddy(coupleId);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const nudgeFetched = useRef(false);

  const allowed = visibleMessageIds?.length ? new Set(visibleMessageIds) : null;
  const filtered = messages.filter(
    (m) => m.mode === activeMode && (!allowed || allowed.has(m.id)),
  );
  const showSuggestions =
    activeMode === "planning" && filtered.length === 0 && !isStreaming;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filtered, isStreaming]);

  const historyLoaded = useRef(false);
  useEffect(() => {
    if (historyLoaded.current) return;
    historyLoaded.current = true;
    void (async () => {
      await loadHistory();
      if (!enableProactiveNudge || nudgeFetched.current) return;
      nudgeFetched.current = true;
      const msgs = useBuddyStore.getState().messages;
      const last = msgs.length ? msgs[msgs.length - 1] : null;
      const stale =
        last && Date.now() - new Date(last.createdAt).getTime() > 24 * 60 * 60 * 1000;
      if (msgs.length > 0 && !stale) return;
      const res = await fetch("/api/ai/buddy/nudge");
      if (!res.ok) return;
      const data: unknown = await res.json();
      if (typeof data !== "object" || data === null || !("nudge" in data)) return;
      const nudge = (data as { nudge: string | null }).nudge;
      if (!nudge) return;
      if (useBuddyStore.getState().messages.some((m) => m.ephemeral)) return;
      useBuddyStore.getState().addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: nudge,
        createdAt: new Date().toISOString(),
        mode: "planning",
        ephemeral: true,
      });
    })();
  }, [enableProactiveNudge, loadHistory]);

  const onSubmit = useCallback(() => {
    const t = input.trim();
    if (!t || isStreaming) return;
    setInput("");
    void sendMessage(t);
  }, [input, isStreaming, sendMessage]);

  const removeToolAction = useCallback(
    (messageId: string, index: number) => {
      const m = useBuddyStore.getState().messages.find((x) => x.id === messageId);
      if (!m?.toolActions) return;
      patchAssistantMessage(messageId, {
        toolActions: m.toolActions.filter((_, i) => i !== index),
      });
    },
    [patchAssistantMessage],
  );

  let prevCreated: string | undefined;

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      {showWindowChrome ? (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-border)] px-4">
          <div>
            <p className="font-display text-lg font-semibold text-[var(--color-text-primary)]">Aisle</p>
            <p className="text-[11px] text-[var(--color-text-muted)]">Your Planning Buddy</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => useBuddyStore.getState().setBuddyOpen(false)}
            className="flex size-8 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]"
          >
            <X className="size-5" />
          </button>
        </header>
      ) : null}

      <div className="flex h-12 shrink-0 items-center gap-2 overflow-x-auto border-b border-[var(--color-border)] px-3">
        {MODES.map((m) => {
          const sel = activeMode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveMode(m.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                sel
                  ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
                  : "bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]",
              )}
            >
              <span className="mr-1">{m.emoji}</span>
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {activeMode !== "planning" && filtered.length === 0 ? (
          <div className="mb-4 max-w-[85%] rounded-[12px_12px_12px_2px] border-l-2 border-[var(--color-accent)] bg-[var(--color-bg-card)] px-3.5 py-2.5 text-[14px] leading-relaxed text-[var(--color-text-primary)] shadow-[var(--shadow-sm)]">
            {INTRO[activeMode as keyof typeof INTRO]}
          </div>
        ) : null}

        {showSuggestions ? (
          <div className="mb-4 flex flex-col gap-2">
            {SUGGESTED.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => void sendMessage(p)}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-left text-[13px] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)]"
              >
                {p}
              </button>
            ))}
          </div>
        ) : null}

               <div className="flex flex-col gap-4">
          {filtered.map((msg, i) => {
            const divider =
              i > 0 &&
              new Date(msg.createdAt).toDateString() !== new Date(filtered[i - 1]!.createdAt).toDateString();

            const els: ReactNode[] = [];
            if (divider) {
              const d = new Date(msg.createdAt);
              els.push(
                <p
                  key={`div-${msg.id}`}
                  className="text-center text-[11px] font-medium text-[var(--color-text-muted)]"
                >
                  Previous conversation · {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </p>,
              );
            }
            const lastAssistant =
              msg.role === "assistant" &&
              filtered.slice(i + 1).every((m) => m.role !== "assistant");
            els.push(
              <ChatMessage
                key={msg.id}
                message={msg}
                isStreaming={isStreaming && lastAssistant}
                isLastAssistant={lastAssistant}
                prevCreatedAt={prevCreated}
                onRemoveToolAction={removeToolAction}
              />,
            );
            prevCreated = msg.createdAt;
            return els;
          })}
        </div>
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
        <div className="flex gap-2">
          <textarea
            rows={2}
            value={input}
            disabled={isStreaming}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
            placeholder="Message Aisle…"
            className={cn(
              "min-h-[48px] max-h-[144px] flex-1 resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]",
              isStreaming && "opacity-60",
            )}
          />
          <button
            type="button"
            disabled={isStreaming || !input.trim()}
            onClick={onSubmit}
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)] disabled:opacity-40"
            aria-label="Send"
          >
            {isStreaming ? <Loader2 className="size-5 animate-spin" /> : <ArrowUp className="size-5" />}
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-[var(--color-text-muted)]">{MODE_HINT[activeMode]}</p>
      </div>
    </div>
  );
}
