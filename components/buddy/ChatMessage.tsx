"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { BuddyMessage } from "@/types/api";
import { cn } from "@/lib/utils";
import {
  looksLikeEmailDraft,
  looksLikeTimeline,
  looksLikeVisionBoard,
  splitEmailBody,
} from "@/lib/buddy/detect";
import { ActionPill } from "@/components/buddy/ActionPill";
import { EmailDraftCard } from "@/components/buddy/EmailDraftCard";
import { VisionBoardCard } from "@/components/buddy/VisionBoardCard";
import { TimelineCard } from "@/components/buddy/TimelineCard";
import { useBuddyStore } from "@/store/buddyStore";

function formatMsgTime(iso: string, prevIso?: string): string {
  const d = new Date(iso);
  const prev = prevIso ? new Date(prevIso) : null;
  const showDate =
    prev &&
    (d.getDate() !== prev.getDate() ||
      d.getMonth() !== prev.getMonth() ||
      d.getFullYear() !== prev.getFullYear());
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (showDate) {
    return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${time}`;
  }
  return time;
}

type ChatMessageProps = {
  message: BuddyMessage;
  isStreaming: boolean;
  isLastAssistant: boolean;
  prevCreatedAt?: string;
  onRemoveToolAction?: (messageId: string, index: number) => void;
};

export function ChatMessage({
  message,
  isStreaming,
  isLastAssistant,
  prevCreatedAt,
  onRemoveToolAction,
}: ChatMessageProps) {
  const patchAssistantMessage = useBuddyStore((s) => s.patchAssistantMessage);

  if (message.role === "user") {
    return (
      <div className="flex flex-col items-end gap-1">
        <div
          className={cn(
            "max-w-[80%] rounded-[12px_12px_2px_12px] bg-[var(--color-accent)] px-3.5 py-2.5",
            "text-[14px] leading-relaxed text-[var(--color-accent-foreground)]",
          )}
        >
          {message.content}
        </div>
        <time className="text-[11px] text-[var(--color-text-muted)]" dateTime={message.createdAt}>
          {formatMsgTime(message.createdAt, prevCreatedAt)}
        </time>
      </div>
    );
  }

  const emailSplit =
    looksLikeEmailDraft(message.content, message.mode) ? splitEmailBody(message.content) : null;
  const showVision = looksLikeVisionBoard(message.content, message.mode);
  const showTimeline = looksLikeTimeline(message.content, message.mode);

  const showCursor = isStreaming && isLastAssistant && !showVision && !showTimeline;

  return (
    <div className="flex flex-col items-start gap-1">
      <div
        className={cn(
          "w-full max-w-[85%] rounded-[12px_12px_12px_2px] border-l-2 border-[var(--color-accent)]",
          "bg-[var(--color-bg-card)] px-3.5 py-2.5 text-[14px] leading-[1.6] text-[var(--color-text-primary)] shadow-[var(--shadow-sm)]",
        )}
      >
        {emailSplit ? (
          <div className="space-y-3">
            {emailSplit.before ? (
              <div className="prose-ai text-[var(--color-text-primary)]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{emailSplit.before}</ReactMarkdown>
              </div>
            ) : null}
            <EmailDraftCard
              initialBody={emailSplit.email}
              onBodyChange={(body) => {
                const merged = [emailSplit.before, body, emailSplit.after].filter(Boolean).join("\n\n");
                patchAssistantMessage(message.id, { content: merged });
              }}
            />
            {emailSplit.after ? (
              <div className="prose-ai text-[var(--color-text-primary)]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{emailSplit.after}</ReactMarkdown>
              </div>
            ) : null}
          </div>
        ) : showVision ? (
          <VisionBoardCard content={message.content} />
        ) : showTimeline ? (
          <TimelineCard content={message.content} />
        ) : (
          <div className="prose-ai text-[var(--color-text-primary)]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content || (showCursor ? " " : "")}</ReactMarkdown>
            {showCursor ? (
              <span
                className="ml-0.5 inline-block h-[1em] w-px animate-pulse bg-[var(--color-accent)] align-[-2px]"
                aria-hidden
              />
            ) : null}
          </div>
        )}
      </div>

      {message.toolActions?.map((action, i) => (
        <ActionPill
          key={`${action.tool}-${i}`}
          action={action}
          onUndo={() => onRemoveToolAction?.(message.id, i)}
        />
      ))}

      <time className="text-[11px] text-[var(--color-text-muted)]" dateTime={message.createdAt}>
        {formatMsgTime(message.createdAt, prevCreatedAt)}
      </time>
    </div>
  );
}
