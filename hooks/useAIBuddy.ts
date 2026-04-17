"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { BuddyChatMode, BuddyMessage, BuddyStreamChunk, BuddyToolAction } from "@/types/api";
import { isApiError } from "@/types/api";
import { useBuddyStore } from "@/store/buddyStore";

function newId(): string {
  return crypto.randomUUID();
}

function toApiMessages(msgs: BuddyMessage[]): Array<Pick<BuddyMessage, "role" | "content">> {
  return msgs.map(({ role, content }) => ({ role, content }));
}

export function useAIBuddy(coupleId: string | null) {
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);

  const messages = useBuddyStore((s) => s.messages);
  const activeMode = useBuddyStore((s) => s.activeMode);
  const addMessage = useBuddyStore((s) => s.addMessage);
  const appendToAssistant = useBuddyStore((s) => s.appendToAssistant);
  const patchAssistantMessage = useBuddyStore((s) => s.patchAssistantMessage);
  const setStreaming = useBuddyStore((s) => s.setStreaming);
  const addToolAction = useBuddyStore((s) => s.addToolAction);
  const clearToolActions = useBuddyStore((s) => s.clearToolActions);
  const setMessages = useBuddyStore((s) => s.setMessages);

  const loadHistory = useCallback(async () => {
    const res = await fetch("/api/ai/buddy/history");
    if (!res.ok) return;
    const data: unknown = await res.json();
    if (typeof data !== "object" || data === null || !("messages" in data)) return;
    const incoming = (data as { messages: BuddyMessage[] }).messages;
    if (!Array.isArray(incoming)) return;

    const prev = useBuddyStore.getState().messages;
    const serverIds = new Set(incoming.map((m) => m.id));
    const lastServerTs =
      incoming.length > 0 ? Date.parse(incoming[incoming.length - 1]!.createdAt) : 0;

    const key = (m: BuddyMessage) => `${m.role}:${m.mode}:${m.content.slice(0, 200)}`;
    const serverKeys = new Set(incoming.map(key));

    const tail = prev.filter((m) => {
      if (serverIds.has(m.id)) return false;
      if (serverKeys.has(key(m))) return false;
      return Date.parse(m.createdAt) >= lastServerTs - 60_000;
    });

    const merged = [...incoming, ...tail].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    setMessages(merged);
  }, [setMessages]);

  const sendMessage = useCallback(
    async (text: string, modeOverride?: BuddyChatMode) => {
      const trimmed = text.trim();
      if (!trimmed || !coupleId) return;

      const mode = modeOverride ?? useBuddyStore.getState().activeMode;
      const now = new Date().toISOString();
      const userMsg: BuddyMessage = {
        id: newId(),
        role: "user",
        content: trimmed,
        createdAt: now,
        mode,
      };
      addMessage(userMsg);

      const assistantId = newId();
      addMessage({
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: now,
        mode,
      });

      clearToolActions();
      setStreaming(true);
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const historyForApi = useBuddyStore
        .getState()
        .messages.filter((m) => m.id !== assistantId && m.mode === mode);

      try {
        const res = await fetch("/api/ai/buddy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            coupleId,
            mode,
            messages: toApiMessages(historyForApi),
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          let errMsg = res.statusText || "Request failed";
          const t = await res.text();
          if (t) {
            try {
              const j: unknown = JSON.parse(t);
              if (isApiError(j)) errMsg = j.error;
              else errMsg = t;
            } catch {
              errMsg = t;
            }
          }
          patchAssistantMessage(assistantId, {
            content: `Something went wrong: ${errMsg}`,
          });
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          patchAssistantMessage(assistantId, { content: "No response stream." });
          return;
        }

        const decoder = new TextDecoder();
        let buf = "";
        const toolBatch: BuddyToolAction[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let idx: number;
          while ((idx = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, idx).trim();
            buf = buf.slice(idx + 1);
            if (!line) continue;
            let chunk: BuddyStreamChunk;
            try {
              chunk = JSON.parse(line) as BuddyStreamChunk;
            } catch {
              continue;
            }

            if (chunk.type === "text") {
              appendToAssistant(assistantId, chunk.text);
            } else if (chunk.type === "tool_action") {
              addToolAction(chunk.action);
              toolBatch.push(chunk.action);
              if (chunk.action.navigateTo) {
                router.push(chunk.action.navigateTo);
              }
            } else if (chunk.type === "done") {
              const actions = chunk.toolActions?.length ? chunk.toolActions : toolBatch;
              patchAssistantMessage(assistantId, {
                ...(actions.length ? { toolActions: actions } : {}),
              });
            } else if (chunk.type === "error") {
              appendToAssistant(assistantId, `\n\n${chunk.message}`);
            }
          }
        }

        const final = useBuddyStore.getState().messages.find((m) => m.id === assistantId);
        if (final && !final.content.trim()) {
          patchAssistantMessage(assistantId, { content: "No response received." });
        }
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        patchAssistantMessage(assistantId, {
          content: "Something went wrong. Please try again.",
        });
      } finally {
        clearToolActions();
        setStreaming(false);
      }
    },
    [addMessage, addToolAction, appendToAssistant, clearToolActions, coupleId, patchAssistantMessage, router, setStreaming],
  );

  return { sendMessage, loadHistory };
}
