# SCREENS.md — Screen Inventory & Layout Notes

Every screen in Aisle, with layout structure, key components, and interaction notes. Use this as the spatial reference when building UI in Cursor.

---

## Screen Map Overview

```
/ (Landing Page)
├── /login
├── /signup
└── /onboarding
    ├── /onboarding/step-1   (Welcome & Names)
    ├── /onboarding/step-2   (Wedding Vision)
    ├── /onboarding/step-3   (Priorities)
    └── /onboarding/step-4   (Summary + AI Intro)

/dashboard                   (Home)
/venues                      (Venue Discovery)
/checklist                   (Planning Checklist)
/budget                      (Budget Tracker)
/vendors                     (Vendor Tracker)
/contracts                   (Contracts)
/buddy                       (AI Planning Buddy — full page)
/settings                    (Account & Wedding Settings)
```

---

## Shell Layout (Authenticated Pages)

All `/dashboard`, `/venues`, `/checklist`, `/budget`, `/vendors`, `/contracts`, `/buddy`, `/settings` share:

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (240px fixed)           MAIN CONTENT AREA  │
│  ┌──────────────────────┐        (flex-1, max-w     │
│  │ Logo / "Aisle"       │         1100px, p-10)     │
│  ├──────────────────────┤                           │
│  │ Nav Links:           │        <page content>     │
│  │  • Dashboard         │                           │
│  │  • Venues            │                           │
│  │  • Checklist         │                           │
│  │  • Budget            │                           │
│  │  • Vendors           │                           │
│  │  • Contracts         │                           │
│  ├──────────────────────┤                           │
│  │ Partner names        │                           │
│  │ 📅 X days until      │                           │
│  │    [wedding date]    │                           │
│  └──────────────────────┘                           │
│                                                     │
│                              ┌──────────────────┐   │
│                              │ AI Buddy FAB     │   │
│                              │ (bottom-right)   │   │
│                              └──────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Sidebar details:**
- Background: `var(--color-bg-secondary)`
- Active nav item: left border `3px solid var(--color-accent)` + accent text + light green bg tint
- Partner names displayed as "{Partner1} & {Partner2}"
- Countdown format: "168 days" in muted type, wedding date below it in small text

**AI Buddy FAB:**
- Fixed position, bottom-right, `bottom-6 right-6`
- `48px` circle, accent green, paper-plane icon
- Opens slide-in drawer from right (420px wide)
- Drawer does not close when clicking outside during active conversation

---

## 1. Landing Page `/`

**Layout:** Full-width, single column, scroll

**Sections:**

