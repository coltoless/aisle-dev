import { isSnoozeActive } from "@/lib/checklist/dates";
import type { ChecklistItem } from "@/types/index";

export type ChecklistFilter = "all" | "incomplete" | "overdue" | "completed";

export function applyChecklistFilter(
  items: ChecklistItem[],
  filter: ChecklistFilter,
  today: string,
): ChecklistItem[] {
  switch (filter) {
    case "all":
      return items;
    case "completed":
      return items.filter((i) => i.completed);
    case "incomplete":
      return items.filter((i) => !i.completed && !isSnoozeActive(i.snoozed_until, today));
    case "overdue":
      return items.filter(
        (i) =>
          !i.completed &&
          !!i.due_date &&
          i.due_date < today &&
          !isSnoozeActive(i.snoozed_until, today),
      );
    default:
      return items;
  }
}
