# USER_STORIES.md — Aisle Wedding Planning Platform

User stories and acceptance criteria for all MVP features.
Format: **Given** [context] / **When** [action] / **Then** [outcome]

---

## EPIC 1 — Authentication & Account

---

### US-101 — Sign Up with Email

**As a** newly engaged couple,  
**I want to** create an Aisle account with my email and password,  
**So that** my planning data is saved and private.

**Acceptance Criteria:**
- Given I am on `/signup`, when I enter a valid email and password (8+ chars) and submit, then my account is created and I am redirected to `/onboarding/step-1`.
- Given I submit with an email already in use, then I see an inline error: "An account with this email already exists. Log in instead?"
- Given I submit with a password under 8 characters, then I see an inline validation error before submission.
- Given signup succeeds, then a confirmation email is sent to my address.
- Given I try to access `/dashboard` without being authenticated, then I am redirected to `/login`.

---

### US-102 — Log In

**As a** returning user,  
**I want to** log in to my account,  
**So that** I can access my wedding planning data.

**Acceptance Criteria:**
- Given I am on `/login`, when I enter correct credentials, then I am redirected to `/dashboard`.
- Given I enter incorrect credentials, then I see: "Email or password is incorrect." — never specify which is wrong.
- Given I click "Forgot password?", then I am prompted for my email and receive a reset link within 2 minutes.
- Given I am already logged in and navigate to `/login`, then I am redirected to `/dashboard`.

---

### US-103 — Google OAuth

**As a** user who prefers not to manage passwords,  
**I want to** sign up or log in with my Google account,  
**So that** I can get started without creating a new password.

**Acceptance Criteria:**
- Given I click "Continue with Google," then I am redirected to Google's OAuth flow.
- Given I complete OAuth as a new user, then my account is created and I land on `/onboarding/step-1`.
- Given I complete OAuth as an existing user, then I land on `/dashboard`.
- Given the OAuth flow fails or is cancelled, then I return to the auth page with a dismissible error message.

---

## EPIC 2 — Onboarding

---

### US-201 — Complete Onboarding Flow

**As a** new couple,  
**I want to** quickly tell Aisle about our wedding,  
**So that** I get a personalized planning checklist and budget right away.

**Acceptance Criteria:**
- Given I am on Step 1, when I enter both partner names and click Continue, then I advance to Step 2.
- Given I leave either name field blank, then I cannot proceed — an inline error appears on the empty field.
- Given I am on Step 2, when I complete all required fields (location, guest count, budget, at least 1 style), then I can advance to Step 3.
- Given I select "We haven't set a date yet," then the date picker is disabled and I can still proceed.
- Given I am on Step 3, when I drag priorities into ranked order and click Continue, then I advance to Step 4.
- Given I am on any step after Step 1 and click Back, then I return to the previous step with all my entries preserved.
- Given I complete Step 4 and click "Let's Get Planning," then:
  - My couple profile is saved to the database
  - A default checklist is generated (phases calculated from wedding date or 12+ months if no date)
  - A budget breakdown is generated based on budget range and priorities
  - I am redirected to `/dashboard`
  - The entire onboarding process takes under 5 minutes

---

### US-202 — Receive AI Intro Message

**As a** couple completing onboarding,  
**I want to** see a personalized message from Aisle on Step 4,  
**So that** I feel immediately understood and know what to tackle first.

**Acceptance Criteria:**
- Given Step 4 loads, then an AI-generated message appears within 5 seconds (skeleton loader shown during generation).
- Given the AI message loads, then it references: partner names, wedding location or date (if provided), and at least one actionable observation (e.g., timing risk, top priority to tackle first).
- Given the AI message fails to load, then a fallback message is shown: "Welcome! Your checklist and budget are ready. I'm here whenever you have questions."

---

## EPIC 3 — Dashboard

---

### US-301 — View Dashboard Overview

**As a** couple who has completed onboarding,  
**I want to** see a summary of my planning progress at a glance,  
**So that** I know exactly where I stand and what needs attention.

