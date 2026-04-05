"use client";

import { useMutation } from "@tanstack/react-query";
import type { BuddyRequest } from "@/types/api";
import { isApiError } from "@/types/api";

export function useAIBuddyStream() {
  return useMutation({
    mutationFn: async (payload: BuddyRequest) => {
      const res = await fetch("/api/ai/buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let message = res.statusText || "Buddy request failed";
        const text = await res.text();
        if (text) {
          try {
            const data: unknown = JSON.parse(text);
            if (isApiError(data)) message = data.error;
            else message = text;
          } catch {
            message = text;
          }
        }
        throw new Error(message);
      }
      return res;
    },
  });
}
