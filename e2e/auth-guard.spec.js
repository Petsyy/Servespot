import { test, expect } from "@playwright/test";

test.describe("Security & Protected Route Redirection Guards", () => {
  test.beforeEach(async ({ page }) => {
    // Ensure session returns 401 unauthenticated
    await page.route("**/api/auth/session**", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "No active session" }),
      });
    });
  });

  test("unauthenticated access to /volunteer/dashboard redirects to /volunteer/login", async ({ page }) => {
    await page.goto("/volunteer/dashboard");

    // Must be redirected to /volunteer/login
    await expect(page).toHaveURL(/\/volunteer\/login/);
    await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
    await expect(page.getByText(/Volunteer Login/i)).toBeVisible();
  });

  test("unauthenticated access to /organization/dashboard redirects to /organization/login", async ({ page }) => {
    await page.goto("/organization/dashboard");

    // Must be redirected to /organization/login
    await expect(page).toHaveURL(/\/organization\/login/);
    await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
    await expect(page.getByText(/Organization Login/i)).toBeVisible();
  });

  test("unauthenticated access to /admin/dashboard redirects to /admin/login", async ({ page }) => {
    await page.goto("/admin/dashboard");

    // Must be redirected to /admin/login
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

