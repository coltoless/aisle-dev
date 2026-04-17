import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { BuddyChatMode, BuddyMessage, BuddyToolAction } from "@/types/api";

export type BuddyState = {
  isOpen: boolean;
  messages: BuddyMessage[];
  isStreaming: boolean;
  activeMode: BuddyChatMode;
  pendingToolActions: BuddyToolAction[];
  /** Optional vendor to attach "Save as Note" in email mode */
  selectedVendorId: string | null;
  setBuddyOpen: (open: boolean) => void;
  addMessage: (message: BuddyMessage) => void;
  setMessages: (messages: BuddyMessage[]) => void;
  appendToAssistant: (assistantId: string, chunk: string) => void;
  patchAssistantMessage: (assistantId: string, patch: Partial<BuddyMessage>) => void;
  setStreaming: (streaming: boolean) => void;
  setActiveMode: (mode: BuddyChatMode) => void;
  addToolAction: (action: BuddyToolAction) => void;
  clearToolActions: () => void;
  setSelectedVendorId: (id: string | null) => void;
};

export const useBuddyStore = create<BuddyState>()(
  persist(
    (set) => ({
      isOpen: false,
      messages: [],
      isStreaming: false,
      activeMode: "planning",
      pendingToolActions: [],
      selectedVendorId: null,

      setBuddyOpen: (open) => set({ isOpen: open }),

      addMessage: (message) =>
        set((s) => ({
          messages: [...s.messages, message],
        })),

      setMessages: (messages) => set({ messages }),

      appendToAssistant: (assistantId, chunk) =>
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m,
          ),
        })),

      patchAssistantMessage: (assistantId, patch) =>
        set((s) => ({
          messages: s.messages.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)),
        })),

      setStreaming: (isStreaming) => set({ isStreaming }),

      setActiveMode: (activeMode) => set({ activeMode }),

      addToolAction: (action) =>
        set((s) => ({
          pendingToolActions: [...s.pendingToolActions, action],
        })),

      clearToolActions: () => set({ pendingToolActions: [] }),

      setSelectedVendorId: (selectedVendorId) => set({ selectedVendorId }),
    }),
    {
      name: "aisle-buddy-session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ messages: state.messages }),
    },
  ),
);
