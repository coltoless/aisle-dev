"use client";

import { useEffect, useState, useTransition } from "react";
import { CHECKLIST_CATEGORIES, CHECKLIST_PHASE_CONFIG, type ChecklistPhase } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateTask } from "@/lib/actions/checklist";
import type { ChecklistItem } from "@/types/index";

const PHASE_OPTIONS = [...CHECKLIST_PHASE_CONFIG]
  .slice()
  .sort((a, b) => a.sortOrder - b.sortOrder);

type EditTaskModalProps = {
  item: ChecklistItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (item: ChecklistItem) => void;
};

export function EditTaskModal({ item, open, onOpenChange, onUpdated }: EditTaskModalProps) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CHECKLIST_CATEGORIES[0]!.id);
  const [phase, setPhase] = useState<ChecklistPhase>(PHASE_OPTIONS[0]!.id);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [titleError, setTitleError] = useState(false);

  useEffect(() => {
    if (!item) return;
    setTitle(item.title);
    setCategory(item.category ?? CHECKLIST_CATEGORIES[0]!.id);
    setPhase((item.phase ?? PHASE_OPTIONS[0]!.id) as ChecklistPhase);
    setDueDate(item.due_date ?? "");
    setNotes(item.notes ?? "");
    setTitleError(false);
  }, [item]);

  const submit = () => {
    if (!item) return;
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    setTitleError(false);
    startTransition(async () => {
      try {
        const row = await updateTask(item.id, {
          title: title.trim(),
          category: category as ChecklistItem["category"],
          phase,
          due_date: dueDate || null,
          notes: notes.trim() || null,
        });
        onUpdated(row);
        toast({ title: "Task updated" });
        onOpenChange(false);
      } catch (e) {
        toast({
          variant: "destructive",
          title: "Could not update task",
          description: e instanceof Error ? e.message : "Try again.",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[var(--color-border)] bg-[var(--color-bg-card)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Edit task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError && e.target.value.trim()) setTitleError(false);
              }}
              className={titleError ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"}
            />
            {titleError ? <p className="text-sm text-[var(--color-danger)]">Title is required.</p> : null}
          </div>
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CHECKLIST_CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Phase</Label>
            <Select value={phase} onValueChange={(v) => setPhase(v as ChecklistPhase)}>
              <SelectTrigger>
                <SelectValue placeholder="Phase" />
              </SelectTrigger>
              <SelectContent>
                {PHASE_OPTIONS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-due">Due date (optional)</Label>
            <Input id="edit-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="border-[var(--color-border)]" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-notes">Notes (optional)</Label>
            <textarea
              id="edit-notes"
              maxLength={300}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
            />
            <p className="text-right text-xs text-[var(--color-text-muted)]">{notes.length}/300</p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={pending || !item} className="bg-[var(--color-accent)] text-[var(--color-accent-foreground)]" onClick={submit}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
