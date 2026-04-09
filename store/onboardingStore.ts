import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { PRIORITY_CATEGORIES } from "@/lib/constants";

const defaultPriorities = () => PRIORITY_CATEGORIES.map((p) => p.id);

export type OnboardingState = {
  partner1Name: string;
  partner2Name: string;
  weddingDate: string | null;
  hasDate: boolean;
  locationCity: string;
  locationState: string;
  guestCountRange: string;
  budgetRange: string;
  styleTags: string[];
  priorities: string[];
  aiIntroMessage: string | null;
  isSubmitting: boolean;
};

type OnboardingActions = {
  setField: <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => void;
  setStyleTag: (id: string) => void;
  setPriorities: (ids: string[]) => void;
  setAIIntroMessage: (message: string | null) => void;
  setIsSubmitting: (v: boolean) => void;
  reset: () => void;
};

const initialState: OnboardingState = {
  partner1Name: "",
  partner2Name: "",
  weddingDate: null,
  hasDate: true,
  locationCity: "",
  locationState: "",
  guestCountRange: "",
  budgetRange: "",
  styleTags: [],
  priorities: defaultPriorities(),
  aiIntroMessage: null,
  isSubmitting: false,
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setField: (key, value) => set({ [key]: value } as Partial<OnboardingState>),

      setStyleTag: (id) => {
        const current = get().styleTags;
        const idx = current.indexOf(id);
        if (idx >= 0) {
          set({ styleTags: current.filter((x) => x !== id) });
          return;
        }
        if (current.length >= 3) {
          set({ styleTags: [...current.slice(1), id] });
          return;
        }
        set({ styleTags: [...current, id] });
      },

      setPriorities: (ids) => set({ priorities: ids }),

      setAIIntroMessage: (message) => set({ aiIntroMessage: message }),

      setIsSubmitting: (v) => set({ isSubmitting: v }),

      reset: () =>
        set({
          ...initialState,
          priorities: defaultPriorities(),
        }),
    }),
    {
      name: "aisle-onboarding",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        partner1Name: s.partner1Name,
        partner2Name: s.partner2Name,
        weddingDate: s.weddingDate,
        hasDate: s.hasDate,
        locationCity: s.locationCity,
        locationState: s.locationState,
        guestCountRange: s.guestCountRange,
        budgetRange: s.budgetRange,
        styleTags: s.styleTags,
        priorities: s.priorities,
      }),
    },
  ),
);