**Acceptance Criteria:**
- Given I navigate to `/dashboard`, then I see: partner names, days until wedding, checklist completion count + progress bar, budget summary (total / committed / remaining), and upcoming tasks (next 3–5 due).
- Given my wedding date is not yet set, then the countdown shows "Date TBD" instead of a number.
- Given I have overdue tasks, then they are visually distinct (amber, warning icon) in the upcoming tasks list.
- Given there is an AI proactive nudge available (e.g., unbooked photographer with <12 months until wedding), then it is shown in the AI buddy highlight card.
- Given all dashboard data loads, then no section should require a separate page load — all data is fetched on initial render.

---

## EPIC 4 — Venue Discovery

---

### US-401 — Browse Venue Recommendations

**As a** couple who hasn't booked a venue yet,  
**I want to** see curated venue recommendations based on our location, size, and budget,  
**So that** I don't have to research venues from scratch.

**Acceptance Criteria:**
- Given I navigate to `/venues`, then venue recommendations are automatically generated based on my profile within 10 seconds (loading skeletons shown during generation).
- Given recommendations load, then I see 4–6 venue cards, each displaying: name, location, venue type, estimated price range, style tags, and a 2–3 sentence description.
- Given my venue budget is $X, then no recommended venue has an `estimated_price_high` greater than 1.2× $X without being clearly marked as "Stretch."
- Given a venue is marked "Stretch," then a visible badge communicates this.
- Given I click "Save," then the venue is added to my saved list with status "Considering" and a confirmation appears.
- Given I click "Dismiss," then the venue disappears from the recommendations view.
- Given I click "Refresh Recommendations," then a new set of venue recommendations is generated.
- Given I click "Visit Site" on a venue card, then the venue website opens in a new tab.

---

### US-402 — Mark a Venue as Booked

**As a** couple who has selected a venue,  
**I want to** mark it as booked in Aisle,  
**So that** my dashboard reflects that this critical task is done.

**Acceptance Criteria:**
- Given I have a saved venue, when I change its status to "Booked," then:
  - The venue is marked as booked in my saved list
  - The venue name appears on my dashboard under confirmed details
  - The "Book venue" checklist task is automatically marked complete
- Given I mark a venue as booked, then all other saved venues are not affected.

---

## EPIC 5 — Checklist

---

### US-501 — View Planning Checklist

**As a** couple planning our wedding,  
**I want to** see all planning tasks organized by phase,  
**So that** I know what to do and when.

**Acceptance Criteria:**
- Given I navigate to `/checklist`, then tasks are organized into accordion sections by phase.
- Given my current planning phase (based on wedding date), then that phase's section is expanded by default; all others are collapsed.
- Given a phase section is fully complete, then it shows a completion badge and can be toggled closed.
- Given a task has a note, then clicking the task reveals the note inline.
- Given I have overdue tasks, then they appear with an amber "Overdue" badge.
- Given I view the checklist, then I see an overall progress bar showing completed/total tasks.

---

### US-502 — Complete a Task

**As a** couple working through our planning,  
**I want to** check off tasks as I complete them,  
**So that** I can track my progress accurately.

**Acceptance Criteria:**
- Given I click the checkbox on a task, then the task is immediately marked complete with an animated strikethrough (optimistic update).
- Given the optimistic update fails to save, then the checkbox is reverted and a toast error is shown.
- Given I mark a task complete, then the phase progress bar and overall progress bar update immediately.
- Given I click a completed task's checkbox, then it is unchecked and restored to incomplete.

---

### US-503 — Add a Custom Task

**As a** couple with unique planning needs,  
**I want to** add tasks that aren't in the default checklist,  
**So that** my checklist reflects our actual wedding.

**Acceptance Criteria:**
- Given I click "+ Add custom task," then a dialog opens with: title (required), category (required), phase (required), due date (optional), notes (optional).
- Given I submit a custom task, then it appears in the correct phase section with a subtle visual indicator that it's custom.
- Given I leave the title field blank and submit, then an inline error appears and the form does not submit.

---

### US-504 — Snooze a Task

**As a** couple with tasks I can't tackle yet,  
**I want to** snooze tasks to a future date,  
**So that** they don't clutter my current view.

**Acceptance Criteria:**
- Given I open the options menu on a task and select "Snooze," then I see options: 1 week, 2 weeks, 1 month, or custom date.
- Given I select a snooze duration, then the task disappears from the current view and is labeled with a snooze date.
- Given a snoozed task's snooze date passes, then it reappears in the task list on next load.

