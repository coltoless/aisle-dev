import { expect, test } from "@playwright/test";
import { provisionConfirmedUser } from "./provision-user";

/**
 * Ensures authenticated /checklist returns 200 (not 500) after onboarding is complete.
 */
test("checklist page loads when logged in", async ({ page, context }) => {
  await context.clearCookies();
  await page.addInitScript(() => {
    try {
      localStorage.removeItem("aisle-onboarding");
    } catch {
      /* ignore */
    }
  });

  const suffix = `${Date.now()}${Math.floor(Math.random() * 1e6)}`;
  const email = `aisle.checklist.${suffix}@gmail.com`;
  const password = "E2ETestPass-8chars";

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

  await page.getByLabel("Partner 1 name").fill("A");
  await page.getByLabel("Partner 2 name").fill("B");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForURL("**/onboarding/2", { timeout: 30_000 });

  await page.locator('input[type="date"]').fill("2026-09-20");
  await page.getByLabel("Location").fill("Austin, TX");
  await page.getByRole("radio", { name: "Under 50" }).click();
  await page.getByRole("radio", { name: "$15k – $30k" }).click();
  await page.getByRole("button", { name: "Destination" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForURL("**/onboarding/3", { timeout: 30_000 });

  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Continue →/ }).click();
  await page.waitForURL("**/onboarding/4", { timeout: 30_000 });

  const planningBtn = page.getByRole("button", { name: /Let’s Get Planning|Let's Get Planning/i });
  await expect(planningBtn).toBeEnabled({ timeout: 90_000 });
  await planningBtn.click();
  await page.waitForURL("**/dashboard", { timeout: 45_000 });

  const checklistRes = await page.goto("/checklist", { waitUntil: "domcontentloaded" });
  expect(checklistRes?.status(), "checklist document should not 500").toBeLessThan(500);
  await expect(page.getByRole("heading", { name: "Planning Checklist" })).toBeVisible({ timeout: 30_000 });
});
