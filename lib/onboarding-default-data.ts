/**
 * Default checklist & budget rows for new couples (matches seed checklist/budget structure + DB CHECK constraints).
 * Re-exported from `lib/constants.ts` for API and docs that expect a single constants entrypoint.
 */

export type DefaultChecklistTemplate = {
  title: string;
  category: string;
  phase: string;
  notes: string | null;
  sortOrder: number;
};

export const DEFAULT_BUDGET_CATEGORIES = [
  { category: "venue", categoryLabel: "Venue", defaultAllocationPct: 28 },
  { category: "catering_bar", categoryLabel: "Catering & Bar", defaultAllocationPct: 22 },
  { category: "photography", categoryLabel: "Photography", defaultAllocationPct: 10 },
  { category: "videography", categoryLabel: "Videography", defaultAllocationPct: 6 },
  { category: "florals_decor", categoryLabel: "Florals & Décor", defaultAllocationPct: 8 },
  { category: "music_entertainment", categoryLabel: "Music & Entertainment", defaultAllocationPct: 6 },
  { category: "officiant", categoryLabel: "Officiant", defaultAllocationPct: 1 },
  { category: "attire_partner1", categoryLabel: "Attire — Partner 1", defaultAllocationPct: 4 },
  { category: "attire_partner2", categoryLabel: "Attire — Partner 2", defaultAllocationPct: 2 },
  { category: "hair_makeup", categoryLabel: "Hair & Makeup", defaultAllocationPct: 3 },
  { category: "invitations_stationery", categoryLabel: "Invitations & Stationery", defaultAllocationPct: 2 },
  { category: "transportation", categoryLabel: "Transportation", defaultAllocationPct: 2 },
  { category: "accommodations", categoryLabel: "Accommodations", defaultAllocationPct: 1 },
  { category: "wedding_cake", categoryLabel: "Wedding Cake & Desserts", defaultAllocationPct: 2 },
  { category: "favors_gifts", categoryLabel: "Favors & Gifts", defaultAllocationPct: 1 },
  { category: "honeymoon", categoryLabel: "Honeymoon", defaultAllocationPct: 0 },
  { category: "miscellaneous_buffer", categoryLabel: "Miscellaneous / Buffer", defaultAllocationPct: 2 },
] as const;

/** Suggested due date from wedding date + phase; null if no wedding date. */
export function getSuggestedDueDate(phase: string, weddingDateIso: string | null): string | null {
  if (!weddingDateIso) return null;
  const [y, m, d] = weddingDateIso.split("-").map(Number);
  if (!y || !m || !d) return null;
  const wedding = new Date(Date.UTC(y, m - 1, d));

  const subMonths = (date: Date, months: number) => {
    const next = new Date(date.getTime());
    next.setUTCMonth(next.getUTCMonth() - months);
    return next;
  };
  const subDays = (date: Date, days: number) => {
    const next = new Date(date.getTime());
    next.setUTCDate(next.getUTCDate() - days);
    return next;
  };

  const iso = (date: Date) => date.toISOString().slice(0, 10);

  switch (phase) {
    case "12_plus_months":
      return iso(subMonths(wedding, 12));
    case "9_12_months":
      return iso(subMonths(wedding, 10));
    case "6_9_months":
      return iso(subMonths(wedding, 7));
    case "3_6_months":
      return iso(subMonths(wedding, 4));
    case "1_3_months":
      return iso(subDays(wedding, 42));
    case "final_month":
      return iso(subDays(wedding, 14));
    case "week_of":
      return iso(subDays(wedding, 3));
    case "day_of":
      return iso(wedding);
    default:
      return null;
  }
}

