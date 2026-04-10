import { expect, test } from "@playwright/test";
import { provisionConfirmedUser } from "./provision-user";

test.describe.configure({ mode: "serial" });

test("sign up and complete onboarding steps 1–4", async ({ page, context }) => {
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

    const onboardingNav = page.waitForURL("**/onboarding/1", { timeout: 45_000 });
    await page.getByRole("button", { name: "Create Account" }).click();
    try {
      await onboardingNav;
    } catch {
      const alerts = page.locator('[role="alert"]');
      const n = await alerts.count();
      for (let i = 0; i < n; i++) {
        const msg = (await alerts.nth(i).innerText()).trim();
        if (!msg) continue;
        if (/confirm/i.test(msg)) {
          test.skip(
            true,
            `Signup returned no session and SUPABASE_SERVICE_ROLE_KEY is not set to provision a user: ${msg}`,
          );
        }
        throw new Error(`Signup failed: ${msg}`);
      }
      throw new Error(
        "Timed out waiting for /onboarding/1 after signup (check Supabase email confirmation and env).",
      );
    }
  }

  await expect(page).toHaveURL(/\/onboarding\/1$/);

  await page.getByLabel("Partner 1 name").fill(partner1);
  await page.getByLabel("Partner 2 name").fill(partner2);
  await expect(page.getByLabel("Partner 1 name")).toHaveValue(partner1);
  await expect(page.getByLabel("Partner 2 name")).toHaveValue(partner2);
  const step1Continue = page.getByRole("button", { name: "Continue" });
  await expect(step1Continue).toBeEnabled({ timeout: 15_000 });
  await step1Continue.click();
  await page.waitForURL("**/onboarding/2", { timeout: 30_000 });
  await expect(page).toHaveURL(/\/onboarding\/2$/);

  await page.locator('input[type="date"]').fill("2026-09-20");
  await page.getByLabel("Location").fill("Austin, TX");
  await page.getByLabel("Location").blur();
  await expect(page.getByLabel("Location")).toHaveValue("Austin, TX");

  const step2Continue = page.getByRole("button", { name: "Continue" });

  await page.getByRole("radio", { name: "Under 50" }).click();
  await page.getByRole("radio", { name: "$15k – $30k" }).click();

  const classic = page.getByRole("button", { name: "Classic / Traditional" });
  const modern = page.getByRole("button", { name: "Modern / Minimal" });
  const rustic = page.getByRole("button", { name: "Rustic / Barn" });
  const destination = page.getByRole("button", { name: "Destination" });

  await classic.click();
  await modern.click();
  await rustic.click();
  await expect(classic).toHaveClass(/bg-accent/);
  await expect(modern).toHaveClass(/bg-accent/);
  await expect(rustic).toHaveClass(/bg-accent/);

  await destination.click();
  await expect(classic).not.toHaveClass(/bg-accent/);
  await expect(destination).toHaveClass(/bg-accent/);

  await expect(step2Continue).toBeEnabled({ timeout: 15_000 });
  await step2Continue.click();
  await page.waitForURL("**/onboarding/3", { timeout: 30_000 });
  await expect(page).toHaveURL(/\/onboarding\/3$/);

  const rankList = page.locator("div.mt-10").first();
  await expect(rankList).toContainText("Venue & date");

  const priorityRows = page.locator("[data-testid^=\"onboarding-priority-\"]");
  await expect(priorityRows).toHaveCount(8);
  const budgetRow = page.getByTestId("onboarding-priority-budget");
  const venueRow = page.getByTestId("onboarding-priority-venue");
  await budgetRow.scrollIntoViewIfNeeded();
  await venueRow.scrollIntoViewIfNeeded();
  await budgetRow.click();
  await expect(budgetRow).toBeFocused();
  await budgetRow.press(" ");
  for (let i = 0; i < 7; i += 1) {
    await budgetRow.press("ArrowUp");
  }
  await budgetRow.press(" ");

  await expect(rankList.locator("> div").first()).toContainText("Budget & contracts", { timeout: 10_000 });

  await page.route("**/api/onboarding/complete", async (route) => {
    await new Promise((r) => setTimeout(r, 600));
    await route.continue();
  });
  await page.route("**/api/ai/onboarding-intro", async (route) => {
    await new Promise((r) => setTimeout(r, 600));
    await route.continue();
  });

  const planningBtn = page.getByRole("button", { name: /Let’s Get Planning|Let's Get Planning/i });

  await page.keyboard.press("Escape");
  const step3Continue = page.getByRole("button", { name: /Continue →/ });
  await step3Continue.click();
  await page.waitForURL("**/onboarding/4", { timeout: 30_000 });
  await expect(page).toHaveURL(/\/onboarding\/4$/);

  await expect(page.getByTestId("onboarding-save-skeleton")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("onboarding-ai-skeleton")).toBeVisible({ timeout: 10_000 });

  await expect(planningBtn).toBeDisabled();

  await expect(planningBtn).toBeEnabled({ timeout: 90_000 });
  await expect(page.getByTestId("onboarding-ai-skeleton")).toBeHidden();
  await expect(page.getByTestId("onboarding-save-skeleton")).toBeHidden();

  await planningBtn.click();
  await expect(page).toHaveURL(/\/dashboard$/);

  const sidebar = page.locator("aside").first();
  await expect(sidebar).toContainText(partner1);
  await expect(sidebar).toContainText(partner2);
  await expect(sidebar).toContainText(`${partner1} & ${partner2}`);

  await page.getByRole("link", { name: "Venues" }).click();
  await expect(page).toHaveURL(/\/venues$/);
});