---

## EPIC 6 — Budget Tracker

---

### US-601 — View Budget Breakdown

**As a** couple managing a wedding budget,  
**I want to** see how our budget is allocated across categories,  
**So that** I understand where our money is going.

**Acceptance Criteria:**
- Given I navigate to `/budget`, then I see: total budget, total committed, total remaining — in large, clear type at the top.
- Given budget items load, then I see a donut chart with each category represented by a distinct color with a legend.
- Given budget items load, then I see a table with columns: Category, Estimated Cost, Actual Quote, Deposit Paid, Balance Due, Due Date.
- Given a category's actual quote exceeds its estimated cost, then that row is highlighted with an amber background.
- Given I have no actual quote for a category, then the "Actual Quote" cell shows a dash, not zero.

---

### US-602 — Edit a Budget Item

**As a** couple updating our budget as we get real quotes,  
**I want to** enter vendor quotes and track payments,  
**So that** my budget reflects reality, not estimates.

**Acceptance Criteria:**
- Given I click on a budget row, then it expands to an inline editable form with all fields.
- Given I update a field and click Save (or press Enter), then the value is saved and the row collapses.
- Given I update a value, then the summary totals (total committed, remaining) update immediately.
- Given I enter a non-numeric value in a cost field, then an inline validation error appears.
- All monetary values are displayed as formatted USD. All values are stored in cents.

---

### US-603 — Export Budget to CSV

**As a** couple who wants to share our budget externally,  
**I want to** export the budget as a CSV file,  
**So that** I can open it in Excel or Google Sheets.

**Acceptance Criteria:**
- Given I click "Export CSV," then a `.csv` file downloads immediately (client-side generation, no server call needed).
- Given the CSV downloads, then it includes all budget categories with: category name, estimated cost, actual quote, deposit paid, balance due, and due date.
- Given any cost values are null, then the CSV cell is empty (not "0" or "null").

---

## EPIC 7 — Vendor Tracker

---

### US-701 — Add a Vendor

**As a** couple tracking our vendors,  
**I want to** add vendors to our tracker,  
**So that** all contact info and status is in one place.

**Acceptance Criteria:**
- Given I click "+ Add Vendor," then a modal opens with fields: Category (required), Company Name, Contact Name, Email, Phone, Website, Status (defaults to "Researching"), Notes.
- Given I submit a vendor with only Category filled in, then the vendor is created successfully (other fields are optional).
- Given the vendor is created, then it appears in the correct Kanban column based on its status.

---

### US-702 — Update Vendor Status

**As a** couple progressing through vendor bookings,  
**I want to** update vendor statuses as we move forward,  
**So that** I can see at a glance what's booked vs. still in progress.

**Acceptance Criteria:**
- Given I drag a vendor card to a different Kanban column, then its status updates optimistically and is saved to the database.
- Given I click on a vendor card and change its status via dropdown, then the card moves to the correct column.
- Given a vendor reaches "Booked" status, then if there is a corresponding checklist task (e.g., "Book photographer"), it is automatically marked complete.
- Given a vendor reaches "Paid" status, then the corresponding budget item's "Deposit Paid" field is flagged for review (not auto-updated — requires user confirmation).

---

## EPIC 8 — Contracts

---

### US-801 — Upload a Contract

**As a** couple managing vendor contracts,  
**I want to** upload PDF contracts to Aisle,  
**So that** everything is in one place and I can track payment dates.

**Acceptance Criteria:**
- Given I click "+ Upload," then a modal appears with: PDF upload dropzone, vendor name (required), contract value, deposit amount, deposit due date, balance due date, signed (Y/N toggle).
- Given I drag a PDF onto the dropzone, then it is accepted and the filename is shown.
- Given I upload a non-PDF file, then an error appears: "Only PDF files are supported."
- Given I submit the upload form, then the PDF is uploaded to Supabase Storage and a contract record is created.
- Given the upload succeeds, then the contract appears in the contracts list.
- Given a contract has an upcoming payment date within 14 days, then it is flagged in the "Upcoming Payments" section.

---

### US-802 — AI Contract Review

