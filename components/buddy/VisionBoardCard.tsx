"use client";

import { useToast } from "@/hooks/use-toast";
import { saveVisionBoardToProfile } from "@/lib/actions/wedding-profile-style";
import { extractMoodTitle, parseVisionPalette } from "@/lib/buddy/detect";
import { cn } from "@/lib/utils";

type VisionBoardCardProps = {
  content: string;
};

function sectionBody(content: string, header: string): string {
  const re = new RegExp(`\\b${header}\\s*:`, "i");
  const parts = content.split(re);
  if (parts.length < 2) return "";
  const rest = parts[1] ?? "";
  const next = rest.split(/\b[A-Z][A-Z\s]+:/)[0] ?? rest;
  return next.trim();
}

export function VisionBoardCard({ content }: VisionBoardCardProps) {
  const { toast } = useToast();
  const mood = extractMoodTitle(content);
  const palette = parseVisionPalette(content);
  const atmosphere = sectionBody(content, "ATMOSPHERE");
  const keyElements = sectionBody(content, "KEY ELEMENTS");
  const vendorDir = sectionBody(content, "VENDOR DIRECTION");
  const avoid = sectionBody(content, "WHAT TO AVOID");

  const plain = content.trim();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(plain);
      toast({ title: "Copied for vendors" });
    } catch {
      toast({ title: "Could not copy", variant: "destructive" });
    }
  };

  const saveProfile = async () => {
    const paletteText = palette.map((p) => `${p.name} ${p.hex}`).join("\n");
    const block = [`Mood: ${mood}`, "", "Palette:", paletteText].join("\n");
    try {
      await saveVisionBoardToProfile(block);
      toast({ title: "Saved to profile" });
    } catch (e) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 shadow-[var(--shadow-sm)]">
      <h3 className="text-center font-display text-2xl font-semibold text-[var(--color-text-primary)]">{mood}</h3>

      {palette.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-4">
          {palette.map((p) => (
            <div key={p.hex} className="flex w-[72px] flex-col items-center gap-1 text-center">
              <div
                className="size-10 rounded-full border border-[var(--color-border)] shadow-inner"
                style={{ backgroundColor: p.hex }}
                title={p.hex}
              />
              <span className="text-[11px] text-[var(--color-text-secondary)]">{p.name}</span>
            </div>
          ))}
        </div>
      ) : null}

      {atmosphere ? <VisionSection label="Atmosphere" body={atmosphere} /> : null}
      {keyElements ? <VisionSection label="Key elements" body={keyElements} /> : null}
      {vendorDir ? <VisionSection label="Vendor direction" body={vendorDir} /> : null}
      {avoid ? <VisionSection label="What to avoid" body={avoid} /> : null}

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => void copy()}
          className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-bg-subtle)]"
        >
          Copy for Vendors
        </button>
        <button
          type="button"
          onClick={() => void saveProfile()}
          className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)]"
        >
          Save to Profile
        </button>
      </div>
    </div>
  );
}

function VisionSection({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">{label}</p>
      <p className={cn("mt-1 text-[13px] leading-relaxed text-[var(--color-text-primary)]")}>{body}</p>
    </div>
  );
}
