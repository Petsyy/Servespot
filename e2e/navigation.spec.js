import { test, expect } from "@playwright/test";

test.describe("Public Navigation & Landing Flow", () => {
  test("loads the landing page with hero branding and CTA elements", async ({ page }) => {
    await page.goto("/");

    // Verify main hero headline is visible
    await expect(page.locator("h1")).toContainText("Connect.");
    await expect(page.locator("h1")).toContainText("Volunteer.");
    await expect(page.locator("h1")).toContainText("Impact.");

    // Verify CTA action buttons exist
    const findOpportunitiesBtn = page.getByRole("button", { name: /Find Opportunities/i });
    const postTaskBtn = page.getByRole("button", { name: /Post a Task/i });

    await expect(findOpportunitiesBtn).toBeVisible();
    await expect(postTaskBtn).toBeVisible();

    // Verify How It Works & Choose Your Path sections exist
    await expect(page.getByRole("heading", { name: /Choose Your Path/i })).toBeVisible();
  });

  test("navigates to volunteer signup when clicking 'Find Opportunities'", async ({ page }) => {
    await page.goto("/");

    const findOpportunitiesBtn = page.getByRole("button", { name: /Find Opportunities/i });
    await findOpportunitiesBtn.click();

    // Verifies navigation to volunteer signup
    await expect(page).toHaveURL(/\/volunteer\/signup/);
    await expect(page.locator("h2, h3").filter({ hasText: /Volunteer/i }).first()).toBeVisible();
  });

  test("navigates to organization signup when clicking 'Post a Task'", async ({ page }) => {
    await page.goto("/");

    const postTaskBtn = page.getByRole("button", { name: /Post a Task/i });
    await postTaskBtn.click();

    // Verifies navigation to organization signup
    await expect(page).toHaveURL(/\/organization\/signup/);
  });

  test("displays 404 Not Found page for invalid routes and allows returning home", async ({ page }) => {
    await page.goto("/non-existent-sample-page-404");

    // Verify 404 header and friendly message
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(
      page.getByText(/Oops! The page you’re looking for doesn’t exist/i)
    ).toBeVisible();

    // Click "Back to Home"
    const backHomeBtn = page.getByRole("link", { name: /Back to Home/i });
    await expect(backHomeBtn).toBeVisible();
    await backHomeBtn.click();

    await expect(page).toHaveURL("/");
  });
});