**As a** couple who received a vendor contract,  
**I want to** have Aisle review it and flag anything unusual,  
**So that** I don't miss important terms before signing.

**Acceptance Criteria:**
- Given I click "AI Review" on a contract, then a loading state is shown while the review runs (typically 10–20 seconds).
- Given the review completes, then a panel opens with clearly labeled sections: Summary, Key Dates & Payments, Cancellation Policy, Flags, Questions to Ask.
- Given the review finds flagged items, then they are visually distinct (amber/warning styling) and specific (not vague).
- Given a review has already been run, then clicking "AI Review" shows the cached result immediately — no second API call.
- Given the review API fails, then a dismissible error appears: "Review couldn't be completed. Try again or contact us."
- A disclaimer is always shown: "This is not legal advice. Review with a legal professional for binding decisions."

---

## EPIC 9 — AI Planning Buddy

---

### US-901 — Chat with AI Buddy

**As a** couple with planning questions,  
**I want to** ask Aisle's AI buddy anything about our wedding,  
**So that** I get expert, personalized advice without hiring a planner.

**Acceptance Criteria:**
- Given I click the AI buddy FAB, then the chat drawer opens from the right side within 200ms.
- Given I type a message and press Enter or click Send, then my message appears immediately and a loading indicator shows while the AI responds.
- Given the AI responds, then text streams in progressively (not all at once) so I see the response being written.
- Given the AI response completes, then the full message is visible and the input field is ready for my next message.
- Given I close and reopen the buddy drawer, then my conversation history is preserved.
- Given the AI call fails, then a dismissible error message appears in the chat: "Something went wrong. Try again."

---

### US-902 — AI Adds a Task from Conversation

**As a** couple discussing planning details with the AI,  
**I want to** have the AI add tasks to my checklist directly from the chat,  
**So that** I don't have to manually add things we discuss.

**Acceptance Criteria:**
- Given the AI references a task I should do (e.g., "you should research photo booths"), then a task is added to my checklist automatically.
- Given a task is added, then an action pill appears below the AI message: "✓ Added to checklist: [task title]"
- Given I don't want the task, then I can click the action pill to undo the addition.
- Given the same task already exists on my checklist, then a duplicate is not created — the AI confirms it's already there.

---

### US-903 — Proactive Budget Flag from AI

**As a** couple managing a tight budget,  
**I want to** be warned by Aisle when we're at risk of going over in a category,  
**So that** I can make adjustments before it's too late.

**Acceptance Criteria:**
- Given I mention a vendor quote in chat that exceeds my category allocation, then the AI acknowledges the overrun and suggests alternatives.
- Given the AI flags a budget issue, then it uses the flag_budget_item tool and an action pill confirms: "⚠ Flagged: [Category] is over budget."
- Given a budget flag is raised, then the corresponding budget row is highlighted on the `/budget` page.

---

### US-904 — AI Proactive Nudge on Dashboard

**As a** couple who doesn't always know what to prioritize,  
**I want to** see a proactive planning nudge on my dashboard,  
**So that** I'm reminded of time-sensitive tasks I might be overlooking.

**Acceptance Criteria:**
- Given I am 9–12 months from my wedding and have not booked a photographer, then the dashboard AI highlight card shows a nudge about photographer booking timing.
- Given I am less than 6 months out and have no venue booked, then the nudge is urgent and specific.
- Given there are no urgent nudges for my situation, then the AI highlight card shows a general encouragement or next suggested task.
- Given I click "Chat with Aisle" in the nudge card, then the buddy drawer opens with the nudge topic pre-loaded as context.

---

## EPIC 10 — Settings

---

### US-1001 — Edit Wedding Details

**As a** couple whose plans have changed,  
**I want to** update my wedding date, location, budget, or other profile details,  
**So that** Aisle's recommendations stay accurate.

**Acceptance Criteria:**
- Given I navigate to `/settings`, then I see my current wedding profile details in editable form.
- Given I update my wedding date and save, then the checklist phase assignments are recalculated and due dates are updated.
- Given I update my budget range, then the budget category allocations are recalculated (with a confirmation prompt before overwriting manual edits).
- Given I update my location and save, then venue recommendations will use the new location on next refresh.
- Given I save any change, then a toast confirms: "Wedding details updated."
