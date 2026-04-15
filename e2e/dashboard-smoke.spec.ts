import { expect, test } from "@playwright/test";
import { provisionConfirmedUser } from "./provision-user";
import { seedDashboardDataForEmail } from "./seed-dashboard-data";

test.describe.configure({ mode: "serial" });

test("dashboard shows real stats, donut, tasks, nudge, and BuddyDrawer opens", async ({ page, context }) => {
  await context.clearCookies();
  await page.addInitScript(() => {
    try {
      localStorage.removeItem("aisle-onboarding");
    } catch {
      /* ignore */
    }
  });

  const suffix = `${Date.now()}${Math.floor(Math.random() * 1e6)}`;
  const email = `aisle.playwright.${suffix}@gmail.com`;
  const password = "E2ETestPass-8chars";
  const partner1 = "Alex";
  const partner2 = "Jordan";

  const preProvisioned = await provisionConfirmedUser(email, password);

  if (preProvisioned) {
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Log In" }).click();
    await page.waitForURL("**/onboarding/1", { timeout: 45_000 });
  } else {
    await page.goto("/signup");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByLabel("Confirm password").fill(password);
    await page.getByRole("button", { name: "Create Account" }).click();
    await page.waitForURL("**/onboarding/1", { timeout: 45_000 });
  }

  await page.getByLabel("Partner 1 name").fill(partner1);
  await page.getByLabel("Partner 2 name").fill(partner2);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForURL("**/onboarding/2", { timeout: 30_000 });

  // Wedding date within 365 days so we get the photographer urgency nudge.
  await page.locator('input[type="date"]').fill("2026-09-20");
  await page.getByLabel("Location").fill("Austin, TX");
  await page.getByRole("radio", { name: "Under 50" }).click();
  await page.getByRole("radio", { name: "$15k – $30k" }).click();
  await page.getByRole("button", { name: "Destination" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForURL("**/onboarding/3", { timeout: 30_000 });

  // Minimal interaction on priority step; keep defaults.
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Continue →/ }).click();
  await page.waitForURL("**/onboarding/4", { timeout: 30_000 });

  const planningBtn = page.getByRole("button", { name: /Let’s Get Planning|Let's Get Planning/i });
  await expect(planningBtn).toBeEnabled({ timeout: 90_000 });
  await planningBtn.click();
  await page.waitForURL("**/dashboard", { timeout: 45_000 });

  // Ensure dashboard has deterministic, non-zero-ish data for the UI checks.
  await seedDashboardDataForEmail(email);
  await page.reload();
  await page.waitForLoadState("networkidle");

  // Stat cards: checklist, budget, vendors are not placeholders/zeros.
  const main = page.getByRole("main");
  await expect(main).toContainText(/Checklist/i);
  await expect(main).toContainText(/Budget/i);
  await expect(main).toContainText(/Vendors/i);
  await expect(main).toContainText(/\d+\/\d+ tasks/);
  await expect(main).not.toContainText("0/0 tasks");
  await expect(main).toContainText(/committed/i);
  await expect(main).not.toContainText("$0 committed");
  await expect(main).toContainText(/\d+ total ·/);

  // Budget donut renders slices.
  const budgetSnapshotHeading = page.getByRole("heading", { name: "Budget snapshot" });
  await expect(budgetSnapshotHeading).toBeVisible();
  const budgetSnapshotCard = budgetSnapshotHeading
    .locator('xpath=ancestor::div[contains(@class,"rounded")]')
    .first();
  const chart = budgetSnapshotCard.locator(".recharts-wrapper");
  await expect(chart).toBeVisible();
  const chartPathCount = await chart.locator("path").count();
  expect(chartPathCount).toBeGreaterThan(0);

  // Upcoming tasks: shows real items and checking one completes + animates out.
  const upcoming = page.getByRole("heading", { name: "Upcoming tasks" });
  await expect(upcoming).toBeVisible();

  const firstCheckbox = page.locator('input[type="checkbox"][aria-label^="Mark complete:"]').first();
  await expect(firstCheckbox).toBeVisible();
  const firstLabel = await firstCheckbox.getAttribute("aria-label");
  await firstCheckbox.check();
  if (firstLabel) {
    await expect(page.getByLabel(firstLabel)).toBeHidden({ timeout: 3000 });
  }

  // AI buddy highlight shows a nudge (photographer urgency for this date).
  await expect(page.getByText("FROM YOUR PLANNER", { exact: true })).toBeVisible();
  await expect(page.getByText(/Photography books up fast/i)).toBeVisible();

  // "Chat with Aisle →" opens BuddyDrawer.
  const drawerHeading = page.getByRole("heading", { name: "AI Buddy" });
  await expect(drawerHeading).toBeHidden();
  await page.getByRole("button", { name: "Chat with Aisle →" }).click();
  await expect(drawerHeading).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect(drawerHeading).toBeHidden();

  // FAB opens BuddyDrawer too.
  await page.getByRole("button", { name: "Open AI Buddy" }).click();
  await expect(drawerHeading).toBeVisible();
});

