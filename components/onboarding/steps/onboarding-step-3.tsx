"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { OnboardingStepTransition } from "@/components/onboarding/onboarding-step-transition";
import { Button } from "@/components/ui/button";
import { PRIORITY_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/store/onboardingStore";

function moveItem<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [removed] = next.splice(from, 1);
  next.splice(to, 0, removed);
  return next;
}

function labelFor(id: string) {
  return PRIORITY_CATEGORIES.find((p) => p.id === id)?.label ?? id;
}

function SortablePriorityRow({
  id,
  index,
  isTop3,
}: {
  id: string;
  index: number;
  isTop3: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          "mb-2 flex items-center gap-3 rounded-lg border px-3 py-3",
          isTop3
            ? "border-l-[3px] border-l-accent bg-[var(--color-bg-card)] shadow-sm"
            : "border-[var(--color-border)] bg-[var(--color-bg-subtle)]/60",
          isDragging && "opacity-70",
        )}
      >
        <button
          type="button"
          className="touch-none text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" />
        </button>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
            isTop3 ? "bg-accent text-white" : "bg-[var(--color-border)] text-[var(--color-text-muted)]",
          )}
        >
          {index + 1}
        </span>
        <span className={cn("text-sm font-medium", isTop3 ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]")}>
          {labelFor(id)}
        </span>
      </div>
    </div>
  );
}

export function OnboardingStep3() {
  const router = useRouter();
  const priorities = useOnboardingStore((s) => s.priorities);
  const setPriorities = useOnboardingStore((s) => s.setPriorities);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = priorities.indexOf(String(active.id));
    const newIndex = priorities.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    setPriorities(moveItem(priorities, oldIndex, newIndex));
  };

  return (
    <OnboardingStepTransition>
      <h1 className="text-center font-display text-3xl font-semibold text-[var(--color-text-primary)] md:text-4xl">
        What matters most to you?
      </h1>
      <p className="mt-3 text-center text-sm text-[var(--color-text-muted)]">
        Drag to rank. Your top 3 shape how we allocate your budget.
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={priorities} strategy={verticalListSortingStrategy}>
          <div className="mt-10">
            {priorities.map((id, index) => (
              <div key={id}>
                <SortablePriorityRow id={id} index={index} isTop3={index < 3} />
                {index === 2 ? (
                  <div className="relative my-4 flex items-center justify-center">
                    <div className="absolute inset-x-0 top-1/2 h-px bg-[var(--color-border)]" />
                    <span className="relative bg-[var(--color-bg-primary)] px-3 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                      Top 3
                    </span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        className="mt-10 h-11 w-full bg-accent text-accent-foreground hover:bg-accent-hover"
        onClick={() => router.push("/onboarding/4")}
      >
        Continue →
      </Button>
    </OnboardingStepTransition>
  );
}
