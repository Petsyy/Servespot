import { test, expect } from "@playwright/test";

test.describe("Organization Post Task / Opportunity Flow", () => {
  const mockOrgId = "org-test-123";
  const mockOrgName = "Bayanihan Foundation";

  test.beforeEach(async ({ page, context }) => {
    // Set cookies for organization session
    await context.addCookies([
      { name: "role", value: "organization", domain: "127.0.0.1", path: "/" },
      { name: "orgId", value: mockOrgId, domain: "127.0.0.1", path: "/" },
      { name: "orgName", value: mockOrgName, domain: "127.0.0.1", path: "/" },
    ]);

    // Mock active session
    await page.route("**/api/auth/session**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          authenticated: true,
          role: "organization",
          user: {
            id: mockOrgId,
            orgName: mockOrgName,
            role: "organization",
            status: "active",
          },
        }),
      });
    });

    // Mock organization profile (/api/organization/:id)
    await page.route("**/api/organization/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          _id: mockOrgId,
          orgName: mockOrgName,
          status: "active",
        }),
      });
    });

    // Mock dashboard stats
    await page.route("**/api/opportunities/**/stats**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          totalOpportunities: 3,
          activeVolunteers: 12,
        }),
      });
    });

    // Mock opportunities list and creation
    await page.route("**/api/opportunities**", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      } else if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Opportunity created successfully!",
            opportunity: {
              _id: "new-opp-999",
              title: "Coastal Mangrove Clean-up Initiative",
              description: "Join us to clean the shoreline and plant mangrove saplings.",
              location: "Baseco Shoreline, Manila",
              date: "2026-11-20T00:00:00.000Z",
              duration: "4 hours",
              volunteersNeeded: 15,
              status: "Open",
              organization: mockOrgId,
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock notifications
    await page.route("**/api/notifications**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });
  });

  test("opens Post Opportunity modal from dashboard and verifies Live Preview updates", async ({ page }) => {
    await page.goto("/organization/dashboard");

    // Click "Post Opportunity" button on dashboard
    const postOpportunityBtn = page.getByRole("button", { name: /Post Opportunity/i });
    await expect(postOpportunityBtn).toBeVisible();
    await postOpportunityBtn.click();

    // Verify modal header opens
    await expect(page.getByRole("heading", { name: /Post New Opportunity/i })).toBeVisible();
    await expect(page.getByText("Live Preview")).toBeVisible();

    // Fill Title
    const titleInput = page.getByPlaceholder("e.g., Beach Cleanup Volunteer");
    await titleInput.fill("Coastal Mangrove Clean-up Initiative");

    // Fill Location
    const locationInput = page.getByPlaceholder("e.g., Community Center, Manila");
    await locationInput.fill("Baseco Shoreline, Manila");

    // Verify Live Preview on the right updates with the entered text
    const previewContainer = page.locator(".sticky");
    await expect(previewContainer.getByText("Coastal Mangrove Clean-up Initiative")).toBeVisible();
    await expect(previewContainer.getByText("Baseco Shoreline, Manila")).toBeVisible();
  });

  test("validates required fields before allowing submission", async ({ page }) => {
    await page.goto("/organization/dashboard");

    const postOpportunityBtn = page.getByRole("button", { name: /Post Opportunity/i });
    await postOpportunityBtn.click();

    // Try submitting without filling fields
    const submitBtn = page.getByRole("button", { name: /Post Opportunity/i }).last();
    await submitBtn.click();

    // Error messages should appear
    await expect(page.getByText(/Title must be at least 3 characters/i)).toBeVisible();
    await expect(page.getByText(/Description must be at least 10 characters/i)).toBeVisible();
  });

  test("submits new task and displays success toast", async ({ page }) => {
    await page.goto("/organization/dashboard");

    const postOpportunityBtn = page.getByRole("button", { name: /Post Opportunity/i });
    await postOpportunityBtn.click();

    // Fill all form inputs
    await page.getByPlaceholder("e.g., Beach Cleanup Volunteer").fill("Coastal Mangrove Clean-up Initiative");
    await page.getByPlaceholder("Describe the volunteer opportunity...").fill(
      "Join us to clean the shoreline and plant mangrove saplings."
    );

    // Date
    await page.locator('input[type="date"]').fill("2026-11-20");

    // Duration
    await page.getByPlaceholder("e.g., 4 hours").fill("4 hours");

    // Location
    await page.getByPlaceholder("e.g., Community Center, Manila").fill("Baseco Shoreline, Manila");

    // Volunteers needed
    await page.locator('input[type="number"]').fill("15");

    // Select skill checkbox
    const skillCheckbox = page.getByLabel("Environment");
    if (await skillCheckbox.isVisible()) {
      await skillCheckbox.check();
    }

    // Submit form
    const submitBtn = page.getByRole("button", { name: /Post Opportunity/i }).last();
    await submitBtn.click();

    // Verify success toast appears
    await expect(page.getByText(/Opportunity created successfully!/i)).toBeVisible();

    // Verify modal closes
    await expect(page.getByRole("heading", { name: /Post New Opportunity/i })).not.toBeVisible();
  });
});