### Hero
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   Plan your wedding like a pro.                     │
│   Without paying for one.                           │
│                                                     │
│   [2-sentence value prop in body text]              │
│                                                     │
│              [ Start Planning Free ]                │
│                                                     │
└─────────────────────────────────────────────────────┘
```
- No image. Typography-only hero on warm ivory.
- Headline: Cormorant Garamond, large (~64px desktop)
- CTA links to `/signup`

### Feature Highlights (3 cards)
- AI Planning Buddy
- Smart Checklist
- Budget Tracker
Each: icon + headline + 2-sentence description

### How It Works (3 steps)
Step 1: Tell us about your wedding  
Step 2: Get your plan instantly  
Step 3: Plan with expert guidance

### Social Proof (Post-MVP — placeholder div for now)

### Footer: Links, copyright, contact email

---

## 2. Signup `/signup`

**Layout:** Centered card, max-w 440px, vertically centered

```
┌─────────────────────────┐
│  Aisle logo             │
│                         │
│  Create your account    │
│                         │
│  [Google OAuth Button]  │
│        — or —           │
│  [Email input]          │
│  [Password input]       │
│  [Confirm Password]     │
│                         │
│  [ Create Account ]     │
│                         │
│  Already have account?  │
│  Log in →               │
└─────────────────────────┘
```

---

## 3. Login `/login`

**Layout:** Centered card, max-w 440px

Same structure as signup but simpler:
- Email + Password
- [Google OAuth]
- "Forgot password?" link
- "Don't have an account? Start planning →"

---

## 4. Onboarding `/onboarding`

**Layout:** Centered single column, max-w 560px, full viewport height

All steps share:
- Progress bar at top (thin, 4px, segments)
- Back button (except step 1)
- "Step X of 4" label in small muted text
- Framer Motion fade + slight upward translate between steps

### Step 1 — Welcome & Names

```
┌────────────────────────────────┐
│  ████████░░░░░░░░ Step 1 of 4 │  ← progress bar
│                                │
│  Let's start with the          │
│  two most important people.    │  ← Cormorant, ~36px
│                                │
│  Partner 1 Name                │
│  [________________________]    │
│                                │
│  Partner 2 Name                │
│  [________________________]    │
│                                │
│              [ Continue → ]    │
└────────────────────────────────┘
```

### Step 2 — Wedding Vision

```
┌────────────────────────────────┐
│  ████████████████░░ Step 2/4  │
│                                │
│  Tell us about the day         │
│  you're planning.              │
│                                │
│  Wedding Date                  │
│  [Date picker]  or             │
│  [ ] We haven't set a date yet │
│                                │
│  Where are you getting married?│
│  [City, State autocomplete  ]  │
│                                │
│  Guest Count                   │
│  ○ Under 50  ○ 50–100          │
│  ○ 100–150   ○ 150–200  ○ 200+ │
│                                │
│  Budget Range                  │
│  ○ Under $15K  ○ $15K–$30K     │
│  ○ $30K–$50K   ○ $50K–$75K    │
│  ○ $75K–$100K  ○ $100K+        │
│                                │
│  Wedding Vibe (pick up to 3)   │
│  [Pill toggles for each style] │
│                                │
│  [ ← Back ]    [ Continue → ]  │
└────────────────────────────────┘
```

**Notes:**
- Style pills are multi-select, max 3
- Radio groups use custom styled inputs, not browser default

### Step 3 — Priorities

```
┌────────────────────────────────┐
│  ██████████████████░ Step 3/4 │
│                                │
│  What matters most to you?     │
│  Drag to rank your top 3.      │
│                                │
│  ┌───────────────────────────┐ │
│  │ 1  📷 Photography         │ │
│  │ 2  🏛 Venue               │ │
│  │ 3  🍽 Food & Beverage      │ │
│  │    🌸 Florals & Décor     │ │
│  │    🎵 Music               │ │
│  │    👗 Attire              │ │
│  │    🎥 Videography         │ │
│  │    ✈️  Honeymoon           │ │
│  └───────────────────────────┘ │
│                                │
│  [ ← Back ]    [ Continue → ]  │
└────────────────────────────────┘
```

**Notes:**
- Drag-and-drop ranking using `@dnd-kit/core`
- First 3 items auto-highlighted with accent color
- "Top 3" badge appears on items 1–3

### Step 4 — Summary + AI Intro

```
┌────────────────────────────────┐
│  ████████████████████ Step 4/4│
│                                │
│  Here's what we've got.        │
│                                │
│  ┌───────────────────────────┐ │
│  │ 📅 June 14, 2027          │ │
│  │ 📍 Napa, California        │ │
│  │ 👥 100–150 guests          │ │
│  │ 💰 $50K–$75K budget        │ │
│  │ ✨ Romantic & Classic       │ │
│  └───────────────────────────┘ │
│                                │
│  ┌───────────────────────────┐ │
│  │ 🤍 A message from Aisle   │ │
│  │                           │ │
│  │ [AI intro message text    │ │
│  │  personalized to profile] │ │
│  └───────────────────────────┘ │
│                                │
│       [ Let's Get Planning → ] │
└────────────────────────────────┘
```

**Notes:**
- AI message is fetched during this step (show skeleton loader)
- CTA navigates to `/dashboard`
- Triggers: DB write of full wedding profile + checklist generation + budget generation

---

## 5. Dashboard `/dashboard`

**Layout:** 12-column grid, gap-6

```
┌─────────────────────────────────────────────────────────┐
│  Good morning, Emma & Liam.           168 days to go.   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  CHECKLIST   │  │   BUDGET     │  │   VENDORS    │  │
│  │  32/47 done  │  │  $41K / $60K │  │  6 booked    │  │
│  │  ██████░░    │  │  allocated   │  │  4 remaining │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│  ┌──────────────────────────┐  ┌──────────────────────┐ │
│  │  UPCOMING TASKS          │  │  BUDGET SNAPSHOT     │ │
│  │  ─────────────────────   │  │                      │ │
│  │  □ Book florist    3d    │  │   [Donut chart]      │ │
│  │  □ Finalize menu   1wk   │  │                      │ │
│  │  □ Order invites   2wk   │  │   $41K allocated     │ │
│  │                          │  │   $19K remaining     │ │
│  │  [ View All Tasks → ]    │  │                      │ │
│  └──────────────────────────┘  └──────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  AI BUDDY HIGHLIGHT                              │   │
│  │  "You're 8 months out and haven't booked a       │   │
│  │   photographer yet. This is peak booking         │   │
│  │   season — worth prioritizing this week."        │   │
│  │                              [ Chat with Aisle ] │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Components:**
- `<StatCard>` — metric, subtext, optional progress bar (×3)
- `<UpcomingTasks>` — top 3–5 tasks by due date
- `<BudgetSnapshot>` — donut chart (Recharts) + summary numbers
- `<AIBuddyHighlight>` — proactive nudge card with CTA to open buddy

---

## 6. Venues `/venues`

**Layout:** Two-column split on desktop; single column on mobile

```
┌─────────────────────────────────────────────────────┐
│  Venue Discovery                                    │
│  [Location] [Guest Count] [Budget] [Style]  Refresh │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │  VENUE CARD          │  │  VENUE CARD          │  │
│  │                      │  │                      │  │
│  │  The Estate at Napa  │  │  Carneros Resort     │  │
│  │  Napa, CA            │  │  Napa, CA            │  │
│  │  Estate · $8K–$12K   │  │  Hotel · $10K–$16K   │  │
│  │                      │  │                 STRETCH│
│  │  [description text]  │  │  [description text]  │  │
│  │                      │  │                      │  │
│  │  [Save] [Visit Site] │  │  [Save] [Visit Site] │  │
│  └─────────────────────┘  └─────────────────────┘  │
│                                                     │
│  MY SAVED VENUES ─────────────────────────────────  │
│  [Saved venue chips with status: Considering/Booked]│
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Components:**
- `<VenueFilters>` — pre-populated from profile, editable
- `<VenueCard>` — name, location, type, price range, stretch badge, description, save/dismiss actions
- `<SavedVenuesList>` — compact list of saved venues with status toggle
- Loading: 3 skeleton cards while AI generates recommendations

**Interactions:**
- "Refresh" regenerates recommendations
- "Save" adds to `venues` table with status `considering`
- "Dismiss" sets status to `dismissed` and removes from view
- "Mark as Booked" promotes to dashboard and sets vendor status

---

## 7. Checklist `/checklist`

**Layout:** Single column, full width within content area

```
┌─────────────────────────────────────────────────────┐
│  Planning Checklist              32/47 complete ██░  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─ 12+ MONTHS OUT ──────────────────────────────┐  │
│  │ 9/9 complete ████████████                     │  │
│  │ [collapsed — click to expand]                 │  │
│  └────────────────────────────────────────────────┘  │
│                                                     │
│  ┌─ 9–12 MONTHS OUT ◀ CURRENT PHASE ─────────────┐  │
│  │ 4/8 complete ██████░░░░                       │  │
│  │                                               │  │
│  │ ☑ Book photographer              Done         │  │
│  │ ☑ Book venue                     Done         │  │
│  │ □  Book caterer                  Due Mar 15   │  │
│  │    ↳ If not venue-provided               [⋯]  │  │
│  │ □  Book florist              ⚠ Overdue        │  │
│  │ □  Send save-the-dates           Due Apr 1    │  │
│  │ □  Shop for attire (Partner 1)   Due Apr 30   │  │
│  │                                               │  │
│  │                     [ + Add custom task ]     │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌─ 6–9 MONTHS OUT ──────────────────────────────┐  │
│  │ [collapsed]                                   │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Components:**
- `<ChecklistHeader>` — total progress bar + completion count
- `<PhaseSection>` — collapsible accordion per phase; current phase expanded by default
- `<ChecklistItem>` — checkbox, title, due date, notes toggle, overdue badge, options menu (snooze, edit, delete)
- `<AddTaskModal>` — dialog to add custom task with category + phase selectors

**Interactions:**
- Click checkbox → optimistic update, strikethrough animation
- Phase header click → toggle expand/collapse
- Overdue items highlighted in warning amber
- Completed phases collapse automatically and show a completion badge

---

## 8. Budget `/budget`

**Layout:** Two-column on desktop (chart left, table right); stacked on mobile

```
┌─────────────────────────────────────────────────────┐
│  Budget Tracker                         [ Export CSV]│
├─────────────────────────────────────────────────────┤
│                                                     │
│  Total: $60,000   Committed: $41,200   Remaining: $18,800│
│                                                     │
│  ┌───────────────────┐  ┌──────────────────────────┐│
│  │                   │  │ Category       Est   Act  ││
│  │   [Donut Chart]   │  │ ─────────────────────────││
│  │                   │  │ Venue         $16K  $15K  ││
│  │  ■ Venue    27%   │  │ Catering      $13K  $14K⚠ ││
│  │  ■ Catering 22%   │  │ Photography    $6K   $6K  ││
│  │  ■ Photo    10%   │  │ Florals        $5K   —    ││
│  │  ■ Other    41%   │  │ Music          $4K   —    ││
│  │                   │  │ ...                       ││
│  └───────────────────┘  │              [ + Add ]    ││
│                         └──────────────────────────┘│
│                                                     │
│  ┌─ PAYMENT SCHEDULE ────────────────────────────┐  │
│  │  Venue balance     $8,000  due Jun 1          │  │
│  │  Photographer      $2,500  due Jul 15         │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Components:**
- `<BudgetSummaryBar>` — total / committed / remaining in large type
- `<BudgetDonutChart>` — Recharts PieChart with legend
- `<BudgetTable>` — per-category rows: category name, estimate, actual quote, deposit paid, balance due, due date, notes, inline edit
- `<PaymentSchedule>` — upcoming balance due dates sorted chronologically
- Over-budget cells: amber background tint + warning icon

**Interactions:**
- Click any budget row to expand inline edit
- Category estimate is editable inline
- "Add category" button opens a simple dialog
- Export CSV triggers client-side CSV generation

---

## 9. Vendors `/vendors`

**Layout:** Toggle between Kanban view and List view

### Kanban View
```
┌──────────────────────────────────────────────────────┐
│ Vendor Tracker               [Kanban] [List] [+ Add] │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Researching  Contacted   Quoted    Booked   Paid     │
│ ─────────── ─────────── ──────── ──────── ────────  │
│ [card]      [card]      [card]   [card]   [card]    │
│ [card]                  [card]   [card]             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### List View
```
│ Category     Vendor          Contact    Status    Contract │
│ ─────────────────────────────────────────────────────────│
│ Photographer  Gold Hour Photo  Jane S.   Booked   ✓ Yes  │
│ Florist       —               —          Research  —      │
```

**Components:**
- `<VendorKanban>` — 5-column scrollable board
- `<VendorCard>` — company name, category badge, contact name, status pill, contract indicator
- `<VendorListRow>` — compact table row
- `<AddVendorModal>` — dialog with all vendor fields

**Interactions:**
- Drag vendor card between Kanban columns to update status
- Click card → slide-out detail panel with all fields editable
- "Add Vendor" pre-populates category if coming from checklist task

---

## 10. Contracts `/contracts`

**Layout:** Single column list + upload panel

```
┌─────────────────────────────────────────────────────┐
│  Contracts                         [ + Upload ]     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  📄 Venue — Carneros Resort                 │   │
│  │  Uploaded Mar 15 · $28,000 · Signed ✓       │   │
│  │  Deposit $8,000 due Apr 30                   │   │
│  │  Balance $20,000 due Aug 1                   │   │
│  │  [View PDF]  [AI Review]  [Edit]  [Delete]  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  📄 Photography — Gold Hour Photo           │   │
│  │  Uploaded Feb 20 · $7,500 · Not yet signed  │   │
│  │  ⚠ AI flagged 2 items — [View Review]       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  UPCOMING PAYMENTS ─────────────────────────────   │
│  Venue deposit  $8,000    Apr 30  ⚠ in 12 days     │
│  Photo balance  $5,500    Jul 15                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Components:**
- `<ContractCard>` — vendor name, upload date, contract value, signed status, payment dates, action buttons
- `<ContractUploadModal>` — PDF dropzone + metadata fields (vendor, contract value, deposit amount, due dates, signed status)
- `<AIReviewPanel>` — slide-out panel displaying AI contract review sections
- `<PaymentReminders>` — upcoming payment dates highlighted by urgency

**Interactions:**
- "AI Review" triggers contract analysis if not yet run; shows cached result if already done
- "View PDF" opens signed URL in new tab
- AI review flagged items shown in amber with specific clause details

---

## 11. AI Buddy — Drawer & Full Page

### Floating Drawer (accessible from all pages)

```
┌───────────────────────────────────────┐
│  Aisle  ·  Your Planning Buddy    [✕] │
├───────────────────────────────────────┤
│                                       │
│  [AI message bubble]                  │
│                                       │
│                    [User bubble]      │
│                                       │
│  [AI message bubble]                  │
│  ┌─────────────────────────────────┐  │
│  │ ✓ Added to checklist:           │  │
│  │   "Research photo booth vendors"│  │
│  └─────────────────────────────────┘  │
│                                       │
│  [AI message bubble — streaming...]   │
│                                       │
├───────────────────────────────────────┤
│  [Type a message...         ] [Send]  │
└───────────────────────────────────────┘
```

### Full Page `/buddy`
Same layout, expanded to full content area width (720px centered), with conversation history sidebar on left (desktop only).

**Components:**
- `<BuddyDrawer>` — 420px slide-in from right, full height
- `<ChatMessage>` — role-aware bubble (user/ai), timestamp, streaming animation
- `<ActionPill>` — confirmation pill shown when AI performs a tool action
- `<ChatInput>` — textarea with Shift+Enter for newlines, Enter to send

---

## 12. Settings `/settings`

**Layout:** Tabbed — Account / Wedding Details / Notifications

**Account tab:** Email, password change, Google auth status  
**Wedding Details tab:** Edit any field from onboarding (date, location, guest count, budget, styles, priorities)  
**Notifications tab:** (Post-MVP) Email reminders, due date alerts  

Editing wedding details and saving triggers a refresh of the checklist phase mapping and budget allocations.

---

## Component Library Quick Reference

| Component | Location | Used On |
|-----------|----------|---------|
| `StatCard` | `components/dashboard/StatCard.tsx` | Dashboard |
| `UpcomingTasks` | `components/dashboard/UpcomingTasks.tsx` | Dashboard |
| `BudgetSnapshot` | `components/dashboard/BudgetSnapshot.tsx` | Dashboard |
| `AIBuddyHighlight` | `components/dashboard/AIBuddyHighlight.tsx` | Dashboard |
| `VenueCard` | `components/venues/VenueCard.tsx` | Venues |
| `VenueFilters` | `components/venues/VenueFilters.tsx` | Venues |
| `PhaseSection` | `components/checklist/PhaseSection.tsx` | Checklist |
| `ChecklistItem` | `components/checklist/ChecklistItem.tsx` | Checklist |
| `BudgetDonutChart` | `components/budget/BudgetDonutChart.tsx` | Budget |
| `BudgetTable` | `components/budget/BudgetTable.tsx` | Budget |
| `VendorKanban` | `components/vendors/VendorKanban.tsx` | Vendors |
| `VendorCard` | `components/vendors/VendorCard.tsx` | Vendors |
| `ContractCard` | `components/contracts/ContractCard.tsx` | Contracts |
| `AIReviewPanel` | `components/contracts/AIReviewPanel.tsx` | Contracts |
| `BuddyDrawer` | `components/buddy/BuddyDrawer.tsx` | All pages |
| `ChatMessage` | `components/buddy/ChatMessage.tsx` | Buddy |
| `ChatInput` | `components/buddy/ChatInput.tsx` | Buddy |
