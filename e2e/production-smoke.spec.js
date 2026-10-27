import { test, expect } from "@playwright/test";

/**
 * Production Live Smoke Test Suite
 * Executes against live production deployments without mocking API routes.
 */
test.describe("Production Live Smoke & Availability Flow", () => {
  test("live production health check responds with 200 OK", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  test("production landing page loads with branding and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ServeSpot/i);

    // Verify key landing CTAs
    await expect(page.getByRole("button", { name: /Find Opportunities/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Post a Task/i })).toBeVisible();
  });

  test("production role sign-in portal renders volunteer and organization paths", async ({ page }) => {
    await page.goto("/role/login");

    await expect(page.getByText(/Volunteer/i).first()).toBeVisible();
    await expect(page.getByText(/Organization/i).first()).toBeVisible();
  });

  test("live volunteer sign-in transitions to volunteer homepage", async ({ page }) => {
    await page.goto("/volunteer/login");

    await page.getByPlaceholder("Enter your email").fill("volunteer@servespot.com");
    await page.getByPlaceholder("Enter your password").fill("Password123!");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Verify navigation to volunteer homepage
    await expect(page).toHaveURL(/\/volunteer\/homepage/i, { timeout: 15000 });
  });

  test("live organization sign-in transitions to organization homepage", async ({ page }) => {
    await page.goto("/organization/login");

    await page.getByPlaceholder("Enter your email").fill("organization@servespot.com");
    await page.getByPlaceholder("Enter your password").fill("Password123!");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Verify navigation to organization homepage
    await expect(page).toHaveURL(/\/organization\/homepage/i, { timeout: 15000 });
  });
});