export const DEFAULT_CHECKLIST_ITEMS: readonly DefaultChecklistTemplate[] = [
  { title: "Set your wedding date", category: "admin", phase: "12_plus_months", notes: "Consider day of week, season, and holiday conflicts.", sortOrder: 1 },
  { title: "Establish your total wedding budget", category: "admin", phase: "12_plus_months", notes: "Include family contributions and savings. Be honest.", sortOrder: 2 },
  { title: "Draft your initial guest list", category: "guests", phase: "12_plus_months", notes: "Guest count drives nearly every other cost.", sortOrder: 3 },
  { title: "Book your ceremony and reception venue", category: "venue", phase: "12_plus_months", notes: "Popular venues book 12–18 months out.", sortOrder: 4 },
  { title: "Book your photographer", category: "vendors", phase: "12_plus_months", notes: "Top photographers book out 12–18 months. Do not wait.", sortOrder: 5 },
  { title: "Book your videographer", category: "vendors", phase: "12_plus_months", notes: "Often booked alongside the photographer.", sortOrder: 6 },
  { title: "Secure your officiant", category: "vendors", phase: "12_plus_months", notes: "Confirm they are available on your date now.", sortOrder: 7 },
  { title: "Create your wedding website", category: "guests", phase: "12_plus_months", notes: "Include your date, location, and registry link.", sortOrder: 8 },
  { title: "Start your wedding registry", category: "guests", phase: "12_plus_months", notes: "Include a range of price points.", sortOrder: 9 },
  { title: "Book your caterer (if not venue-provided)", category: "vendors", phase: "9_12_months", notes: "If venue provides catering, schedule your tasting instead.", sortOrder: 10 },
  { title: "Book your florist", category: "vendors", phase: "9_12_months", notes: "Bring inspo photos. Discuss what is in season.", sortOrder: 11 },
  { title: "Book your DJ or band", category: "vendors", phase: "9_12_months", notes: "Good DJs and bands book fast.", sortOrder: 12 },
  { title: "Send save-the-dates", category: "guests", phase: "9_12_months", notes: "Send 9–12 months out for destination weddings.", sortOrder: 13 },
  { title: "Start shopping for wedding attire (Partner 1)", category: "attire", phase: "9_12_months", notes: "Dresses take 4–6 months to order plus 2–3 months for alterations.", sortOrder: 14 },
  { title: "Start shopping for wedding attire (Partner 2)", category: "attire", phase: "9_12_months", notes: null, sortOrder: 15 },
  { title: "Reserve hotel room blocks for guests", category: "logistics", phase: "9_12_months", notes: "Negotiate a group rate.", sortOrder: 16 },
  { title: "Begin planning the rehearsal dinner", category: "logistics", phase: "9_12_months", notes: "Book the venue early.", sortOrder: 17 },
  { title: "Book hair and makeup artist(s)", category: "vendors", phase: "6_9_months", notes: "Book your trial for a date when you will be going out.", sortOrder: 18 },
  { title: "Design and order wedding invitations", category: "admin", phase: "6_9_months", notes: "Order extras (10% overage). Weigh a complete suite before buying postage.", sortOrder: 19 },
  { title: "Book your honeymoon", category: "travel", phase: "6_9_months", notes: "Book flights and hotels now. Consider travel insurance.", sortOrder: 20 },
  { title: "Outline your ceremony structure", category: "ceremony", phase: "6_9_months", notes: "Processional, readings, vows, ring exchange, recessional.", sortOrder: 21 },
  { title: "Book guest and wedding party transportation", category: "logistics", phase: "6_9_months", notes: "Shuttles from hotel to venue are a guest experience win.", sortOrder: 22 },
  { title: "Book your wedding cake or desserts", category: "food_beverage", phase: "6_9_months", notes: "Schedule a tasting. Confirm the venue cake cutting fee.", sortOrder: 23 },
  { title: "Mail wedding invitations", category: "guests", phase: "3_6_months", notes: "Send 6–8 weeks before. Include RSVP deadline 3–4 weeks out.", sortOrder: 24 },
  { title: "Finalize catering menu and bar selections", category: "food_beverage", phase: "3_6_months", notes: "Confirm dietary restrictions. Lock in headcount estimate.", sortOrder: 25 },
  { title: "Write your vows", category: "ceremony", phase: "3_6_months", notes: "Give yourself more time than you think you need.", sortOrder: 26 },
  { title: "Purchase wedding rings", category: "attire", phase: "3_6_months", notes: "Budget 4–6 weeks for custom or resizing orders.", sortOrder: 27 },
  { title: "Finalize décor plan and rental orders", category: "decor", phase: "3_6_months", notes: "Confirm all rentals in writing.", sortOrder: 28 },
  { title: "Research marriage license requirements", category: "legal", phase: "3_6_months", notes: "Requirements vary by state. Most licenses valid 30–60 days.", sortOrder: 29 },
  { title: "Schedule the wedding rehearsal", category: "ceremony", phase: "3_6_months", notes: "Typically the evening before. Confirm venue access time.", sortOrder: 30 },
  { title: "Finalize guest list and RSVP tracking", category: "guests", phase: "1_3_months", notes: "Follow up with non-responders 1 week after your RSVP deadline.", sortOrder: 31 },
  { title: "Create seating chart", category: "guests", phase: "1_3_months", notes: "Do not start until RSVPs are mostly in.", sortOrder: 32 },
  { title: "Build the day-of timeline", category: "logistics", phase: "1_3_months", notes: "Work backwards from ceremony start time.", sortOrder: 33 },
  { title: "Complete attire alterations and final fitting", category: "attire", phase: "1_3_months", notes: "Final fitting 2–3 weeks before the wedding.", sortOrder: 34 },
  { title: "Obtain marriage license", category: "legal", phase: "1_3_months", notes: "Check your county clerk website for exact requirements.", sortOrder: 35 },
  { title: "Finalize music requests with DJ/band", category: "vendors", phase: "1_3_months", notes: "Must-plays, first dance, parent dances, do-not-plays.", sortOrder: 36 },
  { title: "Order day-of stationery and signage", category: "decor", phase: "1_3_months", notes: "Menus, programs, escort cards, table numbers, signs.", sortOrder: 37 },
  { title: "Prepare vendor payments and gratuity envelopes", category: "admin", phase: "1_3_months", notes: "Know which balances are due before vs. day-of.", sortOrder: 38 },
  { title: "Confirm all vendors — date, time, logistics", category: "vendors", phase: "final_month", notes: "Call every booked vendor. Reconfirm arrival times and address.", sortOrder: 39 },
  { title: "Send day-of timeline to all vendors and wedding party", category: "logistics", phase: "final_month", notes: null, sortOrder: 40 },
  { title: "Assign day-of responsibilities to trusted people", category: "logistics", phase: "final_month", notes: "You should not be managing anything on your wedding day.", sortOrder: 41 },
  { title: "Complete hair and makeup trial", category: "vendors", phase: "final_month", notes: "Take photos after so you remember what you approved.", sortOrder: 42 },
  { title: "Purchase and prepare wedding party gifts", category: "admin", phase: "final_month", notes: null, sortOrder: 43 },
  { title: "Assemble a wedding day emergency kit", category: "logistics", phase: "final_month", notes: "Safety pins, stain pen, fashion tape, pain reliever, snacks.", sortOrder: 44 },
  { title: "Pick up all wedding attire", category: "attire", phase: "week_of", notes: null, sortOrder: 45 },
  { title: "Final confirmation calls with all vendors", category: "vendors", phase: "week_of", notes: "Quick check only — confirm time, address, your cell number.", sortOrder: 46 },
  { title: "Wedding rehearsal", category: "ceremony", phase: "week_of", notes: "Walk through processional and recessional at least twice.", sortOrder: 47 },
  { title: "Break in your wedding shoes", category: "attire", phase: "week_of", notes: "Wear them around the house. Your future feet will thank you.", sortOrder: 48 },
  { title: "Finalize all vendor payments and tip envelopes", category: "admin", phase: "week_of", notes: null, sortOrder: 49 },
  { title: "Eat a real breakfast", category: "logistics", phase: "day_of", notes: "Cocktail hour is hours away. Do not skip this.", sortOrder: 50 },
  { title: "Hand off vendor payment envelopes", category: "admin", phase: "day_of", notes: null, sortOrder: 51 },
  { title: "Breathe. Be present. Let the day happen.", category: "logistics", phase: "day_of", notes: "Something will go slightly off-script. It always does. It will not matter.", sortOrder: 52 },
];
