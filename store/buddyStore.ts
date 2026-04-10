import { create } from "zustand";

type BuddyStore = {
  buddyOpen: boolean;
  setBuddyOpen: (open: boolean) => void;
};

export const useBuddyStore = create<BuddyStore>((set) => ({
  buddyOpen: false,
  setBuddyOpen: (buddyOpen) => set({ buddyOpen }),
}));
